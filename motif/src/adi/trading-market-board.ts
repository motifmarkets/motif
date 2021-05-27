/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeEnvironmentId, MarketBoardId, TradingState } from './common/internal-api';

export interface TradingMarketBoard {
    id: MarketBoardId;
    environmentId: ExchangeEnvironmentId;
    status: string;
    allowIds: TradingState.AllowIds | undefined;
    reasonId: TradingState.ReasonId | undefined;
}

export type TradingMarketBoards = readonly TradingMarketBoard[];

export namespace TradingMarketBoard {

    export function getMarketBoard(boards: TradingMarketBoards, marketBoardId: MarketBoardId, environmentId: ExchangeEnvironmentId) {
        for (const board of boards) {
            if (board.id === marketBoardId && board.environmentId === environmentId) {
                return board;
            }
        }
        return undefined;
    }
}
