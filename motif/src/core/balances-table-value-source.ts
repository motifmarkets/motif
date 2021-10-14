/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Balances } from 'src/adi/internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';
import { BalancesTableFieldDefinitionSource } from './balances-table-field-definition-source';
import { DataRecordTableValueSource } from './data-record-table-value-source';
import {
    CorrectnessTableGridValue,
    CurrencyIdCorrectnessTableGridValue,
    DecimalCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class BalancesTableValueSource extends DataRecordTableValueSource<Balances> {
    private _balancesChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _balances: Balances) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableGridValue[] {
        this._balancesChangedEventSubscriptionId = this._balances.subscribeChangedEvent(
            (valueChanges) => this.handleBalancesChangedEvent(valueChanges)
        );

        return super.activate();
    }

    override deactivate() {
        this._balances.unsubscribeChangedEvent(this._balancesChangedEventSubscriptionId);
        this._balancesChangedEventSubscriptionId = undefined;

        super.deactivate();
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = BalancesTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = BalancesTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getRecord() {
        return this._balances;
    }

    protected getfieldCount(): Integer {
        return BalancesTableFieldDefinitionSource.Field.count;
    }

    private handleBalancesChangedEvent(balanceValueChanges: Balances.ValueChange[]) {
        const valueChangeCount = balanceValueChanges.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(valueChangeCount);
        let foundCount = 0;
        for (let i = 0; i < balanceValueChanges.length; i++) {
            const { fieldId, recentChangeTypeId } = balanceValueChanges[i];
            const fieldIndex = BalancesTableFieldDefinitionSource.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableGridValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId };
            }
        }
        if (foundCount < valueChangeCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = BalancesTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Balances.FieldId, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._balances.correctnessId;

        switch (id) {
            case Balances.FieldId.AccountId:
                (value as StringCorrectnessTableGridValue).data = this._balances.accountId;
                break;
            case Balances.FieldId.Currency:
                (value as CurrencyIdCorrectnessTableGridValue).data = this._balances.currencyId;
                break;
            case Balances.FieldId.NetBalance:
                (value as DecimalCorrectnessTableGridValue).data = this._balances.netBalance;
                break;
            case Balances.FieldId.Trading:
                (value as DecimalCorrectnessTableGridValue).data = this._balances.trading;
                break;
            case Balances.FieldId.NonTrading:
                (value as DecimalCorrectnessTableGridValue).data = this._balances.nonTrading;
                break;
            case Balances.FieldId.UnfilledBuys:
                (value as DecimalCorrectnessTableGridValue).data = this._balances.unfilledBuys;
                break;
            case Balances.FieldId.Margin:
                (value as DecimalCorrectnessTableGridValue).data = this._balances.margin;
                break;
            default:
                throw new UnreachableCaseError('ACBTVSTVSLV8851', id);
        }
    }
}
