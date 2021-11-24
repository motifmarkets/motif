/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, Badness, CorrectnessId, delay1Tick, Integer, MultiEvent, SysTick } from 'sys-internal-api';
import {
    DataChannel,
    DataChannelId,
    DataDefinition,
    DataItemId,
    DataItemRequestNr,
    DataMessage,
    firstDataItemId,
    firstDataItemRequestNr
} from './common/internal-api';
import { Publisher } from './publisher';

export abstract class DataItem {
    private static readonly _firstValidDataItemId: DataItemId = firstDataItemId;
    private static readonly _firstValidDataItemRequestNr: DataItemRequestNr = firstDataItemRequestNr;

    private static _nextDataItemId: DataItemId = DataItem._firstValidDataItemId;

    onWantActivation: DataItem.WantActivationEventHandler;
    onCancelWantActivation: DataItem.CancelWantActivationEventHandler;
    onKeepActivation: DataItem.KeepActivationEventHandler;
    onAvailableForDeactivation: DataItem.AvailableForDeactivationEventHandler;
    onRequirePublisher: DataItem.RequirePublisherEventHandler;
    onRequireDestruction: DataItem.RequireDestructionEventHandler;
    onRequireDataItem: DataItem.RequireDataItemEventHandler;
    onReleaseDataItem: DataItem.ReleaseDataItemEventHandler;

    private readonly _id: DataItemId;

    private readonly _definition: DataDefinition;
    private readonly _channelId: DataChannelId;

    private _activeRequestNr: DataItemRequestNr = DataItem._firstValidDataItemRequestNr;
    private _subscribeCount = 0;

    private _active = false;
    private _startDelayHandle: NodeJS.Timeout | undefined;
    private _started = false;
    private _deactivationDelayed: boolean;
    private _deactivationDelayUntil: SysTick.Time;

    private _correctnessId = Badness.getCorrectnessId(Badness.inactive);
    private _good = false;
    private _usable = false;
    private _error = false;
    private _badness = Badness.createCopy(Badness.inactive);
    private _availableForDeactivationTickTime: SysTick.Time;
    private _setGoodBadTransactionId = 0;

    private _beginUpdateCount: Integer = 0;
    private _updateChanges = false;

    private _beginChangesMultiEvent = new MultiEvent<DataItem.BeginChangesEventHandler>();
    private _endChangesMultiEvent = new MultiEvent<DataItem.EndChangesEventHandler>();
    private _correctnessChangeMultiEvent = new MultiEvent<DataItem.CorrectnessChangeEventHandler>();
    private _badnessChangeMultiEvent = new MultiEvent<DataItem.BadnessChangeEventHandler>();

    constructor(definition: DataDefinition) {
        this._definition = definition;
        this._channelId = definition.channelId;

        this._id = /* this._definition.snapshot ? invalidDataItemId :*/ DataItem.getNextDataItemId();
    }

    get id() { return this._id; }
    get channelName() { return this.getChannelName(); }
    get activeRequestNr() { return this._activeRequestNr; }
    get nextRequestNr() { return this.getNextRequestNr(); }
    get definition() { return this._definition; }
    get channelId() { return this._channelId; }

    get subscribeCount() { return this._subscribeCount; }
    get availableForDeactivationTickTime() { return this._availableForDeactivationTickTime; }

    get correctnessId() { return this._correctnessId; }
    get active() { return this._active; }
    get online() { return this.getOnline(); }
    get incubated() { return this._correctnessId !== CorrectnessId.Suspect; }
    get good() { return this._good; }
    get usable() { return this._usable; }
    get error() { return this._error; }
    get badness() { return this._badness; }
    get errorText() { return Badness.generateText(this._badness); }
    get deactivationDelayed(): boolean { return this._deactivationDelayed; }

    protected get beginUpdateCount(): number { return this._beginUpdateCount; }

    private static getNextDataItemId(): Integer {
        return this._nextDataItemId++;
    }

    incSubscribeCount() {
        const WasZero = this._subscribeCount === 0;
        this._subscribeCount++;
        if (WasZero) {
            if (!this.definition.referencable) {
                this.activate();
            } else {
                if (this.active) {
                    this.onKeepActivation(this);
                } else {
                    this.onWantActivation(this);
                }
            }
        }
    }

