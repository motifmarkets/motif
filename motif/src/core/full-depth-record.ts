/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { BidAskSideId, DepthDataItem, MarketId, MarketInfo } from 'src/adi/internal-api';
import {
    compareDecimal,
    compareInteger,
    Integer,
    isArrayEqualUniquely,
    Logger,
    uniqueElementArraysOverlap,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { DepthRecord } from './depth-record';
import { FullDepthSideField, FullDepthSideFieldId } from './full-depth-side-field';
import {
    CountAndXrefsRenderValue, IntegerRenderValue,

    MarketIdArrayRenderValue, MarketIdRenderValue, PriceAndHasUndisclosedRenderValue, PriceRenderValue, RenderValue,
    StringArrayRenderValue, StringRenderValue
} from './render-value';

export abstract class FullDepthRecord extends DepthRecord {
    protected renderRecord = new Array<RenderValue | undefined>(FullDepthSideField.idCount);

    override get quantityAhead() { return super.quantityAhead; }
    override set quantityAhead(value: Integer | undefined) {
        if (value !== super.quantityAhead) {
            super.quantityAhead = value;
            this.renderRecord[FullDepthSideFieldId.VolumeAhead] = undefined;
        }
    }

    getRenderValue(id: FullDepthSideFieldId, sideId: BidAskSideId, dataCorrectnessAttribute: RenderValue.Attribute | undefined) {
        const { renderValue, extraAttribute } = this.createRenderValue(id);

        // Create attributes array.  First figure out how many elements
        let attributeCount = 1;
        if (dataCorrectnessAttribute !== undefined) {
            attributeCount++;
        }
        if (extraAttribute !== undefined) {
            attributeCount++;
        }

        // Create array
        const attributes = new Array<RenderValue.Attribute>(attributeCount);

        // Add required elements - must be in correct order
        let attributeIdx = 0;
        if (dataCorrectnessAttribute !== undefined) {
            attributes[attributeIdx++] = dataCorrectnessAttribute;
        }
        if (extraAttribute !== undefined) {
            attributes[attributeIdx++] = extraAttribute;
        }
        const recordAttribute: RenderValue.DepthRecordAttribute = {
            id: RenderValue.AttributeId.DepthRecord,
            bidAskSideId: sideId,
            depthRecordTypeId: this.typeId,
            ownOrder: this.isOwnOrder(),
        };
        attributes[attributeIdx] = recordAttribute;

        renderValue.setAttributes(attributes);
        return renderValue;
    }

    abstract getCount(): Integer;
    abstract getPrice(): Decimal;
    abstract getUndisclosedCount(): Integer;

    protected abstract createRenderValue(id: FullDepthSideFieldId): DepthRecord.CreateRenderValueResult;
    protected abstract isOwnOrder(): boolean;
}

export namespace FullDepthRecord {
    export function isPriceLevel(record: FullDepthRecord): record is PriceLevelFullDepthRecord {
        return record.typeId === DepthRecord.TypeId.PriceLevel;
    }

    export function isOrder(record: FullDepthRecord): record is OrderFullDepthRecord {
        return record.typeId === DepthRecord.TypeId.Order;
    }

    function comparePriceAndHasUndisclosedField(left: FullDepthRecord, right: FullDepthRecord) {
        let result = comparePriceField(left, right);
        if (result === 0) {
            result = compareInteger(left.getUndisclosedCount(), right.getUndisclosedCount());
        }
        return result;
    }

    function compareQuantityField(left: FullDepthRecord, right: FullDepthRecord) {
        return compareInteger(left.getVolume(), right.getVolume());
    }

    function compareVolumeAheadField(left: FullDepthRecord, right: FullDepthRecord) {
        if (left.quantityAhead !== undefined) {
            if (right.quantityAhead !== undefined) {
                return compareInteger(left.quantityAhead, right.quantityAhead);
            } else {
                return -1;
            }
        } else {
            if (right.quantityAhead !== undefined) {
                return 1;
            } else {
                return comparePriceField(left, right);
            }
        }
    }

    function comparePriceField(left: FullDepthRecord, right: FullDepthRecord) {
        return compareDecimal(left.getPrice(), right.getPrice());
    }

    function compareCount(left: FullDepthRecord, right: FullDepthRecord) {
        return compareInteger(left.getCount(), right.getCount());
    }

    export function compareField(id: FullDepthSideFieldId, left: FullDepthRecord, right: FullDepthRecord): number {
        switch (id) {
            case FullDepthSideFieldId.PriceAndHasUndisclosed: return comparePriceAndHasUndisclosedField(left, right);
            case FullDepthSideFieldId.Volume: return compareQuantityField(left, right);
            case FullDepthSideFieldId.CountXref: return 0;
            case FullDepthSideFieldId.BrokerId: return 0;
            case FullDepthSideFieldId.MarketId: return 0;
            case FullDepthSideFieldId.VolumeAhead: return compareVolumeAheadField(left, right);
            case FullDepthSideFieldId.Attributes: return 0;
            case FullDepthSideFieldId.Price: return comparePriceField(left, right);
            case FullDepthSideFieldId.Xref: return 0;
            case FullDepthSideFieldId.Count: return compareCount(left, right);
            case FullDepthSideFieldId.OrderId: return 0;
            default: throw new UnreachableCaseError('FDRCF22285', id);
        }
    }

    export function compareFieldDesc(id: FullDepthSideFieldId, left: FullDepthRecord, right: FullDepthRecord): number {
        switch (id) {
            case FullDepthSideFieldId.PriceAndHasUndisclosed: return comparePriceAndHasUndisclosedField(left, right) * -1;
            case FullDepthSideFieldId.Volume: return compareQuantityField(left, right) * -1;
            case FullDepthSideFieldId.CountXref: return 0;
            case FullDepthSideFieldId.BrokerId: return 0;
            case FullDepthSideFieldId.MarketId: return 0;
            case FullDepthSideFieldId.VolumeAhead: return compareVolumeAheadField(left, right) * -1;
            case FullDepthSideFieldId.Attributes: return 0;
            case FullDepthSideFieldId.Price: return comparePriceField(left, right) * -1;
            case FullDepthSideFieldId.Xref: return 0;
            case FullDepthSideFieldId.Count: return compareCount(left, right) * -1;
            case FullDepthSideFieldId.OrderId: return 0;
            default: throw new UnreachableCaseError('FDRCFD22285', id);
        }
    }
}

export class OrderFullDepthRecord extends FullDepthRecord {
    constructor(index: Integer, private _order: DepthDataItem.Order,
        quantityAhead: Integer | undefined, auctionQuantity: Integer | undefined
    ) {
        super(DepthRecord.TypeId.Order, index, quantityAhead, auctionQuantity);
    }

    get order() { return this._order; }
    getVolume() { return this._order.quantity; } // virtual override
    getRenderVolume() { return this._order.quantity; } // virtual override
    getCount() { return 1; } // virtual override
    getPrice() { return this._order.price; } // virtual override
    getUndisclosedCount() { return this._order.hasUndisclosed ? 1 : 0; } // virtual override

    acceptedByFilter(filterXrefs: string[]): boolean {
        const xref = this.order.crossRef;
        if (xref === undefined) {
            return false;
        } else {
            if (filterXrefs.length === 0) {
                return true;
            } else {
                return filterXrefs.includes(xref);
            }
        }
    }

    processOrderChange(changedFieldIds: DepthDataItem.Order.FieldId[])  {
        for (const id of changedFieldIds) {
            switch (id) {
                case DepthDataItem.Order.FieldId.OrderId:
                    this.renderRecord[FullDepthSideFieldId.OrderId] = undefined;
                    break;
                case DepthDataItem.Order.FieldId.Side:
                    // no Record Field
                    break;
                case DepthDataItem.Order.FieldId.Price:
                    this.renderRecord[FullDepthSideFieldId.Price] = undefined;
                    this.renderRecord[FullDepthSideFieldId.PriceAndHasUndisclosed] = undefined;
                    break;
                case DepthDataItem.Order.FieldId.Position:
                    // no Record Field
                    break;
                case DepthDataItem.Order.FieldId.Broker:
                    this.renderRecord[FullDepthSideFieldId.BrokerId] = undefined;
                    break;
                case DepthDataItem.Order.FieldId.Xref:
                    this.renderRecord[FullDepthSideFieldId.Xref] = undefined;
                    this.renderRecord[FullDepthSideFieldId.CountXref] = undefined;
                    break;
                case DepthDataItem.Order.FieldId.Quantity:
                    this.renderRecord[FullDepthSideFieldId.Volume] = undefined;
                    break;
                case DepthDataItem.Order.FieldId.HasUndisclosed:
                    this.renderRecord[FullDepthSideFieldId.PriceAndHasUndisclosed] = undefined;
                    break;
                case DepthDataItem.Order.FieldId.Market:
                    this.renderRecord[FullDepthSideFieldId.MarketId] = undefined;
                    break;
                case DepthDataItem.Order.FieldId.Attributes:
                    this.renderRecord[FullDepthSideFieldId.Attributes] = undefined;
                    break;
                default:
                    throw new UnreachableCaseError('FDROFDRPOC44487', id);
            }
        }
    }

    processMovedWithOrderChange(changedFieldIds: DepthDataItem.Order.FieldId[])  {
        this.processOrderChange(changedFieldIds);
    }

    protected createRenderValue(id: FullDepthSideFieldId): DepthRecord.CreateRenderValueResult {  // virtual override
        switch (id) {
            case FullDepthSideFieldId.PriceAndHasUndisclosed: return this.createPriceAndHasUndisclosedRenderValue();
            case FullDepthSideFieldId.Volume: return this.createVolumeRenderValue();
            case FullDepthSideFieldId.CountXref: return this.createCountXrefRenderValue();
            case FullDepthSideFieldId.BrokerId: return this.createBrokerIdRenderValue();
            case FullDepthSideFieldId.MarketId: return this.createMarketIdRenderValue();
            case FullDepthSideFieldId.VolumeAhead: return this.createVolumeAheadRenderValue();
            case FullDepthSideFieldId.Attributes: return this.createAttributesRenderValue();
            case FullDepthSideFieldId.Price: return this.createPriceRenderValue();
            case FullDepthSideFieldId.Xref: return this.createXRefRenderValue();
            case FullDepthSideFieldId.Count: return this.createCountRenderValue();
            case FullDepthSideFieldId.OrderId: return this.createOrderIdRenderValue();
            default: throw new UnreachableCaseError('FDROFDRCRV88736', id);
        }
    }

    protected isOwnOrder() { // virtual override
        return this._order.crossRef !== undefined;
    }

    private createPriceAndHasUndisclosedRenderValue(): DepthRecord.CreateRenderValueResult  {
        const data: PriceAndHasUndisclosedRenderValue.DataType = {
            price: new PriceRenderValue.decimalConstructor(this.order.price),
            hasUndisclosed: this.order.hasUndisclosed
        };
        const renderValue = new PriceAndHasUndisclosedRenderValue(data);
        return { renderValue };
    }
    private createCountXrefRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringRenderValue(this.order.crossRef);
        const extraAttribute: RenderValue.DepthCountXRefFieldAttribute = {
            id: RenderValue.AttributeId.DepthCountXRefField,
            isCountAndXrefs: false,
        };
        return { renderValue, extraAttribute };
    }
    private createBrokerIdRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringRenderValue(this.order.broker);
        return { renderValue };
    }
    private createMarketIdRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new MarketIdRenderValue(this.order.marketId);
        return { renderValue };
    }
    private createAttributesRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringArrayRenderValue(this.order.attributes);
        return { renderValue };
    }
    private createPriceRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new PriceRenderValue(this.order.price);
        return { renderValue };
    }
    private createXRefRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringRenderValue(this.order.crossRef);
        return { renderValue };
    }
    private createCountRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new IntegerRenderValue(1);
        return { renderValue };
    }
    private createOrderIdRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringRenderValue(this.order.orderId);
        return { renderValue };
    }
}

