/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, UsableListChangeTypeId } from 'sys-internal-api';
import { DataDefinition, DataMessage, DataMessageTypeId, FeedClassId, FeedId, FeedInfo, FeedsDataMessage } from './common/internal-api';
import { DataItem } from './data-item';
import { DataRecordsPublisherSubscriptionDataItem } from './data-records-publisher-subscription-data-item';
import { Feed } from './feed';
import { TradingFeed } from './trading-feed';

export class FeedsDataItem extends DataRecordsPublisherSubscriptionDataItem<Feed> {
    getFeed(feedId: FeedId) {
        for (const feed of this.records) {
            if (feed.id === feedId) {
                return feed;
            }
        }
        return undefined;
    }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.Feeds) {
            super.processMessage(msg);
        } else {
            if (!(msg instanceof FeedsDataMessage)) {
                throw new AssertInternalError('FDIPM1004888847', JSON.stringify(msg));
            } else {
                this.beginUpdate();
                try {
                    this.advisePublisherResponseUpdateReceived();
                    this.processMessage_Feeds(msg);
                    this.notifyUpdateChange();
                } finally {
                    this.endUpdate();
                }
            }
        }
    }

    private createFeed(msgFeed: FeedsDataMessage.Feed) {
        const id = msgFeed.id;
        const classId = FeedInfo.idToClassId(id);
        let result: Feed;
        switch (classId) {
            case FeedClassId.Trading:
                const tradingFeed = new TradingFeed(id, msgFeed.environmentId, msgFeed.statusId, this.correctnessId);
                const subscribeDataItemFtn = (definition: DataDefinition) => this.subscribeDataItem(definition);
                const unsubscribeDataItemFtn = (dataItem: DataItem) => this.unsubscribeDataItem(dataItem);
                tradingFeed.initialise(subscribeDataItemFtn, unsubscribeDataItemFtn);
                result = tradingFeed;
                break;
            default:
                result = new Feed(id, msgFeed.environmentId, msgFeed.statusId, this.correctnessId);
        }
        return result;
    }

    private indexOfFeed(feedId: FeedId) {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const feed = this.records[i];
            if (feed.id === feedId) {
                return i;
            }
        }
        return -1;
    }

    private checkApplyAddRange(msgFeeds: FeedsDataMessage.Feeds, addStartMsgIdx: Integer, endPlus1MsgIdx: Integer) {
        if (addStartMsgIdx >= 0) {
            const addCount = endPlus1MsgIdx - addStartMsgIdx;
            const addStartIdx = this.extendRecordCount(addCount);
            let addIdx = addStartIdx;
            for (let i = addStartMsgIdx; i < endPlus1MsgIdx; i++) {
                const msgFeed = msgFeeds[i];
                const feed = this.createFeed(msgFeed);
                this.setRecord(addIdx++, feed);
            }
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, addCount);
        }
    }

    private processMessage_Feeds(msg: FeedsDataMessage) {
        let addStartMsgIdx = -1;

        for (let i = 0; i < msg.feeds.length; i++) {
            const msgFeed = msg.feeds[i];
            const idx = this.indexOfFeed(msgFeed.id);
            if (idx >= 0) {
                this.checkApplyAddRange(msg.feeds, addStartMsgIdx, i);
                const feed = this.records[idx];
                feed.change(msgFeed.statusId);
            } else {
                if (addStartMsgIdx < 0) {
                    addStartMsgIdx = i;
                }
            }
        }

        this.checkApplyAddRange(msg.feeds, addStartMsgIdx, msg.feeds.length);
    }
}
