/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    BrokerageAccountGroup,
    BrokerageAccountId,
    BrokerageAccountTableRecordSource,
    CommandRegisterService,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    KeyedCorrectnessList,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class BrokerageAccountsDitemFrame extends BuiltinDitemFrame {
    private _gridSourceFrame: GridSourceFrame;
    private _recordSource: BrokerageAccountTableRecordSource;
    private _recordList: KeyedCorrectnessList<Account>;

    private _accountGroupApplying = false;
    private _currentFocusedAccountIdSetting = false;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _gridSourceOpenedEventer: BrokerageAccountsDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: BrokerageAccountsDitemFrame.RecordFocusedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._gridSourceFrame !== undefined; }

    initialise(gridSourceFrame: GridSourceFrame, frameElement: JsonElement | undefined) {
        this._gridSourceFrame = gridSourceFrame;
        this._gridSourceFrame.opener = this.opener;
        this._gridSourceFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);

        let gridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        if (frameElement === undefined) {
            gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
        } else {
            const contentElementResult = frameElement.tryGetElement(BrokerageAccountsDitemFrame.JsonName.content);
            if (contentElementResult.isErr()) {
                gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
            } else {
                const definitionResult = GridSourceOrNamedReferenceDefinition.tryCreateFromJson(
                    this._tableRecordSourceDefinitionFactoryService,
                    contentElementResult.value,
                );
                if (definitionResult.isOk()) {
                    gridSourceOrNamedReferenceDefinition = definitionResult.value;
                } else {
                    gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
                    // Temporary error toast
                }
            }
        }
        this.tryOpenGridSource(gridSourceOrNamedReferenceDefinition);

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(BrokerageAccountsDitemFrame.JsonName.content);
        const definition = this._gridSourceFrame.createGridSourceOrNamedReferenceDefinition();
        definition.saveToJson(contentElement);
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean { // override
        if (this._currentFocusedAccountIdSetting || group === undefined) {
            return false;
        } else {
            if (!BrokerageAccountGroup.isSingle(group)) {
                return false;
            } else {
                this._accountGroupApplying = true;
                try {
                    let index = -1;
                    const accountId = group.id;
                    const count = this._recordList.count;
                    for (let i = 0; i < count; i++) {
                        const record = this._recordList.getAt(i);
                        if (BrokerageAccountId.isDefinedEqual(record.id, accountId)) {
                            index = i;
                            break;
                        }
                    }
                    if (index === -1) {
                        return false;
                    } else {
                        this._gridSourceFrame.focusItem(index);
                        return super.applyBrokerageAccountGroup(group, selfInitiated);
                    }
                } finally {
                    this._accountGroupApplying = false;
                }
            }
        }
    }

    private handleRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const account = this._recordList.records[newRecordIndex];
            this.processAccountFocusChange(account);
        }
        this._recordFocusedEventer(newRecordIndex);
    }

    private createGridSourceOrNamedReferenceDefinition() {
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createBrokerageAccount();
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    private createDefaultGridSourceOrNamedReferenceDefinition() {
        return this.createGridSourceOrNamedReferenceDefinition();
    }

    private tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition) {
        const gridSourceOrNamedReference = this._gridSourceFrame.tryOpenGridSource(definition, false);
        if (gridSourceOrNamedReference !== undefined) {
            const table = this._gridSourceFrame.openedTable;
            this._recordSource = table.recordSource as BrokerageAccountTableRecordSource;
            this._recordList = this._recordSource.recordList;
            this._gridSourceOpenedEventer();
        }
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

    export type GridSourceOpenedEventer = (this: void) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