export class PriceLevelFullDepthRecord extends FullDepthRecord {
    private _price: Decimal;
    private _count: Integer; // Number of orders at this price level.
    private _volume: Integer; // Total number of shares at this price level.
    private _marketIds: MarketId[]; // Array of markets in orders
    private _undisclosedOrderCount: number; // 0 = no undisclosed amounts, >0 = undisclosed amounts in price level.
    private _xrefs: string[]; // Array of Xrefs in orders
    private _brokerIds: string[]; // Array of brokers in orders
    private _attributes: string[]; // Array of all attributes in all orders
    private _orders: DepthDataItem.Order[]; // all orders at this price level (not necessarily in correct order)

    constructor(index: Integer, firstOrder: DepthDataItem.Order, quantityAhead: Integer | undefined, auctionQuantity: Integer | undefined) {
        super(DepthRecord.TypeId.PriceLevel, index, quantityAhead, auctionQuantity);

        this._price = new Decimal(firstOrder.price);
        this._count = 1;
        this._volume = firstOrder.quantity;
        this._marketIds = [firstOrder.marketId];
        this._undisclosedOrderCount = firstOrder.hasUndisclosed ? 1 : 0;
        if (firstOrder.crossRef !== undefined) {
            this._xrefs = [firstOrder.crossRef];
        } else {
            this._xrefs = [];
        }
        if (firstOrder.broker !== undefined) {
            this._brokerIds = [firstOrder.broker];
        } else {
            this._brokerIds = [];
        }
        this._attributes = firstOrder.attributes;
        this._orders = new Array<DepthDataItem.Order>(1);
        this._orders[0] = firstOrder;
    }

