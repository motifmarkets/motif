/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    assigned,
    Integer,
    Logger,
    mSecsPerHour,
    mSecsPerMin,
    mSecsPerSec,
    SysTick,
    UnreachableCaseError,
    WebsocketCloseCode
} from 'src/sys/internal-api';
import {
    DataDefinition,
    DataItemId,
    DataMessages,
    invalidDataItemId,
    invalidDataItemRequestNr,
    PublisherSubscription,
    PublisherSubscriptionDataDefinition,
    PublisherTypeId,
    SynchronisedPublisherSubscriptionDataMessage,
    ZenithCounterDataMessage,
    ZenithExtConnectionDataDefinition,
    ZenithLogDataMessage,
    ZenithPublisherOnlineChangeDataMessage,
    ZenithPublisherReconnectReasonId,
    ZenithPublisherStateChangeDataMessage,
    ZenithPublisherStateId,
    ZenithReconnectDataMessage,
    ZenithSessionKickedOffDataMessage
} from '../../common/internal-api';
import { Publisher } from '../../publisher';
import { AuthOwnerMessageConvert } from './physical-message/auth-owner-message-convert';
import { AuthTokenMessageConvert } from './physical-message/auth-token-message-convert';
import { Zenith } from './physical-message/zenith';
import { ZenithConnectionStateEngine } from './zenith-connection-state-engine';
import { ZenithPublisherSubscriptionManager } from './zenith-publisher-subscription-manager';
import { ZenithWebsocket } from './zenith-websocket';

export class ZenithPublisher extends Publisher {
    private _requestEngine: ZenithPublisherSubscriptionManager;
    private _stateEngine = new ZenithConnectionStateEngine();
    private _websocket = new ZenithWebsocket();

    private _connectionDataItemId: DataItemId;
    private _connectionDataItemRequestNr: Integer;

    private _authAccessToken = '';
    private _activeProvider: string; // in future, may way to cache provider from MotifServices
    private _activePassportAccessToken: string;

    private _counterIntervalHandle: NodeJS.Timeout | undefined;
    private _dataMessages = new DataMessages();
    // private _isUnloading = false;

    private _delayTimeoutHandle: NodeJS.Timeout | undefined;

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

    constructor() {
        super();

        this._stateEngine.actionEvent = (actionId, waitId) => this.handleStateEngineActionEvent(actionId, waitId);
        this._stateEngine.cameOnlineEvent = () => this.handleStateEngineCameOnlineEvent();
        this._stateEngine.wentOfflineEvent = (socketCloseCode, socketCloseReason, socketCloseWasClean) =>
            this.handleStateEngineWentOfflineEvent(socketCloseCode, socketCloseReason, socketCloseWasClean);
        this._stateEngine.stateChangeEvent = (stateId, waitId) => this.handleStateEngineStateChangeEvent(stateId, waitId);
        this._stateEngine.reconnectEvent = (reasonId) => this.handleStateEngineReconnectEvent(reasonId);
        this._stateEngine.logEvent = (logLevelId, text) => this.log(logLevelId, text, true);
        this._requestEngine = new ZenithPublisherSubscriptionManager();
        this._requestEngine.subscriptionErrorEvent = (typeId) => this.handleRequestEngineSubscriptionErrorEvent(typeId);
        this._requestEngine.serverWarningEvent = () => this.handleRequestEngineServerWarningEvent();
        this._requestEngine.sendPhysicalMessageEvent = (message) => this.handleRequestEngineSendPhysicalMessageEvent(message);
        this._requestEngine.authMessageReceivedEvent = (message) => this.handleRequestEngineAuthMessageReceivedEvent(message);
        this._websocket.openEvent = () => this.handleWebsocketOpenEvent();
        this._websocket.messageEvent = (message) => this.handleWebsocketMessageEvent(message);
        this._websocket.closeEvent = (code, reason, wasClean) => this.handleWebsocketCloseEvent(code, reason, wasClean);
        this._websocket.errorEvent = (errorType) => this.handleWebsocketErrorEvent(errorType);
    }

    finalise(): boolean { // virtual
        if (this._counterIntervalHandle !== undefined) {
            clearInterval(this._counterIntervalHandle);
            this._counterIntervalHandle = undefined;
        }
        this._requestEngine.finalise();
        this._stateEngine.finalise(false);
        this.checkClearDelayTimeout();
        return super.finalise();
    }

