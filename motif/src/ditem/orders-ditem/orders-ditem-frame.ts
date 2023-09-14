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
    CommandRegisterService,
    GridLayoutOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    Order,
    OrderPad,
    OrderTableRecordSourceDefinition,
    ScalarSettings,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { OrdersFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class OrdersDitemFrame extends BuiltinDitemFrame {
    private readonly _scalarSettings: ScalarSettings;

    private _ordersFrame: OrdersFrame | undefined;
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
        private readonly _gridSourceOpenedEventer: OrdersDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: OrdersDitemFrame.RecordFocusedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Orders,
            ditemComponentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        this._scalarSettings = settingsService.scalar;
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Orders; }
    get initialised() { return this._ordersFrame !== undefined; }
    get focusedRecordIndex() { return this._ordersFrame?.getFocusedRecordIndex(); }

    initialise(ditemFrameElement: JsonElement | undefined, ordersFrame: OrdersFrame): void {
        this._ordersFrame = ordersFrame;

        ordersFrame.gridSourceOpenedEventer = (brokerageAccountGroup) => this.handleGridSourceOpenedEvent(brokerageAccountGroup);
        ordersFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex);

        let ordersFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const ordersFrameElementResult = ditemFrameElement.tryGetElement(OrdersDitemFrame.JsonName.ordersFrame);
            if (ordersFrameElementResult.isOk()) {
                ordersFrameElement = ordersFrameElementResult.value;
            }
        }

        ordersFrame.initialiseGrid(
            this.opener,
            ordersFrameElement,
            false,
        );

        this.applyLinked();
    }

    override finalise() {
        if (this._ordersFrame !== undefined) {
            this._ordersFrame.closeGridSource(false);
        }
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const ordersFrame = this._ordersFrame;
        if (ordersFrame === undefined) {
            throw new AssertInternalError('ODFS04418');
        } else {
            const contentElement = element.newElement(OrdersDitemFrame.JsonName.ordersFrame);
            const definition = ordersFrame.createGridSourceOrNamedReferenceDefinition();
            definition.saveToJson(contentElement);
        }
    }

    createAllowedFieldsAndLayoutDefinition() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCAFALD04418');
        } else {
            return this._ordersFrame.createAllowedFieldsGridLayoutDefinition();
        }
    }

    openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition) {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFOGLONRD04418');
        } else {
            this._ordersFrame.openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition);
        }
    }

    canAmendFocusedOrder() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCAFO68109');
        } else {
            return this._ordersFrame.canAmendFocusedOrder();
        }
    }

    canCancelFocusedOrder() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCCFO68109');
        } else {
            return this._ordersFrame.canCancelFocusedOrder();
        }
    }

    buyFocused() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFBF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
            const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
            if (focusedOrder !== undefined) {
                orderPad.loadBuyFromOrder(focusedOrder);
            } else {
                orderPad.loadBuy();
            }
            orderPad.applySettingsDefaults(this._scalarSettings);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    sellFocused() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFSF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
            const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
            if (focusedOrder !== undefined) {
                orderPad.loadSellFromOrder(focusedOrder);
            } else {
                orderPad.loadSell();
            }
            orderPad.applySettingsDefaults(this._scalarSettings);
            this.desktopAccessService.editOrderRequest(orderPad);
        }
    }

    amendFocused() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFAF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
                orderPad.loadAmendFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    cancelFocused() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFCF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
                orderPad.loadCancelFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    moveFocused() {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFMF68109');
        } else {
            const focusedOrder = this._ordersFrame.getFocusedOrder();
            if (focusedOrder !== undefined) {
                const orderPad = new OrderPad(this._symbolDetailCacheService, this.adiService);
                orderPad.loadMoveFromOrder(focusedOrder);
                this.desktopAccessService.editOrderRequest(orderPad);
            }
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._ordersFrame === undefined) {
            throw new AssertInternalError('ODFASACW10174');
        } else {
            this._ordersFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        if (this._currentFocusedLitIvemIdAccountGroupSetting) {
            return false;
        } else {
            const ordersFrame = this._ordersFrame;
            if (ordersFrame === undefined) {
                throw new AssertInternalError('ODFABAG68109');
            } else {
                if (selfInitiated) {
                    return this.applyBrokerageAccountGroupWithOpen(ordersFrame, group, selfInitiated, true);
                } else {
                    if (group === undefined) {
                        return false;
                    } else {
                        const tableRecordSourceDefinition = ordersFrame.createTableRecordSourceDefinition();
                        if (!(tableRecordSourceDefinition instanceof OrderTableRecordSourceDefinition)) {
                            throw new AssertInternalError('ODFABAGT34340098');
                        } else {
                            if (group.isEqualTo(tableRecordSourceDefinition.brokerageAccountGroup)) {
                                return false;
                            } else {
                                return this.applyBrokerageAccountGroupWithOpen(ordersFrame, group, selfInitiated, true);
                            }
                        }
                    }
                }
            }
        }
    }

    private handleGridSourceOpenedEvent(brokerageAccountGroup: BrokerageAccountGroup) {
        this.updateLockerName(brokerageAccountGroup.isAll() ? '' : brokerageAccountGroup.id);
        this._gridSourceOpenedEventer(brokerageAccountGroup);
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            if (this._ordersFrame === undefined) {
                throw new AssertInternalError('ODFHGSOE29974');
            } else {
                const order = this._ordersFrame.recordList.getAt(newRecordIndex);
                this.processOrderFocusChange(order);
            }
        }
        this._recordFocusedEventer(newRecordIndex);
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

    private applyBrokerageAccountGroupWithOpen(ordersFrame: OrdersFrame, group: BrokerageAccountGroup | undefined, selfInitiated: boolean, keepView: boolean) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, selfInitiated);
            if (group !== undefined) {
                // TODO add support for clearTable
                ordersFrame.tryOpenWithDefaultLayout(group, keepView);
            }
        } finally {
            this._brokerageAccountGroupApplying = false;
        }
        return result;
    }
}

export namespace OrdersDitemFrame {
    export namespace JsonName {
        export const ordersFrame = 'ordersFrame';
    }

    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type GridSourceOpenedEventer = (this: void, group: BrokerageAccountGroup) => void;
}
