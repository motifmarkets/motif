/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account } from 'src/adi/internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';
import { BrokerageAccountTableFieldDefinitionSource } from './brokerage-account-table-field-definition-source';
import {
    CorrectnessTableGridValue,
    EnumCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class BrokerageAccountTableValueSource extends TableValueSource {
    private _accountChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _accountCorrectnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _account: Account) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        this._accountChangeEventSubscriptionId = this._account.subscribeChangeEvent(
            (changedFieldIds) => this.handleAccountChangeEvent(changedFieldIds)
        );
        this._accountCorrectnessChangedEventSubscriptionId = this._account.subscribeCorrectnessChangedEvent(
            () => this.handleAccountCorrectnessChangedEvent()
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._accountChangeEventSubscriptionId !== undefined) {
            this._account.unsubscribeChangeEvent(this._accountChangeEventSubscriptionId);
            this._accountChangeEventSubscriptionId = undefined;
        }
        if (this._accountCorrectnessChangedEventSubscriptionId !== undefined) {
            this._account.unsubscribeCorrectnessChangedEvent(this._accountCorrectnessChangedEventSubscriptionId);
            this._accountCorrectnessChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = BrokerageAccountTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = BrokerageAccountTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return BrokerageAccountTableFieldDefinitionSource.Field.count;
    }

    private handleAccountChangeEvent(changedFieldIds: Account.FieldId[]) {
        const changedFieldCount = changedFieldIds.length;
        const changedValues = new Array<TableValueSource.ChangedValue>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < changedFieldIds.length; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIdx = BrokerageAccountTableFieldDefinitionSource.Field.indexOfId(fieldId);
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

    private handleAccountCorrectnessChangedEvent() {
        const changedValues = this.getAllValues();
        this.notifyAllValuesChangeEvent(changedValues);
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = BrokerageAccountTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Account.FieldId, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._account.correctnessId;

        switch (id) {
            case Account.FieldId.Id:
                (value as StringCorrectnessTableGridValue).data = this._account.id;
                break;
            case Account.FieldId.EnvironmentId:
                (value as EnumCorrectnessTableGridValue).data = this._account.environmentId;
                break;
            case Account.FieldId.Name:
                (value as StringCorrectnessTableGridValue).data = this._account.name;
                break;
            case Account.FieldId.CurrencyId:
                (value as EnumCorrectnessTableGridValue).data = this._account.currencyId;
                break;
            default:
                throw new UnreachableCaseError('BATVSLV9473', id);
        }
    }
}
