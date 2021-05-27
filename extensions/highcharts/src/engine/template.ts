/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionSvc, HistorySequencer, Integer, IntervalHistorySequencer, Json } from 'motif';
import { EngineSeries } from './engine-series';
import { SupportedSeriesType } from './supported-series-type';

export interface Template {
    chartOptions: Highcharts.Options;
    seriesArray: Template.Series[];
    sequencerType: string;
    intervalSequencer: Template.IntervalSequencer;
}

export namespace Template {

    export const enum TypeId {
        Named,
        LitIvemIdDefault,
        LitIvemIdRemembered,
    }

    export interface Series {
        id: string;
        typeId: EngineSeries.Type.JsonValue;
        parameterIndex?: Integer;
        litIvemId?: Json;
        hideYAxisIfUnused: boolean;
    }

    export interface IntervalSequencer {
        unit: string;
        unitCount: number;
        emptyPeriodsSkipped: boolean;
        weekendsSkipped: boolean;
        completedIntervalsOnly: boolean;
    }

    export namespace IntervalSequencer {
        export namespace JsonName {
            export const unit = 'unit';
            export const unitCount = 'unitCount';
            export const emptyPeriodsSkipped = 'emptyPeriodsSkipped';
            export const weekendsSkipped = 'weekendsSkipped';
            export const completedIntervalsOnly = 'completedIntervalsOnly';
        }

        export namespace defaults {
            export const unit = IntervalHistorySequencer.UnitEnum.Millisecond;
            export const unitCount = 60000;
            export const emptyPeriodsSkipped = false;
            export const weekendsSkipped = true;
            export const completedIntervalsOnly = false;
        }
    }

    const enum DefaultId {
        // Series
        LitIvemIdPriceSeries = 'defaultLitIvemIdPriceSeries',
        LitIvemIdVolumeSeries = 'defaultLitIvemIdVolumeSeries',
        // YAxis
        LitIvemIdPriceYAxis = 'defaultLitIvemIdPriceYAxis',
        LitIvemIdVolumeYAxis = 'defaultLitIvemIdVolumeYAxis',
    }

    export const defaultSequencerTypeId = HistorySequencer.TypeEnum.Interval;

    export function createDefaultIntervalSequencer(extensionSvc: ExtensionSvc) {
        const result: IntervalSequencer = {
            unit: extensionSvc.intervalHistorySequencerSvc.unitToJsonValue(IntervalSequencer.defaults.unit),
            unitCount: IntervalSequencer.defaults.unitCount,
            emptyPeriodsSkipped: IntervalSequencer.defaults.emptyPeriodsSkipped,
            weekendsSkipped: IntervalSequencer.defaults.weekendsSkipped,
            completedIntervalsOnly: IntervalSequencer.defaults.completedIntervalsOnly,
        };
        return result;
    }

    export function createDefault(extensionSvc: ExtensionSvc) {
        const defaultIntervalSequencer = createDefaultIntervalSequencer(extensionSvc);

        const template: Template = {
            chartOptions: {
                chart: {
                    styledMode: true,
                    animation: false
                },
                credits: {
                    enabled: false,
                },
                rangeSelector: {
                    enabled: false,
                    // selected: 1
                },
                plotOptions: {
                    series: {
                        animation: false
                    }
                },
                series: [{
                        type: SupportedSeriesType.JsonValue.Ohlc,
                        id: DefaultId.LitIvemIdPriceSeries,
                        tooltip: {
                            valueDecimals: 2
                        },
                        name: 'Price',
                        yAxis: DefaultId.LitIvemIdPriceYAxis,
                    },
                    {
                        type: SupportedSeriesType.JsonValue.Column,
                        id: DefaultId.LitIvemIdVolumeSeries,
                        yAxis: DefaultId.LitIvemIdVolumeYAxis,
                    }
                ],
                yAxis: [
                    {
                        id: DefaultId.LitIvemIdPriceYAxis,
                        height: '80%',
                        resize: {
                            enabled: true
                        },
                    },
                    {
                        id: DefaultId.LitIvemIdVolumeYAxis,
                        top: '80%',
                        height: '20%',
                        offset: 0,
                    }
                ],
                time: {
                    useUTC: false
                },
                stockTools: {
                    gui: {
                        enabled: true,
                    }
                },
            },
            seriesArray: [{
                    id: DefaultId.LitIvemIdPriceSeries,
                    typeId: EngineSeries.Type.JsonValue.LitIvemIdOhlc,
                    parameterIndex: 0,
                    hideYAxisIfUnused: false,
                },
                {
                    id: DefaultId.LitIvemIdVolumeSeries,
                    typeId: EngineSeries.Type.JsonValue.LitIvemIdVolume,
                    parameterIndex: 0,
                    hideYAxisIfUnused: true,
                }
            ],

            sequencerType: extensionSvc.historySequencerSvc.typeToJsonValue(defaultSequencerTypeId),

            intervalSequencer: defaultIntervalSequencer,
        };

        // const result: Template = {
        //     chartOptions: {
        //         credits: {
        //             enabled: false,
        //         },
        //         rangeSelector: {
        //             enabled: false,
        //         },
        //         series: [{
        //                 type: SupportedHighchartsSeriesType.JsonValue.Ohlc,
        //                 id: DefaultId.LitIvemIdPriceSeries,
        //                 yAxis: DefaultId.LitIvemIdPriceYAxis,
        //             },
        //             {
        //                 type: SupportedHighchartsSeriesType.JsonValue.Column,
        //                 id: DefaultId.LitIvemIdVolumeSeries,
        //                 yAxis: DefaultId.LitIvemIdVolumeYAxis,
        //             }
        //         ],
        //         yAxis: [{
        //                 id: DefaultId.LitIvemIdPriceYAxis,
        //                 height: '80%',
        //                 resize: {
        //                   enabled: true
        //                 }
        //             },
        //             {
        //                 id: DefaultId.LitIvemIdVolumeYAxis,
        //                 top: '80%',
        //                 height: '20%',
        //                 offset: 0
        //             }
        //         ],
        //         // stockTools: {
        //         //     gui: {
        //         //         enabled: true,
        //         //     }
        //         // },
        //     },

        //     seriesArray: [{
        //             id: DefaultId.LitIvemIdPriceSeries,
        //             typeId: HighstockChartEngineSeries.Type.JsonValue.LitIvemIdOhlc,
        //             parameterIndex: 0,
        //             hideYAxisIfUnused: false,
        //         },
        //         {
        //             id: DefaultId.LitIvemIdVolumeSeries,
        //             typeId: HighstockChartEngineSeries.Type.JsonValue.LitIvemIdVolume,
        //             parameterIndex: 0,
        //             hideYAxisIfUnused: true,
        //         }
        //     ],

        //     sequencerType: HistorySequencer.Type.idToJsonValue(defaultSequencerTypeId),

        //     intervalSequencer: defaultIntervalSequencer,
        // };

        return template;
    }
}

