/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Integer,
    IntegerTableValue,
    MultiEvent,
    RenderValue,
    ScanFieldBooleanOperationIdTableValue,
    StringTableValue,
    TableValue,
    TableValueSource,
    UnreachableCaseError,
    ValidTableValue,
    ValueRecentChangeTypeId
} from '@motifmarkets/motif-core';
import { ScanFieldEditorFrame } from '../field/scan-field-editor-frame';
import { ScanFieldEditorFrameTableFieldSourceDefinition } from './scan-field-editor-frame-table-field-source-definition';

export class ScanFieldEditorFrameTableValueSource extends TableValueSource {
    private _fieldsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _frame: ScanFieldEditorFrame) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._fieldsChangedEventSubscriptionId = this._frame.subscribeFieldValuesChangedEvent(
            (_frame, valueChanges) => { this.handleValuesChangedEvent(valueChanges); }
        );

        this.initialiseBeenIncubated(true);

        return this.getAllValues();
    }

    override deactivate() {
        if (this._fieldsChangedEventSubscriptionId !== undefined) {
            this._frame.unsubscribeFieldValuesChangedEvent(this._fieldsChangedEventSubscriptionId);
            this._fieldsChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = ScanFieldEditorFrameTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = ScanFieldEditorFrameTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return ScanFieldEditorFrameTableFieldSourceDefinition.Field.count;
    }

    private handleValuesChangedEvent(scanValueChanges: ScanFieldEditorFrame.Field.ValueChange[]) {
        const changeCount = scanValueChanges.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeCount);
        let validChanged = false;
        let foundCount = 0;
        for (let i = 0; i < changeCount; i++) {
            const { fieldId, recentChangeTypeId } = scanValueChanges[i];
            if (fieldId === ScanFieldEditorFrame.FieldId.Valid) {
                validChanged = true;
            }
            const fieldIndex = ScanFieldEditorFrameTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId };
            }
        }

        if (validChanged) {
            valueChanges.length = ScanFieldEditorFrameTableFieldSourceDefinition.Field.count;
            let elementCount = foundCount;
            for (let fieldIndex = 0; fieldIndex < ScanFieldEditorFrameTableFieldSourceDefinition.Field.count; fieldIndex++) {
                if (!TableValueSource.ValueChange.arrayIncludesFieldIndex(valueChanges, fieldIndex, foundCount)) {
                    const newValue = this.createTableValue(fieldIndex);
                    const fieldId = ScanFieldEditorFrameTableFieldSourceDefinition.Field.getId(fieldIndex);
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
        const valueConstructor = ScanFieldEditorFrameTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: ScanFieldEditorFrame.FieldId, value: TableValue) {
        if (!this._frame.valid) {
            value.addRenderAttribute(RenderValue.DataCorrectnessAttribute.error);
        }
        switch (id) {
            case ScanFieldEditorFrame.FieldId.Name: {
                (value as StringTableValue).data = this._frame.name;
                break;
            }
            case ScanFieldEditorFrame.FieldId.Valid: {
                (value as ValidTableValue).data = this._frame.valid;
                break;
            }
            case ScanFieldEditorFrame.FieldId.ErrorText: {
                (value as StringTableValue).data = this._frame.errorText;
                break;
            }
            case ScanFieldEditorFrame.FieldId.ConditionsOperationId: {
                (value as ScanFieldBooleanOperationIdTableValue).data = this._frame.conditionsOperationId;
                break;
            }
            case ScanFieldEditorFrame.FieldId.ConditionCount: {
                (value as IntegerTableValue).data = this._frame.conditions.count;
                break;
            }
            default:
                throw new UnreachableCaseError('SFEFTVSLV87345', id);
        }
    }
}
