/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, UnreachableCaseError } from 'sys-internal-api';
import { CallPut } from './call-put';
import { CallPutTableFieldDefinitionSource } from './call-put-table-field-definition-source';
import {
    BooleanTableGridValue,
    DateTableGridValue,
    DecimalTableGridValue,
    EnumTableGridValue,
    IvemIdTableGridValue,
    LitIvemIdTableGridValue,
    PriceTableGridValue,
    TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class CallPutTableValueSource extends TableValueSource {
    constructor(firstFieldIndexOffset: Integer, private _callPut: CallPut) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        return this.getAllValues();
    }

    deactivate() {
        // nothing to do
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = CallPutTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = CallPutTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return CallPutTableFieldDefinitionSource.Field.count;
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = CallPutTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: CallPut.FieldId, value: TableGridValue) {
        switch (id) {
            case CallPut.FieldId.ExercisePrice:
                (value as PriceTableGridValue).data = this._callPut.exercisePrice;
                break;
            case CallPut.FieldId.ExpiryDate:
                (value as DateTableGridValue).data = this._callPut.expiryDate;
                break;
            case CallPut.FieldId.LitId:
                (value as EnumTableGridValue).data = this._callPut.litId;
                break;
            case CallPut.FieldId.CallLitIvemId:
                (value as LitIvemIdTableGridValue).data = this._callPut.callLitIvemId;
                break;
            case CallPut.FieldId.PutLitIvemId:
                (value as LitIvemIdTableGridValue).data = this._callPut.putLitIvemId;
                break;
            case CallPut.FieldId.ContractMultiplier:
                (value as DecimalTableGridValue).data = this._callPut.contractMultiplier;
                break;
            case CallPut.FieldId.ExerciseTypeId:
                (value as EnumTableGridValue).data = this._callPut.exerciseTypeId;
                break;
            case CallPut.FieldId.UnderlyingIvemId:
                (value as IvemIdTableGridValue).data = this._callPut.underlyingIvemId;
                break;
            case CallPut.FieldId.UnderlyingIsIndex:
                (value as BooleanTableGridValue).data = this._callPut.underlyingIsIndex;
                break;
            default:
                throw new UnreachableCaseError('HTVSTVSLV8851', id);
        }
    }
}
