/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    Integer,
    LockerScanAttachedNotificationChannel,
    MultiEvent,
    NotificationChannelSourceSettingsUrgencyIdTableValue,
    NumberTableValue,
    RenderValue,
    StringTableValue,
    TableValue,
    TableValueSource,
    UnreachableCaseError,
    ValidTableValue,
    ValueRecentChangeTypeId
} from '@motifmarkets/motif-core';
import { LockerScanAttachedNotificationChannelTableFieldSourceDefinition } from './locker-scan-attached-notification-channel-table-field-source-definition';

export class LockerScanAttachedNotificationChannelTableValueSource extends TableValueSource {
    private _fieldsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _channel: LockerScanAttachedNotificationChannel) {
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
        const fieldCount = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.count;
    }

    private handleFieldsChangedEvent(changedFieldIds: readonly LockerScanAttachedNotificationChannel.FieldId[]) {
        const changeCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeCount);
        let validChanged = false;
        let foundCount = 0;
        for (let i = 0; i < changeCount; i++) {
            const fieldId = changedFieldIds[i];
            if (fieldId === LockerScanAttachedNotificationChannel.FieldId.Valid) {
                validChanged = true;
            }
            const fieldIndex = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: ValueRecentChangeTypeId.Update };
            }
        }

        if (validChanged) {
            valueChanges.length = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.count;
            let elementCount = foundCount;
            for (let fieldIndex = 0; fieldIndex < LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.count; fieldIndex++) {
                if (!TableValueSource.ValueChange.arrayIncludesFieldIndex(valueChanges, fieldIndex, foundCount)) {
                    const newValue = this.createTableValue(fieldIndex);
                    const fieldId = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getId(fieldIndex);
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
        const valueConstructor = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LockerScanAttachedNotificationChannel.FieldId, value: TableValue) {
        if (!this._channel.valid) {
            value.addRenderAttribute(RenderValue.DataCorrectnessAttribute.error);
        }
        switch (id) {
            case LockerScanAttachedNotificationChannel.FieldId.ChannelId: {
                (value as StringTableValue).data = this._channel.channelId;
                break;
            }
            case LockerScanAttachedNotificationChannel.FieldId.Valid: {
                (value as ValidTableValue).data = this._channel.valid;
                break;
            }
            case LockerScanAttachedNotificationChannel.FieldId.Name: {
                (value as StringTableValue).data = this._channel.name;
                break;
            }
            case LockerScanAttachedNotificationChannel.FieldId.CultureCode: {
                (value as StringTableValue).data = this._channel.cultureCode;
                break;
            }
            case LockerScanAttachedNotificationChannel.FieldId.MinimumStable: {
                (value as NumberTableValue).data = this._channel.minimumStable;
                break;
            }
            case LockerScanAttachedNotificationChannel.FieldId.MinimumElapsed: {
                (value as NumberTableValue).data = this._channel.minimumElapsed;
                break;
            }
            case LockerScanAttachedNotificationChannel.FieldId.Ttl: {
                (value as NumberTableValue).data = this._channel.ttl;
                break;
            }
            case LockerScanAttachedNotificationChannel.FieldId.Urgency: {
                (value as NotificationChannelSourceSettingsUrgencyIdTableValue).data = this._channel.urgencyId;
                break;
            }
            case LockerScanAttachedNotificationChannel.FieldId.Topic: {
                throw new AssertInternalError('LSANCTVSLVT29293');
            }
            default:
                throw new UnreachableCaseError('SFEFTVSLV87345', id);
        }
    }
}
