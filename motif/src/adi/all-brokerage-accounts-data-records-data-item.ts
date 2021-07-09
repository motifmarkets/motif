/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    Badness,
    compareInteger,
    ComparisonResult,
    CorrectnessId,
    Integer,
    MapKey,
    MappedComparableList,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { AllBrokerageAccountsListChangeDataItem } from './all-brokerage-accounts-list-change-data-item';
import { BrokerageAccountDataRecord } from './brokerage-account-data-record';
import { AllBrokerageAccountGroup } from './brokerage-account-group';
import { BrokerageAccountGroupDataRecordList } from './brokerage-account-group-data-record-list';
import { BrokerageAccountDataRecordsSubscriptionDataDefinition, BrokerageAccountId } from './common/internal-api';
import { DataRecordList } from './data-record-list';
import { DataRecordsBrokerageAccountSubscriptionDataItem } from './data-records-brokerage-account-subscription-data-item';

export abstract class AllBrokerageAccountsDataRecordsDataItem<Record extends BrokerageAccountDataRecord>
    extends AllBrokerageAccountsListChangeDataItem implements BrokerageAccountGroupDataRecordList<Record> {

    readonly brokerageAccountGroup = new AllBrokerageAccountGroup();

    private _recordList = new MappedComparableList<Record>();

    private _accountWrappers: AllBrokerageAccountsDataRecordsDataItem.AccountWrapper<Record>[] = [];
    private _accountWrappersIncubatedCount = 0;

    private _listChangeEvent = new MultiEvent<DataRecordList.ListChangeEventHandler>();
    private _beforeRecordChangeMultiEvent = new MultiEvent<DataRecordList.BeforeRecordChangeEventHandler>();
    private _afterRecordChangedMultiEvent = new MultiEvent<DataRecordList.AfterRecordChangedEventHandler>();

    get records() { return this._recordList.items; }
    get count() { return this._recordList.count; }

    getRecordByMapKey(key: MapKey) {
        return this._recordList.getItemByKey(key);
    }

    subscribeListChangeEvent(handler: DataRecordList.ListChangeEventHandler) {
        return this._listChangeEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeEvent.unsubscribe(subscriptionId);
    }

    subscribeBeforeRecordChangeEvent(handler: DataRecordList.BeforeRecordChangeEventHandler) {
        return this._beforeRecordChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeRecordChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAfterRecordChangedEvent(handler: DataRecordList.AfterRecordChangedEventHandler) {
        return this._afterRecordChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAfterRecordChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._afterRecordChangedMultiEvent.unsubscribe(subscriptionId);
    }

    protected processAccountsPreUsableClear() {
        this._recordList.clear();
        this.clearAccountWrappers();
    }

    protected processAccountsPreUsableAdd() {
        this.addAccountWrappers(0, this.accounts.length);
        if (this._accountWrappersIncubatedCount !== this._accountWrappers.length) {
            const badness = this.createAccountsIncubatingBadness();
            this.setUnusable(badness);
        }
}

    protected processAccountsInserted(accountsIndex: Integer, accountsInsertCount: Integer) {
        const wrapperAddStartIdx = this._accountWrappers.length;
        const oneOrMoreAddedWrappersIncubated = this.addAccountWrappers(accountsIndex, accountsInsertCount);
        const wrapperCount = this._accountWrappers.length;
        const wrapperAddCount = wrapperCount - wrapperAddStartIdx;

        if (wrapperAddCount > 0) {
            if (this.usable) {
                if (oneOrMoreAddedWrappersIncubated) {
                    this.checkLoadAccountWrappers(wrapperAddStartIdx, wrapperAddCount);
                }
            } else {
                if (this._accountWrappersIncubatedCount === wrapperCount) {
                    this.checkLoadAccountWrappers(0, wrapperCount);
                    this.trySetUsable();
                }
            }
        }
    }

    protected processAccountsClear() {
        const recordCount = this.count;
        if (recordCount > 0) {
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, 0, recordCount);
            this._recordList.clear();
        }
        this.clearAccountWrappers();
    }

    protected processAccountsUsable() {
        if (this._accountWrappersIncubatedCount === this._accountWrappers.length) {
            this.checkLoadAccountWrappers(0, this._accountWrappers.length);
            this.trySetUsable();
        }
    }

    protected override calculateUsabilityBadness() {
        const badness = super.calculateUsabilityBadness();
        if (Badness.isUnusable(badness)) {
            return badness;
        } else {
            if (this._accountWrappersIncubatedCount !== this._accountWrappers.length) {
                return this.createAccountsIncubatingBadness();
            } else {
                return Badness.notBad;
            }
        }
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            if (this.count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, this.count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private handleAccountWrapperIncubatedChangedEvent(wrapper: AllBrokerageAccountsDataRecordsDataItem.AccountWrapper<Record>) {
        if (wrapper.incubated) {
            this._accountWrappersIncubatedCount++;
            if (this.usable) {
                if (wrapper.usable) {
                    this.loadAccountRecords(wrapper.accountMapKey, wrapper.records);
                    wrapper.loaded = true;
                } else {
                    // must be error
                    if (!wrapper.error) {
                        throw new AssertInternalError('ABADRDIHAWICE222998');
                    } else {
                        const badness = this.createOneOrMoreAccountsInErrorBadness(wrapper.accountId);
                        // needs some rework to make display suspect if one or more errors
                    }
                }
            } else {
                if (this._accountWrappersIncubatedCount === this._accountWrappers.length) {
                    this.checkLoadAccountWrappers(0, this._accountWrappers.length);
                    this.trySetUsable();
                } else {
                    const badness = this.createAccountsIncubatingBadness();
                    this.setUnusable(badness);
                }
            }
        } else {
            this._accountWrappersIncubatedCount--;
        }
    }

    private handleAccountWrapperRecordsInsertedEvent(records: Record[], index: Integer, count: Integer) {
        this.addRecordsRange(records, index, count);
    }

    private handleAccountWrapperRecordsRemoveEvent(accountMapKey: MapKey, records: Record[], index: Integer, count: Integer) {
        this.removeRecordsRange(accountMapKey, records, index, count);
    }

    private handleAccountWrapperRecordsClearEvent(accountMapKey: MapKey, records: Record[]) {
        this.removeRecords(accountMapKey, records);
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }


    private notifyBeforeRecordChange(index: Integer) {
        const handlers = this._beforeRecordChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index);
        }
    }

    private notifyAfterRecordChanged(index: Integer) {
        const handlers = this._afterRecordChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index);
        }
    }

    private addAccountWrappers(accountsIndex: Integer, addCount: Integer) {
        const accounts = this.accounts;
        const accountsNextRangeStartIdx = accountsIndex + addCount;
        const wrapperStartAddIdx = this._accountWrappers.length;
        this._accountWrappers.length += addCount;
        let wrapperAddIdx = wrapperStartAddIdx;
        let oneOrMoreAddedWrappersIncubated = false;
        for (let i = accountsIndex; i < accountsNextRangeStartIdx; i++) {
            const account = accounts[i];
            const dataRecordsDefinition = this.createDataRecordsDataDefinition();
            dataRecordsDefinition.accountId = account.id;
            dataRecordsDefinition.environmentId = account.environmentId;
            const dataRecordsDataItem = this.subscribeDataItem(dataRecordsDefinition) as
                DataRecordsBrokerageAccountSubscriptionDataItem<Record>;
            const wrapper = new AllBrokerageAccountsDataRecordsDataItem.AccountWrapper<Record>(dataRecordsDataItem);

            if (!wrapper.error) {
                wrapper.incubatedChangedEvent = (senderWrapper) => this.handleAccountWrapperIncubatedChangedEvent(senderWrapper);
                wrapper.recordsInsertedEvent = (records, startIndex, insertCount) =>
                    this.handleAccountWrapperRecordsInsertedEvent(records, startIndex, insertCount);
                wrapper.recordsRemoveEvent = (accountMapKey, records, startIndex, insertCount) =>
                    this.handleAccountWrapperRecordsRemoveEvent(accountMapKey, records, startIndex, insertCount);
                wrapper.recordsClearEvent = (accountMapKey, records) =>
                    this.handleAccountWrapperRecordsClearEvent(accountMapKey, records);

                this._accountWrappers[wrapperAddIdx++] = wrapper;

                if (wrapper.incubated) {
                    this._accountWrappersIncubatedCount++;
                    oneOrMoreAddedWrappersIncubated = true;
                }
            }
        }
        this._accountWrappers.length = wrapperAddIdx;

        return oneOrMoreAddedWrappersIncubated;
    }

    private clearAccountWrappers() {
        for (const wrapper of this._accountWrappers) {
            const dataItem = wrapper.dispose();
            this.unsubscribeDataItem(dataItem);
        }
        this._accountWrappersIncubatedCount = 0;
        this._accountWrappers.length = 0;
    }

    private checkLoadAccountWrappers(wrapperAddStartIdx: Integer, wrapperAddCount: Integer) {
        if (wrapperAddCount === 1) {
            const wrapper = this._accountWrappers[0];
            if (!wrapper.loaded && wrapper.usable) {
                wrapper.loaded = true;
                this.addRecords(wrapper.records);
            }
        } else {
            let recordAddCount = 0;
            const wrapperAddEndIdxPlus1 = wrapperAddStartIdx + wrapperAddCount;
            for (let i = wrapperAddStartIdx; i < wrapperAddEndIdxPlus1; i++) {
                const wrapper = this._accountWrappers[i];
                if (!wrapper.loaded && wrapper.usable) {
                    recordAddCount += wrapper.recordCount;
                }
            }
            const addRecords = new Array<Record>(recordAddCount);
            let addIdx = 0;
            for (let i = wrapperAddStartIdx; i < wrapperAddEndIdxPlus1; i++) {
                const wrapper = this._accountWrappers[i];
                if (!wrapper.loaded && wrapper.usable) {
                    wrapper.loaded = true;
                    for (const record of wrapper.records) {
                        addRecords[addIdx++] = record;
                    }
                }
            }
            this.addRecords(addRecords);
        }
    }

    private addRecords(records: Record[]) {
        const index = this._recordList.count;
        this._recordList.addRange(records);
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, index, records.length);
    }

    private addRecordsRange(records: Record[], rangeIndex: Integer, rangeCount: Integer) {
        const addIndex = this._recordList.count;
        this._recordList.addItemsRange(records, rangeIndex, rangeCount);
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addIndex, rangeCount);
    }

    private removeRecordsRange(accountMapKey: MapKey, records: Record[], rangeStartIdx: Integer, rangeCount: Integer) {
        const removeRecords = records.slice(rangeStartIdx, rangeStartIdx + rangeCount);
        this.removeRecords(accountMapKey, removeRecords);
    }

    private removeRecords(accountMapKey: MapKey, removeRecords: Record[]) {
        const removeCount = removeRecords.length;
        if (removeCount === this.count) {
            this.clearRecords();
        } else {
            const recordCount = this.count;
            const indices = new Array<Integer>(removeCount);
            let indexCount = 0;
            for (let i = recordCount - 1; i >= 0; i--) {
                const record = this.records[i];
                if (removeRecords.includes(record)) {
                    indices[indexCount++] = i;
                }
            }
            if (indexCount !== removeCount) {
                throw new AssertInternalError('ABADRDIRRC99923332', `${accountMapKey}, ${indexCount}, ${removeCount}`);
            } else {
                this.removeRecordsByIndices(indices);
            }
        }
    }

    private removeRecordsByIndices(indices: Integer[]) {
        // Indices need to be in reverse order
        const indexCount = indices.length;
        if (indexCount > 0) {
            let blockStartIdx = 0;
            let prevIndex = indices[0];
            for (let i = 1; i < indexCount; i++) {
                const index = indices[i];
                if (index === prevIndex - 1) {
                    prevIndex = index;
                } else {
                    this.removeRecordRange(prevIndex, i - blockStartIdx);
                    blockStartIdx = i;
                }
            }
            this.removeRecordRange(prevIndex, indexCount - blockStartIdx);
        }
    }

    private removeRecordRange(rangeStartIdx: Integer, rangeCount: Integer) {
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, rangeStartIdx, rangeCount);
        this._recordList.removeRange(rangeStartIdx, rangeCount);
    }

    private clearRecords() {
        const recordCount = this.count;
        if (this.count > recordCount) {
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, 0, recordCount);
            // Note that the records are owned by the Lists.  They will dispose
            this._recordList.clear();
        }
    }

    private loadAccountRecords(accountMapKey: MapKey, newRecords: Record[]) {
        // Need to work out which of the new records to add, delete or replace
        // Then apply accordingly
        // Initially match existing records with records with same account mapKey
        const undefinableNewRecords: (Record | undefined)[] = newRecords.slice();
        const existingRecordCount = this.count;
        const matchers = new Array<AllBrokerageAccountsDataRecordsDataItem.OldNewMatcher>(existingRecordCount);
        let oldCount = 0;
        let deleteCount = 0;
        for (let i = 0; i < existingRecordCount; i++) {
            const existingRecord = this.records[i];
            if (existingRecord.accountMapKey === accountMapKey) {
                const existingRecordMapKey = existingRecord.mapKey;
                // compare mapKeys to see if represent same data
                const newIdx = newRecords.findIndex((newRec) => newRec.mapKey === existingRecordMapKey);
                let typeId: AllBrokerageAccountsDataRecordsDataItem.OldNewMatcher.TypeId;
                if (newIdx < 0) {
                    typeId = AllBrokerageAccountsDataRecordsDataItem.OldNewMatcher.TypeId.Delete;
                } else {
                    typeId = AllBrokerageAccountsDataRecordsDataItem.OldNewMatcher.TypeId.Replace;
                }
                // record indices if matched
                matchers[oldCount++] = {
                    typeId,
                    mapKey: existingRecordMapKey,
                    oldIdx: i,
                    newIdx,
                };
                if (newIdx === -1) {
                    // no corresponding new record so this old record needs to be deleted
                    deleteCount++;
                } else {
                    // new record matched
                    undefinableNewRecords[newIdx] = undefined;
                }
            }
        }
        const replaceCount = oldCount - deleteCount;
        const addCount = newRecords.length - replaceCount;

        // consolidate unmatched new records (which will be added) into matchers
        if (addCount === 0) {
            matchers.length = oldCount;
        } else {
            let addIdx = replaceCount;
            matchers.length = replaceCount + addCount;
            const newRecordCount = undefinableNewRecords.length;
            for (let i = 0; i < newRecordCount; i++) {
                const undefinableNewRecord = undefinableNewRecords[i];
                if (undefinableNewRecord !== undefined) {
                    matchers[addIdx++] = {
                        typeId: AllBrokerageAccountsDataRecordsDataItem.OldNewMatcher.TypeId.Add,
                        mapKey: undefinableNewRecord.mapKey,
                        oldIdx: -1,
                        newIdx: i,
                    };
                }
            }
        }

        // maket sure matchers are in order of: delete, replace, add
        matchers.sort((left, right) => AllBrokerageAccountsDataRecordsDataItem.OldNewMatcher.compare(left, right));

        const deleteMatchers = matchers.slice(0, deleteCount);
        const replaceMatchers = matchers.slice(deleteCount, deleteCount + replaceCount);
        const addMatchers = matchers.slice(deleteCount + replaceCount);

        // process deletions
        if (deleteCount > 0) {
            const deleteIndices = new Array<Integer>(deleteCount);
            let deleteIndicesIdx = 0;
            for (let i = 0; i < deleteCount; i++) {
                const deleteIdx = deleteMatchers[i].oldIdx;
                deleteIndices[deleteIndicesIdx++] = deleteMatchers[i].oldIdx;
                // Need to adjust OldIdx values in Matchers to compensate for deletion
                AllBrokerageAccountsDataRecordsDataItem.OldNewMatcher.adjustReplaceOldIdxForDeletion(replaceMatchers, deleteIdx);
            }
            this.removeRecordsByIndices(deleteIndices);
        }

        // process replacements
        for (let i = 0; i < replaceCount; i++) {
            const matcher = replaceMatchers[i];
            const oldIdx = matcher.oldIdx;
            const newIdx = matcher.newIdx;
            this.notifyBeforeRecordChange(oldIdx);
            this._recordList.replace(oldIdx, newRecords[newIdx]);
            this.notifyAfterRecordChanged(oldIdx);
        }

        // process additions
        if (addCount > 0) {
            const addRecords = new Array<Record>(addCount);
            for (let i = 0; i < addCount; i++) {
                const matcher = addMatchers[i];
                const newIdx = matcher.newIdx;
                addRecords[i] = newRecords[newIdx];
            }
            this.addRecords(addRecords);
        }
    }

    private createAccountsIncubatingBadness() {
        const badness: Badness = {
            reasonId: Badness.ReasonId.BrokerageAccountDataListsIncubating,
            reasonExtra: `${this._accountWrappersIncubatedCount} / ${this._accountWrappers.length}`,
        };
        return badness;
    }

    private createOneOrMoreAccountsInErrorBadness(accountId: BrokerageAccountId) {
        const badness: Badness = {
            reasonId: Badness.ReasonId.OneOrMoreAccountsInError,
            reasonExtra: `${accountId}`,
        };
        return badness;
    }

    protected abstract createDataRecordsDataDefinition(): BrokerageAccountDataRecordsSubscriptionDataDefinition;
}

