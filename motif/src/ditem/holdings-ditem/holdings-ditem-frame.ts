/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    BrokerageAccountGroup,
    BrokerageAccountGroupHoldingList,
    Holding,
    SingleBrokerageAccountGroup
} from 'src/adi/internal-api';
import { TableFrame } from 'src/content/internal-api';
import {
    CommandRegisterService,
    HoldingTableRecordDefinitionList,
    SymbolsService,
    tableDefinitionFactory,
    TableRecordDefinitionList
} from 'src/core/internal-api';
import {
    AssertInternalError,
    Integer,
    JsonElement
} from 'src/sys/internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class HoldingsDitemFrame extends BuiltinDitemFrame {
    private static readonly default = {
        activeAccountGroup: BrokerageAccountGroup.createAll(),
    };

    recordFocusEvent: HoldingsDitemFrame.RecordFocusEvent;
    groupOpenedEvent: HoldingsDitemFrame.TableOpenEvent;

    private _holdingsTableFrame: TableFrame;
    private _holdingList: BrokerageAccountGroupHoldingList;

    private _balancesTableFrame: TableFrame;
    private _balancesSingleGroup: BrokerageAccountGroup | undefined;

    private _currentFocusedAccountIdSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    get initialised() {
        return this._holdingsTableFrame !== undefined;
    }
    get focusedRecordIndex() {
        return this._holdingsTableFrame.getFocusedRecordIndex();
    }

    constructor(
        private readonly _componentAccess: HoldingsDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsMgr: SymbolsService,
        adi: AdiService
    ) {
        super(
            BuiltinDitemFrame.BuiltinTypeId.Holdings,
            _componentAccess,
            commandRegisterService,
            desktopAccessService,
            symbolsMgr,
            adi
        );
    }

    initialise(
        holdingsTableFrame: TableFrame,
        balancesTableFrame: TableFrame,
        frameElement: JsonElement | undefined
    ) {
        this._holdingsTableFrame = holdingsTableFrame;
        this._holdingsTableFrame.recordFocusEvent = (newRecordIndex) =>
            this.handleHoldingsRecordFocusEvent(newRecordIndex);
        this._holdingsTableFrame.requireDefaultTableDefinitionEvent = () =>
            this.handleHoldingsRequireDefaultTableDefinitionEvent();
        this._holdingsTableFrame.tableOpenEvent = (recordDefinitionList) =>
            this.handleHoldingsTableOpenEvent(recordDefinitionList);

        this._balancesTableFrame = balancesTableFrame;

        if (frameElement === undefined) {
            this._holdingsTableFrame.loadLayoutConfig(undefined);
            this._balancesTableFrame.loadLayoutConfig(undefined);
        } else {
            const holdingsElement = frameElement.tryGetElement(
                HoldingsDitemFrame.JsonName.holdings
            );
            this._holdingsTableFrame.loadLayoutConfig(holdingsElement);
            const balancesElement = frameElement.tryGetElement(
                HoldingsDitemFrame.JsonName.balances
            );
            this._balancesTableFrame.loadLayoutConfig(balancesElement);
        }

        this.applyLinked();
    }

    finalise(): void {
        this._holdingsTableFrame.closeTable(false);
        this._balancesTableFrame.closeTable(false);
        super.finalise();
    }

    save(element: JsonElement) {
        super.save(element);

        const holdingsElement = element.newElement(
            HoldingsDitemFrame.JsonName.holdings
        );
        this._holdingsTableFrame.saveLayoutConfig(holdingsElement);
        const balancesElement = element.newElement(
            HoldingsDitemFrame.JsonName.balances
        );
        this._balancesTableFrame.saveLayoutConfig(balancesElement);
    }

    protected applyBrokerageAccountGroup(
        group: BrokerageAccountGroup | undefined,
        selfInitiated: boolean
    ): boolean {
        if (this._currentFocusedAccountIdSetting) {
            return false;
        } else {
            if (selfInitiated) {
                return this.applyBrokerageAccountGroupWithNewTable(
                    group,
                    selfInitiated
                );
            } else {
                if (group === undefined) {
                    return false;
                } else {
                    const table = this._holdingsTableFrame.table;
                    if (table === undefined) {
                        return this.applyBrokerageAccountGroupWithNewTable(
                            group,
                            selfInitiated
                        );
                    } else {
                        const recordDefinitionList = table.recordDefinitionList;
                        if (
                            !(
                                recordDefinitionList instanceof
                                HoldingTableRecordDefinitionList
                            )
                        ) {
                            throw new AssertInternalError('HDFABAGT1212009887');
                        } else {
                            if (
                                group.isEqualTo(
                                    recordDefinitionList.brokerageAccountGroup
                                )
                            ) {
                                return false;
                            } else {
                                return this.applyBrokerageAccountGroupWithNewTable(
                                    group,
                                    selfInitiated
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    private handleHoldingsRecordFocusEvent(
        newRecordIndex: Integer | undefined
    ) {
        if (newRecordIndex !== undefined) {
            const holding = this._holdingList.records[newRecordIndex];
            this.processHoldingFocusChange(holding);
        }
        this.recordFocusEvent(newRecordIndex);
    }

    private handleHoldingsRequireDefaultTableDefinitionEvent() {
        return tableDefinitionFactory.createHolding(
            HoldingsDitemFrame.default.activeAccountGroup
        );
    }

    private handleHoldingsTableOpenEvent(
        recordDefinitionList: TableRecordDefinitionList
    ) {
        const holdingRecordDefinitionList = recordDefinitionList as HoldingTableRecordDefinitionList;
        this._holdingList = holdingRecordDefinitionList.dataRecordList;
        const group = holdingRecordDefinitionList.brokerageAccountGroup;
        this.groupOpenedEvent(group);
    }

    private checkApplyBalancesSingleGroup(group: SingleBrokerageAccountGroup) {
        if (
            this._balancesSingleGroup === undefined ||
            !this._balancesSingleGroup.isEqualTo(group)
        ) {
            this._balancesSingleGroup = group;
            const balancesTableDefinition = tableDefinitionFactory.createBalances(
                group
            );
            this._balancesTableFrame.newPrivateTable(
                balancesTableDefinition,
                true
            );
            this._componentAccess.setBalancesVisible(true);
        }
    }

    private processHoldingFocusChange(newFocusedHolding: Holding) {
        const accountKey = new Account.Key(
            newFocusedHolding.accountId,
            newFocusedHolding.environmentId
        );
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
                    litIvemId = this.symbolsService.getBestLitIvemIdFromIvemId(
                        ivemId
                    );
                    this.applyDitemLitIvemIdFocus(litIvemId, true);
                }

                this.applyDitemBrokerageAccountGroupFocus(singleGroup, true);
            } finally {
                this._currentFocusedAccountIdSetting = false;
            }
        }
    }

    private newTable(group: BrokerageAccountGroup, keepCurrentLayout: boolean) {
        const tableDefinition = tableDefinitionFactory.createHolding(group);
        this._holdingsTableFrame.newPrivateTable(
            tableDefinition,
            keepCurrentLayout
        );

        if (BrokerageAccountGroup.isSingle(group)) {
            this.checkApplyBalancesSingleGroup(group);
        } else {
            this._balancesTableFrame.closeTable(true);
            this._balancesSingleGroup = undefined;
            this._componentAccess.setBalancesVisible(false);
        }
    }

    private applyBrokerageAccountGroupWithNewTable(
        group: BrokerageAccountGroup | undefined,
        SelfInitiated: boolean
    ) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, SelfInitiated);
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

export namespace HoldingsDitemFrame {
    export namespace JsonName {
        export const holdings = 'holdings';
        export const balances = 'balances';
    }

    export type RecordFocusEvent = (
        this: void,
        newRecordIndex: Integer | undefined
    ) => void;
    export type TableOpenEvent = (
        this: void,
        group: BrokerageAccountGroup
    ) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        setBalancesVisible(value: boolean): void;
    }
}
