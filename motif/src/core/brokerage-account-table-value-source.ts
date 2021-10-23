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
            (accountChanges) => this.handleAccountChangeEvent(accountChanges)
        );
        this._accountCorrectnessChangedEventSubscriptionId = this._account.subscribeCorrectnessChangedEvent(
            () => this.handleAccountCorrectnessChangedEvent()
        );

        this.initialiseBeenUsable(this._account.usable);

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

    private handleAccountChangeEvent(accountValueChanges: Account.ValueChange[]) {
        const changedFieldCount = accountValueChanges.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < accountValueChanges.length; i++) {
            const { fieldId, recentChangeTypeId } = accountValueChanges[i];
            const fieldIndex = BrokerageAccountTableFieldDefinitionSource.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableGridValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId };
            }
        }
        if (foundCount < changedFieldCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private handleAccountCorrectnessChangedEvent() {
        const allValues = this.getAllValues();
        this.processDataCorrectnessChange(allValues, this._account.usable);
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
