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
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AssertInternalError,
    DateUiAction,
    IconButtonUiAction,
    InternalCommand,
    JsonElement,
    LitIvemId,
    LitIvemIdUiAction, ModifierKey, ModifierKeyId, StringId,
    Strings,
    UiAction,
    assert,
    assigned,
    delay1Tick
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { GridLayoutDialogNgComponent, TradesNgComponent } from 'content-ng-api';
import { DateInputNgComponent, LitIvemIdSelectNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { TradesDitemFrame } from '../trades-ditem-frame';

@Component({
    selector: 'app-trades-ditem',
    templateUrl: './trades-ditem-ng.component.html',
    styleUrls: ['./trades-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective
    implements OnDestroy, AfterViewInit, TradesDitemFrame.ComponentAccess {

    @ViewChild('symbolInput') private _symbolEditComponent: LitIvemIdSelectNgComponent;
    @ViewChild('symbolButton', { static: true }) private _symbolButtonComponent: SvgButtonNgComponent;
    @ViewChild('symbolLinkButton') private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('historicalDateInput', { static: true }) private _historicalDateInput: DateInputNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('tradesContent', { static: true }) private _contentComponent: TradesNgComponent;
    @ViewChild('dialogContainer', { read: ViewContainerRef, static: true }) private _dialogContainer: ViewContainerRef;

    // public statusText: string | undefined;
    public isDialogVisible = false;

    private readonly _symbolEditUiAction: LitIvemIdUiAction;
    private readonly _symbolApplyUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _historicalDateUiAction: DateUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;

    private _frame: TradesDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef<HTMLElement>,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        const settingsService = settingsNgService.service;
        super(cdr, container, elRef, settingsService, commandRegisterNgService.service);

        this._frame = new TradesDitemFrame(this, settingsService, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._historicalDateUiAction = this.createHistoricalDateUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol(this._frame.litIvemId);
        this.pushSymbolLinkButtonState();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return TradesDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    public ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    autoSizeAllColumnWidths() {
        this._frame.autoSizeAllColumnWidths(true);
    }

    // TradesDitemFrame.ComponentAccess methods
    public getHistoricalDate() {
        return this._historicalDateUiAction.value;
    }

    public pushSymbol(litIvemId: LitIvemId | undefined) {
        this._symbolEditUiAction.pushValue(litIvemId);
    }

    public notifyOpenedClosed(litIvemId: LitIvemId | undefined, historicalDate: Date | undefined) {
        this.pushSymbol(litIvemId);
        this.pushHistoricalDate(historicalDate);
        this._symbolApplyUiAction.pushDisabled();
        this.pushAccepted();
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    protected override initialise() {
        assert(assigned(this._contentComponent), 'ID:4817161157');

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const ditemFrameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        let tradesFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const tradesFrameElementResult = ditemFrameElement.tryGetElement(TradesDitemFrame.JsonName.tradesFrame);
            if (tradesFrameElementResult.isOk()) {
                tradesFrameElement = tradesFrameElementResult.value;
            }
        }
        this._frame.initialise(tradesFrameElement, this._contentComponent.frame);

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._historicalDateUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._columnsUiAction.finalise();

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
            this._symbolApplyUiAction.pushDisabled();
        } else {
/*            if (!this._symbolEditUiAction.inputtedParseDetails.success) {
                this._symbolApplyUiAction.pushDisabled();
            } else {
                if (this._symbolEditUiAction.isInputtedSameAsCommitted()) {
                    this._symbolApplyUiAction.pushDisabled();
                } else {*/
                    this._symbolApplyUiAction.pushUnselected();
                // }
        //     }
        }
    }

    private handleSymbolLinkUiActionSignalEvent() {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private handleSymbolApplyUiActionSignalEvent() {
        this.commitSymbol();
    }

    private handleHistoricalDateCommitEvent() {
        this._frame.historicalDateCommit();
        // this.pushValid();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleColumnsUiActionSignalEvent() {
        const dialogPromise = this.showGridLayoutDialog();

        dialogPromise.then(
            () => {/**/},
            (error) => { throw AssertInternalError.createIfNotError(error, 'TDNCHCUASE34009'); }
        )
    }

    private createSymbolEditUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.WatchlistSymbolInputTitle]);
        action.commitEvent = () => this.handleSymbolCommitEvent();
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createSymbolApplyUiAction() {
        const commandName = InternalCommand.Id.ApplySymbol;
        const displayId = StringId.ApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ApplySymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        action.signalEvent = () => this.handleSymbolApplyUiActionSignalEvent();
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkUiActionSignalEvent();
        return action;
    }

    private createHistoricalDateUiAction() {
        const action = new DateUiAction();
        action.valueRequired = false;
        action.commitEvent = () => this.handleHistoricalDateCommitEvent();
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
        action.signalEvent = (signalTypeId, downKeys) => this.handleAutoSizeColumnWidthsUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }


    private initialiseComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._historicalDateInput.initialise(this._historicalDateUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        this._frame.open();
    }

    private commitSymbol() {
        const litIvemId = this._symbolEditUiAction.value;
        if (litIvemId !== undefined) {
            this._frame.setLitIvemIdFromDitem(litIvemId);
        }
        // this.pushValid();
    }

    private pushHistoricalDate(value: Date | undefined) {
        this._historicalDateUiAction.pushValue(value);
    }

    private pushAccepted() {
        this._symbolApplyUiAction.pushAccepted();
        this._historicalDateUiAction.pushAccepted();
    }

    // private pushValid() {
    //     this._symbolApplyUiAction.pushValid();
    //     this._historicalDateUiAction.pushValid();
    // }

    private pushSymbolLinkButtonState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private async showGridLayoutDialog() {
        const allowedFieldsAndLayoutDefinition = this._frame.createAllowedFieldsAndLayoutDefinition();

        if (allowedFieldsAndLayoutDefinition !== undefined) {
            const component = GridLayoutDialogNgComponent.create(
                this._dialogContainer,
                allowedFieldsAndLayoutDefinition.allowedFields,
                allowedFieldsAndLayoutDefinition.layoutDefinition,
            );

            this.isDialogVisible = true;
            this.markForCheck();

            const newLayoutDefinition = await component.waitClose();
            if (newLayoutDefinition !== undefined) {
                this._frame.applyGridLayoutDefinition(newLayoutDefinition);
            }

            this.closeLayoutEditor();
        }
    }

    private closeLayoutEditor() {
        this._dialogContainer.clear();
        this.isDialogVisible = false;
        this.markForCheck();
    }
}

export namespace TradesDitemNgComponent {
    export const stateSchemaVersion = '2';
}
