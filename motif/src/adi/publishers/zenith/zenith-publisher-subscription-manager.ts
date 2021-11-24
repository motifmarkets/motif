/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'res-internal-api';
import {
    AssertInternalError,
    ExternalError,
    Integer,
    Logger,
    MapKey,
    newNowDate,
    SysTick,
    UnexpectedCaseError,
    UnreachableCaseError,
    ZenithDataError
} from 'sys-internal-api';
import {
    DataMessage,
    DataMessages,

    ErrorPublisherSubscriptionDataMessage,

    ErrorPublisherSubscriptionDataMessage_PublishRequestError,
    ErrorPublisherSubscriptionDataMessage_SubRequestError,
    ErrorPublisherSubscriptionDataMessage_UserNotAuthorised,
    PublisherRequest,
    PublisherSubscription,
    WarningPublisherSubscriptionDataMessage
} from '../../common/internal-api';
import { PublisherSubscriptionManager } from '../../publisher-subscription-manager';
import { Zenith } from './physical-message/zenith';
import { ZenithConvert } from './physical-message/zenith-convert';
import { ZenithMessageConvert } from './physical-message/zenith-message-convert';

export class ZenithPublisherSubscriptionManager extends PublisherSubscriptionManager {
    sendPhysicalMessageEvent: ZenithPublisherSubscriptionManager.SendPhysicalMessageEvent;
    authMessageReceivedEvent: ZenithPublisherSubscriptionManager.AuthMessageReceivedEvent;

    // TODO:MED Replace array with a list so that memory is not being constantly requested and released.
    private _physicalMessages: Zenith.PhysicalMessage[] = [];

    addPhysicalMessage(message: unknown): void {
        if (typeof message === 'string') {
            this._physicalMessages.push(message);
            this.checkLogMessage(message, true);
        } else {
            // Unexpected message type.
            throw new AssertInternalError('FSREZAPM28883');
        }
    }

    override exercise(nowTickTime: SysTick.Time): DataMessages | undefined {
        const exerciseMessages = super.exercise(nowTickTime);

        const dataMessages = exerciseMessages !== undefined
            ? exerciseMessages
            : new DataMessages();

        if (this._physicalMessages.length > 0) {
            try {
                for (let c1 = 0; c1 < this._physicalMessages.length; c1++) {
                    const msg = this._physicalMessages[c1];
                    const dm: DataMessage[] = this.processPhysicalMessage(msg);
                    for (let c2 = 0; c2 < dm.length; c2++) {
                        dataMessages.add(dm[c2]);
                    }
                }
            } finally {
                // delete messages even if an exception has occurred.  Otherwise loops forever
                this._physicalMessages.length = 0;
            }
        }
        return (dataMessages && dataMessages.count > 0) ? dataMessages : undefined;
    }

    protected activateSubscription(subscription: PublisherSubscription) {
        const request = this.createRequest(subscription, PublisherRequest.TypeId.SubscribeQuery);
        this.queueRequestForSending(request);
    }

    protected deactivateSubscription(subscription: PublisherSubscription) {
        // Note that if unsubscribing, then subscription has already been deregistered with PublisherSubscriptionManager
        if (subscription.unsubscribeRequired) { // do not unsubscribe Publisher requests
            const request = this.createRequest(subscription, PublisherRequest.TypeId.Unsubscribe);
            this.queueRequestForSending(request);
            subscription.unsubscribeRequired = false;
        }
    }