    connect(
        dataItemId: DataItemId,
        dataItemRequestNr: Integer,
        dataDefinition: DataDefinition
    ) {
        if (!(dataDefinition instanceof ZenithExtConnectionDataDefinition)) {
            throw new AssertInternalError('ZFC121222228852', dataDefinition.description);
        } else {
            const subscriptionCount = this._requestEngine.subscriptionCount;
            if (subscriptionCount > 0) {
                // This should be zero as this means that Publisher is created twice as part of authentication
                // The first instance is lost when restarted but this increases startup time
                this.logWarning(`Subscriptions before connect: ${subscriptionCount}`);
            }
            this._connectionDataItemId = dataItemId;
            this._connectionDataItemRequestNr = dataItemRequestNr;
            this._receivePacketCount = 0;
            this._sendPacketCount = 0;
            this._dataMessages.clear();

            this._authAccessToken = dataDefinition.initialAuthAccessToken;
            let authTypeId: ZenithConnectionStateEngine.AuthenticationTypeId;
            if (dataDefinition.useAuthOwnerZenithAuthentication) {
                authTypeId = ZenithConnectionStateEngine.AuthenticationTypeId.AuthOwner;
            } else {
                authTypeId = ZenithConnectionStateEngine.AuthenticationTypeId.AuthToken;
            }
            this._stateEngine.adviseConnectionSubscription(dataDefinition.zenithWebsocketEndpoint, authTypeId);

            const stateChangeDataMessage = this.createStateChangeDataMessage(this._stateEngine.stateId, this._stateEngine.activeWaitId);
            this._dataMessages.add(stateChangeDataMessage);
            const counterDataMessage = this.createCounterDataMessage();
            this._dataMessages.add(counterDataMessage);
            const synchronisedDataMessage = this.createSynchronisedDataMessage();
            this._dataMessages.add(synchronisedDataMessage);

            this._counterIntervalHandle = setInterval(() => this.handleCounterInterval(), ZenithPublisher.counterDataMessageInterval);

            return true; // For this subscription, Publisher is always considered online
        }
    }

    disconnect(dataItemId: DataItemId) {
        if (dataItemId === this._connectionDataItemId) {
            this._stateEngine.finalise(false);
            this._connectionDataItemId = invalidDataItemId;
            this._connectionDataItemRequestNr = invalidDataItemRequestNr;
            this._receivePacketCount = 0;
            this._sendPacketCount = 0;
            this._dataMessages.clear();
        }
    }

    updateAuthAccessToken(value: string) {
        this._authAccessToken = value;
        if (value !== '') {
            this.processZenithTokenRefreshIntervalCompletedOrAuthAccessTokenChanged(this._stateEngine.activeWaitId);
        } else {
            this.logError('AuthAccessToken: Update Invalid');
            this._stateEngine.adviseAuthFetchFailure();
        }
    }

    subscribeDataItemId(dataItemId: DataItemId, dataDefinition: PublisherSubscriptionDataDefinition) {
        return this._requestEngine.subscribeDataItemId(dataItemId, dataDefinition);
    }

    unsubscribeDataItemId(dataItemId: DataItemId) {
        if (dataItemId === this._connectionDataItemId) {
            this._stateEngine.finalise(false);
            this._connectionDataItemId = invalidDataItemId;
            this._connectionDataItemRequestNr = invalidDataItemRequestNr;
            this._receivePacketCount = 0;
            this._sendPacketCount = 0;
            this._dataMessages.clear();
        } else {
            this._requestEngine.unsubscribeDataItemId(dataItemId);
        }
    }

    activateDataItemId(dataItemId: DataItemId, dataItemRequestNr: Integer) {
        this._requestEngine.activateDataItem(dataItemId, dataItemRequestNr);
    }

    getMessages(nowTickTime: SysTick.Time): DataMessages {
        let outgoingDataMessages = this._requestEngine.exercise(nowTickTime);

        if (!outgoingDataMessages) {
            outgoingDataMessages = new DataMessages();
        }

        if (this._dataMessages.count > 0) {
            outgoingDataMessages.take(this._dataMessages);
        }

        return outgoingDataMessages;
    }

    protected getPublisherTypeId(): PublisherTypeId {
        return PublisherTypeId.Zenith;
    }

    private handleStateEngineActionEvent(actionId: ZenithConnectionStateEngine.ActionId, waitId: Integer) {
        switch (actionId) {
            case ZenithConnectionStateEngine.ActionId.ConnectPending:
                this._stateEngine.connectPending();
                break;
            case ZenithConnectionStateEngine.ActionId.Connect:
                this._stateEngine.connect();
                break;
            case ZenithConnectionStateEngine.ActionId.AuthTokenFetch:
                this.fetchAuthToken(waitId);
                break;
            case ZenithConnectionStateEngine.ActionId.AuthOwnerFetch:
                this.fetchAuthOwner(waitId);
                break;
            case ZenithConnectionStateEngine.ActionId.SocketOpen:
                this.openSocket(waitId);
                break;
            case ZenithConnectionStateEngine.ActionId.ZenithTokenFetch:
                this.fetchZenithToken(waitId);
                break;
            case ZenithConnectionStateEngine.ActionId.ZenithTokenInterval:
                this.delayZenithTokenRefreshInterval(waitId);
                break;
            case ZenithConnectionStateEngine.ActionId.ZenithTokenRefresh:
                this.refreshZenithToken(waitId);
                break;
            case ZenithConnectionStateEngine.ActionId.SocketClose:
                this.closeSocket(waitId);
                break;
            case ZenithConnectionStateEngine.ActionId.ReconnectDelay:
                this.delayReconnect(waitId);
                break;
            default:
                throw new UnreachableCaseError('ZFSHSEAE13133', actionId);
        }
    }

