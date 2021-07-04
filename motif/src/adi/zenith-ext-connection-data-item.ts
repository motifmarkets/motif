/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, Badness, Integer, Logger, MultiEvent, newNowDate, SysTick } from 'src/sys/internal-api';
import {
    AuthStatusId,
    DataChannelId,
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    ZenithCounterDataMessage,
    ZenithLogDataMessage,
    ZenithPublisherOnlineChangeDataMessage,
    ZenithPublisherReconnectReasonId,
    ZenithPublisherStateChangeDataMessage,
    ZenithPublisherStateId,
    ZenithReconnectDataMessage
} from './common/internal-api';
import { ExtConnectionDataItem } from './ext-connection-data-item';
import { Publisher } from './publisher';
import { ZenithPublisher } from './publishers/internal-api';

export class ZenithExtConnectionDataItem extends ExtConnectionDataItem {
    private _publisher: Publisher;

    private _publisherOnline = false;
    private _publisherOnlineChangeHistory: ZenithExtConnectionDataItem.PublisherOnlineChange[] = [];
    private _publisherStateId = ZenithPublisherStateId.ConnectionSubscription;
    private _waitId = 0;
    private _lastReconnectReasonId: ZenithPublisherReconnectReasonId | undefined;
    private _sessionKickedOff = false;
    private _accessTokenExpiryTime = 0;
    private _authFetchSuccessiveFailureCount = 0;
    private _socketOpenSuccessiveFailureCount = 0;
    private _zenithTokenFetchSuccessiveFailureCount = 0;
    private _zenithTokenRefreshSuccessiveFailureCount = 0;
    private _socketCloseSuccessiveFailureCount = 0;
    private _unexpectedSocketCloseCount = 0;
    private _timeoutCount = 0;
    private _lastTimeoutStateId: ZenithPublisherStateId | undefined;

    private _receivePacketCount = 0;
    private _sendPacketCount = 0;

    private _internalSubscriptionErrorCount = 0;
    private _requestTimeoutSubscriptionErrorCount = 0;
    private _offlinedSubscriptionErrorCount = 0;
    private _publishRequestErrorSubscriptionErrorCount = 0;
    private _subRequestErrorSubscriptionErrorCount = 0;
    private _dataErrorSubscriptionErrorCount = 0;
    private _userNotAuthorisedSubscriptionErrorCount = 0;
    private _serverWarningSubscriptionErrorCount = 0;

    public get AuthStatusId(): AuthStatusId { return this._authStatusId; }
    private _authStatusId: AuthStatusId = AuthStatusId.NotAuthorised;

    private _publisherStateChangeMultiEvent = new MultiEvent<ZenithExtConnectionDataItem.PublisherStateChangeEventHandler>();
    private _publisherOnlineChangeMultiEvent = new MultiEvent<ZenithExtConnectionDataItem.PublisherOnlineChangeEventHandler>();
    private _reconnectMultiEvent = new MultiEvent<ZenithExtConnectionDataItem.ReconnectEventHandler>();
    private _counterMultiEvent = new MultiEvent<ZenithExtConnectionDataItem.CounterEventHandler>();
    private _logMultiEvent = new MultiEvent<ZenithExtConnectionDataItem.LogEventHandler>();
    private _sessionKickedOffMultiEvent = new MultiEvent<ZenithExtConnectionDataItem.SessionKickedOffEventHandler>();

    get publisherOnline() { return this._publisherOnline; }
    get publisherOnlineChangeHistory() { return this._publisherOnlineChangeHistory; }
    get publisherStateId() { return this._publisherStateId; }
    get waitId() { return this._waitId; }
    get lastReconnectReasonId() { return this._lastReconnectReasonId; }
    get sessionKickedOff() { return this._sessionKickedOff; }

    get accessTokenExpiryTime() { return this._accessTokenExpiryTime; }
    get authFetchSuccessiveFailureCount() { return this._authFetchSuccessiveFailureCount; }
    get socketOpenSuccessiveFailureCount() { return this._socketOpenSuccessiveFailureCount; }
    get zenithTokenFetchSuccessiveFailureCount() { return this._zenithTokenFetchSuccessiveFailureCount; }
    get zenithTokenRefreshSuccessiveFailureCount() { return this._zenithTokenRefreshSuccessiveFailureCount; }
    get socketCloseSuccessiveFailureCount() { return this._socketCloseSuccessiveFailureCount; }
    get unexpectedSocketCloseCount() { return this._unexpectedSocketCloseCount; }
    get timeoutCount() { return this._timeoutCount; }
    get lastTimeoutStateId() { return this._lastTimeoutStateId; }
    get receivePacketCount() { return this._receivePacketCount; }
    get sendPacketCount() { return this._sendPacketCount; }

