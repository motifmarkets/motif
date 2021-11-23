/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList, Integer } from 'src/sys/internal-api';
import { TableGridValue } from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class TableValueList {
    valueChangesEvent: TableValueList.ValueChangesEvent;
    sourceAllValuesChangeEvent: TableValueList.AllSourceValuesChangeEvent;
    beenUsableBecameTrueEvent: TableValueList.BeenUsableBecameTrueEvent;

    private _sources = new ComparableList<TableValueSource>();
    private _fieldCount = 0;
    private _beenUsable = false;
    private _beginValuesChangeCount = 0;

    get fieldCount() { return this._fieldCount; }
    get beenUsable(): boolean { return this._beenUsable; }

    activate() {
        let record: TableGridValue[] = [];
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            const sourceValues = source.activate();
            record = record.concat(sourceValues);
        }

        this._beenUsable = this.calculateBeenUsable();

        return record;
    }

    deactivate() {
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            source.deactivate();
        }
    }

    addSource(source: TableValueSource) {
        source.valueChangesEvent = (valueChanges) => this.handleSourceValueChangesEvent(valueChanges);
        source.allValuesChangeEvent = (idx, newValues) => this.handleSourceAllValuesChangeEvent(idx, newValues);
        source.beenUsableBecameTrueEvent = () => this.handleBeenUsableBecameTrueEvent();

        this._sources.add(source);
        this._fieldCount += source.fieldCount;
    }

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

    private handleSourceValueChangesEvent(valueChanges: TableValueSource.ValueChange[]) {
        this.valueChangesEvent(valueChanges);
    }

    private handleSourceAllValuesChangeEvent(idx: Integer, newValues: TableGridValue[]) {
        this.sourceAllValuesChangeEvent(idx, newValues);
    }

    private handleBeenUsableBecameTrueEvent() {
        if (!this._beenUsable) {

            const beenUsable = this.calculateBeenUsable();

            if (beenUsable) {
                this._beenUsable = true;
                this.beenUsableBecameTrueEvent();
            }
        }
    }

    private calculateBeenUsable() {
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            if (!source.beenUsable) {
                return false;
            }
        }

        return true;
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
    export type ValueChange = TableValueSource.ValueChange;
    export interface FindValueResult {
        found: boolean;
        sourceIdx: Integer;
        sourceFieldIdx: Integer;
    }
    export type BeginValuesChangeEvent = (this: void) => void;
    export type EndValuesChangeEvent = (this: void) => void;
    export type ValueChangesEvent = (valueChanges: TableValueSource.ValueChange[]) => void;
    export type AllSourceValuesChangeEvent = (fieldIdx: Integer, newValues: TableGridValue[]) => void;
    export type BeenUsableBecameTrueEvent = (this: void) => void;
}
