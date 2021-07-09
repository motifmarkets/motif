/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    assert,
    Badness,
    Integer,
    ListChangeTypeId,
    Logger,
    MultiEvent,
    NotImplementedError,
    UnexpectedTypeError
} from 'src/sys/internal-api';
import {
    DataMessage,
    DataMessageTypeId,
    Transaction,
    TransactionsDataMessage
} from './common/internal-api';
import { PublisherSubscriptionDataItem } from './publisher-subscription-data-item';

export class TransactionsDataItem extends PublisherSubscriptionDataItem {
    private _transactions: Transaction[] = [];

    private _transactionsListChangeMultiEvent = new MultiEvent<TransactionsDataItem.TListChangeEventHandler>();
    private _transactionsRecChangeMultiEvent = new MultiEvent<TransactionsDataItem.TRecChangeEventHandler>();

    public get transactions() {
        return this._transactions;
    }

    override processMessage(msg: DataMessage) {
        // virtual;
        if (msg.typeId !== DataMessageTypeId.Transactions) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();

                if (msg instanceof TransactionsDataMessage) {
                    this.processMessage_Transactions(
                        msg as TransactionsDataMessage
                    );
                } else {
                    throw new UnexpectedTypeError('TDIPM48859', '');
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    SubscribeTransactionsListChangeEvent(
        handler: TransactionsDataItem.TListChangeEventHandler
    ): MultiEvent.DefinedSubscriptionId {
        return this._transactionsListChangeMultiEvent.subscribe(handler);
    }

    UnsubscribeTransactionsListChangeEvent(
        subscriptionId: MultiEvent.SubscriptionId
    ) {
        this._transactionsListChangeMultiEvent.unsubscribe(subscriptionId);
    }

    SubscribeTransactionsRecChangeEvent(
        handler: TransactionsDataItem.TRecChangeEventHandler
    ): MultiEvent.DefinedSubscriptionId {
        return this._transactionsRecChangeMultiEvent.subscribe(handler);
    }

    UnsubscribeTransactionsRecChangeEvent(
        subscriptionId: MultiEvent.SubscriptionId
    ) {
        this._transactionsRecChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override calculateUsabilityBadness() {
        const badness = super.calculateUsabilityBadness();
        if (Badness.isUnusable(badness)) {
            return badness;
        } else {
            // if (!this._accountsDataItem.good) {
            //     return this.createBadAccountsBadness();
            // } else {
            return Badness.notBad;
            // }
        }
    }

    protected override processSubscriptionPreOnline() {
        // virtual
        const count = this._transactions.length;
        if (count > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                // this._accountlessOrders.length = 0;
                // this._groupOrdersMap.clearGroupOrders();
                // this._ordersMap.clear();
                // this._transactions.forEach(transaction => transaction.finalise());
                this._transactions.length = 0;
            } finally {
                this.endUpdate();
            }
        }
    }

    private notifyTransactionsListChange(
        ListChangeType: ListChangeTypeId,
        itemIndex: Integer
    ): void {
        const handlers = this._transactionsListChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](ListChangeType, index);
        }
    }

    private NotifyTransactionsRecChange(itemIndex: Integer): void {
        const handlers = this._transactionsRecChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](index);
        }
    }

    private createBadAccountsBadness() {
        // const accountsBadness = this._accountsDataItem.badness;
        // return {
        //     reasonId: Badness.ReasonId.AccountsWaiting,
        //     reasonExtra: Badness.generateText(accountsBadness),
        //     error: accountsBadness.error,
        // };
    }

    private processMessage_Transactions(Msg: TransactionsDataMessage): void {
        assert(Msg instanceof TransactionsDataMessage, 'ID:10322164238');

        // need to process transactions

        const add = (change: TransactionsDataMessage.AddChange): void => {
            const transaction = change.transaction;
            const index = this._transactions.findIndex(
                (o) => o.id === transaction.id
            );

            if (index >= 0) {
                Logger.logWarning(
                    'Existing order already exists in array. ID:13522165622'
                );
            } else {
                const insertIndex = this._transactions.length;
                this._transactions[insertIndex] = transaction;
                this.notifyTransactionsListChange(
                    ListChangeTypeId.Insert,
                    insertIndex
                );
            }
        };

        const clearAll = (
            change: TransactionsDataMessage.InitialiseChange
        ): void => {
            const Account = change.accountId;
            if (!Account) {
                this.processSubscriptionPreOnline(); // this is wrong - need to rework
            } else {
                for (
                    let index = this._transactions.length - 1;
                    index >= 0;
                    index--
                ) {
                    const holding = this._transactions[index];
                    if (holding.accountId === Account) {
                        this.notifyTransactionsListChange(
                            ListChangeTypeId.Remove,
                            index
                        );
                        this._transactions.splice(index, 1);
                    }
                }
            }
        };

        {
            for (let index = 0; index < Msg.changes.length; index++) {
                const change = Msg.changes[index];
                if (TransactionsDataMessage.isAddChange(change)) {
                    add(change);
                } else {
                    if (TransactionsDataMessage.isInitialiseChange(change)) {
                        clearAll(change);
                    } else {
                        throw new NotImplementedError('TDIPMT099356');
                    }
                }
            }
        }
    }
}

export namespace TransactionsDataItem {
    export type TListChangeEventHandler = (
        ListChangeType: ListChangeTypeId,
        Index: Integer
    ) => void;
    export type TRecChangeEventHandler = (this: void, Index: Integer) => void;
}