    private handleStateEngineCameOnlineEvent() {
        const dataMessage = this.createOnlineChangeDataMessage(true, WebsocketCloseCode.nullCode, '', true);
        this._dataMessages.add(dataMessage);
        this._requestEngine.comeOnline();
    }

    private handleStateEngineWentOfflineEvent(socketCloseCode: number, socketCloseReason: string, socketCloseWasClean: boolean) {
        const dataMessage = this.createOnlineChangeDataMessage(false, socketCloseCode, socketCloseReason, socketCloseWasClean);
        this._dataMessages.add(dataMessage);
        const offlinedErrorText = this.generateOfflinedErrorText(socketCloseCode, socketCloseReason);
        let logText = offlinedErrorText;
        if (!socketCloseWasClean) {
            logText += ' (not clean)';
        }
        this.logError(logText);
        this._requestEngine.goOffline(offlinedErrorText);
    }

    private handleStateEngineStateChangeEvent(stateId: ZenithPublisherStateId, waitId: Integer) {
        const dataMessage = this.createStateChangeDataMessage(stateId, waitId);
        this._dataMessages.add(dataMessage);
    }

    private handleStateEngineReconnectEvent(reconnectReasonId: ZenithPublisherReconnectReasonId) {
        const dataMessage = this.createReconnectDataMessage(reconnectReasonId);
        this._dataMessages.add(dataMessage);
    }

    private handleWebsocketOpenEvent() {
        if (this._websocket.openWaitId === this._stateEngine.activeWaitId) {
            this._stateEngine.adviseSocketOpenSuccess();
        }
    }

    private handleWebsocketMessageEvent(message: unknown) {
        this._requestEngine.addPhysicalMessage(message);
        this._receivePacketCount++;
    }

    private handleWebsocketCloseEvent(code: number, reason: string, wasClean: boolean) {
        this.logInfo(`Websocket closed. Code: ${code} Reason: ${reason}`);
        if (code === Zenith.WebSocket.CloseCode.Session) {
            const dataMessage = this.createSessionKickoffDataMessage();
            this._dataMessages.add(dataMessage);
            this._stateEngine.finalise(true);
        } else {
            this._stateEngine.adviseSocketClose(code, reason, wasClean);
        }
    }

    private handleWebsocketErrorEvent(errorType: string) {
        switch (this._websocket.readyState) {
            case ZenithWebsocket.ReadyState.Connecting:
                this.logError(`Websocket connecting error: ${errorType}`);
                this._stateEngine.adviseSocketOpenFailure();
                break;
            case ZenithWebsocket.ReadyState.Open:
                this.logError(`Websocket opened error: ${errorType}`);
                // should we do anything here?
                break;
            case ZenithWebsocket.ReadyState.Closing:
                this.logError(`Websocket closing error: ${errorType}, State: ${this._stateEngine.activeWaitId}`);
                this._stateEngine.adviseSocketCloseFailure();
                break;
            case ZenithWebsocket.ReadyState.Closed:
                this.logError(`Websocket closed error: ${errorType}`);
                break;
        }
    }

    private handleRequestEngineSubscriptionErrorEvent(typeId: PublisherSubscription.ErrorTypeId) {
        switch (typeId) {
            case PublisherSubscription.ErrorTypeId.Internal:
                this._internalSubscriptionErrorCount++;
                break;
            case PublisherSubscription.ErrorTypeId.RequestTimeout:
                this._requestTimeoutSubscriptionErrorCount++;
                break;
            case PublisherSubscription.ErrorTypeId.Offlined:
                this._offlinedSubscriptionErrorCount++;
                break;
            case PublisherSubscription.ErrorTypeId.PublishRequestError:
                this._publishRequestErrorSubscriptionErrorCount++;
                break;
            case PublisherSubscription.ErrorTypeId.SubRequestError:
                this._subRequestErrorSubscriptionErrorCount++;
                break;
            case PublisherSubscription.ErrorTypeId.DataError:
                this._dataErrorSubscriptionErrorCount++;
                break;
            case PublisherSubscription.ErrorTypeId.UserNotAuthorised:
                this._userNotAuthorisedSubscriptionErrorCount++;
                break;
            default:
                throw new UnreachableCaseError('ZFSHRESEEU11185492', typeId);
        }
    }

