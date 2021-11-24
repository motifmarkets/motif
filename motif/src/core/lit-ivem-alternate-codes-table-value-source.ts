/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, LitIvemFullDetail, SymbolsDataItem } from 'adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from 'sys-internal-api';
import { LitIvemAlternateCodesTableFieldDefinitionSource } from './lit-ivem-alternate-codes-table-field-definition-source';
import { CorrectnessTableGridValue, StringCorrectnessTableGridValue, TableGridValue } from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class LitIvemAlternateCodesTableValueSource extends TableValueSource {
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
        const fieldCount = LitIvemAlternateCodesTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = LitIvemAlternateCodesTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return LitIvemAlternateCodesTableFieldDefinitionSource.Field.count;
    }

    private handleDetailChangedEvent(changedFieldIds: LitIvemFullDetail.ExtendedField.Id[]) {
        if (changedFieldIds.includes(LitIvemFullDetail.ExtendedField.Id.Attributes)) {
            const allValues = this.getAllValues();
            this.notifyAllValuesChangeEvent(allValues);
        }
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = LitIvemAlternateCodesTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LitIvemAlternateCodes.Field.Id, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        const alternateCodes = this._litIvemFullDetail.alternateCodes as LitIvemAlternateCodes;

        switch (id) {
            case LitIvemAlternateCodes.Field.Id.Ticker:
                const tickerValue = value as StringCorrectnessTableGridValue;
                tickerValue.data = alternateCodes?.ticker;
                break;
            case LitIvemAlternateCodes.Field.Id.Gics:
                const gicsValue = value as StringCorrectnessTableGridValue;
                gicsValue.data = alternateCodes?.gics;
                break;
            case LitIvemAlternateCodes.Field.Id.Isin:
                const isinValue = value as StringCorrectnessTableGridValue;
                isinValue.data = alternateCodes?.isin;
                break;
            case LitIvemAlternateCodes.Field.Id.Ric:
                const ricValue = value as StringCorrectnessTableGridValue;
                ricValue.data = alternateCodes?.ric;
                break;
            case LitIvemAlternateCodes.Field.Id.Base:
                const baseValue = value as StringCorrectnessTableGridValue;
                baseValue.data = alternateCodes?.base;
                break;
            default:
                throw new UnreachableCaseError('LIACTVSLV100194588', id);
        }
    }
}