    get price() { return this._price; }
    get count() { return this._count; }
    get quantity() { return this._volume; }
    get marketIds() { return this._marketIds; }
    get undisclosedOrderCount() { return this._undisclosedOrderCount; }
    get xrefs() { return this._xrefs; }
    get brokerIds() { return this._brokerIds; }
    get attributes() { return this._attributes; }
    get orders() { return this._orders; }

    get hasUndisclosed() { return this._undisclosedOrderCount > 0; }

    getVolume() { return this._volume; } // virtual override
    getRenderVolume() { return this._volume; } // virtual override
    getCount() { return this._count; } // virtual override
    getPrice() { return this.price; } // virtual override
    getUndisclosedCount() { return this._undisclosedOrderCount; } // virtual override

    acceptedByFilter(filterXrefs: string[]): boolean {
        const xrefs = this.xrefs;
        if (xrefs.length === 0) {
            return false;
        } else {
            if (filterXrefs.length === 0) {
                return true;
            } else {
                return uniqueElementArraysOverlap(xrefs, filterXrefs);
            }
        }
    }

    addOrder(order: DepthDataItem.Order) {
        this._count++;
        this.renderRecord[FullDepthSideFieldId.Count] = undefined;
        this.renderRecord[FullDepthSideFieldId.CountXref] = undefined;
        this._volume += order.quantity;
        this.renderRecord[FullDepthSideFieldId.Volume] = undefined;
        const marketId = order.marketId;
        if (this._marketIds.includes(marketId)) {
            this._marketIds.push(marketId);
            this.renderRecord[FullDepthSideFieldId.MarketId] = undefined;
        }
        if (order.hasUndisclosed) {
            this._undisclosedOrderCount++;
            if (this._undisclosedOrderCount++ === 0) {
                this.renderRecord[FullDepthSideFieldId.PriceAndHasUndisclosed] = undefined;
            }
        }
        const xref = order.crossRef;
        if (xref !== undefined && !this._xrefs.includes(xref)) {
            this._xrefs.push(xref);
            this.renderRecord[FullDepthSideFieldId.Xref] = undefined;
            this.renderRecord[FullDepthSideFieldId.CountXref] = undefined;
        }
        const brokerId = order.broker;
        if (brokerId !== undefined && !this._brokerIds.includes(brokerId)) {
            this._brokerIds.push(brokerId);
            this.renderRecord[FullDepthSideFieldId.BrokerId] = undefined;
        }
        for (const attribute of order.attributes) {
            if (this._attributes.includes(attribute)) {
                this._attributes.push(attribute);
                this.renderRecord[FullDepthSideFieldId.Attributes] = undefined;
            }
        }
        this._orders.push(order);
    }

