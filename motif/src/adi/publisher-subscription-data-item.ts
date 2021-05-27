/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError,
    Badness,
    EnumInfoOutOfOrderError,
    Integer,
    UnexpectedCaseError,
    UnreachableCaseError
} from 'src/sys/internal-api';
import {
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    ErrorPublisherSubscriptionDataMessage,
    OffliningPublisherSubscriptionDataMessage,
    OnlinedPublisherSubscriptionDataMessage,
    PublisherSubscription,
    PublisherSubscriptionDataDefinition,
    PublisherSubscriptionDelayRetryAlgorithm,
    PublisherSubscriptionDelayRetryAlgorithmId,
    SynchronisedPublisherSubscriptionDataMessage,
    WarningPublisherSubscriptionDataMessage
} from './common/internal-api';
import { DataItem } from './data-item';
import { Publisher } from './publisher';
import { PublisherSubscriptionManager } from './publisher-subscription-manager';

export abstract class PublisherSubscriptionDataItem extends DataItem {
    private _publisher: Publisher;
    private readonly _publisherSubscriptionDataDefinition: PublisherSubscriptionDataDefinition;

    private _publisherSubscriptionStateId: PublisherSubscriptionDataItem.SubscriptionStateId;
    private _publisherSubscriptionStateBadness: Badness;

    private _publisherSubscriptionSynchronised = false;

    private _publisherRequestSent = false;

    private readonly _subscribabilityIncreaseRetryAllowed: boolean;
    private readonly _delayRetryAlgorithmId: PublisherSubscriptionDelayRetryAlgorithmId;
    private _delayRetrySuccessiveAttemptCount = 0;
    private _delayRetryTimeoutHandle: NodeJS.Timeout | undefined;
    private _delayRetryDelayId = 0;

    // private _retryAlgorithmId: PublisherSubscriptionRetryAlgorithmId;

    get publisherRequestSent() { return this._publisherRequestSent; }

    constructor(definition: DataDefinition) {
        super(definition);
        if (!(definition instanceof PublisherSubscriptionDataDefinition)) {
            throw new AssertInternalError('PSDIC8989834666', definition.description);
        } else {
            this._publisherSubscriptionDataDefinition = definition;
            this._subscribabilityIncreaseRetryAllowed = this._publisherSubscriptionDataDefinition.subscribabilityIncreaseRetryAllowed;
            this._delayRetryAlgorithmId = this._publisherSubscriptionDataDefinition.delayRetryAlgorithmId;

            const initialStateId = PublisherSubscriptionDataItem.SubscriptionStateId.NeverSubscribed;
            this._publisherSubscriptionStateId = initialStateId;
            this._publisherSubscriptionStateBadness = this.createSubscriptionStateBadness(initialStateId);
        }
    }

    processMessage(msg: DataMessage) {
        switch (msg.typeId) {
            case DataMessageTypeId.Synchronised:
                if (!(msg instanceof SynchronisedPublisherSubscriptionDataMessage)) {
                    throw new AssertInternalError('PSDIPMREPSDM1319953548', msg.typeId.toString());
                } else {
                    this.processPublisherSubscriptionSynchronised(msg.alreadyUnsubscribed);
                }
                break;

            case DataMessageTypeId.PublisherSubscription_Offlining:
                if (!(msg instanceof OffliningPublisherSubscriptionDataMessage)) {
                    throw new AssertInternalError('PSDIPMONPSDM4319953548', msg.typeId.toString());
                } else {
                    this.processPublisherSubscriptionOfflining();
                }
                break;

            case DataMessageTypeId.PublisherSubscription_Onlined:
                if (!(msg instanceof OnlinedPublisherSubscriptionDataMessage)) {
                    throw new AssertInternalError('PSDIPMOFPSDM3319953548', msg.typeId.toString());
                } else {
                    this.processPublisherSubscriptionOnlined();
                }
                break;

            case DataMessageTypeId.PublisherSubscription_Error:
                if (!(msg instanceof ErrorPublisherSubscriptionDataMessage)) {
                    throw new AssertInternalError('PSDIPMREPSDME1319953548', msg.typeId.toString());
                } else {
                    this.processPublisherSubscriptionError(msg.errorTypeId, msg.errorText, msg.allowedRetryTypeId, msg.requestSent);
                }
                break;

            case DataMessageTypeId.PublisherSubscription_Warning:
                if (!(msg instanceof WarningPublisherSubscriptionDataMessage)) {
                    throw new AssertInternalError('PSDIPMSEPSDMW2319953548', msg.typeId.toString());
                } else {
                    this.processPublisherSubscriptionWarning(msg.warningText);
                }
                break;
        }
    }

