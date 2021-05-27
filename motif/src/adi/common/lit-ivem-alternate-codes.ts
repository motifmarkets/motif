/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { EnumInfoOutOfOrderError } from 'src/sys/internal-api';
import { FieldDataTypeId } from './data-types';

export class LitIvemAlternateCodes {
    ticker: string | undefined;
    gics: string | undefined;
    isin: string | undefined;
    ric: string | undefined;
    base: string | undefined;
}

export namespace LitIvemAlternateCodes {
    export function isEqual(left: LitIvemAlternateCodes, right: LitIvemAlternateCodes) {
        return left.ticker !== right.ticker &&
            left.gics !== right.gics &&
            left.isin !== right.isin &&
            left.ric !== right.ric &&
            left.base !== right.base;
    }

    export function isUndefinableEqual(left: LitIvemAlternateCodes | undefined, right: LitIvemAlternateCodes | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return isEqual(left, right);
            }
        }
    }

    export namespace Field {
        export const enum Id {
            Ticker,
            Gics,
            Isin,
            Ric,
            Base,
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
            Ticker: {
                id: Id.Ticker,
                name: 'Ticker',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.LitIvemAlternateCodeDisplay_Ticker,
                headingId: StringId.LitIvemAlternateCodeHeading_Ticker,
            },
            Gics: {
                id: Id.Gics,
                name: 'Gics',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.LitIvemAlternateCodeDisplay_Gics,
                headingId: StringId.LitIvemAlternateCodeHeading_Gics,
            },
            Isin: {
                id: Id.Isin,
                name: 'Isin',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.LitIvemAlternateCodeDisplay_Isin,
                headingId: StringId.LitIvemAlternateCodeHeading_Isin,
            },
            Ric: {
                id: Id.Ric,
                name: 'Ric',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.LitIvemAlternateCodeDisplay_Ric,
                headingId: StringId.LitIvemAlternateCodeHeading_Ric,
            },
            Base: {
                id: Id.Base,
                name: 'Base',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.LitIvemAlternateCodeDisplay_Base,
                headingId: StringId.LitIvemAlternateCodeHeading_Base,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export const allNames = new Array<string>(idCount);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('LitIvemAlteranteCodes.Field', id, infos[id].name);
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
}

export namespace LitIvemAlternateCodesModule {
    export function initialiseStatic() {
        LitIvemAlternateCodes.Field.initialise();
    }
}
