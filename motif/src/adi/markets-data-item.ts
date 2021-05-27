/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, UsableListChangeTypeId } from 'src/sys/internal-api';
import { DataDefinition, DataMessage, DataMessageTypeId, MarketId, MarketsDataMessage } from './common/internal-api';
import { DataItem } from './data-item';
import { DataRecordsPublisherSubscriptionDataItem } from './data-records-publisher-subscription-data-item';
import { Market } from './market';

export class MarketsDataItem extends DataRecordsPublisherSubscriptionDataItem<Market> {
    getMarket(marketId: MarketId) {
        for (const state of this.records) {
            if (state.marketId === marketId) {
                return state;
            }
        }
        return undefined;
    }

    processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.Markets) {
            super.processMessage(msg);
        } else {
            if (!(msg instanceof MarketsDataMessage)) {
                throw new AssertInternalError('MDIPM10048888478', JSON.stringify(msg));
            } else {
                this.beginUpdate();
                try {
                    this.advisePublisherResponseUpdateReceived();
                    this.processMessage_Markets(msg);
                    this.notifyUpdateChange();
                } finally {
                    this.endUpdate();
                }
            }
        }
    }

    private addMarket(idx: Integer, msgMarket: MarketsDataMessage.Market) {
        const market = new Market(msgMarket, this.correctnessId);
        const subscribeDataItemFtn = (definition: DataDefinition) => this.subscribeDataItem(definition);
        const unsubscribeDataItemFtn = (dataItem: DataItem) => this.unsubscribeDataItem(dataItem);
        market.initialise(subscribeDataItemFtn, unsubscribeDataItemFtn);
        this.setRecord(idx, market);
    }

    private checkApplyAddBlock(msgStates: readonly MarketsDataMessage.Market[], addStartMsgIdx: Integer, endPlus1MsgIdx: Integer) {
        if (addStartMsgIdx >= 0) {
            const addCount = endPlus1MsgIdx - addStartMsgIdx;
            const addStartIdx = this.extendRecordCount(addCount);
            let addIdx = addStartIdx;
            for (let i = addStartMsgIdx; i < endPlus1MsgIdx; i++) {
                const msgState = msgStates[i];
                this.addMarket(addIdx++, msgState);
            }
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, addCount);
        }
    }

    private processMessage_Markets(msg: MarketsDataMessage) {
        let addStartMsgIdx = -1;

        for (let i = 0; i < msg.markets.length; i++) {
            const msgMarket = msg.markets[i];
            const market = this.getMarket(msgMarket.marketId);
            if (market !== undefined) {
                this.checkApplyAddBlock(msg.markets, addStartMsgIdx, i);
                addStartMsgIdx = -1;
                market.change(msgMarket);
            } else {
                if (addStartMsgIdx < 0) {
                    addStartMsgIdx = i;
                }
            }
        }

        this.checkApplyAddBlock(msg.markets, addStartMsgIdx, msg.markets.length);
    }
}

export namespace MarketsDataItem {
    export function getAllowedMarkets(markets: Market[]): MarketId[] {
        const allowedMarkets: MarketId[] = [];

        for (let index = 0; index < markets.length; index++) {
            const market = markets[index];
            allowedMarkets.push(market.marketId);
        }

        // Add the mixed market variations.
        if (allowedMarkets.includes(MarketId.AsxTradeMatch) && allowedMarkets.includes(MarketId.ChixAustLimit)) {
            allowedMarkets.push(MarketId.AsxCxa);
        }

        return allowedMarkets;
    }
}
