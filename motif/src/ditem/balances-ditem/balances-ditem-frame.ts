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
    BrokerageAccountGroupRecordList,
    CommandRegisterService,
    Integer,
    JsonElement,
    SettingsService,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { BalancesFrame, HeaderTextCellPainter, RecordGridMainTextCellPainter } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class BalancesDitemFrame extends BuiltinDitemFrame {
    private static readonly default = {
        activeAccountGroup: BrokerageAccountGroup.createAll(),
    };

    private _balancesFrame: BalancesFrame | undefined;
    private _recordSource: BalancesTableRecordSource;
    private _recordList: BrokerageAccountGroupRecordList<Balances>;
    private _currentFocusedAccountIdSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _gridSourceOpenedEventer: BalancesDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: BalancesDitemFrame.RecordFocusedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Balances,
            ditemComponentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._balancesFrame !== undefined; }
    get focusedRecordIndex() { return this._balancesFrame?.getFocusedRecordIndex(); }

    initialise(balancesFrame: BalancesFrame, frameElement: JsonElement | undefined): void {
        this._balancesFrame = balancesFrame;
        balancesFrame.initialise(
            frameElement,
            this.opener,
            (brokerageAccountGroup) => this.handleGridSourceOpenedEvent(brokerageAccountGroup),
            (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex)
        );

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const balancesFrame = this._balancesFrame;
        if (balancesFrame === undefined) {
            throw new AssertInternalError('BDFS29974');
        } else {
            const contentElement = element.newElement(BalancesDitemFrame.JsonName.content);
            const definition = balancesFrame.createGridSourceOrNamedReferenceDefinition();
            definition.saveToJson(contentElement);
        }
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        if (this._currentFocusedAccountIdSetting) {
            return false;
        } else {
            const balancesFrame = this._balancesFrame;
            if (balancesFrame === undefined) {
                throw new AssertInternalError('BDFABAG29974');
            } else {
                if (selfInitiated) {
                    return this.applyBrokerageAccountGroupWithOpen(balancesFrame, group, selfInitiated, true);
                } else {
                    if (group === undefined) {
                        return false;
                    } else {
                        const tableRecordSourceDefinition = balancesFrame.createTableRecordSourceDefinition();
                        if (!(tableRecordSourceDefinition instanceof BalancesTableRecordSourceDefinition)) {
                            throw new AssertInternalError('BDFABAGT1212009887');
                        } else {
                            if (group.isEqualTo(tableRecordSourceDefinition.brokerageAccountGroup)) {
                                return false;
                            } else {
                                return this.applyBrokerageAccountGroupWithOpen(balancesFrame, group, selfInitiated, true);
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
            const record = this._recordList.getAt(newRecordIndex);
            this.processRecordFocusChange(record);
        }
        this._recordFocusedEventer(newRecordIndex);
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

    private applyBrokerageAccountGroupWithOpen(balancesFrame: BalancesFrame, group: BrokerageAccountGroup | undefined, selfInitiated: boolean, keepView: boolean) {
        let result: boolean;
        this._brokerageAccountGroupApplying = true;
        try {
            result = super.applyBrokerageAccountGroup(group, selfInitiated);
            if (group !== undefined) {
                // TODO add support for clearTable
                balancesFrame.tryOpenDefault(group, keepView);
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

    export type GridSourceOpenedEventer = (this: void, group: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
