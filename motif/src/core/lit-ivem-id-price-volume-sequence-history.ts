/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    ChartHistoryDataItem,
    ChartInterval,
    ChartIntervalId,
    DayTradesDataDefinition,
    DayTradesDataItem,
    ExchangeId,
    IvemClassId,
    LitIvemId,
    MarketId,
    MarketSubscriptionDataItem,
    QueryChartHistoryDataDefinition,
    SearchSymbolsDataDefinition,
    SecurityDataDefinition,
    SecurityDataItem,
    SymbolsDataItem,
    TradeAffectsId,
    TradesDataItem
} from 'src/adi/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError,
    Badness,
    compareInteger,
    CorrectnessId,
    EnumInfoOutOfOrderError,
    Integer,
    isDateEqual,
    Logger,
    MultiEvent,
    newNowDate,
    newNullDate,
    newUndefinableDate,
    SourceTzOffsetDateTime,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { HistorySequenceSeries } from './history-sequence-series';
import { HistorySequencer } from './history-sequencer';
import { IntervalHistorySequencer } from './interval-history-sequencer';
import { SequenceHistory } from './sequence-history';
import { SymbolsService } from './symbols-service';

export class LitIvemIdPriceVolumeSequenceHistory extends SequenceHistory {
    historyAmount: Integer | undefined;
    fromDateTime: Date | undefined; // make sure UTC
    toDateTime: Date | undefined; // make sure UTC

    intradayPriceHistoryEnabled = true;
    priceDeviantTradesIgnored = true;
    minTradeTime: Date | undefined;
    maxTradeTime: Date | undefined;

    private _active = false;

    private _sequencer: HistorySequencer | undefined;
    private _priceSeriesArray: HistorySequenceSeries[] = [];
    private _volumeSeriesArray: HistorySequenceSeries[] = [];

    private _symbolsDataItem: SymbolsDataItem | undefined;
    private _isIndex: boolean;

    private _exchangeId: ExchangeId;
    private _ivemClassId: IvemClassId;
    private _tradingMarketIds: MarketId[];
    private _name: string;

    private _resourcing: LitIvemIdPriceVolumeSequenceHistory.Resourcing;
    private _resourceTickDateTimeRepeatCountArray: LitIvemIdPriceVolumeSequenceHistory.ResourceTickDateTimeRepeatCountArray = [];

    private _tradesDataItem: DayTradesDataItem | undefined;
    private _tradesDataItemLastDateTime: Date;
    private _tradesDataItemLastDateTimeRepeatCount: Integer;
    private _nextLatestTradeRecordIndex = 0;

    private _chartHistoryDataItem: ChartHistoryDataItem | undefined;

    private _securityDataItem: SecurityDataItem | undefined;

    private _lastMarketTimeSourceTimezoneOffset: Integer | undefined;
    private _resortedToUtcOffsetLogged = false;

    private _hasVolume: boolean;

    private _nullSourceTzOffsetDateTime: SourceTzOffsetDateTime = {
        utcDate: newNullDate(),
        offset: 0,
    };

    private _symbolDataItemDataCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _chartHistoryDataItemBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _tradesDataItemBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _tradesDataItemListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _tradesDataItemRecordChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _securityDataItemBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _securityDataItemFieldValuesChangedSubscriptionId: MultiEvent.SubscriptionId;

    get active() { return this._active; }
    get litIvemId() { return this._litIvemId; }

    get hasVolume() { return this._hasVolume; }

    get exchangeId() { return this._exchangeId; }
    get ivemClassId() { return this._ivemClassId; }
    get tradingMarketIds() { return this._tradingMarketIds; }
    get name() { return this._name; }

    constructor(private _symbolsManager: SymbolsService, private _adi: AdiService, private _litIvemId: LitIvemId) {
        super();
    }

    finalise() {
        this.setSequencer(undefined);
        this.deactivate();
    }

    activate(litIvemId: LitIvemId) {
        this.deactivate();
        this.requireSeriesLoading();
        this._litIvemId = litIvemId;
        this.activateSymbols();
        this._active = true;
    }

    deactivate() {
        this._active = false;
        this.deactivateSymbols();
        this.deactivateChartHistory();
        this.deactivateTrades();
        this.deactivateSecurity();
    }

    clearAllSeries() {

        this.requireSeriesLoading();
    }

    loadAllTickDateTimes() {
        const resourceIds = this._resourcing.ids;
        const resourceIdCount = resourceIds.length;
        this._resourceTickDateTimeRepeatCountArray.length = resourceIdCount;

        const sequencer = this._sequencer;
        if (sequencer === undefined) {
            throw new AssertInternalError('LIIPVSHLAS877743298');
        } else {
            sequencer.beginChange();
            try {
                for (let i = 0; i < resourceIdCount; i++) {
                    const resourceId = resourceIds[i];
                    switch (resourceId) {
                        case LitIvemIdPriceVolumeSequenceHistory.ResourceId.ChartHistory:
                            this._resourceTickDateTimeRepeatCountArray[i] = this.loadAllChartHistoryTickDateTimes();
                            break;
                        case LitIvemIdPriceVolumeSequenceHistory.ResourceId.Trades:
                            this._resourceTickDateTimeRepeatCountArray[i] = this.loadAllTradesTickDateTimes();
                            break;
                        case LitIvemIdPriceVolumeSequenceHistory.ResourceId.Security:
                            this._resourceTickDateTimeRepeatCountArray[i] = this.loadAllSecurityTickDateTimes();
                            break;
                        default:
                            throw new UnreachableCaseError('LIIPVSHLATDTU988877443', resourceId);
                    }
                }
            } finally {
                sequencer.endChange();
            }
        }
    }

