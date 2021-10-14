/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    ComparableList,
    compareInteger,
    ComparisonResult,
    ExternalError,
    Integer,
    MapKey,
    UnreachableCaseError,
    UsableListChangeTypeId,
    ZenithDataError
} from 'src/sys/internal-api';
import { Balances } from './balances';
import { BrokerageAccountGroupBalancesList } from './brokerage-account-group-balances-list';
import { BalancesDataMessage, CurrencyId, DataMessage, DataMessageTypeId } from './common/internal-api';
import { DataRecordsBrokerageAccountSubscriptionDataItem } from './data-records-brokerage-account-subscription-data-item';

export class BrokerageAccountBalancesDataItem
    extends DataRecordsBrokerageAccountSubscriptionDataItem<Balances>
    implements BrokerageAccountGroupBalancesList {
    private _defaultCurrencyId: CurrencyId;

    override processMessage(msg: DataMessage) {
        // virtual;
        if (msg.typeId !== DataMessageTypeId.Balances) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                if (!(msg instanceof BalancesDataMessage)) {
                    throw new AssertInternalError(
                        'BABDIPM126674499',
                        msg.constructor.name
                    );
                } else {
                    this.advisePublisherResponseUpdateReceived();
                    this.notifyUpdateChange();
                    this.processBalancesMessage(msg);
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    protected override processAccountBecameAvailable() {
        const account = this.account;
        if (account === undefined) {
            throw new AssertInternalError('BABDIPABA2228853');
        } else {
            this._defaultCurrencyId = account.currencyId;
        }
    }

    private processDataMessageAddUpdateChange(
        change: BalancesDataMessage.AddUpdateChange,
        addUpdateDeleteItemMap: BalancesDataItem.AddUpdateDeleteItemMap,
        last: BalancesDataItem.LastAddUpdate | undefined
    ) {
        const accountId = change.accountId;
        if (accountId !== this.accountId) {
            throw new ZenithDataError(ExternalError.Code.BABDIPDMAUC133330444, JSON.stringify(change));
        } else {
            const mapKey = Balances.Key.generateMapKey(
                accountId,
                change.environmentId,
                change.currencyId
            );
            if (last !== undefined && last.mapKey === mapKey) {
                last.item.mergeAddUpdateChange(change);
            } else {
                const existingRecord = this.getRecordByMapKey(mapKey);
                const isAdd = existingRecord === undefined;
                const item = addUpdateDeleteItemMap.mergeAddUpdateChange(
                    change,
                    mapKey,
                    isAdd
                );
                last = {
                    mapKey,
                    item,
                };
            }

            return last;
        }
    }

    private processDataMessageInitialiseAccountChange(
        change: BalancesDataMessage.InitialiseAccountChange,
        addUpdateDeleteItemMap: BalancesDataItem.AddUpdateDeleteItemMap,
        last: BalancesDataItem.LastAddUpdate | undefined
    ) {
        const accountId = change.accountId;
        if (accountId !== this.accountId) {
            throw new ZenithDataError(ExternalError.Code.BABDIPDMIAC13330444, JSON.stringify(change));
        } else {
            for (let j = 0; j < this.count; j++) {
                const record = this.records[j];
                const environmentId = record.environmentId;
                const currencyId = record.currencyId;
                const mapKey = Balances.Key.generateMapKey(
                    accountId,
                    environmentId,
                    currencyId
                );
                const item = new BalancesDataItem.AddUpdateDeleteItem(
                    currencyId,
                    mapKey
                );

                if (record.currencyId !== this._defaultCurrencyId) {
                    item.action =
                        BalancesDataItem.AddUpdateDeleteItem.Action.Delete;
                } else {
                    item.action =
                        BalancesDataItem.AddUpdateDeleteItem.Action.UpdateWithInitialise;
                    last = {
                        mapKey,
                        item,
                    };
                }
                addUpdateDeleteItemMap.set(mapKey, item);
            }

            return last;
        }
    }

    private createAddUpdateDeleteItemMap(changes: BalancesDataMessage.Changes) {
        const changeCount = changes.length;

        const addUpdateDeleteItemMap = new BalancesDataItem.AddUpdateDeleteItemMap();
        let last: BalancesDataItem.LastAddUpdate | undefined;
        for (let i = 0; i < changeCount; i++) {
            const change = changes[i];

            switch (change.typeId) {
                case BalancesDataMessage.ChangeTypeId.AddUpdate:
                    const addUpdateChange = change as BalancesDataMessage.AddUpdateChange;
                    last = this.processDataMessageAddUpdateChange(
                        addUpdateChange,
                        addUpdateDeleteItemMap,
                        last
                    );
                    break;

                case BalancesDataMessage.ChangeTypeId.InitialiseAccount:
                    const initialiseChange = change as BalancesDataMessage.InitialiseAccountChange;
                    last = this.processDataMessageInitialiseAccountChange(
                        initialiseChange,
                        addUpdateDeleteItemMap,
                        last
                    );
                    break;

                default:
                    throw new UnreachableCaseError(
                        'BDICAUDIM69494949559',
                        change.typeId
                    );
            }
        }

        return addUpdateDeleteItemMap;
    }

    private createSortedAddUpdateDeleteItemList(
        map: BalancesDataItem.AddUpdateDeleteItemMap
    ) {
        const list = new BalancesDataItem.AddUpdateDeleteList();
        list.capacity = map.size;
        const iterator = map.values();
        let iteratorResult = iterator.next();
        while (!iteratorResult.done) {
            list.add(iteratorResult.value);
            iteratorResult = iterator.next();
        }

        list.sort();

        return list;
    }

    private processDeleteItems(list: BalancesDataItem.AddUpdateDeleteList) {
        // not efficient - should almost never be called
        const nextSectionIdx = list.firstDeleteIndex + list.deleteCount;
        const items = list.items;
        for (let i = list.firstDeleteIndex; i < nextSectionIdx; i++) {
            const item = items[i];
            const mapKey = item.mapKey;
            const idx = this.indexOfRecordByMapKey(mapKey);
            if (idx < 0) {
                throw new AssertInternalError('BDIPDII10593328854');
            } else {
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Remove,
                    idx,
                    1
                );
                this.removeRecord(idx);
            }
        }
    }

    private processAddItems(itemList: BalancesDataItem.AddUpdateDeleteList) {
        const account = this.account;
        if (account === undefined) {
            throw new AssertInternalError('BABDIPAI77722232');
        } else {
            const itemCount = itemList.addCount;
            const nextItemListSectionIdx = itemList.firstAddIndex + itemCount;
            const items = itemList.items;

            const addStartIdx = this.extendRecordCount(itemCount);
            let addIdx = addStartIdx;
            for (
                let i = itemList.firstAddIndex;
                i < nextItemListSectionIdx;
                i++
            ) {
                const item = items[i];

                const record = new Balances(
                    account,
                    item.currencyId,
                    this.correctnessId
                );
                if (item.balanceCount > 0) {
                    record.update(item.balances, item.balanceCount);
                }
                this.setRecord(addIdx++, record);
            }

            this.checkUsableNotifyListChange(
                UsableListChangeTypeId.Insert,
                addStartIdx,
                itemCount
            );
        }
    }

    private processUpdateItems(itemList: BalancesDataItem.AddUpdateDeleteList) {
        const nextItemListSectionIdx =
            itemList.firstUpdateIndex + itemList.updateCount;
        const items = itemList.items;
        for (
            let i = itemList.firstUpdateIndex;
            i < nextItemListSectionIdx;
            i++
        ) {
            const item = items[i];
            const mapKey = item.mapKey;
            const record = this.getRecordByMapKey(mapKey);
            if (record === undefined) {
                throw new AssertInternalError('BABDIPUIG12120909888');
            } else {
                if (
                    item.action === BalancesDataItem.AddUpdateDeleteItem.Action.UpdateWithInitialise) {
                    record.initialise();
                }

                record.update(item.balances, item.balanceCount);
            }
        }
    }

    private processBalancesMessage(msg: BalancesDataMessage) {
        const changes = msg.changes;

        // to ensure we minimise number reallocations, process changes to consolidate all adds into one block
        const addUpdateDeleteItemMap = this.createAddUpdateDeleteItemMap(
            changes
        );

        if (addUpdateDeleteItemMap.size > 0) {
            const list = this.createSortedAddUpdateDeleteItemList(
                addUpdateDeleteItemMap
            );

            if (list.deleteCount > 0) {
                this.processDeleteItems(list);
            }
            if (list.addCount > 0) {
                this.processAddItems(list);
            }
            if (list.updateCount > 0) {
                this.processUpdateItems(list);
            }
        }
    }
}

export namespace BalancesDataItem {
    export type Record = Balances;
    export type ListChangeEventHandler = (
        this: void,
        listChangeType: UsableListChangeTypeId,
        idx: Integer,
        count: Integer
    ) => void;

    export class AddUpdateDeleteItem {
        action: AddUpdateDeleteItem.Action;

        private _balances: Balances.BalanceValue[];
        private _balanceCount = 0;

        get balances() {
            return this._balances;
        }
        get balanceCount() {
            return this._balanceCount;
        }

        get currencyId() {
            return this._currencyId;
        }
        get mapKey() {
            return this._mapKey;
        }

        constructor(private _currencyId: CurrencyId, private _mapKey: MapKey) {
            this._balances = new Array<Balances.BalanceValue>(
                AddUpdateDeleteItem.defaultBalanceCapacityEstimate
            );
        }

        mergeAddUpdateChange(change: BalancesDataMessage.AddUpdateChange) {
            const balanceType = change.balanceType;
            const amount = change.amount;
            let idx = this.indexOfBalanceType(balanceType);
            if (idx >= 0) {
                this._balances[idx].amount = amount;
            } else {
                if (this.balanceCount >= this.balances.length) {
                    this.balances.length = (this.balanceCount + 1) * 2;
                }
                idx = this._balanceCount++;
                this.balances[idx] = {
                    type: balanceType,
                    amount,
                };
            }
        }

        private indexOfBalanceType(type: string) {
            for (let i = 0; i < this.balanceCount; i++) {
                const balance = this.balances[i];
                if (balance.type === type) {
                    return i;
                }
            }
            return -1;
        }
    }

    export namespace AddUpdateDeleteItem {
        export const enum Action {
            // do not change order.  Used for sorting
            Delete = 0,
            Add = 1,
            UpdateWithInitialise = 2,
            UpdateWithoutInitialise = 3,
        }
        export const defaultBalanceCapacityEstimate = 5;
    }

    export class AddUpdateDeleteItemMap extends Map<
        MapKey,
        BalancesDataItem.AddUpdateDeleteItem
    > {
        mergeAddUpdateChange(
            change: BalancesDataMessage.AddUpdateChange,
            mapKey: MapKey,
            isAdd: boolean
        ) {
            let item = this.get(mapKey);
            if (item === undefined) {
                item = new AddUpdateDeleteItem(change.currencyId, mapKey);
                if (isAdd) {
                    item.action =
                        BalancesDataItem.AddUpdateDeleteItem.Action.Add;
                } else {
                    item.action =
                        BalancesDataItem.AddUpdateDeleteItem.Action.UpdateWithoutInitialise;
                }
                this.set(mapKey, item);
            }
            item.mergeAddUpdateChange(change);

            return item;
        }
    }

    export class AddUpdateDeleteList extends ComparableList<
        AddUpdateDeleteItem
    > {
        private _firstDeleteIndex: Integer;
        private _deleteCount: Integer;
        private _firstAddIndex: Integer;
        private _addCount: Integer;
        private _firstUpdateIndex: Integer;
        private _updateCount: Integer;

        get firstDeleteIndex() {
            return this._firstDeleteIndex;
        }
        get deleteCount() {
            return this._deleteCount;
        }
        get firstAddIndex() {
            return this._firstAddIndex;
        }
        get addCount() {
            return this._addCount;
        }
        get firstUpdateIndex() {
            return this._firstUpdateIndex;
        }
        get updateCount() {
            return this._updateCount;
        }

        constructor() {
            super(AddUpdateDeleteList.compareItems);
        }

        override sort() {
            if (this.count === 0) {
                this._firstDeleteIndex = -1;
                this._deleteCount = 0;
                this._firstAddIndex = -1;
                this._addCount = 0;
                this._firstUpdateIndex = -1;
                this._updateCount = 0;
            } else {
                super.sort();

                let idx = 0;
                if (
                    this.items[idx].action !==
                    BalancesDataItem.AddUpdateDeleteItem.Action.Delete
                ) {
                    this._firstDeleteIndex = -1;
                    this._deleteCount = 0;
                } else {
                    this._firstDeleteIndex = idx;
                    while (++idx < this.count) {
                        if (
                            this.items[idx].action !==
                            BalancesDataItem.AddUpdateDeleteItem.Action.Delete
                        ) {
                            break;
                        }
                    }
                    this._deleteCount = idx - this._firstDeleteIndex;
                }

                if (idx >= this.count) {
                    this._firstAddIndex = -1;
                    this._addCount = 0;
                    this._firstUpdateIndex = -1;
                    this._updateCount = 0;
                } else {
                    if (
                        this.items[idx].action !==
                        BalancesDataItem.AddUpdateDeleteItem.Action.Add
                    ) {
                        this._firstAddIndex = -1;
                        this._addCount = 0;
                    } else {
                        this._firstAddIndex = idx;
                        while (++idx < this.count) {
                            if (
                                this.items[idx].action !==
                                BalancesDataItem.AddUpdateDeleteItem.Action.Add
                            ) {
                                break;
                            }
                        }
                        this._addCount = idx - this._firstAddIndex;
                    }

                    // the rest have to be Updates (either with or without initialise)
                    if (idx >= this.count) {
                        this._firstUpdateIndex = 0;
                        this._updateCount = -1;
                    } else {
                        this._firstUpdateIndex = idx++;
                        this._updateCount = this.count - this._firstUpdateIndex;
                    }
                }
            }
        }
    }

    export namespace AddUpdateDeleteList {
        export function compareItems(left: AddUpdateDeleteItem, right: AddUpdateDeleteItem): ComparisonResult {
            return compareInteger(left.action, right.action);
        }
    }

    export interface LastAddUpdate {
        readonly mapKey: MapKey;
        readonly item: AddUpdateDeleteItem;
    }
}
