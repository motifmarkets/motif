/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList, Integer } from 'src/sys/internal-api';
import { TableGridValue } from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class TableValueList {
    beginValuesChangeEvent: TableValueSource.BeginValuesChangeEvent;
    endValuesChangeEvent: TableValueSource.EndValuesChangeEvent;
    valuesChangeEvent: TableValueList.ValuesChangeEvent;
    sourceAllValuesChangeEvent: TableValueList.AllSourceValuesChangeEvent;
    firstUsableEvent: TableValueList.FirstUsableEvent;

    private _sources = new ComparableList<TableValueSource>();
    private _fieldCount = 0;
    private _firstUsable = false;
    private _beginValuesChangeCount = 0;


    get fieldCount() { return this._fieldCount; }

    activate() {
        let record: TableGridValue[] = [];
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            const sourceValues = source.activate();
            record = record.concat(sourceValues);
        }

        return record;
    }

    deactivate() {
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            source.deactivate();
        }
    }

    addSource(source: TableValueSource) {
        source.beginValuesChangeEvent = () => this.handleBeginValuesChangeEvent();
        source.endValuesChangeEvent = () => this.handleEndValuesChangeEvent();
        source.valuesChangeEvent = (changedValues) => this.handleSourceValuesChangeEvent(changedValues);
        source.allValuesChangeEvent = (idx, newValues) => this.handleSourceAllValuesChangeEvent(idx, newValues);
        source.firstUsableEvent = () => this.handleFirstUsableEvent();

        this._sources.add(source);
        this._fieldCount += source.fieldCount;
    }

    checkFirstUsable() {
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            if (!source.firstUsable) {
                return;
            }
        }

        this._firstUsable = true;
    }

    get firstUsable(): boolean { return this._firstUsable; }

    getAllValues(): TableGridValue[] {
        if (this._sources.count === 1) {
            return this._sources.getItem(0).getAllValues();
        } else {
            const values = new Array<TableGridValue>(this._fieldCount);
            let idx = 0;
            for (let srcIdx = 0; srcIdx < this._sources.count; srcIdx++) {
                const sourceValues = this._sources.getItem(srcIdx).getAllValues();
                for (let srcValueIdx = 0; srcValueIdx < sourceValues.length; srcValueIdx++) {
                    values[idx++] = sourceValues[srcValueIdx];
                }
            }
            return values;
        }
    }
    private handleBeginValuesChangeEvent() {
        this._beginValuesChangeCount++;
        if (this._beginValuesChangeCount === 1) {
            this.beginValuesChangeEvent();
        }
    }

    private handleEndValuesChangeEvent() {
        this._beginValuesChangeCount--;
        if (this._beginValuesChangeCount === 0) {
            this.endValuesChangeEvent();
        }
    }

    private handleSourceValuesChangeEvent(changedValues: TableValueSource.ChangedValue[]) {
        this.valuesChangeEvent(changedValues);
    }

    private handleSourceAllValuesChangeEvent(idx: Integer, newValues: TableGridValue[]) {
        this.sourceAllValuesChangeEvent(idx, newValues);
    }

    private handleFirstUsableEvent() {
        if (!this._firstUsable) {
            let allUsable = true;
            for (let i = 0; i < this._sources.count; i++) {
                const source = this._sources.getItem(i);
                if (!source.firstUsable) {
                    allUsable = false;
                    break;
                }
            }

            if (allUsable) {
                this._firstUsable = allUsable;
                this.firstUsableEvent();
            }
        }
    }

    /*private findValue(idx: Integer): TableValueList.FindValueResult {
        const sourceCount = this.sources.Count;
        if (idx >= 0 && sourceCount > 0) {
            for (let i = 0; i < sourceCount; i++) {
                const source = this.sources.GetItem(i);
                if (idx < source.nextIndexOffset) {
                    return {
                        found: true,
                        sourceIdx: i,
                        sourceFieldIdx: idx - source.firstFieldIndexOffset
                    };
                }
            }
        }

        return {
            found: false,
            sourceIdx: -1,
            sourceFieldIdx: -1
        };
    }*/
}

export namespace TableValueList {
    export type Sources = ComparableList<TableValueSource>;
    export type ChangedValue = TableValueSource.ChangedValue;
    export interface FindValueResult {
        found: boolean;
        sourceIdx: Integer;
        sourceFieldIdx: Integer;
    }
    export type BeginValuesChangeEvent = (this: void) => void;
    export type EndValuesChangeEvent = (this: void) => void;
    export type ValuesChangeEvent = (changedValues: ChangedValue[]) => void;
    export type AllSourceValuesChangeEvent = (fieldIdx: Integer, newValues: TableGridValue[]) => void;
    export type FirstUsableEvent = (this: void) => void;
}
