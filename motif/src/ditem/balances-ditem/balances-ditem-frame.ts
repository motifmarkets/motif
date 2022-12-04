/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    AssertInternalError,
    Balances,
    BalancesTableRecordSource,
    BalancesTableRecordSourceDefinition,
    BrokerageAccountGroup,
    CommandRegisterService,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class BalancesDitemFrame extends BuiltinDitemFrame {
    private static readonly default = {
        activeAccountGroup: BrokerageAccountGroup.createAll(),
    };

    private _gridSourceFrame: GridSourceFrame;
    private _recordSource: BalancesTableRecordSource;
    private _currentFocusedAccountIdSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _openEventer: BalancesDitemFrame.OpenEventer,
        private readonly _recordFocusEventer: BalancesDitemFrame.RecordFocusEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Balances,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._gridSourceFrame !== undefined; }
    get focusedRecordIndex() { return this._gridSourceFrame.getFocusedRecordIndex(); }

    initialise(gridSourceFrame: GridSourceFrame, frameElement: JsonElement | undefined): void {
        this._gridSourceFrame = gridSourceFrame;
        this._gridSourceFrame.recordFocusEvent = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);

        let gridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        if (frameElement === undefined) {
            gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
        } else {
            const definitionResult = GridSourceOrNamedReferenceDefinition.tryCreateFromJson(
                this._tableRecordSourceDefinitionFactoryService, frameElement,
            );
            if (definitionResult.isOk()) {
                gridSourceOrNamedReferenceDefinition = definitionResult.value;
            } else {
                gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
                // Temporary error toast
            }
        }
        this.tryOpenGridSource(gridSourceOrNamedReferenceDefinition);

        this.applyLinked();
    }

    override finalise(): void {
        this._gridSourceFrame.close();
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(BalancesDitemFrame.JsonName.content);
        this._gridSourceFrame.saveLayoutConfig(contentElement);
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        if (this._currentFocusedAccountIdSetting) {
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
                    //     return this.applyBrokerageAccountGroupWithOpen(group, selfInitiated);
                    // } else {
                        const tableRecordSourceDefinition = this._gridSourceFrame.createTableRecordSourceDefinition();
                        if (!(tableRecordSourceDefinition instanceof BalancesTableRecordSourceDefinition)) {
                            throw new AssertInternalError('BDFABAGT1212009887');
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
            const recordDefinition = this._gridSourceFrame.createRecordDefinition(newRecordIndex);
            const record = this._recordSource.recordList.getAt(newRecordIndex);
            this.processRecordFocusChange(record);
        }
        this._recordFocusEventer(newRecordIndex);
    }

    private createGridSourceOrNamedReferenceDefinition(brokerageAccountGroup: BrokerageAccountGroup) {
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createBalances(brokerageAccountGroup);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    private createDefaultGridSourceOrNamedReferenceDefinition() {
        return this.createGridSourceOrNamedReferenceDefinition(BrokerageAccountGroup.createAll());
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

    private tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition) {
        const table = this._gridSourceFrame.open(definition);
        if (table !== undefined) {
            this._recordSource = table.recordSource as BalancesTableRecordSource;
            this._openEventer(this._recordSource.brokerageAccountGroup);
        }
    }

    private applyBrokerageAccountGroupWithOpen(group: BrokerageAccountGroup | undefined, selfInitiated: boolean) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, selfInitiated);
            if (group !== undefined) {
                // TODO add support for clearTable
                const definition = this.createGridSourceOrNamedReferenceDefinition(group);
                this.tryOpenGridSource(definition);
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

    export type RecordFocusEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type OpenEventer = (this: void, group: BrokerageAccountGroup) => void;
}
