/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError,
    Badness,
    ComparableList,
    EnumInfoOutOfOrderError,
    Integer,
    Logger,
    MapKey,
    mSecsPerSec,
    secsPerMin,
    SysTick,
    UnreachableCaseError
} from 'src/sys/internal-api';
import {
    DataItemId,
    DataMessages,
    ErrorPublisherSubscriptionDataMessage_Internal,
    ErrorPublisherSubscriptionDataMessage_Offlined,
    ErrorPublisherSubscriptionDataMessage_RequestTimeout,
    invalidDataItemRequestNr,
    OffliningPublisherSubscriptionDataMessage,
    OnlinedPublisherSubscriptionDataMessage,
    PublisherRequest,
    PublisherSubscription,
    PublisherSubscriptionDataDefinition,
    PublisherSubscriptionDelayRetryAlgorithmId,
    SynchronisedPublisherSubscriptionDataMessage
} from './common/internal-api';

export abstract class PublisherSubscriptionManager {
    subscriptionErrorEvent: PublisherSubscriptionManager.SubscriptionErrorEvent;
    serverWarningEvent: PublisherSubscriptionManager.ServerWarningEvent;

    private _subscriptionByDataItemIdMap = new Map<DataItemId, PublisherSubscription>();
    private _subscriptionByMessageMap = new Map<MapKey, PublisherSubscription>();
    private _highPrioritySendQueue = new PublisherSubscriptionManager.SendQueue(PublisherSubscription.RequestSendPriorityId.High);
    private _normalSendQueue = new PublisherSubscriptionManager.SendQueue(PublisherSubscription.RequestSendPriorityId.Normal);
    private _responseWaitList = new PublisherSubscriptionManager.WaitList(PublisherRequest.compareResponseTimeoutTime);

    private _exerciseDataMessages: PublisherSubscriptionManager.ExerciseDataMessageList;

    private _online = false;
    private _offlineDeactivating = false;
    private _finalised = false;

    protected get subscriptionByMessageMap() { return this._subscriptionByMessageMap; }

    get subscriptionCount() { return this._subscriptionByDataItemIdMap.size; }

    constructor() {
        this._exerciseDataMessages = new PublisherSubscriptionManager.ExerciseDataMessageList();
    }

    finalise() {
        Logger.logInfo('PublisherRequestEngine finalising');

        this._highPrioritySendQueue.clear();
        this._normalSendQueue.clear();
        this._responseWaitList.clear();

        this._subscriptionByDataItemIdMap.clear();
        this._subscriptionByMessageMap.clear();

        this._finalised = this._subscriptionByDataItemIdMap.size === 0; // should always be true

        return this._finalised;
    }

    subscribeDataItemId(
        dataItemId: DataItemId,
        dataDefinition: PublisherSubscriptionDataDefinition,
    ) {
        let subscription = this._subscriptionByDataItemIdMap.get(dataItemId);
        if (subscription !== undefined) {
            throw new AssertInternalError('FSRES2000020020200', dataDefinition.description);
        } else {
            const resendAllowed = dataDefinition.subscribabilityIncreaseRetryAllowed ||
                dataDefinition.delayRetryAlgorithmId !== PublisherSubscriptionDelayRetryAlgorithmId.Never;

            subscription = {
                dataItemId,
                dataItemRequestNr: invalidDataItemRequestNr,
                dataDefinition,
                resendAllowed,
                stateId: PublisherSubscription.StateId.Inactive,
                unsubscribeRequired: false,
                beenSentAtLeastOnce: false,
                activeMessageMapKey: '',
            };
            this._subscriptionByDataItemIdMap.set(subscription.dataItemId, subscription);

            return this._online;
        }
    }

    unsubscribeDataItemId(dataItemId: DataItemId) {
        const subscription = this._subscriptionByDataItemIdMap.get(dataItemId);
        if (subscription !== undefined) {
            const stateId = subscription.stateId;
            this.deleteSubscription(subscription, true);
            // subscription is no longer registered.  Only used to send unsubscribe (if necessary) and then will become unreferenced
            this.deactivateSubscription(subscription);
        }
    }

