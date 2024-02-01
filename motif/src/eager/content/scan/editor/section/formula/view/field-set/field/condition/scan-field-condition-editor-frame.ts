/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent, ScanFieldCondition } from '@motifmarkets/motif-core';

export abstract class ScanFieldConditionEditorFrame implements ScanFieldCondition {
    private readonly _changedMultiEvent = new MultiEvent<ScanFieldConditionEditorFrame.ChangedEventHandler>();
    private _valid = false;

    abstract readonly typeId: ScanFieldCondition.TypeId;

    constructor(private readonly _changedEventer: ScanFieldConditionEditorFrame.ChangedEventHandler) {

    }

    get valid() { return this._valid; }
    abstract get operatorId(): ScanFieldCondition.OperatorId;

    updateValid() {
        this._valid = this.calculateValid();
    }

    subscribeChangedEvent(handler: ScanFieldConditionEditorFrame.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    protected processChanged() {
        const valid = this.calculateValid();
        this.notifyChanged(valid);
    }

    private notifyChanged(valid: boolean) {
        this._changedEventer(valid);

        const handlers = this._changedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(valid);
        }
    }

    protected abstract calculateValid(): boolean;
}

export namespace ScanFieldConditionEditorFrame {
    export type ChangedEventHandler = (this: void, valid: boolean) => void;
}
