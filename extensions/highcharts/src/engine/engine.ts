/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import * as Highcharts from 'highcharts/highstock';
import {
    Badness,
    CorrectnessEnum,
    ExtensionSvc,
    HistorySequencer,
    Integer,
    IntervalHistorySequencer,
    LitIvemId,
    LitIvemIdPriceVolumeSequenceHistory,
    RepeatableExactHistorySequencer
} from 'motif';
import { StringId, strings } from '../i18n-strings';
import { AssertInternalError, UnreachableCaseError } from '../internal-error';
import { Logger } from '../logger';
import { Settings } from '../settings';
import { EngineSeries } from './engine-series';
import { NumberEngineSeries } from './number-engine-series';
import { OhlcEngineSeries } from './ohlc-engine-series';
import { SupportedSeriesType, SupportedSeriesTypeId } from './supported-series-type';
import { Template } from './template';

export class Engine {
    private _badness: Badness;
    private readonly _intervalSequencer: IntervalHistorySequencer;
    private readonly _repeatableExactSequencer: RepeatableExactHistorySequencer;

    private _chart: Highcharts.Chart | undefined;
    private _chartRedrawRequired = false;
    private _chartReflowRequired = false;
    private _chartPotentialRedrawReflowChangeBeginCount = 0;

    private _activeTemplate: Template;
    private _activeTemplateTypeId: Template.TypeId;
    private _activeLitIvemId: LitIvemId | undefined;
    private _activeSequencer: HistorySequencer | undefined;

    private _histories: LitIvemIdPriceVolumeSequenceHistory[] = [];
    private _seriesArray: EngineSeries[] = [];

    chartOpenedEvent: Engine.ChartOpenedEvent; // fired when a new chart is opened
    badnessChangedEvent: Engine.BadnessChangedEvent;

    get badness() { return this._badness; }

    get activeTemplate() { return this._activeTemplate; }
    get activeLitIvemId() { return this._activeLitIvemId; }
    get activeSequencerTypeId() { return this._activeSequencer?.type; }

    constructor(
        private readonly _extensionSvc: ExtensionSvc,
        private readonly _settings: Settings,
        private readonly _renderToElement: HTMLElement
    ) {
        this._badness = this._extensionSvc.badnessSvc.createInactive();
        this._intervalSequencer = this._extensionSvc.historySequencerSvc.createIntervalHistorySequencer();
        this._repeatableExactSequencer = this._extensionSvc.historySequencerSvc.createRepeatableExactHistorySequencer();
    }

    destroy() {

    }

    loadRememberedLitIvemIdChart(litIvemId: LitIvemId, template: Template) {
        this.loadTemplate(template, litIvemId);
        this._activeTemplateTypeId = Template.TypeId.LitIvemIdRemembered;
    }

    saveRememberedLitIvemIdChart(litIvemId: LitIvemId) {

    }

    setIntervalSequencer(unit: IntervalHistorySequencer.Unit,
        unitCount: Integer,
        emptyPeriodsSkipped: boolean,
        weekendsSkipped: boolean,
    ) {
        this._intervalSequencer.setParameters(unit, unitCount, emptyPeriodsSkipped, weekendsSkipped);
        this.activateIntervalSequencer();
    }

    setTradeSequencer() {
        // no parameters need to be set for RepeatableExactSequencer
        this.activateRepeatableExactSequencer();
    }

    loadDefaultLitIvemIdChart(litIvemId: LitIvemId) {
        this.checkDestroyChart();
        const template = Template.createDefault(this._extensionSvc);
        this.loadTemplate(template, litIvemId);
        this._activeTemplateTypeId = Template.TypeId.LitIvemIdDefault;
    }

    loadActiveTemplateLitIvemIdChart(litIvemId: LitIvemId) {

    }

    loadTemplateLitIvemIdChart(litIvemId: LitIvemId, templateName: string) {

    }

    saveChartAsTemplate(templateName: string) {

    }

    addLitIvemId(litIvemId: LitIvemId, priceYAxisId: string | undefined, volumeYAxisId: string | undefined) {

    }

