/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
    ComponentFactoryResolver, OnDestroy, ViewChild,
    ViewContainerRef
} from '@angular/core';
import { BidAskSideId } from 'src/adi/internal-api';
import { CommandRegisterNgService } from 'src/component-services/ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent } from 'src/controls/ng-api';
import { ButtonUiAction, CommandRegisterService, IconButtonUiAction, InternalCommand, UiAction } from 'src/core/internal-api';
import { StringId } from 'src/res/internal-api';
import { assert, delay1Tick, UnreachableCaseError } from 'src/sys/internal-api';
import { DepthFrame } from '../../depth/internal-api';
import { GridLayoutEditorNgComponent } from '../../grid-layout-editor/ng-api';

@Component({
    selector: 'app-depth-grid-layouts-editor',
    templateUrl: './depth-grid-layouts-editor-ng.component.html',
    styleUrls: ['./depth-grid-layouts-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthGridLayoutsEditorNgComponent implements AfterViewInit, OnDestroy {
    @ViewChild('editor', { static: true }) private _editorComponent: GridLayoutEditorNgComponent;
    @ViewChild('bidDepthButton', { static: true }) private _bidDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('askDepthButton', { static: true }) private _askDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;

    private _commandRegisterService: CommandRegisterService;

    private _bidDepthUiAction: ButtonUiAction;
    private _askDepthUiAction: ButtonUiAction;
    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: DepthFrame.GridLayouts | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    private _layoutsWithHeadings: DepthFrame.GridLayoutsWithHeadings;
    private _sideId: BidAskSideId;

    constructor(private _cdr: ChangeDetectorRef, commandRegisterNgService: CommandRegisterNgService) {
        this._commandRegisterService = commandRegisterNgService.service;

        this._bidDepthUiAction = this.createBidDepthUiAction();
        this._askDepthUiAction = this.createAskDepthUiAction();
        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseChildComponents());
    }

    ngOnDestroy() {
        this._bidDepthUiAction.finalise();
        this._askDepthUiAction.finalise();
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    open(layoutsWithHeadings: DepthFrame.GridLayoutsWithHeadings): DepthGridLayoutsEditorNgComponent.ClosePromise {
        this._layoutsWithHeadings = layoutsWithHeadings;

        return new Promise<DepthFrame.GridLayouts | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSideId(value: BidAskSideId) {
//        this.checkUpdateLayoutFromEditor();

        if (value !== this._sideId) {
            switch (value) {
                case BidAskSideId.Bid:
                    this._editorComponent.setGridLayout(this._layoutsWithHeadings.bid);
                    this._bidDepthUiAction.pushSelected();
                    this._askDepthUiAction.pushUnselected();
                    break;

                case BidAskSideId.Ask:
                    this._editorComponent.setGridLayout(this._layoutsWithHeadings.ask);
                    this._askDepthUiAction.pushSelected();
                    this._bidDepthUiAction.pushUnselected();
                    break;

                default:
                    throw new UnreachableCaseError('DGLECSSI3232887', value);
            }

            this._sideId = value;
            this._cdr.markForCheck();
        }
    }

    private handleBidDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.setSideId(BidAskSideId.Bid);
    }

    private handleAskDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.setSideId(BidAskSideId.Ask);
    }

    private handleOkSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.close(true);
    }

    private handleCancelSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.close(false);
    }

    private createBidDepthUiAction() {
        const commandName = InternalCommand.Name.DepthGridsLayoutEditor_BidDepth;
        const displayId = StringId.BidDepth;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleBidDepthSignal(signalTypeId, downKeys);
        return action;
    }

    private createAskDepthUiAction() {
        const commandName = InternalCommand.Name.DepthGridsLayoutEditor_AskDepth;
        const displayId = StringId.AskDepth;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleAskDepthSignal(signalTypeId, downKeys);
        return action;
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Name.DepthGridsLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = (signalTypeId, downKeys) => this.handleOkSignal(signalTypeId, downKeys);
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Name.DepthGridsLayoutEditor_Cancel;
        const displayId = StringId.Cancel;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = (signalTypeId, downKeys) => this.handleCancelSignal(signalTypeId, downKeys);
        return action;
    }

    private initialiseChildComponents() {
        this._bidDepthButtonComponent.initialise(this._bidDepthUiAction);
        this._askDepthButtonComponent.initialise(this._askDepthUiAction);
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);
    }

    private checkUpdateLayoutFromEditor() {
        if (this._sideId !== undefined) {
            switch (this._sideId) {
                case BidAskSideId.Bid:
                    this._layoutsWithHeadings.bid.layout = this._editorComponent.getGridLayout();
                    break;

                case BidAskSideId.Ask:
                    this._layoutsWithHeadings.ask.layout = this._editorComponent.getGridLayout();
                    break;

                default:
                    throw new UnreachableCaseError('DGLECCULFE23235', this._sideId);
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            // this.checkUpdateLayoutFromEditor();
            const layouts: DepthFrame.GridLayouts = {
                bid: this._layoutsWithHeadings.bid.layout,
                ask: this._layoutsWithHeadings.ask.layout,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace DepthGridLayoutsEditorNgComponent {
    export type ClosePromise = Promise<DepthFrame.GridLayouts | undefined>;

    export function open(
        container: ViewContainerRef,
        resolver: ComponentFactoryResolver,
        layoutsWithHeadings: DepthFrame.GridLayoutsWithHeadings,
    ): ClosePromise {
        container.clear();
        const factory = resolver.resolveComponentFactory(DepthGridLayoutsEditorNgComponent);
        const componentRef = container.createComponent(factory);
        assert(componentRef.instance instanceof DepthGridLayoutsEditorNgComponent, 'ID:157271511202');

        const component = componentRef.instance as DepthGridLayoutsEditorNgComponent;

        return component.open(layoutsWithHeadings);
    }
}
