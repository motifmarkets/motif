/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataRecord } from 'src/adi/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { TableGridValue } from './table-grid-value';
import { TableValueSource } from './table-value-source';

export abstract class DataRecordTableValueSource<Record extends DataRecord> extends TableValueSource {
    private _recordCorrectnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    activate() {
        const record = this.getRecord();
        this._recordCorrectnessChangedEventSubscriptionId = record.subscribeCorrectnessChangedEvent(
            () => this.handleHoldingCorrectnessChangedEvent()
        );

        return this.getAllValues();
    }

    deactivate() {
        const record = this.getRecord();
        record.unsubscribeCorrectnessChangedEvent(this._recordCorrectnessChangedEventSubscriptionId);
        this._recordCorrectnessChangedEventSubscriptionId = undefined;
    }

    private handleHoldingCorrectnessChangedEvent() {
        const changedValues = this.getAllValues();
        this.notifyAllValuesChangeEvent(changedValues);
    }

    abstract getAllValues(): TableGridValue[];
    protected abstract getRecord(): Record;
}