    removeSeries(series: EngineSeries, keepPaneIfEmpty: boolean) {

    }

    changeSeriesType(series: EngineSeries, typeId: SupportedSeriesTypeId) {

    }

    adviseContainerResize() {
        this.reflowChart();
    }

    reflowChart() {
        this.beginChartPotentialRedrawReflowChange();
        this._chartRedrawRequired = true;
        this._chartReflowRequired = true;
        this.endChartPotentialRedrawReflowChange();
    }

    private handleSeriesPointsChangeEvent() {
        if (this._activeSequencer === undefined) {
            throw new AssertInternalError('HCEHSCES54558334');
        } else {
            if (!this._activeSequencer.changeBegun) {
                throw new AssertInternalError('HCEHSCEC54558334');
            } else {
                this._chartRedrawRequired = true;
            }
        }
    }

    private handleHistoryBadnessChangeEvent() {
        this.updateBadness();
    }

    private handleActiveSequencerChangeBegunEvent() {
        this.beginChartPotentialRedrawReflowChange();
    }

    private handleActiveSequencerChangeEndedEvent() {
        this.endChartPotentialRedrawReflowChange();
    }

    private handleSequencerLoadedEvent() {
        this.initialiseAllSequenceSeriesWithNullPoints();
    }

    private handleActiveSequencerAllEngineSeriesLoadedEvent() {
        this.loadAllChartSeriesPoints();
    }

    private notifyChartOpened() {
        if (this.chartOpenedEvent !== undefined) {
            this.chartOpenedEvent();
        }
    }

    private notifyBadnessChanged() {
        if (this.badnessChangedEvent !== undefined) {
            this.badnessChangedEvent();
        }
    }

    private setBadness(badness: Badness) {
        if (!this._extensionSvc.badnessSvc.isEqual(this._badness, badness)) {
            this._badness = this._extensionSvc.badnessSvc.createCopy(badness)
            this.notifyBadnessChanged();
        }
    }

    private createNotGoodCompositeBadness(notGoodHistoryArray: LitIvemIdPriceVolumeSequenceHistory[]): Badness {
        let correctness: CorrectnessEnum = CorrectnessEnum.Usable;
        let extra = '';
        for (let i = 0; i < notGoodHistoryArray.length; i++) {
            if (i > 0) {
                extra += ', ';
            }
            const history = notGoodHistoryArray[i];
            const litIvemIdDisplay = this._extensionSvc.symbolSvc.litIvemIdToDisplay(history.litIvemId);
            const badness = history.badness;
            const reason = badness.reason;
            const reasonExtra = badness.reasonExtra;
            const reasonDisplay = this._extensionSvc.badnessSvc.reasonToDisplay(reason);
            extra += `${i}) ${litIvemIdDisplay}: "${reasonDisplay} [${reasonExtra}]"`;

            const badnessCorrectness = this._extensionSvc.badnessSvc.getCorrectness(badness) as CorrectnessEnum;
            switch (badnessCorrectness) {
                case CorrectnessEnum.Suspect:
                    if (correctness !== CorrectnessEnum.Error) {
                        correctness = CorrectnessEnum.Suspect;
                    }
                    break;
                case CorrectnessEnum.Error:
                    correctness = CorrectnessEnum.Error;
                    break;
            }
        }

        let result: Badness;

        switch (correctness) {
            case CorrectnessEnum.Usable: {
                const errorText = `${strings[StringId.HistoryWarnings]}: ${extra}`;
                result = this._extensionSvc.badnessSvc.createCustomUsable(errorText);
                break;
            }
            case CorrectnessEnum.Suspect: {
                const dataRetrievingDisplay = this._extensionSvc.badnessSvc.reasonToDisplay(Badness.ReasonEnum.DataRetrieving); 
                const errorText = `${dataRetrievingDisplay}: ${extra}`;
                result = this._extensionSvc.badnessSvc.createCustomSuspect(errorText);
                break;
            }
            case CorrectnessEnum.Error: {
                const errorText = `${strings[StringId.HistoryErrors]}: ${extra}`;
                result = this._extensionSvc.badnessSvc.createCustomUsable(errorText);
                break;
            }
            default:
                throw new UnreachableCaseError('HCECNGCRB3235555832', correctness);
        }

        return result;
    }

