/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'adi-internal-api';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { Integer } from 'sys-internal-api';
import { TableGridValue } from './table-grid-value';

export abstract class TableValueSource {
    valueChangesEvent: TableValueSource.ValueChangesEvent;
    allValuesChangeEvent: TableValueSource.AllValuesChangeEvent;
    beenUsableBecameTrueEvent: TableValueSource.BeenUsableBecameTrueEvent;

    protected _beenUsable = false;

    constructor(private readonly _firstFieldIndexOffset: Integer ) { }

    get beenUsable(): boolean { return this._beenUsable; }
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

    protected initialiseBeenUsable(value: boolean) {
        this._beenUsable = value;
    }

    protected processDataCorrectnessChange(allValues: TableGridValue[], isUsable: boolean) {
        this.allValuesChangeEvent(this._firstFieldIndexOffset, allValues);

        if (isUsable) {
            this.checkNotifyBeenUsableBecameTrue();
        }
    }

    private checkNotifyBeenUsableBecameTrue() {
        if (!this._beenUsable) {
            this._beenUsable = true;
            this.beenUsableBecameTrueEvent();
        }
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
    export type BeenUsableBecameTrueEvent = (this: void) => void;
    export type Constructor = new(firstFieldIdxOffset: Integer, recordIdx: Integer, adi: AdiService) => TableValueSource;
}
