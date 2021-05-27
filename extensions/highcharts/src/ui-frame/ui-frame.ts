/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Badness,
    BuiltinIconButton,
    DelayedBadnessComponent,
    ExtensionSvc,
    Frame,
    FrameSvc,
    JsonElement,
    LitIvemId,
    LitIvemIdSelect
} from 'motif';
import { ChartFrame } from '../chart-frame/chart-frame';
import { TemplateStorage } from '../engine/template-storage';
import { Settings } from '../settings';
import { StatusBarFrame } from '../status-bar-frame/status-bar-frame';
import './ui-frame.scss';

export class UiFrame implements Frame, ChartFrame.UiAccess {
    private _delayedBadnessComponent: DelayedBadnessComponent;

    private readonly _templateStorage: TemplateStorage;
    private readonly _rootHtmlElement: HTMLElement;
    private _litIvemIdSelect: LitIvemIdSelect;
    private _symbolLinkedButton: BuiltinIconButton;

    get rootHtmlElement() {
        return this._rootHtmlElement;
    }
    get svc() {
        return this._svc;
    }

    private _chartFrame: ChartFrame;
    private _statusBarFrame: StatusBarFrame;
    private _currentChartTemplateName: string;

    constructor(private readonly _extensionSvc: ExtensionSvc, private readonly _svc: FrameSvc, private readonly _settings: Settings) {
        this._templateStorage = new TemplateStorage(this._extensionSvc.storageSvc, this._extensionSvc.commaTextSvc);

        this._rootHtmlElement = document.createElement('div');
        this._rootHtmlElement.classList.add('ui-frame-root');
    }

    async initialise() {
        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('ui-frame-controls');
        this._rootHtmlElement.appendChild(controlsDiv);
        this._litIvemIdSelect = await this.svc.controlsSvc.createLitIvemIdSelect();
        this._litIvemIdSelect.rootHtmlElement.classList.add('ui-frame-lit-ivem-id-select');
        this._litIvemIdSelect.commitEventer = () => this.commitSymbol();
        controlsDiv.appendChild(this._litIvemIdSelect.rootHtmlElement);

        const symbolLinkedToggleCommand = this._extensionSvc.commandSvc.getOrRegisterCommand('SymbolLinkedToggle', 0);
        this._symbolLinkedButton = await this.svc.controlsSvc.createBuiltinIconButton(symbolLinkedToggleCommand);
        controlsDiv.appendChild(this._symbolLinkedButton.rootHtmlElement);

        const delayedBadnessComponentAndChartFrameDiv = document.createElement('div');
        delayedBadnessComponentAndChartFrameDiv.classList.add('badness-and-chart');
        this.rootHtmlElement.appendChild(delayedBadnessComponentAndChartFrameDiv);
        this._delayedBadnessComponent = this._svc.contentSvc.createDelayedBadnessComponent();
        const delayedBadnessHtmlElement = this._delayedBadnessComponent.rootHtmlElement;
        delayedBadnessHtmlElement.classList.add('delayed-badness');
        delayedBadnessComponentAndChartFrameDiv.appendChild(delayedBadnessHtmlElement);
        const chartFrameDiv = document.createElement('div');
        chartFrameDiv.classList.add('chart-frame');
        delayedBadnessComponentAndChartFrameDiv.appendChild(chartFrameDiv);
        this._chartFrame = new ChartFrame(this._extensionSvc, this._settings, this, this._templateStorage, chartFrameDiv);

        this._svc.applySymbolEventer = (symbol, selfInitiated) => this.applySymbol(symbol, selfInitiated);
        this._svc.savePersistStateEventer = (element) => this.saveState(element);
        this._svc.resizedEventer = () => this.handleFrameResize();

        this.loadState(this._svc.initialPersistState);

        this.pushSymbol(this._svc.litIvemId);
        this.pushSymbolLinkButtonState();

        this.applySymbol(this._svc.litIvemId, true);
    }

    destroy() {
        this._svc.destroyAllComponents();
        this._chartFrame.destroy();
    }

    public isTemplateSelected(name: string): boolean {
        // return (name === this._currentChartTemplateName);
        return false;
    }

