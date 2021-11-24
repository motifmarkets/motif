/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'sys-internal-api';
import { TableGridValue } from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class UndefinedTableValueSource extends TableValueSource {
    constructor(firstFieldIndexOffset: Integer, private _valueArray: TableGridValue[]) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        return this.getAllValues();
    }

    deactivate() {
        // nothing to do
    }

    getAllValues(): TableGridValue[] {
        return this._valueArray;
    }

    protected getfieldCount() {
        return this._valueArray.length;
    }
}
