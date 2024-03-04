/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Inject, Injector, OnDestroy, ViewChild, ViewContainerRef, createNgModule } from '@angular/core';
import { AssertInternalError, IdleService, Integer, MultiEvent, ScanEditor, ScanFormulaZenithEncoding, StringId, StringUiAction, Strings, delay1Tick } from '@motifmarkets/motif-core';
import { CodeMirrorNgComponent } from 'code-mirror-ng-api';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { IdleNgService } from 'component-services-ng-api';
import { AngularSplitTypes } from 'controls-internal-api';
import { TextInputNgComponent } from 'controls-ng-api';
import { ScanFormulaViewNgDirective } from '../../scan-formula-view-ng.directive';
import { ZenithScanFormulaViewDecodeProgressNgComponent } from '../decode-progress/ng-api';

@Directive({
    selector: '[appZenithScanFormulaView]',
})
export abstract class ZenithScanFormulaViewNgDirective extends ScanFormulaViewNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('editorContainer', { read: ViewContainerRef, static: true }) private _editorContainer: ViewContainerRef;
    @ViewChild('decodeProgress', { static: true }) private _decodeProgressComponent: ZenithScanFormulaViewDecodeProgressNgComponent;
    @ViewChild('errorControl', { static: true }) private _errorControl: TextInputNgComponent;

    public editorSize: AngularSplitTypes.AreaSize.Html = null;
    public editorMinSize: AngularSplitTypes.AreaSize.Html;
    public decodeProgressSize: AngularSplitTypes.AreaSize.Html;
    public splitterGutterSize = 3;

    private readonly _idleService: IdleService;

    private _editorComponent: CodeMirrorNgComponent;
    private _editorClearing = false;

    private readonly _errorUiAction: StringUiAction;

    private _resizeObserver: ResizeObserver;
    private _splitterDragged = false;

    private _scanEditorFieldChangesSubscriptionId: MultiEvent.SubscriptionId;
    private _decodePromise: Promise<void> | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _injector: Injector,
        idleNgService: IdleNgService,
        @Inject(ComponentBaseNgDirective.typeInstanceCreateIdInjectionToken) typeInstanceCreateCount: Integer,
    ) {
        super(elRef, typeInstanceCreateCount);
        this._idleService = idleNgService.service;
        this._errorUiAction = this.createErrorUiAction();
    }

    ngOnDestroy(): void {
        this._decodeProgressComponent.displayedChangedEventer = undefined;
        this._decodeProgressComponent.defaultWidthSetEventer = undefined;
        this._resizeObserver.disconnect();

        this._errorUiAction.finalise();

        if (this._decodePromise !== undefined) {
            this._idleService.cancelRequest(this._decodePromise);
            this._decodePromise = undefined;
        }
    }

    ngAfterViewInit(): void {
        this._errorControl.initialise(this._errorUiAction);
        this._resizeObserver = new ResizeObserver(() => this.updateWidths());
        this._resizeObserver.observe(this.rootHtmlElement);

        this._decodeProgressComponent.displayedChangedEventer = () => {
            this._splitterDragged = false;
            this.updateDecodeProgressDisplayed();
            delay1Tick(() => this.updateWidths());
        }
        this._decodeProgressComponent.defaultWidthSetEventer = () => {
            this._splitterDragged = false;
            delay1Tick(() => this.updateWidths());
        }
        this.updateDecodeProgressDisplayed();

        delay1Tick(() => {
            const loadPromise = this.loadEditorComponent();
            AssertInternalError.throwErrorIfPromiseRejected(loadPromise, 'ZSCVNCNAVID1T29871');
        });

    }

    async loadEditorComponent() {
        const moduleRef = await this.getCodeMirrorModuleInstance();
        const componentType = moduleRef.instance.codeMirrorComponentType;
        // const { CodeMirrorNgComponent: componentType } = await import('code-mirror-component');
        this._editorContainer.clear();
        const editorComponentRef = this._editorContainer.createComponent(componentType, {
            ngModuleRef: moduleRef,
            // environmentInjector: this._environmentInjector,
            injector: this._injector,
        });
        this._editorComponent = editorComponentRef.instance;
        this._editorComponent.docChangedEventer = () => this.processDocChanged();
        delay1Tick(() => this._editorComponent.initialise());
    }

    override setEditor(value: ScanEditor | undefined) {
        const oldEditor = this.scanEditor;
        if (oldEditor !== undefined) {
            oldEditor.unsubscribeFieldChangesEvents(this._scanEditorFieldChangesSubscriptionId);
            this._scanEditorFieldChangesSubscriptionId = undefined;
            this._editorClearing = true;
            this._editorComponent.text = '';
            this._editorClearing = false;
        }

        super.setEditor(value);

        if (value !== undefined) {
            const text = this.getFormulaAsZenithText(value);
            if (text === undefined) {
                this._editorClearing = true;
                this._editorComponent.text = '';
                this._editorClearing = false;
            } else {
                this._editorComponent.text = text;
            }
            this._scanEditorFieldChangesSubscriptionId = value.subscribeFieldChangesEvents(
                (changedFieldIds, fieldChanger) => { this.processScanEditorFieldChanges(value, changedFieldIds, fieldChanger); }
            );
        }
    }

    public handleSplitterDragEnd() {
        this.decodeProgressSize = this._decodeProgressComponent.rootHtmlElement.offsetWidth;
        this._splitterDragged = true;
    }

    private createErrorUiAction() {
        const action = new StringUiAction(false);
        action.pushReadonly();
        action.pushCaption(Strings[StringId.ZenithScanFormulaView_ErrorCaption]);
        action.pushTitle(Strings[StringId.ZenithScanFormulaView_ErrorTitle]);
        return action;
    }

    private async getCodeMirrorModuleInstance() {
        // https://stackoverflow.com/questions/75883330/how-to-load-lazy-modules-programmatically-in-angular-app
        const { CodeMirrorNgModule } = await import('code-mirror-ng-api')
        return createNgModule(CodeMirrorNgModule, this._injector);
    }

    private processDocChanged() {
        if (!this._editorComponent.textSetting) {
            if (this._decodePromise !== undefined) {
                this._idleService.cancelRequest(this._decodePromise);
            }
            if (!this._editorClearing) {
                this._decodePromise = this._idleService.addRequest(
                    () => this.decodeDoc(),
                    ZenithScanFormulaViewNgDirective.docChangedIdleWaitTime,
                    ZenithScanFormulaViewNgDirective.docChangedDebounceInterval,
                );
            }
        }
    }

    private decodeDoc() {
        this._decodePromise = undefined;
        const scanEditor = this.scanEditor;
        if (scanEditor !== undefined) {
            const text = this._editorComponent.text;
            const setResult = this.setFormulaAsZenithText(scanEditor, text, this.instanceId);
            if (setResult !== undefined) {
                const progress = setResult.progress;
                const error = setResult.error;
                if (error === undefined) {
                    this._errorUiAction.pushValue('');
                    this._errorUiAction.pushReadonly();
                    this._decodeProgressComponent.setDecodeProgress(progress);
                } else {
                    const errorId = error.errorId;
                    let errorText = ScanFormulaZenithEncoding.Error.idToSummary(errorId);
                    const extraErrorText = error.extraErrorText;
                    if (extraErrorText !== undefined) {
                        errorText += ': ' + extraErrorText;
                    }
                    this._errorUiAction.pushValue(errorText);
                    this._errorUiAction.pushReadonly();
                    this._decodeProgressComponent.setDecodeProgress(progress);
                    this._decodeProgressComponent.displayed = true;
                }
            }
        }
        return Promise.resolve(undefined);
    }

    private processScanEditorFieldChanges(editor: ScanEditor, changedFieldIds: readonly ScanEditor.FieldId[], fieldChanger: ScanEditor.Modifier | undefined) {
        const text = this.getFormulaAsZenithTextIfChanged(editor, changedFieldIds);
        if (text !== undefined && fieldChanger !== this.instanceId) {
            this._editorComponent.text = text;
        }
    }

    private updateDecodeProgressDisplayed() {
        if (this._decodeProgressComponent.displayed) {
            this.decodeProgressSize = null;
            this.splitterGutterSize = 3;
        } else {
            this.decodeProgressSize = 0;
            this.splitterGutterSize = 0;
        }
    }

    private updateWidths() {
        const editorMinWidth = 20 * this._decodeProgressComponent.emWidth;
        this.editorMinSize = editorMinWidth;

        if (!this._splitterDragged) {
            const totalWidth = this.rootHtmlElement.offsetWidth;
            const availableTotalWidth = totalWidth - this.splitterGutterSize;

            let calculatedEditorWidth: Integer;
            let decodeProgressWidth = this._decodeProgressComponent.defaultWidth;
            if (decodeProgressWidth === undefined) {
                decodeProgressWidth = 15 * this._decodeProgressComponent.emWidth;
            }

            if (availableTotalWidth >= (decodeProgressWidth + this.editorMinSize)) {
                calculatedEditorWidth = availableTotalWidth - decodeProgressWidth;
            } else {
                calculatedEditorWidth = editorMinWidth;
            }

            this.editorSize = calculatedEditorWidth;
            this._cdr.markForCheck();
        }
    }

    protected abstract getFormulaAsZenithTextIfChanged(editor: ScanEditor, changedFieldIds: readonly ScanEditor.FieldId[]): string | undefined;
    protected abstract getFormulaAsZenithText(editor: ScanEditor): string | undefined;
    protected abstract setFormulaAsZenithText(
        editor: ScanEditor,
        text: string,
        fieldChanger: ScanEditor.Modifier,
    ): ScanEditor.SetAsZenithTextResult | undefined;
}

export namespace ZenithScanFormulaViewNgDirective {
    export const docChangedDebounceInterval = 500;
    export const docChangedIdleWaitTime = 200;
}
