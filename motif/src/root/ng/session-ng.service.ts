/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
    AdiNgService,
    AppStorageNgService,
    MotifServicesNgService,
    ScansNgService,
    SessionInfoNgService,
    SettingsNgService,
    SignOutNgService,
    SymbolsNgService,
    UserAlertNgService
} from 'component-services-ng-api';
import { ExtensionsNgService } from 'src/extensions/ng-api';
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

    constructor(private _router: Router,
        configNgService: ConfigNgService,
        telemetryNgService: TelemetryNgService,
        userAlertNgService: UserAlertNgService,
        settingsNgService: SettingsNgService,
        openIdNgService: OpenIdNgService,
        motifServicesNgService: MotifServicesNgService,
        appStorageNgService: AppStorageNgService,
        extensionNgService: ExtensionsNgService,
        adiNgService: AdiNgService,
        symbolsNgService: SymbolsNgService,
        scansNgService: ScansNgService,
        sessionInfoNgService: SessionInfoNgService,
        signOutNgService: SignOutNgService,
    ) {
        this._config = configNgService.config;
        this._session = new SessionService(telemetryNgService.telemetry,
            userAlertNgService.service,
            settingsNgService.settingsService,
            openIdNgService.service,
            motifServicesNgService.service,
            appStorageNgService.appStorage,
            extensionNgService.service,
            adiNgService.service,
            symbolsNgService.service,
            scansNgService.service,
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
        this.session.completeAuthentication(this._config);
    }

    start() {
        this.session.start(this._config);
    }

    private handleAuthenticatedEvent() {
        this.navigate('/startup');
    }

    private handleOnlineEvent() {
        this.navigate('/desktop');
    }

    private navigate(path: string) {
        this._router.navigate([path]);
    }
}
