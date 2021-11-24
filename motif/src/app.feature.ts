/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UnreachableCaseError } from 'sys-internal-api';

export const enum AppFeatureId {
    WatchList,
    DepthAndTrades,
    Depth,
    TopShareholders,
    Trades,
    Chart,

    Trading,
    OrderPad,
    Orders,
    Holdings,
    Accounts,

    Status,
    Settings,
}

export namespace AppFeature {
    // eslint-disable-next-line prefer-const
    export let dev = false;
    export const preview = false;

    export function isEnabled(id: AppFeatureId): boolean {
        if (dev || preview) {
            return true;
       } else {
            switch (id) {
                case AppFeatureId.WatchList:
                case AppFeatureId.DepthAndTrades:
                case AppFeatureId.Depth:
                case AppFeatureId.Trades:
                case AppFeatureId.Chart:
                case AppFeatureId.Trading:
                case AppFeatureId.OrderPad:
                case AppFeatureId.Orders:
                case AppFeatureId.Holdings:
                case AppFeatureId.Accounts:
                case AppFeatureId.Status:
                case AppFeatureId.Settings:
                    return true;

                case AppFeatureId.TopShareholders:
                    return false;

                default:
                    throw new UnreachableCaseError('APIE23238875', id);
            }
        }
    }
}
