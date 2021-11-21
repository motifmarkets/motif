/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Badness, Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from 'src/sys/internal-api';
import { ClassFeedsDataDefinition, DataDefinition, FeedClassId, FeedId, FeedsDataDefinition } from './common/internal-api';
import { DataItem } from './data-item';
import { Feed } from './feed';
import { FeedsDataItem } from './feeds-data-item';

export class ClassFeedsDataItem extends DataItem {
    private _classId: FeedClassId;
    private _feeds: Feed[] = [];

    private _allFeedsDataItem: FeedsDataItem;

    private _allBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _allListChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _listChangeMultiEvent = new MultiEvent<ClassFeedsDataItem.ListChangeEventHandler>();

    constructor(definition: DataDefinition) {
        super(definition);

        if (!(definition instanceof ClassFeedsDataDefinition)) {
            throw new AssertInternalError('CFDICI898982426666', definition.description);
        } else {
            this._classId = definition.classId;
        }
    }

    get feeds() { return this._feeds; }
    get count() { return this._feeds.length; }

    getFeed(feedId: FeedId) {
        for (const feed of this._feeds) {
            if (feed.id === feedId) {
                return feed;
            }
        }
        return undefined;
    }

    subscribeListChangeEvent(handler: ClassFeedsDataItem.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override start() {
        const feedsDefinition = new FeedsDataDefinition();
        this._allFeedsDataItem = this.subscribeDataItem(feedsDefinition) as FeedsDataItem;

        this._allBadnessChangeSubscriptionId = this._allFeedsDataItem.subscribeBadnessChangeEvent(
            () => this.handleAllBadnessChangeEvent()
        );
        this._allListChangeSubscriptionId = this._allFeedsDataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => this.handleAllListChangeEvent(listChangeTypeId, index, count)
        );

        if (this._allFeedsDataItem.usable) {
            const allCount = this._allFeedsDataItem.count;
            if (allCount > 0) {
                this.processAllListChange(UsableListChangeTypeId.PreUsableAdd, 0, allCount);
            }
            this.processAllListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processAllListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }

        super.start();
    }

    protected override stop() {
        this._allFeedsDataItem.unsubscribeBadnessChangeEvent(this._allBadnessChangeSubscriptionId);
        this._allFeedsDataItem.unsubscribeListChangeEvent(this._allListChangeSubscriptionId);
        this.unsubscribeDataItem(this._allFeedsDataItem);
    }

    protected calculateUsabilityBadness() {
        return this._allFeedsDataItem.badness;
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this._feeds.length;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private handleAllBadnessChangeEvent() {
        if (!this._allFeedsDataItem.usable) {
            this.setUnusable(this._allFeedsDataItem.badness);
        }
    }

    private handleAllListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        this.processAllListChange(listChangeTypeId, index, count);
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    private processAllListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._allFeedsDataItem.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this.clearFeeds();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                this.insertFromAllFeeds(index, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.trySetUsable();
                break;
            case UsableListChangeTypeId.Insert:
                this.insertFromAllFeeds(index, count);
                break;
            case UsableListChangeTypeId.Remove:
                throw new AssertInternalError('CFDIPALCR11103888', this.definition.description);
            case UsableListChangeTypeId.Clear:
                this.clearFeeds();
                break;
            default:
                throw new UnreachableCaseError('CFDIPALCR11103888', listChangeTypeId);
        }
    }

    private insertFromAllFeeds(index: Integer, count: Integer) {
        const classFeeds = new Array<Feed>(count);
        const endPlus1Index = index + count;
        let classCount = 0;
        for (let i = index; i < endPlus1Index; i++) {
            const feed = this._allFeedsDataItem.records[i];
            if (feed.classId === this._classId) {
                classFeeds[classCount++] = feed;
            }
        }

        if (classCount > 0) {
            const addStartIdx = this._feeds.length;
            this._feeds.length += classCount;
            let addIdx = addStartIdx;
            for (let i = 0; i < classCount; i++) {
                this._feeds[addIdx++] = classFeeds[i];
            }

            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, classCount);
        }
    }

    private clearFeeds() {
        const count = this._feeds.length;
        if (count > 0) {
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, 0, count);
            this._feeds.length = 0;
        }
    }
}

export namespace ClassFeedsDataItem {
    export type ListChangeEventHandler = (this: void, listChangeType: UsableListChangeTypeId, index: Integer, count: Integer) => void;
}
