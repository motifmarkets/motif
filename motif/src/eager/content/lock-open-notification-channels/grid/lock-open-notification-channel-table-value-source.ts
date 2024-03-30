/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ActiveFaultedStatusIdTableValue,
    AssertInternalError,
    EnabledTableValue,
    FaultedTableValue,
    Integer,
    LockOpenNotificationChannel,
    MultiEvent,
    NotificationDistributionMethodIdTableValue,
    RenderValue,
    StringTableValue,
    TableValue,
    TableValueSource,
    UnreachableCaseError,
    ValidTableValue,
    ValueRecentChangeTypeId
} from '@motifmarkets/motif-core';
import { LockOpenNotificationChannelTableFieldSourceDefinition } from './lock-open-notification-channel-table-field-source-definition';

export class LockOpenNotificationChannelTableValueSource extends TableValueSource {
    private _fieldsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _channel: LockOpenNotificationChannel) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._fieldsChangedEventSubscriptionId = this._channel.subscribeFieldsChangedEvent(
            (changedFieldIds, _modifier) => { this.handleFieldsChangedEvent(changedFieldIds); }
        );

        this.initialiseBeenIncubated(true);

        return this.getAllValues();
    }

    override deactivate() {
        if (this._fieldsChangedEventSubscriptionId !== undefined) {
            this._channel.unsubscribeFieldsChangedEvent(this._fieldsChangedEventSubscriptionId);
            this._fieldsChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = LockOpenNotificationChannelTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = LockOpenNotificationChannelTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return LockOpenNotificationChannelTableFieldSourceDefinition.Field.count;
    }

    private handleFieldsChangedEvent(changedFieldIds: readonly LockOpenNotificationChannel.FieldId[]) {
        const changeCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeCount);
        let validChanged = false;
        let foundCount = 0;
        for (let i = 0; i < changeCount; i++) {
            const fieldId = changedFieldIds[i];
            if (fieldId === LockOpenNotificationChannel.FieldId.Valid) {
                validChanged = true;
            }
            const fieldIndex = LockOpenNotificationChannelTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: ValueRecentChangeTypeId.Update };
            }
        }

        if (validChanged) {
            valueChanges.length = LockOpenNotificationChannelTableFieldSourceDefinition.Field.count;
            let elementCount = foundCount;
            for (let fieldIndex = 0; fieldIndex < LockOpenNotificationChannelTableFieldSourceDefinition.Field.count; fieldIndex++) {
                if (!TableValueSource.ValueChange.arrayIncludesFieldIndex(valueChanges, fieldIndex, foundCount)) {
                    const newValue = this.createTableValue(fieldIndex);
                    const fieldId = LockOpenNotificationChannelTableFieldSourceDefinition.Field.getId(fieldIndex);
                    this.loadValue(fieldId, newValue);
                    valueChanges[elementCount++] = { fieldIndex, newValue, recentChangeTypeId: ValueRecentChangeTypeId.Update };
                }
            }
        } else {
            if (foundCount < changeCount) {
                valueChanges.length = foundCount;
            }
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = LockOpenNotificationChannelTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LockOpenNotificationChannel.FieldId, value: TableValue) {
        if (!this._channel.valid) {
            value.addRenderAttribute(RenderValue.DataCorrectnessAttribute.error);
        }
        switch (id) {
            case LockOpenNotificationChannel.FieldId.Id:
                (value as StringTableValue).data = this._channel.id;
                break;
            case LockOpenNotificationChannel.FieldId.Valid:
                (value as ValidTableValue).data = this._channel.valid;
                break;
            case LockOpenNotificationChannel.FieldId.Enabled:
                (value as EnabledTableValue).data = this._channel.enabled;
                break;
            case LockOpenNotificationChannel.FieldId.Name:
                (value as StringTableValue).data = this._channel.name;
                break;
            case LockOpenNotificationChannel.FieldId.Description:
                (value as StringTableValue).data = this._channel.description;
                break;
            case LockOpenNotificationChannel.FieldId.Favourite:
                throw new AssertInternalError('LONCTRSLVF29293');
            case LockOpenNotificationChannel.FieldId.StatusId:
                (value as ActiveFaultedStatusIdTableValue).data = this._channel.statusId;
                break;
            case LockOpenNotificationChannel.FieldId.DistributionMethodId:
                (value as NotificationDistributionMethodIdTableValue).data = this._channel.distributionMethodId;
                break;
            case LockOpenNotificationChannel.FieldId.Settings:
                throw new AssertInternalError('LONCTRSLVS29293');
            case LockOpenNotificationChannel.FieldId.Faulted:
                (value as FaultedTableValue).data = this._channel.faulted;
                break;
            default:
                throw new UnreachableCaseError('LONCTRSLVD29293', id);
        }
    }
}
