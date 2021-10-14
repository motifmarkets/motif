/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { AdiService } from 'src/adi/internal-api';
import { Integer } from 'src/sys/internal-api';
import { TableGridValue } from './table-grid-value';

export abstract class TableValueSource {
    valueChangesEvent: TableValueSource.ValueChangesEvent;
    allValuesChangeEvent: TableValueSource.AllValuesChangeEvent;
    firstUsableEvent: TableValueSource.FirstUsableEvent;

    protected _firstUsable = false; // this has not been implemented.  Only used for tables to resize columns when all data good

    constructor(private readonly _firstFieldIndexOffset: Integer ) { }

    get firstUsable(): boolean { return this._firstUsable; }
    get fieldCount() { return this.getfieldCount(); }
    get firstFieldIndexOffset() { return this._firstFieldIndexOffset; }

    protected notifyValueChangesEvent(valueChanges: TableValueSource.ValueChange[]) {
        for (let i = 0; i < valueChanges.length; i++) {
            valueChanges[i].fieldIndex += this._firstFieldIndexOffset;
        }
        this.valueChangesEvent(valueChanges);
    }

    protected notifyAllValuesChangeEvent(newValues: TableGridValue[]) {
        this.allValuesChangeEvent(this._firstFieldIndexOffset, newValues);
    }

    protected notifyFirstUsable() {
        this.firstUsableEvent();
    }

    abstract activate(): TableGridValue[];
    abstract deactivate(): void;
    abstract getAllValues(): TableGridValue[];

    protected abstract getfieldCount(): Integer;
}

export namespace TableValueSource {
    export interface ChangedValue {
        fieldIdx: Integer;
        newValue: TableGridValue;
    }
    export interface ValueChange {
        fieldIndex: Integer;
        newValue: TableGridValue;
        recentChangeTypeId: RevRecordValueRecentChangeTypeId | undefined;
    }
    export type BeginValuesChangeEvent = (this: void) => void;
    export type EndValuesChangeEvent = (this: void) => void;
    export type ValueChangesEvent = (valueChanges: ValueChange[]) => void;
    export type AllValuesChangeEvent = (firstFieldIdxOffset: Integer, newValues: TableGridValue[]) => void;
    export type FirstUsableEvent = (this: void) => void;
    export type Constructor = new(firstFieldIdxOffset: Integer, recordIdx: Integer, adi: AdiService) => TableValueSource;
}