    activateDataItem(dataItemId: DataItemId, dataItemRequestNr: Integer) {
        const subscription = this._subscriptionByDataItemIdMap.get(dataItemId);
        if (subscription === undefined) {
            throw new AssertInternalError('PSMA11118844239');
        } else {
            if (this._offlineDeactivating) {
                throw new AssertInternalError('PSMSDI1999964482', subscription.dataDefinition.description);
            } else {
                subscription.dataItemRequestNr = dataItemRequestNr;
                this.activateSubscription(subscription);
                this.tryCatchProcessSendQueues();
            }
        }
    }

    setBatchNormalRequests(value: boolean) {
        this._normalSendQueue.batchingActive = value;
    }

    exercise(nowTickTime: SysTick.Time): DataMessages | undefined {
        try {
            this.processResponseWaitList(nowTickTime);
            this.processSendQueues(nowTickTime);
        } catch (e) {
            this.purgeSubscriptionsWithInternalError(e.message);
            throw (e);
        }

        let result: DataMessages | undefined;
        if (this._exerciseDataMessages.count <= 0) {
            result = undefined;
        } else {
            result = this._exerciseDataMessages;
            this._exerciseDataMessages = new PublisherSubscriptionManager.ExerciseDataMessageList();
        }
        return result;
    }

    getNextTransactionId() {
        // could be made static if necessary
        return PublisherRequest.getNextTransactionId();
    }

    comeOnline() {
        this._online = true;
        this.sendOnlinedMessages();
    }

    goOffline(offlinedErrorText: string) {
        this._online = false;

        this._offlineDeactivating = true;
        try {
            if (!this._finalised) {
                this.sendOffliningMessages();
                this.offlineSubscriptions(offlinedErrorText);
            }
        } finally {
            this._offlineDeactivating = false;
        }
    }

    protected notifySubscriptionError(typeId: PublisherSubscription.ErrorTypeId) {
        this.subscriptionErrorEvent(typeId);
    }

    protected notifyServerWarning() {
        this.serverWarningEvent();
    }

    protected deleteSubscription(subscription: PublisherSubscription, fromStateQueueWaitList: boolean) {
        this._subscriptionByDataItemIdMap.delete(subscription.dataItemId);

        if (subscription.activeMessageMapKey !== undefined) {
            this._subscriptionByMessageMap.delete(subscription.activeMessageMapKey);
        }

        if (fromStateQueueWaitList) {
            switch (subscription.stateId) {
                case PublisherSubscription.StateId.Inactive:
                    // no list or queue to delete from
                    break;
                case PublisherSubscription.StateId.HighPrioritySendQueued:
                    const highPriorityIndex = this._highPrioritySendQueue.indexOfSubscription(subscription);
                    if (highPriorityIndex >= 0) {
                        this._highPrioritySendQueue.removeAtIndex(highPriorityIndex);
                    } else {
                        throw new AssertInternalError('FSREDSH6021119444', subscription.dataDefinition.description);
                    }
                    break;
                case PublisherSubscription.StateId.NormalSendQueued:
                    const normalIndex = this._normalSendQueue.indexOfSubscription(subscription);
                    if (normalIndex >= 0) {
                        this._normalSendQueue.removeAtIndex(normalIndex);
                    } else {
                        throw new AssertInternalError('FSREDSN6021119444', subscription.dataDefinition.description);
                    }
                    break;
                case PublisherSubscription.StateId.ResponseWaiting:
                    const reponseIndex = this._responseWaitList.indexOfSubscription(subscription);
                    if (reponseIndex >= 0) {
                        this._responseWaitList.removeAtIndex(reponseIndex);
                    } else {
                        throw new AssertInternalError('FSREDSP6021119441', subscription.dataDefinition.description);
                    }
                    break;
                case PublisherSubscription.StateId.Subscribed:
                    // no specific list for Subscribed
                    break;
                default:
                    throw new UnreachableCaseError('FSREDS0773891052999', subscription.stateId);
            }
        }
    }

    protected createRequest(subscription: PublisherSubscription, requestTypeId: PublisherRequest.TypeId) {
        const request: PublisherRequest = {
            typeId: requestTypeId,
            subscription,
            responseTimeoutSpan: 0,
            responseTimeoutTime: 0,
        };
        return request;
    }

