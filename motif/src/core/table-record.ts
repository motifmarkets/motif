/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';
import { TableGridValue } from './table-grid-value';
import { TableRecordDefinition } from './table-record-definition';
import { TableValueList } from './table-value-list';

export class TableRecord {
    index: Integer;

    valueChangeEvent: TableRecord.ValueChangeEvent;
    recordChangeEvent: TableRecord.RecordChangeEvent;
    firstUsableEvent: TableRecord.FirstUsableEvent;

    private _definition: TableRecordDefinition;
    private _valueList: TableValueList;
    private _gridRecord: TableRecord.GridRecord;
    private _beginValuesChangeCount = 0;
    private _changedFieldIndex: Integer = TableRecord.ChangedFieldIndex_None;

    constructor(initialIndex: Integer) {
        this.index = initialIndex;
    }

    get definition() { return this._definition; }
    get firstUsable() { return this._valueList.firstUsable; }

    setRecordDefinition(recordDefinition: TableRecordDefinition, newValueList: TableValueList) {
        this._definition = recordDefinition;
        this._valueList = newValueList;
        this._valueList.beginValuesChangeEvent = () => this.handleBeginValuesChangeEvent();
        this._valueList.endValuesChangeEvent = () => this.handleEndValuesChangeEvent();
        this._valueList.valuesChangeEvent = (changedValues) => this.handleValuesChangeEvent(changedValues);
        this._valueList.sourceAllValuesChangeEvent =
            (firstFieldIdx, newValues) => this.handleSourceAllValuesChangeEvent(firstFieldIdx, newValues);
        this._valueList.firstUsableEvent = () => this.handleFirstUsableEvent();
    }

    activate() {
        this._gridRecord = this._valueList.activate();
        this._valueList.checkFirstUsable();
    }

    deactivate() {
        this._valueList.deactivate();
    }

    createGridRecordCopy(): TableRecord.GridRecord {
        const recordLength = this._gridRecord.length;
        const result = new Array<TableGridValue>(recordLength);
        for (let i = 0; i < recordLength; i++) {
            result[i] = this._gridRecord[i];
        }
        return result;
    }

    updateAllValues() {
        this._gridRecord = this._valueList.getAllValues();
    }

    clearRendering() {
        for (let i = 0; i < this._gridRecord.length; i++) {
            const value = this._gridRecord[i];
            value.clearRendering();
        }
    }

    private handleBeginValuesChangeEvent() {
        this.beginValuesChange();
    }

    private handleEndValuesChangeEvent() {
        this.endValuesChange();
    }

    private handleValuesChangeEvent(changedValues: TableValueList.ChangedValue[]) {
        const changedValuesCount = changedValues.length;
        if (changedValuesCount > 0) {
            this.beginValuesChange();
            try {
                if (this._changedFieldIndex === TableRecord.ChangedFieldIndex_None) {
                    this._changedFieldIndex =
                        changedValuesCount === 1 ? changedValues[0].fieldIdx : TableRecord.ChangedFieldIndex_MoreThanOne;
                }

                for (let i = 0; i < changedValuesCount; i++) {
                    const { fieldIdx, newValue } = changedValues[i];
                    this._gridRecord[fieldIdx] = newValue;
                }
            } finally {
                this.endValuesChange();
            }
        }
    }

    private handleSourceAllValuesChangeEvent(firstFieldIdx: Integer, newValues: TableGridValue[]) {
        const newValuesCount = newValues.length;
        if (newValuesCount > 0) {
            this.beginValuesChange();
            try {
                if (this._changedFieldIndex === TableRecord.ChangedFieldIndex_None) {
                    this._changedFieldIndex = newValuesCount === 1 ? firstFieldIdx : TableRecord.ChangedFieldIndex_MoreThanOne;
                }

                let fieldIdx = firstFieldIdx;
                for (let i = 0; i < newValuesCount; i++) {
                    this._gridRecord[fieldIdx++] = newValues[i];
                }
            } finally {
                this.endValuesChange();
            }
        }
    }

    private handleFirstUsableEvent() {
        this.firstUsableEvent(this.index);
    }

    private beginValuesChange() {
        if (this._beginValuesChangeCount === 0) {
            this._changedFieldIndex = TableRecord.ChangedFieldIndex_None;
        }
        this._beginValuesChangeCount++;
    }

    private endValuesChange() {
        this._beginValuesChangeCount--;
        if (this._beginValuesChangeCount === 0) {
            switch (this._changedFieldIndex) {
                case TableRecord.ChangedFieldIndex_None:
                    // nothing changed so no need to notify
                    break;
                case TableRecord.ChangedFieldIndex_MoreThanOne:
                    // if more than one, flag all of record changed - more efficient
                    this.recordChangeEvent(this.index);
                    break;
                default:
                    // only one field changed - notify
                    this.valueChangeEvent(this._changedFieldIndex, this.index);
            }
        }
    }
}

export namespace TableRecord {
    export type GridRecord = TableGridValue[];
    export type ValueChangeEvent = (this: void, fieldIdx: Integer, recordIdx: Integer) => void;
    export type RecordChangeEvent = (this: void, recordIdx: Integer) => void;
    export type FirstUsableEvent = (this: void, recordIdx: Integer) => void;

    export const ChangedFieldIndex_None = -1;
    export const ChangedFieldIndex_MoreThanOne = -2;
}
