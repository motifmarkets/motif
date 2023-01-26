/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    AssertInternalError,
    BrokerageAccountGroup, BrokerageAccountGroupRecordList,
    CommandRegisterService,
    CoreSettings,
    GridSourceDefinition, GridSourceOrNamedReferenceDefinition,
    Holding,
    HoldingTableRecordSource,
    HoldingTableRecordSourceDefinition,
    Integer,
    JsonElement,
    OrderPad,
    SettingsService,
    SingleBrokerageAccountGroup,
    SymbolDetailCacheService,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class HoldingsDitemFrame extends BuiltinDitemFrame {
    private static readonly default = {
        activeAccountGroup: BrokerageAccountGroup.createAll(),
    };

    private readonly _coreSettings: CoreSettings;

    private _holdingsGridSourceFrame: GridSourceFrame;
    private _holdingsRecordSource: HoldingTableRecordSource;
    private _holdingsRecordList: BrokerageAccountGroupRecordList<Holding>;

    private _balancesGridSourceFrame: GridSourceFrame;
    private _balancesSingleGroup: BrokerageAccountGroup | undefined;

    private _currentFocusedAccountIdSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    constructor(
        private readonly _componentAccess: HoldingsDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _gridSourceOpenedEventer: HoldingsDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: HoldingsDitemFrame.RecordFocusedEventer,
    ) {
        super(
            BuiltinDitemFrame.BuiltinTypeId.Holdings,
            _componentAccess,
            commandRegisterService,
            desktopAccessService,
            symbolsService,
            adiService
        );

        this._coreSettings = settingsService.core;
    }

    get initialised() { return this._holdingsGridSourceFrame !== undefined; }
    get focusedRecordIndex() { return this._holdingsGridSourceFrame.getFocusedRecordIndex(); }

    initialise(holdingsGridSourceFrame: GridSourceFrame, balancesGridSourceFrame: GridSourceFrame, frameElement: JsonElement | undefined) {
        this._holdingsGridSourceFrame = holdingsGridSourceFrame;
        this._holdingsGridSourceFrame.opener = this.opener;
        this._holdingsGridSourceFrame.recordFocusedEventer = (newRecordIndex) => this.handleHoldingsRecordFocusEvent(newRecordIndex);

        this._balancesGridSourceFrame = balancesGridSourceFrame;
        this._balancesGridSourceFrame.opener = this.opener;

        let holdingsGridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        let balancesGridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        if (frameElement === undefined) {
            holdingsGridSourceOrNamedReferenceDefinition = this.createDefaultHoldingsGridSourceOrNamedReferenceDefinition();
            balancesGridSourceOrNamedReferenceDefinition = this.createDefaultBalancesGridSourceOrNamedReferenceDefinition();
        } else {
            const holdingsElementResult = frameElement.tryGetElement(HoldingsDitemFrame.JsonName.holdings);
            if (holdingsElementResult.isErr()) {
                holdingsGridSourceOrNamedReferenceDefinition = this.createDefaultHoldingsGridSourceOrNamedReferenceDefinition();
            } else {
                const definitionResult = GridSourceOrNamedReferenceDefinition.tryCreateFromJson(
                    this._tableRecordSourceDefinitionFactoryService,
                    holdingsElementResult.value,
                );
                if (definitionResult.isOk()) {
                    holdingsGridSourceOrNamedReferenceDefinition = definitionResult.value;
                } else {
                    holdingsGridSourceOrNamedReferenceDefinition = this.createDefaultHoldingsGridSourceOrNamedReferenceDefinition();
                    // Temporary error toast
                }
            }
            const balancesElementResult = frameElement.tryGetElement(HoldingsDitemFrame.JsonName.balances);
            if (balancesElementResult.isErr()) {
                balancesGridSourceOrNamedReferenceDefinition = this.createDefaultBalancesGridSourceOrNamedReferenceDefinition();
            } else {
                const definitionResult = GridSourceOrNamedReferenceDefinition.tryCreateFromJson(
                    this._tableRecordSourceDefinitionFactoryService,
                    balancesElementResult.value,
                );
                if (definitionResult.isOk()) {
                    balancesGridSourceOrNamedReferenceDefinition = definitionResult.value;
                } else {
                    balancesGridSourceOrNamedReferenceDefinition = this.createDefaultBalancesGridSourceOrNamedReferenceDefinition();
                    // Temporary error toast
                }
            }
        }
        this.tryOpenHoldingsGridSource(holdingsGridSourceOrNamedReferenceDefinition);
        this.tryOpenBalancesGridSource(balancesGridSourceOrNamedReferenceDefinition);

        this.applyLinked();
    }

    override finalise(): void {
        this._holdingsGridSourceFrame.closeGridSource(false);
        this._balancesGridSourceFrame.closeGridSource(false);
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const holdingsElement = element.newElement(HoldingsDitemFrame.JsonName.holdings);
        const holdingsDefinition = this._holdingsGridSourceFrame.createGridSourceOrNamedReferenceDefinition();
        holdingsDefinition.saveToJson(holdingsElement);
        const balancesElement = element.newElement(HoldingsDitemFrame.JsonName.balances);
        const balancesDefinition = this._balancesGridSourceFrame.createGridSourceOrNamedReferenceDefinition();
        balancesDefinition.saveToJson(balancesElement);
    }

    sellFocused() {
        const focusedIndex = this._holdingsGridSourceFrame.getFocusedRecordIndex();
        const orderPad = new OrderPad(this._symbolDetailCacheService, this.adi);
        if (focusedIndex !== undefined) {
            const holding = this._holdingsRecordList.records[focusedIndex];
            orderPad.loadSellFromHolding(holding);
        } else {
            orderPad.loadSell();
        }
        orderPad.applySettingsDefaults(this._coreSettings);
        this.desktopAccessService.editOrderRequest(orderPad);
    }

    protected override applyBrokerageAccountGroup(
        group: BrokerageAccountGroup | undefined,
        selfInitiated: boolean
    ): boolean {
        if (this._currentFocusedAccountIdSetting) {
            return false;
        } else {
            if (selfInitiated) {
                return this.applyBrokerageAccountGroupWithOpen(group, selfInitiated);
            } else {
                if (group === undefined) {
                    return false;
                } else {
                    // const table = this._holdingsGridSourceFrame.table;
                    // if (table === undefined) {
                    //     return this.applyBrokerageAccountGroupWithNewTable(group, selfInitiated);
                    // } else {
                        const tableRecordSourceDefinition = this._holdingsGridSourceFrame.createTableRecordSourceDefinition();
                        if (!(tableRecordSourceDefinition instanceof HoldingTableRecordSourceDefinition)) {
                            throw new AssertInternalError('HDFABAGT12120');
                        } else {
                            if (group.isEqualTo(tableRecordSourceDefinition.brokerageAccountGroup)) {
                                return false;
                            } else {
                                return this.applyBrokerageAccountGroupWithOpen(group, selfInitiated);
                            }
                        }
                    }
                // }
            }
        }
    }

    private handleHoldingsRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const holding = this._holdingsRecordList.records[newRecordIndex];
            this.processHoldingFocusChange(holding);
        }
        this._recordFocusedEventer(newRecordIndex);
    }

    private checkApplyBalancesSingleGroup(group: SingleBrokerageAccountGroup) {
        if (this._balancesSingleGroup === undefined || !this._balancesSingleGroup.isEqualTo(group)) {
            this._balancesSingleGroup = group;
            const balancesDefinition = this.createBalancesGridSourceOrNamedReferenceDefinition(group);
            this.tryOpenBalancesGridSource(balancesDefinition);
            this._componentAccess.setBalancesVisible(true);
        }
    }

    private createHoldingsGridSourceOrNamedReferenceDefinition(brokerageAccountGroup: BrokerageAccountGroup) {
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createHolding(brokerageAccountGroup);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    private createDefaultHoldingsGridSourceOrNamedReferenceDefinition() {
        return this.createHoldingsGridSourceOrNamedReferenceDefinition(BrokerageAccountGroup.createAll());
    }

    private createBalancesGridSourceOrNamedReferenceDefinition(brokerageAccountGroup: BrokerageAccountGroup) {
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createBalances(brokerageAccountGroup);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    private createDefaultBalancesGridSourceOrNamedReferenceDefinition() {
        return this.createBalancesGridSourceOrNamedReferenceDefinition(BrokerageAccountGroup.createAll());
    }

    private processHoldingFocusChange(newFocusedHolding: Holding) {
        const accountKey = new Account.Key(newFocusedHolding.accountId, newFocusedHolding.environmentId);
        const singleGroup = BrokerageAccountGroup.createSingle(accountKey);

        this.checkApplyBalancesSingleGroup(singleGroup);

        if (!this._brokerageAccountGroupApplying) {
            this._currentFocusedAccountIdSetting = true;
            try {
                let litIvemId = newFocusedHolding.defaultLitIvemId;
                if (litIvemId !== undefined) {
                    this.applyDitemLitIvemIdFocus(litIvemId, true);
                } else {
                    const ivemId = newFocusedHolding.ivemId;
                    litIvemId = this.symbolsService.getBestLitIvemIdFromIvemId(ivemId);
                    this.applyDitemLitIvemIdFocus(litIvemId, true);
                }

                this.applyDitemBrokerageAccountGroupFocus(singleGroup, true);
            } finally {
                this._currentFocusedAccountIdSetting = false;
            }
        }
    }

    private tryOpenHoldingsGridSource(definition: GridSourceOrNamedReferenceDefinition) {
        const holdingsGridSourceOrNamedReference = this._holdingsGridSourceFrame.tryOpenGridSource(definition, false);
        if (holdingsGridSourceOrNamedReference !== undefined) {
            const table = this._holdingsGridSourceFrame.openedTable;
            this._holdingsRecordSource = table.recordSource as HoldingTableRecordSource;
            this._holdingsRecordList = this._holdingsRecordSource.recordList;
            const brokerageAccountGroup = this._holdingsRecordSource.brokerageAccountGroup;
            this.updateLockerName(brokerageAccountGroup.isAll() ? '' : brokerageAccountGroup.id);
            this._gridSourceOpenedEventer(brokerageAccountGroup);
            return true;
        } else {
            return false;
        }
    }

    private tryOpenBalancesGridSource(definition: GridSourceOrNamedReferenceDefinition) {
        this._balancesGridSourceFrame.tryOpenGridSource(definition, false);
        // if (balancesGridSourceOrNamedReference !== undefined) {
        //     const table = this._balancesGridSourceFrame.openedTable;
        //     this._balancesRecordSource = table.recordSource as BalancesTableRecordSource;
        //     this._balancesRecordList = this._balancesRecordSource.recordList;
        // }
    }

    private applyBrokerageAccountGroupWithOpen(group: BrokerageAccountGroup | undefined, selfInitiated: boolean) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, selfInitiated);
            if (group !== undefined) {
                // TODO add support for clearTable

                const holdingsGridSourceOrNamedReferenceDefinition = this.createHoldingsGridSourceOrNamedReferenceDefinition(group);
                if (!this.tryOpenHoldingsGridSource(holdingsGridSourceOrNamedReferenceDefinition)) {
                    this.closeAndHideBalances();
                } else {

                    if (!BrokerageAccountGroup.isSingle(group)) {
                    } else {
                        this.checkApplyBalancesSingleGroup(group);
                    }
                }
            }
        } finally {
            this._brokerageAccountGroupApplying = false;
        }
        return result;
    }

    private closeAndHideBalances() {
        this._balancesGridSourceFrame.closeGridSource(false);
        this._balancesSingleGroup = undefined;
        this._componentAccess.setBalancesVisible(false);
    }
}

export namespace HoldingsDitemFrame {
    export namespace JsonName {
        export const holdings = 'holdings';
        export const balances = 'balances';
    }

    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type GridSourceOpenedEventer = (this: void, group: BrokerageAccountGroup) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        setBalancesVisible(value: boolean): void;
    }
}
