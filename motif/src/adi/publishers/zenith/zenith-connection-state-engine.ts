/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    EnumInfoOutOfOrderError,
    Integer,
    Logger,
    mSecsPerMin,
    SysTick,
    UnreachableCaseError,
    WebsocketCloseCode
} from 'src/sys/internal-api';
import { ZenithPublisherReconnectReasonId, ZenithPublisherStateId } from '../../common/internal-api';

export class ZenithConnectionStateEngine {
    static readonly timeout_None = 0;
    static readonly timeout_Never = -1;

    private static readonly _waitId_Null = 0;
    private static _nextWaitId = ZenithConnectionStateEngine._waitId_Null + 1;

    actionEvent: ZenithConnectionStateEngine.ActionEvent;
    cameOnlineEvent: ZenithConnectionStateEngine.CameOnlineEvent;
    wentOfflineEvent: ZenithConnectionStateEngine.WentOfflineEvent;

    // used for sending messages to DataItem
    stateChangeEvent: ZenithConnectionStateEngine.StateChangeEvent;
    reconnectEvent: ZenithConnectionStateEngine.ReconnectEvent;
    logEvent: ZenithConnectionStateEngine.LogEvent;

    private _stateId = ZenithPublisherStateId.ConnectionSubscription;

    private _finalising = false;
    private _pendingConnectActive = false;
    private _activeWaitId: Integer = ZenithConnectionStateEngine._waitId_Null;

    private _pendingZenithEndpoint: string;
    private _pendingAuthenticationTypeId: ZenithConnectionStateEngine.AuthenticationTypeId;

    private _zenithEndpoint: string;
    private _authenticationTypeId: ZenithConnectionStateEngine.AuthenticationTypeId;

    private _ownerCredentials: ZenithConnectionStateEngine.OwnerCredentials;
    private _provider: string;
    private _accessToken: string;
    private _accessTokenExpiryTime: SysTick.Time;

    private _authFetchSuccessiveFailureCount = 0;
    private _socketOpenSuccessiveFailureCount = 0;
    private _zenithTokenFetchSuccessiveFailureCount = 0;
    private _zenithTokenRefreshSuccessiveFailureCount = 0;
    private _socketCloseSuccessiveFailureCount = 0;
    private _unexpectedSocketCloseCount = 0;

    private _reconnectReasonId: ZenithPublisherReconnectReasonId | undefined;
    private _timeoutCount = 0;
    private _lastTimeoutStateId: ZenithPublisherStateId | undefined;

    private _actionTimeoutHandle: NodeJS.Timeout | undefined;

    get stateId() { return this._stateId; }
    get finalising() { return this._finalising; }

    get activeWaitId() { return this._activeWaitId; }
    get zenithEndpoint() { return this._zenithEndpoint; }
    get authenticationTypeId() { return this._authenticationTypeId; }
    get ownerCredentials() { return this._ownerCredentials; }
    get provider() { return this._provider; }
    get accessToken() { return this._accessToken; }
    get accessTokenExpiryTime() { return this._accessTokenExpiryTime; }

    get authFetchSuccessiveFailureCount() { return this._authFetchSuccessiveFailureCount; }
    get socketOpenSuccessiveFailureCount() { return this._socketOpenSuccessiveFailureCount; }
    get zenithTokenFetchSuccessiveFailureCount() { return this._zenithTokenFetchSuccessiveFailureCount; }
    get zenithTokenRefreshSuccessiveFailureCount() { return this._zenithTokenRefreshSuccessiveFailureCount; }
    get socketCloseSuccessiveFailureCount() { return this._socketCloseSuccessiveFailureCount; }
    get unexpectedSocketCloseCount() { return this._unexpectedSocketCloseCount; }
    get reconnectReasonId() { return this._reconnectReasonId; }
    get timeoutCount() { return this._timeoutCount; }
    get lastTimeoutStateId() { return this._lastTimeoutStateId; }

    adviseConnectionSubscription(zenithEndpoint: string,
        authenticationTypeId: ZenithConnectionStateEngine.AuthenticationTypeId) {
        this._pendingZenithEndpoint = zenithEndpoint;
        this._pendingAuthenticationTypeId = authenticationTypeId;
        this._pendingConnectActive = true;

        switch (this.stateId) {
            case ZenithPublisherStateId.ConnectionSubscription:
            case ZenithPublisherStateId.ReconnectDelay:
                this.action(ZenithConnectionStateEngine.ActionId.ConnectPending);
                break;
            default:
                this.reconnect(ZenithPublisherReconnectReasonId.ConnectionSubscription);
        }
    }