    private handleRequestEngineServerWarningEvent() {
        this._serverWarningSubscriptionErrorCount++;
    }

    private handleRequestEngineSendPhysicalMessageEvent(message: string) {
        this._websocket.send(message);
        this._sendPacketCount++;
        return ZenithPublisher.defaultResponseTimeoutSpan; // Needs improving - use ZenithQueryConfigure
    }

    private handleRequestEngineAuthMessageReceivedEvent(message: Zenith.MessageContainer) {
        this.processZenithAuthMessageReceived(message);
    }

    private handleCounterInterval() {
        const dataMessage = this.createCounterDataMessage();
        this._dataMessages.add(dataMessage);
    }

    private log(levelId: Logger.LevelId, text: string, loggerAsWell: boolean) {
        const dataMessage = this.createLogDataMessage(new Date(), levelId, text);
        this._dataMessages.add(dataMessage);
        if (loggerAsWell) {
            const loggerText = `Zenith Publisher: ${text}`;
            Logger.log(levelId, loggerText);
        }
    }

    private logInfo(text: string, loggerAsWell = false) {
        this.log(Logger.LevelId.Info, text, loggerAsWell);
    }

    private logWarning(text: string, loggerAsWell = true) {
        this.log(Logger.LevelId.Warning, text, loggerAsWell);
    }

    private logError(text: string, loggerAsWell = true) {
        this.log(Logger.LevelId.Error, text, loggerAsWell);
    }

    private checkClearDelayTimeout() {
        if (this._delayTimeoutHandle !== undefined) {
            clearTimeout(this._delayTimeoutHandle);
            // will either be immediately set again or never used again so no need to undefine.
        }
    }

    private fetchAuthToken(waitId: Integer) {
        if (waitId === this._stateEngine.activeWaitId) {
            if (this._authAccessToken === '') {
                this.logError('AuthAccessToken: Invalid');
                this._stateEngine.adviseAuthFetchFailure();
            } else {
                const provider = Zenith.AuthController.Provider.Bearer;
                if (provider === undefined) {
                    this.logError('MotifServices: Undefined provider');
                    this._stateEngine.adviseAuthFetchFailure();
                } else {
                    this._activeProvider = provider;
                    this._activePassportAccessToken = this._authAccessToken;
                    this._stateEngine.adviseAuthTokenFetchSuccess(provider, this._authAccessToken);
                }
            }
        }
    }

    private processZenithAuthMessageReceived(msg: Zenith.MessageContainer) {
        const transactionId = msg.TransactionID;
        if (transactionId === this._websocket.lastAuthTransactionId) {
            // only process if there had not been any subsequent auth requests sent.
            const waitId = this._websocket.lastAuthWaitId;
            if (waitId === this._stateEngine.activeWaitId) {
                const stateId = this._stateEngine.stateId;
                switch (stateId) {
                    case ZenithPublisherStateId.ZenithTokenFetch:
                        this.processZenithAuthFetchMessageReceived(msg);
                        break;
                    case ZenithPublisherStateId.ZenithTokenRefresh:
                        this.processZenithAuthRefreshMessageReceived(msg);
                        break;
                }
            }
        }
    }

    private fetchAuthOwner(waitId: Integer) {
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');
        const clientId = localStorage.getItem('clientId');

        if (!assigned(clientId)) {
            this.logError('Local storage client Id is not assigned');
            this._stateEngine.adviseAuthFetchFailure();
        } else {
            if (!assigned(username)) {
                this.logError('Local storage username is not assigned');
                this._stateEngine.adviseAuthFetchFailure();
            } else {
                if (!assigned(password)) {
                    this.logError('Local storage password is not assigned');
                    this._stateEngine.adviseAuthFetchFailure();
                } else {
                    const credentials: ZenithConnectionStateEngine.OwnerCredentials = {
                        clientId,
                        password,
                        username,
                    };
                    this._stateEngine.adviseAuthOwnerFetchSuccess(Zenith.AuthController.Provider.BasicAuth, credentials);
                }
            }
        }
    }

    private openSocket(waitId: Integer) {
        this.logInfo('Opening WebSocket: ' + this._stateEngine.zenithEndpoint);
        this._websocket.open(this._stateEngine.zenithEndpoint, waitId);
    }