export namespace AllBrokerageAccountsDataRecordsDataItem {

    export class AccountWrapper<Record extends BrokerageAccountDataRecord> {
        loaded = false;

        incubatedChangedEvent: AccountWrapper.IncubatedChangedEventHandler<Record>;
        recordsInsertedEvent: AccountWrapper.RecordsInsertedEventHandler<Record>;
        recordsRemoveEvent: AccountWrapper.RecordsRemoveEventHandler<Record>;
        recordsClearEvent: AccountWrapper.RecordsClearEventHandler<Record>;

        private _incubated: boolean;

        private _listChangeSubscriptionId: MultiEvent.SubscriptionId;
        private _correctnessChangedSubscriptionId: MultiEvent.SubscriptionId;

        get accountMapKey() { return this._dataItem.accountKey.mapKey; }
        get accountId() { return this._dataItem.accountId; }

        get records() { return this._dataItem.records; }
        get recordCount() { return this._dataItem.records.length; }

        get incubated() { return this._incubated; }
        get usable() { return this._dataItem.usable; }
        get error() { return this._dataItem.error; }

        constructor(private _dataItem: DataRecordsBrokerageAccountSubscriptionDataItem<Record>) {
            this._listChangeSubscriptionId = this._dataItem.subscribeListChangeEvent(
                (listChangeTypeId, idx, count) => this.handleListChangeEvent(listChangeTypeId, idx, count)
            );
            this._correctnessChangedSubscriptionId = this._dataItem.subscribeCorrectnessChangeEvent(
                () => this.handleCorrectnessChangedEvent()
            );

            this._incubated = this._dataItem.incubated;
        }

