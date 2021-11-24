/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataRecord } from 'adi-internal-api';
import { AssertInternalError, JsonElement } from 'sys-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export abstract class DataRecordTableRecordDefinition<Record extends DataRecord> extends TableRecordDefinition {
    constructor(typeId: TableRecordDefinition.TypeId, readonly record: Record | undefined, private _key: DataRecord.Key | undefined) {
        super(typeId);
    }

    get mapKey() {
        if (this.record !== undefined) {
            return this.record.mapKey;
        } else {
            if (this._key !== undefined) {
                return this._key.mapKey;
            } else {
                throw new AssertInternalError('DRTRDGMK66304423');
            }
        }
    }

    get key() {
        if (this._key !== undefined) {
            return this._key;
        } else {
            if (this.record !== undefined) {
                this._key = this.record.createKey();
                return this._key;
            } else {
                throw new AssertInternalError('DRTRDGK66304423');
            }
        }
    }

    saveKeyToJson(element: JsonElement) {
        this.key.saveToJson(element);
    }
}
