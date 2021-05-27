/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionSvc, Integer, LitIvemId, LitIvemIdPriceVolumeSequenceHistory, OhlcHistorySequenceSeriesInterface } from 'motif';
import { AssertInternalError } from '../internal-error';
import { Settings } from '../settings';
import { EngineSeries } from './engine-series';
import { SupportedSeriesType, SupportedSeriesTypeId } from './supported-series-type';

export class OhlcEngineSeries extends EngineSeries {
    private _ohlcSequenceSeries: OhlcHistorySequenceSeriesInterface;
    private _optionsData: OhlcHighstockChartEngineSeries.OptionsData;

    private calculateSeriesOptionsData() {
        let highchartsOptionsData: OhlcHighstockChartEngineSeries.HighchartsOptionsData | undefined;
        switch (this.chartSeriesTypeId) {
            case SupportedSeriesTypeId.Candlestick: {
                const candlestickOptions = this.chartSeries.options as Highcharts.SeriesCandlestickOptions;
                highchartsOptionsData = candlestickOptions.data;
                break;
            }
            case SupportedSeriesTypeId.Ohlc: {
                const ohlcOptions = this.chartSeries.options as Highcharts.SeriesOhlcOptions;
                highchartsOptionsData = ohlcOptions.data;
                break;
            }
            default: {
                throw new AssertInternalError('OHCESCSODS444938827', SupportedSeriesType.idToDisplay(this.chartSeriesTypeId));
            }
        }
        if (highchartsOptionsData === undefined) {
            throw new AssertInternalError('OHCESCSODU444938827', SupportedSeriesType.idToDisplay(this.chartSeriesTypeId));
        } else {
            return highchartsOptionsData as OhlcHighstockChartEngineSeries.OptionsData;
        }
    }

    private createPoint(idx: Integer) {
        const ohlcPoint = this._ohlcSequenceSeries.getOhlcPoint(idx);
        const sequencerPoint = this._ohlcSequenceSeries.getSequencerPoint(idx);
        const timezonedDate = this._extensionSvc.sourceTzOffsetDateTimeSvc.getTimezonedDate(sequencerPoint,
            this.settings.format_DateTimeTimezoneModeId
        );
        const xValue = timezonedDate.getTime();
        let chartPoint: OhlcHighstockChartEngineSeries.Point;
        if (ohlcPoint.null) {
            chartPoint = [xValue, null, null, null, null];
        } else {
            chartPoint = [xValue,
                ohlcPoint.open,
                ohlcPoint.high,
                ohlcPoint.low,
                ohlcPoint.close
            ];
        }
        return chartPoint;
    }

    private createOptionsDataPoint(idx: Integer) {
        const ohlcPoint = this._ohlcSequenceSeries.getOhlcPoint(idx);
        const sequencerPoint = this._ohlcSequenceSeries.getSequencerPoint(idx);
        const timezonedDate = this._extensionSvc.sourceTzOffsetDateTimeSvc.getTimezonedDate(sequencerPoint,
            this.settings.format_DateTimeTimezoneModeId
        );
        const xValue = timezonedDate.getTime();
        let optionsDataPoint: OhlcHighstockChartEngineSeries.OptionsDataPoint;
        if (ohlcPoint.null) {
            optionsDataPoint = [xValue, null, null, null, null];
        } else {
            optionsDataPoint = [xValue,
                ohlcPoint.open,
                ohlcPoint.high,
                ohlcPoint.low,
                ohlcPoint.close
            ];
        }
        return optionsDataPoint;
    }

    protected insertPoint(idx: Integer) {
        const oldOptionsDataCount = this._optionsData.length;
        if (idx === oldOptionsDataCount) {
            const chartPoint = this.createPoint(idx);
            this.chartSeries.addPoint(chartPoint, false, false, false, false);
        } else {
            // Simulate insert by overwriting idx and subsequent existing points and then add last point
            for (let i = idx; i < oldOptionsDataCount; i++) {
                if (this.chartSeries.data[i] !== undefined && this.chartSeries.data[i] !== null) {
                    const chartPoint = this.createPoint(i);
                    this.chartSeries.data[i].update(chartPoint, false, false);
                } else {
                    this._optionsData[i] = this.createOptionsDataPoint(i);
                }
            }
            const finalChartPoint = this.createPoint(oldOptionsDataCount);
            this.chartSeries.addPoint(finalChartPoint, false, false, false, false);
        }
        this.notifyPointsChangedEvent();
    }

    protected insertPoints(idx: Integer, count: Integer) {
        // update existing
        const oldOptionsDataCount = this._optionsData.length;
        for (let i = idx; i < oldOptionsDataCount; i++) {
            if (this.chartSeries.data[i] !== undefined && this.chartSeries.data[i] !== null) {
                const chartPoint = this.createPoint(i);
                this.chartSeries.data[i].update(chartPoint, false, false);
            } else {
                this._optionsData[i] = this.createOptionsDataPoint(i);
            }
        }
        // add extra
        const newCount = this._ohlcSequenceSeries.pointCount;
        for (let i = oldOptionsDataCount; i < newCount; i++) {
            const chartPoint = this.createPoint(i);
            this.chartSeries.addPoint(chartPoint, false, false, false, false);
        }
        this.notifyPointsChangedEvent();
    }

    protected updatePoint(idx: Integer) {
        if (this.chartSeries.data[idx] !== undefined && this.chartSeries.data[idx] !== null) {
            const chartPoint = this.createPoint(idx);
            this.chartSeries.data[idx].update(chartPoint, false, false);
        } else {
            this._optionsData[idx] = this.createOptionsDataPoint(idx);
        }

        this.notifyPointsChangedEvent();
    }

    constructor(
        private readonly _extensionSvc: ExtensionSvc,
        settings: Settings,
        seriesTypeId: EngineSeries.TypeId,
        parameterIndex: Integer | undefined,
        litIvemId: LitIvemId,
        chartSeries: Highcharts.Series,
        chartSeriesTypeId: SupportedSeriesTypeId,
    ) {
        super(settings, seriesTypeId, parameterIndex, litIvemId, chartSeries, chartSeriesTypeId);
    }

    activate(history: LitIvemIdPriceVolumeSequenceHistory, series: OhlcHistorySequenceSeriesInterface) {
        super.activate(history, series);
        this._ohlcSequenceSeries = series;
    }

    initialiseSequenceSeriesWithNullPoints() {
        this._ohlcSequenceSeries.initialiseWithNullPoints();
    }

    loadAllChartPoints() {
        const count = this._ohlcSequenceSeries.pointCount;
        const data = new Array<OhlcHighstockChartEngineSeries.Point>(count);
        for (let i = 0; i < count; i++) {
            data[i] = this.createPoint(i);
        }
        this.chartSeries.setData(data, false, false, false);
        this._optionsData = this.calculateSeriesOptionsData();
        this.notifyPointsChangedEvent();
    }
}

export namespace OhlcHighstockChartEngineSeries {
    export type Point = [number, number | null, number | null, number | null, number | null];
    export type OptionsDataPoint = [number, number | null, number | null, number | null, number | null];
    export type OptionsData = Array<OptionsDataPoint>;
    export type HighchartsOptionsData =
        Array<([(number|string), number, number, number]|[(number|string), number, number, number, number]|Highcharts.PointOptionsObject)>;
}