    protected start() {
        this.subscribeSubscription();

        super.start();
    }

    protected stop() {
        this.unsubscribeSubscription();
    }

    /** Used by DataMgr to determine whether a subscription can be cached */
    protected getOnline() {
        return PublisherSubscriptionDataItem.SubscriptionState.idIsDataItemOnline(this._publisherSubscriptionStateId);
    }

    /** Descendants should override this
     * When called, descendants should get ready for fresh data.  Normally this involves clearing existing data */
    protected processSubscriptionPreOnline() { }

    protected checkSubscribabilityIncreaseWaitingActivate() {
        switch (this._publisherSubscriptionStateId) {
            case PublisherSubscriptionDataItem.SubscriptionStateId.NeverSubscribed:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting:
                throw new AssertInternalError('PSDIAIOWN200199931',
                    `${this._publisherSubscriptionStateId} ${this.definition.description}`);

            case PublisherSubscriptionDataItem.SubscriptionStateId.SubscribabilityIncreaseWaiting:
                this.activateSubscription();
                break;

            case PublisherSubscriptionDataItem.SubscriptionStateId.Error:
                // ignore
                break;

            case PublisherSubscriptionDataItem.SubscriptionStateId.RetryDelayWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.SynchronisationWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.Synchronised:
            case PublisherSubscriptionDataItem.SubscriptionStateId.UnsubscribedSynchronised:
                // ignore
                break;

            default:
                throw new UnexpectedCaseError('PSDIAIOWU200199931', this._publisherSubscriptionStateId);
        }
    }

    protected calculateUsabilityBadness() {
        if (this._publisherSubscriptionSynchronised) {
            return Badness.notBad;
        } else {
            return this._publisherSubscriptionStateBadness;
        }
    }

    /** The only way we know a subscription is online is when it receives a message.  So for each message, we check
     * whether a subscription is online.  If not, we do some pre-online tasks and then bring online
     */
    protected advisePublisherResponseUpdateReceived() {
        switch (this._publisherSubscriptionStateId) {
            case PublisherSubscriptionDataItem.SubscriptionStateId.NeverSubscribed:
            case PublisherSubscriptionDataItem.SubscriptionStateId.Error:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.SubscribabilityIncreaseWaiting:
                throw new AssertInternalError('PSDIADRURC5788883821', this.definition.description);

            case PublisherSubscriptionDataItem.SubscriptionStateId.RetryDelayWaiting:
                // Response took much longer than expected.  Use it anyway
                this.checkClearDelayRetryTimeout();
                this._publisherSubscriptionStateId = PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting;
                this.advisePublisherResponseUpdateReceived(); // call recursively
                break;

            case PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting:
                this.beginUpdate();
                try {
                    this._publisherRequestSent = true; // a publisher request must have been sent
                    this.processSubscriptionPreOnline();
                    const newStateId = PublisherSubscriptionDataItem.SubscriptionStateId.SynchronisationWaiting;
                    const badness = this.createSubscriptionStateBadness(newStateId);
                    this.setStateId(newStateId, badness);
                } finally {
                    this.endUpdate();
                }
                break;

            case PublisherSubscriptionDataItem.SubscriptionStateId.SynchronisationWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.Synchronised:
            case PublisherSubscriptionDataItem.SubscriptionStateId.UnsubscribedSynchronised:
                // ignore
                break;

            default:
                throw new UnexpectedCaseError('PSDIADRURU77453229', this._publisherSubscriptionStateId);
        }
    }

