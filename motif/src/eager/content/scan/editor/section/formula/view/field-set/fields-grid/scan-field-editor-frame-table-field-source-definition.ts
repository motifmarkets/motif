/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    BooleanTableField,
    CommaText,
    EnumTableField,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    IntegerTableField,
    IntegerTableValue,
    ScanFieldBooleanOperationIdTableValue,
    StringTableField,
    StringTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionRegistryService,
    TableValue,
    ValidTableValue
} from '@motifmarkets/motif-core';
import { ScanFieldEditorFrame } from '../field/scan-field-editor-frame';

export class ScanFieldEditorFrameTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: ScanFieldEditorFrameTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(ScanFieldEditorFrameTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: ScanFieldEditorFrame.FieldId) {
        return ScanFieldEditorFrameTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: ScanFieldEditorFrame.FieldId) {
        const sourcelessFieldName = ScanFieldEditorFrame.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: ScanFieldEditorFrame.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('STFSDGSFNBI30398', ScanFieldEditorFrame.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = ScanFieldEditorFrameTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = ScanFieldEditorFrameTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = ScanFieldEditorFrameTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = ScanFieldEditorFrameTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const [fieldConstructor, valueConstructor] =
                ScanFieldEditorFrameTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

            result[fieldIdx] = new TableField.Definition(
                this,
                sourcelessFieldName,
                heading,
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace ScanFieldEditorFrameTableFieldSourceDefinition {
    export namespace Field {
        const unsupportedIds: ScanFieldEditorFrame.FieldId[] = [];
        export const count = ScanFieldEditorFrame.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: ScanFieldEditorFrame.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.TableFieldValueConstructors;
        }

        const infos: Info[] = [
            {
                id: ScanFieldEditorFrame.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: ScanFieldEditorFrame.FieldId.Valid,
                tableFieldValueConstructors: [BooleanTableField, ValidTableValue],
            },
            {
                id: ScanFieldEditorFrame.FieldId.ErrorText,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: ScanFieldEditorFrame.FieldId.ConditionsOperationId,
                tableFieldValueConstructors: [EnumTableField, ScanFieldBooleanOperationIdTableValue],
            },
            {
                id: ScanFieldEditorFrame.FieldId.ConditionCount,
                tableFieldValueConstructors: [IntegerTableField, IntegerTableValue],
            },
        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(ScanFieldEditorFrame.Field.idCount);
            for (let id = 0; id < ScanFieldEditorFrame.Field.idCount; id++) {
                indices[id] = -1;
            }

            for (let fieldIndex = 0; fieldIndex < count; fieldIndex++) {
                const id = infos[fieldIndex].id;
                if (unsupportedIds.includes(id)) {
                    throw new AssertInternalError('STFSDFII42422', fieldIndex.toString());
                } else {
                    if (indices[id] !== -1) {
                        throw new AssertInternalError('STFSDFID42422', fieldIndex.toString()); // duplicate
                    } else {
                        indices[id] = fieldIndex;
                    }
                }
            }

            idFieldIndices = indices;
        }

        export function isIdSupported(id: ScanFieldEditorFrame.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: ScanFieldEditorFrame.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return ScanFieldEditorFrame.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return ScanFieldEditorFrame.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return ScanFieldEditorFrame.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldValueConstructors(fieldIndex: Integer) {
            return infos[fieldIndex].tableFieldValueConstructors;
        }

        export function getTableValueConstructor(fieldIndex: Integer): TableValue.Constructor {
            const constructors = getTableFieldValueConstructors(fieldIndex);
            return constructors[1];
        }
    }

    export interface FieldId extends TableFieldSourceDefinition.FieldId {
        sourceTypeId: TableFieldSourceDefinition.TypeId.Scan;
        id: ScanFieldEditorFrame.FieldId;
    }
}

export namespace ScanFieldEditorFrameTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame;
    export type TypeId = typeof typeId;

    export function getRegistered(registryService: TableFieldSourceDefinitionRegistryService): ScanFieldEditorFrameTableFieldSourceDefinition {
        return registryService.get(typeId) as ScanFieldEditorFrameTableFieldSourceDefinition;
    }
}

export namespace ScanFieldEditorFrameTableFieldSourceDefinitionModule {
    export function initialiseStatic() {
        ScanFieldEditorFrameTableFieldSourceDefinition.Field.initialise();
    }
}
