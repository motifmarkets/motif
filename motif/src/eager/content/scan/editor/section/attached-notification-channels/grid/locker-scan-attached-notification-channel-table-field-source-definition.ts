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
    LockerScanAttachedNotificationChannel,
    NotificationChannelSourceSettingsUrgencyIdTableValue,
    NumberTableField,
    NumberTableValue,
    StringTableField,
    StringTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableValue,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService,
    ValidTableValue
} from '@motifmarkets/motif-core';

export class LockerScanAttachedNotificationChannelTableFieldSourceDefinition extends TypedTableFieldSourceDefinition {
    declare readonly typeId: LockerScanAttachedNotificationChannelTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(LockerScanAttachedNotificationChannelTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: LockerScanAttachedNotificationChannel.FieldId) {
        return LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: LockerScanAttachedNotificationChannel.FieldId) {
        const sourcelessFieldName = LockerScanAttachedNotificationChannel.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: LockerScanAttachedNotificationChannel.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('STFSDGSFNBI30398', LockerScanAttachedNotificationChannel.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const count = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.count;
        const result = new Array<TableField.Definition>(count);

        for (let fieldIdx = 0; fieldIdx < count; fieldIdx++) {
            const sourcelessFieldName = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const [fieldConstructor, valueConstructor] =
                LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.getTableFieldValueConstructors(fieldIdx);

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

export namespace LockerScanAttachedNotificationChannelTableFieldSourceDefinition {
    export const typeId = TypedTableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds: LockerScanAttachedNotificationChannel.FieldId[] = [
            LockerScanAttachedNotificationChannel.FieldId.Topic,
        ];
        export const count = LockerScanAttachedNotificationChannel.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LockerScanAttachedNotificationChannel.FieldId;
            readonly tableFieldValueConstructors: TableFieldSourceDefinition.TableFieldValueConstructors;
        }

        const infos: Info[] = [
            {
                id: LockerScanAttachedNotificationChannel.FieldId.ChannelId,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.Valid,
                tableFieldValueConstructors: [BooleanTableField, ValidTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.Name,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.CultureCode,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.MinimumStable,
                tableFieldValueConstructors: [NumberTableField, NumberTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.MinimumElapsed,
                tableFieldValueConstructors: [NumberTableField, NumberTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.Ttl,
                tableFieldValueConstructors: [NumberTableField, NumberTableValue],
            },
            {
                id: LockerScanAttachedNotificationChannel.FieldId.Urgency,
                tableFieldValueConstructors: [EnumTableField, NotificationChannelSourceSettingsUrgencyIdTableValue],
            },
        ];

        let idFieldIndices: readonly Integer[];

        export function initialise() {
            const indices = new Array<Integer>(LockerScanAttachedNotificationChannel.Field.idCount);
            for (let id = 0; id < LockerScanAttachedNotificationChannel.Field.idCount; id++) {
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

        export function isIdSupported(id: LockerScanAttachedNotificationChannel.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function indexOfId(id: LockerScanAttachedNotificationChannel.FieldId) {
            return idFieldIndices[id];
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LockerScanAttachedNotificationChannel.Field.idToName(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LockerScanAttachedNotificationChannel.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LockerScanAttachedNotificationChannel.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldValueConstructors(fieldIndex: Integer) {
            return infos[fieldIndex].tableFieldValueConstructors;
        }

        export function getTableValueConstructor(fieldIndex: Integer): TableValue.Constructor {
            const constructors = getTableFieldValueConstructors(fieldIndex);
            return constructors[1];
        }
    }

    export interface FieldId extends TypedTableFieldSourceDefinition.FieldId {
        sourceTypeId: LockerScanAttachedNotificationChannelTableFieldSourceDefinition.TypeId;
        id: LockerScanAttachedNotificationChannel.FieldId;
    }

    export function get(cachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService): LockerScanAttachedNotificationChannelTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as LockerScanAttachedNotificationChannelTableFieldSourceDefinition;
    }
}

export namespace LockerScanAttachedNotificationChannelTableFieldSourceDefinitionModule {
    export function initialiseStatic() {
        LockerScanAttachedNotificationChannelTableFieldSourceDefinition.Field.initialise();
    }
}
