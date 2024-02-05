/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent, ScanFieldCondition } from '@motifmarkets/motif-core';
import { ScanFieldConditionOperandsEditorFrame } from './operands/internal-api';

export abstract class ScanFieldConditionEditorFrame implements ScanFieldCondition, ScanFieldConditionOperandsEditorFrame {
    private readonly _changedMultiEvent = new MultiEvent<ScanFieldConditionOperandsEditorFrame.ChangedEventHandler>();

    private _valid = false;

    constructor(
        readonly typeId: ScanFieldCondition.TypeId,
        readonly operandsTypeId: ScanFieldCondition.Operands.TypeId,
        protected _affirmativeOperatorDisplayLines: readonly string[],
        readonly _removeMeEventer: ScanFieldConditionEditorFrame.RemoveMeEventer,
        private readonly _changedEventer: ScanFieldConditionEditorFrame.ChangedEventer,
    ) {
    }

    get valid() { return this._valid; }
    get affirmativeOperatorDisplayLines() { return this._affirmativeOperatorDisplayLines; }
    abstract get operatorId(): ScanFieldCondition.OperatorId;

    updateValid() {
        this._valid = this.calculateValid();
    }

    removeMe(operandsEditorFrame: ScanFieldConditionOperandsEditorFrame) {
        this._removeMeEventer(operandsEditorFrame as ScanFieldConditionEditorFrame);
    }

    subscribeChangedEvent(handler: ScanFieldConditionOperandsEditorFrame.ChangedEventHandler) {
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
            handler();
        }
    }

    protected abstract calculateValid(): boolean;
}

export namespace ScanFieldConditionEditorFrame {
    export type RemoveMeEventer = (this: void, frame: ScanFieldConditionEditorFrame) => void;
    export type ChangedEventer = (this: void, valid: boolean) => void;
}