    addOrders(depthOrders: DepthDataItem.Order[], index: Integer, count: Integer) {
        this._count += count;
        this.renderRecord[FullDepthSideFieldId.Count] = undefined;
        this.renderRecord[FullDepthSideFieldId.CountXref] = undefined;

        const oldHasUndisclosed = this.hasUndisclosed;

        for (let i = 0; i < count; i++) {
            const order = depthOrders[index + i];
            this._volume += order.quantity;
            if (order.hasUndisclosed) {
                this._undisclosedOrderCount++;
            }
        }
        // check if hasUndisclosed has changed
        if (this.hasUndisclosed !== oldHasUndisclosed) {
            this.renderRecord[FullDepthSideFieldId.PriceAndHasUndisclosed] = undefined;
        }

        this._orders.splice(this._orders.length, 0, ...depthOrders.slice(index, index + count));

        const newMarketIds = this.calculateMarketIds();
        if (!MarketInfo.uniqueElementIdArraysAreSame(newMarketIds, this._marketIds)) {
            this._marketIds = newMarketIds;
            this.renderRecord[FullDepthSideFieldId.MarketId] = undefined;
        }
        const newXrefs = this.calculateXrefs();
        if (!isArrayEqualUniquely<string>(newXrefs, this._xrefs)) {
            this._xrefs = newXrefs;
            this.renderRecord[FullDepthSideFieldId.Xref] = undefined;
            this.renderRecord[FullDepthSideFieldId.CountXref] = undefined;
        }
        const newBrokerIds = this.calculateBrokerIds();
        if (!isArrayEqualUniquely<string>(newBrokerIds, this._brokerIds)) {
            this._brokerIds = newBrokerIds;
            this.renderRecord[FullDepthSideFieldId.BrokerId] = undefined;
        }
        const newAttributes = this.calculateAttributes();
        if (!isArrayEqualUniquely<string>(newAttributes, this._attributes)) {
            this._attributes = newAttributes;
            this.renderRecord[FullDepthSideFieldId.Attributes] = undefined;
        }
    }