    protected queueRequestForSending(request: PublisherRequest) {
        const subscription = request.subscription;
        // requests for a subscription (including unsubscribe) must always be made from same queue so they remain serialised
        const priorityId = subscription.dataDefinition.publisherRequestSendPriorityId;
        switch (priorityId) {
            case PublisherSubscription.RequestSendPriorityId.High:
                this._highPrioritySendQueue.add(request);
                subscription.stateId = PublisherSubscription.StateId.HighPrioritySendQueued;
                break;
            case PublisherSubscription.RequestSendPriorityId.Normal:
                this._normalSendQueue.add(request);
                subscription.stateId = PublisherSubscription.StateId.NormalSendQueued;
                break;
            default:
                throw new UnreachableCaseError('FSREQR55495728', priorityId);
        }
    }

    protected waitResponse(nowTickTime: SysTick.Time, request: PublisherRequest, messageMapKey: MapKey,
        responseTimeoutTickSpan: SysTick.Span
    ) {
        const subscription = request.subscription;
        if (!PublisherSubscription.State.idIsSendQueued(subscription.stateId)) {
            throw new AssertInternalError('FSREWR44493949444', subscription.stateId.toString(10));
        } else {
            // need to store message MapKey in subscription to handle unsubscribe
            request.subscription.activeMessageMapKey = messageMapKey;
            this.subscriptionByMessageMap.set(messageMapKey, request.subscription);
            request.responseTimeoutSpan = responseTimeoutTickSpan;
            request.responseTimeoutTime = nowTickTime + responseTimeoutTickSpan;
            request.subscription.stateId = PublisherSubscription.StateId.ResponseWaiting;
            this._responseWaitList.add(request);
        }
    }

    protected moveSubscriptionFromResponseWaitingToSubscribed(subscription: PublisherSubscription) {
        this._responseWaitList.removeSubscription(subscription);
        subscription.stateId = PublisherSubscription.StateId.Subscribed;
    }

    protected moveSubscriptionFromResponseWaitingToInactive(subscription: PublisherSubscription) {
        this._responseWaitList.removeSubscription(subscription);
        subscription.stateId = PublisherSubscription.StateId.Inactive;
    }

    protected createSynchronisedDataMessage(subscription: PublisherSubscription, unsubscribed: boolean) {
        return new SynchronisedPublisherSubscriptionDataMessage(subscription.dataItemId, subscription.dataItemRequestNr, unsubscribed);
    }

    private offlineSubscribedSubscriptions(errorText: string) {
        // All subscribed subscriptions will be in MessageMap
        for (const [key, subscription] of this._subscriptionByMessageMap) {
            if (subscription.stateId === PublisherSubscription.StateId.Subscribed) {
                subscription.stateId = PublisherSubscription.StateId.Inactive;
                this._exerciseDataMessages.addOfflinedDataMessage(subscription, errorText);
                this.notifySubscriptionError(PublisherSubscription.ErrorTypeId.Offlined);
            }
        }
        this._subscriptionByMessageMap.clear();
    }

    private offlineSendQueuedSubscriptions(queue: PublisherSubscriptionManager.SendQueue, errorText: string) {
        const count = queue.count;
        for (let i = count - 1; i >= 0; i--) {
            const request = queue.getItem(i);
            const subscription = request.subscription;
            if (request.typeId === PublisherRequest.TypeId.Unsubscribe) {
                this._subscriptionByDataItemIdMap.delete(subscription.dataItemId);
            } else {
                subscription.stateId = PublisherSubscription.StateId.Inactive;
                this._exerciseDataMessages.addOfflinedDataMessage(subscription, errorText);
                this.notifySubscriptionError(PublisherSubscription.ErrorTypeId.Offlined);
            }
        }
        queue.clear();
    }

