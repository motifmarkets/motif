/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import * as Highcharts from 'highcharts/highstock';
import * as HIndicatorsAll from 'highcharts/indicators/indicators-all';
import * as HAnnotationsAdvanced from 'highcharts/modules/annotations-advanced';
import * as HDragPanes from 'highcharts/modules/drag-panes';
import * as HFullScreen from "highcharts/modules/full-screen";
import * as HPriceIndicator from 'highcharts/modules/price-indicator';
import * as HStockTools from 'highcharts/modules/stock-tools';
import { Badness, ExtensionSvc, JsonElement, LitIvemId } from 'motif';
import { Engine } from '../engine/engine';
import { TemplateStorage } from '../engine/template-storage';
import { Settings } from '../settings';
import './chart-frame.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HIndicatorsAll as any)(Highcharts);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HDragPanes as any)(Highcharts);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HAnnotationsAdvanced as any)(Highcharts);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HPriceIndicator as any)(Highcharts);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HFullScreen as any)(Highcharts);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HStockTools as any)(Highcharts);

export class ChartFrame {

    private readonly _element: HTMLElement;
    private readonly _chartEngine: Engine;

    get chartEngine() { return this._chartEngine; }

    constructor(
        private readonly _extensionSvc: ExtensionSvc,
        private readonly _settings: Settings,
        private readonly _uiAccess: ChartFrame.UiAccess,
        private readonly _templateStorage: TemplateStorage,
        hostElement: HTMLElement,
    ) {
        this._chartEngine = new Engine(this._extensionSvc, this._settings, hostElement);
        this._chartEngine.badnessChangedEvent = () => this.handleChartEngineBadnessChangedEvent();
        this._chartEngine.chartOpenedEvent = () => this.handleChartOpenedEvent();
    }

    destroy() {
        this._chartEngine.destroy();
    }

    close() {

    }

    adviseResize() {
        // if (this._chartSizingHostElement !== undefined) {
        //     const height = this._chartSizingHostElement.offsetHeight;
        //     const width = this._chartSizingHostElement.offsetWidth;
        //     if (height > 5 && width > 5) {
        //         this.chartHostHeight = numberToPixels(height);
        //         this.chartHostWidth = numberToPixels(width);
        //         this._cdr.markForCheck();
        //         delay1Tick(() => this.frame.adviseResize());
        //     }
        // }


        this._chartEngine.reflowChart();
    }

    getCurrentTemplate() {
        // const chartOptions = getCustomOptions(this._chart);
        // return this.createTemplate(chartOptions);
    }

    saveState(element: JsonElement) {
        // const chartOptions = getCustomOptions(this._chart);
        // const templateElement = this.createTemplate(chartOptions);
        // element.setElement(ChartComponent.JsonName.template, templateElement);
    }

    loadState(element: JsonElement | undefined) {
        // if (element === undefined) {
        //     this._loadedTemplate = this.createDefaultTemplate();
        // } else {
        //     const template = element.tryGetElement(ChartComponent.JsonName.template);
        //     if (template === undefined) {
        //         this._loadedTemplate = this.createDefaultTemplate();
        //     } else {
        //         this._loadedTemplate = template;
        //     }
        // }
    }

    async openLitIvemId(litIvemId: LitIvemId) {
        const rememberedTemplate = await this._templateStorage.getLitIvemIdRememberedTemplate(litIvemId);
        if (rememberedTemplate === undefined) {
            this._chartEngine.loadDefaultLitIvemIdChart(litIvemId);
        } else {
            this._chartEngine.loadRememberedLitIvemIdChart(litIvemId, rememberedTemplate);
        }
    }

    private handleChartOpenedEvent() {
        this._uiAccess.hideBadnessWithVisibleDelay(this._chartEngine.badness);
    }

    private handleChartEngineBadnessChangedEvent() {
        this._uiAccess.setBadness(this._chartEngine.badness);
    }

    // loadChartTemplate(template: JsonElement): void {
    //     const context = 'Chart Component: Load Template Json';
    //     let chartOptions = template.tryGetJsonObject(ChartComponent.JsonName.options, context) as HighchartOptions;
    //     if (chartOptions === undefined) {
    //         chartOptions = this.createDefaultOptions();
    //     } else {
    //         chartOptions = combineOptions(getDefaultChartOptions(), chartOptions);
    //     }
    //     this.createChart(chartOptions);
    //     this.readChartData();
    // }

    // loadDefaultChartTemplate(): void {
    //     const options = this.createDefaultOptions();
    //     this.createChart(options);
    //     this.readChartData();
    // }

    // private combineOptions(baseOptions: Highcharts.Options, customOptions: Highcharts.Options): Highcharts.Options {
    //     const options = { ...baseOptions };
    
    //     options.series = [
    //         ...options.series ? options.series : [],
    //         ...customOptions.series ? customOptions.series : [],
    //     ];
    
    //     options.annotations = [
    //         ...options.annotations ? options.annotations : [],
    //         ...customOptions.annotations ? customOptions.annotations : [],
    //     ];
    
    //     options.yAxis = [
    //         ...options.yAxis instanceof Array ? options.yAxis : [],
    //         ...customOptions.yAxis instanceof Array ? customOptions.yAxis : [],
    //     ];
    
    //     return options;
    // }
    
}

export namespace ChartFrame {
    export type ChangedEvent = (this: void) => void;
    export type ClearEvent = (this: void) => void;

    export interface UiAccess {
        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
