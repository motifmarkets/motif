/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum FeedIdEnum {
    Null = 'Null',
    Authority_TradingAuthority = 'Authority_TradingAuthority',
    Trading_Motif = 'Trading_Motif',
    Trading_Malacca = 'Trading_Malacca',
    Market_AsxTradeMatch = 'Market_AsxTradeMatch',
    Market_AsxCentrePoint = 'Market_AsxCentrePoint',
    Market_MyxNormal = 'Market_MyxNormal',
    Market_MyxDirectBusiness = 'Market_MyxDirectBusiness',
    Market_MyxIndex = 'Market_MyxIndex',
    Market_MyxOddLot = 'Market_MyxOddLot',
    Market_MyxBuyIn = 'Market_MyxBuyIn',
    Market_Ptx = 'Market_Ptx',
    Market_Fnsx = 'Market_Fnsx',
    News_Asx = 'News_Asx',
    News_Nsx = 'News_Nsx',
    News_Nzx = 'News_Nzx',
    News_Myx = 'News_Myx',
    News_Ptx = 'News_Ptx',
    News_Fnsx = 'News_Fnsx',
}

/** @public */
export type FeedId = keyof typeof FeedIdEnum;

/** @public */
export type FeedIdHandle = Handle;
