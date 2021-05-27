/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, TopShareholder } from 'src/adi/internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'src/sys/internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import { CorrectnessTableGridField, IntegerDataItemTableGridField, StringDataItemTableGridField } from './table-grid-field';
import {
    CorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    StringCorrectnessTableGridValue
} from './table-grid-value';

export class TopShareholderTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.TopShareholdersDataItem, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(TopShareholderTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < TopShareholderTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = TopShareholderTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = TopShareholderTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = TopShareholderTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = TopShareholderTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = TopShareholderTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: TopShareholder.FieldId) {
        return TopShareholderTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: TopShareholder.FieldId) {
        const sourcelessFieldName = TopShareholderTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace TopShareholderTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds: TopShareholder.FieldId[] = [];
        export const count = TopShareholder.Field.count - unsupportedIds.length;

        class Info {
            id: TopShareholder.FieldId;
            fieldConstructor: CorrectnessTableGridField.Constructor;
            valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(TopShareholder.Field.count);

        function idToTableGridConstructors(id: TopShareholder.FieldId):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case TopShareholder.FieldId.Name:
                case TopShareholder.FieldId.Designation:
                case TopShareholder.FieldId.HolderKey:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case TopShareholder.FieldId.SharesHeld:
                case TopShareholder.FieldId.TotalShareIssue:
                case TopShareholder.FieldId.SharesChanged:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('TSTFDSFITTGC2004994', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return TopShareholder.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: TopShareholder.FieldId) {
            return TopShareholder.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return TopShareholder.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return TopShareholder.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: TopShareholder.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: TopShareholder.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < TopShareholder.Field.count; id++) {
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