    private applySymbol(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean {
        if (litIvemId === undefined) {
            this.notifyOpenedClosed(undefined);
            return false;
        } else {
            this.pushSymbol(litIvemId);
            this._chartFrame.openLitIvemId(litIvemId);
            this.notifyOpenedClosed(litIvemId);
            return true;
        }
    }

    private handleFrameResize() {
        this._chartFrame.adviseResize();
    }

    private loadState(element: JsonElement | undefined) {

    }

    private saveState(element: JsonElement) {
        element.setString(UiFrame.JsonName.stateSchemaVersion, UiFrame.defaultStateSchemaVersion);
        const chartFrameElement = element.newElement(UiFrame.JsonName.chartFrame);
        this._chartFrame.saveState(chartFrameElement);
    }

    public handleSaveAsTemplate(): void {
        if (this._svc.litIvemId !== undefined) {
            const template = this._chartFrame.getCurrentTemplate();
            // const templateAsStr = template.stringify();
            // ChartTemplates.saveTemplate(this._frame.frameLitIvemId, 'MyFancyTemplate', templateAsStr);
        }
    }

    public handleTemplateChanged(templateName: string): void {
        // this._currentChartTemplateName = templateName;
        // this.loadChartTemplate();
    }

    // public handleIntervalChanged(text: string): void {
    //     const id = ChartInterval.tryJsonValueToId(text);
    //     if (!defined(id)) {
    //         throw new AdiError('Condition not handled [ID:11126165645]');
    //     }
    //     this._frame.frameIntervalId = id;
    // }

    // public isIntervalSelected(text: string): boolean {
    //     const id = ChartInterval.tryJsonValueToId(text);
    //     if (!defined(id)) {
    //         throw new AdiError('Condition not handled [ID:11926165903]');
    //     }
    //     return this._frame.frameIntervalId === id;
    // }

    private async loadChartTemplate() {
        // const context = 'chart-input.component.ts';

        // const litIvemId = this._svc.litIvemId;
        // if (litIvemId !== undefined && this._currentChartTemplateName !== undefined) {
        //     const templateData = await this._templateStorage.getLitIvemIdRememberedTemplate(litIvemId, this._currentChartTemplateName);
        //     if (templateData === undefined) {
        //         this._chartFrame.loadDefaultChartTemplate();
        //     } else {
        //         try {
        //             const chartTemplateElement = this._extensionSvc.jsonSvc.createJsonElement();
        //             chartTemplateElement.parse(templateData, context);
        //             this._chartFrame.loadChartTemplate(chartTemplateElement);
        //         } catch (error) {
        //             Logger.logError('ID:18028144025');
        //             this._contentComponent.loadDefaultChartTemplate();
        //         }
        //     }
        // }
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    private pushSymbolLinkButtonState() {
        if (this._svc.litIvemIdLinked) {
            this._symbolLinkedButton.pushSelected();
        } else {
            this._symbolLinkedButton.pushUnselected();
        }
    }

    private pushSymbol(litIvemId: LitIvemId | undefined) {
        this._litIvemIdSelect.pushValue(litIvemId);
    }

    private commitSymbol() {
        const litIvemId = this._litIvemIdSelect.value;
        if (litIvemId !== undefined) {
            this._svc.setLitIvemId(litIvemId);
            this._litIvemIdSelect.pushAccepted();
        }
    }

    private notifyOpenedClosed(litIvemId: LitIvemId | undefined) {
        this.pushSymbol(litIvemId);
        this._litIvemIdSelect.pushDisabled();
        this._litIvemIdSelect.pushAccepted();
    }
}

export namespace UiFrame {
    export const frameTypeName = 'chart';

    export namespace JsonName {
        export const stateSchemaVersion = 'stateSchemaVersion';
        export const chartFrame = 'chartFrame';
        export const intervalUnit = 'intervalUnit';
        export const intervalUnitCount = 'intervalUnitCount';
    }

    export const defaultStateSchemaVersion = '1';

    export type OpenedEventHandler = (this: void) => void;
}
