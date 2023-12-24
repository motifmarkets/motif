/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService, Badness, CorrectnessId, MultiEvent, StringId, Strings, SysTick, UnreachableCaseError, ZenithExtConnectionDataDefinition,
    ZenithExtConnectionDataItem,
    ZenithPublisherReconnectReason,
    ZenithPublisherState,
    ZenithServerInfoDataDefinition,
    ZenithServerInfoDataItem
} from '@motifmarkets/motif-core';
import { ContentFrame } from '../content-frame';

export class ZenithStatusFrame extends ContentFrame {
    private _extConnectionDataItem: ZenithExtConnectionDataItem;
    private _extConnectionPublisherOnlineChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionPublisherStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionReconnectSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionSessionKickedOffSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionSelectedEndpointChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionCounterSubscriptionId: MultiEvent.SubscriptionId;

    private _serverInfoDataItem: ZenithServerInfoDataItem;
    private _serverInfoFieldValuesChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _serverInfoCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _componentAccess: ZenithStatusFrame.ComponentAccess, private _adi: AdiService,
        public readonly endpoints: readonly string[]
    ) {
        super();
    }

    // PublisherOnlineChangeEvent
    get publisherOnline() { return this._extConnectionDataItem.publisherOnline ? Strings[StringId.Online] : Strings[StringId.Offline]; }
    get publisherOnlineChangeHistory() { return this._extConnectionDataItem.publisherOnlineChangeHistory; }

    // PublisherStateChangeEvent
    get publisherStateId() { return ZenithPublisherState.idToDisplay(this._extConnectionDataItem.publisherStateId); }
    get waitId() { return this._extConnectionDataItem.waitId.toString(10); }

    // ReconnectEvent
    get lastReconnectReasonId() {
        const reasonId = this._extConnectionDataItem.lastReconnectReasonId;
        return reasonId === undefined ? '' : ZenithPublisherReconnectReason.idToDisplay(reasonId);
    }

    // SessionKickedOffEvent
    get sessionKickedOff() { return this._extConnectionDataItem.sessionTerminated? Strings[StringId.True] : Strings[StringId.False]; }

    // SelectedEndpointChangedEvent
    get selectedEndpoint() { return this._extConnectionDataItem.selectedEndpoint; }

    // CounterEvent
    get authExpiryTime() {
        const time = SysTick.toDate(this._extConnectionDataItem.authExpiryTime);
        return time.toLocaleTimeString();
    }
    get authFetchSuccessiveFailureCount() { return this._extConnectionDataItem.authFetchSuccessiveFailureCount.toString(10); }
    get socketConnectingSuccessiveErrorCount() { return this._extConnectionDataItem.socketConnectingSuccessiveErrorCount.toString(10); }
    get zenithTokenFetchSuccessiveFailureCount() { return this._extConnectionDataItem.zenithTokenFetchSuccessiveFailureCount.toString(10); }
    get zenithTokenRefreshSuccessiveFailureCount() {
        return this._extConnectionDataItem.zenithTokenRefreshSuccessiveFailureCount.toString(10);
    }
    get socketClosingSuccessiveErrorCount() { return this._extConnectionDataItem.socketClosingSuccessiveErrorCount.toString(10); }
    get socketShortLivedClosedSuccessiveErrorCount() { return this._extConnectionDataItem.socketShortLivedClosedSuccessiveErrorCount.toString(10); }
    get unexpectedSocketCloseCount() { return this._extConnectionDataItem.unexpectedSocketCloseCount.toString(10); }
    get timeoutCount() { return this._extConnectionDataItem.timeoutCount.toString(10); }
    get lastTimeoutStateId() {
        const stateId = this._extConnectionDataItem.lastTimeoutStateId;
        return stateId === undefined ? '' : ZenithPublisherState.idToDisplay(stateId);
    }
    get receivePacketCount() { return this._extConnectionDataItem.receivePacketCount.toString(10); }
    get sendPacketCount() { return this._extConnectionDataItem.sendPacketCount.toString(10); }
    get internalSubscriptionErrorCount() { return this._extConnectionDataItem.internalSubscriptionErrorCount.toString(10); }
    get requestTimeoutSubscriptionErrorCount() { return this._extConnectionDataItem.requestTimeoutSubscriptionErrorCount.toString(10); }
    get offlinedSubscriptionErrorCount() { return this._extConnectionDataItem.offlinedSubscriptionErrorCount.toString(10); }
    get publishRequestErrorSubscriptionErrorCount() {
        return this._extConnectionDataItem.publishRequestErrorSubscriptionErrorCount.toString(10);
    }
    get subRequestErrorSubscriptionErrorCount() { return this._extConnectionDataItem.subRequestErrorSubscriptionErrorCount.toString(10); }
    get dataErrorSubscriptionErrorCount() { return this._extConnectionDataItem.dataErrorSubscriptionErrorCount.toString(10); }
    get userNotAuthorisedSubscriptionErrorCount() {
        return this._extConnectionDataItem.userNotAuthorisedSubscriptionErrorCount.toString(10);
    }
    get serverWarningSubscriptionErrorCount() { return this._extConnectionDataItem.serverWarningSubscriptionErrorCount.toString(10); }

    // ZenithServerInfoDataItem
    get serverName() { return this._serverInfoDataItem.serverName === undefined ? '' : this._serverInfoDataItem.serverName; }
    get serverClass() { return this._serverInfoDataItem.serverClass === undefined ? '' : this._serverInfoDataItem.serverClass; }
    get softwareVersion() { return this._serverInfoDataItem.softwareVersion === undefined ? '' : this._serverInfoDataItem.softwareVersion; }
    get protocolVersion() { return this._serverInfoDataItem.protocolVersion === undefined ? '' : this._serverInfoDataItem.protocolVersion; }

    initialise() {
        this.subscribeZenithExtConnection();
        this.subscribeZenithServerInfo();

        const badness = this.calculateBadness();
        this._componentAccess.hideBadnessWithVisibleDelay(badness);

        this._componentAccess.notifyPublisherOnlineChange();
        this._componentAccess.notifyPublisherStateChange();
        this._componentAccess.notifyReconnect();
        this._componentAccess.notifySessionKickedOff();
        this._componentAccess.notifySelectedEndpointChanged();
        this._componentAccess.notifyCounter();
        this._componentAccess.notifyServerInfoChanged();
    }

    override finalise() {
        this.unsubscribeZenithExtConnection();
        this.unsubscribeZenithServerInfo();

        super.finalise();
    }

    private handleExtConnectionPublisherOnlineChangeEvent() {
        this._componentAccess.notifyPublisherOnlineChange();
    }

    private handleExtConnectionPublisherStateChangeEvent() {
        this._componentAccess.notifyPublisherStateChange();
    }

    private handleExtConnectionZenithReconnectEvent() {
        this._componentAccess.notifyReconnect();
    }

    private handleExtConnectionSessionKickedOffEvent() {
        this._componentAccess.notifySessionKickedOff();
    }

    private handleExtConnectionSelectedEndpointChangedEvent() {
        this._componentAccess.notifySelectedEndpointChanged();
    }

    private handleExtConnectionCounterEvent() {
        this._componentAccess.notifyCounter();
    }

    private handleServerInfoFieldValuesChangedEvent() {
        this._componentAccess.notifyServerInfoChanged();
    }

    private handleServerInfoBadnessChangeEvent() {
        const badness = this.calculateBadness();
        this._componentAccess.setBadness(badness);
        this._componentAccess.notifyServerInfoChanged();
    }

    private subscribeZenithExtConnection() {
        const dataDefinition = new ZenithExtConnectionDataDefinition();
        dataDefinition.zenithWebsocketEndpoints = this.endpoints;

        this._extConnectionDataItem = this._adi.subscribe(dataDefinition) as ZenithExtConnectionDataItem;
        this._extConnectionPublisherOnlineChangeSubscriptionId = this._extConnectionDataItem.subscribePublisherOnlineChangeEvent(
            () => { this.handleExtConnectionPublisherOnlineChangeEvent(); }
        );
        this._extConnectionPublisherStateChangeSubscriptionId = this._extConnectionDataItem.subscribePublisherStateChangeEvent(
            () => { this.handleExtConnectionPublisherStateChangeEvent(); }
        );
        this._extConnectionReconnectSubscriptionId = this._extConnectionDataItem.subscribeZenithReconnectEvent(
            () => { this.handleExtConnectionZenithReconnectEvent(); }
        );
        this._extConnectionSessionKickedOffSubscriptionId = this._extConnectionDataItem.subscribeZenithSessionTerminatedEvent(
            () => { this.handleExtConnectionSessionKickedOffEvent(); }
        );
        this._extConnectionSelectedEndpointChangedSubscriptionId = this._extConnectionDataItem.subscribeZenithSelectedEndpointChangedEvent(
            () => { this.handleExtConnectionSelectedEndpointChangedEvent(); }
        );
        this._extConnectionCounterSubscriptionId = this._extConnectionDataItem.subscribeZenithCounterEvent(
            () => { this.handleExtConnectionCounterEvent(); }
        );
    }

    private unsubscribeZenithExtConnection() {
        this._extConnectionDataItem.unsubscribePublisherOnlineChangeEvent(this._extConnectionPublisherOnlineChangeSubscriptionId);
        this._extConnectionPublisherOnlineChangeSubscriptionId = undefined;
        this._extConnectionDataItem.unsubscribePublisherStateChangeEvent(this._extConnectionPublisherStateChangeSubscriptionId);
        this._extConnectionPublisherStateChangeSubscriptionId = undefined;
        this._extConnectionDataItem.unsubscribeZenithReconnectEvent(this._extConnectionReconnectSubscriptionId);
        this._extConnectionReconnectSubscriptionId = undefined;
        this._extConnectionDataItem.unsubscribeZenithSessionTerminatedEvent(this._extConnectionSessionKickedOffSubscriptionId);
        this._extConnectionSessionKickedOffSubscriptionId = undefined;
        this._extConnectionDataItem.unsubscribeZenithSelectedEndpointChangedEvent(this._extConnectionSelectedEndpointChangedSubscriptionId);
        this._extConnectionSelectedEndpointChangedSubscriptionId = undefined;
        this._extConnectionDataItem.unsubscribeZenithCounterEvent(this._extConnectionCounterSubscriptionId);
        this._extConnectionCounterSubscriptionId = undefined;
        this._adi.unsubscribe(this._extConnectionDataItem);
    }

    private subscribeZenithServerInfo() {
        const dataDefinition = new ZenithServerInfoDataDefinition();
        this._serverInfoDataItem = this._adi.subscribe(dataDefinition) as ZenithServerInfoDataItem;
        this._serverInfoFieldValuesChangedSubscriptionId = this._serverInfoDataItem.subscribeFieldValuesChangedEvent(
            () => { this.handleServerInfoFieldValuesChangedEvent(); }
        );
        this._serverInfoCorrectnessChangeSubscriptionId = this._serverInfoDataItem.subscribeBadnessChangeEvent(
            () => { this.handleServerInfoBadnessChangeEvent(); }
        );
    }

    private unsubscribeZenithServerInfo() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._serverInfoDataItem !== undefined) {
            this._serverInfoDataItem.unsubscribeFieldValuesChangedEvent(this._serverInfoFieldValuesChangedSubscriptionId);
            this._serverInfoFieldValuesChangedSubscriptionId = undefined;
            this._serverInfoDataItem.unsubscribeBadnessChangeEvent(this._serverInfoCorrectnessChangeSubscriptionId);
            this._serverInfoCorrectnessChangeSubscriptionId = undefined;
            this._adi.unsubscribe(this._serverInfoDataItem);
            this._serverInfoDataItem = undefined as unknown as ZenithServerInfoDataItem;
        }
    }

    private calculateBadness() {
        const serverInfoBadness = this._serverInfoDataItem.badness;
        const correctnessId = Badness.Reason.idToCorrectnessId(serverInfoBadness.reasonId);
        switch (correctnessId) {
            case CorrectnessId.Good:
            case CorrectnessId.Usable:
                return Badness.notBad;
            case CorrectnessId.Suspect: {
                const badness: Badness = {
                    reasonId: Badness.ReasonId.StatusRetrieving,
                    reasonExtra: Badness.generateText(serverInfoBadness),
                };
                return badness;
            }
            case CorrectnessId.Error: {
                const badness: Badness = {
                    reasonId: Badness.ReasonId.StatusWarnings,
                    reasonExtra: Badness.generateText(serverInfoBadness),
                };
                return badness;
            }
            default:
                throw new UnreachableCaseError('ZSFCB88873444', correctnessId);
        }
    }
}

export namespace ZenithStatusFrame {

    export interface ComponentAccess {
        notifyPublisherOnlineChange(): void;
        notifyPublisherStateChange(): void;
        notifyReconnect(): void;
        notifySessionKickedOff(): void;
        notifySelectedEndpointChanged(): void;
        notifyCounter(): void;
        notifyServerInfoChanged(): void;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