    decSubscribeCount() {
        this._subscribeCount--;
        assert(this._subscribeCount >= 0);

        if (this._subscribeCount === 0) {
            if (!this.definition.referencable) {
                this.deactivate(); // will Destroy Object - do not use anymore
            } else {
                if (this.active) {
                    this.onAvailableForDeactivation(this);
                } else {
                    this.onCancelWantActivation(this);
                    this.onRequireDestruction(this);  // will Destroy Object - do not use anymore
                }
            }
        }
    }

    activate() {
        this.beginUpdate();
        try {
            assert(!this.active);
            this._active = true;

            // Delay so that DataItem events can be bound to
            this._startDelayHandle = delay1Tick(() => this.start());

        } finally {
            this.endUpdate();
        }
    }

    deactivate() {
        this.beginUpdate();
        try {
            if (this._started) {
                this.stop();
            } else {
                // Possible that deactivate is called before start() has been run.  Cancel start()
                if (this._startDelayHandle !== undefined) {
                    clearTimeout(this._startDelayHandle);
                    this._startDelayHandle = undefined;
                }
            }

            this._deactivationDelayed = false;
            this._active = false;
        } finally {
            this.endUpdate();
        }

        this.onRequireDestruction(this); // will Destroy object - do not use anymore
    }

    notifyDeactivationDelayed(UntilTime: SysTick.Time) {
        this._deactivationDelayed = true;
        this._deactivationDelayUntil = UntilTime;
    }

    hasDeactivationDelayExpired(nowTickTime: SysTick.Time): boolean {
        assert(this._deactivationDelayed);
        return nowTickTime < this._deactivationDelayUntil;
    }

    notifyKeepActivation() {
        this._deactivationDelayed = false;
    }

    processMessage(msg: DataMessage) {
        // overriden in descendants
    }

    subscribeDataItem(Definition: DataDefinition): DataItem {
        return this.onRequireDataItem(Definition);
    }

    unsubscribeDataItem(dataItem: DataItem) {
        this.onReleaseDataItem(dataItem);
    }

    subscribeBeginChangesEvent(handler: DataItem.BeginChangesEventHandler) {
        return this._beginChangesMultiEvent.subscribe(handler);
    }

    unsubscribeBeginChangesEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beginChangesMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeEndChangesEvent(handler: DataItem.EndChangesEventHandler) {
        return this._endChangesMultiEvent.subscribe(handler);
    }

    unsubscribeEndChangesEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._endChangesMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangeEvent(handler: DataItem.CorrectnessChangeEventHandler) {
        return this._correctnessChangeMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeBadnessChangeEvent(handler: DataItem.BadnessChangeEventHandler) {
        return this._badnessChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._badnessChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected getDefinition() { return this._definition; }
    /** online indicates whether a DataItem can be cached.
     * Overridden in PublisherSubscriptionDataItem to also include NotSynchronised and Synchronised */
    protected getOnline() { return this.usable; }

    protected start() {
        this._started = true;
    }

    protected stop() { // virtual;
        // no code - child classes can override
    }

    protected beginUpdate() {
        assert(this._beginUpdateCount >= 0);
        this._beginUpdateCount++;
        if (this._beginUpdateCount === 1) {
            this._updateChanges = false;
        }
    }

    protected endUpdate() {
        this._beginUpdateCount--;
        assert(this._beginUpdateCount >= 0);
        if (this._beginUpdateCount === 0 && this._updateChanges) {
            this.broadcastEndChangesEvent();
            this._updateChanges = false;
        }
    }

    protected notifyUpdateChange() {
        if (this._beginUpdateCount > 0) {
            if (!this._updateChanges) {
                this._updateChanges = true;
                this.broadcastBeginChangesEvent();
            }
        }
    }

    protected processUsableChanged() {
        // available for override
    }

    protected processBadnessChange() {
        this.notifyBadnessChange();
    }

    protected processCorrectnessChange() {
        this.notifyCorrectnessChange();
    }

    /** Descendants should call when they want to try to transition to a Usable state */
    protected trySetUsable() {
        const badness = this.calculateUsabilityBadness();
        this.setBadness(badness);
    }

    protected setUsable(badness: Badness) {
        if (Badness.isUnusable(badness)) {
            throw new AssertInternalError('DISU100029484'); // must always be usable
        } else {
            this.setBadness(badness);
        }
    }

    protected setUnusable(badness: Badness) {
        if (Badness.isUsable(badness)) {
            throw new AssertInternalError('DISNU100029484'); // must always be unusable
        } else {
            this.setBadness(badness);
        }
    }

    protected checkSetUnusuable(badness: Badness) {
        if (badness.reasonId !== Badness.ReasonId.NotBad) {
            this.setBadness(badness);
        }
    }

    private broadcastBeginChangesEvent() {
        const handlers = this._beginChangesMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(this);
        }
    }

    private broadcastEndChangesEvent() {
        const handlers = this._endChangesMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(this);
        }
    }