    connectPending() {
        if (this.stateId === ZenithPublisherStateId.ConnectPending) {
            this._zenithEndpoint = this._pendingZenithEndpoint;
            this._authenticationTypeId = this._pendingAuthenticationTypeId;
            this._pendingConnectActive = false;

            this._finalising = false;
            this._ownerCredentials = {
                clientId: '',
                username: '',
                password: '',
            };
            this._provider = '';
            this._accessToken = '';
            this._accessTokenExpiryTime = 0;

            this._authFetchSuccessiveFailureCount = 0;
            this._socketOpenSuccessiveFailureCount = 0;
            this._zenithTokenFetchSuccessiveFailureCount = 0;
            this._zenithTokenRefreshSuccessiveFailureCount = 0;
            this._socketCloseSuccessiveFailureCount = 0;
            this._unexpectedSocketCloseCount = 0;

            this._reconnectReasonId = undefined;
            this._timeoutCount = 0;
            this._lastTimeoutStateId = undefined;

            this.action(ZenithConnectionStateEngine.ActionId.Connect);
        } else {
            this.logWarning(`Unexpected state in ZenithConnectionStateEngine.connectPending: ${this.stateId}`);
        }
    }

    connect() {
        if (this.stateId === ZenithPublisherStateId.Connect) {
            switch (this.authenticationTypeId) {
                case ZenithConnectionStateEngine.AuthenticationTypeId.AuthToken:
                    this.action(ZenithConnectionStateEngine.ActionId.AuthTokenFetch);
                    break;
                case ZenithConnectionStateEngine.AuthenticationTypeId.AuthOwner:
                    this.action(ZenithConnectionStateEngine.ActionId.AuthOwnerFetch);
                    break;
                default:
                    throw new UnreachableCaseError('ZCSEC121209', this.authenticationTypeId);
            }
        } else {
            this.logWarning(`Unexpected state in ZenithConnectionStateEngine: ${this.stateId}`);
        }
    }

    adviseAuthTokenFetchSuccess(provider: string, accessToken: string) {
        if (this.stateId === ZenithPublisherStateId.AuthFetch) {
            this._provider = provider;
            this._accessToken = accessToken;
            this._authFetchSuccessiveFailureCount = 0;
            this.action(ZenithConnectionStateEngine.ActionId.SocketOpen);
        }
    }

    adviseAuthOwnerFetchSuccess(provider: string, credentials: ZenithConnectionStateEngine.OwnerCredentials) {
        if (this.stateId === ZenithPublisherStateId.AuthFetch) {
            this._provider = provider;
            this._ownerCredentials = credentials;
            this._authFetchSuccessiveFailureCount = 0;
            this.action(ZenithConnectionStateEngine.ActionId.SocketOpen);
        }
    }

    adviseAuthFetchFailure() {
        if (this.stateId === ZenithPublisherStateId.AuthFetch) {
            this._authFetchSuccessiveFailureCount++;
            switch (this.authenticationTypeId) {
                case ZenithConnectionStateEngine.AuthenticationTypeId.AuthToken:
                    this.reconnect(ZenithPublisherReconnectReasonId.MotifServicesTokenFailure);
                    break;
                case ZenithConnectionStateEngine.AuthenticationTypeId.AuthOwner:
                    this.finalise(false);
                    break;
                default:
                    throw new UnreachableCaseError('ZCSEAFATFD55872', this.authenticationTypeId);
            }
        }
    }

    adviseSocketOpenSuccess() {
        if (this.stateId === ZenithPublisherStateId.SocketOpen) {
            this._socketOpenSuccessiveFailureCount = 0;
            this.action(ZenithConnectionStateEngine.ActionId.ZenithTokenFetch);
        }
    }

    adviseSocketOpenFailure() {
        if (this.stateId === ZenithPublisherStateId.SocketOpen) {
            this._socketOpenSuccessiveFailureCount++;
            this.reconnect(ZenithPublisherReconnectReasonId.SocketOpenFailure);
        }
    }