    override loadAllEngineSeries() {
        const resourceIds = this._resourcing.ids;
        const resourceIdCount = resourceIds.length;

        const nowDateTime = newNowDate();

        const sequencer = this._sequencer;
        if (sequencer === undefined) {
            throw new AssertInternalError('LIIPVSHLAS877743298');
        } else {
            sequencer.beginChange();
            try {
                for (let i = 0; i < resourceIdCount; i++) {
                    const resourceId = resourceIds[i];
                    switch (resourceId) {
                        case LitIvemIdPriceVolumeSequenceHistory.ResourceId.ChartHistory:
                            this.loadAllSeriesFromChartHistory(this._resourceTickDateTimeRepeatCountArray[i]);
                            break;
                        case LitIvemIdPriceVolumeSequenceHistory.ResourceId.Trades:
                            this.loadAllSeriesWithAllTrades(this._resourceTickDateTimeRepeatCountArray[i]);
                            break;
                        case LitIvemIdPriceVolumeSequenceHistory.ResourceId.Security:
                            this.loadAllSeriesFromSecurity(nowDateTime, this._resourceTickDateTimeRepeatCountArray[i]);
                            break;
                        default:
                            throw new UnreachableCaseError('LIIPVSHLATDTU988877443', resourceId);
                    }
                }

                super.loadAllEngineSeries();
            } finally {
                sequencer.endChange();
            }
        }
    }

    setSequencer(sequencer: HistorySequencer | undefined) {
        if (this._sequencer !== undefined) {
            this._sequencer.deregisterHistory(this);
        }

        this._sequencer = sequencer;

        if (this._sequencer !== undefined) {
            this._sequencer.beginHistoriesChange();
            try {
                this._sequencer.registerHistory(this);
                this.requireSeriesLoading();
            } finally {
                this._sequencer.endHistoriesChange();
            }
        }
    }

    registerSeries(series: HistorySequenceSeries, typeId: LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId) {
        switch (typeId) {
            case LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Price:
                this.registerPriceSeries(series);
                break;
            case LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Volume:
                this.registerVolumeSeries(series);
                break;
            default:
                throw new UnreachableCaseError('LIIPVSHRSD1134948883', typeId);
        }
    }

    deregisterSeries(series: HistorySequenceSeries, typeId: LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId) {
        switch (typeId) {
            case LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Price:
                this.deregisterPriceSeries(series);
                break;
            case LitIvemIdPriceVolumeSequenceHistory.SeriesTypeId.Volume:
                this.deregisterVolumeSeries(series);
                break;
            default:
                throw new UnreachableCaseError('LIIPVSHDSD1134948883', typeId);
        }
    }

    protected override processUsableChanged() {
        if (!this.usable) {
            // If something goes wrong, reload from scratch.  Need to do this because ChartHistory may have changed
            this.deactivate();
            this.activate(this._litIvemId);
        }
        super.processUsableChanged();
    }

    private handleSymbolDataItemBadnessChangeEvent() {
        if (this._symbolsDataItem === undefined) {
            throw new AssertInternalError('LIIPVSH13138853');
        } else {
            if (!this._symbolsDataItem.usable) {
                this.setUnusable(this._symbolsDataItem.badness);
            } else {
                const badness: Badness = {
                    reasonId: Badness.ReasonId.SymbolOkWaitingForData,
                    reasonExtra: this._symbolsManager.litIvemIdToDisplay(this._litIvemId),
                };
                this.setUnusable(badness);
                this.processSymbolsDataItemBecameGood(this._symbolsDataItem);
            }
        }
    }

    private handleChartHistoryDataItemBadnessChangeEvent() {
        this.updateResourcingBadness();
    }

    private handleTradesDataItemBadnessChangeEvent() {
        this.updateResourcingBadness();
    }

    private handleSecurityDataItemBadnessChangeEvent() {
        this.updateResourcingBadness();
    }

