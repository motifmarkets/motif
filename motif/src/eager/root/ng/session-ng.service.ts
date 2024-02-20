/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AssertInternalError } from '@motifmarkets/motif-core';
import {
    AdiNgService,
    AppStorageNgService,
    CapabilitiesNgService,
    HideUnloadSaveNgService,
    MotifServicesNgService,
    NotificationChannelsNgService,
    ScansNgService,
    SessionInfoNgService,
    SettingsNgService,
    SignOutNgService,
    SymbolsNgService,
    UserAlertNgService
} from 'component-services-ng-api';
import { ExtensionsNgService } from 'extensions-ng-api';
import { WorkspaceNgService } from 'workspace-ng-api';
import { Config } from '../config';
import { SessionService } from '../session-service';
import { ConfigNgService } from './config-ng.service';
import { OpenIdNgService } from './open-id-ng.service';
import { TelemetryNgService } from './telemetry-ng.service';

@Injectable({
    providedIn: 'root'
})
export class SessionNgService implements OnDestroy {
    private _config: Config;
    private _session: SessionService;

    constructor(
        private readonly _router: Router,
        configNgService: ConfigNgService,
        telemetryNgService: TelemetryNgService,
        userAlertNgService: UserAlertNgService,
        settingsNgService: SettingsNgService,
        openIdNgService: OpenIdNgService,
        capabilitiesNgService: CapabilitiesNgService,
        motifServicesNgService: MotifServicesNgService,
        appStorageNgService: AppStorageNgService,
        extensionNgService: ExtensionsNgService,
        workspaceNgService: WorkspaceNgService,
        adiNgService: AdiNgService,
        symbolsNgService: SymbolsNgService,
        notificationChannelsNgService: NotificationChannelsNgService,
        scansNgService: ScansNgService,
        sessionInfoNgService: SessionInfoNgService,
        hideUnloadSaveNgService: HideUnloadSaveNgService,
        signOutNgService: SignOutNgService,
    ) {
        this._config = configNgService.config;
        this._session = new SessionService(
            telemetryNgService.telemetry,
            userAlertNgService.service,
            settingsNgService.service,
            openIdNgService.service,
            capabilitiesNgService.service,
            motifServicesNgService.service,
            appStorageNgService.service,
            extensionNgService.service,
            workspaceNgService.service,
            adiNgService.service,
            symbolsNgService.service,
            notificationChannelsNgService.service,
            scansNgService.service,
            hideUnloadSaveNgService.service,
            signOutNgService.service,
        );

        this._session.authenticatedEvent = () => this.handleAuthenticatedEvent();
        this._session.onlineEvent = () => this.handleOnlineEvent();

        sessionInfoNgService.setSessionInfo(this._session.infoService);
    }

    get session() { return this._session; }

    ngOnDestroy() {
        this._session.finalise();
    }

    isLoggedIn(): boolean {
        return this.session.isLoggedIn();
    }

    getAuthorizationHeaderValue(): string {
        return this.session.getAuthorizationHeaderValue();
    }

    startAuthentication() {
        this.session.startAuthentication(this._config);
    }

    completeAuthentication() {
        const promise = this.session.completeAuthentication(this._config);
        AssertInternalError.throwErrorIfPromiseRejected(promise, 'SNSCA20256');
    }

    start() {
        const promise = this.session.start(this._config);
        AssertInternalError.throwErrorIfPromiseRejected(promise, 'SNSS20256');
    }

    private handleAuthenticatedEvent() {
        this.navigate('/startup');
    }

    private handleOnlineEvent() {
        if (this._router.routerState.snapshot.url !== '/desktop') {
            this.navigate('/desktop');
        }
    }

    private navigate(path: string) {
        const promise = this._router.navigate([path]);
        promise.then(
            (success) => {
                if (!success) {
                    throw new AssertInternalError('SNSNF20256', path);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SNSNR20256', path); }
        )
    }
}