    removeOrder(order: DepthDataItem.Order, oldVolume: Integer,
        oldHasUndisclosed: boolean) {
        // in some cases, order, has been changed so we need to pass in oldQuantity and oldHasUndisclosed separately
        const orderIdx = this._orders.indexOf(order);
        if (orderIdx < 0) {
            Logger.logInternalError('FDRPLFDRRMR38867', `Not found: ${order.orderId}`);
        } else {
            const oldMarketCount = this.marketIds.length;
            const oldXrefCount = this.xrefs.length;
            const oldBrokerIdCount = this.brokerIds.length;
            const oldAttributesCount = this.attributes.length;

            this._orders.splice(orderIdx, 1);
            this._count--;
            this.renderRecord[FullDepthSideFieldId.Count] = undefined;
            this.renderRecord[FullDepthSideFieldId.CountXref] = undefined;
            this._volume -= oldVolume;
            this.renderRecord[FullDepthSideFieldId.Volume] = undefined;
            if (oldHasUndisclosed) {
                this._undisclosedOrderCount--;
                this.renderRecord[FullDepthSideFieldId.PriceAndHasUndisclosed] = undefined;
            }
            const marketIds = this.calculateMarketIds();
            if (marketIds.length !== oldMarketCount) {
                this._marketIds = marketIds;
                this.renderRecord[FullDepthSideFieldId.MarketId] = undefined;
            }
            const xrefs = this.calculateXrefs();
            if (xrefs.length !== oldXrefCount) {
                this._xrefs = xrefs;
                this.renderRecord[FullDepthSideFieldId.Xref] = undefined;
                this.renderRecord[FullDepthSideFieldId.CountXref] = undefined;
            }
            const brokerIds = this.calculateBrokerIds();
            if (brokerIds.length !== oldBrokerIdCount) {
                this._brokerIds = brokerIds;
                this.renderRecord[FullDepthSideFieldId.BrokerId] = undefined;
            }
            const attributes = this.calculateAttributes();
            if (attributes.length !== oldAttributesCount) {
                this._attributes = attributes;
                this.renderRecord[FullDepthSideFieldId.Attributes] = undefined;
            }
        }
    }

