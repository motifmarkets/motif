import { AssertInternalError, getErrorMessage, Integer, UserAlertService } from '@motifmarkets/motif-core';
import { ErrorResponse, Log as OidcLog, User, UserManager, UserManagerSettings } from 'oidc-client-ts';
import { Config } from './config';

export class OpenIdService {
    logErrorEvent: OpenIdService.LogErrorEvent;
    userLoadedEvent: OpenIdService.UserLoadedEvent;

    private _userManager: UserManager;

    private _openIdAuthority: string;
    private _openIdClientId: string;
    private _openIdRedirectUri: string;
    private _openIdSilentRedirectUri: string;
    private _openIdScope: string;

    private _userId: string;
    private _username: string;
    private _userFullName: string;

    private _accessTokenType = '';
    private _accessToken = OpenIdService.invalidAccessToken;
    private _userAccessTokenExpiryTime: number | undefined;

    private _silentRenewRestartAttemptCount = 0;
    private _silentRenewRestartAttemptDelayTimeoutHandle: ReturnType<typeof setInterval> | undefined;
    private _attemptingSilentRenewRestartAlert: UserAlertService.Alert | undefined;

    constructor(private readonly _userAlertService: UserAlertService) {
        OidcLog.setLogger(console);
        OidcLog.setLevel(OidcLog.INFO);
    }

    get userId() { return this._userId; }
    get username() { return this._username; }
    get userFullName() { return this._userFullName; }

    get accessToken() { return this._accessToken; }
    get userAccessTokenExpiryTime() { return this._userAccessTokenExpiryTime; }

    applyConfig(config: Config) {
        this._openIdAuthority = config.openId.authority;
        this._openIdClientId = config.openId.clientId;
        this._openIdRedirectUri = config.openId.redirectUri;
        this._openIdSilentRedirectUri = config.openId.silentRedirectUri;
        this._openIdScope = config.openId.scope;
    }

    startAuthentication() {
        this._userManager = this.createUserManager();
        this._userManager.signinRedirect();
    }

    async completeAuthentication() {
        this._userManager = this.createUserManager();
        const user = await this._userManager.signinRedirectCallback();
        return user !== undefined && user !== null;
    }

    isLoggedIn(): boolean {
        return this._accessToken !== OpenIdService.invalidAccessToken;
    }

    getAuthorizationHeaderValue(): string {
        if (this._accessToken === OpenIdService.invalidAccessToken) {
            throw new AssertInternalError('OISGAHV338834590');
        } else {
            return `${this._accessTokenType} ${this._accessToken}`;
        }
    }

    signOut() {
        this._userManager.signoutRedirect();
    }

    finalise() {
        this.checkCancelSilentRenewRestartAttempt();
    }

    private createUserManager() {
        const settings: UserManagerSettings = {
            authority: this._openIdAuthority,
            client_id: this._openIdClientId,
            redirect_uri: this._openIdRedirectUri,
            response_type: 'code',
            scope: this._openIdScope,
            automaticSilentRenew: true,
            silent_redirect_uri: this._openIdSilentRedirectUri,
            filterProtocolClaims: true,
            loadUserInfo: true,
            accessTokenExpiringNotificationTimeInSeconds: 120,
        };

        const userManager = new UserManager(settings);
        userManager.events.addUserLoaded((user) => this.processUserLoaded(user));
        userManager.events.addAccessTokenExpired(() => this.processAccessTokenExpired());
        userManager.events.addSilentRenewError((error: Error) => this.processSilentRenewError(error));

        return userManager;
    }

