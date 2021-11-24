/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecord, RevRecordInvalidatedValue } from 'revgrid';
import { Integer } from 'sys-internal-api';
import { TableGridValue } from './table-grid-value';
import { TableRecordDefinition } from './table-record-definition';
import { TableValueList } from './table-value-list';

export class TableRecord implements RevRecord {
    index: Integer;

    valuesChangedEvent: TableRecord.ValuesChangedEvent;
    fieldsChangedEvent: TableRecord.FieldsChangedEvent;
    recordChangedEvent: TableRecord.RecordChangedEvent;
    firstUsableEvent: TableRecord.FirstUsableEvent; // Not implemented

    private _definition: TableRecordDefinition;
    private _valueList: TableValueList;
    private _values: TableGridValue[];
    private _beenUsable = false;

    constructor(initialIndex: Integer) {
        this.index = initialIndex;
    }

    get definition() { return this._definition; }
    get firstUsable() { return this._valueList.beenUsable; }
    get values(): readonly TableGridValue[] { return this._values; }

    setRecordDefinition(recordDefinition: TableRecordDefinition, newValueList: TableValueList) {
        this._definition = recordDefinition;
        this._valueList = newValueList;
        this._valueList.valueChangesEvent = (valueChanges) => this.handleValueChangesEvent(valueChanges);
        this._valueList.sourceAllValuesChangeEvent =
            (firstFieldIdx, newValues) => this.handleSourceAllValuesChangeEvent(firstFieldIdx, newValues);
        this._valueList.beenUsableBecameTrueEvent = () => { this._beenUsable = true; };
    }

    activate() {
        this._values = this._valueList.activate();
        this._beenUsable = this._valueList.beenUsable;
    }

    deactivate() {
        this._valueList.deactivate();
    }

    updateAllValues() {
        this._values = this._valueList.getAllValues();
    }

    clearRendering() {
        for (let i = 0; i < this._values.length; i++) {
            const value = this._values[i];
            value.clearRendering();
        }
    }

    private handleValueChangesEvent(valueChanges: TableValueList.ValueChange[]) {
        const valueChangesCount = valueChanges.length;
        if (valueChangesCount > 0) {
            const invalidatedValues = new Array<RevRecordInvalidatedValue>(valueChangesCount);
            let invalidatedValueCount = 0;

            for (let i = 0; i < valueChangesCount; i++) {
                const { fieldIndex, newValue, recentChangeTypeId } = valueChanges[i];
                this._values[fieldIndex] = newValue;

                if (recentChangeTypeId !== undefined && this._beenUsable) {
                    invalidatedValues[invalidatedValueCount++] = {
                        fieldIndex,
                        typeId: recentChangeTypeId,
                    };
                }
            }

            invalidatedValues.length = invalidatedValueCount;
            this.valuesChangedEvent(this.index, invalidatedValues);
        }
    }

    private handleSourceAllValuesChangeEvent(firstFieldIndex: Integer, newValues: TableGridValue[]) {
        const newValuesCount = newValues.length;
        if (newValuesCount > 0) {
            let fieldIndex = firstFieldIndex;
            for (let i = 0; i < newValuesCount; i++) {
                this._values[fieldIndex++] = newValues[i];
            }

            const recordChange = firstFieldIndex === 0 && newValuesCount === this._values.length;
            if (recordChange) {
                this.recordChangedEvent(this.index);
            } else {

                this.fieldsChangedEvent(this.index, firstFieldIndex, newValuesCount);
            }
        }
    }
}

export namespace TableRecord {
    export type ValuesChangedEvent = (this: void, recordIdx: Integer, invalidatedValues: RevRecordInvalidatedValue[]) => void;
    export type FieldsChangedEvent = (this: void, recordIdx: Integer, fieldIdx: Integer, fieldCount: Integer) => void;
    export type RecordChangedEvent = (this: void, recordIdx: Integer) => void;
    export type FirstUsableEvent = (this: void, recordIdx: Integer) => void;
}