    private handleTradesDataItemListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.allSeriesLoaded) {
            switch (listChangeTypeId) {
                case UsableListChangeTypeId.Insert:
                    this.loadSeriesWithInsertedTrades(index, count);
                    break;
                case UsableListChangeTypeId.Remove:
                case UsableListChangeTypeId.Clear:
                    this.requireSeriesLoading();
                    break;
            }
        }
    }

    private handleTradesDataItemRecordChangeEvent(Idx: Integer) {
        if (this.allSeriesLoaded) {
            this.requireSeriesLoading();
        }
    }

    private handleSecurityDataItemValuesChangeEvent(valueChanges: SecurityDataItem.ValueChange[]) {
        if (this.allSeriesLoaded) {
            this.loadSeriesFromModifiedSecurityFields(valueChanges);
        }
    }

    private registerPriceSeries(series: HistorySequenceSeries) {
        this._priceSeriesArray.push(series);
        this.requireSeriesLoading();
    }

    private deregisterPriceSeries(series: HistorySequenceSeries) {
        const idx = this._priceSeriesArray.indexOf(series);
        if (idx < 0) {
            throw new AssertInternalError('LIIPVSHDPS65593111');
        } else {
            this._priceSeriesArray.splice(idx, 1);
        }
    }

    private registerVolumeSeries(series: HistorySequenceSeries) {
        this._volumeSeriesArray.push(series);
        this.requireSeriesLoading();
    }

    private deregisterVolumeSeries(series: HistorySequenceSeries) {
        const idx = this._volumeSeriesArray.indexOf(series);
        if (idx < 0) {
            throw new AssertInternalError('LIIPVSHDVS65593111');
        } else {
            this._volumeSeriesArray.splice(idx, 1);
        }
    }

    private activateSymbols() {
        const definition = new SearchSymbolsDataDefinition();
        definition.searchText = this.litIvemId.code;
        definition.showFull = true;
        definition.marketIds = [this.litIvemId.litId];
        definition.fieldIds = [SearchSymbolsDataDefinition.FieldId.Code];
        definition.isPartial = false;
        definition.isCaseSensitive = false;
        definition.preferExact = true;
        definition.count = 2; // 2 or more then no good
        this._symbolsDataItem = this._adi.subscribe(definition) as SymbolsDataItem;
        if (this._symbolsDataItem.usable) {
            this.processSymbolsDataItemBecameGood(this._symbolsDataItem);
        } else {
            this._symbolDataItemDataCorrectnessChangeSubscriptionId =
                this._symbolsDataItem.subscribeBadnessChangeEvent(
                    () => this.handleSymbolDataItemBadnessChangeEvent()
                );
        }
    }

    private deactivateSymbols() {
        if (this._symbolsDataItem !== undefined) {
            this._symbolsDataItem.unsubscribeCorrectnessChangeEvent(this._symbolDataItemDataCorrectnessChangeSubscriptionId);
            this._symbolDataItemDataCorrectnessChangeSubscriptionId = undefined;
            this._adi.unsubscribe(this._symbolsDataItem);
            this._symbolsDataItem = undefined;
        }
    }

    private processSymbolsDataItemBecameGood(symbolsDataItem: SymbolsDataItem) {
        const recordCount = symbolsDataItem.records.length;
        if (recordCount === 0) {
            const badness: Badness = {
                reasonId: Badness.ReasonId.SymbolMatching_None,
                reasonExtra: this._symbolsManager.litIvemIdToDisplay(this._litIvemId),
            };
            this.setUnusable(badness);
        } else {
            if (recordCount > 1) {
                const badness: Badness = {
                    reasonId: Badness.ReasonId.SymbolMatching_Ambiguous,
                    reasonExtra: this._symbolsManager.litIvemIdToDisplay(this._litIvemId),
                };
                this.setUnusable(badness);
            } else {
                const record = symbolsDataItem.records[0];
                this._isIndex = record.isIndex !== undefined ? record.isIndex : false;
                this._exchangeId = record.exchangeId;
                this._ivemClassId = record.ivemClassId;
                this._tradingMarketIds = record.tradingMarketIds;
                this._name = record.name;

                this._hasVolume = !this._isIndex;

                this.activateHistory();
            }
        }
        this.deactivateSymbols();
    }

    private millisecondsToHighestChartHistoryIntervalId(seconds: Integer) {
        if (seconds <= 0) {
            return undefined;
        } else {
            interface Interval {
                id: ChartIntervalId;
                milliseconds: Integer;
            }
            const intervalCount = ChartInterval.idCount;
            const intervals = new Array<Interval>(intervalCount);

            for (let id = 0; id < ChartInterval.idCount; id++) {
                const interval: Interval = {
                    id,
                    milliseconds: ChartInterval.idToMilliseconds(id)
                };
                intervals[id] = interval;
            }

            // sort intervals making highest seconds first
            intervals.sort((left, right) => compareInteger(right.milliseconds, left.milliseconds));

            for (let i = 0; i < intervalCount; i++) {
                const interval = intervals[i];
                if (seconds % interval.milliseconds === 0) {
                    return interval.id;
                }
            }
            return undefined;
        }
    }

    private calculateResourcing(): LitIvemIdPriceVolumeSequenceHistory.Resourcing {
        const sequencer = this._sequencer;
        if (sequencer === undefined) {
            throw new AssertInternalError('LIIPVSHCR9997342177');
        } else {
            const sequencerTypeId = sequencer.typeId;
            switch (sequencerTypeId) {
                case HistorySequencer.TypeId.RepeatableExact:
                    return {
                        ids: [LitIvemIdPriceVolumeSequenceHistory.ResourceId.Trades],
                        chartHistoryIntervalId: undefined
                    };
                case HistorySequencer.TypeId.Interval:
                    if (!(sequencer instanceof IntervalHistorySequencer)) {
                        throw new AssertInternalError('LIIPVH539188423');
                    } else {
                        const unitId = sequencer.unitId;
                        const unitCount = sequencer.unitCount;
                        switch (unitId) {
                            case IntervalHistorySequencer.UnitId.Millisecond:
                                const chartHistoryIntervalId = this.millisecondsToHighestChartHistoryIntervalId(unitCount);
                                if (chartHistoryIntervalId !== undefined) {
                                    return {
                                        // ChartHistory disabled while not supported on server. Enable when working on server
                                        ids: [ // LitIvemIdPriceVolumeSequenceHistory.ResourceId.ChartHistory,
                                            LitIvemIdPriceVolumeSequenceHistory.ResourceId.Trades
                                        ],
                                        chartHistoryIntervalId,
                                    };
                                } else {
                                    return {
                                        ids: [LitIvemIdPriceVolumeSequenceHistory.ResourceId.Trades],
                                        chartHistoryIntervalId: undefined
                                    };
                                }
                            case IntervalHistorySequencer.UnitId.Day:
                                if (unitCount === 1) {
                                    return {
                                        ids: [LitIvemIdPriceVolumeSequenceHistory.ResourceId.ChartHistory,
                                            LitIvemIdPriceVolumeSequenceHistory.ResourceId.Security
                                        ],
                                        chartHistoryIntervalId: ChartIntervalId.OneDay
                                    };
                                } else {
                                    return {
                                        ids: [LitIvemIdPriceVolumeSequenceHistory.ResourceId.ChartHistory],
                                        chartHistoryIntervalId: ChartIntervalId.OneDay
                                    };
                                }
                            case IntervalHistorySequencer.UnitId.Week:
                            case IntervalHistorySequencer.UnitId.Month:
                            case IntervalHistorySequencer.UnitId.Year:
                                return {
                                    ids: [LitIvemIdPriceVolumeSequenceHistory.ResourceId.ChartHistory],
                                    chartHistoryIntervalId: ChartIntervalId.OneDay
                                };
                        default:
                            throw new UnreachableCaseError('LIIPVH5450382777789', unitId);
                        }
                    }
                default:
                    throw new UnreachableCaseError('LIIPVH11943773324', sequencerTypeId);
            }
        }
    }

    private activateHistory() {
        const resourcing = this.calculateResourcing();
        this._resourcing = resourcing;
        const resourceIds = resourcing.ids;
        for (let i = 0; i < resourceIds.length; i++ ) {
            const resourceId = resourceIds[i];
            switch (resourceId) {
                case LitIvemIdPriceVolumeSequenceHistory.ResourceId.ChartHistory:
                    const chartHistoryIntervalId = resourcing.chartHistoryIntervalId;
                    if (chartHistoryIntervalId === undefined) {
                        throw new AssertInternalError('LIIPVH99874434');
                    } else {
                        this.activateChartHistory(chartHistoryIntervalId);
                    }
                    break;
                case LitIvemIdPriceVolumeSequenceHistory.ResourceId.Trades:
                    this.activateTrades();
                    break;
                case LitIvemIdPriceVolumeSequenceHistory.ResourceId.Security:
                    this.activateSecurity();
                    break;
                default:
                    throw new UnreachableCaseError('LIIPVH87445302992', resourceId);
            }
        }

        this.updateResourcingBadness();
    }

    private activateChartHistory(chartIntervalId: ChartIntervalId) {
        const definition = new QueryChartHistoryDataDefinition();
        definition.count = this.historyAmount;
        definition.litIvemId = this.litIvemId;
        definition.intervalId = chartIntervalId;
        definition.fromDate = newUndefinableDate(this.fromDateTime);
        definition.toDate = newUndefinableDate(this.toDateTime);
        this._chartHistoryDataItem = this._adi.subscribe(definition) as ChartHistoryDataItem;

        this._chartHistoryDataItemBadnessChangeSubscriptionId = this._chartHistoryDataItem.subscribeBadnessChangeEvent(
            () => this.handleChartHistoryDataItemBadnessChangeEvent()
        );
    }

    private deactivateChartHistory() {
        if (this._chartHistoryDataItem !== undefined) {
            this._chartHistoryDataItem.unsubscribeBadnessChangeEvent(
                this._chartHistoryDataItemBadnessChangeSubscriptionId
            );
            this._chartHistoryDataItemBadnessChangeSubscriptionId = undefined;

            this._adi.unsubscribe(this._chartHistoryDataItem);
            this._chartHistoryDataItem = undefined;
        }
    }

    private activateTrades() {
        const definition = new DayTradesDataDefinition();
        definition.litIvemId = this.litIvemId;
        const tradesDataItem = this._adi.subscribe(definition) as DayTradesDataItem;
        this._tradesDataItem = tradesDataItem;

        this._tradesDataItemBadnessChangeSubscriptionId = tradesDataItem.subscribeBadnessChangeEvent(
            () => this.handleTradesDataItemBadnessChangeEvent()
        );
        this._tradesDataItemListChangeSubscriptionId =
            tradesDataItem.subscribeListChangeEvent(
                (listChangeTypeId, index, count) => this.handleTradesDataItemListChangeEvent(listChangeTypeId, index, count)
            );
        this._tradesDataItemRecordChangeSubscriptionId = tradesDataItem.subscribeRecordChangeEvent(
            (index) => this.handleTradesDataItemRecordChangeEvent(index)
        );
    }

    private deactivateTrades() {
        if (this._tradesDataItem !== undefined) {
            this._tradesDataItem.unsubscribeBadnessChangeEvent(this._tradesDataItemBadnessChangeSubscriptionId);
            this._tradesDataItemBadnessChangeSubscriptionId = undefined;
            this._tradesDataItem.unsubscribeListChangeEvent(this._tradesDataItemListChangeSubscriptionId);
            this._tradesDataItemListChangeSubscriptionId = undefined;
            this._tradesDataItem.unsubscribeRecordChangeEvent(this._tradesDataItemRecordChangeSubscriptionId);
            this._tradesDataItemRecordChangeSubscriptionId = undefined;

            this._adi.unsubscribe(this._tradesDataItem);
            this._tradesDataItem = undefined;
        }
    }

    private activateSecurity() {
        const definition = new SecurityDataDefinition();
        definition.litIvemId = this.litIvemId;
        this._securityDataItem = this._adi.subscribe(definition) as SecurityDataItem;

        this._securityDataItemBadnessChangeSubscriptionId = this._securityDataItem.subscribeBadnessChangeEvent(
            () => this.handleSecurityDataItemBadnessChangeEvent()
        );
        this._securityDataItemFieldValuesChangedSubscriptionId = this._securityDataItem.subscribeFieldValuesChangedEvent(
            (valueChanges) => this.handleSecurityDataItemValuesChangeEvent(valueChanges)
        );
    }

    private deactivateSecurity() {
        if (this._securityDataItem !== undefined) {
            this._securityDataItem.unsubscribeBadnessChangeEvent(this._securityDataItemBadnessChangeSubscriptionId);
            this._securityDataItemBadnessChangeSubscriptionId = undefined;
            this._securityDataItem.unsubscribeFieldValuesChangedEvent(this._securityDataItemFieldValuesChangedSubscriptionId);
            this._securityDataItemFieldValuesChangedSubscriptionId = undefined;

            this._adi.unsubscribe(this._securityDataItem);
            this._securityDataItem = undefined;
        }
    }

    private createSingleResourceBadness(resourceBadness: LitIvemIdPriceVolumeSequenceHistory.ResourceIdBadness) {
        const onlyBadness = resourceBadness.badness;
        const resourceDisplay = LitIvemIdPriceVolumeSequenceHistory.Resource.idToDisplay(resourceBadness.resourceId);
        const result: Badness = {
            reasonId: onlyBadness.reasonId,
            reasonExtra: `${resourceDisplay}: ${onlyBadness.reasonExtra}`,
        };
        return result;
    }

    private createNotGoodCompositeResourceBadness(resourceBadnessArray: LitIvemIdPriceVolumeSequenceHistory.ResourceIdBadness[]) {
        let correctnessId = CorrectnessId.Usable;
        let extra = '';
        for (let i = 0; i < resourceBadnessArray.length; i++) {
            if (i > 0) {
                extra += ', ';
            }
            const resourceBadness = resourceBadnessArray[i];
            const resourceDisplay = LitIvemIdPriceVolumeSequenceHistory.Resource.idToDisplay(resourceBadness.resourceId);
            const badness = resourceBadness.badness;
            const reasonId = badness.reasonId;
            const reasonExtra = badness.reasonExtra;
            const reasonIdDisplay = Badness.Reason.idToDisplay(reasonId);
            extra += `${i}) ${resourceDisplay}: "${reasonIdDisplay} [${reasonExtra}]"`;

            const badnessCorrectnessId = Badness.Reason.idToCorrectnessId(reasonId);
            switch (badnessCorrectnessId) {
                case CorrectnessId.Suspect:
                    if (correctnessId !== CorrectnessId.Error) {
                        correctnessId = CorrectnessId.Suspect;
                    }
                    break;
                case CorrectnessId.Error:
                    correctnessId = CorrectnessId.Error;
                    break;
            }
        }

        let result: Badness;

        switch (correctnessId) {
            case CorrectnessId.Usable:
                result = {
                    reasonId: Badness.ReasonId.ResourceWarnings,
                    reasonExtra: extra,
                };
                break;
            case CorrectnessId.Suspect:
                result = {
                    reasonId: Badness.ReasonId.DataRetrieving,
                    reasonExtra: extra,
                };
                break;
            case CorrectnessId.Error:
                result = {
                    reasonId: Badness.ReasonId.ResourceErrors,
                    reasonExtra: extra,
                };
                break;
            default:
                throw new UnreachableCaseError('LIIPVSHCNGCRB5555832', correctnessId);
        }

        return result;
    }

    private updateResourcingBadness() {
        const resourceIds = this._resourcing.ids;
        const resourceIdCount = resourceIds.length;
        const notGoodResourceIdBadnessArray = new Array<LitIvemIdPriceVolumeSequenceHistory.ResourceIdBadness>(resourceIdCount);
        let notGoodCount = 0;
        for (const resourceId of resourceIds) {
            let notGoodResourceBadness: Badness | undefined;
            switch (resourceId) {
                case LitIvemIdPriceVolumeSequenceHistory.ResourceId.ChartHistory:
                    if (this._chartHistoryDataItem === undefined) {
                        throw new AssertInternalError('LIIPVSHURBC16632277422');
                    } else {
                        if (!this._chartHistoryDataItem.good) {
                            notGoodResourceBadness = this._chartHistoryDataItem.badness;
                        }
                    }
                    break;
                case LitIvemIdPriceVolumeSequenceHistory.ResourceId.Trades:
                    if (this._tradesDataItem === undefined) {
                        throw new AssertInternalError('LIIPVSHURBT16632277422');
                    } else {
                        if (!this._tradesDataItem.good) {
                            notGoodResourceBadness = this._tradesDataItem.badness;
                        }
                    }
                    break;
                case LitIvemIdPriceVolumeSequenceHistory.ResourceId.Security:
                    if (this._securityDataItem === undefined) {
                        throw new AssertInternalError('LIIPVSHURBS16632277422');
                    } else {
                        if (!this._securityDataItem.usable) {
                            notGoodResourceBadness = this._securityDataItem.badness;
                        }
                    }
                    break;
                default:
                    throw new UnreachableCaseError('LIIPVSHURBD87774343', resourceId);
            }

            if (notGoodResourceBadness !== undefined) {
                const notGoodResourceIdBadness: LitIvemIdPriceVolumeSequenceHistory.ResourceIdBadness = {
                    resourceId,
                    badness: notGoodResourceBadness,
                };
                notGoodResourceIdBadnessArray[notGoodCount++] = notGoodResourceIdBadness;
            }
        }

        // calculate badness
        let badness: Badness;
        switch (notGoodCount) {
            case 0:
                badness = Badness.notBad;
                break;
            case 1:
                badness = this.createSingleResourceBadness(notGoodResourceIdBadnessArray[0]);
                break;
            default:
                notGoodResourceIdBadnessArray.length = notGoodCount;
                badness = this.createNotGoodCompositeResourceBadness(notGoodResourceIdBadnessArray);
                break;
        }

        this.setBadness(badness);
    }

    private loadAllChartHistoryTickDateTimes() {
        if (this._sequencer === undefined || this._chartHistoryDataItem === undefined) {
            throw new AssertInternalError('LIIPVSHLACHTDTC4242499887');
        } else {
            const tickCount = this._chartHistoryDataItem.count;
            const tickDateTimeRepeatCountArray = new Array<LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatCount>(tickCount);
            const records = this._chartHistoryDataItem.records;

            // chartHistory records always have different DateTime values - so each is Initial
            const tickDateTimeRepeatCount = 0;

            for (let i = 0; i < tickCount; i++) {
                const record = records[i];
                const dateTime = record.dateTime;
                if (this._sequencer.addDateTime(dateTime, tickDateTimeRepeatCount)) {
                    tickDateTimeRepeatCountArray[i] = tickDateTimeRepeatCount;
                } else {
                    tickDateTimeRepeatCountArray[i] = LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed;
                }
            }

            return tickDateTimeRepeatCountArray;
        }
    }

    private isTradeRecordPriceVolumeAffected(tradeRecord: TradesDataItem.Record) {
        const affectsIds = tradeRecord.affectsIds;
        for (const affectsId of affectsIds) {
            switch (affectsId) {
                case TradeAffectsId.Price:
                    if (tradeRecord.price !== undefined) {
                        return true;
                    }
                    break;
                case TradeAffectsId.Volume:
                    if (tradeRecord.quantity !== undefined) {
                        return true;
                    }
                    break;
            }
        }
        return false;
    }

    private tryGetTradesDataItemAffectedRecordSourceTzOffsetDateTime(record: DayTradesDataItem.Record) {
        if (record.typeId !== DayTradesDataItem.Record.TypeId.Trade) {
            return undefined;
        } else {
            const tradeRecord = record.tradeRecord;
            const sourceTzOffsetDateTime = tradeRecord.time;
            if (sourceTzOffsetDateTime === undefined) {
                return undefined;
            } else {
                if (!this.isTradeRecordPriceVolumeAffected(tradeRecord)) {
                    return undefined;
                } else {
                    return sourceTzOffsetDateTime;
                }
            }
        }
    }

    private calculateTradesDataItemLatestRecordDateTimeAndRepeatIndex(record: DayTradesDataItem.Record) {
        let result: LitIvemIdPriceVolumeSequenceHistory.TradesDataItemRecordDateTimeAndRepeatCount;
        const sourceTzOffsetDateTime = this.tryGetTradesDataItemAffectedRecordSourceTzOffsetDateTime(record);
        if (sourceTzOffsetDateTime === undefined) {
            result = {
                repeatIndex: LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed,
                dateTime: this._nullSourceTzOffsetDateTime,
            };
        } else {
            const dateTime = sourceTzOffsetDateTime.utcDate;
            if (isDateEqual(dateTime, this._tradesDataItemLastDateTime)) {
                this._tradesDataItemLastDateTimeRepeatCount++;
            } else {
                this._tradesDataItemLastDateTimeRepeatCount = 0;
            }
            result = {
                repeatIndex: this._tradesDataItemLastDateTimeRepeatCount,
                dateTime: sourceTzOffsetDateTime,
            };
        }

        return result;
    }

    private loadAllTradesTickDateTimes() {
        if (this._sequencer === undefined || this._tradesDataItem === undefined) {
            throw new AssertInternalError('LIIPVSHLACHTDTT4242499887');
        } else {
            const tickCount = this._tradesDataItem.recordCount;
            const tickDateTimeRepeatCountArray = new Array<LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatCount>(tickCount);
            const records = this._tradesDataItem.records;

            this._tradesDataItemLastDateTime = newNullDate();
            this._tradesDataItemLastDateTimeRepeatCount = -1;

            for (let i = 0; i < tickCount; i++) {
                const record = records[i];
                const dateTimeAndRepeatCount = this.calculateTradesDataItemLatestRecordDateTimeAndRepeatIndex(record);
                let tickDateTimeRepeatCount = dateTimeAndRepeatCount.repeatIndex;
                if (tickDateTimeRepeatCount !== LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed) {
                    const sourceTzOffsetDateTime = dateTimeAndRepeatCount.dateTime;
                    if (!this._sequencer.addDateTime(sourceTzOffsetDateTime, tickDateTimeRepeatCount)) {
                        tickDateTimeRepeatCount = LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed;
                        if (this._tradesDataItemLastDateTimeRepeatCount > 0) {
                            this._tradesDataItemLastDateTimeRepeatCount--;
                        }
                    }
                }
                tickDateTimeRepeatCountArray[i] = tickDateTimeRepeatCount;
            }

            return tickDateTimeRepeatCountArray;
        }
    }

    private calculateDataItemSourceTimezoneOffset(dataItem: MarketSubscriptionDataItem, sequencer: HistorySequencer) {
        let offset = dataItem.market?.marketTime?.offset;
        if (offset !== undefined) {
            this._lastMarketTimeSourceTimezoneOffset = offset;
        } else {
            offset = this._lastMarketTimeSourceTimezoneOffset;
            if (offset === undefined) {
                offset = sequencer.getLastSourceTimezoneOffset();
                if (offset === undefined) {
                    // extremely unlikely but possible - use UTC
                    offset = 0;
                    if (!this._resortedToUtcOffsetLogged) {
                        Logger.logWarning('LitIvemIdPriceVolumeSequenceHistory resorted to UTC offset: ' + this._litIvemId.name);
                        this._resortedToUtcOffsetLogged = true;
                    }
                }
            }
        }

        return offset;
    }

    private loadAllSecurityTickDateTimes() {
        if (this._sequencer === undefined || this._securityDataItem === undefined) {
            throw new AssertInternalError('LIIPVSHLACHTDTS4242499887');
        } else {

            const offset = this.calculateDataItemSourceTimezoneOffset(this._securityDataItem, this._sequencer);

            const sourceTzOffsetDateTime: SourceTzOffsetDateTime = {
                offset,
                utcDate: newNowDate(),
            };

            let tickDateTimeRepeatCount = 0;
            if (!this._sequencer.addDateTime(sourceTzOffsetDateTime, tickDateTimeRepeatCount)) {
                tickDateTimeRepeatCount = LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed;
            }
            const tickDateTimeRepeatCountArray = [tickDateTimeRepeatCount];

            return tickDateTimeRepeatCountArray;
        }
    }

    private stagePriceOhlcTick(tickDateTime: Date, tickDateTimeRepeatIndex: Integer,
        open: number, high: number, low: number, close: number | undefined
    ) {
        for (const series of this._priceSeriesArray) {
            series.stageOhlcTick(tickDateTime, tickDateTimeRepeatIndex, open, high, low, close);
        }
    }

    private stagePriceValueTick(tickDateTime: Date, tickDateTimeRepeatIndex: Integer, value: number | undefined) {
        for (const series of this._priceSeriesArray) {
            series.stageValueTick(tickDateTime, tickDateTimeRepeatIndex, value);
        }
    }

    private stageVolumeValueTick(tickDateTime: Date, tickDateTimeRepeatIndex: Integer, value: number | undefined) {
        for (const series of this._volumeSeriesArray) {
            series.stageValueTick(tickDateTime, tickDateTimeRepeatIndex, value);
        }
    }

    private stageChartHistoryTick(tickDateTimeRepeatCount: Integer, record: ChartHistoryDataItem.Record) {
        const sourceTzOffsetDateTime = record.dateTime;
        const dateTime = sourceTzOffsetDateTime.utcDate;
        this.stagePriceOhlcTick(dateTime, tickDateTimeRepeatCount, record.open, record.high, record.low, record.close);
        this.stageVolumeValueTick(dateTime, tickDateTimeRepeatCount, record.volume);
    }

    private loadAllSeriesFromChartHistory(tickDateTimeRepeatCountArray: LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndexArray) {
        const sequencer = this._sequencer;
        const chartHistoryDataItem = this._chartHistoryDataItem;
        if (sequencer === undefined || chartHistoryDataItem === undefined) {
            throw new AssertInternalError('LIIPVSHLASFCHU4242499887');
        } else {
            sequencer.beginChange();
            try {
                const tickCount = chartHistoryDataItem.count;
                const records = chartHistoryDataItem.records;

                for (let i = 0; i < tickCount; i++) {
                    const record = records[i];
                    const tickDateTimeRepeatCount = tickDateTimeRepeatCountArray[i];
                    if (tickDateTimeRepeatCount !== LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed) {
                        this.stageChartHistoryTick(tickDateTimeRepeatCount, record);
                        sequencer.addTick(record.dateTime, tickDateTimeRepeatCount);
                    }
                }
            } finally {
                sequencer.endChange();
            }
        }
    }

    private stageTradeTick(dateTime: Date, tickDateTimeRepeatIndex: Integer, tradeRecord: TradesDataItem.Record) {
        const affectsIds = tradeRecord.affectsIds;
        for (const affectId of affectsIds) {
            switch (affectId) {
                case TradeAffectsId.Price:
                    const price = tradeRecord.price;
                    if (price !== undefined) {
                        this.stagePriceValueTick(dateTime, tickDateTimeRepeatIndex, price.toNumber());
                    }
                    break;
                case TradeAffectsId.Volume:
                    const quantity = tradeRecord.quantity;
                    if (quantity !== undefined) {
                        this.stageVolumeValueTick(dateTime, tickDateTimeRepeatIndex, quantity);
                    }
                    break;
            }
        }
    }

    private loadSeriesWithLatestTrades(tradesDataItem: DayTradesDataItem, index: Integer, count: Integer) {
        const sequencer = this._sequencer;
        if (sequencer === undefined) {
            throw new AssertInternalError('LIIPVSHLSWLTU422442499887');
        } else {
            sequencer.beginChange();
            try {
                const records = tradesDataItem.records;
                const nextLatestTradeRecordIndex = index + count;

                for (let i = index; i < nextLatestTradeRecordIndex; i++) {
                    const record = records[i];
                    const dateTimeAndRepeatIndex = this.calculateTradesDataItemLatestRecordDateTimeAndRepeatIndex(record);
                    const tickDateTimeRepeatIndex = dateTimeAndRepeatIndex.repeatIndex;
                    if (tickDateTimeRepeatIndex !== LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed) {
                        const sourceTzOffsetDateTime = dateTimeAndRepeatIndex.dateTime;
                        const tradeRecord = record.tradeRecord;
                        this.stageTradeTick(sourceTzOffsetDateTime.utcDate, tickDateTimeRepeatIndex, tradeRecord);
                        sequencer.addTick(sourceTzOffsetDateTime, tickDateTimeRepeatIndex);
                    }
                }
                this._nextLatestTradeRecordIndex = nextLatestTradeRecordIndex;
            } finally {
                sequencer.endChange();
            }
        }
    }

    private loadSeriesWithInsertedTrades(index: Integer, count: Integer) {
        const tradesDataItem = this._tradesDataItem;
        if (tradesDataItem === undefined) {
            throw new AssertInternalError('LIIPVSHLSWITU4224412499887');
        } else {
            if (index === this._nextLatestTradeRecordIndex) {
                this.loadSeriesWithLatestTrades(tradesDataItem, index, count);
            } else {
                throw new AssertInternalError('LIIPVSHLSWITNL6643492');
            }
        }
    }

    private loadAllSeriesWithAllTrades(tickDateTimeRepeatIndexArray: LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndexArray) {
        const sequencer = this._sequencer;
        const tradesDataItem = this._tradesDataItem;
        if (sequencer === undefined || tradesDataItem === undefined) {
            throw new AssertInternalError('LIIPVSHLASFTU4242499887');
        } else {
            sequencer.beginChange();
            try {
                const recordCount = tradesDataItem.recordCount;
                const records = tradesDataItem.records;

                for (let i = 0; i < recordCount; i++) {
                    const tickDateTimeRepeatIndex = tickDateTimeRepeatIndexArray[i];
                    if (tickDateTimeRepeatIndex !== LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed) {
                        const record = records[i];
                        const tradeRecord = record.tradeRecord;
                        const sourceTzOffsetDateTime = tradeRecord.time;
                        if (sourceTzOffsetDateTime === undefined) {
                            throw new AssertInternalError('LIIPVSHLASFTS4242499887');
                        } else {
                            const dateTime = sourceTzOffsetDateTime.utcDate;
                            this.stageTradeTick(dateTime, tickDateTimeRepeatIndex, tradeRecord);
                            sequencer.addTick(sourceTzOffsetDateTime, tickDateTimeRepeatIndex);
                        }
                    }
                }
                this._nextLatestTradeRecordIndex = recordCount;
            } finally {
                sequencer.endChange();
            }
        }
    }

    private stageSecurityTick(securityDataItem: SecurityDataItem, dateTime: Date, tickDateTimeRepeatCount: Integer, offset: Integer) {
        const last = securityDataItem.last?.toNumber();

        const open = securityDataItem.open?.toNumber();
        const high = securityDataItem.high?.toNumber();
        const low = securityDataItem.low?.toNumber();

        if (open !== undefined && high !== undefined && low !== undefined) {
            this.stagePriceOhlcTick(dateTime, tickDateTimeRepeatCount, open, high, low, last);
        } else {
            this.stagePriceValueTick(dateTime, tickDateTimeRepeatCount, last);
        }

        const volume = securityDataItem.volume;
        this.stageVolumeValueTick(dateTime, tickDateTimeRepeatCount, volume);
    }

    private loadSeriesFromModifiedSecurityFields(valueChanges: SecurityDataItem.ValueChange[]) {
        const priceFieldIds = [
            SecurityDataItem.FieldId.Last,
            SecurityDataItem.FieldId.Open,
            SecurityDataItem.FieldId.High,
            SecurityDataItem.FieldId.Low,
        ];
        const securityDataItem = this._securityDataItem;
        if (securityDataItem === undefined) {
            throw new AssertInternalError('LIIPVSHLSFMSFS104847774');
        } else {
            if (SecurityDataItem.valueChangeArrayIncludesAnyOfFieldIds(valueChanges, priceFieldIds)
                ||
                (this._hasVolume && SecurityDataItem.valueChangeArrayIncludesFieldId(valueChanges, SecurityDataItem.FieldId.Volume))) {

                const sequencer = this._sequencer;
                if (sequencer === undefined) {
                    throw new AssertInternalError('LIIPVSHLSFMSFQ104847774');
                } else {
                    const offset = this.calculateDataItemSourceTimezoneOffset(securityDataItem, sequencer);

                    const nowDateTime = newNowDate();
                    this.stageSecurityTick(securityDataItem, nowDateTime, 0, offset);

                    const sourceTzOffsetDateTime: SourceTzOffsetDateTime = {
                        utcDate: nowDateTime,
                        offset,
                    };

                    sequencer.addTick(sourceTzOffsetDateTime, 0);
                }
            }
        }
    }

    private loadAllSeriesFromSecurity(nowDateTime: Date,
        tickDateTimeRepeatIndexArray: LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndexArray
    ) {
        if (tickDateTimeRepeatIndexArray.length > 0) {
            const sequencer = this._sequencer;
            const securityDataItem = this._securityDataItem;
            if (sequencer === undefined || securityDataItem === undefined) {
                throw new AssertInternalError('LIIPVSHLASFSU4242499887');
            } else {
                const tickDateTimeRepeatIndex = tickDateTimeRepeatIndexArray[0];
                if (tickDateTimeRepeatIndex !== LitIvemIdPriceVolumeSequenceHistory.TickDateTimeRepeatIndex.NotUsed) {
                    const offset = this.calculateDataItemSourceTimezoneOffset(securityDataItem, sequencer);

                    this.stageSecurityTick(securityDataItem, nowDateTime, tickDateTimeRepeatIndex, offset);

                    const sourceTzOffsetDateTime: SourceTzOffsetDateTime = {
                        offset,
                        utcDate: nowDateTime,
                    };

                    sequencer.addTick(sourceTzOffsetDateTime, tickDateTimeRepeatIndex);
                }
            }
        }
    }
}

