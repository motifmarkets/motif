/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'res-internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, Integer, isUndefinableArrayEqualUniquely } from 'sys-internal-api';
import { ExchangeId, ExchangeInfo, FieldDataTypeId, LitIvemAttributes } from './common/internal-api';

export class MyxLitIvemAttributes extends LitIvemAttributes {
    category: Integer | undefined;
    marketClassificationId: MyxLitIvemAttributes.MarketClassificationId | undefined;
    deliveryBasisId: MyxLitIvemAttributes.DeliveryBasisId | undefined;
    maxRss: number | undefined;
    sector: Integer | undefined;
    short: readonly MyxLitIvemAttributes.ShortSellTypeId[] | undefined;
    shortSuspended: readonly MyxLitIvemAttributes.ShortSellTypeId[] | undefined;
    subSector: Integer | undefined;

    constructor() {
        super(ExchangeId.Myx);
    }

    isEqualTo(other: LitIvemAttributes): boolean {
        if (!MyxLitIvemAttributes.isMyx(other)) {
            throw new AssertInternalError('MLIAIET99800990992', ExchangeInfo.idToName(other.exchangeId));
        } else {
            const result: boolean =
                this.category === other.category &&
                this.marketClassificationId === other.marketClassificationId &&
                this.deliveryBasisId === other.deliveryBasisId &&
                this.maxRss === other.maxRss &&
                this.sector === other.sector &&
                isUndefinableArrayEqualUniquely(this.short, other.short) &&
                this.shortSuspended === other.shortSuspended &&
                this.subSector === other.subSector;

            return result;
        }
    }

}

export namespace MyxLitIvemAttributes {
    export const enum MarketClassificationId {
        Main,
        Ace,
        Etf,
        Strw,
        Bond,
        Leap,
    }

    export const enum ShortSellTypeId {
        RegulatedShortSelling,
        ProprietaryDayTrading,
        IntraDayShortSelling,
        ProprietaryShortSelling,
    }

    // export const enum CategoryId {
    //     Foreign,
    //     Sharia,
    // }

    export const enum DeliveryBasisId {
        BuyingInT0,
        DesignatedBasisT1,
        ReadyBasisT2,
        ImmediateBasisT1,
    }

    export function isMyx(attributes: LitIvemAttributes): attributes is MyxLitIvemAttributes {
        return attributes.exchangeId === ExchangeId.Myx;
    }