    private updateBadness() {
        const historyCount = this._histories.length;
        const notGoodHistoryArray = new Array<LitIvemIdPriceVolumeSequenceHistory>(historyCount);
        let notGoodHistoryCount = 0;
        for (const history of this._histories) {
            if (!history.good) {
                notGoodHistoryArray[notGoodHistoryCount++] = history;
            }
        }

        switch (notGoodHistoryCount) {
            case 0:
                this.setBadness(this._extensionSvc.badnessSvc.createNotBad());
                break;
            case 1: {
                this.setBadness(notGoodHistoryArray[0].badness);
                break;
            }
            default: {
                notGoodHistoryArray.length = notGoodHistoryCount;
                const badness = this.createNotGoodCompositeBadness(notGoodHistoryArray);
                this.setBadness(badness);
            }
        }
    }

    private beginChartPotentialRedrawReflowChange() {
        this._chartPotentialRedrawReflowChangeBeginCount++;
    }

    private endChartPotentialRedrawReflowChange() {
        if (--this._chartPotentialRedrawReflowChangeBeginCount === 0) {
            if (this._chart !== undefined) {
                if (this._chartRedrawRequired) {
                    if (this._chartReflowRequired) {
                        this._chart.reflow();
                        this._chartReflowRequired = false;
                    }
                    this._chart.redraw(false);
                    this._chartRedrawRequired = false;
                }
            }
        }
    }

    private initialiseAllSequenceSeriesWithNullPoints() {
        for (const series of this._seriesArray) {
            series.initialiseSequenceSeriesWithNullPoints();
        }
    }

    private loadAllChartSeriesPoints() {
        for (const series of this._seriesArray) {
            series.loadAllChartPoints();
            this._chartRedrawRequired = true;
        }
    }

    private deleteHistoryByIndex(idx: Integer) {
        const history = this._histories[idx];
        history.finalise();
        this._histories.splice(idx, 1);
    }

    private deleteHistory(history: LitIvemIdPriceVolumeSequenceHistory) {
        const idx = this._histories.indexOf(history);
        if (idx < 0) {
            throw new AssertInternalError('HCDH8543392323', idx.toString());
        } else {
            this.deleteHistoryByIndex(idx);
        }
    }

    private checkDeleteHistory(history: LitIvemIdPriceVolumeSequenceHistory) {
        const litIvemId = history.litIvemId;

        let refCount = 0;
        for (let i = 0; i < this._seriesArray.length; i++) {
            const series = this._seriesArray[i];
            if (this._extensionSvc.litIvemIdSvc.isEqual(series.litIvemId, litIvemId)) {
                refCount++;
            }
        }

        if (refCount === 0) {
            this.deleteHistory(history);
        }
    }

    private deleteUnusedHistories(usedHistories: LitIvemIdPriceVolumeSequenceHistory[]) {
        for (let i = this._histories.length - 1; i >= 0; i--) {
            const history = this._histories[i];
            if (!usedHistories.includes(history)) {
                this.deleteHistoryByIndex(i);
            }
        }
    }

    private deleteSeriesByIndex(idx: Integer) {
        const series = this._seriesArray[idx];
        const highChartSeries = series.chartSeries;
        highChartSeries.remove(false, false, false);
        const history = series.history;
        series.finalise();
        this._seriesArray.splice(idx, 1);
        this.checkDeleteHistory(history);
    }

    private deleteSeries(series: EngineSeries) {
        const idx = this._seriesArray.indexOf(series);
        if (idx < 0) {
            throw new AssertInternalError('HCDS11185340009', idx.toString());
        } else {
            this.deleteSeriesByIndex(idx);
        }
    }

    private destroySeriesArray() {
        for (let i = this._seriesArray.length - 1; i >= 0; i--) {
            this.deleteSeriesByIndex(i);
        }
    }

