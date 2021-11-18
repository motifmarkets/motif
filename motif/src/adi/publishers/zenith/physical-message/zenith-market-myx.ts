/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Zenith } from './zenith';

export namespace ZenithMarketMyx {
    export namespace MarketController {
        export namespace Symbols {
            export const enum MarketClassification {
                Main = 'MAIN',
                Ace = 'ACE',
                Etf = 'ETF',
                Strw = 'STRW',
                Bond = 'BOND',
                Leap = 'LEAP',
            }

            export const enum ShortSellType {
                RegulatedShortSelling = 'R',
                ProprietaryDayTrading = 'P',
                IntraDayShortSelling = 'I',
                ProprietaryShortSelling = 'V',
            }

            // These are the possible values in the Symbol Categories field
            // These are not relevant to the Category Attribute below
            export const enum CategoryCode {
                Foreign = 'Foreign',
                Sharia = 'Sharia',
            }

            export const enum DeliveryBasis {
                BuyingInT0 = '0',
                DesignatedBasisT1 = '2',
                ReadyBasisT2 = '3',
                ImmediateBasisT1 = '4',
            }

            export interface Attributes extends Zenith.MarketController.SearchSymbols.Attributes {
                Category: string;
                Class: MarketClassification;
                Delivery?: DeliveryBasis;
                MaxRSS?: string;
                Sector: string;
                Short?: string;
                ShortSuspended?: string;
                SubSector: string;
            }

            export namespace Attributes {
                export const enum Key {
                    Category = 'Category',
                    Class = 'Class',
                    Delivery = 'Delivery',
                    Sector = 'Sector',
                    Short = 'Short',
                    ShortSuspended = 'ShortSuspended',
                    SubSector = 'SubSector',
                    MaxRss = 'MaxRSS',
                    ISIN = 'ISIN', // Temporary to handle server issue - remove when server fixed
                    Ticker = 'Ticker', // Temporary to handle server issue - remove when server fixed
                }
            }

            export interface Alternates extends Pick<
                Zenith.MarketController.SearchSymbols.Alternates,
                'Ticker' | 'ISIN' | 'Base' | 'GICS' | 'RIC'
            > {
                // redeclare fields which are not optional
                Ticker: string;
                GICS: string;
                RIC: string;
            }
        }
    }
}
