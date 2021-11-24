/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from 'adi-internal-api';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { Integer, MultiEvent, UnreachableCaseError } from 'sys-internal-api';
import { FeedTableFieldDefinitionSource } from './feed-table-field-definition-source';
import {
    CorrectnessTableGridValue,
    EnumCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class FeedTableValueSource extends TableValueSource {
    private _statusChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _correctnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _feed: Feed) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        this._statusChangedEventSubscriptionId = this._feed.subscribeStatusChangedEvent(
            () => this.handleStatusChangedEvent()
        );
        this._correctnessChangedEventSubscriptionId = this._feed.subscribeCorrectnessChangedEvent(
            () => this.handleCorrectnessChangedEvent()
        );

        this.initialiseBeenUsable(this._feed.usable);

        return this.getAllValues();
    }

    deactivate() {
        if (this._statusChangedEventSubscriptionId !== undefined) {
            this._feed.unsubscribeStatusChangedEvent(this._statusChangedEventSubscriptionId);
            this._statusChangedEventSubscriptionId = undefined;
        }
        if (this._correctnessChangedEventSubscriptionId !== undefined) {
            this._feed.unsubscribeCorrectnessChangedEvent(this._correctnessChangedEventSubscriptionId);
            this._correctnessChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = FeedTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = FeedTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return FeedTableFieldDefinitionSource.Field.count;
    }

    private handleStatusChangedEvent() {
        const fieldId = Feed.FieldId.StatusId;
        const fieldIndex = FeedTableFieldDefinitionSource.Field.indexOfId(fieldId);
        if (fieldIndex >= 0) {
            const newValue = this.createTableGridValue(fieldIndex);
            this.loadValue(fieldId, newValue);
            const changedValues: TableValueSource.ValueChange[] = [{
                fieldIndex,
                newValue,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update
            }];
            this.notifyValueChangesEvent(changedValues);
        }
    }

    private handleCorrectnessChangedEvent() {
        const allValues = this.getAllValues();
        this.processDataCorrectnessChange(allValues, this._feed.usable);
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = FeedTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Feed.FieldId, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._feed.correctnessId;

        switch (id) {
            case Feed.FieldId.Id:
                (value as IntegerCorrectnessTableGridValue).data = this._feed.id;
                break;
            case Feed.FieldId.EnvironmentId:
                (value as EnumCorrectnessTableGridValue).data = this._feed.environmentId;
                break;
            case Feed.FieldId.Name:
                (value as StringCorrectnessTableGridValue).data = this._feed.display;
                break;
            case Feed.FieldId.ClassId:
                (value as EnumCorrectnessTableGridValue).data = this._feed.classId;
                break;
            case Feed.FieldId.StatusId:
                (value as EnumCorrectnessTableGridValue).data = this._feed.statusId;
                break;
            default:
                throw new UnreachableCaseError('FTVSLV9112473', id);
        }
    }
}
