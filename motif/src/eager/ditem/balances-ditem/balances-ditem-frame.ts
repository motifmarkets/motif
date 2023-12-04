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
    BalancesTableRecordSourceDefinition,
    BrokerageAccountGroup,
    CommandRegisterService,
    GridLayoutOrReferenceDefinition,
    Integer,
    JsonElement,
    SettingsService,
    SymbolsService
} from '@motifmarkets/motif-core';
import { BalancesFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class BalancesDitemFrame extends BuiltinDitemFrame {
    private _balancesFrame: BalancesFrame | undefined;
    private _currentFocusedAccountIdSetting: boolean;
    private _brokerageAccountGroupApplying: boolean;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _gridSourceOpenedEventer: BalancesDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: BalancesDitemFrame.RecordFocusedEventer,
    ) {
        super(
            BuiltinDitemFrame.BuiltinTypeId.Balances,
            ditemComponentAccess,
            settingsService,
            commandRegisterService,
            desktopAccessService,
            symbolsService,
            adiService,
        );
    }

    get initialised() { return this._balancesFrame !== undefined; }
    get focusedRecordIndex() { return this._balancesFrame?.getFocusedRecordIndex(); }

    initialise(ditemFrameElement: JsonElement | undefined, balancesFrame: BalancesFrame): void {
        this._balancesFrame = balancesFrame;

        balancesFrame.gridSourceOpenedEventer = (brokerageAccountGroup) => this.handleGridSourceOpenedEvent(brokerageAccountGroup);
        balancesFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex)

        let balancesFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const balancesFrameElementResult = ditemFrameElement.tryGetElement(BalancesDitemFrame.JsonName.balancesFrame);
            if (balancesFrameElementResult.isOk()) {
                balancesFrameElement = balancesFrameElementResult.value;
            }
        }

        const initialisePromise = balancesFrame.initialiseGrid(
            this.opener,
            balancesFrameElement,
            false,
        );

        initialisePromise.then(
            (gridSourceOrReference) => {
                if (gridSourceOrReference === undefined) {
                    throw new AssertInternalError('BDFIPU50139');
                } else {
                    this.applyLinked();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'BDFIPR50139') }
        );
    }

    override finalise() {
        if (this._balancesFrame !== undefined) {
            this._balancesFrame.finalise();
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        const balancesFrame = this._balancesFrame;
        if (balancesFrame === undefined) {
            throw new AssertInternalError('BDFS29974');
        } else {
            const balancesFrameElement = ditemFrameElement.newElement(BalancesDitemFrame.JsonName.balancesFrame);
            balancesFrame.save(balancesFrameElement);
        }
    }

    createAllowedFieldsAndLayoutDefinition() {
        if (this._balancesFrame === undefined) {
            throw new AssertInternalError('BDFCAFALD04418');
        } else {
            return this._balancesFrame.createAllowedFieldsGridLayoutDefinition();
        }
    }

    openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition) {
        if (this._balancesFrame === undefined) {
            throw new AssertInternalError('BDFOGLONRD04418');
        } else {
            this._balancesFrame.openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition);
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._balancesFrame === undefined) {
            throw new AssertInternalError('BDFASACW10174');
        } else {
            this._balancesFrame.autoSizeAllColumnWidths(widenOnly);
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
            if (this._balancesFrame === undefined) {
                throw new AssertInternalError('BDFHGSOE29974');
            } else {
                const record = this._balancesFrame.recordList.getAt(newRecordIndex);
                this.processRecordFocusChange(record);
            }
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
                const promise = balancesFrame.tryOpenWithDefaultLayout(group, keepView);
                AssertInternalError.throwErrorIfPromiseRejected(promise, 'BDFABAGWO33008', `${balancesFrame.opener.lockerName}: ${group.id}`)
            }
        } finally {
            this._brokerageAccountGroupApplying = false;
        }
        return result;
    }
}

export namespace BalancesDitemFrame {
    export namespace JsonName {
        export const balancesFrame = 'balancesFrame';
    }

    export type GridSourceOpenedEventer = (this: void, group: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