    private offlineResponseWaitingSubscriptions(errorText: string) {
        const count = this._responseWaitList.count;
        for (let i = 0; i < count; i++) {
            const request = this._responseWaitList.getItem(i);
            const subscription = request.subscription;
            if (request.typeId === PublisherRequest.TypeId.Unsubscribe) {
                this._subscriptionByDataItemIdMap.delete(subscription.dataItemId);
            } else {
                subscription.stateId = PublisherSubscription.StateId.Inactive;
                this._exerciseDataMessages.addOfflinedDataMessage(subscription, errorText);
                this.notifySubscriptionError(PublisherSubscription.ErrorTypeId.Offlined);
            }
        }
        this._responseWaitList.clear();
    }

    private offlineInactiveSubscriptions(subscriptions: PublisherSubscription[], errorText: string) {
        // Even though these are not active, their DataItem state may still depend on whether publisher is online.
        // So an OfflinedDataMessage is sent
        const count = subscriptions.length;
        for (let i = count - 1; i >= 0; i--) {
            const subscription = subscriptions[i];
            this._exerciseDataMessages.addOfflinedDataMessage(subscription, errorText);
        }
    }

    private offlineSubscriptions(errorText: string) {
        // make room for offlining messages
        const subscriptionCount = this._subscriptionByDataItemIdMap.size;
        this._exerciseDataMessages.checkGrowCapacity(subscriptionCount);

        // save a list of all inactive subscriptions
        const inactiveSubscriptions = new Array<PublisherSubscription>(subscriptionCount);
        let inactiveCount = 0;
        for (const [key, subscription] of this._subscriptionByDataItemIdMap) {
            if (subscription.stateId === PublisherSubscription.StateId.Inactive) {
                inactiveSubscriptions[inactiveCount++] = subscription;
            }
        }
        inactiveSubscriptions.length = inactiveCount;

        // Offline active subscriptions
        this.offlineSubscribedSubscriptions(errorText);
        this.offlineResponseWaitingSubscriptions(errorText);
        this.offlineSendQueuedSubscriptions(this._highPrioritySendQueue, errorText);
        this.offlineSendQueuedSubscriptions(this._normalSendQueue, errorText);

        // Offline inactive subscriptions
        this.offlineInactiveSubscriptions(inactiveSubscriptions, errorText);

        // subscriptions are now only included in this._subscriptionByDataItemIdMap and all have state Inactive
    }

    private sendOffliningMessages() {
        for (const [key, subscription] of this._subscriptionByDataItemIdMap) {
            this._exerciseDataMessages.addOffliningDataMessage(subscription);
        }
    }

    private sendOnlinedMessages() {
        for (const [key, subscription] of this._subscriptionByDataItemIdMap) {
            this._exerciseDataMessages.addOnlinedDataMessage(subscription);
        }
    }

    private processResponseWaitList(nowTickTime: SysTick.Time) {
        interface SubscriptionAndTimeout {
            subscription: PublisherSubscription;
            timeoutSpan: number;
        }

        const waitListCount = this._responseWaitList.count;
        if (waitListCount > 0) {
            let count = waitListCount;
            for (let I = 0; I < waitListCount; I++) {
                const timeoutTime = this._responseWaitList.getItem(I).responseTimeoutTime;
                if (nowTickTime <= timeoutTime) {
                    count = I;
                    break;
                }
            }

            if (count > 0) {
                const deactivateAndMessageSubscriptions = new Array<SubscriptionAndTimeout>(count);
                let deactivateAndMessageCount = 0;
                for (let i = 0; i < count; i++) {
                    const request = this._responseWaitList.getItem(i);
                    const subscription = request.subscription;

                    const exists = this._subscriptionByDataItemIdMap.has(subscription.dataItemId);
                    if (!exists) {
                        Logger.log(Logger.LevelId.Warning, 'TPariSessSvc.ProcessResponseWaitList - Could not find subscription: '
                            + subscription.dataDefinition.description);
                    } else {
                        // assume Unsubscribe worked. Do not notify as error
                        if (request.typeId === PublisherRequest.TypeId.Unsubscribe) {
                            throw new AssertInternalError('PSMPRWL1904687', subscription.dataDefinition.description);
                        } else {
                            const deactivateAndMessageSubscription: SubscriptionAndTimeout = {
                                subscription,
                                timeoutSpan: request.responseTimeoutSpan,
                            };
                            deactivateAndMessageSubscriptions[deactivateAndMessageCount++] = deactivateAndMessageSubscription;
                        }
                    }
                }

                deactivateAndMessageSubscriptions.length = deactivateAndMessageCount;

                this._responseWaitList.removeRange(0, count);

                // send unsubscribe (if sub) just in case request got through to server but no response
                for (let i = 0; i < deactivateAndMessageCount; i++) {
                    const deactivateAndMessageSubscription = deactivateAndMessageSubscriptions[i];
                    this.deactivateSubscription(deactivateAndMessageSubscription.subscription);
                }

                // Unsub requests for sub subscriptions are now in send queue.  Need to send these immediately so that subscription
                // can be put into Inactive state so that DataItem can re-activate it.

                this.tryCatchProcessSendQueues();

                // Subscriptions are now not in any list or queue
                // Mark them as inactive and sent timeout error message to DataItem
                for (let i = 0; i < deactivateAndMessageCount; i++) {
                    const deactivateAndMessageSubscription = deactivateAndMessageSubscriptions[i];
                    const subscription = deactivateAndMessageSubscription.subscription;
                    subscription.stateId = PublisherSubscription.StateId.Inactive;
                    const timeoutSeconds = deactivateAndMessageSubscription.timeoutSpan / mSecsPerSec;
                    const errorText = `${timeoutSeconds.toFixed()} ${Strings[StringId.Seconds]}`;
                    this._exerciseDataMessages.addRequestTimeoutErrorDataMessage(subscription, errorText);
                    this.notifySubscriptionError(PublisherSubscription.ErrorTypeId.RequestTimeout);
                }
            }
        }
    }

