/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountId } from './brokerage-account-id-api';
import { CurrencyId } from './currency-id-api';
import { Feed } from './feed-api';

/** @public */
export interface BrokerageAccount {
    readonly id: BrokerageAccount.Id;
    readonly upperId: string;
    readonly name: string;
    readonly upperName: string;
    readonly tradingFeed: Feed;
    readonly currencyId: CurrencyId;
}

/** @public */
export namespace BrokerageAccount {
    export type Id = BrokerageAccountId;
}
