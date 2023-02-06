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
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    assert,
    ButtonUiAction,
    CommandRegisterService,
    delay1Tick,
    GridField, GridLayoutDefinition, GridLayoutOrNamedReferenceDefinition, IconButtonUiAction,
    InternalCommand,
    ModifierKey,
    StringId,
    UiAction,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ParidepthAllowedFieldsAndLayoutDefinitions, ParidepthGridLayoutDefinitions } from '../../grid-layout-editor-dialog-definition';
import { GridLayoutEditorNgComponent } from '../../grid-layout-editor/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-paridepth-grid-layouts-editor-dialog',
    templateUrl: './paridepth-grid-layouts-editor-dialog-ng.component.html',
    styleUrls: ['./paridepth-grid-layouts-editor-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParidepthGridLayoutsEditorDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('editor', { static: true }) private _editorComponent: GridLayoutEditorNgComponent;
    @ViewChild('bidDepthButton', { static: true }) private _bidDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('askDepthButton', { static: true }) private _askDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('watchlistButton', { static: true }) private _watchlistButtonComponent: ButtonInputNgComponent;
    @ViewChild('tradesButton', { static: true }) private _tradesButtonComponent: ButtonInputNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;

    private _commandRegisterService: CommandRegisterService;

    private _depthBidAllowedFields: readonly GridField[];
    private _depthAskAllowedFields: readonly GridField[];
    private _watchlistAllowedFields: readonly GridField[];
    private _tradesAllowedFields: readonly GridField[];

    private _depthBidLayoutDefinition: GridLayoutDefinition;
    private _depthAskLayoutDefinition: GridLayoutDefinition;
    private _watchlistLayoutDefinition: GridLayoutDefinition;
    private _tradesLayoutDefinition: GridLayoutDefinition;

    private _layoutId: ParidepthGridLayoutsEditorDialogNgComponent.LayoutId;

    private _bidDepthUiAction: ButtonUiAction;
    private _askDepthUiAction: ButtonUiAction;
    private _watchlistUiAction: ButtonUiAction;
    private _tradesUiAction: ButtonUiAction;
    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: ParidepthGridLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(private _cdr: ChangeDetectorRef, commandRegisterNgService: CommandRegisterNgService) {
        super();

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

    open(allowedFieldsAndLayoutDefinition: ParidepthAllowedFieldsAndLayoutDefinitions) {
        this._depthBidAllowedFields = allowedFieldsAndLayoutDefinition.depth.bid.allowedFields;
        this._depthAskAllowedFields = allowedFieldsAndLayoutDefinition.depth.ask.allowedFields;
        this._watchlistAllowedFields = allowedFieldsAndLayoutDefinition.watchlist.allowedFields;
        this._tradesAllowedFields = allowedFieldsAndLayoutDefinition.trades.allowedFields;

        this._depthBidLayoutDefinition = allowedFieldsAndLayoutDefinition.depth.bid.layoutDefinition;
        this._depthAskLayoutDefinition = allowedFieldsAndLayoutDefinition.depth.ask.layoutDefinition;
        this._watchlistLayoutDefinition = allowedFieldsAndLayoutDefinition.watchlist.layoutDefinition;
        this._tradesLayoutDefinition = allowedFieldsAndLayoutDefinition.trades.layoutDefinition;

        return new Promise<ParidepthGridLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSideId(value: ParidepthGridLayoutsEditorDialogNgComponent.LayoutId) {
        this.checkUpdateLayoutFromEditor();

        this.allPushUnselected();

        if (value !== this._layoutId) {
            switch (this._layoutId) {
                case ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.BidDepth:
                    this._editorComponent.setAllowedFieldsAndLayoutDefinition(this._depthBidAllowedFields, this._depthBidLayoutDefinition);
                    this._bidDepthUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.AskDepth:
                    this._editorComponent.setAllowedFieldsAndLayoutDefinition(this._depthAskAllowedFields, this._depthAskLayoutDefinition);
                    this._askDepthUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.Watchlist:
                    this._editorComponent.setAllowedFieldsAndLayoutDefinition(
                        this._watchlistAllowedFields,
                        this._watchlistLayoutDefinition
                    );
                    this._watchlistUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.Trades:
                    this._editorComponent.setAllowedFieldsAndLayoutDefinition(this._tradesAllowedFields, this._tradesLayoutDefinition);
                    this._tradesUiAction.pushSelected();
                    break;

                default:
                    throw new UnreachableCaseError('PGLECCULFE33333', this._layoutId);
            }

            this._layoutId = value;
            this._cdr.markForCheck();
        }
    }

    private handleBidDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.BidDepth);
    }

    private handleAskDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.AskDepth);
    }

    private handleWatchlistSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.AskDepth);
    }

    private handleTradesSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.AskDepth);
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

    private checkUpdateLayoutFromEditor() {
        if (this._layoutId !== undefined) {
            switch (this._layoutId) {
                case ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.BidDepth:
                    this._depthBidLayoutDefinition = this._editorComponent.getGridLayoutDefinition();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.AskDepth:
                    this._depthAskLayoutDefinition = this._editorComponent.getGridLayoutDefinition();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.Watchlist:
                    this._watchlistLayoutDefinition = this._editorComponent.getGridLayoutDefinition();
                    break;

                case ParidepthGridLayoutsEditorDialogNgComponent.LayoutId.Trades:
                    this._tradesLayoutDefinition = this._editorComponent.getGridLayoutDefinition();
                    break;

                default:
                    throw new UnreachableCaseError('PGLECCULFE33333', this._layoutId);
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            this.checkUpdateLayoutFromEditor();
            const layouts: ParidepthGridLayoutDefinitions = {
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
    export const enum LayoutId {
        BidDepth,
        AskDepth,
        Watchlist,
        Trades,
    }

    export type ClosePromise = Promise<ParidepthGridLayoutDefinitions | undefined>;

    export function open(
        container: ViewContainerRef,
        allowedFieldsAndLayoutDefinition: ParidepthAllowedFieldsAndLayoutDefinitions
    ): ClosePromise {
        container.clear();
        const componentRef = container.createComponent(ParidepthGridLayoutsEditorDialogNgComponent);
        assert(componentRef.instance instanceof ParidepthGridLayoutsEditorDialogNgComponent, 'ID:157271511202');

        const component = componentRef.instance;

        return component.open(allowedFieldsAndLayoutDefinition);
    }
}
