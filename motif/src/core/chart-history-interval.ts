/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'res-internal-api';
import { EnumInfoOutOfOrderError, Integer } from 'sys-internal-api';

export namespace ChartHistoryInterval {
    export const enum UnitId {
        Trade,
        Millisecond,
        Day,
        Week,
        Month,
        Year,
    }

    export const enum PresetId {
        Trade,
        OneSecond,
        OneMinute,
        FiveMinutes,
        FifteenMinutes,
        ThirtyMinutes,
        Hourly,
        Daily,
        Weekly,
        Monthly,
        Quarterly,
        Yearly,
        Custom,
    }

    // export const enum DataTypeId {
    //     DateTimePrice,
    //     DateTimePriceVolume,
    //     DateTimeOhlc,
    //     DateTimeOhlcv,
    // }

    export namespace Unit {
        export type Id = UnitId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof UnitId]: Info };

        const infosObject: InfosObject = {
            Trade: {
                id: UnitId.Trade,
                name: 'Trade',
                displayId: StringId.ChartHistoryIntervalUnitDisplay_Trade,
            },
            Millisecond: {
                id: UnitId.Millisecond,
                name: 'Millisecond',
                displayId: StringId.ChartHistoryIntervalUnitDisplay_Millisecond,
            },
            Day: {
                id: UnitId.Day,
                name: 'Day',
                displayId: StringId.ChartHistoryIntervalUnitDisplay_Day,
            },
            Week: {
                id: UnitId.Week,
                name: 'Week',
                displayId: StringId.ChartHistoryIntervalUnitDisplay_Week,
            },
            Month: {
                id: UnitId.Month,
                name: 'Month',
                displayId: StringId.ChartHistoryIntervalUnitDisplay_Month,
            },
            Year: {
                id: UnitId.Year,
                name: 'Year',
                displayId: StringId.ChartHistoryIntervalUnitDisplay_Year,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            for (let id = 0; id < idCount; id++ ) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('ChartHistoryInterval.UnitId', id, infos[id].name);
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function tryNameToId(name: string) {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].name === name) {
                    return id;
                }
            }
            return undefined;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }
    }

    export namespace Preset {
        export type Id = PresetId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly unitId: UnitId;
            readonly count: Integer;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof PresetId]: Info };

        const infosObject: InfosObject = {
            Trade: {
                id: PresetId.Trade,
                name: 'Trade',
                unitId: UnitId.Trade,
                count: 1,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_Trade,
            },
            OneSecond: {
                id: PresetId.OneSecond,
                name: 'OneSecond',
                unitId: UnitId.Millisecond,
                count: 1000,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_OneSecond,
            },
            OneMinute: {
                id: PresetId.OneMinute,
                name: 'OneMinute',
                unitId: UnitId.Millisecond,
                count: 60000,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_OneMinute,
            },
            FiveMinutes: {
                id: PresetId.FiveMinutes,
                name: 'FiveMinutes',
                unitId: UnitId.Millisecond,
                count: 300000,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_FiveMinutes,
            },
            FifteenMinutes: {
                id: PresetId.FifteenMinutes,
                name: 'FifteenMinutes',
                unitId: UnitId.Millisecond,
                count: 900000,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_FifteenMinutes,
            },
            ThirtyMinutes: {
                id: PresetId.ThirtyMinutes,
                name: 'ThirtyMinutes',
                unitId: UnitId.Millisecond,
                count: 1800000,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_ThirtyMinutes,
            },
            Hourly: {
                id: PresetId.Hourly,
                name: 'Hourly',
                unitId: UnitId.Millisecond,
                count: 3600000,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_Hourly,
            },
            Daily: {
                id: PresetId.Daily,
                name: 'Daily',
                unitId: UnitId.Day,
                count: 1,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_Daily,
            },
            Weekly: {
                id: PresetId.Weekly,
                name: 'Weekly',
                unitId: UnitId.Week,
                count: 1,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_Weekly,
            },
            Monthly: {
                id: PresetId.Monthly,
                name: 'Monthly',
                unitId: UnitId.Month,
                count: 1,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_Monthly,
            },
            Quarterly: {
                id: PresetId.Quarterly,
                name: 'Quarterly',
                unitId: UnitId.Month,
                count: 3,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_Quarterly,
            },
            Yearly: {
                id: PresetId.Yearly,
                name: 'Yearly',
                unitId: UnitId.Year,
                count: 1,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_Yearly,
            },
            Custom: {
                id: PresetId.Custom,
                name: 'Custom',
                unitId: UnitId.Trade,
                count: 1,
                displayId: StringId.ChartHistoryIntervalPresetDisplay_Custom,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            for (let id = 0; id < idCount; id++ ) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('ChartHistoryInterval.PresetId', id, infos[id].name);
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function tryNameToId(name: string) {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].name === name) {
                    return id;
                }
            }
            return undefined;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }
    }
}

export namespace ChartHistoryIntervalModule {
    export function initialiseStatic() {
        ChartHistoryInterval.Unit.initialise();
        ChartHistoryInterval.Preset.initialise();
    }
}
