/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, FieldDataType, FieldDataTypeId } from 'adi-internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'sys-internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    CorrectnessTableGridField,
    EnumDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    CurrencyIdCorrectnessTableGridValue,
    ExchangeEnvironmentIdCorrectnessTableGridValue,
    StringCorrectnessTableGridValue
} from './table-grid-value';

export class BrokerageAccountTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.BrokerageAccounts, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(BrokerageAccountTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < BrokerageAccountTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = BrokerageAccountTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = BrokerageAccountTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = BrokerageAccountTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = BrokerageAccountTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = BrokerageAccountTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: Account.FieldId) {
        return BrokerageAccountTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: Account.FieldId) {
        const sourcelessFieldName = BrokerageAccountTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace BrokerageAccountTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds = [Account.FieldId.EnvironmentId];
        export const count = Account.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Account.FieldId;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Account.Field.idCount);

        function idToTableGridConstructors(id: Account.FieldId):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case Account.FieldId.Id:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Account.FieldId.Name:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Account.FieldId.CurrencyId:
                    return [EnumDataItemTableGridField, CurrencyIdCorrectnessTableGridValue];
                case Account.FieldId.EnvironmentId:
                    return [EnumDataItemTableGridField, ExchangeEnvironmentIdCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('BATFDSFITTGC1200049', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Account.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Account.FieldId) {
            return Account.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Account.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Account.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Account.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Account.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Account.Field.idCount; id++) {
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