    // make private when holdings and balances fixed
    protected unsubscribeSubscription() {
        // Since stop() can be called at any point, stateId can be in any state.
        if (PublisherSubscriptionDataItem.SubscriptionState.idIsSubscribed(this._publisherSubscriptionStateId)) {
            this._publisher.unsubscribeDataItemId(this.id);
        }
    }

    // descendants can override to handle differently
    protected processPublisherCameOnline() {
        this.activateSubscription();
    }

    // overriden by descendants to adjust to offline conditions (eg. set FeedStatusId to unknown)
    protected processPrePublisherWentOffline() { }

    protected tryInitiateSubscribabilityIncreaseRetryWaiting(badness: Badness) {
        switch (this._publisherSubscriptionStateId) {
            case PublisherSubscriptionDataItem.SubscriptionStateId.NeverSubscribed:
            case PublisherSubscriptionDataItem.SubscriptionStateId.Error:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining:
            case PublisherSubscriptionDataItem.SubscriptionStateId.SubscribabilityIncreaseWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.RetryDelayWaiting:
                this.checkClearDelayRetryTimeout();
                throw new AssertInternalError('PSDIISIR6588342222', this.definition.description);

            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining:
                const waitingText = Strings[StringId.BadnessReasonId_PublisherSubscription_PublisherOnlineWaiting];
                const onlineWaitingBadness: Badness = {
                    reasonId: badness.reasonId,
                    reasonExtra: badness.reasonExtra + `: ${waitingText}`,
                };
                this.setStateId(PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting, onlineWaitingBadness);
                return true; // Will retry when Publisher comes online

            case PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.SynchronisationWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.Synchronised:
            case PublisherSubscriptionDataItem.SubscriptionStateId.UnsubscribedSynchronised:
                return false; // Publisher already online - needs to be handled by descendant

            default:
                throw new UnexpectedCaseError('PSDIADRURU77453229', this._publisherSubscriptionStateId);
        }
    }

    protected setSubscribabilityIncreaseWaitingStateId(badness: Badness) {
        this.setStateId(PublisherSubscriptionDataItem.SubscriptionStateId.SubscribabilityIncreaseWaiting, badness);
    }

    protected processPublisherSubscriptionWarning(warningText: string) {
        const badness: Badness = {
            reasonId: Badness.ReasonId.PublisherServerWarning,
            reasonExtra: warningText,
        };

        const logText = Badness.generateText(badness);
        console.warn(logText);

        if (this.usable) {
            this.setUsable(badness);
        }
    }

    private subscribeSubscription() {
        if (this._publisherSubscriptionStateId !== PublisherSubscriptionDataItem.SubscriptionStateId.NeverSubscribed) {
            // can only subscribe subscription once
            this.checkClearDelayRetryTimeout();
            throw new AssertInternalError('PSDISS332199534', this._publisherSubscriptionStateId.toString());
        } else {
            this._publisher = this.onRequirePublisher(this.definition);
            const publisherOnline = this._publisher.subscribeDataItemId(this.id, this._publisherSubscriptionDataDefinition);

            if (publisherOnline) {
                this.processPublisherCameOnline();
            } else {
                const newStateId = PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting;
                const badness = this.createSubscriptionStateBadness(newStateId);
                this.setStateId(newStateId, badness);
            }
        }
    }

    private handleRetryDelayTimeout(delayId: Integer) {
        if (this._publisherSubscriptionStateId === PublisherSubscriptionDataItem.SubscriptionStateId.RetryDelayWaiting
            &&
            delayId === this._delayRetryDelayId // make sure we are not processing an old callback
        ) {
            this._delayRetryDelayId++;
            this.checkClearDelayRetryTimeout();
            this.activateSubscription();
        }
    }

