/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    ZenithExtConnectionDataDefinition,
    ZenithExtConnectionDataItem,
    ZenithPublisherReconnectReason,
    ZenithPublisherState,
    ZenithServerInfoDataDefinition,
    ZenithServerInfoDataItem
} from 'src/adi/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { Badness, CorrectnessId, MultiEvent, SysTick, UnreachableCaseError } from 'src/sys/internal-api';
import { ContentFrame } from '../content-frame';

export class ZenithStatusFrame extends ContentFrame {
    private _extConnectionDataItem: ZenithExtConnectionDataItem;
    private _extConnectionPublisherOnlineChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionPublisherStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionReconnectSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionSessionKickedOffSubscriptionId: MultiEvent.SubscriptionId;
    private _extConnectionCounterSubscriptionId: MultiEvent.SubscriptionId;

    private _serverInfoDataItem: ZenithServerInfoDataItem;
    private _serverInfoFieldValuesChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _serverInfoCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

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
    get sessionKickedOff() { return this._extConnectionDataItem.sessionKickedOff ? Strings[StringId.True] : Strings[StringId.False]; }

    // CounterEvent
    get accessTokenExpiryTime() {
        const time = SysTick.toDate(this._extConnectionDataItem.accessTokenExpiryTime);
        return time.toLocaleTimeString();
    }
    get authFetchSuccessiveFailureCount() { return this._extConnectionDataItem.authFetchSuccessiveFailureCount.toString(10); }
    get socketOpenSuccessiveFailureCount() { return this._extConnectionDataItem.socketOpenSuccessiveFailureCount.toString(10); }
    get zenithTokenFetchSuccessiveFailureCount() { return this._extConnectionDataItem.zenithTokenFetchSuccessiveFailureCount.toString(10); }
    get zenithTokenRefreshSuccessiveFailureCount() {
        return this._extConnectionDataItem.zenithTokenRefreshSuccessiveFailureCount.toString(10);
    }
    get socketCloseSuccessiveFailureCount() { return this._extConnectionDataItem.socketCloseSuccessiveFailureCount.toString(10); }
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

    constructor(private _componentAccess: ZenithStatusFrame.ComponentAccess, private _adi: AdiService,
        public readonly endpoint: string
    ) {
        super();
    }

    initialise() {
        this.subscribeZenithExtConnection();
        this.subscribeZenithServerInfo();

        const badness = this.calculateBadness();
        this._componentAccess.hideBadnessWithVisibleDelay(badness);

        this._componentAccess.notifyPublisherOnlineChange();
        this._componentAccess.notifyPublisherStateChange();
        this._componentAccess.notifyReconnect();
        this._componentAccess.notifySessionKickedOff();
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
        dataDefinition.zenithWebsocketEndpoint = this.endpoint;

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
        this._extConnectionSessionKickedOffSubscriptionId = this._extConnectionDataItem.subscribeZenithSessionKickedOffEvent(
            () => { this.handleExtConnectionSessionKickedOffEvent(); }
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
        this._extConnectionDataItem.unsubscribeZenithSessionKickedOffEvent(this._extConnectionSessionKickedOffSubscriptionId);
        this._extConnectionSessionKickedOffSubscriptionId = undefined;
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
        if (this._serverInfoDataItem !== undefined) {
            this._serverInfoDataItem.unsubscribeFieldValuesChangedEvent(this._serverInfoFieldValuesChangedSubscriptionId);
            this._serverInfoFieldValuesChangedSubscriptionId = undefined;
            this._serverInfoDataItem.unsubscribeBadnessChangeEvent(this._serverInfoCorrectnessChangeSubscriptionId);
            this._serverInfoCorrectnessChangeSubscriptionId = undefined;
            this._adi.unsubscribe(this._serverInfoDataItem);
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
        notifyCounter(): void;
        notifyServerInfoChanged(): void;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
