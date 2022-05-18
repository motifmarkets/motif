/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, Input } from '@angular/core';
import {
    Account, AssertInternalError, BrokerageAccountGroup, BrokerageAccountGroupUiAction, BrokerageAccountsDataDefinition,
    BrokerageAccountsDataItem,
    DataItemIncubator,
    MultiEvent, SettingsService, SingleBrokerageAccountGroup, StringId, Strings, UiAction, UnreachableCaseError
} from '@motifmarkets/motif-core';
import { CoreNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class BrokerageAccountGroupComponentBaseNgDirective extends ControlComponentBaseNgDirective {
    @Input() inputId: string;

    public namedGroups: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup[] = [];
    public loading = false;

    private _pushBrokerageAccountIdEventsSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItem: BrokerageAccountsDataItem;
    private _dataItemIncubator: DataItemIncubator<BrokerageAccountsDataItem>;

    constructor(cdr: ChangeDetectorRef, settingsService: SettingsService,
        pulseService: CoreNgService, stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray
    ) {
        super(cdr, settingsService, stateColorItemIdArray);
        this._dataItemIncubator = new DataItemIncubator<BrokerageAccountsDataItem>(pulseService.adi);
    }

    protected override get uiAction() { return super.uiAction as BrokerageAccountGroupUiAction; }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    protected processNamedGroupsChanged() {
        this.applyValue(this.uiAction.value);
    }

    protected input(text: string, valid: boolean, missing: boolean, errorText: string | undefined) {
        this.uiAction.input(text, valid, missing, errorText);
    }

    protected commitValue(value: BrokerageAccountGroup | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }

    protected override setUiAction(action: BrokerageAccountGroupUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: BrokerageAccountGroupUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value),
            options: (options) => this.handleOptionsPushEvent(options),
        };
        this._pushBrokerageAccountIdEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        const definition = new BrokerageAccountsDataDefinition();
        const dataItemOrPromise = this._dataItemIncubator.incubateSubcribe(definition);
        if (this._dataItemIncubator.isDataItem(dataItemOrPromise)) {
            this.processDataItemIncubated(dataItemOrPromise);
        } else {
            this.applyValue(action.value);

            dataItemOrPromise.then(
                (dataItem) => this.processDataItemIncubated(dataItem),
                (reason) => {
                    throw new AssertInternalError('BAIICBC323299', reason);
                }
            );
        }
    }

    protected override finalise() {
        this._dataItemIncubator.finalise();
        this.uiAction.unsubscribePushEvents(this._pushBrokerageAccountIdEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: BrokerageAccountGroup | undefined) {
        this.applyValue(value);
    }

    private handleOptionsPushEvent(options: BrokerageAccountGroupUiAction.Options) {
        this.applyOptions(options);
    }

    private createAccountNamedGroup(account: Account) {
        const name = account.name;
        const key = account.createKey();
        const group = BrokerageAccountGroup.createSingle(key);
        const namedGroup: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup = {
            id: group.id,
            upperId: group.upperId,
            name,
            upperName: name.toUpperCase(),
            brokerageAccountGroup: group,
        } as const;

        return namedGroup;
    }

    private createKeyNamedGroup(key: Account.Key) {
        if (this._dataItem === undefined) {
            return undefined;
        } else {
            const account = this._dataItem.getAccountByKey(key);
            if (account === undefined) {
                return undefined;
            } else {
                return this.createAccountNamedGroup(account);
            }
        }
    }

    private createAllNamedGroup() {
        const name = BrokerageAccountGroupComponentBaseNgDirective.allName;
        const group = BrokerageAccountGroup.createAll();
        const namedGroup: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup = {
            id: group.id,
            upperId: group.upperId,
            name,
            upperName: name.toUpperCase(),
            brokerageAccountGroup: group,
        } as const;

        return namedGroup;
    }

    private createErrorNamedGroup(errorText: string) {
        const errorId = `<<${Strings[StringId.Error]}>>`;
        const name = `${Strings[StringId.Error]}: ${errorText}`;
        const key = new Account.Key(errorId);
        const group = BrokerageAccountGroup.createSingle(key);
        const namedGroup: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup = {
            id: group.id,
            upperId: group.upperId,
            name,
            upperName: name.toUpperCase(),
            brokerageAccountGroup: group,
        } as const;

        return namedGroup;
    }

    private processDataItemIncubated(dataItem: BrokerageAccountsDataItem | undefined) {
        if (dataItem !== undefined) {
            this._dataItem = dataItem;
            if (this._dataItem.error) {
                this.namedGroups = [this.createErrorNamedGroup(this._dataItem.errorText)];
            } else {
                // We should really use a cache of groups which shadows DataItem
                // Fix in future
                let idx = 0;
                const accounts = dataItem.records;
                let length = accounts.length;
                if (this.uiAction.options.allAllowed) {
                    length++;
                }
                this.namedGroups = new Array<BrokerageAccountGroupComponentBaseNgDirective.NamedGroup>(length);

                if (this.uiAction.options.allAllowed) {
                    this.namedGroups[idx++] = this.createAllNamedGroup();
                }

                for (let i = 0; i < accounts.length; i++) {
                    const account = dataItem.records[i];
                    this.namedGroups[idx++] = this.createAccountNamedGroup(account);
                }
            }
            this.processNamedGroupsChanged();
        }
    }

    private applyValue(value: BrokerageAccountGroup | undefined) {
        if (value === undefined) {
            this.applyValueAsNamedGroup(undefined);
        } else {
            switch (value.typeId) {
                case BrokerageAccountGroup.TypeId.Single:
                    const singleGroup = value as SingleBrokerageAccountGroup;
                    const keyNamedGroup = this.createKeyNamedGroup(singleGroup.accountKey);
                    this.applyValueAsNamedGroup(keyNamedGroup);
                    break;
                case BrokerageAccountGroup.TypeId.All:
                    if (this.uiAction.options.allAllowed) {
                        const allNamedGroup = this.createAllNamedGroup();
                        this.applyValueAsNamedGroup(allNamedGroup);
                    } else {
                        this.applyValueAsNamedGroup(undefined);
                    }
                    break;
                default:
                    throw new UnreachableCaseError('BAGCBDAV77763439', value.typeId);
            }
        }
    }

    private applyOptions(options: BrokerageAccountGroupUiAction.Options) {
        this.processDataItemIncubated(this._dataItem);
    }

    protected abstract applyValueAsNamedGroup(value: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined): void;
}

export namespace BrokerageAccountGroupComponentBaseNgDirective {
    export interface NamedGroup {
        readonly id: string;
        readonly upperId: string;
        readonly name: string;
        readonly upperName: string;
        readonly brokerageAccountGroup: BrokerageAccountGroup;
    }

    export const allName = '<All Accounts>';
}