    private fetchZenithToken(waitId: Integer) {
        switch (this._stateEngine.authenticationTypeId) {
            case ZenithConnectionStateEngine.AuthenticationTypeId.AuthToken:
                this.fetchZenithTokenUsingAuthToken(waitId);
                break;
            case ZenithConnectionStateEngine.AuthenticationTypeId.AuthOwner:
                this.fetchZenithTokenUsingAuthOwner(waitId);
                break;
            default:
                throw new UnreachableCaseError('ZFSFZT125598', this._stateEngine.authenticationTypeId);
        }
    }

    private fetchZenithTokenUsingAuthToken(waitId: Integer) {
        const transactionId = this._requestEngine.getNextTransactionId();
        const provider = this._stateEngine.provider;
        const accessToken = this._stateEngine.accessToken;
        const msgContainer = AuthTokenMessageConvert.createMessage(transactionId, provider, accessToken);
        const msg = JSON.stringify(msgContainer);
        this.logInfo('Fetching Zenith Token using AuthToken');
        this._websocket.sendAuth(msg, transactionId, waitId);
    }

    private fetchZenithTokenUsingAuthOwner(waitId: Integer) {
        const transactionId = this._requestEngine.getNextTransactionId();
        const provider = this._stateEngine.provider;
        const credentials = this._stateEngine.ownerCredentials;
        const msgContainer = AuthOwnerMessageConvert.createMessage(transactionId, provider,
            credentials.username, credentials.password, credentials.clientId);
        const topic: Zenith.AuthController.TopicName = msgContainer.Topic as Zenith.AuthController.TopicName;
        const msg = JSON.stringify(msgContainer);
        this.logInfo(`Fetching Zenith Token using AuthOwner. Username: ${credentials.username}`);
        this._websocket.sendAuth(msg, transactionId, waitId);
    }

    private processZenithAuthFetchMessageReceived(msg: Zenith.MessageContainer) {
        let identify: Zenith.AuthController.Identify | undefined;
        switch (msg.Topic) {
            case Zenith.AuthController.TopicName.AuthToken:
                identify = AuthTokenMessageConvert.parseMessage(msg as Zenith.AuthController.AuthToken.PublishPayloadMessageContainer);
                break;
            case Zenith.AuthController.TopicName.AuthOwner:
                identify = AuthOwnerMessageConvert.parseMessage(msg as Zenith.AuthController.AuthOwner.PublishPayloadMessageContainer);
                break;
            default:
                this.logError('Unexpected Zenith Auth Fetch response topic: "' + msg.Topic + '". Stopping');
                this._stateEngine.adviseZenithTokenFetchFailure(true);
        }

        if (identify === undefined) {
            this.logError('Zenith Auth Fetch response missing data. Stopping');
            this._stateEngine.adviseZenithTokenFetchFailure(true);
        } else {
            if (identify.Result === Zenith.AuthController.IdentifyResult.Rejected) {
                const token = this._activePassportAccessToken ?? '';
                this.logError('Zenith Auth Fetch rejected. Stopping. Active Passport Access Token: "' + token + '"');
                this._stateEngine.adviseZenithTokenFetchFailure(true);
            } else {
                let infoText = '';
                if (identify.UserID !== undefined) {
                    if (infoText !== '') {
                        infoText += '; ';
                    }
                    infoText += `UserId: ${identify.UserID}`;
                }
                if (identify.DisplayName !== undefined) {
                    if (infoText !== '') {
                        infoText += '; ';
                    }
                    infoText += `Name: ${identify.DisplayName}`;
                }
                if (identify.ExpiresIn !== undefined) {
                    if (infoText !== '') {
                        infoText += '; ';
                    }
                    infoText += `Expires In: ${identify.ExpiresIn}`;
                }
                if (identify.ExpiryDate !== undefined) {
                    if (infoText !== '') {
                        infoText += '; ';
                    }
                    infoText += `Expires In: ${identify.ExpiryDate}`;
                }
                this.logInfo(`Zenith Session Details: ${infoText}`);

                if (identify.Scope === undefined) {
                    this.logWarning('Zenith Session Scope: not supplied');
                } else {
                    this.logInfo(`Zenith Session Scope: ${identify.Scope}`);
                }

                if (identify.AccessToken === undefined) {
                    this.logError('Zenith Auth Fetch response missing access token. Stopping');
                    this._stateEngine.adviseZenithTokenFetchFailure(true);
                } else {
                    const expiresInSpan = this.calculateZenithTokenExpiresInSpan(identify.ExpiresIn);
                    const expiryTime = this.calculateZenithTokenExpiryTime(expiresInSpan);
                    this._stateEngine.adviseZenithTokenFetchSuccess(identify.AccessToken, expiryTime);
                }
            }
        }
    }