export namespace LitIvemIdPriceVolumeSequenceHistory {
    export const enum ResourceId {
        ChartHistory,
        Trades,
        Security,
    }

    export interface Resourcing {
        ids: ResourceId[];
        chartHistoryIntervalId: ChartIntervalId | undefined;
    }

    export type TickDateTimeRepeatCount = Integer; // -1 = not used, 0 = Initial DateTime, positive number = repeat count
    export type TickDateTimeRepeatIndexArray = TickDateTimeRepeatCount[];
    export type ResourceTickDateTimeRepeatCountArray = TickDateTimeRepeatIndexArray[];

    export namespace TickDateTimeRepeatIndex {
        export const NotUsed = -1;
    }

    export const enum SeriesTypeId {
        Price,
        Volume,
    }

    export interface ResourceIdBadness {
        resourceId: ResourceId;
        badness: Badness;
    }

    export interface TradesDataItemRecordDateTimeAndRepeatCount {
        repeatIndex: TickDateTimeRepeatCount;
        dateTime: SourceTzOffsetDateTime;
    }

    export namespace Resource {
        export type Id = ResourceId;

        interface Info {
            readonly id: Id;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof ResourceId]: Info };

        const infosObject: InfosObject = {
            ChartHistory: {
                id: ResourceId.ChartHistory,
                displayId: StringId.LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_ChartHistory,
            },
            Trades: {
                id: ResourceId.Trades,
                displayId: StringId.LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_Trades,
            },
            Security: {
                id: ResourceId.Security,
                displayId: StringId.LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_Security,
            },
        };

        const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info, idx) => info.id !== idx);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('LitIvemIdPriceVolumeSequenceHistory.ResourceId', outOfOrderIdx,
                    idToDisplay(outOfOrderIdx));
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

export namespace LitIvemIdPriceVolumeSequenceHistoryModule {
    export function initialiseStatic() {
        LitIvemIdPriceVolumeSequenceHistory.Resource.initialise();
    }
}
