/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { HistorySequenceSeries, Integer, LitIvemId, LitIvemIdPriceVolumeSequenceHistory, MultiEvent } from 'motif';
import { AssertInternalError, EnumInfoOutOfOrderError } from '../internal-error';
import { Settings } from '../settings';
import { SupportedSeriesTypeId } from './supported-series-type';

export abstract class EngineSeries {

    private _history: LitIvemIdPriceVolumeSequenceHistory;
    private _sequenceSeries: HistorySequenceSeries | undefined;

    private _pointInsertedSubscriptionId: MultiEvent.SubscriptionId;
    private _pointUpdatedSubscriptionId: MultiEvent.SubscriptionId;
    private _emptyPointsInsertedSubscriptionId: MultiEvent.SubscriptionId;

    pointsChangedEvent: EngineSeries.PointsChangedEvent;

    protected get settings() { return this._settings; }

    get typeId() { return this._typeId; }
    get parameterIndex() { return this._parameterIndex; }
    get litIvemId() { return this._litIvemId; }
    get chartSeries() { return this._chartSeries; }
    get chartSeriesTypeId() { return this._chartSeriesTypeId; }
    get history() { return this._history; }

    private handlePointInsertedEvent(idx: Integer) {
        this.insertPoint(idx);
    }

    private handlePointsInsertedEvent(idx: Integer, count: Integer) {
        this.insertPoints(idx, count);
    }

    private handlePointUpdatedEvent(idx: Integer) {
        this.updatePoint(idx);
    }

    private subscribeSeriesEvents() {
        if (this._sequenceSeries === undefined) {
            throw new AssertInternalError('HCESSSE339944583');
        } else {
            this._pointInsertedSubscriptionId = this._sequenceSeries.subscribePointInsertedEvent(
                (idx) => this.handlePointInsertedEvent(idx)
            );
            this._pointUpdatedSubscriptionId = this._sequenceSeries.subscribePointUpdatedEvent(
                (idx) => this.handlePointUpdatedEvent(idx)
            );
            this._emptyPointsInsertedSubscriptionId = this._sequenceSeries.subscribePointsInsertedEvent(
                (idx, count) => this.handlePointsInsertedEvent(idx, count)
            );
        }
    }

    private checkDeactivate() {
        if (this._sequenceSeries !== undefined) {
            this._sequenceSeries.unsubscribePointInsertedEvent(this._pointInsertedSubscriptionId);
            this._pointInsertedSubscriptionId = undefined;
            this._sequenceSeries.unsubscribePointUpdatedEvent(this._pointUpdatedSubscriptionId);
            this._pointUpdatedSubscriptionId = undefined;
            this._sequenceSeries.unsubscribePointsInsertedEvent(this._emptyPointsInsertedSubscriptionId);
            this._emptyPointsInsertedSubscriptionId = undefined;

            const seriesTypeId = EngineSeries.Type.idToLitIvemIdPriceVolumeHistorySeriesTypeId(this._typeId);
            this._history.deregisterSeries(this._sequenceSeries, seriesTypeId);

            this._sequenceSeries.finalise();

            this._sequenceSeries = undefined;
        }
    }

    protected abstract insertPoint(idx: Integer): void;
    protected abstract insertPoints(idx: Integer, count: Integer): void;
    protected abstract updatePoint(idx: Integer): void;

    protected notifyPointsChangedEvent() {
        this.pointsChangedEvent();
    }

    constructor(
        private readonly _settings: Settings,
        private _typeId: EngineSeries.TypeId,
        private _parameterIndex: Integer | undefined,
        private _litIvemId: LitIvemId,
        private _chartSeries: Highcharts.Series,
        private _chartSeriesTypeId: SupportedSeriesTypeId,
    ) { }

    finalise() {
        this.checkDeactivate();
    }

    deactivate() {
        this.checkDeactivate();
    }

    activate(history: LitIvemIdPriceVolumeSequenceHistory, series: HistorySequenceSeries) {
        this.checkDeactivate();
        this._sequenceSeries = series;
        this._history = history;
        const seriesTypeId = EngineSeries.Type.idToLitIvemIdPriceVolumeHistorySeriesTypeId(this._typeId);
        this._history.registerSeries(series, seriesTypeId);
        this.subscribeSeriesEvents();
    }

    abstract initialiseSequenceSeriesWithNullPoints(): void;
    abstract loadAllChartPoints(): void;
}

export namespace EngineSeries {
    export const enum TypeId {
        LitIvemIdOhlc,
        LitIvemIdClose,
        LitIvemIdLast,
        LitIvemIdVolume,
    }

    export type PointsChangedEvent = (this: void) => void;

    export namespace Type {
        export const enum JsonValue {
            LitIvemIdOhlc = 'litIvemIdOhlc',
            LitIvemIdClose = 'litIvemIdClose',
            LitIvemIdLast = 'litIvemIdLast',
            LitIvemIdVolume = 'litIvemIdVolume',
        }

        interface Info {
            readonly id: TypeId;
            readonly jsonValue: JsonValue;
            readonly supportedHighchartsSeriesTypeIds: readonly SupportedSeriesTypeId[];
            readonly litIvemIdPriceVolumeSequenceHistorySeriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesType;
        }

        type InfosObject = { [id in keyof typeof TypeId]: Info };

        const infosObject: InfosObject = {
            LitIvemIdOhlc: {
                id: TypeId.LitIvemIdOhlc,
                jsonValue: JsonValue.LitIvemIdOhlc,
                supportedHighchartsSeriesTypeIds: [SupportedSeriesTypeId.Candlestick, SupportedSeriesTypeId.Ohlc],
                litIvemIdPriceVolumeSequenceHistorySeriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesTypeEnum.Price,
            },
            LitIvemIdClose: {
                id: TypeId.LitIvemIdClose,
                jsonValue: JsonValue.LitIvemIdClose,
                supportedHighchartsSeriesTypeIds: [SupportedSeriesTypeId.Line],
                litIvemIdPriceVolumeSequenceHistorySeriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesTypeEnum.Price,
            },
            LitIvemIdLast: {
                id: TypeId.LitIvemIdLast,
                jsonValue: JsonValue.LitIvemIdLast,
                supportedHighchartsSeriesTypeIds: [SupportedSeriesTypeId.Line],
                litIvemIdPriceVolumeSequenceHistorySeriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesTypeEnum.Price,
            },
            LitIvemIdVolume: {
                id: TypeId.LitIvemIdVolume,
                jsonValue: JsonValue.LitIvemIdVolume,
                supportedHighchartsSeriesTypeIds: [SupportedSeriesTypeId.Column],
                litIvemIdPriceVolumeSequenceHistorySeriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesTypeEnum.Volume,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info, id) => info.id !== id);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('HighstockChartEngineSeries.TypeId', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function idToJsonValue(id: TypeId) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: JsonValue) {
            const index = infos.findIndex(info => info.jsonValue === value);
            return index >= 0 ? infos[index].id : undefined;
        }

        export function idToSupportedHighchartsSeriesTypeIds(id: TypeId) {
            return infos[id].supportedHighchartsSeriesTypeIds;
        }

        export function idToLitIvemIdPriceVolumeHistorySeriesTypeId(id: TypeId) {
            return infos[id].litIvemIdPriceVolumeSequenceHistorySeriesType;
        }
    }
}

export namespace HighstockChartEngineSeriesModule {
    export function initialiseStatic() {
        EngineSeries.Type.initialise();
    }
}