    // Count: Process `Count` number of subscriptions in the `SendQueue`. Remaining subscriptions in list will be processed in
    // subsequent calls. This allows the request engine to throttle the outgoing packets if required.
    protected sendPackets(nowTickTime: SysTick.Time, sendQueue: PublisherSubscriptionManager.SendQueue, count: number) {
        for (let index = 0; index < count; index++) {
            const request = sendQueue.getItem(index);
            const subscription = request.subscription;

            if (!subscription.resendAllowed && subscription.beenSentAtLeastOnce) {
                throw new AssertInternalError('ZPSMSP8787323910', subscription.dataDefinition.description);
            } else {
                const requestMsg = ZenithMessageConvert.createRequestMessage(request);

                let actionId = ZenithConvert.MessageContainer.Action.tryActionToId(requestMsg.Action);
                if (actionId === undefined) {
                    actionId = ZenithConvert.MessageContainer.Action.Id.Publish; // as per spec
                }
                let messageMapKey: MapKey | undefined;
                switch (actionId) {
                    case ZenithConvert.MessageContainer.Action.Id.Publish:
                        messageMapKey = this.calculatePublishMessageMapKey(requestMsg);
                        break;
                    case ZenithConvert.MessageContainer.Action.Id.Sub:
                        requestMsg.Confirm = true;
                        messageMapKey = this.calculateSubMessageMapKey(requestMsg);
                        subscription.unsubscribeRequired = true;
                        break;
                    case ZenithConvert.MessageContainer.Action.Id.Unsub:
                        // not expecting a reply
                        requestMsg.Confirm = false;
                        messageMapKey = undefined;
                        // Unsub subscriptions are either:
                        // 1) no longer registered in PublisherRequestEngine and can be ignored, or
                        // 2) timed out and will have their state managed as part of timed out process
                        break;
                    default:
                        throw new UnexpectedCaseError('ZPSMSPA69482228', actionId.toString(10));
                }
                subscription.beenSentAtLeastOnce = true;

                const physicalMessage = JSON.stringify(requestMsg);

                const responseTimeoutTickSpan = this.sendPhysicalMessageEvent(physicalMessage);

                if (messageMapKey !== undefined) {
                    this.waitResponse(nowTickTime, request, messageMapKey, responseTimeoutTickSpan);
                }

                this.checkLogMessage(physicalMessage, false);
            }
        }
    }

    private calculatePublishMessageMapKey(msg: Zenith.MessageContainer) {
        const transactionId = msg.TransactionID;
        if (transactionId === undefined) {
            throw new AssertInternalError('ZPSMSPT1199948243', JSON.stringify(msg));
        } else {
            return transactionId.toString(10);
        }
    }

    private calculateSubMessageMapKey(msg: Zenith.MessageContainer) {
        return msg.Controller + '+' + msg.Topic;
    }

    private calculateErrorSubscription(msg: Zenith.ResponseUpdateMessageContainer) {
        let subscription: PublisherSubscription | undefined;
        const transactionId = msg.TransactionID;
        if (transactionId === undefined) {
            // must be sub
            const subMsgMapKey = this.calculateSubMessageMapKey(msg);
            subscription = this.subscriptionByMessageMap.get(subMsgMapKey);
        } else {
            // assume publish
            const publishMsgMapKey = this.calculatePublishMessageMapKey(msg);
            subscription = this.subscriptionByMessageMap.get(publishMsgMapKey);
            if (subscription === undefined) {
                // try sub
                const subMsgMapKey = this.calculateSubMessageMapKey(msg);
                subscription = this.subscriptionByMessageMap.get(subMsgMapKey);
            }
        }

        return subscription;
    }