    export namespace Field {
        export const enum Id {
            Category,
            MarketClassification,
            DeliveryBasis,
            MaxRSS,
            Sector,
            Short,
            ShortSuspended,
            SubSector,
        }

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            Category: {
                id: Id.Category,
                name: 'Category',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.MyxLitIvemAttributesDisplay_Category,
                headingId: StringId.MyxLitIvemAttributesHeading_Category,
            },
            MarketClassification: {
                id: Id.MarketClassification,
                name: 'MarketClassification',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.MyxLitIvemAttributesDisplay_MarketClassification,
                headingId: StringId.MyxLitIvemAttributesHeading_MarketClassification,
            },
            DeliveryBasis: {
                id: Id.DeliveryBasis,
                name: 'DeliveryBasis',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.MyxLitIvemAttributesDisplay_DeliveryBasis,
                headingId: StringId.MyxLitIvemAttributesHeading_DeliveryBasis,
            },
            MaxRSS: {
                id: Id.MaxRSS,
                name: 'MaxRSS',
                dataTypeId: FieldDataTypeId.Number,
                displayId: StringId.MyxLitIvemAttributesDisplay_MaxRSS,
                headingId: StringId.MyxLitIvemAttributesHeading_MaxRSS,
            },
            Sector: {
                id: Id.Sector,
                name: 'Sector',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.MyxLitIvemAttributesDisplay_Sector,
                headingId: StringId.MyxLitIvemAttributesHeading_Sector,
            },
            Short: {
                id: Id.Short,
                name: 'Short',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.MyxLitIvemAttributesDisplay_Short,
                headingId: StringId.MyxLitIvemAttributesHeading_Short,
            },
            ShortSuspended: {
                id: Id.ShortSuspended,
                name: 'ShortSuspended',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.MyxLitIvemAttributesDisplay_ShortSuspended,
                headingId: StringId.MyxLitIvemAttributesHeading_ShortSuspended,
            },
            SubSector: {
                id: Id.SubSector,
                name: 'SubSector',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.MyxLitIvemAttributesDisplay_SubSector,
                headingId: StringId.MyxLitIvemAttributesHeading_SubSector,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export const allNames = new Array<string>(idCount);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('MyxLitIvemAttribute.Field', id, infos[id].name);
                } else {
                    allNames[id] = idToName(id);
                }
            }
        }

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }
    }

    export namespace MarketClassification {
        export type Id = MarketClassificationId;

        interface Info {
            readonly id: Id;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof MarketClassificationId]: Info };

        const infosObject: InfosObject = {
            Main: {
                id: MarketClassificationId.Main,
                displayId: StringId.MyxMarketClassificationDisplay_Main,
            },
            Ace: {
                id: MarketClassificationId.Ace,
                displayId: StringId.MyxMarketClassificationDisplay_Ace,
            },
            Etf: {
                id: MarketClassificationId.Etf,
                displayId: StringId.MyxMarketClassificationDisplay_Etf,
            },
            Strw: {
                id: MarketClassificationId.Strw,
                displayId: StringId.MyxMarketClassificationDisplay_Strw,
            },
            Bond: {
                id: MarketClassificationId.Bond,
                displayId: StringId.MyxMarketClassificationDisplay_Bond,
            },
            Leap: {
                id: MarketClassificationId.Leap,
                displayId: StringId.MyxMarketClassificationDisplay_Leap,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('MyxLitIvemAttribute.MarketClassificationId', id, idToDisplay(id));
                }
            }
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }
    }

    export namespace ShortSellType {
        export type Id = ShortSellTypeId;

        interface Info {
            readonly id: Id;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof ShortSellTypeId]: Info };

        const infosObject: InfosObject = {
            RegulatedShortSelling: {
                id: ShortSellTypeId.RegulatedShortSelling,
                displayId: StringId.MyxShortSellTypeDisplay_RegulatedShortSelling,
            },
            ProprietaryDayTrading: {
                id: ShortSellTypeId.ProprietaryDayTrading,
                displayId: StringId.MyxShortSellTypeDisplay_ProprietaryDayTrading,
            },
            IntraDayShortSelling: {
                id: ShortSellTypeId.IntraDayShortSelling,
                displayId: StringId.MyxShortSellTypeDisplay_IntraDayShortSelling,
            },
            ProprietaryShortSelling: {
                id: ShortSellTypeId.ProprietaryShortSelling,
                displayId: StringId.MyxShortSellTypeDisplay_ProprietaryShortSelling,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('MyxLitIvemAttribute.ShortSellTypeId', id, idToDisplay(id));
                }
            }
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }
    }

    export namespace DeliveryBasis {
        export type Id = DeliveryBasisId;

        interface Info {
            readonly id: Id;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof DeliveryBasisId]: Info };

        const infosObject: InfosObject = {
            BuyingInT0: {
                id: DeliveryBasisId.BuyingInT0,
                displayId: StringId.MyxDeliveryBasisDisplay_BuyingInT0,
            },
            DesignatedBasisT1: {
                id: DeliveryBasisId.DesignatedBasisT1,
                displayId: StringId.MyxDeliveryBasisDisplay_DesignatedBasisT1,
            },
            ReadyBasisT2: {
                id: DeliveryBasisId.ReadyBasisT2,
                displayId: StringId.MyxDeliveryBasisDisplay_ReadyBasisT2,
            },
            ImmediateBasisT1: {
                id: DeliveryBasisId.ImmediateBasisT1,
                displayId: StringId.MyxDeliveryBasisDisplay_ImmediateBasisT1,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('MyxLitIvemAttribute.DeliveryBasisId', id, idToDisplay(id));
                }
            }
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }
    }
}

export namespace MyxLitIvemAttributesModule {
    export function initialiseStatic() {
        MyxLitIvemAttributes.Field.initialise();
        MyxLitIvemAttributes.MarketClassification.initialise();
        MyxLitIvemAttributes.ShortSellType.initialise();
        MyxLitIvemAttributes.DeliveryBasis.initialise();
    }
}