    private checkDestroyChart() {
        if (this._seriesArray.length > 0) {
            this.destroySeriesArray();
        }
        this._seriesArray.length = 0;
        if (this._chart !== undefined) {
            this._chart.destroy();
            this._chart = undefined;
        }
        for (const history of this._histories) {
            history.finalise();
        }
        this._histories.length = 0;

        this._intervalSequencer.finalise();
        this._repeatableExactSequencer.finalise();
    }

    private getHistory(litIvemId: LitIvemId) {
        for (let i = 0; i < this._histories.length; i++) {
            const history = this._histories[i];
            if (this._extensionSvc.litIvemIdSvc.isEqual(history.litIvemId, litIvemId)) {
                return history;
            }
        }
        return undefined;
    }

    private getCreateHistory(litIvemId: LitIvemId) {
        let result = this.getHistory(litIvemId);
        if (result === undefined) {
            result = this._extensionSvc.historySequencerSvc.createLitIvemIdPriceVolumeSequenceHistory(litIvemId);
            result.badnessChangeEventer = () => this.handleHistoryBadnessChangeEvent();
            this._histories.push(result);
        }
        return result;
    }

    private getChartOptionsSeriesIdAndTypeIds(chartOptions: Highcharts.Options): Engine.ChartSeriesIdAndTypeId[] {
        const series = chartOptions.series;
        if (series === undefined) {
            return [];
        } else {
            const maxCount = series.length;
            const result = new Array<Engine.ChartSeriesIdAndTypeId>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++) {
                const seriesElement = series[i];
                const id = seriesElement.id;
                if (id !== undefined) {
                    const type = seriesElement.type;
                    const typeId = SupportedSeriesType.tryHighchartsIdToId(type);
                    if (typeId !== undefined) {
                        const idAndTypeId: Engine.ChartSeriesIdAndTypeId = {
                            series: seriesElement,
                            id,
                            typeId,
                        };
                        result[count++] = idAndTypeId;
                    }
                }
            }
            result.length = count;
            return result;
        }
    }

    private deleteChartOptionsSeries(chartOptions: Highcharts.Options, ids: string[]) {
        const seriesArray = chartOptions.series;
        if (seriesArray !== undefined) {
            for (let i = seriesArray.length - 1; i >= 0; i--) {
                const series = seriesArray[i];
                const id = series.id;
                // also delete any series whose id is undefined
                if (id === undefined || ids.includes(id)) {
                    seriesArray.splice(i, 1);
                }
            }
        }
    }

    private resolveSeries(templateSeriesArray: Template.Series[], param0LitIvemId: LitIvemId | undefined,
        chartOptions: Highcharts.Options, resolvedSeriesArray: Engine.ResolvedSeries[]
    ) {
        const chartSeriesIdAndTypeIds = this.getChartOptionsSeriesIdAndTypeIds(chartOptions);
        const maxCount = templateSeriesArray.length;
        resolvedSeriesArray.length = maxCount;
        let count = 0;

        for (let i = 0; i < maxCount; i++) {
            const templateSeries = templateSeriesArray[i];
            const id = templateSeries.id;
            if (id !== undefined) {
                const chartSeriesIdIndex = chartSeriesIdAndTypeIds.findIndex((idAndTypeId) => idAndTypeId.id === id);
                if (chartSeriesIdIndex >= 0) {
                    const chartSeries = chartSeriesIdAndTypeIds[chartSeriesIdIndex].series;
                    const chartSeriesTypeId = chartSeriesIdAndTypeIds[chartSeriesIdIndex].typeId;

                    const typeIdJsonValue = templateSeries.typeId;
                    const typeId = EngineSeries.Type.tryJsonValueToId(typeIdJsonValue);

                    if (typeId === undefined) {
                        Logger.logConfigError('HCERSU21299845', 'Unknown HighstockChartEngineSeries.TypeId JSON value: ' + typeIdJsonValue);
                    } else {
                        const supportedChartsSeriesTypeIds = EngineSeries.Type.idToSupportedHighchartsSeriesTypeIds(typeId);
                        if (!supportedChartsSeriesTypeIds.includes(chartSeriesTypeId)) {
                            const chartSeriesTypeDisplay = SupportedSeriesType.idToDisplay(chartSeriesTypeId);
                            const logText = `HighstockChartEngineSeries: "${typeIdJsonValue}" ` +
                                `does not support Highcharts series: "${chartSeriesTypeDisplay}"`;
                            Logger.logConfigError('HCERSS21299845', logText);
                        } else {
                            let litIvemId: LitIvemId | undefined;
                            switch (templateSeries.parameterIndex) {
                                case undefined:
                                    if (templateSeries.litIvemId !== undefined) {
                                        litIvemId = this._extensionSvc.litIvemIdSvc.tryCreateFromJson(templateSeries.litIvemId);
                                    }
                                    break;
                                case 0:
                                    litIvemId = param0LitIvemId;
                                    break;
                                default:
                                    litIvemId = undefined;
                            }

                            if (litIvemId !== undefined) {

                                chartSeries.name = this._extensionSvc.symbolSvc.litIvemIdToDisplay(litIvemId);

                                const series: Engine.ResolvedSeries = {
                                    id,
                                    typeId,
                                    parameterIndex: templateSeries.parameterIndex,
                                    litIvemId,
                                    chartSeriesTypeId,
                                };

                                resolvedSeriesArray[count++] = series;
                                chartSeriesIdAndTypeIds.splice(chartSeriesIdIndex, 1); // remove so cannot be used by other template series
                            }
                        }
                    }
                }
            }
        }

        if (count === 0) {
            return undefined; // do not use if no series are resolved
        } else {
            resolvedSeriesArray.length = count;

            if (chartSeriesIdAndTypeIds.length !== 0) {
                // delete any unused series in Chart Options
                this.deleteChartOptionsSeries(chartOptions, chartSeriesIdAndTypeIds.map((idAndTypeId) => idAndTypeId.id));
            }

            return chartOptions;
        }
    }

    private resolveChartOptions(template: Template, param0LitIvemId: LitIvemId | undefined,
            resolvedSeriesArray: Engine.ResolvedSeries[]) {
        const templateSeries = template.seriesArray;

        if (templateSeries === undefined) {
            return undefined;
        } else {
            const chartOptions = template.chartOptions;

            if (chartOptions === undefined) {
                return undefined;
            } else {
                const templateSeriesArray = template.seriesArray;

                if (templateSeriesArray === undefined) {
                    return undefined;
                } else {
                    const resolvedChartOptions = this.resolveSeries(templateSeriesArray, param0LitIvemId, chartOptions,
                        resolvedSeriesArray);
                    return resolvedChartOptions;
                }
            }
        }
    }

    private loadResolvedSeries(resolvedSeriesArray: Engine.ResolvedSeries[], chart: Highcharts.Chart) {
        const count = resolvedSeriesArray.length;
        this._seriesArray.length = count;
        for (let i = 0; i < count; i++) {
            const resolvedSeries = resolvedSeriesArray[i];
            const id = resolvedSeries.id;
            const chartSeries = chart.get(id); // chart is same as this._chart however known to be not defined
            if (chartSeries === undefined || !(chartSeries instanceof Highcharts.Series)) {
                throw new AssertInternalError('HCARS8777854', chartSeries === undefined ? 'undefined' : 'not series');
            } else {

                const litIvemId = resolvedSeries.litIvemId;

                const typeId = resolvedSeries.typeId;
                const parameterIndex = resolvedSeries.parameterIndex;
                const chartSeriesTypeId = resolvedSeries.chartSeriesTypeId;

                let series: EngineSeries;

                switch (typeId) {
                    case EngineSeries.TypeId.LitIvemIdOhlc:
                        series = new OhlcEngineSeries(this._extensionSvc, this._settings, typeId, parameterIndex, litIvemId,
                            chartSeries, chartSeriesTypeId);
                        break;
                    case EngineSeries.TypeId.LitIvemIdClose:
                    case EngineSeries.TypeId.LitIvemIdLast:
                    case EngineSeries.TypeId.LitIvemIdVolume:
                        series = new NumberEngineSeries(this._extensionSvc, this._settings, typeId, parameterIndex, litIvemId,
                            chartSeries, chartSeriesTypeId);
                        break;
                    default:
                        throw new UnreachableCaseError('HCSC663339584', typeId);
                }

                series.pointsChangedEvent = () => this.handleSeriesPointsChangeEvent();

                this._seriesArray[i] = series;
            }
        }
    }

    private loadIntervalSequencer(template: Template.IntervalSequencer) {
        const jsonElement = this._extensionSvc.jsonSvc.createJsonElement(template);

        let unit: IntervalHistorySequencer.Unit;
        const unitJsonValue = jsonElement.tryGetString(Template.IntervalSequencer.JsonName.unit);
        if (unitJsonValue === undefined) {
            unit = Template.IntervalSequencer.defaults.unit;
        } else {
            const parsedUnit = this._extensionSvc.intervalHistorySequencerSvc.unitFromJsonValue(unitJsonValue);
            unit = parsedUnit === undefined ? Template.IntervalSequencer.defaults.unit : parsedUnit;
        }

        const unitCount = jsonElement.getNumber(Template.IntervalSequencer.JsonName.unitCount,
            Template.IntervalSequencer.defaults.unitCount,
            'IntervalSequencerTemplate.unitCount'
        );

        const emptyPeriodsSkipped = jsonElement.getBoolean(Template.IntervalSequencer.JsonName.emptyPeriodsSkipped,
            Template.IntervalSequencer.defaults.emptyPeriodsSkipped,
            'IntervalSequencerTemplate.emptyPeriodsSkipped'
        );

        const weekendsSkipped = jsonElement.getBoolean(Template.IntervalSequencer.JsonName.weekendsSkipped,
            Template.IntervalSequencer.defaults.weekendsSkipped,
            'IntervalSequencerTemplate.weekendsSkipped'
        );

        // const completedIntervalsOnly = jsonElement.getBoolean(Template.IntervalSequencer.JsonName.completedIntervalsOnly,
        //     Template.IntervalSequencer.defaults.completedIntervalsOnly,
        //     'IntervalSequencerTemplate.completedIntervalsOnly'
        // );

        this._intervalSequencer.setParameters(unit, unitCount, emptyPeriodsSkipped, weekendsSkipped);
    }

    private loadSequencers(template: Template) {
        this._intervalSequencer.finalise();
        this._repeatableExactSequencer.finalise();

        let templateIntervalSequencer = template.intervalSequencer;
        if (templateIntervalSequencer === undefined) {
            templateIntervalSequencer = Template.createDefaultIntervalSequencer(this._extensionSvc);
        }

        this.loadIntervalSequencer(templateIntervalSequencer);
        // nothing to load for RepeatableExactSequencer

        const sequencerTypeJsonValue = template.sequencerType;
        let sequencerTypeId = this._extensionSvc.historySequencerSvc.typeFromJsonValue(sequencerTypeJsonValue);
        if (sequencerTypeId === undefined) {
            sequencerTypeId = Template.defaultSequencerTypeId;
        }

        return sequencerTypeId;
    }

    private createIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer, seriesTypeId: EngineSeries.TypeId) {
        switch (seriesTypeId) {
            case EngineSeries.TypeId.LitIvemIdOhlc: {
                const series = this._extensionSvc.historySequencerSvc.createOhlcIntervalHistorySequenceSeries(sequencer);
                return series;
            }
            case EngineSeries.TypeId.LitIvemIdClose: {
                const series = this._extensionSvc.historySequencerSvc.createCloseIntervalHistorySequenceSeries(sequencer);
                return series;
            }
            case EngineSeries.TypeId.LitIvemIdLast: {
                const series = this._extensionSvc.historySequencerSvc.createLastIntervalHistorySequenceSeries(sequencer);
                return series;
            }
            case EngineSeries.TypeId.LitIvemIdVolume: {
                const series = this._extensionSvc.historySequencerSvc.createAccumulationIntervalHistorySequenceSeries(sequencer);
                return series;
            }
            default:
                throw new UnreachableCaseError('HCCIHSS885033542', seriesTypeId);
        }
    }

    private createRepeatableExactHistorySequenceSeries(sequencer: RepeatableExactHistorySequencer,
        seriesTypeId: EngineSeries.TypeId
    ) {
        switch (seriesTypeId) {
            case EngineSeries.TypeId.LitIvemIdOhlc:
            case EngineSeries.TypeId.LitIvemIdClose:
            case EngineSeries.TypeId.LitIvemIdLast: {
                const series = this._extensionSvc.historySequencerSvc.createCurrentRepeatableExactHistorySequenceSeries(sequencer);
                return series;
            }
            case EngineSeries.TypeId.LitIvemIdVolume: {
                const series = this._extensionSvc.historySequencerSvc.createCurrentRepeatableExactHistorySequenceSeries(sequencer);
                return series;
            }
            default:
                throw new UnreachableCaseError('HCCIHSS885033542', seriesTypeId);
        }
    }

    private activateIntervalSequencer() {
        this.deactivateSequencer();

        this._activeSequencer = this._intervalSequencer;
        const activeSequencer = this._activeSequencer;

        activeSequencer.changeBegunEventer = () => this.handleActiveSequencerChangeBegunEvent();
        activeSequencer.changeEndedEventer = () => this.handleActiveSequencerChangeEndedEvent();
        activeSequencer.sequencerLoadedEventer = () => this.handleSequencerLoadedEvent();
        activeSequencer.allEngineSeriesLoadedEventer = () => this.handleActiveSequencerAllEngineSeriesLoadedEvent();

        activeSequencer.beginHistoriesChange();
        try {
            const seriesArrayCount = this._seriesArray.length;
            const usedHistories = new Array<LitIvemIdPriceVolumeSequenceHistory>(seriesArrayCount);
            let usedHistoriesCount = 0;

            for (const series of this._seriesArray) {
                const sequenceSeries = this.createIntervalHistorySequenceSeries(this._intervalSequencer, series.typeId);
                const litIvemId = series.litIvemId;
                const history = this.getCreateHistory(litIvemId);
                series.activate(history, sequenceSeries);

                if (!usedHistories.includes(history)) {
                    usedHistories[usedHistoriesCount++] = history;
                }
            }

            usedHistories.length = usedHistoriesCount;
            this.deleteUnusedHistories(usedHistories);

            for (const history of this._histories) {
                history.setSequencer(activeSequencer);
            }
        } finally {
            activeSequencer.endHistoriesChange();
        }
    }

    private activateRepeatableExactSequencer() {
        this.deactivateSequencer();

        this._activeSequencer = this._repeatableExactSequencer;
        const activeSequencer = this._activeSequencer;

        activeSequencer.changeBegunEventer = () => this.handleActiveSequencerChangeBegunEvent();
        activeSequencer.changeEndedEventer = () => this.handleActiveSequencerChangeEndedEvent();
        activeSequencer.allEngineSeriesLoadedEventer = () => this.handleActiveSequencerAllEngineSeriesLoadedEvent();
        activeSequencer.sequencerLoadedEventer = () => this.handleSequencerLoadedEvent();

        activeSequencer.beginHistoriesChange();
        try {
            const seriesArrayCount = this._seriesArray.length;
            const usedHistories = new Array<LitIvemIdPriceVolumeSequenceHistory>(seriesArrayCount);
            let usedHistoriesCount = 0;

            for (const series of this._seriesArray) {
                const sequenceSeries = this.createRepeatableExactHistorySequenceSeries(this._repeatableExactSequencer, series.typeId);
                const litIvemId = series.litIvemId;
                const history = this.getCreateHistory(litIvemId);
                series.activate(history, sequenceSeries);

                if (!usedHistories.includes(history)) {
                    usedHistories[usedHistoriesCount++] = history;
                }
            }

            usedHistories.length = usedHistoriesCount;
            this.deleteUnusedHistories(usedHistories);

            for (const history of this._histories) {
                history.setSequencer(activeSequencer);
            }
        } finally {
            activeSequencer.endHistoriesChange();
        }
    }

    private deactivateSequencer() {
        const sequencer = this._activeSequencer;
        if (sequencer !== undefined) {
            sequencer.changeBegunEventer = undefined;
            sequencer.changeEndedEventer = undefined;
            sequencer.sequencerLoadedEventer = undefined;
            sequencer.allEngineSeriesLoadedEventer = undefined;

            sequencer.beginHistoriesChange();
            try {
                for (const series of this._seriesArray) {
                    series.deactivate();
                }
                for (const history of this._histories) {
                    history.setSequencer(undefined);
                }
                sequencer.finalise();
            } finally {
                sequencer.endHistoriesChange();
            }

            this._activeSequencer = undefined;
        }
    }

    private activateSequencer(type: HistorySequencer.TypeEnum) {
        switch (type) {
            case HistorySequencer.TypeEnum.Interval:
                this.activateIntervalSequencer();
                break;
            case HistorySequencer.TypeEnum.RepeatableExact:
                this.activateRepeatableExactSequencer();
                break;
            default:
                throw new UnreachableCaseError('HCAS66048227753', type);
        }
    }

    private checkActivateHistories() {
        if (this._activeSequencer === undefined) {
            throw new AssertInternalError('HCCAH87774200');
        } else {
            this._activeSequencer.beginHistoriesChange();
            try {
                for (const history of this._histories) {
                    const active = history.active;
                    if (!active) {
                        history.activate(history.litIvemId);
                    }
                }
            } finally {
                this._activeSequencer.endHistoriesChange();
            }
        }
    }

    private loadTemplate(template: Template, param0LitIvemId: LitIvemId | undefined) {
        this.checkDestroyChart();

        const activeSequencerTypeId = this.loadSequencers(template);

        const resolvedSeriesArray: Engine.ResolvedSeries[] = [];
        let chartOptions = this.resolveChartOptions(template, param0LitIvemId, resolvedSeriesArray);

        if (chartOptions === undefined) {
            template = Template.createDefault(this._extensionSvc);
            chartOptions = this.resolveChartOptions(template, param0LitIvemId, resolvedSeriesArray);

            if (chartOptions === undefined) {
                throw new AssertInternalError('HCAT6588837323');
            }
        }

        this._chart = Highcharts.stockChart(this._renderToElement, chartOptions);

        this.loadResolvedSeries(resolvedSeriesArray, this._chart);

        this.activateSequencer(activeSequencerTypeId);
        this.checkActivateHistories();

        this._activeTemplate = template;
        this._activeLitIvemId = param0LitIvemId;
        this.notifyChartOpened();
    }


}

export namespace Engine {
    export interface ChartSeriesIdAndTypeId {
        series: Highcharts.SeriesOptionsType;
        id: string;
        typeId: SupportedSeriesTypeId;
    }

    export type ChartOpenedEvent = (this: void) => void;
    export type BadnessChangedEvent = (this: void) => void;

    export interface ResolvedSeries {
        id: string;
        typeId: EngineSeries.TypeId;
        parameterIndex?: Integer;
        litIvemId: LitIvemId;
        chartSeriesTypeId: SupportedSeriesTypeId;
    }

    export namespace DefaultOptions {
        const options: Highcharts.Options = {
            // series: [{
            //     type: SeriesType.idToHighchartsId(HighstockChart.SeriesTypeId.CandleStick),
            //     data: [],
            //     id: '0',

            // }],
            credits: {
                enabled: false,
            },
            rangeSelector: {
                enabled: false,
            },
            yAxis: [{
                floor: 0,
            }],
            stockTools: {
                gui: {
                    enabled: true,
                }
            },
        };

        const optionsJsonStringified = JSON.stringify(options);

        export function create() {
            return JSON.parse(optionsJsonStringified) as Highcharts.Options;
        }
    }
}