    private processPhysicalMessage(message: Zenith.PhysicalMessage): DataMessage[] {
        const parsedMessage = JSON.parse(message) as Zenith.ResponseUpdateMessageContainer;

        if (parsedMessage.Controller === Zenith.MessageContainer.Controller.Auth) {
            this.authMessageReceivedEvent(parsedMessage);
            return [];
        } else {
            let actionId = ZenithConvert.MessageContainer.Action.tryActionToId(parsedMessage.Action);

            if (actionId === undefined) {
                if (parsedMessage.TransactionID !== undefined) {
                    actionId = ZenithConvert.MessageContainer.Action.Id.Publish;
                } else {
                    actionId = ZenithConvert.MessageContainer.Action.Id.Sub;
                }
            }

            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish: {
                    const msgMapKey = this.calculatePublishMessageMapKey(parsedMessage);
                    const subscription = this.subscriptionByMessageMap.get(msgMapKey);
                    if (subscription === undefined) {
                        return []; // was previously unsubscribed with unsubscribeDataItem()
                    } else {
                        const data = parsedMessage.Data;
                        const error = this.checkGetResponseUpdateMessageError(data, PublisherSubscription.ErrorTypeId.PublishRequestError);
                        if (error !== undefined) {
                            const errorDataMessage = this.createSubscriptionErrorDataMessage(subscription, parsedMessage, error);
                            this.processErrorMessage(errorDataMessage, subscription);
                            return [errorDataMessage];
                        } else {
                            const dataMessage = ZenithMessageConvert.createDataMessage(subscription, parsedMessage, actionId);
                            if (DataMessage.isErrorPublisherSubscriptionDataMessage(dataMessage)) {
                                // probably data error
                                this.processErrorMessage(dataMessage, subscription);
                                return [dataMessage];
                            } else {
                                this.deleteSubscription(subscription, true); // remove from manager as will not need after this
                                const syncDataMessage = this.createSynchronisedDataMessage(subscription, true);
                                return [dataMessage, syncDataMessage];
                            }
                        }
                    }
                }

                case ZenithConvert.MessageContainer.Action.Id.Sub: {
                    const msgMapKey = this.calculateSubMessageMapKey(parsedMessage);
                    const subscription = this.subscriptionByMessageMap.get(msgMapKey);
                    if (subscription === undefined) {
                        return []; // was previously unsubscribed with unsubscribeDataItem()
                    } else {
                        if (parsedMessage.Confirm === true) {
                            // is confirmation
                            if (subscription.stateId !== PublisherSubscription.StateId.ResponseWaiting) {
                                return []; // must have received a server initiated unsub
                            } else {
                                this.moveSubscriptionFromResponseWaitingToSubscribed(subscription);
                                const syncDataMessage = this.createSynchronisedDataMessage(subscription, false);
                                return [syncDataMessage];
                            }
                        } else {
                            const data = parsedMessage.Data;
                            const error = this.checkGetResponseUpdateMessageError(data, PublisherSubscription.ErrorTypeId.SubRequestError);
                            if (error !== undefined) {
                                // Is error message
                                const errorDataMessage = this.createSubscriptionErrorDataMessage(subscription, parsedMessage, error);
                                this.processErrorMessage(errorDataMessage, subscription);
                                return [errorDataMessage];
                            } else {
                                // Has data. Do not change change subscription state unless data message is error
                                const dataMessage = ZenithMessageConvert.createDataMessage(subscription, parsedMessage, actionId);

                                if (DataMessage.isErrorPublisherSubscriptionDataMessage(dataMessage)) {
                                    // probably data error
                                    this.processErrorMessage(dataMessage, subscription);
                                }

                                return [dataMessage];
                            }
                        }
                    }
                }

                case ZenithConvert.MessageContainer.Action.Id.Unsub: {
                    const unsubMsgMapKey = this.calculateSubMessageMapKey(parsedMessage);
                    const unsubSubscription = this.subscriptionByMessageMap.get(unsubMsgMapKey);
                    if (unsubSubscription === undefined) {
                        return []; // has already been unsubscribed
                    } else {
                        if (parsedMessage.Confirm === true) {
                            // data does not in exist (eg. the symbol was deleted) or you don't have access, or similar

                            let error = this.checkGetResponseUpdateMessageError(parsedMessage.Data,
                                PublisherSubscription.ErrorTypeId.UserNotAuthorised);
                            if (error === undefined) {
                                // Unexpected. Use default UserNotAuthorised error
                                error = {
                                    texts: [],
                                    errorTypeId: PublisherSubscription.ErrorTypeId.UserNotAuthorised,
                                    delayRetryAllowedSpecified: false,
                                    limitedSpecified: false,
                                };
                            }
                            this.notifySubscriptionError(error.errorTypeId);
                            const errorDataMessage = this.createSubscriptionErrorDataMessage(unsubSubscription, parsedMessage, error);

                            if (errorDataMessage.allowedRetryTypeId === PublisherSubscription.AllowedRetryTypeId.Never) {
                                this.deleteSubscription(unsubSubscription, true);
                            } else {
                                this.moveSubscriptionFromResponseWaitingToInactive(unsubSubscription);
                            }
                            return [errorDataMessage];
                        } else {
                            // we never ask for confirmations of unsubscribes so this is an error
                            throw new ZenithDataError(ExternalError.Code.ZPSMPPM2994344434, JSON.stringify(parsedMessage));
                        }
                    }
                }

                case ZenithConvert.MessageContainer.Action.Id.Error: {
                    const errorSubscription = this.calculateErrorSubscription(parsedMessage);
                    if (errorSubscription === undefined) {
                        // already unsubscribed
                        return [];
                    } else {
                        let errorTexts = this.checkGetResponseUpdateMessageErrorTexts(parsedMessage.Data);
                        if (errorTexts === undefined) {
                            // If no texts, get default texts for Server Warnings
                            errorTexts = [Strings[StringId.BadnessReasonId_PublisherServerWarning]];
                        }
                        this.notifyServerWarning();
                        const errorDataMessage = this.createSubscriptionWarningDataMessage(errorSubscription, parsedMessage, errorTexts);
                        return [errorDataMessage];
                    }
                }

                case ZenithConvert.MessageContainer.Action.Id.Cancel:
                    throw new ZenithDataError(ExternalError.Code.ZPSMPPM23230917111, JSON.stringify(parsedMessage));

                default:
                    throw new UnreachableCaseError('ZFRESPD77830922', actionId);
            }
        }
    }

    private processErrorMessage(dataMessage: ErrorPublisherSubscriptionDataMessage, subscription: PublisherSubscription) {
        this.notifySubscriptionError(dataMessage.errorTypeId);

        if (dataMessage.allowedRetryTypeId === PublisherSubscription.AllowedRetryTypeId.Never) {
            this.deleteSubscription(subscription, true);
        } else {
            this.moveSubscriptionFromResponseWaitingToInactive(subscription);
        }
    }

    private checkGetResponseUpdateMessageError(data: Zenith.ResponseUpdateMessageContainer.Data,
        actionErrorTypeId: PublisherSubscription.ErrorTypeId
    ) {
        if (data === undefined || data === null) {
            if (actionErrorTypeId === PublisherSubscription.ErrorTypeId.PublishRequestError) {
                return undefined; // for publish responses, data can be undefined or null
            } else {
                const error: ZenithPublisherSubscriptionManager.ResponseUpdateMessageError = {
                    texts: [],
                    errorTypeId: PublisherSubscription.ErrorTypeId.UserNotAuthorised,
                    delayRetryAllowedSpecified: false,
                    limitedSpecified: false,
                };
                return error;
            }

        } else {
            const texts = this.checkGetResponseUpdateMessageErrorTexts(data);

            if (texts === undefined) {
                return undefined;
            } else {
                let delayRetryAllowedSpecified = false;
                let limitedSpecified = false;
                for (let i = 0; i < texts.length; i++) {
                    const text = texts[i];
                    switch (text) {
                        case Zenith.ResponseUpdateMessageContainer.Error.Code.Retry:
                            delayRetryAllowedSpecified = true;
                            break;
                        case Zenith.ResponseUpdateMessageContainer.Error.Code.Limited:
                            limitedSpecified = true;
                            break;
                    }
                }
                const error: ZenithPublisherSubscriptionManager.ResponseUpdateMessageError = {
                    texts,
                    errorTypeId: actionErrorTypeId,
                    delayRetryAllowedSpecified,
                    limitedSpecified,
                };
                return error;
            }
        }
    }

    private checkGetResponseUpdateMessageErrorTexts(data: Zenith.ResponseUpdateMessageContainer.Data) {
        if (typeof data === 'string') {
            return [data];
        } else {
            if (data instanceof Array && data.length > 0 && typeof data[0] === 'string') {
                return data as string[];
            } else {
                return undefined;
            }
        }
    }

    private createSubscriptionErrorDataMessage(subscription: PublisherSubscription, zenithMsg: Zenith.ResponseUpdateMessageContainer,
        error: ZenithPublisherSubscriptionManager.ResponseUpdateMessageError
    ) {
        const errorTypeId = error.errorTypeId;

        const dataItemId = subscription.dataItemId;
        const dataItemRequestNr = subscription.dataItemRequestNr;
        const controller = zenithMsg.Controller ?? '';
        const topic = zenithMsg.Topic ?? '';

        const controllerTopic = controller + '/' + topic;
        const joinedErrorTexts = error.texts.join();
        const errorText = `${joinedErrorTexts} (${controllerTopic})`;

        let allowedRetryTypeId: PublisherSubscription.AllowedRetryTypeId;
        if (errorTypeId === PublisherSubscription.ErrorTypeId.UserNotAuthorised) {
            allowedRetryTypeId = PublisherSubscription.AllowedRetryTypeId.Never;
        } else {
            if (error.delayRetryAllowedSpecified) {
                allowedRetryTypeId = PublisherSubscription.AllowedRetryTypeId.Delay;
            } else {
                allowedRetryTypeId = PublisherSubscription.AllowedRetryTypeId.SubscribabilityIncrease;
            }
        }

        let msg: ErrorPublisherSubscriptionDataMessage;

        switch (errorTypeId) {
            case PublisherSubscription.ErrorTypeId.PublishRequestError:
                msg = new ErrorPublisherSubscriptionDataMessage_PublishRequestError(dataItemId, dataItemRequestNr,
                    errorText, allowedRetryTypeId);
                break;
            case PublisherSubscription.ErrorTypeId.SubRequestError:
                msg = new ErrorPublisherSubscriptionDataMessage_SubRequestError(dataItemId, dataItemRequestNr,
                    errorText, allowedRetryTypeId);
                break;
            case PublisherSubscription.ErrorTypeId.UserNotAuthorised:
                msg = new ErrorPublisherSubscriptionDataMessage_UserNotAuthorised(dataItemId, dataItemRequestNr, errorText);
                break;

            case PublisherSubscription.ErrorTypeId.DataError:
            case PublisherSubscription.ErrorTypeId.Internal:
            case PublisherSubscription.ErrorTypeId.RequestTimeout:
            case PublisherSubscription.ErrorTypeId.Offlined:
                throw new AssertInternalError('ZPSMCSEDMC1004873773', errorTypeId.toString());
        }
        return msg;
    }

    private createSubscriptionWarningDataMessage(subscription: PublisherSubscription, zenithMsg: Zenith.ResponseUpdateMessageContainer,
        errorArray: string[]
    ) {
        const dataItemId = subscription.dataItemId;
        const dataItemRequestNr = subscription.dataItemRequestNr;
        const controller = zenithMsg.Controller ?? '';
        const topic = zenithMsg.Topic ?? '';

        const controllerTopic = controller + '/' + topic;
        const errorText = errorArray.join();
        const fullErrorText = `${errorText} (${controllerTopic})`;

        const msg = new WarningPublisherSubscriptionDataMessage(dataItemId, dataItemRequestNr, fullErrorText);
        return msg;
    }

    private checkLogMessage(message: string, incoming: boolean) {
        switch (ZenithPublisherSubscriptionManager.logLevelId) {
            case ZenithPublisherSubscriptionManager.LogLevelId.Off:
                return;
            case ZenithPublisherSubscriptionManager.LogLevelId.Partial: {
                const nowTime = newNowDate();
                const nowTimeStr = ZenithPublisherSubscriptionManager.logTimeFormat.format(nowTime);
                const directionStr = incoming ? '<-- ' : '--> ';
                Logger.logDebug(`${nowTimeStr} Zenith ${directionStr}${message}`, 120);
                return;
            }
            case ZenithPublisherSubscriptionManager.LogLevelId.Full: {
                const nowTime = newNowDate();
                const nowTimeStr = ZenithPublisherSubscriptionManager.logTimeFormat.format(nowTime);
                const directionStr = incoming ? '<-- ' : '--> ';
                Logger.logDebug(`${nowTimeStr} Zenith ${directionStr}${message}`);
                return;
            }
            default:
                throw new UnreachableCaseError('ZPSMCLM6994822778', ZenithPublisherSubscriptionManager.logLevelId);
        }
    }
}

export namespace ZenithPublisherSubscriptionManager {
    export type AuthMessageReceivedEvent = (this: void, message: Zenith.MessageContainer) => void;
    export type SendPhysicalMessageEvent = (this: void, message: string) => Integer; // returns response timeout TickSpan

    export const enum LogLevelId {
        Off,      // No messages are logged.
        Partial,  // All outgoing messages are logged. The first incoming message for each request is logged.
        Full,     // Add outgoing and incoming messages are logged.
    }

    export const defaultLogLevelId = LogLevelId.Off;
    // eslint-disable-next-line prefer-const
    export let logLevelId: LogLevelId = defaultLogLevelId;

    export const logTimeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
    };

    export const logTimeFormat = new Intl.DateTimeFormat(undefined, logTimeOptions);

    export interface ResponseUpdateMessageError {
        readonly texts: string[];
        readonly errorTypeId: PublisherSubscription.ErrorTypeId;
        readonly delayRetryAllowedSpecified: boolean;
        readonly limitedSpecified: boolean;
    }
}