    processOrderChange(
        newOrder: DepthDataItem.Order,
        oldOrderQuantity: Integer,
        oldHasUndisclosed: boolean,
        changedFieldIds: DepthDataItem.Order.FieldId[]
    )  {
        const quantityChange = newOrder.quantity - oldOrderQuantity;
        if (quantityChange !== 0) {
            this._volume += quantityChange;
            this.renderRecord[FullDepthSideFieldId.Volume] = undefined;
        }
        if (oldHasUndisclosed !== newOrder.hasUndisclosed) {
            if (oldHasUndisclosed) {
                this._undisclosedOrderCount--;
            } else {
                this._undisclosedOrderCount++;
            }
            this.renderRecord[FullDepthSideFieldId.PriceAndHasUndisclosed] = undefined;
        }
        for (const id of changedFieldIds) {
            switch (id) {
                case DepthDataItem.Order.FieldId.Market:
                    const newMarketIds = this.calculateMarketIds();
                    if (!MarketInfo.uniqueElementIdArraysAreSame(newMarketIds, this._marketIds)) {
                        this._marketIds = newMarketIds;
                        this.renderRecord[FullDepthSideFieldId.MarketId] = undefined;
                    }
                    break;
                case DepthDataItem.Order.FieldId.Xref:
                    const newXrefs = this.calculateXrefs();
                    if (!isArrayEqualUniquely<string>(newXrefs, this._xrefs)) {
                        this._xrefs = newXrefs;
                        this.renderRecord[FullDepthSideFieldId.Xref] = undefined;
                        this.renderRecord[FullDepthSideFieldId.CountXref] = undefined;
                    }
                    break;
                case DepthDataItem.Order.FieldId.Broker:
                    const newBrokerIds = this.calculateBrokerIds();
                    if (!isArrayEqualUniquely<string>(newBrokerIds, this._brokerIds)) {
                        this._brokerIds = newBrokerIds;
                        this.renderRecord[FullDepthSideFieldId.BrokerId] = undefined;
                    }
                    break;
                case DepthDataItem.Order.FieldId.Attributes:
                    const newAttributes = this.calculateAttributes();
                    if (!isArrayEqualUniquely<string>(newAttributes, this._attributes)) {
                        this._attributes = newAttributes;
                        this.renderRecord[FullDepthSideFieldId.Attributes] = undefined;
                    }
                    break;
            }
        }
    }

    processMovedWithOrderChange(
        newOrder: DepthDataItem.Order,
        oldOrderQuantity: Integer,
        oldHasUndisclosed: boolean,
        changedFieldIds: DepthDataItem.Order.FieldId[]
    ) {
        this.processOrderChange(newOrder, oldOrderQuantity, oldHasUndisclosed, changedFieldIds);
    }

    protected isOwnOrder() { // virtual override
        return this._xrefs.length > 0;
    }

