/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Logger, parseIntStrict, parseNumberStrict, UnreachableCaseError } from 'src/sys/internal-api';
import { LitIvemAlternateCodes } from '../../../common/internal-api';
import { MyxLitIvemAttributes } from '../../../myx-lit-ivem-attributes';
import { Zenith } from './zenith';
import { ZenithMarketMyx } from './zenith-market-myx';

export namespace ZenithMarketMyxConvert {
    export namespace Symbols {
        export namespace Attributes {
            export function toLitIvem(value: Zenith.MarketController.SearchSymbols.Detail.Attributes) {
                const detailAttributes = value as ZenithMarketMyx.MarketController.Symbols.Detail.Attributes;
                const keys = Object.keys(detailAttributes);
                const result = new MyxLitIvemAttributes();
                for (const key of keys) {
                    const attributeValue = detailAttributes[key];
                    parseAttribute(key, attributeValue, result);
                }

                return result;
            }

            function parseAttribute(key: string, value: string | undefined, result: MyxLitIvemAttributes) {
                if (value !== undefined) {
                    const attributeKey = key as ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key;
                    switch (attributeKey) {
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.Category:
                            result.category = Category.toInteger(value);
                            break;
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.Class:
                            result.marketClassificationId = Class.toId(value);
                            break;
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.Sector:
                            result.sector = parseIntStrict(value);
                            break;
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.Short:
                            result.short = Short.toIdArray(value);
                            break;
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.ShortSuspended:
                            result.shortSuspended = Short.toIdArray(value);
                            break;
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.SubSector:
                            result.subSector = parseIntStrict(value);
                            break;
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.MaxRss:
                            result.maxRss = parseNumberStrict(value);
                            break;
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.Delivery:
                            result.deliveryBasisId = Delivery.toId(value);
                            break;
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.ISIN:
                        case ZenithMarketMyx.MarketController.Symbols.Detail.Attributes.Key.Ticker:
                            break;
                        default:
                            const neverKey: never = attributeKey;
                            Logger.logDataError('ZMMCSAPA8777877723', `"${key}" "${value}"`);
                            result.addUnrecognised(key, value);
                    }
                }
            }

            export namespace Category {
                export function toInteger(value: string) {
                    return parseIntStrict(value);
                }
            }

            export namespace Class {
                export function toId(value: string) {
                    const marketClassificationValue = value as ZenithMarketMyx.MarketController.Symbols.MarketClassification;
                    switch (marketClassificationValue) {
                        case ZenithMarketMyx.MarketController.Symbols.MarketClassification.Main:
                            return MyxLitIvemAttributes.MarketClassificationId.Main;
                        case ZenithMarketMyx.MarketController.Symbols.MarketClassification.Ace:
                            return MyxLitIvemAttributes.MarketClassificationId.Ace;
                        case ZenithMarketMyx.MarketController.Symbols.MarketClassification.Etf:
                            return MyxLitIvemAttributes.MarketClassificationId.Etf;
                        case ZenithMarketMyx.MarketController.Symbols.MarketClassification.Strw:
                            return MyxLitIvemAttributes.MarketClassificationId.Strw;
                        case ZenithMarketMyx.MarketController.Symbols.MarketClassification.Bond:
                            return MyxLitIvemAttributes.MarketClassificationId.Bond;
                        case ZenithMarketMyx.MarketController.Symbols.MarketClassification.Leap:
                            return MyxLitIvemAttributes.MarketClassificationId.Leap;
                        default:
                            const neverValue: never = marketClassificationValue;
                            Logger.logDataError('ZMMCSACLTI32238283382', `${value}`);
                            return undefined;
                    }
                }
            }

            export namespace Short {
                export function toIdArray(value: string) {
                    const count = value.length;
                    const result = new Array<MyxLitIvemAttributes.ShortSellTypeId>(count);
                    for (let i = 0; i < count; i++) {
                        result[i] = toId(value[i]);
                    }
                    return result;
                }

                export function toId(value: string) {
                    const shortValue = value as ZenithMarketMyx.MarketController.Symbols.ShortSellType;
                    switch (shortValue) {
                        case ZenithMarketMyx.MarketController.Symbols.ShortSellType.RegulatedShortSelling:
                            return MyxLitIvemAttributes.ShortSellTypeId.RegulatedShortSelling;
                        case ZenithMarketMyx.MarketController.Symbols.ShortSellType.ProprietaryDayTrading:
                            return MyxLitIvemAttributes.ShortSellTypeId.ProprietaryDayTrading;
                        case ZenithMarketMyx.MarketController.Symbols.ShortSellType.IntraDayShortSelling:
                            return MyxLitIvemAttributes.ShortSellTypeId.IntraDayShortSelling;
                        case ZenithMarketMyx.MarketController.Symbols.ShortSellType.ProprietaryShortSelling:
                            return MyxLitIvemAttributes.ShortSellTypeId.ProprietaryShortSelling;
                        default:
                            throw new UnreachableCaseError('ZMMCSACSTI3322382833382', shortValue);
                    }
                }
            }

            export namespace Delivery {
                export function toId(value: string) {
                    const deliveryBasisValue = value as ZenithMarketMyx.MarketController.Symbols.DeliveryBasis;
                    switch (deliveryBasisValue) {
                        case ZenithMarketMyx.MarketController.Symbols.DeliveryBasis.BuyingInT0:
                            return MyxLitIvemAttributes.DeliveryBasisId.BuyingInT0;
                        case ZenithMarketMyx.MarketController.Symbols.DeliveryBasis.DesignatedBasisT1:
                            return MyxLitIvemAttributes.DeliveryBasisId.DesignatedBasisT1;
                        case ZenithMarketMyx.MarketController.Symbols.DeliveryBasis.ReadyBasisT2:
                            return MyxLitIvemAttributes.DeliveryBasisId.ReadyBasisT2;
                        case ZenithMarketMyx.MarketController.Symbols.DeliveryBasis.ImmediateBasisT1:
                            return MyxLitIvemAttributes.DeliveryBasisId.ImmediateBasisT1;
                        default:
                            const neverValue: never = deliveryBasisValue;
                            Logger.logDataError('ZMMCSADTI133223828533382', `${value}`);
                            return undefined;
                    }
                }
            }
        }

        export namespace Alternates {
            export function toAdi(alternates: ZenithMarketMyx.MarketController.Symbols.Detail.Alternates) {
                const result: LitIvemAlternateCodes = {};

                for (let [key, value] of Object.entries(alternates)) {
                    switch (key) {
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Ticker: {
                            result.ticker = value;
                            break;
                        }
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Gics: {
                            result.gics = value;
                            break;
                        }
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Isin: {
                            result.isin = value;
                            break;
                        }
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Ric: {
                            result.ric = value;
                            break;
                        }
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Base: {
                            result.base = value;
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
