/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes } from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithMarketPtx } from './zenith-market-ptx';

export namespace ZenithMarketPtxConvert {
    export namespace Symbols {
        export namespace Alternates {
            export function toAdi(alternates: ZenithMarketPtx.MarketController.Symbols.Alternates) {
                const result: LitIvemAlternateCodes = {};

                for (const [key, value] of Object.entries(alternates)) {
                    switch (key) {
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Uid: {
                            // result.uid = value; // not currently used
                            break;
                        }
                        default:
                            result[key] = value;
                    }
                }
                return result;
            }
        }
    }
}
