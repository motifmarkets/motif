/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataRecord } from 'adi-internal-api';
import { Correctness, MultiEvent } from 'sys-internal-api';
import { TableGridValue } from './table-grid-value';
import { TableValueSource } from './table-value-source';

export abstract class DataRecordTableValueSource<Record extends DataRecord> extends TableValueSource {
    private _recordCorrectnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    activate() {
        const record = this.getRecord();
        this._recordCorrectnessChangedEventSubscriptionId = record.subscribeCorrectnessChangedEvent(
            () => this.handleRecordCorrectnessChangedEvent()
        );

        const correctnessId = record.correctnessId;
        const usable = Correctness.idIsUsable(correctnessId);
        this.initialiseBeenUsable(usable);

        return this.getAllValues();
    }

    deactivate() {
        const record = this.getRecord();
        record.unsubscribeCorrectnessChangedEvent(this._recordCorrectnessChangedEventSubscriptionId);
        this._recordCorrectnessChangedEventSubscriptionId = undefined;
    }

    private handleRecordCorrectnessChangedEvent() {
        const allValues = this.getAllValues();
        const correctnessId = this.getRecord().correctnessId;
        const usable = Correctness.idIsUsable(correctnessId);
        this.processDataCorrectnessChange(allValues, usable);
    }

    abstract override getAllValues(): TableGridValue[];
    protected abstract getRecord(): Record;
}
