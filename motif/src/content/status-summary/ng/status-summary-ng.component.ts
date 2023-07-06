/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    isDevMode,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AssertInternalError,
    Badness,
    DataEnvironment,
    SessionInfoService,
    TradingEnvironment
} from '@motifmarkets/motif-core';
import { SessionInfoNgService } from 'component-services-ng-api';
import { Version } from 'generated-internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { StatusSummaryFrame } from '../status-summary-frame';

@Component({
    selector: 'app-status-summary',
    templateUrl: './status-summary-ng.component.html',
    styleUrls: ['./status-summary-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusSummaryNgComponent extends ContentComponentBaseNgDirective
    implements OnInit, OnDestroy, StatusSummaryFrame.ComponentAccess {

    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;

    public serviceName: string;
    public serviceDescription: string;
    public clientVersion: string;
    public codeCommit: string;
    public dataEnvironment: string;
    public tradingEnvironment: string;
    public userId: string;
    public username: string;
    public userFullName: string;
    public userAccessTokenExpiryTime: string;

    public serverName: string;

    public publisherOnline: string;
    public publisherStateId: string;

    private readonly _frame: StatusSummaryFrame;
    private readonly _sessionInfoService: SessionInfoService;

    constructor(
        private _cdr: ChangeDetectorRef,
        sessionInfoNgService: SessionInfoNgService,
        contentService: ContentNgService,
    ) {
        super();

        this._sessionInfoService = sessionInfoNgService.service;

        this.serviceName = this._sessionInfoService.serviceName;
        this.serviceDescription = this._sessionInfoService.serviceDescription ?? '';
        this.clientVersion = `${Version.app} (${isDevMode() ? 'DevMode' : 'ProdMode'})`;
        this.codeCommit = `${Version.commit}`;
        this.dataEnvironment = `${DataEnvironment.idToDisplay(DataEnvironment.getDefaultId())}`;
        this.tradingEnvironment = `${TradingEnvironment.idToDisplay(TradingEnvironment.getDefaultId())}`;
        this.userId = this._sessionInfoService.userId;
        this.username = this._sessionInfoService.username;
        this.userFullName = this._sessionInfoService.userFullName;
        this.processUserAccessTokenExpiryTimeChange();

        this._frame = contentService.createStatusSummaryFrame(this._sessionInfoService, this);
    }

    ngOnInit() {
        this._frame.initialise();

        this.processPublisherOnlineChange();
        this.processPublisherStateChange();
        this.processServerInfoChange();
    }

    ngOnDestroy() {
        this._frame.finalise();
    }

    public notifyUserAccessTokenExpiryTimeChange() {
        this.processUserAccessTokenExpiryTimeChange();
    }

    public notifyPublisherOnlineChange() {
        this.processPublisherOnlineChange();
    }

    public notifyPublisherStateChange() {
        this.processPublisherStateChange();
    }

    public notifyServerInfoChanged() {
        this.processServerInfoChange();
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    private processUserAccessTokenExpiryTimeChange() {
        const expiryTime = this._sessionInfoService.userAccessTokenExpiryTime;
        let newExpiryTimeDisplay: string;
        if (expiryTime === undefined) {
            newExpiryTimeDisplay = '';
        } else {
            const newExpiryTimeAsDate = new Date(expiryTime);
            newExpiryTimeDisplay = newExpiryTimeAsDate.toLocaleTimeString();
        }

        if (newExpiryTimeDisplay !== this.userAccessTokenExpiryTime) {
            this.userAccessTokenExpiryTime = newExpiryTimeDisplay;
            this._cdr.markForCheck();
        }
    }

    private processPublisherOnlineChange() {
        this.publisherOnline = this._frame.publisherOnline;

        this._cdr.markForCheck();
    }

    private processPublisherStateChange() {
        this.publisherStateId = this._frame.publisherStateId;

        this._cdr.markForCheck();
    }

    private processServerInfoChange() {
        this.serverName = this._frame.serverName;

        this._cdr.markForCheck();
    }
}

export namespace StatusSummaryNgComponent {
    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(StatusSummaryNgComponent);
        const instance = componentRef.instance;
        if (!(instance instanceof StatusSummaryNgComponent)) {
            throw new AssertInternalError('SSCCI233338134');
        } else {
            return instance;
        }
    }
}
