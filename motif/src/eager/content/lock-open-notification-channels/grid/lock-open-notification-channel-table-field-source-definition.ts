/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ActiveFaultedStatusIdTableValue,
    AssertInternalError,
    BooleanTableField,
    CommaText,
    EnabledTableValue,
    EnumTableField,
    FaultedTableValue,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    LockOpenNotificationChannel,
    NotificationDistributionMethodIdTableValue,
    StringTableField,
    StringTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactoryService,
    TableValue,
    ValidTableValue
} from '@motifmarkets/motif-core';

export class LockOpenNotificationChannelTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: LockOpenNotificationChannelTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(LockOpenNotificationChannelTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: LockOpenNotificationChannel.FieldId) {
        return LockOpenNotificationChannelTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LockOpenNotificationChannel.FieldId) {
        const sourcelessFieldName = LockOpenNotificationChannel.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LockOpenNotificationChannel.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('STFSDGSFNBI30398', LockOpenNotificationChannel.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = LockOpenNotificationChannelTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = LockOpenNotificationChannelTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = LockOpenNotificationChannelTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = LockOpenNotificationChannelTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const [fieldConstructor, valueConstructor] =
                LockOpenNotificationChannelTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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

export namespace LockOpenNotificationChannelTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: LockOpenNotificationChannel.FieldId[] = [
            LockOpenNotificationChannel.FieldId.Settings,
            LockOpenNotificationChannel.FieldId.Favourite,
        ];
        export const count = LockOpenNotificationChannel.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LockOpenNotificationChannel.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.TableFieldValueConstructors;
        }

        const infos: Info[] = [
            {
                id: LockOpenNotificationChannel.FieldId.Id,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockOpenNotificationChannel.FieldId.Valid,
                tableFieldValueConstructors: [BooleanTableField, ValidTableValue],
            },
            {
                id: LockOpenNotificationChannel.FieldId.Enabled,
                tableFieldValueConstructors: [BooleanTableField, EnabledTableValue],
            },
            {
                id: LockOpenNotificationChannel.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockOpenNotificationChannel.FieldId.Description,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockOpenNotificationChannel.FieldId.StatusId,
                tableFieldValueConstructors: [EnumTableField, ActiveFaultedStatusIdTableValue],
            },
            {
                id: LockOpenNotificationChannel.FieldId.DistributionMethodId,
                tableFieldValueConstructors: [EnumTableField, NotificationDistributionMethodIdTableValue],
            },
            {
                id: LockOpenNotificationChannel.FieldId.Faulted,
                tableFieldValueConstructors: [BooleanTableField, FaultedTableValue],
            },
        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(LockOpenNotificationChannel.Field.idCount);
            for (let id = 0; id < LockOpenNotificationChannel.Field.idCount; id++) {
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

        export function isIdSupported(id: LockOpenNotificationChannel.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: LockOpenNotificationChannel.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LockOpenNotificationChannel.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LockOpenNotificationChannel.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LockOpenNotificationChannel.Field.idToFieldDataTypeId(infos[fieldIdx].id);
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
        sourceTypeId: LockOpenNotificationChannelTableFieldSourceDefinition.TypeId;
        id: LockOpenNotificationChannel.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactoryService): LockOpenNotificationChannelTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as LockOpenNotificationChannelTableFieldSourceDefinition;
    }
}

export namespace LockOpenNotificationChannelTableFieldSourceDefinitionModule {
    export function initialiseStatic() {
        LockOpenNotificationChannelTableFieldSourceDefinition.Field.initialise();
    }
}
