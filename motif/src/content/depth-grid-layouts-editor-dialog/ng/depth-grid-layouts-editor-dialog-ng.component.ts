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
    Inject,
    Injector,
    OnDestroy,
    ValueProvider,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AllowedGridField,
    AssertInternalError,
    BidAskAllowedFieldsGridLayoutDefinitions,
    BidAskAllowedGridFields,
    BidAskGridLayoutDefinitions,
    ButtonUiAction,
    CommandRegisterService,
    EditableGridLayoutDefinitionColumnList,
    GridLayoutDefinition,
    IconButtonUiAction,
    InternalCommand,
    LockOpenListItem,
    ModifierKey, OrderSideId, StringId,
    UiAction,
    UnreachableCaseError,
    assert,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { GridLayoutEditorNgComponent, allowedFieldsInjectionToken, bidAskAllowedFieldsInjectionToken, definitionColumnListInjectionToken, oldBidAskLayoutDefinitionInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-depth-grid-layouts-editor-dialog',
    templateUrl: './depth-grid-layouts-editor-dialog-ng.component.html',
    styleUrls: ['./depth-grid-layouts-editor-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthGridLayoutsEditorDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('bidDepthButton', { static: true }) private _bidDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('askDepthButton', { static: true }) private _askDepthButtonComponent: ButtonInputNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;
    @ViewChild('editorContainer', { read: ViewContainerRef, static: true }) private _editorContainer: ViewContainerRef;

    private readonly _commandRegisterService: CommandRegisterService;

    private readonly _bidDepthUiAction: ButtonUiAction;
    private readonly _askDepthUiAction: ButtonUiAction;
    private readonly _okUiAction: IconButtonUiAction;
    private readonly _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: BidAskGridLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    private _bidLayoutDefinition: GridLayoutDefinition;
    private _askLayoutDefinition: GridLayoutDefinition;
    private _sideId: OrderSideId | undefined;
    private _editorComponent: GridLayoutEditorNgComponent | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(bidAskAllowedFieldsInjectionToken) private readonly _bidAskAllowedFields: BidAskAllowedGridFields,
        @Inject(oldBidAskLayoutDefinitionInjectionToken) private readonly _oldBidAskLayoutDefinitions: BidAskGridLayoutDefinitions,
    ) {
        super(elRef, ++DepthGridLayoutsEditorDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._bidDepthUiAction = this.createBidDepthUiAction();
        this._askDepthUiAction = this.createAskDepthUiAction();
        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._bidLayoutDefinition = this._oldBidAskLayoutDefinitions.bid.createCopy();
        this._askLayoutDefinition = this._oldBidAskLayoutDefinitions.ask.createCopy();
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

    open(): DepthGridLayoutsEditorDialogNgComponent.ClosePromise {
        return new Promise<BidAskGridLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSideId(value: OrderSideId) {
        this.checkLoadLayoutFromEditor();

        if (value !== this._sideId) {
            switch (value) {
                case OrderSideId.Bid:
                    this._editorComponent = this.recreateEditor(this._bidAskAllowedFields.bid, this._oldBidAskLayoutDefinitions.bid);
                    this._bidDepthUiAction.pushSelected();
                    this._askDepthUiAction.pushUnselected();
                    break;

                case OrderSideId.Ask:
                    this._editorComponent = this.recreateEditor(this._bidAskAllowedFields.ask, this._oldBidAskLayoutDefinitions.ask);
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
        const sideId = this._sideId;
        if (sideId !== undefined) {
            const editorComponent = this._editorComponent;
            if (editorComponent === undefined) {
                throw new AssertInternalError('DGLEDNCCLLFEE23235');
            } else {
                switch (sideId) {
                    case OrderSideId.Bid:
                        this._bidLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    case OrderSideId.Ask:
                        this._askLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    default:
                        throw new UnreachableCaseError('DGLECCULFEU23235', sideId);
                }
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            this.checkLoadLayoutFromEditor();
            const layouts: BidAskGridLayoutDefinitions = {
                bid: this._bidLayoutDefinition,
                ask: this._askLayoutDefinition,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace DepthGridLayoutsEditorDialogNgComponent {
    export type ClosePromise = Promise<BidAskGridLayoutDefinitions | undefined>;

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        allowedFieldsGridLayoutDefinitions: BidAskAllowedFieldsGridLayoutDefinitions,
    ): ClosePromise {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const bidAskAllowedFields: BidAskAllowedGridFields = {
            bid: allowedFieldsGridLayoutDefinitions.bid.allowedFields,
            ask: allowedFieldsGridLayoutDefinitions.ask.allowedFields,
        };

        const bidAskGridLayoutDefinitions: BidAskGridLayoutDefinitions = {
            bid: allowedFieldsGridLayoutDefinitions.bid,
            ask: allowedFieldsGridLayoutDefinitions.ask,
        };

        const bidAskAllowedFieldsProvider: ValueProvider = {
            provide: bidAskAllowedFieldsInjectionToken,
            useValue: bidAskAllowedFields,
        };
        const oldBidAskLayoutDefinitionProvider: ValueProvider = {
            provide: oldBidAskLayoutDefinitionInjectionToken,
            useValue: bidAskGridLayoutDefinitions,
        };
        const injector = Injector.create({
            providers: [openerProvider, bidAskAllowedFieldsProvider, oldBidAskLayoutDefinitionProvider],
        });

        const componentRef = container.createComponent(DepthGridLayoutsEditorDialogNgComponent, { injector });
        assert(componentRef.instance instanceof DepthGridLayoutsEditorDialogNgComponent, 'ID:157271511202');

        const component = componentRef.instance;

        return component.open();
    }
}
