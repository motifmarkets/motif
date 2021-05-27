/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SessionStateId } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
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
    public log = 'Startup Log';
    public kickedOff = false;
    public kickedOffText = '';

    private _session: SessionService;
    private _sessionLogSubscriptionId: MultiEvent.SubscriptionId;
    private _sessionKickedOffSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _sessionService: SessionNgService,
    ) {
        this._session = this._sessionService.session;

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
        this.kickedOffText = Strings[StringId.SessionEndedAsLoggedInElsewhere];
        this.addLogEntry(new Date(), Logger.LevelId.Info, this.kickedOffText);
        this.kickedOff = true;
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