    private tryCatchProcessSendQueues() {
        const nowTickTime = SysTick.now();
        try {
            this.processSendQueues(nowTickTime);
        } catch (e) {
            this.purgeSubscriptionsWithInternalError(e.message);
            throw (e);
        }
    }

    private processSendQueues(nowTickTime: SysTick.Time) {
        if (this._online) {
            this.processSendQueue(nowTickTime, this._highPrioritySendQueue);
            this.processSendQueue(nowTickTime, this._normalSendQueue);
        }
    }

    private processSendQueue(nowTickTime: SysTick.Time, sendQueue: PublisherSubscriptionManager.SendQueue) {
        const sendCount = sendQueue.getReadyCount(nowTickTime);
        if (sendCount > 0) {
            try {
                this.sendMessages(nowTickTime, sendQueue, sendCount);
            } catch (e) {
                sendQueue.clear();
                throw e;
            }
        }
    }

    private sendMessages(nowTickTime: SysTick.Time, sendQueue: PublisherSubscriptionManager.SendQueue, count: number) {
        const newMinResponseWaitListCapacity = this._responseWaitList.count + count;
        if (this._responseWaitList.capacity < newMinResponseWaitListCapacity) {
            this._responseWaitList.capacity = newMinResponseWaitListCapacity;
        }

        try {
            this.sendPackets(nowTickTime, sendQueue, count);
        } finally {
            sendQueue.removeRange(0, count);
        }
    }

    private purgeSubscriptionsWithInternalError(errorText: string) {
        this._highPrioritySendQueue.clear();
        this._normalSendQueue.clear();
        this._responseWaitList.clear();
        this._subscriptionByMessageMap.clear();

        const count = this._subscriptionByDataItemIdMap.size;
        const subscriptions = new Array<PublisherSubscription>(count);
        let idx = 0;
        for (const [dataItemId, subscription] of this._subscriptionByDataItemIdMap) {
            subscriptions[idx++] = subscription;
        }

        // clear subscriptions before sending messages in case an(other) exception occurs
        this._subscriptionByDataItemIdMap.clear();

        for (const subscription of subscriptions) {
            this._exerciseDataMessages.addInternalErrorDataMessage(subscription, errorText);
            this.notifySubscriptionError(PublisherSubscription.ErrorTypeId.Internal);
        }
    }

    protected abstract activateSubscription(subscription: PublisherSubscription): void;
    protected abstract deactivateSubscription(subscription: PublisherSubscription): void;

