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
    PtxNormal = 'PtxNormal',
    FnsxNormal = 'FnsxNormal',
    FpsxNormal = 'FpsxNormal',
    CfxNormal = 'CfxNormal',
    DaxNormal = 'DaxNormal',
}

/** @public */
export type MarketId = keyof typeof MarketIdEnum;

/** @public */
export type MarketIdHandle = Handle;
