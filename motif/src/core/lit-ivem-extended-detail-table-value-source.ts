/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemFullDetail, SymbolsDataItem } from 'src/adi/internal-api';
import { AssertInternalError, Integer, MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';
import { LitIvemExtendedDetailTableFieldDefinitionSource } from './lit-ivem-extended-detail-table-field-definition-source';
import {
    BooleanCorrectnessTableGridValue,
    CallOrPutIdCorrectnessTableGridValue,
    CorrectnessTableGridValue,
    DepthDirectionIdCorrectnessTableGridValue,
    ExerciseTypeIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,

    SourceTzOffsetDateCorrectnessTableGridValue, StringArrayCorrectnessTableGridValue,

    StringCorrectnessTableGridValue, TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class LitIvemExtendedDetailTableValueSource extends TableValueSource {
    private _litIvemDetailExtendedChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _litIvemFullDetail: LitIvemFullDetail, private _dataItem: SymbolsDataItem) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        this._litIvemDetailExtendedChangedEventSubscriptionId = this._litIvemFullDetail.subscribeExtendedChangeEvent(
            (changedFieldIds) => this.handleDetailChangedEvent(changedFieldIds)
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._litIvemDetailExtendedChangedEventSubscriptionId !== undefined) {
            this._litIvemFullDetail.unsubscribeExtendedChangeEvent(this._litIvemDetailExtendedChangedEventSubscriptionId);
            this._litIvemDetailExtendedChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = LitIvemExtendedDetailTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = LitIvemExtendedDetailTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return LitIvemExtendedDetailTableFieldDefinitionSource.Field.count;
    }

    private handleDetailChangedEvent(changedFieldIds: LitIvemFullDetail.ExtendedField.Id[]) {
        const changedFieldCount = changedFieldIds.length;
        const changedValues = new Array<TableValueSource.ChangedValue>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < changedFieldIds.length; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIdx = LitIvemExtendedDetailTableFieldDefinitionSource.Field.indexOfId(fieldId);
            if (fieldIdx >= 0) {
                const newValue = this.createTableGridValue(fieldIdx);
                this.loadValue(fieldId, newValue);
                changedValues[foundCount++] = { fieldIdx, newValue };
            }
        }
        if (foundCount < changedFieldCount) {
            changedValues.length = foundCount;
        }
        this.notifyValuesChangeEvent(changedValues);
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = LitIvemExtendedDetailTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LitIvemFullDetail.ExtendedField.Id, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        switch (id) {
            case LitIvemFullDetail.ExtendedField.Id.Cfi:
                (value as StringCorrectnessTableGridValue).data = this._litIvemFullDetail.cfi;
                break;
            case LitIvemFullDetail.ExtendedField.Id.DepthDirectionId:
                (value as DepthDirectionIdCorrectnessTableGridValue).data = this._litIvemFullDetail.depthDirectionId;
                break;
            case LitIvemFullDetail.ExtendedField.Id.IsIndex:
                (value as BooleanCorrectnessTableGridValue).data = this._litIvemFullDetail.isIndex;
                break;
            case LitIvemFullDetail.ExtendedField.Id.ExpiryDate:
                (value as SourceTzOffsetDateCorrectnessTableGridValue).data = this._litIvemFullDetail.expiryDate;
                break;
            case LitIvemFullDetail.ExtendedField.Id.StrikePrice:
                (value as PriceCorrectnessTableGridValue).data = this._litIvemFullDetail.strikePrice;
                break;
            case LitIvemFullDetail.ExtendedField.Id.ExerciseTypeId:
                (value as ExerciseTypeIdCorrectnessTableGridValue).data = this._litIvemFullDetail.exerciseTypeId;
                break;
            case LitIvemFullDetail.ExtendedField.Id.CallOrPutId:
                (value as CallOrPutIdCorrectnessTableGridValue).data = this._litIvemFullDetail.callOrPutId;
                break;
            case LitIvemFullDetail.ExtendedField.Id.ContractSize:
                (value as IntegerCorrectnessTableGridValue).data = this._litIvemFullDetail.contractSize;
                break;
            case LitIvemFullDetail.ExtendedField.Id.Categories:
                (value as StringArrayCorrectnessTableGridValue).data = this._litIvemFullDetail.categories;
                break;
            case LitIvemFullDetail.ExtendedField.Id.AlternateCodes:
            case LitIvemFullDetail.ExtendedField.Id.Attributes:
            case LitIvemFullDetail.ExtendedField.Id.TmcLegs:
                throw new AssertInternalError('LIEDTVSLVA44824483', LitIvemFullDetail.ExtendedField.idToName(id));
            default:
                throw new UnreachableCaseError('LIEDTVSLV577555493', id);
        }
    }
}