    private calculateZenithTokenExpiresInSpan(identifyExpiresIn: string | undefined) {
        let result: SysTick.Span;
        if (identifyExpiresIn === undefined) {
            this.logWarning(`Zenith Auth Fetch response missing ExpiresIn. Setting to minimum ` +
                `${ZenithPublisher.minimumAllowedZenithTokenExpiresInInterval}`);
            result = ZenithPublisher.minimumAllowedZenithTokenExpiresInInterval;
        } else {
            const interval = this.parseZenithTokenExpiresInInterval(identifyExpiresIn);
            if (interval === undefined) {
                this.logWarning(`Setting token expiry interval to minimum ` +
                `${ZenithPublisher.minimumAllowedZenithTokenExpiresInInterval}`);
                result = ZenithPublisher.minimumAllowedZenithTokenExpiresInInterval;
            } else {
                result = interval;
            }
        }

        if (result < ZenithPublisher.minimumAllowedZenithTokenExpiresInInterval) {
            this.logWarning(`Zenith Auth Fetch ExpiresIn (${result}) is less than minimum allowed. Setting to minimum ` +
                `${ZenithPublisher.minimumAllowedZenithTokenExpiresInInterval}`);
            result = ZenithPublisher.minimumAllowedZenithTokenExpiresInInterval;
        }
        return result;
    }

    private calculateZenithTokenExpiryTime(expiresInSpan: SysTick.Span) {
        return SysTick.now() + expiresInSpan;
    }

    private parseZenithTokenExpiresInInterval(expiresIn: string) {
        const durationRegEx = /^-?([0-9]{2}):([0-9]{2}):([0-9]{2})\.[0-9]+$/;
        const elements = durationRegEx.exec(expiresIn);
        if (!elements) {
            this.logWarning(`ExpiresIn string cannot be parsed: "${expiresIn}" . [ID:158021124001]`);
            return undefined;
        } else {
            if (expiresIn.startsWith('-')) {
                // The expires in time is negative.
                return 0;
            }
            const [ _, hoursStr, minutesStr, secondsStr ] = elements;
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            const seconds = parseInt(secondsStr, 10);
            const milliseconds = hours * mSecsPerHour + minutes * mSecsPerMin + seconds * mSecsPerSec;
            if (isNaN(milliseconds)) {
                this.logWarning(`ExpiresIn string cannot be parsed: "${expiresIn}" . [ID:158021124002]`);
                return undefined;
            } else {
                return milliseconds;
            }
        }
    }

    private delayZenithTokenRefreshInterval(waitId: Integer) {
        const interval = this.calculateZenithTokenRefreshInterval();
        this.checkClearDelayTimeout();
        this._delayTimeoutHandle = setTimeout(
            () => this.processZenithTokenRefreshIntervalCompletedOrAuthAccessTokenChanged(waitId), interval
        );
    }

    private calculateZenithTokenRefreshInterval() {
        const failureCount = this._stateEngine.zenithTokenRefreshSuccessiveFailureCount;
        let refreshInterval: Integer;
        if (failureCount > 0 && failureCount < 3) {
            refreshInterval = 1 * mSecsPerMin; // If failure occurred, try again 2 times quickly, otherwise go back to normal period
        } else {
            const expiresInInterval = this._stateEngine.accessTokenExpiryTime - SysTick.now();
            refreshInterval = expiresInInterval - 2 * mSecsPerMin; // reduce by 2 minutes
            if (refreshInterval < ZenithPublisher.minimumAllowedZenithTokenRefreshInterval) {
                refreshInterval = ZenithPublisher.minimumAllowedZenithTokenRefreshInterval;
            }
        }
        return refreshInterval;
    }

    private processZenithTokenRefreshIntervalCompletedOrAuthAccessTokenChanged(waitId: Integer) {
        if (waitId === this._stateEngine.activeWaitId) {
            this._stateEngine.adviseZenithTokenInterval();
        }
    }

    private refreshZenithToken(waitId: Integer) {
        switch (this._stateEngine.authenticationTypeId) {
            case ZenithConnectionStateEngine.AuthenticationTypeId.AuthToken:
                this.sendAuthTokenMessage(waitId, 'Bearer', this._authAccessToken);
                break;
            case ZenithConnectionStateEngine.AuthenticationTypeId.AuthOwner:
                this.sendAuthTokenMessage(waitId, this._stateEngine.provider, this._stateEngine.accessToken);
                break;
        }
    }

    private sendAuthTokenMessage(waitId: Integer, provider: string, accessToken: string) {
        if (waitId === this._stateEngine.activeWaitId) {
            const transactionId = this._requestEngine.getNextTransactionId();
            const msgContainer = AuthTokenMessageConvert.createMessage(transactionId, provider, accessToken);
            const msg = JSON.stringify(msgContainer);
            this.logInfo('Refreshing Zenith Token using AuthToken');
            this._websocket.sendAuth(msg, transactionId, waitId);
        }
    }