    adviseZenithTokenFetchSuccess(accessToken: string, expiryTime: SysTick.Time) {
        if (this.stateId === ZenithPublisherStateId.ZenithTokenFetch) {
            this._accessToken = accessToken;
            this._accessTokenExpiryTime = expiryTime;
            this._zenithTokenFetchSuccessiveFailureCount = 0;
            this.action(ZenithConnectionStateEngine.ActionId.ZenithTokenInterval);
            this.cameOnlineEvent();
        }
    }

    adviseZenithTokenFetchFailure(finalise: boolean) {
        if (this.stateId === ZenithPublisherStateId.ZenithTokenFetch) {
            this._zenithTokenFetchSuccessiveFailureCount++;
            if (finalise) {
                this.finalise(false);
            } else {
                this.reconnect(ZenithPublisherReconnectReasonId.ZenithTokenFetchFailure);
            }
        }
    }

    adviseZenithTokenInterval() {
        if (this.stateId === ZenithPublisherStateId.ZenithTokenInterval) {
            this.action(ZenithConnectionStateEngine.ActionId.ZenithTokenRefresh);
        }
    }

    adviseZenithTokenRefreshSuccess(accessToken: string, expiryTime: SysTick.Time) {
        if (this.stateId === ZenithPublisherStateId.ZenithTokenRefresh) {
            this._accessToken = accessToken;
            this._accessTokenExpiryTime = expiryTime;
            this._zenithTokenRefreshSuccessiveFailureCount = 0;
            this.action(ZenithConnectionStateEngine.ActionId.ZenithTokenInterval);
        }
    }

    adviseZenithTokenRefreshFailure() {
        if (this.stateId === ZenithPublisherStateId.ZenithTokenRefresh) {
            this._zenithTokenRefreshSuccessiveFailureCount++;
            this._accessTokenExpiryTime = 0; // force getting a new one from auth
            this.action(ZenithConnectionStateEngine.ActionId.ZenithTokenInterval);
        }
    }

    adviseSocketClose(code: number, reason: string, wasClean: boolean) {
        if (this.stateId === ZenithPublisherStateId.SocketClose) {
            this._socketCloseSuccessiveFailureCount = 0;
            this.disconnect(true, code, reason, wasClean); // we were expecting so reconnect was already called
        } else {
            this._unexpectedSocketCloseCount++;
            this.reconnect(ZenithPublisherReconnectReasonId.UnexpectedSocketClose, true, code, reason, wasClean);
        }
    }

    adviseSocketCloseFailure() {
        if (this.stateId === ZenithPublisherStateId.SocketClose) {
            // assume closed and continue disconnect
            this.disconnect(true);
        } else {
            // weird - reconnect
            this._socketCloseSuccessiveFailureCount++;
            this.reconnect(ZenithPublisherReconnectReasonId.UnexpectedSocketClose);
        }
    }

    adviseReconnectDelayCompleted() {
        if (this.stateId === ZenithPublisherStateId.ReconnectDelay) {
            if (this._pendingConnectActive) {
                this.action(ZenithConnectionStateEngine.ActionId.ConnectPending);
            } else {
                if (this.isAccessTokenReusable()) {
                    this.action(ZenithConnectionStateEngine.ActionId.SocketOpen);
                } else {
                    this.action(ZenithConnectionStateEngine.ActionId.Connect);
                }
            }
        }
    }

    finalise(socketWasClosed: boolean) {
        this._reconnectReasonId = undefined;
        this._finalising = true;
        this.disconnect(socketWasClosed);
        this.checkClearActionTimeout();
    }

    private handleTimeout(waitId: Integer) {
        if (waitId === this._activeWaitId) {
            // nothing else has happened so timeout is valid
            this.processTimeout();
        }
    }

    private log(logLevelId: Logger.LevelId, text: string) {
        this.logEvent(logLevelId, text);
    }

    private logWarning(text: string) {
        this.log(Logger.LevelId.Warning, text);
    }

    private getNextWaitId() {
        return ZenithConnectionStateEngine._nextWaitId++;
    }

    private isAccessTokenReusable() {
        return this._accessTokenExpiryTime >= SysTick.now() - ZenithConnectionStateEngine.AccessTokenReusableExpiryTimeSpan;
    }

