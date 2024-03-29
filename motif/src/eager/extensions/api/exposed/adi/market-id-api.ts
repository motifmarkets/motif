/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Handle } from '../sys/extension-api';

/** @public */
export const enum MarketIdEnum {
    AsxTradeMatch = 'AsxTradeMatch',
    AsxCentrePoint = 'AsxCentrePoint',
    MyxNormal = 'MyxNormal',
    MyxDirectBusiness = 'MyxDirectBusiness',
    MyxIndex = 'MyxIndex',
    MyxOddLot = 'MyxOddLot',
    MyxBuyIn = 'MyxBuyIn',
    Nzx = 'Nzx',
    Ptx = 'Ptx',
    Fnsx = 'Fnsx',
    Fpsx = 'Fpsx',
    Cfxt = 'Cfxt',
}

/** @public */
export type MarketId = keyof typeof MarketIdEnum;

/** @public */
export type MarketIdHandle = Handle;
