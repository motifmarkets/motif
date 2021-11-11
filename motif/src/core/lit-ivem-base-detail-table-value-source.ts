/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, LitIvemDetail, SymbolsDataItem } from 'src/adi/internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';
import { LitIvemBaseDetailTableFieldDefinitionSource } from './lit-ivem-base-detail-table-field-definition-source';
import {
    CorrectnessTableGridValue,
    ExchangeIdCorrectnessTableGridValue,
    IvemClassIdCorrectnessTableGridValue,
    LitIvemIdCorrectnessTableGridValue,
    MarketIdArrayCorrectnessTableGridValue,
    MarketIdCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TableGridValue,
    ZenithSubscriptionDataIdArrayCorrectnessTableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class LitIvemBaseDetailTableValueSource extends TableValueSource {
    private _litIvemDetailBaseChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _litIvemDetail: LitIvemDetail, private _dataItem: SymbolsDataItem) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        this._litIvemDetailBaseChangedEventSubscriptionId = this._litIvemDetail.subscribeBaseChangeEvent(
            (changedFieldIds) => this.handleDetailChangedEvent(changedFieldIds)
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._litIvemDetailBaseChangedEventSubscriptionId !== undefined) {
            this._litIvemDetail.unsubscribeBaseChangeEvent(this._litIvemDetailBaseChangedEventSubscriptionId);
            this._litIvemDetailBaseChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = LitIvemBaseDetailTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = LitIvemBaseDetailTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return LitIvemBaseDetailTableFieldDefinitionSource.Field.count;
    }

    private handleDetailChangedEvent(changedFieldIds: LitIvemDetail.BaseField.Id[]) {
        const changedFieldCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < changedFieldIds.length; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIndex = LitIvemBaseDetailTableFieldDefinitionSource.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableGridValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: undefined };
            }
        }
        if (foundCount < changedFieldCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = LitIvemBaseDetailTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LitIvemDetail.BaseField.Id, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        switch (id) {
            case LitIvemDetail.BaseField.Id.Id:
                (value as LitIvemIdCorrectnessTableGridValue).data = this._litIvemDetail.litIvemId;
                break;
            case LitIvemDetail.BaseField.Id.Code:
                (value as StringCorrectnessTableGridValue).data = this._litIvemDetail.code;
                break;
            case LitIvemDetail.BaseField.Id.MarketId:
                (value as MarketIdCorrectnessTableGridValue).data = this._litIvemDetail.marketId;
                break;
            case LitIvemDetail.BaseField.Id.IvemClassId:
                (value as IvemClassIdCorrectnessTableGridValue).data = this._litIvemDetail.ivemClassId;
                break;
            case LitIvemDetail.BaseField.Id.SubscriptionDataIds:
                (value as ZenithSubscriptionDataIdArrayCorrectnessTableGridValue).data = this._litIvemDetail.subscriptionDataIds;
                break;
            case LitIvemDetail.BaseField.Id.TradingMarketIds:
                (value as MarketIdArrayCorrectnessTableGridValue).data = this._litIvemDetail.tradingMarketIds;
                break;
            case LitIvemDetail.BaseField.Id.Name:
                (value as StringCorrectnessTableGridValue).data = this._litIvemDetail.name;
                break;
            case LitIvemDetail.BaseField.Id.ExchangeId:
                (value as ExchangeIdCorrectnessTableGridValue).data = this._litIvemDetail.exchangeId;
                break;
            case LitIvemDetail.BaseField.Id.AlternateCodes:
                const alternateCodes = this._litIvemDetail.alternateCodes;
                const data = (alternateCodes === undefined) ? '' : LitIvemAlternateCodes.toDisplay(alternateCodes);
                (value as StringCorrectnessTableGridValue).data = data;
                break;
            default:
                throw new UnreachableCaseError('LIBDTVSLV577555493', id);
        }
    }
}
