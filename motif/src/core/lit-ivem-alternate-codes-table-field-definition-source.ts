/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, LitIvemAlternateCodes } from 'src/adi/internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'src/sys/internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import { CorrectnessTableGridField, StringDataItemTableGridField } from './table-grid-field';
import { CorrectnessTableGridValue, StringCorrectnessTableGridValue } from './table-grid-value';

export class LitIvemAlternateCodesTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.MyxLitIvemAttributes, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(LitIvemAlternateCodesTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemAlternateCodesTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemAlternateCodesTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = LitIvemAlternateCodesTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = LitIvemAlternateCodesTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemAlternateCodesTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemAlternateCodesTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: LitIvemAlternateCodes.Field.Id) {
        return LitIvemAlternateCodesTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemAlternateCodes.Field.Id) {
        const sourcelessFieldName = LitIvemAlternateCodesTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace LitIvemAlternateCodesTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds: LitIvemAlternateCodes.Field.Id[] = [];
        export const count = LitIvemAlternateCodes.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LitIvemAlternateCodes.Field.Id;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(LitIvemAlternateCodes.Field.idCount);

        function idToTableGridConstructors(id: LitIvemAlternateCodes.Field.Id):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case LitIvemAlternateCodes.Field.Id.Ticker:
                case LitIvemAlternateCodes.Field.Id.Gics:
                case LitIvemAlternateCodes.Field.Id.Isin:
                case LitIvemAlternateCodes.Field.Id.Ric:
                case LitIvemAlternateCodes.Field.Id.Base:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('LIACTFDSFITTGC5699945', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LitIvemAlternateCodes.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: LitIvemAlternateCodes.Field.Id) {
            return LitIvemAlternateCodes.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LitIvemAlternateCodes.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LitIvemAlternateCodes.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: LitIvemAlternateCodes.Field.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: LitIvemAlternateCodes.Field.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < LitIvemAlternateCodes.Field.idCount; id++) {
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