    get internalSubscriptionErrorCount() { return this._internalSubscriptionErrorCount; }
    get requestTimeoutSubscriptionErrorCount() { return this._requestTimeoutSubscriptionErrorCount; }
    get offlinedSubscriptionErrorCount() { return this._offlinedSubscriptionErrorCount; }
    get publishRequestErrorSubscriptionErrorCount() { return this._publishRequestErrorSubscriptionErrorCount; }
    get subRequestErrorSubscriptionErrorCount() { return this._subRequestErrorSubscriptionErrorCount; }
    get dataErrorSubscriptionErrorCount() { return this._dataErrorSubscriptionErrorCount; }
    get userNotAuthorisedSubscriptionErrorCount() { return this._userNotAuthorisedSubscriptionErrorCount; }
    get serverWarningSubscriptionErrorCount() { return this._serverWarningSubscriptionErrorCount; }

    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition);
        assert(MyDataDefinition.channelId === DataChannelId.ZenithExtConnection);
    }

    updateAccessToken(value: string) {
        (this._publisher as ZenithPublisher).updateAuthAccessToken(value);
    }

    override processMessage(msg: DataMessage): void {
        switch (msg.typeId) {
            case DataMessageTypeId.ZenithPublisherOnlineChange:
                this.processPublisherOnlineChange(msg as ZenithPublisherOnlineChangeDataMessage);
                break;
            case DataMessageTypeId.ZenithPublisherStateChange:
                this.processPublisherStateChange(msg as ZenithPublisherStateChangeDataMessage);
                break;
            case DataMessageTypeId.ZenithReconnect:
                this.processReconnect(msg as ZenithReconnectDataMessage);
                break;
            case DataMessageTypeId.ZenithCounter:
                this.processCounter(msg as ZenithCounterDataMessage);
                break;
            case DataMessageTypeId.ZenithLog:
                this.processLog(msg as ZenithLogDataMessage);
                break;
            case DataMessageTypeId.ZenithSessionKickedOff:
                this.processSessionKickedOff();
                break;

            default:
                super.processMessage(msg);
        }
    }

    processPublisherOnlineChange(msg: ZenithPublisherOnlineChangeDataMessage) {
        const online = msg.online;
        this.beginUpdate();
        try {
            this.notifyUpdateChange();
            this._publisherOnline = online;
            const change: ZenithExtConnectionDataItem.PublisherOnlineChange = {
                time: newNowDate(),
                tickTime: SysTick.now(),
                socketCloseCode: msg.socketCloseCode,
                socketCloseReason: msg.socketCloseReason,
                socketCloseWasClean: msg.socketCloseWasClean,
            };
            this._publisherOnlineChangeHistory.push(change);
            this.notifyPublisherOnlineChange(this._publisherOnline);
        } finally {
            this.endUpdate();
        }
    }

    processPublisherStateChange(msg: ZenithPublisherStateChangeDataMessage) {
        this.beginUpdate();
        try {
            this.notifyUpdateChange();
            this._publisherStateId = msg.stateId;
            this._waitId = msg.waitId;
            this.notifyPublisherStateChange(msg.stateId, msg.waitId);
        } finally {
            this.endUpdate();
        }
    }

    processReconnect(msg: ZenithReconnectDataMessage) {
        this.beginUpdate();
        try {
            this.notifyUpdateChange();
            this._lastReconnectReasonId = msg.reconnectReasonId;
            this.notifyReconnect(msg.reconnectReasonId);
        } finally {
            this.endUpdate();
        }
    }

    processCounter(msg: ZenithCounterDataMessage) {
        this._accessTokenExpiryTime = msg.accessTokenExpiryTime;
        this._authFetchSuccessiveFailureCount = msg.authFetchSuccessiveFailureCount;
        this._socketOpenSuccessiveFailureCount = msg.socketOpenSuccessiveFailureCount;
        this._zenithTokenFetchSuccessiveFailureCount = msg.zenithTokenFetchSuccessiveFailureCount;
        this._zenithTokenRefreshSuccessiveFailureCount = msg.zenithTokenRefreshSuccessiveFailureCount;
        this._socketCloseSuccessiveFailureCount = msg.socketCloseSuccessiveFailureCount;
        this._unexpectedSocketCloseCount = msg.unexpectedSocketCloseCount;
        this._timeoutCount = msg.timeoutCount;
        this._lastTimeoutStateId = msg.lastTimeoutStateId;

        this._receivePacketCount = msg.receivePacketCount;
        this._sendPacketCount = msg.sendPacketCount;

        this._internalSubscriptionErrorCount = msg.internalSubscriptionErrorCount;
        this._requestTimeoutSubscriptionErrorCount = msg.requestTimeoutSubscriptionErrorCount;
        this._offlinedSubscriptionErrorCount = msg.offlinedSubscriptionErrorCount;
        this._publishRequestErrorSubscriptionErrorCount = msg.publishRequestErrorSubscriptionErrorCount;
        this._subRequestErrorSubscriptionErrorCount = msg.subRequestErrorSubscriptionErrorCount;
        this._dataErrorSubscriptionErrorCount = msg.dataErrorSubscriptionErrorCount;
        this._userNotAuthorisedSubscriptionErrorCount = msg.userNotAuthorisedSubscriptionErrorCount;
        this._serverWarningSubscriptionErrorCount = msg.serverWarningSubscriptionErrorCount;

        this.notifyCounter();
    }

    processLog(msg: ZenithLogDataMessage) {
        this.notifyLog(msg.time, msg.levelId, msg.text);
    }

    processSessionKickedOff() {
        if (!this._sessionKickedOff) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this._sessionKickedOff = true;
                this.notifySessionKickedOff();
            } finally {
                this.endUpdate();
            }
        }
    }

    subscribePublisherOnlineChangeEvent(handler: ZenithExtConnectionDataItem.PublisherOnlineChangeEventHandler) {
        return this._publisherOnlineChangeMultiEvent.subscribe(handler);
    }

    unsubscribePublisherOnlineChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._publisherOnlineChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribePublisherStateChangeEvent(handler: ZenithExtConnectionDataItem.PublisherStateChangeEventHandler) {
        return this._publisherStateChangeMultiEvent.subscribe(handler);
    }

    unsubscribePublisherStateChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._publisherStateChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeZenithReconnectEvent(handler: ZenithExtConnectionDataItem.ReconnectEventHandler) {
        return this._reconnectMultiEvent.subscribe(handler);
    }

    unsubscribeZenithReconnectEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._reconnectMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeZenithCounterEvent(handler: ZenithExtConnectionDataItem.CounterEventHandler) {
        return this._counterMultiEvent.subscribe(handler);
    }

    unsubscribeZenithCounterEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._counterMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeZenithLogEvent(handler: ZenithExtConnectionDataItem.LogEventHandler) {
        return this._logMultiEvent.subscribe(handler);
    }

    unsubscribeZenithLogEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._logMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeZenithSessionKickedOffEvent(handler: ZenithExtConnectionDataItem.SessionKickedOffEventHandler) {
        return this._sessionKickedOffMultiEvent.subscribe(handler);
    }

    unsubscribeZenithSessionKickedOffEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._sessionKickedOffMultiEvent.unsubscribe(subscriptionId);
    }

    protected override start() {
        this._publisher = this.onRequirePublisher(this.definition);
        this._publisher.connect(this.id, this.nextRequestNr, this.definition);

        super.start();
    }

    protected override stop() {
        this._publisher.disconnect(this.id);
    }

    protected override calculateUsabilityBadness() {
        return Badness.notBad;
    }

    protected getConnected(): boolean {
        return this._publisherOnline;
    }

    private notifyPublisherOnlineChange(online: boolean) {
        const handlers = this._publisherOnlineChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](online);
        }
    }

    private notifyPublisherStateChange(stateId: ZenithPublisherStateId, waitId: Integer) {
        const handlers = this._publisherStateChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](stateId, waitId);
        }
    }

    private notifyReconnect(reconnectReasonId: ZenithPublisherReconnectReasonId) {
        const handlers = this._reconnectMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](reconnectReasonId);
        }
    }

    private notifyCounter() {
        const handlers = this._counterMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private notifyLog(time: Date, logLevelId: Logger.LevelId, text: string) {
        const handlers = this._logMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](time, logLevelId, text);
        }
    }

    private notifySessionKickedOff() {
        const handlers = this._sessionKickedOffMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }
}

export namespace ZenithExtConnectionDataItem {
    export interface PublisherOnlineChange {
        readonly time: Date;
        readonly tickTime: SysTick.Time;
        readonly socketCloseCode: number;
        readonly socketCloseReason: string;
        readonly socketCloseWasClean: boolean;
    }

    export type PublisherOnlineChangeEventHandler = (this: void, online: boolean) => void;
    export type PublisherStateChangeEventHandler = (this: void, stateId: ZenithPublisherStateId, waitId: Integer) => void;
    export type ReconnectEventHandler = (this: void, reconnectReasonId: ZenithPublisherReconnectReasonId) => void;
    export type CounterEventHandler = (this: void) => void;
    export type LogEventHandler = (this: void, time: Date, logLevelId: Logger.LevelId, text: string) => void;
    export type SessionKickedOffEventHandler = (this: void) => void;
}

/*interface IStateUpdate {
    ZenithConnectionStatus?: TZenithExtConnectionStatusId;
    ZenithAuthStatusId?: AuthStatusId;
}
*/
