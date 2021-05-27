/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Balances, FieldDataType, FieldDataTypeId } from 'src/adi/internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'src/sys/internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    CorrectnessTableGridField,
    DecimalDataItemTableGridField,

    EnumDataItemTableGridField, StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,


    CurrencyIdCorrectnessTableGridValue, DecimalCorrectnessTableGridValue, StringCorrectnessTableGridValue
} from './table-grid-value';

export class BalancesTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.BalancesDataItem, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(BalancesTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < BalancesTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = BalancesTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = BalancesTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = BalancesTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = BalancesTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = BalancesTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: Balances.FieldId) {
        return BalancesTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: Balances.FieldId) {
        const sourcelessFieldName = BalancesTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}
export namespace BalancesTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds: Balances.FieldId[] = [];
        export const count = Balances.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Balances.FieldId;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Balances.Field.idCount);

        function idToTableGridConstructors(id: Balances.FieldId):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case Balances.FieldId.AccountId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Balances.FieldId.Currency:
                    return [EnumDataItemTableGridField, CurrencyIdCorrectnessTableGridValue];
                case Balances.FieldId.NetBalance:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case Balances.FieldId.Trading:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case Balances.FieldId.NonTrading:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case Balances.FieldId.UnfilledBuys:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case Balances.FieldId.Margin:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('ACBTFDSFITTGC6998477', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Balances.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Balances.FieldId) {
            return Balances.Field.idToName(id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Balances.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Balances.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Balances.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Balances.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Balances.Field.idCount; id++) {
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
