/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injector,
    OnDestroy,
    ValueProvider,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AllowedGridField,
    AssertInternalError,
    ButtonUiAction,
    CommandRegisterService,
    EditableGridLayoutDefinitionColumnList,
    GridField,
    GridLayoutDefinition,
    GridLayoutOrNamedReferenceDefinition,
    IconButtonUiAction,
    InternalCommand,
    ModifierKey,
    StringId,
    UiAction,
    UnreachableCaseError,
    assert,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ParidepthDitemFrame } from 'ditem-internal-api';
import { GridLayoutEditorNgComponent, allowedFieldsInjectionToken, definitionColumnListInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-paridepth-grid-layouts-editor-dialog',
    templateUrl: './paridepth-grid-layouts-editor-dialog-ng.component.html',
    styleUrls: ['./paridepth-grid-layouts-editor-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParidepthGridLayoutsEditorDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('bidDepthButton', { static: true }) private _bidDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('askDepthButton', { static: true }) private _askDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('watchlistButton', { static: true }) private _watchlistButtonComponent: ButtonInputNgComponent;
    @ViewChild('tradesButton', { static: true }) private _tradesButtonComponent: ButtonInputNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;
    @ViewChild('editorContainer', { read: ViewContainerRef, static: true }) private _editorContainer: ViewContainerRef;

    private _commandRegisterService: CommandRegisterService;

    private _depthBidAllowedFields: readonly GridField[];
    private _depthAskAllowedFields: readonly GridField[];
    private _watchlistAllowedFields: readonly GridField[];
    private _tradesAllowedFields: readonly GridField[];

    private _depthBidLayoutDefinition: GridLayoutDefinition;
    private _depthAskLayoutDefinition: GridLayoutDefinition;
    private _watchlistLayoutDefinition: GridLayoutDefinition;
    private _tradesLayoutDefinition: GridLayoutDefinition;

    private _bidDepthUiAction: ButtonUiAction;
    private _askDepthUiAction: ButtonUiAction;
    private _watchlistUiAction: ButtonUiAction;
    private _tradesUiAction: ButtonUiAction;
    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _activeParidepthFrameId: ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId | undefined;
    private _editorComponent: GridLayoutEditorNgComponent | undefined;

    private _closeResolve: (value: ParidepthDitemFrame.GridLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(elRef: ElementRef<HTMLElement>, private _cdr: ChangeDetectorRef, commandRegisterNgService: CommandRegisterNgService) {
        super(elRef, ++ParidepthGridLayoutsEditorDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._bidDepthUiAction = this.createBidDepthUiAction();
        this._askDepthUiAction = this.createAskDepthUiAction();
        this._watchlistUiAction = this.createWatchlistUiAction();
        this._tradesUiAction = this.createTradesUiAction();
        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        this._bidDepthUiAction.finalise();
        this._askDepthUiAction.finalise();
        this._watchlistUiAction.finalise();
        this._tradesUiAction.finalise();
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    open(allowedFieldsAndLayoutDefinition: ParidepthDitemFrame.AllowedFieldsAndLayoutDefinitions) {
        this._depthBidAllowedFields = allowedFieldsAndLayoutDefinition.depth.bid.allowedFields;
        this._depthAskAllowedFields = allowedFieldsAndLayoutDefinition.depth.ask.allowedFields;
        this._watchlistAllowedFields = allowedFieldsAndLayoutDefinition.watchlist.allowedFields;
        this._tradesAllowedFields = allowedFieldsAndLayoutDefinition.trades.allowedFields;

        this._depthBidLayoutDefinition = allowedFieldsAndLayoutDefinition.depth.bid.createCopy();
        this._depthAskLayoutDefinition = allowedFieldsAndLayoutDefinition.depth.ask.createCopy();
        this._watchlistLayoutDefinition = allowedFieldsAndLayoutDefinition.watchlist.createCopy();
        this._tradesLayoutDefinition = allowedFieldsAndLayoutDefinition.trades.createCopy();

        return new Promise<ParidepthDitemFrame.GridLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSideId(value: ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId) {
        this.allPushUnselected();

        if (value !== this._activeParidepthFrameId) {
            switch (value) {
                case ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.BidDepth:
                    this._editorComponent = this.recreateEditor(this._depthBidAllowedFields, this._depthBidLayoutDefinition);
                    this._bidDepthUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.AskDepth:
                    this._editorComponent = this.recreateEditor(this._depthAskAllowedFields, this._depthAskLayoutDefinition);
                    this._askDepthUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.Watchlist:
                    this._editorComponent = this.recreateEditor(this._watchlistAllowedFields, this._watchlistLayoutDefinition);
                    this._watchlistUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.Trades:
                    this._editorComponent = this.recreateEditor(this._tradesAllowedFields, this._tradesLayoutDefinition);
                    this._tradesUiAction.pushSelected();
                    break;

                case undefined:
                    throw new AssertInternalError('PGLECCULFEU33333');

                default:
                    throw new UnreachableCaseError('PGLECCULFED33333', value);
            }

            this._activeParidepthFrameId = value;
            this._cdr.markForCheck();
        }
    }

    private handleBidDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.BidDepth);
    }

    private handleAskDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.AskDepth);
    }

    private handleWatchlistSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.AskDepth);
    }

    private handleTradesSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.AskDepth);
    }

    private handleOkSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close(true);
    }

    private handleCancelSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close(false);
    }

    private createBidDepthUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_BidDepth;
        const displayId = StringId.BidDepth;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleBidDepthSignal(signalTypeId, downKeys);
        return action;
    }

    private createAskDepthUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_AskDepth;
        const displayId = StringId.AskDepth;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleAskDepthSignal(signalTypeId, downKeys);
        return action;
    }

    private createWatchlistUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_Watchlist;
        const displayId = StringId.Watchlist;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleWatchlistSignal(signalTypeId, downKeys);
        return action;
    }

    private createTradesUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_Trades;
        const displayId = StringId.Trades;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleTradesSignal(signalTypeId, downKeys);
        return action;
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = (signalTypeId, downKeys) => this.handleOkSignal(signalTypeId, downKeys);
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_Cancel;
        const displayId = StringId.Cancel;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = (signalTypeId, downKeys) => this.handleCancelSignal(signalTypeId, downKeys);
        return action;
    }

    private initialiseComponents() {
        this._bidDepthButtonComponent.initialise(this._bidDepthUiAction);
        this._askDepthButtonComponent.initialise(this._askDepthUiAction);
        this._watchlistButtonComponent.initialise(this._watchlistUiAction);
        this._tradesButtonComponent.initialise(this._tradesUiAction);
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);
    }

    private allPushUnselected() {
        this._bidDepthUiAction.pushUnselected();
        this._askDepthUiAction.pushUnselected();
        this._watchlistUiAction.pushUnselected();
        this._tradesUiAction.pushUnselected();
    }

    private recreateEditor(allowedFields: readonly AllowedGridField[], layoutDefinition: GridLayoutDefinition) {
        this.checkLoadLayoutFromEditor();

        if (this._editorComponent !== undefined) {
            this._editorContainer.clear();
        }

        const allowedFieldsProvider: ValueProvider = {
            provide: allowedFieldsInjectionToken,
            useValue: allowedFields,
        };

        const definitionColumnList = new EditableGridLayoutDefinitionColumnList();
        definitionColumnList.load(allowedFields, layoutDefinition, 0);
        const columnListProvider: ValueProvider = {
            provide: definitionColumnListInjectionToken,
            useValue: definitionColumnList,
        };

        const injector = Injector.create({
            providers: [allowedFieldsProvider, columnListProvider],
        });

        const componentRef = this._editorContainer.createComponent(GridLayoutEditorNgComponent, { injector });
        const component = componentRef.instance;

        return component;
    }

    private checkLoadLayoutFromEditor() {
        const activeParidepthFrameId = this._activeParidepthFrameId;
        if (activeParidepthFrameId !== undefined) {
            const editorComponent = this._editorComponent;
            if (editorComponent === undefined) {
                throw new AssertInternalError('PGLEDNCCLLFEE33333');
            } else {
                switch (activeParidepthFrameId) {
                    case ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.BidDepth:
                        this._depthBidLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    case ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.AskDepth:
                        this._depthAskLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    case ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.Watchlist:
                        this._watchlistLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    case ParidepthGridLayoutsEditorDialogNgComponent.ParidepthFrameId.Trades:
                        this._tradesLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    default:
                        throw new UnreachableCaseError('PGLECCULFEU33333', activeParidepthFrameId);
                }
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            this.checkLoadLayoutFromEditor();
            const layouts: ParidepthDitemFrame.GridLayoutDefinitions = {
                depth: {
                    bid: this._depthBidLayoutDefinition,
                    ask: this._depthAskLayoutDefinition,
                },
                watchlist: new GridLayoutOrNamedReferenceDefinition(this._watchlistLayoutDefinition),
                trades: this._tradesLayoutDefinition,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace ParidepthGridLayoutsEditorDialogNgComponent {
    export const enum ParidepthFrameId {
        BidDepth,
        AskDepth,
        Watchlist,
        Trades,
    }

    export type ClosePromise = Promise<ParidepthDitemFrame.GridLayoutDefinitions | undefined>;

    export function open(
        container: ViewContainerRef,
        allowedFieldsAndLayoutDefinition: ParidepthDitemFrame.AllowedFieldsAndLayoutDefinitions
    ): ClosePromise {
        container.clear();
        const componentRef = container.createComponent(ParidepthGridLayoutsEditorDialogNgComponent);
        assert(componentRef.instance instanceof ParidepthGridLayoutsEditorDialogNgComponent, 'ID:157271511202');

        const component = componentRef.instance;

        return component.open(allowedFieldsAndLayoutDefinition);
    }
}
