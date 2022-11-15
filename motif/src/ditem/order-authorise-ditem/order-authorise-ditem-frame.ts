/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    AssertInternalError,
    BrokerageAccountGroup,
    BrokerageAccountGroupOrderList,
    CommandRegisterService,
    CoreSettings,
    GridLayout,
    GridLayoutRecordStore,
    Integer,
    JsonElement,
    Order,
    OrderPad,
    OrderTableRecordDefinitionList,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService,
    TableRecordDefinitionList,
    TablesService
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class OrderAuthoriseDitemFrame extends BuiltinDitemFrame {
    private static readonly defaultActiveAccountGroup = BrokerageAccountGroup.createAll();

    recordFocusEvent: OrderAuthoriseDitemFrame.RecordFocusEvent;
    tableOpenEvent: OrderAuthoriseDitemFrame.TableOpenEvent;

    private readonly _coreSettings: CoreSettings;

    private _tableFrame: GridSourceFrame;
    private _orderList: BrokerageAccountGroupOrderList;
    private _currentFocusedLitIvemIdAccountGroupSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _tablesService: TablesService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.OrderAuthorise,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        this._coreSettings = settingsService.core;
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.OrderAuthorise; }
    get initialised() { return this._tableFrame !== undefined; }
    get focusedRecordIndex() { return this._tableFrame.getFocusedRecordIndex(); }

    initialise(tableFrame: GridSourceFrame, frameElement: JsonElement | undefined): void {
        this._tableFrame = tableFrame;
        this._tableFrame.recordFocusEvent = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        this._tableFrame.requireDefaultTableDefinitionEvent = () => this.handleRequireDefaultTableDefinitionEvent();
        this._tableFrame.tableOpenEvent = (recordDefinitionList) => this.handleTableOpenEvent(recordDefinitionList);

        if (frameElement === undefined) {
            this._tableFrame.loadLayoutConfig(undefined);
        } else {
            const contentElement = frameElement.tryGetElement(OrderAuthoriseDitemFrame.JsonName.content);
            this._tableFrame.loadLayoutConfig(contentElement);
        }

        this.applyLinked();
    }

    override finalise() {
        this._tableFrame.closeTable(false);
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentConfig = element.newElement(OrderAuthoriseDitemFrame.JsonName.content);
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
        const orderPad = new OrderPad(this._symbolDetailCacheService, this.adi);
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            orderPad.loadBuyFromOrder(order);
        } else {
            orderPad.loadBuy();
        }
        orderPad.applySettingsDefaults(this._coreSettings);
        this.desktopAccessService.editOrderRequest(orderPad);
    }

    sellFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        const orderPad = new OrderPad(this._symbolDetailCacheService, this.adi);
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            orderPad.loadSellFromOrder(order);
        } else {
            orderPad.loadSell();
        }
        orderPad.applySettingsDefaults(this._coreSettings);
        this.desktopAccessService.editOrderRequest(orderPad);
    }

    amendFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            const orderPad = new OrderPad(this._symbolDetailCacheService, this.adi);
            orderPad.loadAmendFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    cancelFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            const orderPad = new OrderPad(this._symbolDetailCacheService, this.adi);
            orderPad.loadCancelFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    moveFocused() {
        const focusedIndex = this._tableFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._orderList.records[focusedIndex];
            const orderPad = new OrderPad(this._symbolDetailCacheService, this.adi);
            orderPad.loadMoveFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    setGridLayout(value: GridLayout) {
        this._tableFrame.setGridLayout(value);
    }

    getGridLayoutWithHeadings(): GridLayoutRecordStore.LayoutWithHeadersMap {
        return this._tableFrame.getGridLayoutWithHeadersMap();
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
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
        return this._tablesService.definitionFactory.createOrder(OrderAuthoriseDitemFrame.defaultActiveAccountGroup);
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        const orderRecordDefinitionList = recordDefinitionList as OrderTableRecordDefinitionList;
        this._orderList = orderRecordDefinitionList.recordList;
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
        const tableDefinition = this._tablesService.definitionFactory.createOrder(group);
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

export namespace OrderAuthoriseDitemFrame {
    export namespace JsonName {
        export const content = 'content';
    }

    export type RecordFocusEvent = (this: void, newRecordIndex: Integer | undefined) => void;
    export type TableOpenEvent = (this: void, group: BrokerageAccountGroup) => void;
}
