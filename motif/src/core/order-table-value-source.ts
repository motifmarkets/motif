/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Order } from 'src/adi/internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';
import { DataRecordTableValueSource } from './data-record-table-value-source';
import { OrderTableFieldDefinitionSource } from './order-table-field-definition-source';
import {
    BooleanCorrectnessTableGridValue,
    CorrectnessTableGridValue,
    DecimalCorrectnessTableGridValue,
    EnumCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    OrderStatusAllowIdArrayCorrectnessTableGridValue,
    OrderStatusReasonIdArrayCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,
    SourceTzOffsetDateTimeDateCorrectnessTableGridValue,
    StringArrayCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class OrderTableValueSource extends DataRecordTableValueSource<Order> {
    private _orderChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _order: Order) {
        super(firstFieldIndexOffset);
    }

    activate() {
        this._orderChangedEventSubscriptionId = this._order.subscribeChangedEvent(
            (changedFieldIds) => this.handleOrderChangedEvent(changedFieldIds)
        );

        return super.activate();
    }

    deactivate() {
        this._order.unsubscribeChangedEvent(this._orderChangedEventSubscriptionId);
        this._orderChangedEventSubscriptionId = undefined;

        super.deactivate();
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = OrderTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = OrderTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getRecord() {
        return this._order;
    }

    protected getfieldCount(): Integer {
        return OrderTableFieldDefinitionSource.Field.count;
    }

    private handleOrderChangedEvent(changedFieldIds: Order.FieldId[]) {
        const changedFieldCount = changedFieldIds.length;
        const changedValues = new Array<TableValueSource.ChangedValue>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < changedFieldCount; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIdx = OrderTableFieldDefinitionSource.Field.indexOfId(fieldId);
            if (fieldIdx >= 0) {
                const newValue = this.createTableGridValue(fieldIdx);
                this.loadValue(fieldId, newValue);
                changedValues[foundCount++] = { fieldIdx, newValue };
            }
        }
        if (foundCount < changedFieldCount) {
            changedValues.length = foundCount;
        }
        this.notifyValuesChangeEvent(changedValues);
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = OrderTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Order.FieldId, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._order.correctnessId;

        switch (id) {
            case Order.FieldId.Id:
                (value as StringCorrectnessTableGridValue).data = this._order.id;
                break;
            case Order.FieldId.AccountId:
                (value as StringCorrectnessTableGridValue).data = this._order.accountId;
                break;
            case Order.FieldId.ExternalId:
                (value as StringCorrectnessTableGridValue).data = this._order.externalId;
                break;
            case Order.FieldId.DepthOrderId:
                (value as StringCorrectnessTableGridValue).data = this._order.depthOrderId;
                break;
            case Order.FieldId.Status:
                (value as StringCorrectnessTableGridValue).data = this._order.status;
                break;
            case Order.FieldId.StatusAllowIds:
                (value as OrderStatusAllowIdArrayCorrectnessTableGridValue).data = this._order.statusAllowIds;
                break;
            case Order.FieldId.StatusReasonIds:
                (value as OrderStatusReasonIdArrayCorrectnessTableGridValue).data = this._order.statusReasonIds;
                break;
            case Order.FieldId.MarketId:
                (value as EnumCorrectnessTableGridValue).data = this._order.marketId;
                break;
            case Order.FieldId.TradingMarket:
                (value as EnumCorrectnessTableGridValue).data = this._order.marketBoardId;
                break;
            case Order.FieldId.CurrencyId:
                (value as EnumCorrectnessTableGridValue).data = this._order.currencyId;
                break;
            case Order.FieldId.EstimatedBrokerage:
                (value as PriceCorrectnessTableGridValue).data = this._order.estimatedBrokerage;
                break;
            case Order.FieldId.CurrentBrokerage:
                (value as PriceCorrectnessTableGridValue).data = this._order.currentBrokerage;
                break;
            case Order.FieldId.EstimatedTax:
                (value as PriceCorrectnessTableGridValue).data = this._order.estimatedTax;
                break;
            case Order.FieldId.CurrentTax:
                (value as PriceCorrectnessTableGridValue).data = this._order.currentTax;
                break;
            case Order.FieldId.CurrentValue:
                (value as DecimalCorrectnessTableGridValue).data = this._order.currentValue;
                break;
            case Order.FieldId.CreatedDate:
                (value as SourceTzOffsetDateTimeDateCorrectnessTableGridValue).data = this._order.createdDate;
                break;
            case Order.FieldId.UpdatedDate:
                (value as SourceTzOffsetDateTimeDateCorrectnessTableGridValue).data = this._order.updatedDate;
                break;
            case Order.FieldId.StyleId:
                (value as EnumCorrectnessTableGridValue).data = this._order.styleId;
                break;
            case Order.FieldId.Children:
                (value as StringArrayCorrectnessTableGridValue).data =
                    this._order.children === undefined ? undefined : this._order.children.slice();
                break;
            case Order.FieldId.ExecutedQuantity:
                (value as IntegerCorrectnessTableGridValue).data = this._order.executedQuantity;
                break;
            case Order.FieldId.AveragePrice:
                (value as PriceCorrectnessTableGridValue).data = this._order.averagePrice;
                break;
            case Order.FieldId.ExchangeId:
                (value as EnumCorrectnessTableGridValue).data = this._order.exchangeId;
                break;
            case Order.FieldId.Code:
                (value as StringCorrectnessTableGridValue).data = this._order.code;
                break;
            case Order.FieldId.SideId:
                (value as EnumCorrectnessTableGridValue).data = this._order.sideId;
                break;
            case Order.FieldId.BrokerageSchedule:
                (value as StringCorrectnessTableGridValue).data = this._order.brokerageSchedule;
                break;
            case Order.FieldId.EquityOrderTypeId:
                (value as EnumCorrectnessTableGridValue).data = this._order.equityOrderTypeId;
                break;
            case Order.FieldId.LimitPrice:
                (value as PriceCorrectnessTableGridValue).data = this._order.limitPrice;
                break;
            case Order.FieldId.Quantity:
                (value as IntegerCorrectnessTableGridValue).data = this._order.quantity;
                break;
            case Order.FieldId.HiddenQuantity:
                (value as IntegerCorrectnessTableGridValue).data = this._order.hiddenQuantity;
                break;
            case Order.FieldId.MinimumQuantity:
                (value as IntegerCorrectnessTableGridValue).data = this._order.minimumQuantity;
                break;
            case Order.FieldId.TimeInForceId:
                (value as EnumCorrectnessTableGridValue).data = this._order.timeInForceId;
                break;
            case Order.FieldId.ExpiryDate:
                (value as SourceTzOffsetDateTimeDateCorrectnessTableGridValue).data = this._order.expiryDate;
                break;
            case Order.FieldId.UnitTypeId:
                (value as EnumCorrectnessTableGridValue).data = this._order.unitTypeId;
                break;
            case Order.FieldId.UnitAmount:
                (value as DecimalCorrectnessTableGridValue).data = this._order.unitAmount;
                break;
            case Order.FieldId.ManagedFundCurrency:
                (value as StringCorrectnessTableGridValue).data = this._order.managedFundCurrency;
                break;
            case Order.FieldId.PhysicalDelivery:
                (value as BooleanCorrectnessTableGridValue).data = this._order.physicalDelivery;
                break;
            case Order.FieldId.RouteAlgorithmId:
                (value as EnumCorrectnessTableGridValue).data = this._order.routeAlgorithmId;
                break;
            case Order.FieldId.RouteMarketId:
                (value as EnumCorrectnessTableGridValue).data = this._order.routeMarketId;
                break;
            case Order.FieldId.TriggerTypeId:
                (value as EnumCorrectnessTableGridValue).data = this._order.triggerTypeId;
                break;
            case Order.FieldId.TriggerValue:
                (value as PriceCorrectnessTableGridValue).data = this._order.triggerValue;
                break;
            case Order.FieldId.TriggerExtraParams:
                (value as StringCorrectnessTableGridValue).data = this._order.triggerExtraParamsText;
                break;
            case Order.FieldId.EnvironmentId:
                (value as EnumCorrectnessTableGridValue).data = this._order.environmentId;
                break;

            default:
                throw new UnreachableCaseError('BATVSLV9473', id);
        }
    }
}
