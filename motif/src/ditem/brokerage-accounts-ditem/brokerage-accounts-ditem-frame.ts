/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    BrokerageAccountGroup,
    BrokerageAccountTableRecordDefinition,
    BrokerageAccountTableRecordDefinitionList,
    CommandRegisterService, Integer,
    JsonElement, KeyedCorrectnessRecordList, SingleBrokerageAccountGroup,
    SymbolsService,
    TableRecordDefinitionList,
    TablesService
} from '@motifmarkets/motif-core';
import { GridFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class BrokerageAccountsDitemFrame extends BuiltinDitemFrame {
    private _tableFrame: GridFrame;
    private _accountsDataItem: KeyedCorrectnessRecordList<Account>;

    private _accountGroupApplying = false;
    private _currentFocusedAccountIdSetting = false;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _tablesService: TablesService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._tableFrame !== undefined; }

    initialise(tableFrame: GridFrame, frameElement: JsonElement | undefined) {
        this._tableFrame = tableFrame;
        this._tableFrame.recordFocusEvent = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        this._tableFrame.requireDefaultTableDefinitionEvent = () => this.handleRequireDefaultTableDefinitionEvent();
        this._tableFrame.tableOpenEvent = (recordDefinitionList) => this.handleTableOpenEvent(recordDefinitionList);

        if (frameElement === undefined) {
            this._tableFrame.loadLayoutConfig(undefined);
        } else {
            const contentElement = frameElement.tryGetElement(BrokerageAccountsDitemFrame.JsonName.content);
            this._tableFrame.loadLayoutConfig(contentElement);
        }

        this.applyLinked();
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean { // override
        if (this._tableFrame.layoutConfigLoading || this._currentFocusedAccountIdSetting || group === undefined) {
            return false;
        } else {
            if (!(group instanceof SingleBrokerageAccountGroup)) {
                return false;
            } else {
                let result: boolean;
                this._accountGroupApplying = true;
                try {
                    const key = group.accountKey;
                    const definition = new BrokerageAccountTableRecordDefinition(undefined, key);
                    const itemDefinitionIndex = this._tableFrame.findRecordDefinition(definition);

                    if (itemDefinitionIndex === undefined) {
                        result = false;
                    } else {
                        this._tableFrame.focusItem(itemDefinitionIndex);
                        result = super.applyBrokerageAccountGroup(group, selfInitiated);

                        // if (result && selfInitiated) {
                        //     this.notifyAccountIdAccepted(group);
                        // }
                    }
                } finally {
                    this._accountGroupApplying = false;
                }

                return result;
            }
        }
    }

    private handleRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const account = this._accountsDataItem.records[newRecordIndex];
            this.processAccountFocusChange(account);
        }
    }

    private handleRequireDefaultTableDefinitionEvent() {
        return this._tablesService.definitionFactory.createBrokerageAccount();
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        const accountRecordDefinitionList = recordDefinitionList as BrokerageAccountTableRecordDefinitionList;
        this._accountsDataItem = accountRecordDefinitionList.recordList;
    }

    private processAccountFocusChange(newFocusedAccount: Account) {
        if (!this._accountGroupApplying) {
            if (newFocusedAccount !== undefined) {
                this._currentFocusedAccountIdSetting = true;
                try {
                    const key = newFocusedAccount.createKey();
                    this.applyDitemBrokerageAccountGroupFocus(BrokerageAccountGroup.createSingle(key), true);
                } finally {
                    this._currentFocusedAccountIdSetting = false;
                }
            }
        }
    }
}

export namespace BrokerageAccountsDitemFrame {
    export namespace JsonName {
        export const content = 'content';
    }
}
