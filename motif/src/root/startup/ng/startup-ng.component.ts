/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
    delay1Tick,
    Integer,
    Logger,
    MultiEvent,
    PublisherSessionTerminatedReasonId,
    SessionState,
    SessionStateId,
    StringId,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'src/component/ng-api';
import { ConfigNgService } from 'src/root/ng/config-ng.service';
import { SessionNgService } from '../../ng/session-ng.service';
import { SessionService } from '../../session-service';

@Component({
    selector: 'app-startup',
    templateUrl: './startup-ng.component.html',
    styleUrls: ['./startup-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartupNgComponent extends ComponentBaseNgDirective implements OnInit, OnDestroy {
    public logTextAreaDisplayed = false;
    public log = 'Startup Log';

    private _session: SessionService;
    private _sessionLogSubscriptionId: MultiEvent.SubscriptionId;
    private _publisherSessionTerminatedSubscriptionId: MultiEvent.SubscriptionId;

    private _logTextAreaDisplayedSetTimeoutId: ReturnType<typeof setInterval> | undefined;

    constructor(
        private _cdr: ChangeDetectorRef,
        configNgService: ConfigNgService,
        private _sessionService: SessionNgService,
    ) {
        super();

        this._session = this._sessionService.session;

        const config = configNgService.config;

        this._publisherSessionTerminatedSubscriptionId = this._session.subscribePublisherSessionTerminatedEvent(
            (reasonId, reasonCode, defaultReasonText) => this.handlePublisherSessionTerminatedEvent(reasonId, reasonCode, defaultReasonText)
        );
        this._sessionLogSubscriptionId =
            this._session.subscribeConsolidatedLogEvent(
                (time, logLevelId, text) => this.handleSessionManagerLogEvent(time, logLevelId, text)
            );

        // Delay display of log. Don't want to display unless there is a problem
        this._logTextAreaDisplayedSetTimeoutId = setTimeout(() => this.displayLogTextArea(), 7000);
    }

    ngOnInit() {
        delay1Tick(() => this.checkStart() );
    }

    ngOnDestroy() {
        this.checkClearlogTextAreaDisplayedTimeout();
        this.finalise();
    }

    private handlePublisherSessionTerminatedEvent(
        reasonId: PublisherSessionTerminatedReasonId,
        reasonCode: Integer,
        defaultReasonText: string
    ) {
        let sessionFinishedReason: string;
        switch (reasonId) {
            case PublisherSessionTerminatedReasonId.KickedOff:
                sessionFinishedReason = Strings[StringId.SessionEndedAsLoggedInElsewhere];
                break;
            case PublisherSessionTerminatedReasonId.Other:
                sessionFinishedReason = `${defaultReasonText} [${reasonCode}]`;
                break;
            default:
                throw new UnreachableCaseError('SNCHPSTE10665', reasonId);
        }
        this.addLogEntry(new Date(), Logger.LevelId.Info, sessionFinishedReason);
        this._cdr.markForCheck();
    }

    private handleSessionManagerLogEvent(time: Date, logLevelId: Logger.LevelId, text: string) {
        this.addLogEntry(time, logLevelId, text);
    }

    private checkStart() {
        if (this._session.stateId === SessionStateId.NotStarted) {
            this._sessionService.start();
        } else {
            const logText = `Unexpected startup session state: ${SessionState.idToDisplay(this._session.stateId)}`;
            this.addLogEntry(new Date(), Logger.LevelId.Info, logText);
            this.displayLogTextArea();
        }
    }

    private finalise() {
        this._session.unsubscribePublisherSessionTerminatedEvent(this._publisherSessionTerminatedSubscriptionId);
        this._publisherSessionTerminatedSubscriptionId = undefined;
        this._session.unsubscribeConsolidatedLogEvent(this._sessionLogSubscriptionId);
        this._sessionLogSubscriptionId = undefined;
    }

    private checkClearlogTextAreaDisplayedTimeout() {
        if (this._logTextAreaDisplayedSetTimeoutId !== undefined) {
            clearTimeout(this._logTextAreaDisplayedSetTimeoutId);
            this._logTextAreaDisplayedSetTimeoutId = undefined;
        }
    }

    private displayLogTextArea() {
        this.checkClearlogTextAreaDisplayedTimeout();
        this.logTextAreaDisplayed = true;
        this._cdr.markForCheck();
    }

    private formatLine(time: Date, logLevel: Logger.LevelId, text: string) {
        return time.toLocaleTimeString() + '\t' + Logger.Level.idToDisplay(logLevel) + '\t' + text;
    }

    private addLogEntry(time: Date, logLevel: Logger.LevelId, text: string) {
        const line = this.formatLine(time, logLevel, text);
        this.log += '\n' + line;
        this._cdr.markForCheck();
    }
}
