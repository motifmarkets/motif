/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, Holding } from 'src/adi/internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'src/sys/internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    CorrectnessTableGridField,
    DecimalDataItemTableGridField,

    EnumDataItemTableGridField, IntegerDataItemTableGridField, StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,



    CurrencyIdCorrectnessTableGridValue, ExchangeIdCorrectnessTableGridValue, IntegerCorrectnessTableGridValue,



    IvemClassIdCorrectnessTableGridValue, PriceCorrectnessTableGridValue, StringCorrectnessTableGridValue
} from './table-grid-value';

export class HoldingTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.HoldingsDataItem, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(HoldingTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < HoldingTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = HoldingTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = HoldingTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = HoldingTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = HoldingTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = HoldingTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: Holding.FieldId) {
        return HoldingTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: Holding.FieldId) {
        const sourcelessFieldName = HoldingTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace HoldingTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds: Holding.FieldId[] = [];
        export const count = Holding.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Holding.FieldId;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Holding.Field.idCount);

        function idToTableGridConstructors(id: Holding.FieldId):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case Holding.FieldId.ExchangeId:
                    return [EnumDataItemTableGridField, ExchangeIdCorrectnessTableGridValue];
                case Holding.FieldId.Code:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Holding.FieldId.AccountId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Holding.FieldId.StyleId:
                    return [EnumDataItemTableGridField, IvemClassIdCorrectnessTableGridValue];
                case Holding.FieldId.Cost:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Holding.FieldId.Currency:
                    return [EnumDataItemTableGridField, CurrencyIdCorrectnessTableGridValue];
                case Holding.FieldId.TotalQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Holding.FieldId.TotalAvailableQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Holding.FieldId.AveragePrice:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('HTFDSFITTGC5948883', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Holding.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Holding.FieldId) {
            return Holding.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Holding.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Holding.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Holding.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Holding.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Holding.Field.idCount; id++) {
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
