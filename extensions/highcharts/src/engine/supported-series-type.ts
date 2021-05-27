/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, strings } from '../i18n-strings';
import { EnumInfoOutOfOrderError } from '../internal-error';

export const enum SupportedSeriesTypeId {
    Line,
    Ohlc,
    Candlestick,
    Column,
}

export namespace SupportedSeriesType {
    export type Id = SupportedSeriesTypeId;

    export const enum JsonValue {
        Line = 'line',
        Ohlc = 'ohlc',
        Candlestick = 'candlestick',
        Column = 'column',
    }

    const enum HighchartsId {
        Line = 'line',
        Ohlc = 'ohlc',
        Candlestick = 'candlestick',
        Column = 'column',
    }

    interface Info {
        readonly id: Id;
        readonly highchartsId: HighchartsId;
        readonly jsonValue: JsonValue;
        readonly displayId: StringId;
    }

    type InfosObject = { [id in keyof typeof SupportedSeriesTypeId]: Info };

    const infosObject: InfosObject = {
        Line: {
            id: SupportedSeriesTypeId.Line,
            highchartsId:  HighchartsId.Line,
            jsonValue: JsonValue.Line,
            displayId: StringId.SeriesTypeDisplay_Line,
        },
        Ohlc: {
            id: SupportedSeriesTypeId.Ohlc,
            highchartsId: HighchartsId.Ohlc,
            jsonValue: JsonValue.Ohlc,
            displayId: StringId.SeriesTypeDisplay_Bar,
        },
        Candlestick: {
            id: SupportedSeriesTypeId.Candlestick,
            highchartsId: HighchartsId.Candlestick,
            jsonValue: JsonValue.Candlestick,
            displayId: StringId.SeriesTypeDisplay_Candlestick,
        },
        Column: {
            id: SupportedSeriesTypeId.Column,
            highchartsId: HighchartsId.Column,
            jsonValue: JsonValue.Column,
            displayId: StringId.SeriesTypeDisplay_Column,
        },
    } as const;

    export const idCount = Object.keys(infosObject).length;
    const infos = Object.values(infosObject);

    export function initialise() {
        for (let id = 0; id < idCount; id++) {
            if (infos[id].id !== id) {
                throw new EnumInfoOutOfOrderError('SupportedHighchartsSeriesTypeId', id, idToDisplay(id));
            }
        }
    }

    export function idToHighchartsId(id: Id) {
        return infos[id].highchartsId;
    }

    export function tryHighchartsIdToId(value: string) {
        const supportedHighchartsId = value as HighchartsId;
        switch (supportedHighchartsId) {
            case HighchartsId.Line: return SupportedSeriesTypeId.Line;
            case HighchartsId.Ohlc: return SupportedSeriesTypeId.Ohlc;
            case HighchartsId.Candlestick: return SupportedSeriesTypeId.Candlestick;
            case HighchartsId.Column: return SupportedSeriesTypeId.Column;
            default:
                const neversupportedHighchartsId: never = supportedHighchartsId;
                return undefined;
        }
    }

    export function idToDisplayId(id: Id) {
        return infos[id].displayId;
    }

    export function idToDisplay(id: Id) {
        return strings[idToDisplayId(id)];
    }
}

export namespace SupportedHighchartsSeriesTypeModule {
    export function initialiseStatic() {
        SupportedSeriesType.initialise();
    }
}
