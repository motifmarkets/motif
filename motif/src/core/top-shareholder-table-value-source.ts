/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TopShareholder, TopShareholdersDataItem } from 'src/adi/internal-api';
import { Integer, UnreachableCaseError } from 'src/sys/internal-api';
import {
    CorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue, StringCorrectnessTableGridValue, TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';
import { TopShareholderTableFieldDefinitionSource } from './top-shareholder-table-field-definition-source';

export class TopShareholderTableValueSource extends TableValueSource {
    constructor(firstFieldIndexOffset: Integer, private _topShareholder: TopShareholder,
        private _dataItem: TopShareholdersDataItem) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        return this.getAllValues();
    }

    deactivate() {
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = TopShareholderTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = TopShareholderTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return TopShareholderTableFieldDefinitionSource.Field.count;
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = TopShareholderTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: TopShareholder.FieldId, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        switch (id) {
            case TopShareholder.FieldId.Name:
                (value as StringCorrectnessTableGridValue).data = this._topShareholder.name;
                break;
            case TopShareholder.FieldId.Designation:
                (value as StringCorrectnessTableGridValue).data = this._topShareholder.designation;
                break;
            case TopShareholder.FieldId.HolderKey:
                (value as StringCorrectnessTableGridValue).data = this._topShareholder.holderKey;
                break;
            case TopShareholder.FieldId.SharesHeld:
                (value as IntegerCorrectnessTableGridValue).data = this._topShareholder.sharesHeld;
                break;
            case TopShareholder.FieldId.TotalShareIssue:
                (value as IntegerCorrectnessTableGridValue).data = this._topShareholder.totalShareIssue;
                break;
            case TopShareholder.FieldId.SharesChanged:
                (value as IntegerCorrectnessTableGridValue).data = this._topShareholder.sharesChanged;
                break;
            default:
                throw new UnreachableCaseError('TSHTVSLV10094', id);
        }
    }
}
