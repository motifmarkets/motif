/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import {
    assert,
    AssertInternalError,
    assigned,
    BinarySearchResult,
    ComparisonResult,
    earliestBinarySearch,
    Integer,
    isArrayEqualUniquely,
    isDecimalEqual,
    isDecimalGreaterThan,
    Logger,
    moveElementInArray,
    MultiEvent,
    UnexpectedCaseError,
    UnreachableCaseError
} from 'src/sys/internal-api';
import {
    BidAskSideId,
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    DepthDataDefinition,
    DepthDataMessage,
    MarketId
} from './common/internal-api';
import { MarketSubscriptionDataItem } from './market-subscription-data-item';

export class DepthDataItem extends MarketSubscriptionDataItem {
    private _depthDefinition: DepthDataDefinition;

    // #CodeLink[2213264368]: IMPORTANT: Depth records are currently treated as immutable values. If this changes,
    // the depth highlighting code will need to be revisited.
    private _bidOrders: DepthDataItem.Order[] = [];
    private _askOrders: DepthDataItem.Order[] = [];

    private _beforeBidOrderRemoveMultiEvent = new MultiEvent<DepthDataItem.BeforeOrderRemoveEventHandler>();
    private _afterBidOrderInsertMultiEvent = new MultiEvent<DepthDataItem.AfterOrderInsertEventHandler>();
    private _bidOrderChangeMultiEvent = new MultiEvent<DepthDataItem.OrderChangeEventHandler>();
    private _bidOrderMoveAndChangeMultiEvent = new MultiEvent<DepthDataItem.OrderMoveAndChangeEventHandler>();
    private _beforeAskOrderRemoveMultiEvent = new MultiEvent<DepthDataItem.BeforeOrderRemoveEventHandler>();
    private _afterAskOrderInsertMultiEvent = new MultiEvent<DepthDataItem.AfterOrderInsertEventHandler>();
    private _askOrderChangeMultiEvent = new MultiEvent<DepthDataItem.OrderChangeEventHandler>();
    private _askOrderMoveAndChangeMultiEvent = new MultiEvent<DepthDataItem.OrderMoveAndChangeEventHandler>();
    private _beforeOrdersClearMultiEvent = new MultiEvent<DepthDataItem.BeforeOrdersClearEventHandler>();

    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition);
        this._depthDefinition = this.definition as DepthDataDefinition;

        this.setMarketId(this._depthDefinition.litIvemId.litId);
    }

    get depthDefinition() { return this._depthDefinition; }

    getOrders(sideId: BidAskSideId): DepthDataItem.Order[] {
        switch (sideId) {
            case BidAskSideId.Bid:
                return this._bidOrders;

            case BidAskSideId.Ask:
                return this._askOrders;

            default:
                throw new UnreachableCaseError('DDIGLFS111345', sideId);
        }
    }

    override processSubscriptionPreOnline() { // virtual
        this.beginUpdate();
        try {
            this.clearOrders();
            super.processSubscriptionPreOnline();
        } finally {
            this.endUpdate();
        }
    }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.Depth) {
            super.processMessage(msg);

        } else {
            this.beginUpdate();
            try {
                switch (msg.typeId) {
                    case DataMessageTypeId.Depth:
                        assert(msg instanceof DepthDataMessage, 'ID:43212081047');
                        this.advisePublisherResponseUpdateReceived();
                        this.notifyUpdateChange();
                        this.processDepthMessage(msg as DepthDataMessage);
                        break;

                    default:
                        throw new UnexpectedCaseError('DDIPM232984', `${msg.typeId}`);
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    get bidRecords(): DepthDataItem.Order[] { return this._bidOrders; }
    get askRecords(): DepthDataItem.Order[] { return this._askOrders; }

    subscribeBeforeOrderRemoveEvent(sideId: BidAskSideId,
        handler: DepthDataItem.BeforeOrderRemoveEventHandler
    ) {
        switch (sideId) {
            case BidAskSideId.Bid: return this._beforeBidOrderRemoveMultiEvent.subscribe(handler);
            case BidAskSideId.Ask: return this._beforeAskOrderRemoveMultiEvent.subscribe(handler);
            default: throw new UnreachableCaseError('DDISBORE11148', sideId);
        }
    }

    unsubscribeBeforeOrderRemoveEvent(sideId: BidAskSideId, subscriptionId: MultiEvent.SubscriptionId) {
        switch (sideId) {
            case BidAskSideId.Bid:
                this._beforeBidOrderRemoveMultiEvent.unsubscribe(subscriptionId);
                break;
            case BidAskSideId.Ask:
                this._beforeAskOrderRemoveMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUBORE98447', sideId);
        }
    }

    subscribeAfterOrderInsertEvent(sideId: BidAskSideId,
        handler: DepthDataItem.AfterOrderInsertEventHandler
    ) {
        switch (sideId) {
            case BidAskSideId.Bid: return this._afterBidOrderInsertMultiEvent.subscribe(handler);
            case BidAskSideId.Ask: return this._afterAskOrderInsertMultiEvent.subscribe(handler);
            default: throw new UnreachableCaseError('DDISAOAE727266', sideId);
        }
    }

    unsubscribeAfterOrderInsertEvent(sideId: BidAskSideId, subscriptionId: MultiEvent.SubscriptionId) {
        switch (sideId) {
            case BidAskSideId.Bid:
                this._afterBidOrderInsertMultiEvent.unsubscribe(subscriptionId);
                break;
            case BidAskSideId.Ask:
                this._afterAskOrderInsertMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUAOAE188889', sideId);
        }
    }

    subscribeOrderChangeEvent(
        sideId: BidAskSideId,
        handler: DepthDataItem.OrderChangeEventHandler
    ) {
        switch (sideId) {
            case BidAskSideId.Bid: return this._bidOrderChangeMultiEvent.subscribe(handler);
            case BidAskSideId.Ask: return this._askOrderChangeMultiEvent.subscribe(handler);
            default: throw new UnreachableCaseError('DDISOCE22229', sideId);
        }
    }

    unsubscribeOrderChangeEvent(sideId: BidAskSideId, subscriptionId: MultiEvent.SubscriptionId) {
        switch (sideId) {
            case BidAskSideId.Bid:
                this._bidOrderChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            case BidAskSideId.Ask:
                this._askOrderChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUOCE09982', sideId);
        }
    }

    subscribeOrderMoveAndChangeEvent(
        sideId: BidAskSideId,
        handler: DepthDataItem.OrderMoveAndChangeEventHandler
    ) {
        switch (sideId) {
            case BidAskSideId.Bid: return this._bidOrderMoveAndChangeMultiEvent.subscribe(handler);
            case BidAskSideId.Ask: return this._askOrderMoveAndChangeMultiEvent.subscribe(handler);
            default: throw new UnreachableCaseError('DDISOMACE55587', sideId);
        }
    }

    unsubscribeOrderMoveAndChangeEvent(sideId: BidAskSideId, subscriptionId: MultiEvent.SubscriptionId) {
        switch (sideId) {
            case BidAskSideId.Bid:
                this._bidOrderMoveAndChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            case BidAskSideId.Ask:
                this._askOrderMoveAndChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUOVACE43434', sideId);
        }
    }

    subscribeBeforeOrdersClearEvent(handler: DepthDataItem.BeforeOrdersClearEventHandler) {
        return this._beforeOrdersClearMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeOrdersClearEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeOrdersClearMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyBeforeBidOrderRemove(orderIdx: Integer): void {
        const handlers = this._beforeBidOrderRemoveMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](orderIdx);
        }
    }

    private notifyAfterBidOrderInsert(orderIdx: Integer): void {
        const handlers = this._afterBidOrderInsertMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](orderIdx);
        }
    }

    private notifyBidOrderChange(OrderIdx: Integer, oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]): void {
        const handlers = this._bidOrderChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](OrderIdx, oldQuantity, oldHasUndisclosed, valueChanges);
        }
    }

    private notifyBidOrderMoveAndChange(fromIdx: Integer, toIndex: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]): void {
        const handlers = this._bidOrderMoveAndChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](fromIdx, toIndex, oldQuantity, oldHasUndisclosed, valueChanges);
        }
    }

    private notifyBeforeAskOrderRemove(orderIdx: Integer): void {
        const handlers = this._beforeAskOrderRemoveMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](orderIdx);
        }
    }

    private notifyAfterAskOrderInsert(orderIdx: Integer): void {
        const handlers = this._afterAskOrderInsertMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](orderIdx);
        }
    }

    private notifyAskOrderChange(OrderIdx: Integer, oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]): void {
        const handlers = this._askOrderChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](OrderIdx, oldQuantity, oldHasUndisclosed, valueChanges);
        }
    }

    private notifyAskOrderMoveAndChange(fromIdx: Integer, toIndex: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]): void {
        const handlers = this._askOrderMoveAndChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](fromIdx, toIndex, oldQuantity, oldHasUndisclosed, valueChanges);
        }
    }

    private notifyBeforeOrdersClear(): void {
        const handlers = this._beforeOrdersClearMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }

    private findOrderPositionByOrderId(orderList: DepthDataItem.Order[], orderId: string): number | undefined {
        for (let index = 0; index < orderList.length; index++) {
            const order = orderList[index];
            if (order.orderId === orderId) {
                return index;
            }
        }
        return undefined;
    }

    private findOrder(orderId: string): DepthDataItem.FoundOrderPositionInfo | undefined {
        let orderIndex: number | undefined;

        orderIndex = this.findOrderPositionByOrderId(this._bidOrders, orderId);
        if (orderIndex !== undefined) {
            return {
                side: BidAskSideId.Bid,
                list: this._bidOrders,
                listPosition: orderIndex
            };
        } else {
            orderIndex = this.findOrderPositionByOrderId(this._askOrders, orderId);
            if (orderIndex !== undefined) {
                return {
                    side: BidAskSideId.Ask,
                    list: this._askOrders,
                    listPosition: orderIndex
                };
            } else {
                return undefined;
            }
        }
    }

    private findOrderInsertIndex(
        list: DepthDataItem.Order[],
        side: BidAskSideId,
        orderPrice: Decimal,
        orderPosition: number
    ): BinarySearchResult {

        function bidSideCompareFunc(left: DepthDataItem.Order, right: DepthDataItem.Order) {
            if (!assigned(left.price)) {
                throw new Error('Condition not handled [ID:672081519491]');
            } else
            if (!assigned(right.price)) {
                throw new Error('Condition not handled [ID:672081519492]');
            } else
            if (left.price.greaterThan(right.price)) {
                return ComparisonResult.LeftLessThanRight; // sort in reverse order
            } else
            if (left.price.lessThan(right.price)) {
                return ComparisonResult.LeftGreaterThanRight; // sort in reverse order
            } else

            // #CodeLink[08160241799]: Remainder of compare func is identical.
            if (left.position < right.position) {
                return ComparisonResult.LeftLessThanRight;
            } else
            if (left.position > right.position) {
                return ComparisonResult.LeftGreaterThanRight;
            } else {
                return ComparisonResult.LeftEqualsRight;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        function askSideCompareFunc(left: DepthDataItem.Order, right: DepthDataItem.Order): -1 | 0 | 1 {
            if (!assigned(left.price)) {
                throw new Error('Condition not handled [ID:672081519491]');
            } else
            if (!assigned(right.price)) {
                throw new Error('Condition not handled [ID:672081519492]');
            } else
            if (left.price.greaterThan(right.price)) {
                return ComparisonResult.LeftGreaterThanRight;
            } else
            if (left.price.lessThan(right.price)) {
                return ComparisonResult.LeftLessThanRight;
            } else

            // #CodeLink[08160241799]: Remainder of compare func is identical.
            if (left.position < right.position) {
                return ComparisonResult.LeftLessThanRight;
            } else
            if (left.position > right.position) {
                return ComparisonResult.LeftGreaterThanRight;
            } else {
                return ComparisonResult.LeftEqualsRight;
            }
        }

        function getCompareFunc() {
            switch (side) {
                case BidAskSideId.Bid: return bidSideCompareFunc;
                case BidAskSideId.Ask: return askSideCompareFunc;
                default: throw new UnreachableCaseError('DDIFOIIGCF12195', side);
            }
        }

        const compareFunc = getCompareFunc();

        // #HACK: Construct a search value to look for.
        const searchValue: DepthDataItem.Order = {
            price: orderPrice,
            position: orderPosition,
        } as DepthDataItem.Order;

        return earliestBinarySearch(list, searchValue, compareFunc);
    }

    private createOrder(msgOrder: DepthDataMessage.DepthOrder | undefined): DepthDataItem.Order {
        if (!(assigned(msgOrder) && assigned(msgOrder.position) && assigned(msgOrder.price) && assigned(msgOrder.side))) {
            throw new AssertInternalError('DDICO195006');
        } else {
            let quantity: Integer;
            if (msgOrder.quantity !== undefined) {
                quantity = msgOrder.quantity;
            } else {
                quantity = 0;
                Logger.logDataError('DDICO22888', `Received new order without quantity`);
            }
            let marketId: MarketId;
            if (msgOrder.marketId !== undefined) {
                marketId = msgOrder.marketId;
            } else {
                marketId = this.marketId;
            }
            const newOrder: DepthDataItem.Order = {
                orderId: msgOrder.id,
                broker: msgOrder.broker,
                crossRef: msgOrder.crossRef,
                quantity,
                hasUndisclosed: msgOrder.hasUndisclosed === undefined ? false : msgOrder.hasUndisclosed,
                marketId,
                attributes: msgOrder.attributes === undefined ? [] : msgOrder.attributes,
                position: msgOrder.position,
                price: msgOrder.price,
                sideId: msgOrder.side,
            };
            return newOrder;
        }
    }

    private insertOrder(order: DepthDataItem.Order): void {

        const list = this.getOrders(order.sideId);

        const { found, index: orderInsertPosition } = this.findOrderInsertIndex(list, order.sideId, order.price, order.position);
        assert(!found, 'ID:81908154915');

        switch (order.sideId) {
            case BidAskSideId.Bid:
                this._bidOrders.splice(orderInsertPosition, 0, order);
                this.notifyAfterBidOrderInsert(orderInsertPosition);
                break;

            case BidAskSideId.Ask:
                this._askOrders.splice(orderInsertPosition, 0, order);
                this.notifyAfterAskOrderInsert(orderInsertPosition);
                break;

            default:
                throw new UnreachableCaseError('DDIIOU50111', order.sideId);
        }
    }

    private deleteOrder(orderId: string) {

        const findResult = this.findOrder(orderId);
        if (findResult === undefined) {
            Logger.logDataError('DDIDOF128854', `${orderId}`);
        } else {
            const { side: side, listPosition: orderIdx } = findResult;
            switch (side) {
                case BidAskSideId.Bid:
                    this.notifyBeforeBidOrderRemove(orderIdx);
                    this._bidOrders.splice(orderIdx, 1);
                    break;

                case BidAskSideId.Ask:
                    this.notifyBeforeAskOrderRemove(orderIdx);
                    this._askOrders.splice(orderIdx, 1);
                    break;

                default:
                    throw new UnreachableCaseError('DDIDOU50932', side);
            }
        }
    }

    private processDepthMessage(msg: DepthDataMessage): void {
        for (let index = 0; index < msg.orderChangeRecords.length; index++) {
            const cr = msg.orderChangeRecords[index];
            switch (cr.o) {
                case 'A':
                    this.processMessage_AddOrder(cr.order);
                    break;

                case 'U':
                    this.processMessage_UpdateOrder(cr.order);
                    break;

                case 'R':
                    this.processMessage_RemoveOrder(cr.order);
                    break;

                case 'C': // Clear All
                    this.clearOrders();
                    break;

                default:
                    throw new UnreachableCaseError('ID:30923101512', cr.o);
            }
        }
    }

    private processMessage_AddOrder(msgOrder: DepthDataMessage.DepthOrder | undefined): void {
        if (!(assigned(msgOrder) && assigned(msgOrder.side) && assigned(msgOrder.price) && assigned(msgOrder.position))) {
            Logger.logWarning('Condition not handled [ID:13404154852]');
        } else {
            // const priceLevel = this.findOrCreatePriceLevel(cr.Order.Side, cr.Order.Price);
            const order = this.createOrder(msgOrder);
            // this.incrementPriceLevelForOrder(order);
            this.insertOrder(order);
        }
    }

    private processMessage_UpdateOrder(msgOrder: DepthDataMessage.DepthOrder | undefined): void {
        if (!assigned(msgOrder)) {
            Logger.logWarning('Condition not handled [ID:14404154902]');
        } else {
            const changeOrderId = msgOrder.id;
            const findOldResult = this.findOrder(changeOrderId);

            if (findOldResult === undefined) {
                Logger.logWarning('Old Order not found. ID:13517151308');
            } else {
                const { side: sideId, list: list, listPosition: oldIndex } = findOldResult;
                const oldOrder = list[oldIndex];
                if (msgOrder.side !== undefined && msgOrder.side !== sideId) {
                    Logger.logError('Change Order on wrong side. ID:13517151308');
                } else {
                    if (msgOrder.price === undefined || msgOrder.position === undefined) {
                        this.changeOrder(sideId, oldOrder, msgOrder, oldIndex);
                    } else {
                        if (isDecimalEqual(msgOrder.price, oldOrder.price) && msgOrder.position === oldOrder.position) {
                            this.changeOrder(sideId, oldOrder, msgOrder, oldIndex);
                        } else {
                            const { found, index: newIndex } = this.findOrderInsertIndex(
                                list, sideId, msgOrder.price, msgOrder.position
                            );
                            if (found) {
                                Logger.logError('Change Order move over existing order. ID:13517151308');
                            } else {
                                if (newIndex === oldIndex) {
                                    this.changeOrder(sideId, oldOrder, msgOrder, oldIndex);
                                } else {
                                    this.moveAndChangeOrder(sideId, list, oldOrder, msgOrder, oldIndex, newIndex);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private processMessage_RemoveOrder(msgOrder: DepthDataMessage.DepthOrder | undefined): void {
        if (!assigned(msgOrder)) {
            Logger.log(Logger.LevelId.Warning, 'Order does not contain required fields');
        } else {
            this.deleteOrder(msgOrder.id);
        }
    }

    private updateOrder(order: DepthDataItem.Order, changeOrder: DepthDataMessage.DepthOrder): DepthDataItem.Order.ValueChange[] {
        // TODO:MED Find out what fields should be expected in update messages. The Zenith security response
        // has nullable and optional values. Optional values are unchanged. But it is explicitly mentioned
        // in the docs, so it's possible the depth message does not use the same convention.

        const changes = new Array<DepthDataItem.Order.ValueChange>(DepthDataItem.Order.Field.idCount); // set to max length
        let changeCount = 0;

        const newPrice = changeOrder.price;
        if (newPrice !== undefined) {
            if (!isDecimalEqual(newPrice, order.price)) {
                const newIsGreater = isDecimalGreaterThan(newPrice, order.price);
                const recentChangeTypeId = newIsGreater ? RevRecordValueRecentChangeTypeId.Increase : RevRecordValueRecentChangeTypeId.Decrease;
                order.price = newPrice;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Price,
                    recentChangeTypeId,
                };
            }
        }

        const newPosition = changeOrder.position;
        if (newPosition !== undefined) {
            if (newPosition !== order.position) {
                order.position = newPosition;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Position,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        const newBroker = changeOrder.broker;
        if (newBroker !== undefined) {
            if (newBroker !== order.broker) {
                order.broker = newBroker;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Broker,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        const newCrossRef = changeOrder.crossRef;
        if (newCrossRef !== undefined) {
            if (newCrossRef !== order.crossRef) {
                order.crossRef = newCrossRef;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Xref,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        const newQuantity = changeOrder.quantity;
        if (newQuantity !== undefined) {
            if (newQuantity !== order.quantity) {
                const newIsGreater = newQuantity > order.quantity;
                const recentChangeTypeId = newIsGreater ? RevRecordValueRecentChangeTypeId.Increase : RevRecordValueRecentChangeTypeId.Decrease;
                order.quantity = newQuantity;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Quantity,
                    recentChangeTypeId,
                };
            }
        }

        const newHasUndisclosed = changeOrder.hasUndisclosed;
        if (newHasUndisclosed !== undefined) {
            if (newHasUndisclosed !== order.hasUndisclosed) {
                order.hasUndisclosed = newHasUndisclosed;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.HasUndisclosed,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        const newMarketId = changeOrder.marketId;
        if (newMarketId !== undefined) {
            if (newMarketId !== order.marketId) {
                order.marketId = newMarketId;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Market,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        const newAttributes = changeOrder.attributes;
        if (newAttributes !== undefined) {
            if (!isArrayEqualUniquely(newAttributes, order.attributes)) {
                order.attributes = newAttributes;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Attributes,
                    recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                };
            }
        }

        changes.length = changeCount;
        return changes;
    }

    private changeOrder(
        sideId: BidAskSideId,
        order: DepthDataItem.Order,
        changeOrder: DepthDataMessage.DepthOrder,
        index: Integer,
    ) {
        const oldQuantity = order.quantity;
        const oldHasUndisclosed = order.hasUndisclosed;
        const valueChanges = this.updateOrder(order, changeOrder);
        switch (sideId) {
            case BidAskSideId.Bid:
                this.notifyBidOrderChange(index, oldQuantity, oldHasUndisclosed, valueChanges);
                break;
            case BidAskSideId.Ask:
                this.notifyAskOrderChange(index, oldQuantity, oldHasUndisclosed, valueChanges);
                break;
            default:
                throw new UnreachableCaseError('DDICO33386', sideId);
        }
    }

    private moveAndChangeOrder(
        sideId: BidAskSideId,
        list: DepthDataItem.Order[],
        order: DepthDataItem.Order,
        changeOrder: DepthDataMessage.DepthOrder,
        oldIndex: Integer,
        newIndex: Integer
    ) {
        const oldQuantity = order.quantity;
        const oldHasUndisclosed = order.hasUndisclosed;
        moveElementInArray<DepthDataItem.Order>(list, oldIndex, newIndex);
        const valueChanges = this.updateOrder(order, changeOrder);
        switch (sideId) {
            case BidAskSideId.Bid:
                this.notifyBidOrderMoveAndChange(oldIndex, newIndex, oldQuantity, oldHasUndisclosed, valueChanges);
                break;
            case BidAskSideId.Ask:
                this.notifyAskOrderMoveAndChange(oldIndex, newIndex, oldQuantity, oldHasUndisclosed, valueChanges);
                break;
            default:
                throw new UnreachableCaseError('DDIMACO929294', sideId);
        }
    }

    private clearOrders() {
        this.beginUpdate();
        try {
            const bidHadOrders = this._bidOrders.length > 0;
            const askHadOrders = this._askOrders.length > 0;
            if (bidHadOrders || askHadOrders) {
                this.notifyUpdateChange();
                this.notifyBeforeOrdersClear();
                this._bidOrders.length = 0;
                this._askOrders.length = 0;
            }
        } finally {
            this.endUpdate();
        }
    }
}

export namespace DepthDataItem {
    export interface Order {
        orderId: string;
        sideId: BidAskSideId;
        price: Decimal;
        position: Integer;
        broker: string | undefined;
        crossRef: string | undefined;
        quantity: Integer;
        hasUndisclosed: boolean;
        marketId: MarketId;
        attributes: string[];
    }

    export namespace Order {
        export namespace Field {
            export const enum Id {
                OrderId,
                Side,
                Price,
                Position,
                Broker,
                Xref,
                Quantity,
                HasUndisclosed,
                Market,
                Attributes,
            }

            export const idCount = 10; // make sure matches number of FieldId enums
        }

        export interface ValueChange {
            readonly fieldId: Field.Id;
            readonly recentChangeTypeId: RevRecordValueRecentChangeTypeId;
        }
    }

    export interface FoundOrderPositionInfo {
        side: BidAskSideId;
        list: DepthDataItem.Order[];
        listPosition: Integer;
    }

    export type OrderMoveAndChangeEventHandler = (fromIndex: Integer, toIndex: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]) => void;
    export type OrderChangeEventHandler = (index: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]) => void;
    export type BeforeOrderRemoveEventHandler = (this: void, index: Integer) => void;
    export type AfterOrderInsertEventHandler = (this: void, index: Integer) => void;
    export type BeforeOrdersClearEventHandler = (this: void) => void;
}

// #TestLink[08153141665]
// export function findPriceLevelIndex(
//     list: DepthDataItem.Order[],
//     side: SideId,
//     orderPrice: Decimal,
// ): { index: number, insert: boolean } {

//     function buySideCompareFunc(left: DepthDataItem.Order, right: DepthDataItem.Order): -1 | 0 | 1 {
//         if (!assigned(left.Price)) {
//             throw new Error('Condition not handled [ID:672081519491]');
//         } else
//         if (!assigned(right.Price)) {
//             throw new Error('Condition not handled [ID:672081519492]');
//         } else
//         if (left.Price > right.Price) {
//             return -1;
//         } else
//         if (left.Price < right.Price) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }

//     function sellSideCompareFunc(left: DepthDataItem.Order, right: DepthDataItem.Order): -1 | 0 | 1 {
//         if (!assigned(left.Price)) {
//             throw new Error('Condition not handled [ID:672081519491]');
//         } else
//         if (!assigned(right.Price)) {
//             throw new Error('Condition not handled [ID:672081519492]');
//         } else
//         if (left.Price > right.Price) {
//             return 1;
//         } else
//         if (left.Price < right.Price) {
//             return -1;
//         } else {
//             return 0;
//         }
//     }

//     function getCompareFunc() {
//         switch (side) {
//             case SideId.Buy: return buySideCompareFunc;
//             case SideId.Sell: return sellSideCompareFunc;
//             default:
//                 throw new Error('Condition not handled [ID:73008152120]');
//         }
//     }

//     const compareFunc = getCompareFunc();

//     // #HACK: Construct a search value to look for.
//     const searchValue: DepthDataItem.Order = {
//         Price: orderPrice,
//     };

//     const { found, index } = binarySearch(list, searchValue, compareFunc);

//     return {
//         insert: !found,
//         index: index,
//     };
// }






    // function isBuySideInsertPosition(existing: DepthDataItem.DepthRecord): boolean {
    //     if (isNull(existing.PriceAsNumber)) { throw new Error('ID:736231215021'); }
    //     if (existing.PriceAsNumber < orderPrice) {
    //         return true;
    //     } else if (existing.PriceAsNumber === orderPrice && DepthDataItem.isOrder(existing) && existing.Position > orderPosition) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // function isSellSideInsertPosition(existing: DepthDataItem.DepthRecord): boolean {
    //     if (isNull(existing.PriceAsNumber)) { throw new Error('ID:736231215022'); }
    //     if (existing.PriceAsNumber > orderPrice) {
    //         return true;
    //     } else if (existing.PriceAsNumber === orderPrice && DepthDataItem.isOrder(existing) && existing.Position > orderPosition) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // function getIsInsertPositionFunc(): ((existing: DepthDataItem.DepthRecord) => boolean) {
    //     switch (side) {
    //         case SideId.Buy: return isBuySideInsertPosition;
    //         case SideId.Sell: return isSellSideInsertPosition;
    //         default:
    //             throw new AdiError('Condition not handled [ID:45008145134]');
    //     }
    // }

    // const isInsertPosition = getIsInsertPositionFunc();

    // for (let index = 0; index < list.length; index++) {
    //     const existing = list[index];
    //     if (existing && isInsertPosition(existing)) {
    //         return index;
    //     }
    // }

    // return list.length;