    private processUserLoaded(user: User) {
        this._silentRenewRestartAttemptCount = 0;
        this.checkCancelSilentRenewRestartAttempt();

        this._accessToken = user.access_token;
        this._accessTokenType = user.token_type;

        const expiresAt = user.expires_at;
        this._userAccessTokenExpiryTime = expiresAt === undefined ? undefined : expiresAt * 1000; // convert to JavaScript time

        const profile = user.profile;
        this._userId = profile.sub ?? '';
        this._username = profile.preferred_username ?? '';
        this._userFullName = profile.name ?? '';

        this.userLoadedEvent();

        if (this._attemptingSilentRenewRestartAlert !== undefined) {
            this._userAlertService.clearAlert(this._attemptingSilentRenewRestartAlert);
            this._attemptingSilentRenewRestartAlert = undefined;
        }
    }

    private processAccessTokenExpired() {
        this.logErrorEvent('Session expired');
        this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.NewSessionRequired, 'Session expired');
    }

    private async processSilentRenewError(error: Error) {

        if (error !== undefined && error instanceof ErrorResponse) {
            // Handle the hopeless.
            switch (error.error) {
                case 'interaction_required':
                case 'login_required':
                case 'consent_required':
                case 'account_selection_required':
                    this.logErrorEvent('SessionRenewalProblem: ' + error.error);
                    this._userManager.removeUser();
                    this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.NewSessionRequired, error.error);
                    return;
                default:
            }
        }

        const errorMessage = getErrorMessage(error);

        const canAttemptSilentRenewal = await this.canAttemptSilentRenewRestart(errorMessage);
        if (canAttemptSilentRenewal) {
            this.scheduleSilentRenewRestartAttempt(errorMessage);
        }
    }

    private async canAttemptSilentRenewRestart(errorMessage: string): Promise<boolean> {
        const user = await this._userManager.getUser();
        if (user === null) {
            this._userManager.removeUser();
            this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.NewSessionRequired, errorMessage);
            return Promise.resolve(false);
        } else {
            return Promise.resolve(true);
        }
    }

    private scheduleSilentRenewRestartAttempt(errorMessage: string) {
        if (this._silentRenewRestartAttemptDelayTimeoutHandle === undefined) {
            if (this._silentRenewRestartAttemptCount++ === 0) {
                this._attemptingSilentRenewRestartAlert = this._userAlertService.queueAlert(
                    UserAlertService.Alert.Type.Id.AttemptingSessionRenewal,
                    errorMessage
                );
            }

            const silentRenewRestartAttemptDelay = this.calculateSilentRenewRestartAttemptDelay(this._silentRenewRestartAttemptCount);

            this._silentRenewRestartAttemptDelayTimeoutHandle = setTimeout(
                () => this.attemptRestartSilentRenew(errorMessage),
                silentRenewRestartAttemptDelay
            );
        }
    }

    private async attemptRestartSilentRenew(errorMessage: string) {
        this._silentRenewRestartAttemptDelayTimeoutHandle = undefined;
        const user = await this._userManager.getUser();
        if (user === null) {
            this._userManager.removeUser();
            this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.NewSessionRequired, errorMessage);
        } else {
            this._userManager.stopSilentRenew();
            this._userManager.startSilentRenew();
        }
    }

    private checkCancelSilentRenewRestartAttempt() {
        if (this._silentRenewRestartAttemptDelayTimeoutHandle !== undefined) {
            clearTimeout(this._silentRenewRestartAttemptDelayTimeoutHandle);
            this._silentRenewRestartAttemptDelayTimeoutHandle = undefined;
        }
    }

    private calculateSilentRenewRestartAttemptDelay(attemptCount: Integer) {
        return 5000;
        // Try a few times quickly to renew ASAP if temporary problem.
        // Otherwise poll infrequently.
        // Application may be running in background tab and can eventually start working again when problem fixed.
        switch (attemptCount) {
            case 0:
                return 1000;
            case 1:
            case 2:
                return 5000;
            case 3:
            case 4:
                return 30000;
            case 5:
            case 6:
                return 60000;
            default:
                return 300000;
        }
    }
}

export namespace OpenIdService {
    export const invalidAccessToken = '';

    export type LogErrorEvent = (this: void, text: string) => void;
    export type UserLoadedEvent = (this: void) => void;
}
