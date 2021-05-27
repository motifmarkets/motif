/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { ComponentContainer } from 'golden-layout';
import { CommandRegisterNgService, CoreNgService, SettingsNgService } from 'src/component-services/ng-api';
import { GridLayoutEditorNgComponent, TableNgComponent } from 'src/content/ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent } from 'src/controls/ng-api';
import {
    ButtonUiAction,
    GridLayoutDataStore,
    IconButtonUiAction,
    InternalCommand,
    LitIvemIdUiAction,
    UiAction
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { delay1Tick, JsonElement } from 'src/sys/internal-api';
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
    @ViewChild('watchTable', { static: true }) private _watchContentComponent: TableNgComponent;
    @ViewChild('etoPriceQuotationTable', { static: true }) private _callPutContentComponent: TableNgComponent;
    @ViewChild('layoutEditor', { static: true }) private _layoutEditorComponent: GridLayoutEditorNgComponent;

    private _symbolEditUiAction: LitIvemIdUiAction;
    private _applySymbolUiAction: IconButtonUiAction;
    private _selectColumnsUiAction: IconButtonUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _modeId = EtoPriceQuotationDitemNgComponent.ModeId.Input;
    private _frame: EtoPriceQuotationDitemFrame;

    protected get stateSchemaVersion() { return EtoPriceQuotationDitemNgComponent.stateSchemaVersion; }
    get ditemFrame() { return this._frame; }

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        pulseService: CoreNgService
    ) {
        super(cdr, container, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new EtoPriceQuotationDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, pulseService.symbolsManager, pulseService.adi);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._applySymbolUiAction = this.createApplySymbolUiAction();
        this._selectColumnsUiAction = this.createSelectColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol();
    }

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
        return this._modeId === EtoPriceQuotationDitemNgComponent.ModeId.LayoutEditor;
    }

    protected initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._watchContentComponent.frame, this._callPutContentComponent.frame, frameElement);

        // this._frame.ensureOpened();

        this._symbolEditComponent.focus();

        this.initialiseChildComponents();

        super.initialise();
    }

    protected finalise() {
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

    private handleColumnsSignalEvent(downKeys: UiAction.DownKeys) {
        let layoutWithHeadings: GridLayoutDataStore.GridLayoutWithHeaders;
        if (ButtonUiAction.downKeysIncludesId(downKeys, ButtonUiAction.DownKeyId.Shift)) {
            layoutWithHeadings = this._watchContentComponent.getGridLayoutWithHeadings();
        } else {
            layoutWithHeadings = this._callPutContentComponent.getGridLayoutWithHeadings();
        }
        this._modeId = EtoPriceQuotationDitemNgComponent.ModeId.LayoutEditor;
        this._layoutEditorComponent.setGridLayout(layoutWithHeadings);
    }

    private handleAutoSizeColumnWidthsSignalEvent() {
        // TODO
    }

    private handleLayoutEditorComponentCloseEvent(ok: boolean) {
        if (ok) {
            const layout = this._layoutEditorComponent.getGridLayout();
            // need to work out which is being edited
            this._watchContentComponent.gridLoadLayout(layout);
        }
        this._modeId = EtoPriceQuotationDitemNgComponent.ModeId.Input;
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
        const commandName = InternalCommand.Name.EtoPriceQuotation_ApplySymbol;
        const displayId = StringId.EtoPriceQuotationApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.EtoPriceQuotationApplySymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.signalEvent = () => this.handleSymbolSignalEvent();
        return action;
    }

    private createSelectColumnsUiAction() {
        const commandName = InternalCommand.Name.SelectGridColumns;
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
        const commandName = InternalCommand.Name.AutoSizeGridColumnWidths;
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
        LayoutEditor,
    }
}