    private notifyCorrectnessChange(): void {
        const handlers = this._correctnessChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

     private notifyBadnessChange(): void {
        const handlers = this._badnessChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private getNextRequestNr(): DataItemRequestNr {
        return ++this._activeRequestNr;
    }

    private getChannelName(): string {
        return DataChannel.idToName(this._channelId);
    }

    // setBadness can also make a DataItem Good
    private setGood() {
        if (!this._good) {
            this._correctnessId = CorrectnessId.Good;
            const oldUsable = this._usable;
            this._good = true;
            this._usable = true;
            this._error = false;
            this._badness = {
                reasonId: Badness.ReasonId.NotBad,
                reasonExtra: '',
            } as const;
            const transactionId = ++this._setGoodBadTransactionId;
            if (!oldUsable) {
                this.processUsableChanged();
            }
            if (transactionId === this._setGoodBadTransactionId) {
                this.processBadnessChange();
                this.processCorrectnessChange();
            }
        }
    }

    private setBadness(badness: Badness) {
        if (Badness.isGood(badness)) {
            this.setGood();
        } else {
            const newReasonId = badness.reasonId;
            const newReasonExtra = badness.reasonExtra;
            if (newReasonId !== this._badness.reasonId || newReasonExtra !== this.badness.reasonExtra) {
                const oldUsable = this._usable;
                const oldCorrectnessId = this._correctnessId;
                this._correctnessId = Badness.Reason.idToCorrectnessId(newReasonId);
                this._good = false;
                this._usable = this._correctnessId === CorrectnessId.Usable; // Cannot be Good
                this._error = this._correctnessId === CorrectnessId.Error;
                this._badness = {
                    reasonId: newReasonId,
                    reasonExtra: newReasonExtra,
                } as const;
                const transactionId = ++this._setGoodBadTransactionId;
                if (oldUsable !== this._usable) {
                    this.processUsableChanged();
                }
                if (transactionId === this._setGoodBadTransactionId) {
                    this.processBadnessChange();

                    if (this._correctnessId !== oldCorrectnessId) {
                        this.processCorrectnessChange();
                    }
                }
            }
        }
    }

    /** Descendants need to implement to indicate when they are usable.
     * The result is used to determine whether processUsableChanged() is called */
     protected abstract calculateUsabilityBadness(): Badness;
    }

export namespace DataItem {
    export type SubscribeDataItemFtn = (this: void, dataDefinition: DataDefinition) => DataItem;
    export type UnsubscribeDataItemFtn = (this: void, dataItem: DataItem) => void;

    export type BeginChangesEventHandler = (this: void, DataItem: DataItem) => void;
    export type EndChangesEventHandler = (this: void, DataItem: DataItem) => void;
    export type SubscriptionStatusChangeEventHandler = (this: void, DataItem: DataItem) => void;
    export type CorrectnessChangeEventHandler = (this: void) => void;
    export type BadnessChangeEventHandler = (this: void) => void;
    export type SubscriptionConfirmationEventHandler = (this: void, DataItem: DataItem) => void;

    export type WantActivationEventHandler = (this: void, DataItem: DataItem) => void;
    export type KeepActivationEventHandler = (this: void, DataItem: DataItem) => void;
    export type CancelWantActivationEventHandler = (this: void, DataItem: DataItem) => void;
    export type AvailableForDeactivationEventHandler = (this: void, DataItem: DataItem) => void;
    export type RequireDestructionEventHandler = (this: void, DataItem: DataItem) => void;

    export type RequirePublisherEventHandler = (this: void, definition: DataDefinition) => Publisher;

    export type RequireDataItemEventHandler = (this: void, Definition: DataDefinition) => DataItem;
    export type ReleaseDataItemEventHandler = (this: void, DataItem: DataItem) => void;

    export type TProcessMessageEventHandler = (DataItem: DataItem, NowTickTime: SysTick.Time, Msg: DataMessage) => void;
}

export namespace DataItemModule {
    export function initialiseStatic(): void {
        Badness.Reason.initialise();
    }
}
