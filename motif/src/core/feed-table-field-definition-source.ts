/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed, FieldDataType, FieldDataTypeId } from 'src/adi/internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'src/sys/internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    CorrectnessTableGridField,
    EnumDataItemTableGridField,
    IntegerDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    ExchangeEnvironmentIdCorrectnessTableGridValue,
    FeedClassIdCorrectnessTableGridValue,
    FeedStatusIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    StringCorrectnessTableGridValue
} from './table-grid-value';

export class FeedTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.Feed, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(FeedTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < FeedTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = FeedTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = FeedTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = FeedTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = FeedTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = FeedTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

            this.fieldInfos[idx++] = {
                sourcelessName: sourcelessFieldName,
                name,
                heading,
                textAlign,
                gridFieldConstructor: fieldConstructor,
                gridValueConstructor: valueConstructor,
            };
        }
    }

    isFieldSupported(id: Feed.FieldId) {
        return FeedTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: Feed.FieldId) {
        const sourcelessFieldName = FeedTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace FeedTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds = [Feed.FieldId.Id, Feed.FieldId.EnvironmentId];
        export const count = Feed.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Feed.FieldId;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Feed.Field.idCount);

        function idToTableGridConstructors(id: Feed.FieldId):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case Feed.FieldId.Id:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Feed.FieldId.Name:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Feed.FieldId.StatusId:
                    return [EnumDataItemTableGridField, FeedStatusIdCorrectnessTableGridValue];
                case Feed.FieldId.ClassId:
                    return [EnumDataItemTableGridField, FeedClassIdCorrectnessTableGridValue];
                case Feed.FieldId.EnvironmentId:
                    return [EnumDataItemTableGridField, ExchangeEnvironmentIdCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('BATFDSFITTGC1200049', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Feed.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Feed.FieldId) {
            return Feed.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Feed.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Feed.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Feed.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Feed.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Feed.Field.idCount; id++) {
                if (unsupportedIds.includes(id)) {
                    idFieldIndices[id] = -1;
                } else {
                    idFieldIndices[id] = fieldIdx;

                    const [fieldConstructor, valueConstructor] = idToTableGridConstructors(id);
                    infos[fieldIdx++] = {
                        id,
                        fieldConstructor,
                        valueConstructor,
                    };
                }
            }
        }
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