    private activateSubscription() {
        switch (this._publisherSubscriptionStateId) {
            case PublisherSubscriptionDataItem.SubscriptionStateId.Error:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining:
            case PublisherSubscriptionDataItem.SubscriptionStateId.UnsubscribedSynchronised:
                    throw new AssertInternalError('PSDIASN09998113', this.definition.description); // can not activate from this states

            case PublisherSubscriptionDataItem.SubscriptionStateId.NeverSubscribed:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.SubscribabilityIncreaseWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.RetryDelayWaiting:
                this.checkClearDelayRetryTimeout();

                const badness = this.createSubscriptionStateBadness(PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting);
                this.setStateId(PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting, badness);
                this._publisher.activateDataItemId(this.id, this.nextRequestNr);
                break;

            case PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.SynchronisationWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.Synchronised:
                throw new AssertInternalError('PSDIASN09998113', this.definition.description); // already activated in these states

            default:
                throw new UnreachableCaseError('PSDIAS6673922232', this._publisherSubscriptionStateId);
        }
    }

    private processPublisherSubscriptionSynchronised(alreadyUnsubscribed: boolean) {
        switch (this._publisherSubscriptionStateId) {
            case PublisherSubscriptionDataItem.SubscriptionStateId.NeverSubscribed:
            case PublisherSubscriptionDataItem.SubscriptionStateId.Error:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining:
            case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.SubscribabilityIncreaseWaiting:
            case PublisherSubscriptionDataItem.SubscriptionStateId.RetryDelayWaiting:
                this.checkClearDelayRetryTimeout();
                throw new AssertInternalError('PSDIPPSSC50788883821',
                    `${this._publisherSubscriptionStateId}: ${this.definition.description}`
                );

            case PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting:
                // Did not receive anything
                this.advisePublisherResponseUpdateReceived(); // will clear DataItem and change state to SynchronisationWaiting
                this.processPublisherSubscriptionSynchronised(alreadyUnsubscribed);
                break;

            case PublisherSubscriptionDataItem.SubscriptionStateId.SynchronisationWaiting:
                let newStateId: PublisherSubscriptionDataItem.SubscriptionStateId;
                if (alreadyUnsubscribed) {
                    newStateId = PublisherSubscriptionDataItem.SubscriptionStateId.UnsubscribedSynchronised;
                } else {
                    newStateId = PublisherSubscriptionDataItem.SubscriptionStateId.Synchronised;
                }

                const badness = this.createSubscriptionStateBadness(newStateId);
                this.setStateId(newStateId, badness);
                break;

            case PublisherSubscriptionDataItem.SubscriptionStateId.Synchronised:
            case PublisherSubscriptionDataItem.SubscriptionStateId.UnsubscribedSynchronised:
                throw new AssertInternalError('PSDIPPSSS50788883821', this.definition.description);

            default:
                throw new UnexpectedCaseError('PSDIPPSSU50788883821', this._publisherSubscriptionStateId);
        }

    }

