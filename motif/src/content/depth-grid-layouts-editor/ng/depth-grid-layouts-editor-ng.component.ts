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
    assert, ButtonUiAction,
    CommandRegisterService,
    delay1Tick,
    GridField,
    GridLayoutDefinition,
    IconButtonUiAction,
    InternalCommand,
    ModifierKey, OrderSideId, StringId,
    UiAction,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { DepthFrame } from '../../depth/internal-api';
import { GridLayoutEditorNgComponent } from '../../grid-layout-editor/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-depth-grid-layouts-editor',
    templateUrl: './depth-grid-layouts-editor-ng.component.html',
    styleUrls: ['./depth-grid-layouts-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthGridLayoutsEditorNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('editor', { static: true }) private _editorComponent: GridLayoutEditorNgComponent;
    @ViewChild('bidDepthButton', { static: true }) private _bidDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('askDepthButton', { static: true }) private _askDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;

    private readonly _commandRegisterService: CommandRegisterService;

    private readonly _bidDepthUiAction: ButtonUiAction;
    private readonly _askDepthUiAction: ButtonUiAction;
    private readonly _okUiAction: IconButtonUiAction;
    private readonly _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: DepthFrame.GridLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    private _bidAllowedFields: readonly GridField[];
    private _bidLayoutDefinition: GridLayoutDefinition;
    private _askAllowedFields: readonly GridField[];
    private _askLayoutDefinition: GridLayoutDefinition;
    private _allowedFieldsAndLayoutDefinitions: DepthFrame.AllowedFieldsAndLayoutDefinitions;
    private _sideId: OrderSideId;

    constructor(private _cdr: ChangeDetectorRef, commandRegisterNgService: CommandRegisterNgService) {
        super();

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

    open(allowedFieldsAndLayoutDefinitions: DepthFrame.AllowedFieldsAndLayoutDefinitions): DepthGridLayoutsEditorNgComponent.ClosePromise {
        const { bid, ask } = allowedFieldsAndLayoutDefinitions;
        this._bidAllowedFields = bid.allowedFields;
        this._bidLayoutDefinition = bid.layoutDefinition;
        this._askAllowedFields = ask.allowedFields;
        this._askLayoutDefinition = ask.layoutDefinition;

        return new Promise<DepthFrame.GridLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSideId(value: OrderSideId) {
//        this.checkUpdateLayoutFromEditor();

        if (value !== this._sideId) {
            switch (value) {
                case OrderSideId.Bid:
                    this._editorComponent.setAllowedFieldsAndLayoutDefinition({
                        allowedFields: this._bidAllowedFields,
                        layoutDefinition: this._bidLayoutDefinition
                    });
                    this._bidDepthUiAction.pushSelected();
                    this._askDepthUiAction.pushUnselected();
                    break;

                case OrderSideId.Ask:
                    this._editorComponent.setAllowedFieldsAndLayoutDefinition({
                        allowedFields: this._askAllowedFields,
                        layoutDefinition: this._askLayoutDefinition
                    });
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

    private handleBidDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(OrderSideId.Bid);
    }

    private handleAskDepthSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.setSideId(OrderSideId.Ask);
    }

    private handleOkSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close(true);
    }

    private handleCancelSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close(false);
    }

    private createBidDepthUiAction() {
        const commandName = InternalCommand.Id.DepthGridsLayoutEditor_BidDepth;
        const displayId = StringId.BidDepth;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleBidDepthSignal(signalTypeId, downKeys);
        return action;
    }

    private createAskDepthUiAction() {
        const commandName = InternalCommand.Id.DepthGridsLayoutEditor_AskDepth;
        const displayId = StringId.AskDepth;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = (signalTypeId, downKeys) => this.handleAskDepthSignal(signalTypeId, downKeys);
        return action;
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Id.DepthGridsLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = (signalTypeId, downKeys) => this.handleOkSignal(signalTypeId, downKeys);
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.DepthGridsLayoutEditor_Cancel;
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
                case OrderSideId.Bid:
                    this._bidLayoutDefinition = this._editorComponent.getGridLayoutDefinition();
                    break;

                case OrderSideId.Ask:
                    this._askLayoutDefinition = this._editorComponent.getGridLayoutDefinition();
                    break;

                default:
                    throw new UnreachableCaseError('DGLECCULFE23235', this._sideId);
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            // this.checkUpdateLayoutFromEditor();
            const layouts: DepthFrame.GridLayoutDefinitions = {
                bid: this._bidLayoutDefinition,
                ask: this._askLayoutDefinition,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace DepthGridLayoutsEditorNgComponent {
    export type ClosePromise = Promise<DepthFrame.GridLayoutDefinitions | undefined>;

    export function open(
        container: ViewContainerRef,
        layoutsWithHeadings: DepthFrame.AllowedFieldsAndLayoutDefinitions,
    ): ClosePromise {
        container.clear();
        const componentRef = container.createComponent(DepthGridLayoutsEditorNgComponent);
        assert(componentRef.instance instanceof DepthGridLayoutsEditorNgComponent, 'ID:157271511202');

        const component = componentRef.instance as DepthGridLayoutsEditorNgComponent;

        return component.open(layoutsWithHeadings);
    }
}
