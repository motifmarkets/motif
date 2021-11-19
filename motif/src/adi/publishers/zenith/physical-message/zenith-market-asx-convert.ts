/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes } from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithMarketAsx } from './zenith-market-asx';

export namespace ZenithMarketAsxConvert {
    export namespace Symbols {
        export namespace Alternates {
            export function toAdi(alternates: ZenithMarketAsx.MarketController.Symbols.Alternates) {
                const result: LitIvemAlternateCodes = {};

                for (const [key, value] of Object.entries(alternates)) {
                    switch (key) {
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Short: {
                            result.short = value;
                            break;
                        }
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Base: {
                            result.base = value;
                            break;
                        }
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Long: {
                            result.long = value;
                            break;
                        }
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Isin: {
                            result.isin = value;
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
