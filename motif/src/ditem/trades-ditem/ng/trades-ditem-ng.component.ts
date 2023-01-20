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
    assert,
    assigned,
    DateUiAction,
    delay1Tick,
    IconButtonUiAction,
    InternalCommand,
    JsonElement,
    LitIvemId,
    LitIvemIdUiAction,
    Logger,
    StringId,
    Strings
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { GridLayoutEditorDialogNgComponent, TradesNgComponent } from 'content-ng-api';
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
    @ViewChild('layoutEditorContainer', { read: ViewContainerRef, static: true }) private _layoutEditorContainer: ViewContainerRef;

    // public statusText: string | undefined;
    public isLayoutEditorVisible = false;

    private _symbolEditUiAction: LitIvemIdUiAction;
    private _symbolApplyUiAction: IconButtonUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private _historicalDateUiAction: DateUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;

    private _frame: TradesDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new TradesDitemFrame(this, this.commandRegisterService,
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
        this._frame.autoSizeAllColumnWidths();
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
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._contentComponent.frame, frameElement);

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

    private handleAutoSizeColumnWidthsUiActionSignalEvent() {
        this._frame.autoSizeAllColumnWidths();
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditor();
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
        action.signalEvent = () => this.handleAutoSizeColumnWidthsUiActionSignalEvent();
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

    private showLayoutEditor() {
        this.isLayoutEditorVisible = true;
        const layoutWithHeadings = this._frame.createAllowedFieldsAndLayoutDefinition();

        if (layoutWithHeadings !== undefined) {
            const closePromise = GridLayoutEditorDialogNgComponent.open(this._layoutEditorContainer, layoutWithHeadings);
            closePromise.then(
                (layoutDefinition) => {
                    if (layoutDefinition !== undefined) {
                        this._frame.applyGridLayoutDefinition(layoutDefinition);
                    }
                    this.closeLayoutEditor();
                },
                (reason) => {
                    Logger.logError(`TradesInput Layout Editor error: ${reason}`);
                    this.closeLayoutEditor();
                }
            );
        }

        this.markForCheck();
    }

    private closeLayoutEditor() {
        this._layoutEditorContainer.clear();
        this.isLayoutEditorVisible = false;
        this.markForCheck();
    }
}

export namespace TradesDitemNgComponent {
    export const stateSchemaVersion = '2';
}