        dispose() {
            this._dataItem.unsubscribeListChangeEvent(this._listChangeSubscriptionId);
            this._dataItem.unsubscribeCorrectnessChangeEvent(this._correctnessChangedSubscriptionId);
            return this._dataItem;
        }

        private handleListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
            switch (listChangeTypeId) {
                case UsableListChangeTypeId.Unusable: // ignore as this is handled by Correctness Change event
                    break;
                case UsableListChangeTypeId.PreUsableClear:
                    this.checkNotifyRecordsClear(this.accountMapKey, this._dataItem.records);
                    this.loaded = false;
                    break;
                case UsableListChangeTypeId.PreUsableAdd:
                    // Handled in incubated event so that if we have lots of accounts, they are loaded together
                    break;
                case UsableListChangeTypeId.Usable:
                    this._incubated = true;
                    this.incubatedChangedEvent(this);
                    break;
                case UsableListChangeTypeId.Insert:
                    this.checkNotifyRecordsInserted(this._dataItem.records, index, count);
                    break;
                case UsableListChangeTypeId.Remove:
                    this.checkNotifyRecordsRemove(this.accountMapKey, this._dataItem.records, index, count);
                    break;
                case UsableListChangeTypeId.Clear:
                    this.checkNotifyRecordsClear(this.accountMapKey, this._dataItem.records);
                    break;
                default:
                    throw new UnreachableCaseError('AHDIHAHLCED11103888', listChangeTypeId);
            }
        }

