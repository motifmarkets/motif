/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    isDevMode,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { ExchangeEnvironment, ExchangeInfo } from 'src/adi/internal-api';
import { SessionInfoNgService } from 'src/component-services/ng-api';
import { Version } from 'src/generated/internal-api';
import { AssertInternalError, Badness } from 'src/sys/internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { StatusSummaryFrame } from '../status-summary-frame';

@Component({
    selector: 'app-status-summary',
    templateUrl: './status-summary-ng.component.html',
    styleUrls: ['./status-summary-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusSummaryNgComponent implements OnInit, OnDestroy, StatusSummaryFrame.ComponentAccess {
    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;

    public serviceName: string;
    public serviceDescription: string;
    public clientVersion: string;
    public exchangeEnvironment: string;
    public userId: string;
    public username: string;
    public userFullName: string;

    public serverName: string;

    public publisherOnline: string;
    public publisherStateId: string;

    private _frame: StatusSummaryFrame;

    constructor(
        private _cdr: ChangeDetectorRef,
        sessionInfoNgService: SessionInfoNgService,
        contentService: ContentNgService,
    ) {
        const sessionInfoService = sessionInfoNgService.service;

        this.serviceName = sessionInfoService.serviceName;
        this.serviceDescription = sessionInfoService.serviceDescription ?? '';
        this.clientVersion = `${Version.app} (${isDevMode() ? 'DevMode' : 'ProdMode'} / ${Version.commit})`;
        this.exchangeEnvironment = `${ExchangeEnvironment.idToDisplay(ExchangeInfo.getDefaultEnvironmentId())}`;
        this.userId = sessionInfoService.userId;
        this.username = sessionInfoService.username;
        this.userFullName = sessionInfoService.userFullName;

        this._frame = contentService.createStatusSummaryFrame(this, sessionInfoService.zenithEndpoint);
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

    public processPublisherOnlineChange() {
        this.publisherOnline = this._frame.publisherOnline;

        this._cdr.markForCheck();
    }

    public processPublisherStateChange() {
        this.publisherStateId = this._frame.publisherStateId;

        this._cdr.markForCheck();
    }

    private processServerInfoChange() {
        this.serverName = this._frame.serverName;

        this._cdr.markForCheck();
    }
}

export namespace StatusSummaryNgComponent {
    export function create(
        container: ViewContainerRef,
        resolver: ComponentFactoryResolver,
    ) {
        container.clear();
        const factory = resolver.resolveComponentFactory(StatusSummaryNgComponent);
        const componentRef = container.createComponent(factory);
        const instance = componentRef.instance;
        if (!(instance instanceof StatusSummaryNgComponent)) {
            throw new AssertInternalError('SSCCI233338134');
        } else {
            return instance;
        }
    }
}
