/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayout } from '@motifmarkets/revgrid';
import { Account, AdiService, BrokerageAccountGroup, BrokerageAccountGroupOrderList, Order } from 'src/adi/internal-api';
import { TableFrame } from 'src/content/internal-api';
import {
    CommandRegisterService,
    GridLayoutDataStore,
    OrderPad,
    OrderTableRecordDefinitionList,
    SymbolsService,
    tableDefinitionFactory,
    TableRecordDefinitionList
} from 'src/core/internal-api';
import { AssertInternalError, Integer, JsonElement } from 'src/sys/internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class OrdersDitemFrame extends BuiltinDitemFrame {
    private static readonly defaultActiveAccountGroup = BrokerageAccountGroup.createAll();

    recordFocusEvent: OrdersDitemFrame.RecordFocusEvent;
    tableOpenEvent: OrdersDitemFrame.TableOpenEvent;

    private _tableFrame: TableFrame;
    private _orderList: BrokerageAccountGroupOrderList;
    private _currentFocusedLitIvemIdAccountGroupSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Orders; }
    get initialised() { return this._tableFrame !== undefined; }
    get focusedRecordIndex() { return this._tableFrame.getFocusedRecordIndex(); }

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Orders,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    initialise(tableFrame: TableFrame, frameElement: JsonElement | undefined): void {
        this._tableFrame = tableFrame;
        this._tableFrame.recordFocusEvent = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        this._tableFrame.requireDefaultTableDefinitionEvent = () => this.handleRequireDefaultTableDefinitionEvent();
        this._tableFrame.tableOpenEvent = (recordDefinitionList) => this.handleTableOpenEvent(recordDefinitionList);

        if (frameElement === undefined) {
            this._tableFrame.loadLayoutConfig(undefined);
        } else {
            const contentElement = frameElement.tryGetElement(OrdersDitemFrame.JsonName.content);
            this._tableFrame.loadLayoutConfig(contentElement);
        }

        this.applyLinked();
    }

    finalise() {
        this._tableFrame.closeTable(false);
        super.finalise();
    }

    save(element: JsonElement) {
        super.save(element);

        const contentConfig = element.newElement(OrdersDitemFrame.JsonName.content);
        this._tableFrame.saveLayoutConfig(contentConfig);
    }

    canAmendFocusedOrder() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        if (focusedIndex === undefined) {
            return false;
        } else {
            const order = this._orderList.records[focusedIndex];
            return order.canAmend();
        }
    }

    canCancelFocusedOrder() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        if (focusedIndex === undefined) {
            return false;
        } else {
            const order = this._orderList.records[focusedIndex];
            return order.canCancel();
        }
    }

    buyFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        const orderPad = new OrderPad(this.symbolsService, this.adi);
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            orderPad.loadBuyFromOrder(order);
        } else {
            orderPad.loadBuy();
        }
        this.desktopAccessService.editOrderRequest(orderPad);
    }

    sellFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        const orderPad = new OrderPad(this.symbolsService, this.adi);
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            orderPad.loadSellFromOrder(order);
        } else {
            orderPad.loadSell();
        }
        this.desktopAccessService.editOrderRequest(orderPad);
    }

    amendFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            const orderPad = new OrderPad(this.symbolsService, this.adi);
            orderPad.loadAmendFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    cancelFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            const orderPad = new OrderPad(this.symbolsService, this.adi);
            orderPad.loadCancelFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    moveFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            const orderPad = new OrderPad(this.symbolsService, this.adi);
            orderPad.loadMoveFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    setGridLayout(value: GridLayout) {
        this._tableFrame.setGridLayout(value);
    }

    getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders {
        return this._tableFrame.getGridLayoutWithHeadings();
    }

    protected applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        if (this._currentFocusedLitIvemIdAccountGroupSetting) {
            return false;
        } else {
            if (selfInitiated) {
                return this.applyBrokerageAccountGroupWithNewTable(group, selfInitiated);
            } else {
                if (group === undefined) {
                    return false;
                } else {
                    const table = this._tableFrame.table;
                    if (table === undefined) {
                        return this.applyBrokerageAccountGroupWithNewTable(group, selfInitiated);
                    } else {
                        const recordDefinitionList = table.recordDefinitionList;
                        if (!(recordDefinitionList instanceof OrderTableRecordDefinitionList)) {
                            throw new AssertInternalError('ODFABAGT34340098');
                        } else {
                            if (group.isEqualTo(recordDefinitionList.brokerageAccountGroup)) {
                                return false;
                            } else {
                                return this.applyBrokerageAccountGroupWithNewTable(group, selfInitiated);
                            }
                        }
                    }
                }
            }
        }
    }

    private handleRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const order = this._orderList.records[newRecordIndex];
            this.processOrderFocusChange(order);
        }
        this.recordFocusEvent(newRecordIndex);
    }

    private handleRequireDefaultTableDefinitionEvent() {
        return tableDefinitionFactory.createOrder(OrdersDitemFrame.defaultActiveAccountGroup);
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        const orderRecordDefinitionList = recordDefinitionList as OrderTableRecordDefinitionList;
        this._orderList = orderRecordDefinitionList.dataRecordList;
        const group = orderRecordDefinitionList.brokerageAccountGroup;
        this.tableOpenEvent(group);
    }

    private processOrderFocusChange(newFocusedOrder: Order) {
        if (!this._brokerageAccountGroupApplying) {
            this._currentFocusedLitIvemIdAccountGroupSetting = true;
            try {
                let litIvemId = newFocusedOrder.litIvemId;
                if (litIvemId !== undefined) {
                    this.applyDitemLitIvemIdFocus(litIvemId, true);
                } else {
                    const ivemId = newFocusedOrder.ivemId;
                    litIvemId = this.symbolsService.getBestLitIvemIdFromIvemId(ivemId);
                    this.applyDitemLitIvemIdFocus(litIvemId, true);
                }

                const accountKey = new Account.Key(newFocusedOrder.accountId, newFocusedOrder.environmentId);
                const singleGroup = BrokerageAccountGroup.createSingle(accountKey);
                this.applyDitemBrokerageAccountGroupFocus(singleGroup, true);
            } finally {
                this._currentFocusedLitIvemIdAccountGroupSetting = false;
            }
        }
    }

    private newTable(group: BrokerageAccountGroup, keepCurrentLayout: boolean) {
        const tableDefinition = tableDefinitionFactory.createOrder(group);
        this._tableFrame.newPrivateTable(tableDefinition, keepCurrentLayout);
    }

    private applyBrokerageAccountGroupWithNewTable(group: BrokerageAccountGroup | undefined, selfInitiated: boolean) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, selfInitiated);
            if (group !== undefined) {
                // TODO add support for clearTable
                this.newTable(group, true);
            }
        } finally {
            this._brokerageAccountGroupApplying = false;
        }
        return result;
    }
}

export namespace OrdersDitemFrame {
    export namespace JsonName {
        export const content = 'content';
    }

    export type RecordFocusEvent = (this: void, newRecordIndex: Integer | undefined) => void;
    export type TableOpenEvent = (this: void, group: BrokerageAccountGroup) => void;
}
