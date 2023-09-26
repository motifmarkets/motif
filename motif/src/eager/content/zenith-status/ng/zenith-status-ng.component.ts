/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { AssertInternalError, Badness } from '@motifmarkets/motif-core';
import { SessionInfoNgService } from 'component-services-ng-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';
import { ZenithStatusFrame } from '../zenith-status-frame';

@Component({
    selector: 'app-zenith-status',
    templateUrl: './zenith-status-ng.component.html',
    styleUrls: ['./zenith-status-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZenithStatusNgComponent extends ContentComponentBaseNgDirective
    implements ZenithStatusFrame.ComponentAccess, OnInit, OnDestroy {

    private static typeInstanceCreateCount = 0;

    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;

    public endpoints: readonly string[];

    public publisherOnline: string;
    // public publisherOnlineChangeHistory: ZenithExtConnectionDataItem.PublisherOnlineChange[] = [];
    public publisherStateId: string;
    public waitId: string;
    public lastReconnectReasonId: string;
    public sessionKickedOff: string;

    public selectedEndpoint: string;

    public authExpiryTime: string;
    public authFetchSuccessiveFailureCount: string;
    public socketOpenSuccessiveFailureCount: string;
    public zenithTokenFetchSuccessiveFailureCount: string;
    public zenithTokenRefreshSuccessiveFailureCount: string;
    public socketCloseSuccessiveFailureCount: string;
    public unexpectedSocketCloseCount: string;
    public timeoutCount: string;
    public lastTimeoutStateId: string;
    public receivePacketCount: string;
    public sendPacketCount: string;
    public internalSubscriptionErrorCount: string;
    public requestTimeoutSubscriptionErrorCount: string;
    public offlinedSubscriptionErrorCount: string;
    public publishRequestErrorSubscriptionErrorCount: string;
    public subRequestErrorSubscriptionErrorCount: string;
    public dataErrorSubscriptionErrorCount: string;
    public userNotAuthorisedSubscriptionErrorCount: string;
    public serverWarningSubscriptionErrorCount: string;

    public serverName: string;
    public serverClass: string;
    public softwareVersion: string;
    public protocolVersion: string;

    private readonly _frame: ZenithStatusFrame;

    constructor(elRef: ElementRef<HTMLElement>, private _cdr: ChangeDetectorRef, contentService: ContentNgService, sessionInfoNgService: SessionInfoNgService) {
        super(elRef, ++ZenithStatusNgComponent.typeInstanceCreateCount);

        this._frame = contentService.createZenithStatusFrame(this, sessionInfoNgService.service.zenithEndpoints);
    }

    ngOnInit() {
        this._frame.initialise();

        this.endpoints = this._frame.endpoints;

        this.processPublisherOnlineChange();
        this.processPublisherStateChange();
        this.processReconnect();
        this.processSessionKickedOff();
        this.processSelectedEndpointChanged();
        this.processCounter();
        this.processServerInfoChange();
    }

    ngOnDestroy(): void {
        this._frame.finalise();
    }

    public notifyPublisherOnlineChange() {
        this.processPublisherOnlineChange();
    }

    public notifyPublisherStateChange() {
        this.processPublisherStateChange();
    }

    public notifyReconnect() {
        this.processReconnect();
    }

    public notifySessionKickedOff() {
        this.processSessionKickedOff();
    }

    public notifySelectedEndpointChanged() {
        this.processSelectedEndpointChanged();
    }

    public notifyCounter() {
        this.processCounter();
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

    private processPublisherOnlineChange() {
        this.publisherOnline = this._frame.publisherOnline;

        this._cdr.markForCheck();
    }

    private processPublisherStateChange() {
        this.publisherStateId = this._frame.publisherStateId;
        this.waitId = this._frame.waitId;

        this._cdr.markForCheck();
    }

    private processReconnect() {
        this.lastReconnectReasonId = this._frame.lastReconnectReasonId;

        this._cdr.markForCheck();
    }

    private processSessionKickedOff() {
        this.sessionKickedOff = this._frame.sessionKickedOff;

        this._cdr.markForCheck();
    }

    private processSelectedEndpointChanged() {
        const selectedEndpoint = this._frame.selectedEndpoint;
        if (selectedEndpoint !== this.selectedEndpoint) {
            this.selectedEndpoint = selectedEndpoint;
            this._cdr.markForCheck();
        }
    }

    private processCounter() {
        this.authExpiryTime = this._frame.authExpiryTime;
        this.authFetchSuccessiveFailureCount = this._frame.authFetchSuccessiveFailureCount;
        this.socketOpenSuccessiveFailureCount = this._frame.socketOpenSuccessiveFailureCount;
        this.zenithTokenFetchSuccessiveFailureCount = this._frame.zenithTokenFetchSuccessiveFailureCount;
        this.zenithTokenRefreshSuccessiveFailureCount = this._frame.zenithTokenRefreshSuccessiveFailureCount;
        this.socketCloseSuccessiveFailureCount = this._frame.socketCloseSuccessiveFailureCount;
        this.unexpectedSocketCloseCount = this._frame.unexpectedSocketCloseCount;
        this.timeoutCount = this._frame.timeoutCount;
        this.lastTimeoutStateId = this._frame.lastTimeoutStateId;
        this.receivePacketCount = this._frame.receivePacketCount;
        this.sendPacketCount = this._frame.sendPacketCount;
        this.internalSubscriptionErrorCount = this._frame.internalSubscriptionErrorCount;
        this.requestTimeoutSubscriptionErrorCount = this._frame.requestTimeoutSubscriptionErrorCount;
        this.offlinedSubscriptionErrorCount = this._frame.offlinedSubscriptionErrorCount;
        this.publishRequestErrorSubscriptionErrorCount = this._frame.publishRequestErrorSubscriptionErrorCount;
        this.subRequestErrorSubscriptionErrorCount = this._frame.subRequestErrorSubscriptionErrorCount;
        this.dataErrorSubscriptionErrorCount = this._frame.dataErrorSubscriptionErrorCount;
        this.userNotAuthorisedSubscriptionErrorCount = this._frame.userNotAuthorisedSubscriptionErrorCount;
        this.serverWarningSubscriptionErrorCount = this._frame.serverWarningSubscriptionErrorCount;

        this._cdr.markForCheck();
    }

    private processServerInfoChange() {
        this.serverName = this._frame.serverName;
        this.serverClass = this._frame.serverClass;
        this.softwareVersion = this._frame.softwareVersion;
        this.protocolVersion = this._frame.protocolVersion;

        this._cdr.markForCheck();
    }
}

export namespace ZenithStatusNgComponent {
    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(ZenithStatusNgComponent);
        const instance = componentRef.instance;
        if (!(instance instanceof ZenithStatusNgComponent)) {
            throw new AssertInternalError('ZSCCI339212772');
        } else {
            return instance;
        }
    }
}