    protected abstract sendPackets(nowTickTime: SysTick.Time, SendQueue: PublisherSubscriptionManager.SendQueue, Count: number): void;
}

export namespace PublisherSubscriptionManager {
    const NeverRetryDelay = 200;
    const MinimumImmediateRetryBecameOnlineIntervalTimeSpan = 2 * secsPerMin * mSecsPerSec;

    export const enum NormalSendStateId {
        Blocked,
        Throttled,
        Ready
    }

    export type SubscriptionErrorEvent = (this: void, typeId: PublisherSubscription.ErrorTypeId) => void;
    export type ServerWarningEvent = (this: void) => void;

    export namespace ErrorType {
        interface Info {
            readonly id: PublisherSubscription.ErrorTypeId;
            readonly suspectBadnessReasonId: Badness.ReasonId;
            readonly errorBadnessReasonId: Badness.ReasonId;
        }

        type InfosObject = {[id in keyof typeof PublisherSubscription.ErrorTypeId]: Info};
        const infosObject: InfosObject = {
            Internal: { id: PublisherSubscription.ErrorTypeId.Internal,
                suspectBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_Internal_Error,
                errorBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_Internal_Error,
            },
            Offlined: { id: PublisherSubscription.ErrorTypeId.Offlined,
                suspectBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_Offlined_Suspect,
                errorBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_Offlined_Error,
            },
            RequestTimeout: { id: PublisherSubscription.ErrorTypeId.RequestTimeout,
                suspectBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_RequestTimeout_Suspect,
                errorBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_RequestTimeout_Error,
            },
            UserNotAuthorised: { id: PublisherSubscription.ErrorTypeId.UserNotAuthorised,
                suspectBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_UserNotAuthorised_Error,
                errorBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_UserNotAuthorised_Error,
            },
            PublishRequestError: { id: PublisherSubscription.ErrorTypeId.PublishRequestError,
                suspectBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_PublishRequestError_Suspect,
                errorBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_PublishRequestError_Error,
            },
            SubRequestError: { id: PublisherSubscription.ErrorTypeId.SubRequestError,
                suspectBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_SubRequestError_Suspect,
                errorBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_SubRequestError_Error,
            },
            DataError: { id: PublisherSubscription.ErrorTypeId.DataError,
                suspectBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_DataError_Suspect,
                errorBadnessReasonId: Badness.ReasonId.PublisherSubscriptionError_DataError_Error,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info, idx) => info.id !== idx);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('PublisherSubscription.ErrorTypeId', outOfOrderIdx, outOfOrderIdx.toString());
            }
        }

        export function idToSuspectBadnessReasonId(id: PublisherSubscription.ErrorTypeId) {
            return infos[id].suspectBadnessReasonId;
        }

        export function idToErrorBadnessReasonId(id: PublisherSubscription.ErrorTypeId) {
            return infos[id].errorBadnessReasonId;
        }
    }

    export class ExerciseDataMessageList extends DataMessages {
        checkGrowCapacity(growSize: Integer) {
            const minCapacity = this.count + growSize;
            if (this.capacity < minCapacity) {
                this.capacity = minCapacity;
            }
        }

        addOnlinedDataMessage(subscription: PublisherSubscription) {
            const msg = new OnlinedPublisherSubscriptionDataMessage(subscription.dataItemId);
            this.add(msg);
        }

        addOfflinedDataMessage(subscription: PublisherSubscription, errorText: string) {
            const msg = new ErrorPublisherSubscriptionDataMessage_Offlined(subscription.dataItemId, errorText,
                subscription.beenSentAtLeastOnce);
            this.add(msg);
        }

        addOffliningDataMessage(subscription: PublisherSubscription) {
            const msg = new OffliningPublisherSubscriptionDataMessage(subscription.dataItemId);
            this.add(msg);
        }

        addRequestTimeoutErrorDataMessage(subscription: PublisherSubscription, errorText: string) {
            const msg = new ErrorPublisherSubscriptionDataMessage_RequestTimeout(subscription.dataItemId, subscription.dataItemRequestNr,
                errorText);
            this.add(msg);
        }

        addInternalErrorDataMessage(subscription: PublisherSubscription, errorText: string) {
            const msg = new ErrorPublisherSubscriptionDataMessage_Internal(subscription.dataItemId, errorText);
            this.add(msg);
        }
    }

    export class SendQueue extends ComparableList<PublisherRequest> {
        batchingActive = false;

        private _throttleTypeId = SendQueue.ThrottleTypeId.Normal;
        private _normalThrottleSendTickSpan: SysTick.Span = 500; // milliseconds
        private _normalThrottleSendCount = 100;
        private _normalThrottleEarliestNextSendTime: SysTick.Time = 0;

        get priority() { return this._priority; }

        constructor(private _priority: PublisherSubscription.RequestSendPriorityId) {
            super();

            switch (this.priority) {
                case PublisherSubscription.RequestSendPriorityId.High:
                    this._throttleTypeId = SendQueue.ThrottleTypeId.None;
                    break;
                case PublisherSubscription.RequestSendPriorityId.Normal:
                    this._throttleTypeId = SendQueue.ThrottleTypeId.Normal;
                    break;
                default:
                    throw new UnreachableCaseError('FSRESQCP292929555', this.priority);
            }
        }

        getReadyCount(nowTickTime: SysTick.Time) {
            if (this.batchingActive) {
                return 0;
            } else {
                switch (this._throttleTypeId) {
                    case SendQueue.ThrottleTypeId.None:
                        return this.count;
                    case SendQueue.ThrottleTypeId.Normal:
                        if (nowTickTime < this._normalThrottleEarliestNextSendTime) {
                            return 0;
                        } else {
                            const count = this.count;
                            if (count <= this._normalThrottleSendCount) {
                                return count;
                            } else {
                                this._normalThrottleEarliestNextSendTime = this.calculateNormalThrottleEarliestNextSendTime();
                                return this._normalThrottleSendCount;
                            }
                        }
                    default:
                        throw new UnreachableCaseError('FSRESQGRCU987233688', this._throttleTypeId);
                }
            }
        }

        indexOfSubscription(subscription: PublisherSubscription) {
            for (let i = 0; i < this.count; i++) {
                if (this.getItem(i).subscription === subscription) {
                    return i;
                }
            }
            return -1;
        }

        removeSubscription(subscription: PublisherSubscription) {
            const idx = this.indexOfSubscription(subscription);
            if (idx >= 0) {
                this.removeAtIndex(idx);
            } else {
                throw new AssertInternalError('FSRESQRS199953338', subscription.dataDefinition.description);
            }
        }

        private calculateNormalThrottleEarliestNextSendTime() {
            return SysTick.now() + this._normalThrottleSendTickSpan;
        }
    }

    export namespace SendQueue {
        export const enum ThrottleTypeId {
            None,
            Normal,
        }
    }

    export class WaitList extends ComparableList<PublisherRequest> {

        indexOfSubscription(subscription: PublisherSubscription) {
            for (let i = 0; i < this.count; i++) {
                if (this.getItem(i).subscription === subscription) {
                    return i;
                }
            }
            return -1;
        }

        removeSubscription(subscription: PublisherSubscription) {
            const idx = this.indexOfSubscription(subscription);
            if (idx >= 0) {
                this.removeAtIndex(idx);
            } else {
                throw new AssertInternalError('FSREWLRS999482222', subscription.dataDefinition.description);
            }
        }

        override add(request: PublisherRequest): number {
            if (this.count === 0) {
                return super.add(request);
            } else {
                const lastResponseTimeoutTime = this.getItem(this.count - 1).responseTimeoutTime;
                if (request.responseTimeoutTime >= lastResponseTimeoutTime) {
                    super.insert(this.count, request);
                    return this.count;
                } else {
                    const searchResult = super.binarySearch(request);
                    let index = searchResult.index;
                    if (searchResult.found) {
                        index++;
                        while ((index < this.count) && (this.getItem(index).responseTimeoutTime === request.responseTimeoutTime)) {
                            index++;
                        }
                    }
                    super.insert(index, request);
                    return index;
                }
            }
        }
    }
}

export namespace PublisherSubscriptionManagerModule {
    export function initialiseStatic() {
        PublisherSubscriptionManager.ErrorType.initialise();
    }
}