    private setState(stateId: ZenithPublisherStateId) {
        this._stateId = stateId;
        this._activeWaitId = this.getNextWaitId();
        this.stateChangeEvent(stateId, this._activeWaitId);
    }

    private action(actionId: ZenithConnectionStateEngine.ActionId) {
        const newStateId = ZenithConnectionStateEngine.Action.idToStateId(actionId);
        this.setState(newStateId);

        const timeout = ZenithConnectionStateEngine.Action.idToTimeout(actionId);

        switch (timeout) {
            case ZenithConnectionStateEngine.timeout_None:
            case ZenithConnectionStateEngine.timeout_Never:
                break;
            default:
                const actionWaitId = this._activeWaitId;
                this.checkClearActionTimeout();
                this._actionTimeoutHandle = setTimeout(() => this.handleTimeout(actionWaitId), timeout);
        }

        this.actionEvent(actionId, this._activeWaitId);
    }

    private checkClearActionTimeout() {
        if (this._actionTimeoutHandle !== undefined) {
            clearTimeout(this._actionTimeoutHandle);
            // will either be immediately set again or never used again so no need to undefine.
        }
    }

    private processTimeout() {
        switch (this.stateId) {
            case ZenithPublisherStateId.ReconnectDelay:
            case ZenithPublisherStateId.ConnectionSubscription:
                this.logWarning(`Unexpected timeout for ZenithConnectionStateEngine: ${this.stateId}`);
                break;
            default:
                this._timeoutCount++;
                this._lastTimeoutStateId = this.stateId;
                this.logWarning(`Zenith Action Timeout. State: ${this.stateId} Reconnecting`);
                this.reconnect(ZenithPublisherReconnectReasonId.Timeout);
        }
    }

    private reconnect(reasonId: ZenithPublisherReconnectReasonId,
        socketWasClosed: boolean = false,
        socketCloseCode: number = WebsocketCloseCode.nullCode,
        socketCloseReason: string = ZenithConnectionStateEngine.nullSocketCloseReason,
        socketCloseWasClean: boolean = ZenithConnectionStateEngine.nullSocketCloseWasClean
    ) {
        this._reconnectReasonId = reasonId;
        this.reconnectEvent(reasonId);

        this.disconnect(socketWasClosed, socketCloseCode, socketCloseReason, socketCloseWasClean);
    }

    private disconnect(socketWasClosed: boolean, socketCloseCode: number = WebsocketCloseCode.nullCode,
        socketCloseReason: string = ZenithConnectionStateEngine.nullSocketCloseReason,
        socketCloseWasClean: boolean = ZenithConnectionStateEngine.nullSocketCloseWasClean
    ) {
            switch (this.stateId) {
                case ZenithPublisherStateId.ZenithTokenFetch:
                case ZenithPublisherStateId.ZenithTokenInterval:
                case ZenithPublisherStateId.ZenithTokenRefresh:
                    if (this.stateId !== ZenithPublisherStateId.ZenithTokenFetch) {
                        this.wentOfflineEvent(socketCloseCode, socketCloseReason, socketCloseWasClean);
                    }
                    if (!socketWasClosed) {
                        this.action(ZenithConnectionStateEngine.ActionId.SocketClose);
                    } else {
                        this.disconnectSocketClosed();
                    }
                    break;

                case ZenithPublisherStateId.SocketOpen:
                    this.action(ZenithConnectionStateEngine.ActionId.SocketClose);
                    break;

                case ZenithPublisherStateId.SocketClose:
                case ZenithPublisherStateId.AuthFetch:
                case ZenithPublisherStateId.ConnectPending:
                case ZenithPublisherStateId.Connect:
                case ZenithPublisherStateId.ConnectionSubscription:
                case ZenithPublisherStateId.ReconnectDelay:
                    this.disconnectSocketClosed();
                    break;

                case ZenithPublisherStateId.Finalised:
                    break;

                default:
                    throw new UnreachableCaseError('ZCSED29981', this.stateId);
            }
        // }
    }

    private disconnectSocketClosed() {
        if (this.finalising) {
            this.setState(ZenithPublisherStateId.Finalised);
        } else {
            this.action(ZenithConnectionStateEngine.ActionId.ReconnectDelay);
        }
    }
}

