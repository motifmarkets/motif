/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    Badness,
    Integer,
    MultiEvent,
    newUndefinableDate,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import {
    DataDefinition,
    LatestTradingDayTradesDataDefinition,
    LitIvemId,
    QueryTradesDataDefinition,
    TradesDataDefinition,
    TradesDataMessage
} from './common/internal-api';
import { DataItem } from './data-item';
import { TradesDataItem } from './trades-data-item';

export class LatestTradingDayTradesDataItem extends DataItem implements TradesDataItem.UsableBadnessRecordAccess {
    private _litIvemId: LitIvemId;
    private _tradingDate: Date;

    private _subscriptionDataItem: TradesDataItem;
    private _queryDataItem: TradesDataItem | undefined;

    private _queryRecordCount: Integer;
    private _queryRecords: TradesDataItem.Record[];

    private _recordCount: Integer;

    private _subscriptionUnprocessedUpdateChanges: TradesDataMessage.UpdateChange[] = [];

    private _subscriptionBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _subscriptionListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _subscriptionRecordChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _subscriptionOutOfRangeUpdateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _queryBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _queryListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _queryRecordChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _listChangeMultiEvent = new MultiEvent<TradesDataItem.ListChangeEventHandler>();
    private _recordChangeMultiEvent = new MultiEvent<TradesDataItem.RecordChangeEventHandler>();

    get recordCount() {
        return this._recordCount;
    }

    constructor(dataDefinition: DataDefinition) {
        super(dataDefinition);
        const typedDefinition = this
            .definition as LatestTradingDayTradesDataDefinition;
        this._litIvemId = typedDefinition.litIvemId;
    }

    getRecord(idx: Integer) {
        const queryRecordCount = this._queryRecordCount;
        if (idx < queryRecordCount) {
            return this._queryRecords[idx];
        } else {
            return this._subscriptionDataItem.records[idx - queryRecordCount];
        }
    }

    subscribeListChangeEvent(
        handler: LatestTradingDayTradesDataItem.ListChangeEventHandler
    ) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordChangeEvent(
        handler: LatestTradingDayTradesDataItem.RecordChangeEventHandler
    ) {
        return this._recordChangeMultiEvent.subscribe(handler);
    }

    unsubscribeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override start() {
        const subscriptionDefinition = new TradesDataDefinition();
        subscriptionDefinition.litIvemId = this._litIvemId;
        this._subscriptionDataItem = this.subscribeDataItem(
            subscriptionDefinition
        ) as TradesDataItem;
        this._subscriptionBadnessChangeSubscriptionId = this._subscriptionDataItem.subscribeBadnessChangeEvent(
            () => this.handleSubscriptionBadnessChangeEvent()
        );
        this._subscriptionListChangeSubscriptionId = this._subscriptionDataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) =>
                this.handleSubscriptionListChangeEvent(
                    listChangeTypeId,
                    index,
                    count
                )
        );
        this._subscriptionRecordChangeSubscriptionId = this._subscriptionDataItem.subscribeRecordChangeEvent(
            (index, oldRecord) =>
                this.handleSubscriptionRecordChangeEvent(index, oldRecord)
        );
        this._subscriptionOutOfRangeUpdateChangeSubscriptionId = this._subscriptionDataItem.subscribeOutOfRangeUpdateChangeEvent(
            (change) =>
                this.handleSubscriptionOutOfRangeUpdateChangeEvent(change)
        );

        if (this._subscriptionDataItem.usable) {
            this.procesSubscriptionBecameUsable();
        } else {
            const badness = this.generateSubscriptionBadness();
            this.setUnusable(badness);
        }

        super.start();
    }

    protected override stop() {
        this.checkUnsubscribeQueryDataItem();
        if (this._subscriptionDataItem !== undefined) {
            this._subscriptionDataItem.unsubscribeBadnessChangeEvent(
                this._subscriptionBadnessChangeSubscriptionId
            );
            this._subscriptionDataItem.unsubscribeListChangeEvent(
                this._subscriptionListChangeSubscriptionId
            );
            this._subscriptionDataItem.unsubscribeRecordChangeEvent(
                this._subscriptionRecordChangeSubscriptionId
            );
            this._subscriptionDataItem.unsubscribeOutOfRangeUpdateChangeEvent(
                this._subscriptionOutOfRangeUpdateChangeSubscriptionId
            );
            this.unsubscribeDataItem(this._subscriptionDataItem);
        }
    }

    protected calculateUsabilityBadness() {
        return this.generateBadness();
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);

            if (this._queryDataItem === undefined) {
                throw new AssertInternalError('LTDTDIPGC55593779');
            } else {
                const recordCount =
                    this._subscriptionDataItem.recordCount +
                    this._queryDataItem.recordCount;
                this._recordCount = recordCount;
                if (recordCount > 0) {
                    this.notifyListChange(
                        UsableListChangeTypeId.PreUsableAdd,
                        0,
                        recordCount
                    );
                }
                this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
            }
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private handleSubscriptionBadnessChangeEvent() {
        const badness = this.generateSubscriptionBadness();
        if (Badness.isUnusable(badness)) {
            this.setUnusable(badness);
        }
    }

    private handleSubscriptionListChangeEvent(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        this.processSubscriptionListChange(listChangeTypeId, index, count);
    }

    private handleSubscriptionRecordChangeEvent(
        index: Integer,
        oldRecord: TradesDataItem.Record
    ) {
        this.checkUsableNotifyRecordChange(
            this._queryRecordCount + index,
            oldRecord
        );
    }

    private handleSubscriptionOutOfRangeUpdateChangeEvent(
        change: TradesDataMessage.UpdateChange
    ) {
        if (this._queryDataItem === undefined || !this._queryDataItem.usable) {
            this._subscriptionUnprocessedUpdateChanges.push(change);
        } else {
            this._queryDataItem.processTradesMessageUpdateChange(change);
        }
    }

    private handleQueryBadnessChangeEvent() {
        const badness = this.generateQueryBadness();
        if (Badness.isUnusable(badness)) {
            this.setUnusable(badness);
        }
    }

    private handleQueryListChangeEvent(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        this.processQueryListChange(listChangeTypeId, index, count);
    }

    private handleQueryRecordChangeEvent(
        index: Integer,
        oldRecord: TradesDataItem.Record
    ) {
        this.checkUsableNotifyRecordChange(index, oldRecord);
    }

    private notifyListChange(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private checkUsableNotifyListChange(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    private notifyRecordChange(
        index: Integer,
        oldRecord: TradesDataItem.Record
    ) {
        const handlers = this._recordChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index, oldRecord);
        }
    }

    private checkUsableNotifyRecordChange(
        index: Integer,
        oldRecord: TradesDataItem.Record
    ) {
        if (this.usable) {
            this.notifyRecordChange(index, oldRecord);
        }
    }

    private checkUnsubscribeQueryDataItem() {
        if (this._queryDataItem !== undefined) {
            this._queryDataItem.unsubscribeBadnessChangeEvent(
                this._queryBadnessChangeSubscriptionId
            );
            this._queryBadnessChangeSubscriptionId = undefined;
            this._queryDataItem.unsubscribeListChangeEvent(
                this._queryListChangeSubscriptionId
            );
            this._queryListChangeSubscriptionId = undefined;
            this._queryDataItem.unsubscribeRecordChangeEvent(
                this._queryRecordChangeSubscriptionId
            );
            this._queryRecordChangeSubscriptionId = undefined;
            this.unsubscribeDataItem(this._queryDataItem);
            this._queryDataItem = undefined;
        }
    }

    private prefixSubscriptionReasonExtra(reasonExtra: string) {
        const prefix = 'Subscription';
        return reasonExtra === '' ? prefix : prefix + ': ' + reasonExtra;
    }

    private generateSubscriptionBadness(): Badness {
        const badness = this._subscriptionDataItem.badness;
        if (Badness.isUsable(badness)) {
            return badness;
        } else {
            this._subscriptionUnprocessedUpdateChanges.length = 0;
            return {
                reasonId: badness.reasonId,
                reasonExtra: this.prefixSubscriptionReasonExtra(
                    badness.reasonExtra
                ),
            };
        }
    }

    private generateQueryBadness(): Badness {
        if (this._queryDataItem === undefined) {
            throw new AssertInternalError('LTDTDIGQB52402777594');
        } else {
            const queryBadness = this._queryDataItem.badness;
            if (Badness.isUsable(queryBadness)) {
                return queryBadness;
            } else {
                return {
                    reasonId: queryBadness.reasonId,
                    reasonExtra: this.prefixQueryReasonExtra(
                        queryBadness.reasonExtra
                    ),
                };
            }
        }
    }

    private generateBadness() {
        if (this._queryDataItem === undefined) {
            const badness = this.generateSubscriptionBadness();
            if (Badness.isUsable(badness)) {
                // if subscription is good then we should have query dataitem
                throw new AssertInternalError('LTDTDIGB8777344320');
            } else {
                return badness;
            }
        } else {
            let badness = this.generateQueryBadness();
            if (Badness.isUsable(badness)) {
                // possible that subscription went offline and waiting for it to come good again
                badness = this.generateSubscriptionBadness();
            }
            return badness;
        }
    }

    private processSubscriptionListChange(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this._subscriptionUnprocessedUpdateChanges.length = 0;
                const unusableBadness: Badness = {
                    reasonId: this._subscriptionDataItem.badness.reasonId,
                    reasonExtra: this.prefixSubscriptionReasonExtra(
                        this._subscriptionDataItem.badness.reasonExtra
                    ),
                };
                this.setUnusable(unusableBadness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                const preGoodClearBadness: Badness = {
                    reasonId: Badness.preUsableClear.reasonId,
                    reasonExtra: this.prefixSubscriptionReasonExtra(
                        Badness.preUsableClear.reasonExtra
                    ),
                };
                this.setUnusable(preGoodClearBadness);
                this.checkUnsubscribeQueryDataItem();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                const preGoodAddBadness: Badness = {
                    reasonId: Badness.preUsableAdd.reasonId,
                    reasonExtra: this.prefixSubscriptionReasonExtra(
                        Badness.preUsableAdd.reasonExtra
                    ),
                };
                this.setUnusable(preGoodAddBadness);
                break;
            case UsableListChangeTypeId.Usable:
                this.procesSubscriptionBecameUsable();
                break;
            case UsableListChangeTypeId.Insert:
                this._recordCount += count;
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Insert,
                    this._queryRecordCount + index,
                    count
                );
                break;
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Remove,
                    this._queryRecordCount + index,
                    count
                );
                this._recordCount -= count;
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Clear,
                    0,
                    0
                );
                if (this._queryDataItem === undefined) {
                    this._recordCount = 0;
                } else {
                    this._recordCount = this._queryDataItem.recordCount;
                }
                break;
            default:
                throw new UnreachableCaseError(
                    'LTDTDIPSLC1003897412',
                    listChangeTypeId
                );
        }
    }

    private prefixQueryReasonExtra(reasonExtra: string) {
        const prefix = 'Query';
        return reasonExtra === '' ? prefix : prefix + ': ' + reasonExtra;
    }

    private processQueryListChange(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                if (this._queryDataItem === undefined) {
                    throw new AssertInternalError('LTDTDIPQLC7884350292');
                } else {
                    const unusableBadness: Badness = {
                        reasonId: this._queryDataItem.badness.reasonId,
                        reasonExtra: this.prefixQueryReasonExtra(
                            this._queryDataItem.badness.reasonExtra
                        ),
                    };
                    this.setUnusable(unusableBadness);
                }
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this._queryRecordCount = 0;
                this._queryRecords = [];
                const preGoodClearBadness: Badness = {
                    reasonId: Badness.preUsableClear.reasonId,
                    reasonExtra: this.prefixQueryReasonExtra(
                        Badness.preUsableClear.reasonExtra
                    ),
                };
                this.setUnusable(preGoodClearBadness);
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                if (this._queryDataItem === undefined) {
                    throw new AssertInternalError('LTDTDIPQBG877743209');
                } else {
                    this._queryRecordCount = this._queryDataItem.recordCount;
                    this._queryRecords = this._queryDataItem.records;

                    // fix up query with any update changes received from subscription so far
                    for (
                        let i = 0;
                        i < this._subscriptionUnprocessedUpdateChanges.length;
                        i++
                    ) {
                        const change = this
                            ._subscriptionUnprocessedUpdateChanges[i];
                        this._queryDataItem.processTradesMessageUpdateChange(
                            change
                        );
                    }
                    this._subscriptionUnprocessedUpdateChanges.length = 0;

                    const preGoodAddBadness: Badness = {
                        reasonId: Badness.preUsableAdd.reasonId,
                        reasonExtra: this.prefixQueryReasonExtra(
                            Badness.preUsableAdd.reasonExtra
                        ),
                    };
                    this.setUnusable(preGoodAddBadness);
                }
                break;
            case UsableListChangeTypeId.Usable:
                if (this._subscriptionDataItem.usable) {
                    this.trySetUsable();
                }
                break;
            case UsableListChangeTypeId.Insert:
                this._recordCount += count;
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Insert,
                    index,
                    count
                );
                break;
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Remove,
                    index,
                    count
                );
                this._recordCount -= count;
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(
                    UsableListChangeTypeId.Clear,
                    0,
                    0
                );
                this._recordCount = this._subscriptionDataItem.recordCount;
                break;
            default:
                throw new UnreachableCaseError(
                    'LTDTDIPSLC1003897412',
                    listChangeTypeId
                );
        }
    }

    private procesSubscriptionBecameUsable() {
        this.checkUnsubscribeQueryDataItem(); // should already be unsubscribed

        const queryDefinition = new QueryTradesDataDefinition();
        queryDefinition.litIvemId = this._litIvemId;
        queryDefinition.lastTradeId = this._subscriptionDataItem.mostRecentPriorFirstTradeId;
        const tradingDate = newUndefinableDate(
            this._subscriptionDataItem.marketTradingDate?.utcMidnight
        );
        if (tradingDate === undefined) {
            throw new AssertInternalError(
                'LTDTDUPSBG59371456',
                this._litIvemId.name
            );
        } else {
            queryDefinition.tradingDate = this._tradingDate;
            this._queryDataItem = this.subscribeDataItem(
                queryDefinition
            ) as TradesDataItem;
            this._queryBadnessChangeSubscriptionId = this._queryDataItem.subscribeBadnessChangeEvent(
                () => this.handleQueryBadnessChangeEvent()
            );
            this._queryListChangeSubscriptionId = this._queryDataItem.subscribeListChangeEvent(
                (listChangeTypeId, index, count) =>
                    this.handleQueryListChangeEvent(
                        listChangeTypeId,
                        index,
                        count
                    )
            );
            this._queryRecordChangeSubscriptionId = this._queryDataItem.subscribeRecordChangeEvent(
                (index, oldRecord) =>
                    this.handleQueryRecordChangeEvent(index, oldRecord)
            );
            if (this._queryDataItem.usable) {
                // should never happen because this is a query
                this.processQueryListChange(
                    UsableListChangeTypeId.PreUsableClear,
                    0,
                    0
                );
                const queryRecordCount = this._queryDataItem.recordCount;
                if (queryRecordCount > 0) {
                    this.processQueryListChange(
                        UsableListChangeTypeId.PreUsableAdd,
                        0,
                        queryRecordCount
                    );
                }
                this.processQueryListChange(
                    UsableListChangeTypeId.Usable,
                    0,
                    0
                );
            }
        }
    }
}

export namespace LatestTradingDayTradesDataItem {
    export type ListChangeEventHandler = (
        listChangeType: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) => void;
    export type RecordChangeEventHandler = (
        this: void,
        index: Integer,
        oldRecord: TradesDataItem.Record
    ) => void;
}
