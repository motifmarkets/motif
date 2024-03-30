/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum FeedIdEnum {
    Null = 'Null',
    Authority_Trading = 'Authority_Trading',
    Authority_Watchlist = 'Authority_Watchlist',
    Trading_Oms = 'Trading_Oms',
    Trading_Motif = 'Trading_Motif',
    Trading_Malacca = 'Trading_Malacca',
    Trading_Finplex = 'Trading_Finplex',
    Trading_CFMarkets = 'Trading_CFMarkets',
    Market_AsxTradeMatch = 'Market_AsxTradeMatch',
    Market_AsxCentrePoint = 'Market_AsxCentrePoint',
    Market_MyxNormal = 'Market_MyxNormal',
    Market_MyxDirectBusiness = 'Market_MyxDirectBusiness',
    Market_MyxIndex = 'Market_MyxIndex',
    Market_MyxOddLot = 'Market_MyxOddLot',
    Market_MyxBuyIn = 'Market_MyxBuyIn',
    Market_PtxMain = 'Market_PtxMain',
    Market_FnsxMain = 'Market_FnsxMain',
    Market_FpsxMain = 'Market_FpsxMain',
    Market_CfxMain = 'Market_CfxMain',
    Market_DaxMain = 'Market_DaxMain',
    News_Asx = 'News_Asx',
    News_Nsx = 'News_Nsx',
    News_Nzx = 'News_Nzx',
    News_Myx = 'News_Myx',
    News_Ptx = 'News_Ptx',
    News_Fnsx = 'News_Fnsx',
    Watchlist = 'Watchlist',
    Scanner = 'Scanner',
    Channel = 'Channel',
}

/** @public */
export type FeedId = keyof typeof FeedIdEnum;

/** @public */
export type FeedIdHandle = Handle;
