/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, AdiService, Balances, BrokerageAccountGroup, BrokerageAccountGroupBalancesList } from 'src/adi/internal-api';
import { TableFrame } from 'src/content/internal-api';
import {
    BalancesTableRecordDefinitionList,
    CommandRegisterService,
    SymbolsService,
    tableDefinitionFactory,
    TableRecordDefinitionList
} from 'src/core/internal-api';
import { AssertInternalError, Integer, JsonElement } from 'src/sys/internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class BalancesDitemFrame extends BuiltinDitemFrame {
    private static readonly default = {
        activeAccountGroup: BrokerageAccountGroup.createAll(),
    };

    recordFocusEvent: BalancesDitemFrame.RecordFocusEvent;
    tableOpenEvent: BalancesDitemFrame.TableOpenEvent;

    private _tableFrame: TableFrame;
    private _balancesList: BrokerageAccountGroupBalancesList;
    private _currentFocusedAccountIdSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    get initialised() { return this._tableFrame !== undefined; }
    get focusedRecordIndex() { return this._tableFrame.getFocusedRecordIndex(); }

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Balances,
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
            const contentElement = frameElement.tryGetElement(BalancesDitemFrame.JsonName.content);
            this._tableFrame.loadLayoutConfig(contentElement);
        }

        this.applyLinked();
    }

    override finalise(): void {
        this._tableFrame.closeTable(false);
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(BalancesDitemFrame.JsonName.content);
        this._tableFrame.saveLayoutConfig(contentElement);
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        if (this._currentFocusedAccountIdSetting) {
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
                        if (!(recordDefinitionList instanceof BalancesTableRecordDefinitionList)) {
                            throw new AssertInternalError('BDFABAGT1212009887');
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
            const record = this._balancesList.records[newRecordIndex];
            this.processRecordFocusChange(record);
        }
        this.recordFocusEvent(newRecordIndex);
    }

    private handleRequireDefaultTableDefinitionEvent() {
        return tableDefinitionFactory.createBalances(BalancesDitemFrame.default.activeAccountGroup);
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        const balancesRecordDefinitionList = recordDefinitionList as BalancesTableRecordDefinitionList;
        this._balancesList = balancesRecordDefinitionList.dataRecordList;
        const group = balancesRecordDefinitionList.brokerageAccountGroup;
        this.tableOpenEvent(group);
    }

    private processRecordFocusChange(newFocusedRecord: Balances) {
        if (!this._brokerageAccountGroupApplying) {
            this._currentFocusedAccountIdSetting = true;
            try {
                const accountKey = new Account.Key(newFocusedRecord.accountId, newFocusedRecord.environmentId);
                const singleGroup = BrokerageAccountGroup.createSingle(accountKey);
                this.applyDitemBrokerageAccountGroupFocus(singleGroup, true);
            } finally {
                this._currentFocusedAccountIdSetting = false;
            }
        }
    }

    private newTable(group: BrokerageAccountGroup, keepCurrentLayout: boolean) {
        const tableDefinition = tableDefinitionFactory.createBalances(group);
        this._tableFrame.newPrivateTable(tableDefinition, keepCurrentLayout);
    }

    private applyBrokerageAccountGroupWithNewTable(group: BrokerageAccountGroup | undefined, SelfInitiated: boolean) {
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

export namespace BalancesDitemFrame {
    export namespace JsonName {
        export const content = 'content';
    }

    export type RecordFocusEvent = (this: void, newRecordIndex: Integer | undefined) => void;
    export type TableOpenEvent = (this: void, group: BrokerageAccountGroup) => void;
}
