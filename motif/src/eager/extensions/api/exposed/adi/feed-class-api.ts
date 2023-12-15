/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export const enum FeedClassEnum {
    Authority = 'Authority',
    Market = 'Market',
    News = 'News',
    Trading = 'Trading',
    Watchlist = 'Watchlist',
    Scanner = 'Scanner',
    Channel = 'Channel',
}

/** @public */
export type FeedClass = keyof typeof FeedClassEnum;
