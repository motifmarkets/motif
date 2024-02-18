/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ModifierComparableList, MultiEvent, ScanFieldCondition } from '@motifmarkets/motif-core';
import { RootAndNodeComponentInstanceIdPair } from 'component-internal-api';
import { ScanFieldConditionOperandsEditorFrame } from './operands/internal-api';

export abstract class ScanFieldConditionEditorFrame implements ScanFieldCondition, ScanFieldConditionOperandsEditorFrame {
    deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer | undefined;
    changedEventer: ScanFieldConditionEditorFrame.ChangedEventer | undefined;

    private readonly _changedMultiEvent = new MultiEvent<ScanFieldConditionOperandsEditorFrame.ChangedEventHandler>();

    private _valid = false;

    constructor(
        readonly typeId: ScanFieldCondition.TypeId,
        readonly operandsTypeId: ScanFieldCondition.Operands.TypeId,
        protected _affirmativeOperatorDisplayLines: readonly string[],
    ) {
    }

    get valid() { return this._valid; }
    get affirmativeOperatorDisplayLines() { return this._affirmativeOperatorDisplayLines; }
    abstract get operatorId(): ScanFieldCondition.OperatorId;

    deleteMe(modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (this.deleteMeEventer === undefined) {
            throw new AssertInternalError('SFCEFDM34456');
        } else {
            this.deleteMeEventer(modifier);
        }
    }

    subscribeChangedEvent(handler: ScanFieldConditionOperandsEditorFrame.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    protected processChanged(modifier: ScanFieldConditionEditorFrame.Modifier) {
        this.updateValid();
        this.notifyChanged(modifier);
    }

    private notifyChanged(modifier: ScanFieldConditionEditorFrame.Modifier) {
        if (this.changedEventer === undefined) {
            throw new AssertInternalError('SFCEFNC34456');
        } else {
            this.changedEventer(this._valid, modifier);
        }

        const handlers = this._changedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(modifier.node);
        }
    }

    private updateValid() {
        this._valid = this.calculateValid();
    }

    protected abstract calculateValid(): boolean;
}

export namespace ScanFieldConditionEditorFrame {
    export type Modifier = RootAndNodeComponentInstanceIdPair

    export class List<T extends ScanFieldConditionEditorFrame> extends ModifierComparableList<T, Modifier | undefined, ScanFieldConditionEditorFrame> {
        constructor() {
            super(undefined);
        }
    }
    export type DeleteMeEventer = (this: void, modifier: Modifier) => void;
    export type ChangedEventer = (this: void, valid: boolean, modifier: Modifier) => void;
}
