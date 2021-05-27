/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, LitIvemDetail } from 'src/adi/internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'src/sys/internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    CorrectnessTableGridField,
    EnumDataItemTableGridField,
    IntegerArrayDataItemTableGridField,
    LitIvemIdDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    ExchangeIdCorrectnessTableGridValue,
    IvemClassIdCorrectnessTableGridValue,
    LitIvemIdCorrectnessTableGridValue,
    MarketIdArrayCorrectnessTableGridValue,
    MarketIdCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    ZenithSubscriptionDataIdArrayCorrectnessTableGridValue
} from './table-grid-value';

export class LitIvemBaseDetailTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.LitIvemBaseDetail, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(LitIvemBaseDetailTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < LitIvemBaseDetailTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = LitIvemBaseDetailTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = LitIvemBaseDetailTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = LitIvemBaseDetailTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = LitIvemBaseDetailTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = LitIvemBaseDetailTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: LitIvemDetail.BaseField.Id) {
        return LitIvemBaseDetailTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: LitIvemDetail.BaseField.Id) {
        const sourcelessFieldName = LitIvemBaseDetailTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace LitIvemBaseDetailTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds: LitIvemDetail.BaseField.Id[] = [];
        export const count = LitIvemDetail.BaseField.idCount - unsupportedIds.length;

        interface Info {
            readonly id: LitIvemDetail.BaseField.Id;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(LitIvemDetail.BaseField.idCount);

        function idToTableGridConstructors(id: LitIvemDetail.BaseField.Id):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case LitIvemDetail.BaseField.Id.Id:
                    return [LitIvemIdDataItemTableGridField, LitIvemIdCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.Code:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.MarketId:
                    return [EnumDataItemTableGridField, MarketIdCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.IvemClassId:
                    return [EnumDataItemTableGridField, IvemClassIdCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.SubscriptionDataIds:
                    return [IntegerArrayDataItemTableGridField, ZenithSubscriptionDataIdArrayCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.TradingMarketIds:
                    return [IntegerArrayDataItemTableGridField, MarketIdArrayCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.Name:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case LitIvemDetail.BaseField.Id.ExchangeId:
                    return [EnumDataItemTableGridField, ExchangeIdCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('LIBDTFDSFITTGC2039994', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return LitIvemDetail.BaseField.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: LitIvemDetail.BaseField.Id) {
            return LitIvemDetail.BaseField.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return LitIvemDetail.BaseField.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return LitIvemDetail.BaseField.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: LitIvemDetail.BaseField.Id) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: LitIvemDetail.BaseField.Id) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < LitIvemDetail.BaseField.idCount; id++) {
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
