/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SessionStateId } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { ConfigNgService } from 'src/root/ng/config-ng.service';
import { delay1Tick, Logger, MultiEvent } from 'src/sys/internal-api';
import { SessionNgService } from '../../ng/session-ng.service';
import { SessionService } from '../../session-service';

@Component({
    selector: 'app-startup',
    templateUrl: './startup-ng.component.html',
    styleUrls: ['./startup-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartupNgComponent implements OnInit, OnDestroy {
    // @HostBinding('class.app-loading') readonly isAppLoading: true;
    // @HostBinding('style.background-image') topSplashImageUrl: string;

    // public readonly topSplashImageExists: boolean;
    // public readonly topSplashImageUrl: string;
    public log = 'Startup Log';

    private _session: SessionService;
    private _sessionLogSubscriptionId: MultiEvent.SubscriptionId;
    private _sessionKickedOffSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private _cdr: ChangeDetectorRef,
        configNgService: ConfigNgService,
        private _sessionService: SessionNgService,
    ) {
        this._session = this._sessionService.session;

        const config = configNgService.config;
        const topSplashImageUrl = config.branding.startupTopSplashImageUrl;
        if (topSplashImageUrl === undefined) {
            // this.topSplashImageExists = false;
            // this.topSplashImageUrl = '';
        } else {
            // this.topSplashImageExists = true;
            // this.topSplashImageUrl = `url("${topSplashImageUrl}")`;
        }

        this._sessionKickedOffSubscriptionId =
            this._session.subscribeKickedOffEvent(() => this.handleSessionManagerKickedOffEvent() );
        this._sessionLogSubscriptionId =
            this._session.subscribeConsolidatedLogEvent(
                (time, logLevelId, text) => this.handleSessionManagerLogEvent(time, logLevelId, text)
            );
    }

    ngOnInit() {

        delay1Tick(() => this.checkStart() );
    }

    ngOnDestroy() {
        this.finalise();
    }

    private handleSessionManagerKickedOffEvent() {
        const kickedOffText = Strings[StringId.SessionEndedAsLoggedInElsewhere];
        this.addLogEntry(new Date(), Logger.LevelId.Info, kickedOffText);
        this._cdr.markForCheck();
    }

    private handleSessionManagerLogEvent(time: Date, logLevelId: Logger.LevelId, text: string) {
        this.addLogEntry(time, logLevelId, text);
    }

    private formatLine(time: Date, logLevel: Logger.LevelId, text: string) {
        return time.toLocaleTimeString() + '\t' + Logger.Level.idToDisplay(logLevel) + '\t' + text;
    }

    private addLogEntry(time: Date, logLevel: Logger.LevelId, text: string) {
        const line = this.formatLine(time, logLevel, text);
        this.log += '\n' + line;
        this._cdr.markForCheck();
    }

    private checkStart() {
        if (this._session.stateId === SessionStateId.NotStarted) {
            this._sessionService.start();
        }
    }

    private finalise() {
        this._session.unsubscribeKickedOffEvent(this._sessionKickedOffSubscriptionId);
        this._sessionKickedOffSubscriptionId = undefined;
        this._session.unsubscribeConsolidatedLogEvent(this._sessionLogSubscriptionId);
        this._sessionLogSubscriptionId = undefined;
    }
}