    private processPublisherSubscriptionError(errorTypeId: PublisherSubscription.ErrorTypeId, errorText: string,
        allowedRetryTypeId: PublisherSubscription.AllowedRetryTypeId, requestSent: boolean
    ) {
        if (requestSent) {
            this._publisherRequestSent = true;
        }

        if (errorTypeId === PublisherSubscription.ErrorTypeId.Offlined) {
            this.processPrePublisherWentOffline();
        }

        switch (allowedRetryTypeId) {
            case PublisherSubscription.AllowedRetryTypeId.Never: {
                if (!PublisherSubscriptionDataItem.SubscriptionState.idIsActivated(this._publisherSubscriptionStateId)) {
                    this.checkClearDelayRetryTimeout();
                    const errorMsg = `${this._publisherSubscriptionStateId}: ${this.definition.description}`;
                    throw new AssertInternalError('PSDIPPSEN777723456', errorMsg);
                } else {
                    // subscription has already been unsubscribed from publisher.
                    const errorReasonId = PublisherSubscriptionManager.ErrorType.idToErrorBadnessReasonId(errorTypeId);
                    const errorBadness: Badness = {
                        reasonId: errorReasonId,
                        reasonExtra: errorText,
                    };
                    this.setStateId(PublisherSubscriptionDataItem.SubscriptionStateId.Error, errorBadness);
                }
                break;
            }

            case PublisherSubscription.AllowedRetryTypeId.Delay: {
                switch (this._publisherSubscriptionStateId) {
                    case PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.SynchronisationWaiting: {
                        if (this._delayRetryAlgorithmId === PublisherSubscriptionDelayRetryAlgorithmId.Never) {
                            const errorReasonId = PublisherSubscriptionManager.ErrorType.idToErrorBadnessReasonId(errorTypeId);
                            const errorBadness: Badness = {
                                reasonId: errorReasonId,
                                reasonExtra: errorText,
                            };
                            this.setStateId(PublisherSubscriptionDataItem.SubscriptionStateId.Error, errorBadness);
                            this.unsubscribeSubscription();
                        } else {
                            const suspectReasonId = PublisherSubscriptionManager.ErrorType.idToSuspectBadnessReasonId(errorTypeId);
                            const suspectBadness: Badness = {
                                reasonId: suspectReasonId,
                                reasonExtra: errorText,
                            };
                            this.initiateRetryDelay();
                            this.setStateId(PublisherSubscriptionDataItem.SubscriptionStateId.RetryDelayWaiting, suspectBadness);
                        }
                        break;
                    }
                    default: {
                        this.checkClearDelayRetryTimeout();
                        const errorMsg = `${this._publisherSubscriptionStateId}: ${this.definition.description}`;
                        throw new AssertInternalError('PSDIPPSED777723456', errorMsg);
                    }
                }
                break;
            }

            case PublisherSubscription.AllowedRetryTypeId.SubscribabilityIncrease: {
                if (!PublisherSubscriptionDataItem.SubscriptionState.idIsActivatedOrOfflining(this._publisherSubscriptionStateId)) {
                    this.checkClearDelayRetryTimeout();
                    const errorMsg = `${this._publisherSubscriptionStateId}: ${this.definition.description}`;
                    throw new AssertInternalError('PSDIPPSEN777723456', errorMsg);
                } else {
                    if (!this._subscribabilityIncreaseRetryAllowed) {
                        const errorReasonId = PublisherSubscriptionManager.ErrorType.idToErrorBadnessReasonId(errorTypeId);
                        const errorBadness: Badness = {
                            reasonId: errorReasonId,
                            reasonExtra: errorText,
                        };
                        this.setStateId(PublisherSubscriptionDataItem.SubscriptionStateId.Error, errorBadness);
                    } else {
                        const suspectReasonId = PublisherSubscriptionManager.ErrorType.idToSuspectBadnessReasonId(errorTypeId);
                        const suspectBadness: Badness = {
                            reasonId: suspectReasonId,
                            reasonExtra: errorText,
                        };
                        if (errorTypeId === PublisherSubscription.ErrorTypeId.Offlined) {
                            // eslint-disable-next-line max-len
                            if (this._publisherSubscriptionStateId !== PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining) {
                                throw new AssertInternalError('PSDIPPSENOD1777723456', this.definition.description);
                            } else {
                                this.setStateId(PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting,
                                    suspectBadness);
                            }
                        } else {
                            const initiated = this.tryInitiateSubscribabilityIncreaseRetryWaiting(suspectBadness);
                            if (!initiated) {
                                // Must be at maximum Subscribability.
                                // Set to SubscribabilityIncreaseWaiting which will be triggered if Publisher goes offline and then comes
                                // online and/or Feed lowers and then increases subscribability
                                const waitingText = Strings[StringId.SubscribabilityIncreaseRetry_ReIncrease];
                                const waitingSuspectBadness: Badness = {
                                    reasonId: suspectBadness.reasonId,
                                    reasonExtra: suspectBadness.reasonExtra + `: ${waitingText}`,
                                };
                                this.setSubscribabilityIncreaseWaitingStateId(waitingSuspectBadness);
                            }
                        }
                    }
                }
                break;
            }

            default:
                throw new UnreachableCaseError('PSDIPPSEPU98712443000', allowedRetryTypeId);
        }
    }

