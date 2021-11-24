/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, Order } from 'adi-internal-api';
import { CommaText, Integer, UnreachableCaseError } from 'sys-internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    BooleanDataItemTableGridField,
    CorrectnessTableGridField,
    DecimalDataItemTableGridField,
    EnumDataItemTableGridField,
    IntegerArrayDataItemTableGridField,
    IntegerDataItemTableGridField,
    SourceTzOffsetDateTimeDataItemTableGridField,
    StringArrayDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    CurrencyIdCorrectnessTableGridValue,
    DecimalCorrectnessTableGridValue,
    EquityOrderTypeIdCorrectnessTableGridValue,
    ExchangeEnvironmentIdCorrectnessTableGridValue,
    ExchangeIdCorrectnessTableGridValue,
    GridOrderTriggerTypeIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    IvemClassIdCorrectnessTableGridValue,
    MarketBoardIdCorrectnessTableGridValue,
    MarketIdCorrectnessTableGridValue,
    OrderPriceUnitTypeIdCorrectnessTableGridValue,
    OrderRouteAlgorithmIdCorrectnessTableGridValue,
    OrderStatusAllowIdArrayCorrectnessTableGridValue,
    OrderStatusReasonIdArrayCorrectnessTableGridValue,
    PhysicalDeliveryCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,
    SideIdCorrectnessTableGridValue,
    SourceTzOffsetDateTimeDateCorrectnessTableGridValue,
    StringArrayCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TimeInForceIdCorrectnessTableGridValue
} from './table-grid-value';

export class OrderTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.OrdersDataItem, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(OrderTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < OrderTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = OrderTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = OrderTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = OrderTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = OrderTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = OrderTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

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

    isFieldSupported(id: Order.FieldId) {
        return OrderTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: Order.FieldId) {
        const sourcelessFieldName = OrderTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace OrderTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds: Order.FieldId[] = [];
        export const count = Order.Field.count - unsupportedIds.length;

        interface Info {
            readonly id: Order.FieldId;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Order.Field.count);

        function idToTableGridConstructors(id: Order.FieldId):
            TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case Order.FieldId.Id:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.AccountId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.ExternalId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.DepthOrderId:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.Status:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.StatusAllowIds:
                    return [IntegerArrayDataItemTableGridField, OrderStatusAllowIdArrayCorrectnessTableGridValue];
                case Order.FieldId.StatusReasonIds:
                    return [IntegerArrayDataItemTableGridField, OrderStatusReasonIdArrayCorrectnessTableGridValue];
                case Order.FieldId.MarketId:
                    return [EnumDataItemTableGridField, MarketIdCorrectnessTableGridValue];
                case Order.FieldId.TradingMarket:
                    return [EnumDataItemTableGridField, MarketBoardIdCorrectnessTableGridValue];
                case Order.FieldId.CurrencyId:
                    return [EnumDataItemTableGridField, CurrencyIdCorrectnessTableGridValue];
                case Order.FieldId.EstimatedBrokerage:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.CurrentBrokerage:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.EstimatedTax:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.CurrentTax:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.CurrentValue:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case Order.FieldId.CreatedDate:
                    // return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeCorrectnessTableGridValue];
                    return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeDateCorrectnessTableGridValue];
                case Order.FieldId.UpdatedDate:
                    // return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeCorrectnessTableGridValue];
                    return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeDateCorrectnessTableGridValue];
                case Order.FieldId.StyleId:
                    return [EnumDataItemTableGridField, IvemClassIdCorrectnessTableGridValue];
                case Order.FieldId.Children:
                    return [StringArrayDataItemTableGridField, StringArrayCorrectnessTableGridValue];
                case Order.FieldId.ExecutedQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Order.FieldId.AveragePrice:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.ExchangeId:
                    return [EnumDataItemTableGridField, ExchangeIdCorrectnessTableGridValue];
                case Order.FieldId.Code:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.SideId:
                    return [EnumDataItemTableGridField, SideIdCorrectnessTableGridValue];
                case Order.FieldId.BrokerageSchedule:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.EquityOrderTypeId:
                    return [EnumDataItemTableGridField, EquityOrderTypeIdCorrectnessTableGridValue];
                case Order.FieldId.LimitPrice:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.Quantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Order.FieldId.HiddenQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Order.FieldId.MinimumQuantity:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Order.FieldId.TimeInForceId:
                    return [EnumDataItemTableGridField, TimeInForceIdCorrectnessTableGridValue];
                case Order.FieldId.ExpiryDate:
                    return [SourceTzOffsetDateTimeDataItemTableGridField, SourceTzOffsetDateTimeDateCorrectnessTableGridValue];
                case Order.FieldId.UnitTypeId:
                    return [EnumDataItemTableGridField, OrderPriceUnitTypeIdCorrectnessTableGridValue];
                case Order.FieldId.UnitAmount:
                    return [DecimalDataItemTableGridField, DecimalCorrectnessTableGridValue];
                case Order.FieldId.ManagedFundCurrency:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.PhysicalDelivery:
                    return [BooleanDataItemTableGridField, PhysicalDeliveryCorrectnessTableGridValue];
                case Order.FieldId.RouteAlgorithmId:
                    return [EnumDataItemTableGridField, OrderRouteAlgorithmIdCorrectnessTableGridValue];
                case Order.FieldId.RouteMarketId:
                    return [EnumDataItemTableGridField, MarketIdCorrectnessTableGridValue];
                case Order.FieldId.TriggerTypeId:
                    return [EnumDataItemTableGridField, GridOrderTriggerTypeIdCorrectnessTableGridValue];
                case Order.FieldId.TriggerValue:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case Order.FieldId.TriggerExtraParams:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Order.FieldId.EnvironmentId:
                    return [EnumDataItemTableGridField, ExchangeEnvironmentIdCorrectnessTableGridValue];

                default:
                    throw new UnreachableCaseError('OTFDSFITTGC10049334', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Order.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Order.FieldId) {
            return Order.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Order.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Order.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Order.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Order.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Order.Field.count; id++) {
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