    protected createRenderValue(id: FullDepthSideFieldId): DepthRecord.CreateRenderValueResult {  // virtual override
        switch (id) {
            case FullDepthSideFieldId.PriceAndHasUndisclosed: return this.createPriceAndHasUndisclosedRenderValue();
            case FullDepthSideFieldId.Volume: return this.createVolumeRenderValue();
            case FullDepthSideFieldId.CountXref: return this.createCountXrefRenderValue();
            case FullDepthSideFieldId.BrokerId: return this.createBrokerIdRenderValue();
            case FullDepthSideFieldId.MarketId: return this.createMarketIdRenderValue();
            case FullDepthSideFieldId.VolumeAhead: return this.createVolumeAheadRenderValue();
            case FullDepthSideFieldId.Attributes: return this.createAttributesRenderValue();
            case FullDepthSideFieldId.Price: return this.createPriceRenderValue();
            case FullDepthSideFieldId.Xref: return this.createXRefRenderValue();
            case FullDepthSideFieldId.Count: return this.createCountRenderValue();
            case FullDepthSideFieldId.OrderId: return this.createOrderIdRenderValue();
            default: throw new UnreachableCaseError('FDRPLFDRCRV29958', id);
        }
    }

    private createPriceAndHasUndisclosedRenderValue(): DepthRecord.CreateRenderValueResult {
        const data: PriceAndHasUndisclosedRenderValue.DataType = {
            price: new PriceRenderValue.decimalConstructor(this._price),
            hasUndisclosed: this._undisclosedOrderCount > 0
        };
        const renderValue = new PriceAndHasUndisclosedRenderValue(data);
        return { renderValue };
    }
    private createCountXrefRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new CountAndXrefsRenderValue( { count: this._count, xrefs: this._xrefs });
        const extraAttribute: RenderValue.DepthCountXRefFieldAttribute = {
            id: RenderValue.AttributeId.DepthCountXRefField,
            isCountAndXrefs: true,
        };
        return { renderValue, extraAttribute };
    }
    private createBrokerIdRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringArrayRenderValue(this._brokerIds);
        return { renderValue };
    }
    private createMarketIdRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new MarketIdArrayRenderValue(this._marketIds);
        return { renderValue };
    }
    private createAttributesRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringArrayRenderValue(this._attributes);
        return { renderValue };
    }
    private createPriceRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new PriceRenderValue(this._price);
        return { renderValue };
    }
    private createXRefRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringArrayRenderValue(this.xrefs);
        return { renderValue };
    }
    private createCountRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new IntegerRenderValue(this._count);
        return { renderValue };
    }
    private createOrderIdRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new StringRenderValue(undefined);
        return { renderValue };
    }

    private calculateMarketIds() {
        const count = this._orders.length;
        const marketIds = new Array<MarketId>(count);
        for (let i = 0; i < count; i++) {
            const order = this._orders[i];
            marketIds[i] = order.marketId;
        }
        return marketIds;
    }

    private calculateBrokerIds() {
        const count = this._orders.length;
        const brokerIds = new Array<string>(count);
        let brokerIdCount = 0;
        for (let i = 0; i < count; i++) {
            const order = this._orders[i];
            const brokerId = order.broker;
            if (brokerId !== undefined && !brokerIds.includes(brokerId)) {
                brokerIds[brokerIdCount++] = brokerId;
            }
        }
        if (brokerIds.length > brokerIdCount) {
            brokerIds.length = brokerIdCount;
        }
        return brokerIds;
    }

    private calculateXrefs() {
        const count = this._orders.length;
        const xrefs = new Array<string>(count);
        let xrefCount = 0;
        for (let i = 0; i < count; i++) {
            const order = this._orders[i];
            const xref = order.crossRef;
            if (xref !== undefined && !xrefs.includes(xref)) {
                xrefs[xrefCount++] = xref;
            }
        }
        if (xrefs.length > xrefCount) {
            xrefs.length = xrefCount;
        }
        return xrefs;
    }

    private calculateAttributes() {
        const count = this._orders.length;
        const attributes = new Array<string>(count * 3); // initial guess at maximum length
        let attributeCount = 0;
        for (let i = 0; i < count; i++) {
            const order = this._orders[i];

            for (const attribute in order.attributes) {
                if (!attributes.includes(attribute)) {
                    if (attributeCount >= attributes.length) {
                        attributes.length = attributeCount * 2;
                    }
                    attributes[attributeCount++] = attribute;
                }
            }
        }

        if (attributes.length > attributeCount) {
            attributes.length = attributeCount;
        }

        return attributes;
    }
}
