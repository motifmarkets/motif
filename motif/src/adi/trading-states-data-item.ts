/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, UnexpectedTypeError } from 'src/sys/internal-api';
import {
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    MarketId,
    TradingStates,
    TradingStatesDataDefinition,
    TradingStatesDataMessage
} from './common/internal-api';
import { FeedSubscriptionDataItem } from './feed-subscription-data-item';

export class TradingStatesDataItem extends FeedSubscriptionDataItem {
    private _marketId: MarketId;
    private _states: TradingStates;

    get marketId() { return this._marketId; }
    get states() { return this._states; }

    constructor(definition: DataDefinition) {
        super(definition);
        if (!(definition instanceof TradingStatesDataDefinition)) {
            throw new AssertInternalError('TSDICD4555832492', definition.description);
        } else {
            this._marketId = definition.marketId;
        }
    }

    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.TradingStates) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();

                if (msg instanceof TradingStatesDataMessage) {
                    this.processTradingStatesDataMessage(msg as TradingStatesDataMessage);
                } else {
                    throw new UnexpectedTypeError('OSDIPM33855', '');
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    findState(name: string) {
        for (let i = 0; i < this._states.length; i++) {
            const state = this._states[i];
            if (state.name === name) {
                return state;
            }
        }
        return undefined;
    }

    protected override processSubscriptionPreOnline() { // virtual
        if (this._states !== undefined && this._states.length > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this._states = [];
            } finally {
                this.endUpdate();
            }
        }
    }

    private processTradingStatesDataMessage(msg: TradingStatesDataMessage): void {
        assert(msg instanceof TradingStatesDataMessage, 'ID:10206103657');
        this._states = msg.states;
    }
}