    private processZenithAuthRefreshMessageReceived(msg: Zenith.MessageContainer) {
        if (msg.Topic !== Zenith.AuthController.TopicName.AuthToken) {
            this.logError('Unexpected Zenith Auth Refresh response topic: "' + msg.Topic);
            this._stateEngine.adviseZenithTokenRefreshFailure(); // allow retry.
        } else {
            const identify = AuthTokenMessageConvert.parseMessage(msg as Zenith.AuthController.AuthToken.PublishPayloadMessageContainer);
            if (identify === undefined) {
                this.logError('Zenith Auth Refresh response missing data');
                this._stateEngine.adviseZenithTokenRefreshFailure(); // allow retry
            } else {
                if (identify.AccessToken === undefined) {
                    this.logError('Zenith Auth Refresh response missing access token');
                    this._stateEngine.adviseZenithTokenRefreshFailure(); // allow retry
                } else {
                    const expiresInSpan = this.calculateZenithTokenExpiresInSpan(identify.ExpiresIn);
                    const expiryTime = this.calculateZenithTokenExpiryTime(expiresInSpan);
                    this._stateEngine.adviseZenithTokenRefreshSuccess(identify.AccessToken, expiryTime);
                }
            }
        }
    }

    private closeSocket(waitId: Integer) {
        let reason: string;
        if (this._stateEngine.finalising) {
            reason = 'NoReconnect';
        } else {
            const reconnectReasonId = this._stateEngine.reconnectReasonId;
            if (reconnectReasonId === undefined) {
                reason = 'Unknown'; // should never happen
            } else {
                reason = `Reconnect_${reconnectReasonId}`;
            }
        }
        this._websocket.close(Zenith.WebSocket.CloseCode.Normal, reason);
    }

    private delayReconnect(waitId: Integer) {
        const span = this.calculateReconnectDelaySpan();
        this.checkClearDelayTimeout();
        this._delayTimeoutHandle = setTimeout(() => this.processReconnectDelayCompleted(waitId), span);
    }

    private calculateReconnectDelaySpan(): SysTick.Span {
        const authFetchSuccessiveFailureCount = this._stateEngine.authFetchSuccessiveFailureCount;
        if (authFetchSuccessiveFailureCount > 0) {
            switch (authFetchSuccessiveFailureCount) {
                case 1: return 500;
                case 2: return 3000;
                case 3: return 6000;
                default: return 20000;
            }
        } else {
            const socketOpenSuccessiveFailureCount = this._stateEngine.socketOpenSuccessiveFailureCount;
            if (socketOpenSuccessiveFailureCount > 0) {
                switch (socketOpenSuccessiveFailureCount) {
                    case 1: return 50;
                    case 2: return 2000;
                    case 3: return 2000;
                    case 4: return 2000;
                    case 5: return 2000;
                    case 6: return 2000;
                    case 7: return 2000;
                    case 8: return 2000;
                    case 9: return 10000;
                    case 10: return 10000;
                    case 11: return 10000;
                    default: return 15000;
                }
            } else {
                const zenithTokenFetchSuccessiveFailureCount = this._stateEngine.zenithTokenFetchSuccessiveFailureCount;
                if (zenithTokenFetchSuccessiveFailureCount > 0) {
                    switch (zenithTokenFetchSuccessiveFailureCount) {
                        case 1: return 3000;
                        case 2: return 3000;
                        case 3: return 6000;
                        default: return 20000;
                    }
                } else {
                    return 50;
                }
            }
        }
    }

    private processReconnectDelayCompleted(waitId: Integer) {
        if (waitId === this._stateEngine.activeWaitId) {
            this._stateEngine.adviseReconnectDelayCompleted();
        }
    }

    private generateOfflinedErrorText(socketCloseCode: number, socketCloseReason: string) {
        const codeId = WebsocketCloseCode.tryCodeToId(socketCloseCode);
        let message: string;
        if (codeId !== undefined) {
            message = `${WebsocketCloseCode.idToDisplay(codeId)} (${socketCloseCode.toString()})`;
        } else {
            message = socketCloseCode.toString();
        }

        if (socketCloseReason.length !== 0) {
            message += `, ${socketCloseReason}`;
        }
        return message;
    }

    private createSynchronisedDataMessage() {
        return new SynchronisedPublisherSubscriptionDataMessage(this._connectionDataItemId,
            this._connectionDataItemRequestNr, false);
    }

