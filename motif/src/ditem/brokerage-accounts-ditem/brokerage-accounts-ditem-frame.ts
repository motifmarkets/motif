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
    BrokerageAccountId,
    CommandRegisterService,
    Integer,
    JsonElement,
    SettingsService,
    SymbolsService
} from '@motifmarkets/motif-core';
import { BrokerageAccountsFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class BrokerageAccountsDitemFrame extends BuiltinDitemFrame {
    private _brokerageAccountsFrame: BrokerageAccountsFrame | undefined;

    private _accountGroupApplying = false;
    private _currentFocusedAccountIdSetting = false;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts,
            ditemComponentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._brokerageAccountsFrame !== undefined; }

    initialise(ditemFrameElement: JsonElement | undefined, brokerageAccountsFrame: BrokerageAccountsFrame) {
        this._brokerageAccountsFrame = brokerageAccountsFrame;

        brokerageAccountsFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex)

        let brokerageAccountsFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const brokerageAccountsFrameElementResult = ditemFrameElement.tryGetElement(BrokerageAccountsDitemFrame.JsonName.brokerageAccountsFrame);
            if (brokerageAccountsFrameElementResult.isOk()) {
                brokerageAccountsFrameElement = brokerageAccountsFrameElementResult.value;
            }
        }

        brokerageAccountsFrame.initialiseGrid(
            this.opener,
            brokerageAccountsFrameElement,
            false,
        );

        this.applyLinked();
    }

    override finalise() {
        if (this._brokerageAccountsFrame !== undefined) {
            this._brokerageAccountsFrame.finalise();
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        const brokerageAccountsFrame = this._brokerageAccountsFrame;
        if (brokerageAccountsFrame === undefined) {
            throw new AssertInternalError('BADFS50789');
        } else {
            const brokerageAccountsFrameElement = ditemFrameElement.newElement(BrokerageAccountsDitemFrame.JsonName.brokerageAccountsFrame);
            brokerageAccountsFrame.save(brokerageAccountsFrameElement);
        }
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean { // override
        if (this._currentFocusedAccountIdSetting || group === undefined) {
            return false;
        } else {
            if (!BrokerageAccountGroup.isSingle(group)) {
                return false;
            } else {
                const brokerageAccountsFrame = this._brokerageAccountsFrame;
                if (brokerageAccountsFrame === undefined) {
                    throw new AssertInternalError('BDFABAG50789');
                } else {
                    this._accountGroupApplying = true;
                    try {
                        const recordList = brokerageAccountsFrame.recordList;
                        let index = -1;
                        const accountId = group.id;
                        const count = recordList.count;
                        for (let i = 0; i < count; i++) {
                            const record = recordList.getAt(i);
                            if (BrokerageAccountId.isDefinedEqual(record.id, accountId)) {
                                index = i;
                                break;
                            }
                        }
                        if (index === -1) {
                            return false;
                        } else {
                            brokerageAccountsFrame.focusItem(index);
                            return super.applyBrokerageAccountGroup(group, selfInitiated);
                        }
                    } finally {
                        this._accountGroupApplying = false;
                    }
                }
            }
        }
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const brokerageAccountsFrame = this._brokerageAccountsFrame;
            if (brokerageAccountsFrame === undefined) {
                throw new AssertInternalError('BDFHRFE10789');
            } else {
                const account = brokerageAccountsFrame.recordList.records[newRecordIndex];
                this.processAccountFocusChange(account);
            }
        }
    }

    private processAccountFocusChange(newFocusedAccount: Account) {
        if (!this._accountGroupApplying) {
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

export namespace BrokerageAccountsDitemFrame {
    export namespace JsonName {
        export const brokerageAccountsFrame = 'brokerageAccountsFrame';
    }
}