export namespace ZenithConnectionStateEngine {
    export const enum ActionId {
        ReconnectDelay,
        ConnectPending,
        Connect,
        AuthOwnerFetch,
        AuthTokenFetch,
        SocketOpen,
        ZenithTokenFetch,
        ZenithTokenInterval,
        ZenithTokenRefresh,
        SocketClose,
    }

    export const enum AuthenticationTypeId {
        AuthOwner,
        AuthToken,
    }

    export const AccessTokenReusableExpiryTimeSpan = 1 * mSecsPerMin; // an access token will not be reused if less than this time is left

    export const nullSocketCloseReason = '';
    export const nullSocketCloseWasClean = true;

    export type ActionEvent = (this: void, actionId: ActionId, waitId: Integer) => void;
    export type CameOnlineEvent = (this: void) => void;
    export type WentOfflineEvent = (this: void, socketCloseCode: number, socketCloseReason: string, socketCloseWasClean: boolean) => void;
    export type StateChangeEvent = (this: void, id: ZenithPublisherStateId, waitId: Integer) => void;
    export type ReconnectEvent = (this: void, id: ZenithPublisherReconnectReasonId) => void;
    export type LogEvent = (this: void, logLevel: Logger.LevelId, text: string) => void;

    export interface OwnerCredentials {
        clientId: string;
        username: string;
        password: string;
    }

    export namespace Action {
        export type Id = ActionId;

        class Info {
            constructor(
                public id: Id,
                public stateId: ZenithPublisherStateId,
                public timeout: Integer, // milliseconds
            ) { }
        }

        type InfosObject = { [id in keyof typeof ActionId]: Info };

        const infosObject: InfosObject = {
            ReconnectDelay: {
                id: ActionId.ReconnectDelay,
                stateId: ZenithPublisherStateId.ReconnectDelay,
                timeout: ZenithConnectionStateEngine.timeout_Never,
            },
            ConnectPending: {
                id: ActionId.ConnectPending,
                stateId: ZenithPublisherStateId.ConnectPending,
                timeout: ZenithConnectionStateEngine.timeout_None,
            },
            Connect: {
                id: ActionId.Connect,
                stateId: ZenithPublisherStateId.Connect,
                timeout: ZenithConnectionStateEngine.timeout_None,
            },
            AuthOwnerFetch: {
                id: ActionId.AuthOwnerFetch,
                stateId: ZenithPublisherStateId.AuthFetch,
                timeout: ZenithConnectionStateEngine.timeout_Never, // username and password dialog
            },
            AuthTokenFetch: {
                id: ActionId.AuthTokenFetch,
                stateId: ZenithPublisherStateId.AuthFetch,
                timeout: 20000,
            },
            SocketOpen: {
                id: ActionId.SocketOpen,
                stateId: ZenithPublisherStateId.SocketOpen,
                timeout: 40000,
            },
            ZenithTokenFetch: {
                id: ActionId.ZenithTokenFetch,
                stateId: ZenithPublisherStateId.ZenithTokenFetch,
                timeout: 40000,
            },
            ZenithTokenInterval: {
                id: ActionId.ZenithTokenInterval,
                stateId: ZenithPublisherStateId.ZenithTokenInterval,
                timeout: ZenithConnectionStateEngine.timeout_Never,
            },
            ZenithTokenRefresh: {
                id: ActionId.ZenithTokenRefresh,
                stateId: ZenithPublisherStateId.ZenithTokenRefresh,
                timeout: 40000,
            },
            SocketClose: {
                id: ActionId.SocketClose,
                stateId: ZenithPublisherStateId.SocketClose,
                timeout: 5000,
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function initialiseStatic() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ZenithConnectionStateEngine.Action', outOfOrderIdx, `${infos[outOfOrderIdx].id}`);
            }
        }

        export function idToStateId(id: Id) {
            return infos[id].stateId;
        }

        export function idToTimeout(id: Id) {
            return infos[id].timeout;
        }
    }

    export function initialiseStatic() {
        Action.initialiseStatic();
    }
}

export namespace ZenithConnectionStateEngineModule {
    export function initialiseStatic() {
        ZenithConnectionStateEngine.initialiseStatic();
    }
}