        private handleCorrectnessChangedEvent() {
            switch (this._dataItem.correctnessId) {
                case CorrectnessId.Error:
                    if (!this._incubated) {
                        this._incubated = true;
                        this.incubatedChangedEvent(this);
                    }
                    break;
                case CorrectnessId.Suspect: {
                    if (this._incubated) {
                        this._incubated = false;
                        this.incubatedChangedEvent(this);
                    }
                    break;
                }
                case CorrectnessId.Usable:
                case CorrectnessId.Good:
                    // ignore as these are handled by usable list change event
                    break;
            }
            const incubated = this._dataItem.incubated;
            if (this._incubated !== incubated) {
                this._incubated = incubated;
                this.incubatedChangedEvent(this);
            }
        }

        private checkNotifyRecordsInserted(records: Record[], index: Integer, count: Integer) {
            if (this.loaded) {
                this.recordsInsertedEvent(records, index, count);
            }
        }

        private checkNotifyRecordsRemove(accountMapKey: MapKey, records: Record[], index: Integer, count: Integer) {
            if (this.loaded) {
                this.recordsRemoveEvent(accountMapKey, records, index, count);
            }
        }

        private checkNotifyRecordsClear(accountMapKey: MapKey, records: Record[]) {
            if (this.loaded) {
                this.recordsClearEvent(accountMapKey, records);
            }
        }
    }

    export namespace AccountWrapper {
        export interface RecordAdditionsAndDeletions<Record extends BrokerageAccountDataRecord> {
            additions: Record[];
            deletions: Record[];
        }

        export type IncubatedChangedEventHandler<Record extends BrokerageAccountDataRecord> =
            (this: void, wrapper: AllBrokerageAccountsDataRecordsDataItem.AccountWrapper<Record>) => void;
        export type RecordsInsertedEventHandler<Record extends BrokerageAccountDataRecord> =
            (this: void, records: Record[], index: Integer, count: Integer) => void;
        export type RecordsRemoveEventHandler<Record extends BrokerageAccountDataRecord> =
            (this: void, accountMapKey: MapKey, records: Record[], index: Integer, count: Integer) => void;
        export type RecordsClearEventHandler<Record extends BrokerageAccountDataRecord> =
            (this: void, accountMapKey: MapKey, records: Record[]) => void;
    }

    export interface OldNewMatcher {
        readonly typeId: OldNewMatcher.TypeId;
        readonly mapKey: string;
        oldIdx: Integer;
        readonly newIdx: Integer;
    }

    export namespace OldNewMatcher {
        // TypeId values are used for sort order
        export const enum TypeId {
            Delete = 0,
            Replace = 1,
            Add = 2,
        }

        export function compare(left: OldNewMatcher, right: OldNewMatcher) {
            const leftTypeId = left.typeId;
            const rightTypeId = right.typeId;
            const typeComparison = compareInteger(leftTypeId, rightTypeId);

            if (typeComparison !== ComparisonResult.LeftEqualsRight) {
                return typeComparison;
            } else {
                switch (leftTypeId) {
                    case TypeId.Delete: {
                        // highest index earlier as delete is more efficient this way
                        return compareInteger(right.oldIdx, left.oldIdx);
                    }
                    case TypeId.Replace: {
                        // High to Low to assist with delete OldIdx adjustment
                        return compareInteger(right.oldIdx, left.oldIdx);
                    }
                    case TypeId.Add: {
                        // try and keep original order when adding
                        return compareInteger(left.newIdx, right.newIdx);
                    }
                    default:
                        return ComparisonResult.LeftEqualsRight;
                }
            }
        }

        export function adjustReplaceOldIdxForDeletion(replaceMatchers: OldNewMatcher[], deleteIdx: Integer) {
            const replaceMatchersCount = replaceMatchers.length;
            for (let i = 0; i < replaceMatchersCount; i++) {
                const matcher = replaceMatchers[i];
                if (matcher.oldIdx > deleteIdx) {
                    matcher.oldIdx--;
                } else {
                    break; // matchers are listed in order of high oldIdx to low OldIdx
                }
            }
        }
    }
}
