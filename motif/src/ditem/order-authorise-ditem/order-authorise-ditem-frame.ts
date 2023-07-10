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
    BrokerageAccountGroupRecordList,
    CommandRegisterService,
    CoreSettings,
    GridLayoutOrNamedReferenceDefinition,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    Order,
    OrderPad,
    OrderTableRecordSource,
    OrderTableRecordSourceDefinition,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class OrderAuthoriseDitemFrame extends BuiltinDitemFrame {
    private readonly _coreSettings: CoreSettings;

    private _gridSourceFrame: GridSourceFrame;
    private _recordSource: OrderTableRecordSource;
    private _recordList: BrokerageAccountGroupRecordList<Order>;
    private _currentFocusedLitIvemIdAccountGroupSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _gridSourceOpenedEventer: OrderAuthoriseDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: OrderAuthoriseDitemFrame.RecordFocusedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.OrderAuthorise,
            ditemComponentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        this._coreSettings = settingsService.core;
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.OrderAuthorise; }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._gridSourceFrame !== undefined; }
    get focusedRecordIndex() { return this._gridSourceFrame.getFocusedRecordIndex(); }

    initialise(tableFrame: GridSourceFrame, frameElement: JsonElement | undefined): void {
        this._gridSourceFrame = tableFrame;
        this._gridSourceFrame.opener = this.opener;
        this._gridSourceFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);

        let gridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        if (frameElement === undefined) {
            gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
        } else {
            const contentElementResult = frameElement.tryGetElement(OrderAuthoriseDitemFrame.JsonName.content);
            if (contentElementResult.isErr()) {
                gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
            } else {
                const definition = this.tryCreateGridSourceOrNamedReferenceDefinitionFromJson(element);
                if (definition === undefined) {
                    gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
                } else {
                    gridSourceOrNamedReferenceDefinition = definition;
                }
            }
        }
        this.tryOpenGridSource(gridSourceOrNamedReferenceDefinition);

        this.applyLinked();
    }

    override finalise() {
        this._gridSourceFrame.closeGridSource(false);
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(OrderAuthoriseDitemFrame.JsonName.content);
        const definition = this._gridSourceFrame.createGridSourceOrNamedReferenceDefinition();
        definition.saveToJson(contentElement);
    }

    createAllowedFieldsAndLayoutDefinition() {
        return this._gridSourceFrame.createAllowedFieldsAndLayoutDefinition();
    }

    canAmendFocusedOrder() {
        const focusedIndex = this._gridSourceFrame.getFocusedRecordIndex();
        if (focusedIndex === undefined) {
            return false;
        } else {
            const order = this._recordList.records[focusedIndex];
            return order.canAmend();
        }
    }

    canCancelFocusedOrder() {
        const focusedIndex = this._gridSourceFrame.getFocusedRecordIndex();
        if (focusedIndex === undefined) {
            return false;
        } else {
            const order = this._recordList.records[focusedIndex];
            return order.canCancel();
        }
    }

    buyFocused() {
        const focusedIndex = this._gridSourceFrame.getFocusedRecordIndex();
        const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
        if (focusedIndex !== undefined) {
            const order = this._recordList.records[focusedIndex];
            orderPad.loadBuyFromOrder(order);
        } else {
            orderPad.loadBuy();
        }
        orderPad.applySettingsDefaults(this._coreSettings);
        this.desktopAccessService.editOrderRequest(orderPad);
    }

    sellFocused() {
        const focusedIndex = this._gridSourceFrame.getFocusedRecordIndex();
        const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
        if (focusedIndex !== undefined) {
            const order = this._recordList.records[focusedIndex];
            orderPad.loadSellFromOrder(order);
        } else {
            orderPad.loadSell();
        }
        orderPad.applySettingsDefaults(this._coreSettings);
        this.desktopAccessService.editOrderRequest(orderPad);
    }

    amendFocused() {
        const focusedIndex = this._gridSourceFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._recordList.records[focusedIndex];
            const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
            orderPad.loadAmendFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    cancelFocused() {
        const focusedIndex = this._gridSourceFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._recordList.records[focusedIndex];
            const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
            orderPad.loadCancelFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    moveFocused() {
        const focusedIndex = this._gridSourceFrame.getFocusedRecordIndex();
        if (focusedIndex !== undefined) {
            const order = this._recordList.records[focusedIndex];
            const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
            orderPad.loadMoveFromOrder(order);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition) {
        this._gridSourceFrame.openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition);
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        if (this._currentFocusedLitIvemIdAccountGroupSetting) {
            return false;
        } else {
            if (selfInitiated) {
                return this.applyBrokerageAccountGroupWithOpen(group, selfInitiated);
            } else {
                if (group === undefined) {
                    return false;
                } else {
                    // const table = this._gridSourceFrame.table;
                    // if (table === undefined) {
                    //     return this.applyBrokerageAccountGroupWithNewTable(group, selfInitiated);
                    // } else {
                        const tableRecordSourceDefinition = this._gridSourceFrame.createTableRecordSourceDefinition();
                        if (!(tableRecordSourceDefinition instanceof OrderTableRecordSourceDefinition)) {
                            throw new AssertInternalError('ODFABAGT34340');
                        } else {
                            if (group.isEqualTo(tableRecordSourceDefinition.brokerageAccountGroup)) {
                                return false;
                            } else {
                                return this.applyBrokerageAccountGroupWithOpen(group, selfInitiated);
                            }
                        }
                    // }
                }
            }
        }
    }

    private handleRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const order = this._recordList.records[newRecordIndex];
            this.processOrderFocusChange(order);
        }
        this._recordFocusedEventer(newRecordIndex);
    }

    private createGridSourceOrNamedReferenceDefinition() {
        const allBrokerageAccountGroup = BrokerageAccountGroup.createAll();
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createOrder(allBrokerageAccountGroup);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    private createDefaultGridSourceOrNamedReferenceDefinition() {
        return this.createGridSourceOrNamedReferenceDefinition();
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

    private tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition) {
        const gridSourceOrNamedReference = this._gridSourceFrame.tryOpenGridSource(definition, false);
        if (gridSourceOrNamedReference !== undefined) {
            const table = this._gridSourceFrame.openedTable;
            this._recordSource = table.recordSource as OrderTableRecordSource;
            this._recordList = this._recordSource.recordList;
            const brokerageAccountGroup = this._recordSource.brokerageAccountGroup;
            this.updateLockerName(brokerageAccountGroup.isAll() ? '' : brokerageAccountGroup.id);
            this._gridSourceOpenedEventer(brokerageAccountGroup);
        }
    }

    private applyBrokerageAccountGroupWithOpen(group: BrokerageAccountGroup | undefined, selfInitiated: boolean) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, selfInitiated);
            if (group !== undefined) {
                // TODO add support for clearTable
                const definition = this.createGridSourceOrNamedReferenceDefinition();
                this.tryOpenGridSource(definition);
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

    export type GridSourceOpenedEventer = (this: void, group: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