    private processPublisherSubscriptionOnlined() {
        if (this._publisherSubscriptionStateId !== PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting) {
            throw new AssertInternalError('PSDIPPSO339233823', this._publisherSubscriptionStateId.toString());
        } else {
            this.processPublisherCameOnline();
        }
    }

    private processPublisherSubscriptionOfflining() {
        if (!PublisherSubscriptionDataItem.SubscriptionState.idIsSubscribed(this._publisherSubscriptionStateId)) {
            throw new AssertInternalError('PSDIPPSOD19954233423', this._publisherSubscriptionStateId.toString());
        } else {
            this.checkClearDelayRetryTimeout();
            const stateId = PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining;
            const badness = this.createSubscriptionStateBadness(stateId);
            this.setStateId(stateId, badness);
        }
    }

    private setStateId(value: PublisherSubscriptionDataItem.SubscriptionStateId, badness: Badness) {
        if (value !== this._publisherSubscriptionStateId) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this._publisherSubscriptionStateId = value;
                this._publisherSubscriptionStateBadness = badness;
                switch (value) {
                    case PublisherSubscriptionDataItem.SubscriptionStateId.NeverSubscribed:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.Error:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOfflining:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.PublisherOnlineWaiting:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.SubscribabilityIncreaseWaiting:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.RetryDelayWaiting:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.ResponseWaiting:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.SynchronisationWaiting:
                        this._publisherSubscriptionSynchronised = false;
                        this.setUnusable(this._publisherSubscriptionStateBadness);
                        break;

                    case PublisherSubscriptionDataItem.SubscriptionStateId.Synchronised:
                    case PublisherSubscriptionDataItem.SubscriptionStateId.UnsubscribedSynchronised:
                        this._publisherSubscriptionSynchronised = true;
                        this.trySetUsable();
                        break;

                    default:
                        throw new UnreachableCaseError('FDISS2999956663', value);
                }

            } finally {
                this.endUpdate();
            }
        }
    }

    private initiateRetryDelay() {
        this.checkClearDelayRetryTimeout();

        const timeoutSpan = PublisherSubscriptionDelayRetryAlgorithm.calculateDelayTickSpan(this._delayRetryAlgorithmId,
            ++this._delayRetrySuccessiveAttemptCount);

        const delayRetryDelayId = ++this._delayRetryDelayId;
        this._delayRetryTimeoutHandle = setTimeout(() => this.handleRetryDelayTimeout(delayRetryDelayId), timeoutSpan);
    }

    private checkClearDelayRetryTimeout() {
        if (this._delayRetryTimeoutHandle !== undefined) {
            clearTimeout(this._delayRetryTimeoutHandle);
            this._delayRetryTimeoutHandle = undefined;
        }
    }

    private createSubscriptionStateBadness(stateId: PublisherSubscriptionDataItem.SubscriptionStateId) {
        const badness: Badness = {
            reasonId: PublisherSubscriptionDataItem.SubscriptionState.idToBadnessReasonId(stateId),
            reasonExtra: this.definition.description,
        } as const;
        return badness;
    }
}

export namespace PublisherSubscriptionDataItem {
    export const enum SubscriptionStateId {
        NeverSubscribed,
        Error, // subscription is unsubscribed
        PublisherOnlineWaiting,
        SubscribabilityIncreaseWaiting, // connection online but Feed needs to come online or become Active/Closed
        RetryDelayWaiting,
        PublisherOfflining, // If connection goes offline, all subscribed subscriptions are put into this state first
        ResponseWaiting,
        SynchronisationWaiting,
        Synchronised,
        UnsubscribedSynchronised,
    }

    export namespace SubscriptionState {
        export type Id = SubscriptionStateId;
        interface Info {
            readonly id: Id;
            readonly subscribed: boolean;
            readonly activatedOrOfflining: boolean;
            readonly activated: boolean;
            readonly dataItemOnline: boolean; // represent whether DataItem is online (not publisher).
            readonly badnessReasonId: Badness.ReasonId;
        }

        type InfosObject = { [id in keyof typeof SubscriptionStateId]: Info };

