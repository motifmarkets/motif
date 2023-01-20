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
    OnDestroy,
    ViewChild
} from '@angular/core';
import {
    delay1Tick,
    IconButtonUiAction,
    InternalCommand,
    JsonElement,
    LitIvemIdUiAction,
    ModifierKey,
    StringId,
    Strings
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreNgService, SettingsNgService } from 'component-services-ng-api';
import { AdaptedRevgrid } from 'content-internal-api';
import { GridLayoutEditorNgComponent, GridSourceNgComponent } from 'content-ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { EtoPriceQuotationDitemFrame } from '../eto-price-quotation-ditem-frame';

@Component({
    selector: 'app-eto-price-quotation-ditem',
    templateUrl: './eto-price-quotation-ditem-ng.component.html',
    styleUrls: ['./eto-price-quotation-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EtoPriceQuotationDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {

    @ViewChild('symbolInput', { static: true }) private _symbolEditComponent: LitIvemIdSelectNgComponent;
    @ViewChild('symbolButton', { static: true }) private _symbolButtonComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('watchGridSource', { static: true }) private _watchGridSourceComponent: GridSourceNgComponent;
    @ViewChild('callPutGridSource', { static: true }) private _callPutGridSourceComponent: GridSourceNgComponent;
    @ViewChild('layoutEditor', { static: true }) private _layoutEditorComponent: GridLayoutEditorNgComponent;

    public readonly frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    private _symbolEditUiAction: LitIvemIdUiAction;
    private _applySymbolUiAction: IconButtonUiAction;
    private _selectColumnsUiAction: IconButtonUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _modeId = EtoPriceQuotationDitemNgComponent.ModeId.Input;
    private _frame: EtoPriceQuotationDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        pulseService: CoreNgService
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new EtoPriceQuotationDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, pulseService.symbolsService, pulseService.adiService);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._applySymbolUiAction = this.createApplySymbolUiAction();
        this._selectColumnsUiAction = this.createSelectColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol();
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return EtoPriceQuotationDitemNgComponent.stateSchemaVersion; }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this.finalise();
    }

    isInputMode() {
        return this._modeId === EtoPriceQuotationDitemNgComponent.ModeId.Input;
    }

    isLayoutEditorMode() {
        return this._modeId === EtoPriceQuotationDitemNgComponent.ModeId.LayoutDialog;
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._watchGridSourceComponent.frame, this._callPutGridSourceComponent.frame, frameElement);

        // this._frame.ensureOpened();

        this._symbolEditComponent.focus();

        this.initialiseChildComponents();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._applySymbolUiAction.finalise();
        this._selectColumnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);
    }

    protected save(element: JsonElement) {
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleSymbolCommitEvent() {
        this.commitSymbol();
    }

    private handleSymbolInputEvent() {
        if (this._symbolEditUiAction.inputtedText === '') {
            this._applySymbolUiAction.pushDisabled();
        } else {
            this._applySymbolUiAction.pushUnselected();
        }
    }

    private handleSymbolSignalEvent() {
        this.commitSymbol();
    }

    private handleColumnsSignalEvent(downKeys: ModifierKey.IdSet) {
        // let layoutWithHeadings: GridLayoutRecordStore.LayoutWithHeadersMap;
        // if (ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift)) {
        //     layoutWithHeadings = this._watchGridSourceComponent.frame.getGridLayoutWithHeadersMap();
        // } else {
        //     layoutWithHeadings = this._callPutGridSourceComponent.frame.getGridLayoutWithHeadersMap();
        // }
        // this._modeId = EtoPriceQuotationDitemNgComponent.ModeId.LayoutDialog;
        // this._layoutEditorComponent.setAllowedFieldsAndLayoutDefinition(layoutWithHeadings);
    }

    private handleAutoSizeColumnWidthsSignalEvent() {
        // TODO
    }

    private handleLayoutEditorComponentCloseEvent(ok: boolean) {
        // if (ok) {
        //     const layout = this._layoutEditorComponent.getGridLayoutDefinition();
        //     // need to work out which is being edited
        //     this._watchGridSourceComponent.frame.gridLoadLayout(layout);
        // }
        // this._modeId = EtoPriceQuotationDitemNgComponent.ModeId.Input;
    }

    private createSymbolEditUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.EtoPriceQuotationSymbolInputTitle]);
        action.commitEvent = () => this.handleSymbolCommitEvent();
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createApplySymbolUiAction() {
        const commandName = InternalCommand.Id.EtoPriceQuotation_ApplySymbol;
        const displayId = StringId.EtoPriceQuotationApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.EtoPriceQuotationApplySymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.signalEvent = () => this.handleSymbolSignalEvent();
        return action;
    }

    private createSelectColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = (signalTypeId, downKeys) => this.handleColumnsSignalEvent(downKeys);
        return action;
    }

    private createAutoSizeColumnWidthsUiAction() {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        action.signalEvent = () => this.handleAutoSizeColumnWidthsSignalEvent();
        return action;
    }


    private initialiseChildComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._applySymbolUiAction);
        this._columnsButtonComponent.initialise(this._selectColumnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
    }

    private pushSymbol() {
        this._symbolEditUiAction.pushValue(this._frame.litIvemId);
    }

    private commitSymbol() {
        const litIvemId = this._symbolEditUiAction.value;
        if (litIvemId !== undefined) {
            this._frame.setLitIvemIdFromDitem(litIvemId);
            this._symbolEditUiAction.pushAccepted();
        }
    }
}

export namespace EtoPriceQuotationDitemNgComponent {
    export namespace JsonName {
        export const watchContent = 'watchContent';
        export const callPutContent = 'callPutContent';
    }

    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Input,
        LayoutDialog,
    }
}
