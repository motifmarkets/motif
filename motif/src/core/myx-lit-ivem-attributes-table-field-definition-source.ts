/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, MyxLitIvemAttributes } from 'adi-internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'sys-internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    CorrectnessTableGridField,
    EnumDataItemTableGridField,
    IntegerArrayDataItemTableGridField,
    IntegerDataItemTableGridField,
    NumberDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    MarketClassificationIdMyxLitIvemAttributeCorrectnessTableGridValue,
    PercentageCorrectnessTableGridValue,
    ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue
} from './table-grid-value';

export class MyxLitIvemAttributesTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.MyxLitIvemAttributes, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(MyxLitIvemAttributesTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < MyxLitIvemAttributesTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = MyxLitIvemAttributesTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = MyxLitIvemAttributesTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = MyxLitIvemAttributesTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = MyxLitIvemAttributesTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = MyxLitIvemAttributesTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: MyxLitIvemAttributes.Field.Id) {
        return MyxLitIvemAttributesTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: MyxLitIvemAttributes.Field.Id) {
        const sourcelessFieldName = MyxLitIvemAttributesTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace MyxLitIvemAttributesTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds: MyxLitIvemAttributes.Field.Id[] = [];
        export const count = MyxLitIvemAttributes.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: MyxLitIvemAttributes.Field.Id;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(MyxLitIvemAttributes.Field.idCount);

        function idToTableGridConstructors(id: MyxLitIvemAttributes.Field.Id):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case MyxLitIvemAttributes.Field.Id.Category:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.MarketClassification:
                    return [EnumDataItemTableGridField, MarketClassificationIdMyxLitIvemAttributeCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.DeliveryBasis:
                    return [EnumDataItemTableGridField, DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.MaxRSS:
                    return [NumberDataItemTableGridField, PercentageCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.Sector:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.Short:
                    return [IntegerArrayDataItemTableGridField, ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.ShortSuspended:
                    return [IntegerArrayDataItemTableGridField, ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue];
                case MyxLitIvemAttributes.Field.Id.SubSector:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('MLIATFDSFITTGC200012', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return MyxLitIvemAttributes.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: MyxLitIvemAttributes.Field.Id) {
            return MyxLitIvemAttributes.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return MyxLitIvemAttributes.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return MyxLitIvemAttributes.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: MyxLitIvemAttributes.Field.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: MyxLitIvemAttributes.Field.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < MyxLitIvemAttributes.Field.idCount; id++) {
                if (unsupportedIds.includes(id)) {
                    idFieldIndices[id] = -1;
                } else {
                    idFieldIndices[id] = fieldIdx;

                    const [fieldConstructor, valueConstructor] = idToTableGridConstructors(id);
                    infos[fieldIdx++] = {
                        id,
                        fieldConstructor,
                        valueConstructor,
                    } as const;
                }
            }
        }
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
