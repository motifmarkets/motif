/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, LitIvemFullDetail } from 'adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from 'sys-internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    BooleanDataItemTableGridField,
    CorrectnessTableGridField,
    DecimalDataItemTableGridField,
    EnumDataItemTableGridField,
    IntegerDataItemTableGridField,
    SourceTzOffsetDateDataItemTableGridField,
    StringArrayDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CallOrPutIdCorrectnessTableGridValue,
    CorrectnessTableGridValue,
    DecimalCorrectnessTableGridValue,
    DepthDirectionIdCorrectnessTableGridValue,
    ExerciseTypeIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    IsIndexCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,
    SourceTzOffsetDateCorrectnessTableGridValue,
    StringArrayCorrectnessTableGridValue,
    StringCorrectnessTableGridValue
} from './table-grid-value';

export class LitIvemExtendedDetailTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.LitIvemExtendedDetail, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(LitIvemExtendedDetailTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemExtendedDetailTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemExtendedDetailTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = LitIvemExtendedDetailTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = LitIvemExtendedDetailTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemExtendedDetailTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemExtendedDetailTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: LitIvemFullDetail.ExtendedField.Id) {
        return LitIvemExtendedDetailTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemFullDetail.ExtendedField.Id) {
        const sourcelessFieldName = LitIvemExtendedDetailTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace LitIvemExtendedDetailTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds: LitIvemFullDetail.ExtendedField.Id[] = [
            LitIvemFullDetail.ExtendedField.Id.Attributes,
            LitIvemFullDetail.ExtendedField.Id.TmcLegs
        ];
        export const count = LitIvemFullDetail.ExtendedField.idCount - unsupportedIds.length;

        class Info {
            id: LitIvemFullDetail.ExtendedField.Id;
            fieldConstructor: CorrectnessTableGridField.Constructor;
            valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(LitIvemFullDetail.ExtendedField.idCount);

        function idToTableGridConstructors(id: LitIvemFullDetail.ExtendedField.Id):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case LitIvemFullDetail.ExtendedField.Id.Cfi:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.DepthDirectionId:
                    return [EnumDataItemTableGridField, DepthDirectionIdCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.IsIndex:
                    return [BooleanDataItemTableGridField, IsIndexCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.ExpiryDate:
                    return [SourceTzOffsetDateDataItemTableGridField, SourceTzOffsetDateCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.StrikePrice:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.ExerciseTypeId:
                    return [EnumDataItemTableGridField, ExerciseTypeIdCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.CallOrPutId:
                    return [EnumDataItemTableGridField, CallOrPutIdCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.ContractSize:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.LotSize:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.Categories:
                    return [StringArrayDataItemTableGridField, StringArrayCorrectnessTableGridValue];
                case LitIvemFullDetail.ExtendedField.Id.Attributes:
                case LitIvemFullDetail.ExtendedField.Id.TmcLegs:
                    throw new AssertInternalError('LIEDTFDSFITTGCA1200069', LitIvemFullDetail.ExtendedField.idToName(id));
                default:
                    throw new UnreachableCaseError('LIEDTFDSFITTGCU1200069', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LitIvemFullDetail.ExtendedField.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: LitIvemFullDetail.ExtendedField.Id) {
            return LitIvemFullDetail.ExtendedField.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LitIvemFullDetail.ExtendedField.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LitIvemFullDetail.ExtendedField.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: LitIvemFullDetail.ExtendedField.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: LitIvemFullDetail.ExtendedField.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < LitIvemFullDetail.ExtendedField.idCount; id++) {
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