    private createOnlineChangeDataMessage(online: boolean, socketCloseCode: number, socketCloseReason: string,
        socketCloseWasClean: boolean
    ) {
        const dataMessage = new ZenithPublisherOnlineChangeDataMessage();
        dataMessage.dataItemId = this._connectionDataItemId;
        dataMessage.dataItemRequestNr = this._connectionDataItemRequestNr;
        dataMessage.online = online;
        dataMessage.socketCloseCode = socketCloseCode;
        dataMessage.socketCloseReason = socketCloseReason;
        dataMessage.socketCloseWasClean = socketCloseWasClean;
        return dataMessage;
    }

    private createStateChangeDataMessage(stateId: ZenithPublisherStateId, waitId: Integer) {
        const dataMessage = new ZenithPublisherStateChangeDataMessage();
        dataMessage.dataItemId = this._connectionDataItemId;
        dataMessage.dataItemRequestNr = this._connectionDataItemRequestNr;
        dataMessage.stateId = stateId;
        dataMessage.waitId = waitId;
        return dataMessage;
    }

    private createReconnectDataMessage(reconnectReasonId: ZenithPublisherReconnectReasonId) {
        const dataMessage = new ZenithReconnectDataMessage();
        dataMessage.dataItemId = this._connectionDataItemId;
        dataMessage.dataItemRequestNr = this._connectionDataItemRequestNr;
        dataMessage.reconnectReasonId = reconnectReasonId;
        return dataMessage;
    }

    private createLogDataMessage(time: Date, levelId: Logger.LevelId, text: string) {
        const dataMessage = new ZenithLogDataMessage();
        dataMessage.dataItemId = this._connectionDataItemId;
        dataMessage.dataItemRequestNr = this._connectionDataItemRequestNr;
        dataMessage.time = new Date();
        dataMessage.levelId = levelId;
        dataMessage.text = text;
        return dataMessage;
    }

    private createCounterDataMessage() {
        const dataMessage = new ZenithCounterDataMessage();
        dataMessage.dataItemId = this._connectionDataItemId;
        dataMessage.dataItemRequestNr = this._connectionDataItemRequestNr;

        dataMessage.accessTokenExpiryTime = this._stateEngine.accessTokenExpiryTime;
        dataMessage.authFetchSuccessiveFailureCount = this._stateEngine.authFetchSuccessiveFailureCount;
        dataMessage.socketOpenSuccessiveFailureCount = this._stateEngine.socketOpenSuccessiveFailureCount;
        dataMessage.zenithTokenFetchSuccessiveFailureCount = this._stateEngine.zenithTokenFetchSuccessiveFailureCount;
        dataMessage.zenithTokenRefreshSuccessiveFailureCount = this._stateEngine.zenithTokenRefreshSuccessiveFailureCount;
        dataMessage.socketCloseSuccessiveFailureCount = this._stateEngine.socketCloseSuccessiveFailureCount;
        dataMessage.unexpectedSocketCloseCount = this._stateEngine.unexpectedSocketCloseCount;
        dataMessage.timeoutCount = this._stateEngine.timeoutCount;
        dataMessage.lastTimeoutStateId = this._stateEngine.lastTimeoutStateId;
        dataMessage.receivePacketCount = this._receivePacketCount;
        dataMessage.sendPacketCount = this._sendPacketCount;
        dataMessage.internalSubscriptionErrorCount = this._internalSubscriptionErrorCount;
        dataMessage.requestTimeoutSubscriptionErrorCount = this._requestTimeoutSubscriptionErrorCount;
        dataMessage.offlinedSubscriptionErrorCount = this._offlinedSubscriptionErrorCount;
        dataMessage.publishRequestErrorSubscriptionErrorCount = this._publishRequestErrorSubscriptionErrorCount;
        dataMessage.subRequestErrorSubscriptionErrorCount = this._subRequestErrorSubscriptionErrorCount;
        dataMessage.dataErrorSubscriptionErrorCount = this._dataErrorSubscriptionErrorCount;
        dataMessage.userNotAuthorisedSubscriptionErrorCount = this._userNotAuthorisedSubscriptionErrorCount;
        dataMessage.serverWarningSubscriptionErrorCount = this._serverWarningSubscriptionErrorCount;
        return dataMessage;
    }

    private createSessionKickoffDataMessage() {
        const dataMessage = new ZenithSessionKickedOffDataMessage();
        dataMessage.dataItemId = this._connectionDataItemId;
        dataMessage.dataItemRequestNr = this._connectionDataItemRequestNr;
        return dataMessage;
    }
}

export namespace ZenithPublisher {
    export const minimumAllowedZenithTokenExpiresInInterval = 3 * mSecsPerMin;
    export const minimumAllowedZenithTokenRefreshInterval = 1 * mSecsPerMin;
    export const counterDataMessageInterval = 1 * mSecsPerSec;

    // Needs improving - use ZenithQueryConfigure
    export const defaultResponseTimeoutSpan = 2 * mSecsPerMin;
}