        const infosObject: InfosObject = {
            NeverSubscribed: {
                id: SubscriptionStateId.NeverSubscribed,
                subscribed: false,
                activatedOrOfflining: false,
                activated: false,
                dataItemOnline: false,
                badnessReasonId: Badness.ReasonId.PublisherSubscriptionState_NeverSubscribed,
            },
            Error: {
                id: SubscriptionStateId.Error,
                subscribed: false,
                activatedOrOfflining: false,
                activated: false,
                dataItemOnline: false,
                badnessReasonId: Badness.Reason.nullId,
            },
            PublisherOnlineWaiting: {
                id: SubscriptionStateId.PublisherOnlineWaiting,
                subscribed: true,
                activatedOrOfflining: false,
                activated: false,
                dataItemOnline: false,
                badnessReasonId: Badness.ReasonId.PublisherSubscriptionState_PublisherOnlineWaiting,
            },
            SubscribabilityIncreaseWaiting: {
                id: SubscriptionStateId.SubscribabilityIncreaseWaiting,
                subscribed: true,
                activatedOrOfflining: false,
                activated: false,
                dataItemOnline: false,
                badnessReasonId: Badness.Reason.nullId,
            },
            RetryDelayWaiting: {
                id: SubscriptionStateId.RetryDelayWaiting,
                subscribed: true,
                activatedOrOfflining: false,
                activated: false,
                dataItemOnline: false,
                badnessReasonId: Badness.Reason.nullId,
            },
            PublisherOfflining: {
                id: SubscriptionStateId.PublisherOfflining,
                subscribed: true,
                activatedOrOfflining: true,
                activated: false,
                dataItemOnline: false,
                badnessReasonId: Badness.ReasonId.PublisherSubscriptionState_PublisherOfflining,
            },
            ResponseWaiting: {
                id: SubscriptionStateId.ResponseWaiting,
                subscribed: true,
                activatedOrOfflining: true,
                activated: true,
                dataItemOnline: false,
                badnessReasonId: Badness.ReasonId.PublisherSubscriptionState_ResponseWaiting,
            },
            SynchronisationWaiting: {
                id: SubscriptionStateId.SynchronisationWaiting,
                subscribed: true,
                activatedOrOfflining: true,
                activated: true,
                dataItemOnline: true,
                badnessReasonId: Badness.ReasonId.PublisherSubscriptionState_SynchronisationWaiting,
            },
            Synchronised: {
                id: SubscriptionStateId.Synchronised,
                subscribed: true,
                activatedOrOfflining: true,
                activated: true,
                dataItemOnline: true,
                badnessReasonId: Badness.ReasonId.PublisherSubscriptionState_Synchronised,
            },
            UnsubscribedSynchronised: {
                id: SubscriptionStateId.UnsubscribedSynchronised,
                subscribed: false,
                activatedOrOfflining: false,
                activated: false,
                dataItemOnline: true,
                badnessReasonId: Badness.ReasonId.PublisherSubscriptionState_UnsubscribedSynchronised,
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function staticConstructor() {
            for (let id = 0; id < SubscriptionState.idCount; id++) {
                if (id !== infos[id].id) {
                    throw new EnumInfoOutOfOrderError('DataItemStatusId', id, infos[id].toString());
                }
            }
        }

        export function idIsActivatedOrOfflining(id: Id) {
            return infos[id].activatedOrOfflining;
        }

        export function idIsActivated(id: Id) {
            return infos[id].activated;
        }

        export function idIsDataItemOnline(id: Id) {
            return infos[id].dataItemOnline;
        }

        export function idIsSubscribed(id: Id) {
            return infos[id].subscribed;
        }

        export function idToBadnessReasonId(id: Id) {
            const reasonId = infos[id].badnessReasonId;
            if (reasonId === Badness.Reason.nullId) {
                throw new AssertInternalError('PSDISSITBRI4377277727');
            } else {
                return reasonId;
            }
        }
    }
}

export namespace FeedDataItemModule {
    export function initialiseStatic(): void {
        PublisherSubscriptionDataItem.SubscriptionState.staticConstructor();
    }
}
