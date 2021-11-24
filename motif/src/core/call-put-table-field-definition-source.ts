/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId } from 'adi-internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'sys-internal-api';
import { CallPut } from './call-put';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    BooleanTableGridField,
    DateTableGridField,
    DecimalTableGridField,
    EnumTableGridField,
    IvemIdTableGridField,
    LitIvemIdTableGridField,
    NumberTableGridField,
    TableGridField
} from './table-grid-field';
import {
    DateTableGridValue,
    ExerciseTypeIdTableGridValue,
    IsIndexTableGridValue,
    IvemIdTableGridValue,
    LitIvemIdTableGridValue,
    MarketIdTableGridValue,
    NumberTableGridValue,
    PriceTableGridValue,
    TableGridValue
} from './table-grid-value';

export class CallPutTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.CallPut, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(CallPut.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < CallPutTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = CallPutTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = CallPutTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = CallPutTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = CallPutTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = CallPutTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: CallPut.FieldId) {
        return CallPutTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: CallPut.FieldId) {
        const sourcelessFieldName = CallPutTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace CallPutTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds = [CallPut.FieldId.UnderlyingIvemId, CallPut.FieldId.UnderlyingIsIndex];
        export const count = CallPut.Field.count - unsupportedIds.length;

        interface Info {
            readonly id: CallPut.FieldId;
            readonly fieldConstructor: TableGridField.Constructor;
            readonly valueConstructor: TableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(CallPut.Field.count);

        function idToTableGridConstructors(id: CallPut.FieldId):
            TableFieldDefinitionSource.TableGridConstructors {
            switch (id) {
                case CallPut.FieldId.ExercisePrice:
                    return [DecimalTableGridField, PriceTableGridValue];
                case CallPut.FieldId.ExpiryDate:
                    return [DateTableGridField, DateTableGridValue];
                case CallPut.FieldId.LitId:
                    return [EnumTableGridField, MarketIdTableGridValue];
                case CallPut.FieldId.CallLitIvemId:
                    return [LitIvemIdTableGridField, LitIvemIdTableGridValue];
                case CallPut.FieldId.PutLitIvemId:
                    return [LitIvemIdTableGridField, LitIvemIdTableGridValue];
                case CallPut.FieldId.ContractMultiplier:
                    return [NumberTableGridField, NumberTableGridValue];
                case CallPut.FieldId.ExerciseTypeId:
                    return [EnumTableGridField, ExerciseTypeIdTableGridValue];
                case CallPut.FieldId.UnderlyingIvemId:
                    return [IvemIdTableGridField, IvemIdTableGridValue];
                case CallPut.FieldId.UnderlyingIsIndex:
                    return [BooleanTableGridField, IsIndexTableGridValue];
                default:
                    throw new UnreachableCaseError('CPTFDSFITTGC220291', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return CallPut.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: CallPut.FieldId) {
            return CallPut.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return CallPut.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return CallPut.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: CallPut.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: CallPut.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < CallPut.Field.count; id++) {
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
