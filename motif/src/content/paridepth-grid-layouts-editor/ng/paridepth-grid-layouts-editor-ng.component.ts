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
    ComponentFactoryResolver,
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { GridLayout } from '@motifmarkets/revgrid';
import { CommandRegisterNgService } from 'src/component-services/ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent } from 'src/controls/ng-api';
import {
    ButtonUiAction,
    CommandRegisterService,
    GridLayoutDataStore,
    IconButtonUiAction,
    InternalCommand,
    UiAction
} from 'src/core/internal-api';
import { StringId } from 'src/res/internal-api';
import { assert, delay1Tick, UnreachableCaseError } from 'src/sys/internal-api';
import { DepthFrame } from '../../depth/internal-api';
import { GridLayoutEditorNgComponent } from '../../grid-layout-editor/ng-api';

@Component({
    selector: 'app-paridepth-grid-layouts-editor',
    templateUrl: './paridepth-grid-layouts-editor-ng.component.html',
    styleUrls: ['./paridepth-grid-layouts-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParidepthGridLayoutsEditorNgComponent implements AfterViewInit, OnDestroy {
    @ViewChild('editor', { static: true }) private _editorComponent: GridLayoutEditorNgComponent;
    @ViewChild('bidDepthButton', { static: true }) private _bidDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('askDepthButton', { static: true }) private _askDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('watchlistButton', { static: true }) private _watchlistButtonComponent: ButtonInputNgComponent;
    @ViewChild('tradesButton', { static: true }) private _tradesButtonComponent: ButtonInputNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;

    private _commandRegisterService: CommandRegisterService;

    private _layoutsWithHeadings: ParidepthGridLayoutsEditorNgComponent.GridLayoutsWithHeadings;
    private _layoutId: ParidepthGridLayoutsEditorNgComponent.LayoutId;

    private _bidDepthUiAction: ButtonUiAction;
    private _askDepthUiAction: ButtonUiAction;
    private _watchlistUiAction: ButtonUiAction;
    private _tradesUiAction: ButtonUiAction;
    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: ParidepthGridLayoutsEditorNgComponent.GridLayouts | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(private _cdr: ChangeDetectorRef, commandRegisterNgService: CommandRegisterNgService) {
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

    open(layoutsWithHeadings: ParidepthGridLayoutsEditorNgComponent.GridLayoutsWithHeadings) {
        this._layoutsWithHeadings = layoutsWithHeadings;

        return new Promise<ParidepthGridLayoutsEditorNgComponent.GridLayouts | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSideId(value: ParidepthGridLayoutsEditorNgComponent.LayoutId) {
        this.checkUpdateLayoutFromEditor();

        this.allPushUnselected();

        if (value !== this._layoutId) {
            switch (this._layoutId) {
                case ParidepthGridLayoutsEditorNgComponent.LayoutId.BidDepth:
                    this._editorComponent.setGridLayout(this._layoutsWithHeadings.depth.bid);
                    this._bidDepthUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorNgComponent.LayoutId.AskDepth:
                    this._editorComponent.setGridLayout(this._layoutsWithHeadings.depth.ask);
                    this._askDepthUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorNgComponent.LayoutId.Watchlist:
                    this._editorComponent.setGridLayout(this._layoutsWithHeadings.watchlist);
                    this._watchlistUiAction.pushSelected();
                    break;

                case ParidepthGridLayoutsEditorNgComponent.LayoutId.Trades:
                    this._editorComponent.setGridLayout(this._layoutsWithHeadings.trades);
                    this._tradesUiAction.pushSelected();
                    break;

                default:
                    throw new UnreachableCaseError('PGLECCULFE33333', this._layoutId);
            }

            this._layoutId = value;
            this._cdr.markForCheck();
        }
    }

    private handleBidDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.setSideId(ParidepthGridLayoutsEditorNgComponent.LayoutId.BidDepth);
    }

    private handleAskDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.setSideId(ParidepthGridLayoutsEditorNgComponent.LayoutId.AskDepth);
    }

    private handleWatchlistSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.setSideId(ParidepthGridLayoutsEditorNgComponent.LayoutId.AskDepth);
    }

    private handleTradesSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.setSideId(ParidepthGridLayoutsEditorNgComponent.LayoutId.AskDepth);
    }

    private handleOkSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.close(true);
    }

    private handleCancelSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.close(false);
    }

    private createBidDepthUiAction() {
        const commandName = InternalCommand.Name.PariDepthGridsLayoutEditor_BidDepth;
        const displayId = StringId.BidDepth;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleBidDepthSignal(signalTypeId, downKeys);
        return action;
    }

    private createAskDepthUiAction() {
        const commandName = InternalCommand.Name.PariDepthGridsLayoutEditor_AskDepth;
        const displayId = StringId.AskDepth;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleAskDepthSignal(signalTypeId, downKeys);
        return action;
    }

    private createWatchlistUiAction() {
        const commandName = InternalCommand.Name.PariDepthGridsLayoutEditor_Watchlist;
        const displayId = StringId.Watchlist;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleWatchlistSignal(signalTypeId, downKeys);
        return action;
    }

    private createTradesUiAction() {
        const commandName = InternalCommand.Name.PariDepthGridsLayoutEditor_Trades;
        const displayId = StringId.Trades;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleTradesSignal(signalTypeId, downKeys);
        return action;
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Name.PariDepthGridsLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = (signalTypeId, downKeys) => this.handleOkSignal(signalTypeId, downKeys);
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Name.PariDepthGridsLayoutEditor_Cancel;
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
                case ParidepthGridLayoutsEditorNgComponent.LayoutId.BidDepth:
                    this._layoutsWithHeadings.depth.bid.layout = this._editorComponent.getGridLayout();
                    break;

                case ParidepthGridLayoutsEditorNgComponent.LayoutId.AskDepth:
                    this._layoutsWithHeadings.depth.ask.layout = this._editorComponent.getGridLayout();
                    break;

                case ParidepthGridLayoutsEditorNgComponent.LayoutId.Watchlist:
                    this._layoutsWithHeadings.watchlist.layout = this._editorComponent.getGridLayout();
                    break;

                case ParidepthGridLayoutsEditorNgComponent.LayoutId.Trades:
                    this._layoutsWithHeadings.trades.layout = this._editorComponent.getGridLayout();
                    break;

                default:
                    throw new UnreachableCaseError('PGLECCULFE33333', this._layoutId);
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            this.checkUpdateLayoutFromEditor();
            const layouts: ParidepthGridLayoutsEditorNgComponent.GridLayouts = {
                depth: {
                    bid: this._layoutsWithHeadings.depth.bid.layout,
                    ask: this._layoutsWithHeadings.depth.ask.layout,
                },
                watchlist: this._layoutsWithHeadings.watchlist.layout,
                trades: this._layoutsWithHeadings.trades.layout,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace ParidepthGridLayoutsEditorNgComponent {
    export const enum LayoutId {
        BidDepth,
        AskDepth,
        Watchlist,
        Trades,
    }

    export interface GridLayouts {
        watchlist: GridLayout;
        depth: DepthFrame.GridLayouts;
        trades: GridLayout;
    }

    export interface GridLayoutsWithHeadings {
        watchlist: GridLayoutDataStore.GridLayoutWithHeaders;
        depth: DepthFrame.GridLayoutsWithHeadings;
        trades: GridLayoutDataStore.GridLayoutWithHeaders;
    }

    export type ClosePromise = Promise<GridLayouts | undefined>;

    export function open(
        container: ViewContainerRef,
        resolver: ComponentFactoryResolver,
        layoutsWithHeadings: GridLayoutsWithHeadings,
    ): ClosePromise {
        container.clear();
        const factory = resolver.resolveComponentFactory(ParidepthGridLayoutsEditorNgComponent);
        const componentRef = container.createComponent(factory);
        assert(componentRef.instance instanceof ParidepthGridLayoutsEditorNgComponent, 'ID:157271511202');

        const component = componentRef.instance as ParidepthGridLayoutsEditorNgComponent;

        return component.open(layoutsWithHeadings);
    }
}
