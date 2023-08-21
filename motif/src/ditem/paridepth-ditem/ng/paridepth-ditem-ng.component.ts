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
    CommaText,
    DateUiAction,
    IconButtonUiAction,
    InternalCommand,
    JsonElement,
    LitIvemId,
    LitIvemIdUiAction,
    Logger,
    ModifierKey,
    ModifierKeyId,
    StringId,
    StringUiAction,
    Strings,
    UiAction,
    UnreachableCaseError,
    defined,
    delay1Tick,
    getErrorMessage
} from '@motifmarkets/motif-core';
import { IOutputData, SplitComponent } from 'angular-split';
import {
    AdiNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SymbolsNgService,
    TextFormatterNgService
} from 'component-services-ng-api';
import { DepthNgComponent, ParidepthGridLayoutsEditorDialogNgComponent, TradesNgComponent, WatchlistNgComponent } from 'content-ng-api';
import { AngularSplitTypes } from 'controls-internal-api';
import {
    CommandBarNgComponent,
    DateInputNgComponent,
    LitIvemIdSelectNgComponent,
    SvgButtonNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { ParidepthDitemFrame } from '../paridepth-ditem-frame';

@Component({
    selector: 'app-paridepth-ditem',
    templateUrl: './paridepth-ditem-ng.component.html',
    styleUrls: ['./paridepth-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParidepthDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective
    implements OnDestroy, AfterViewInit, ParidepthDitemFrame.ComponentAccess {

    private static typeInstanceCreateCount = 0;

    @ViewChild('symbolInput') private _symbolEditComponent: LitIvemIdSelectNgComponent;
    @ViewChild('symbolButton') private _symbolButtonComponent: SvgButtonNgComponent;
    @ViewChild('symbolLinkButton') private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('rollUpButton', { static: true }) private _rollUpButtonComponent: SvgButtonNgComponent;
    @ViewChild('rollDownButton', { static: true }) private _rollDownButtonComponent: SvgButtonNgComponent;
    @ViewChild('filterButton', { static: true }) private _filterButtonComponent: SvgButtonNgComponent;
    @ViewChild('filterEdit') private _filterEditComponent: TextInputNgComponent;
    @ViewChild('historicalDateInput', { static: true }) private _historicalTradesDateInput: DateInputNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('depthTradesDiv', { static: true }) private _depthTradesDiv: ElementRef<HTMLElement>;
    @ViewChild('depth', { static: true }) private _depthComponent: DepthNgComponent;
    @ViewChild('trades', { static: true }) private _tradesComponent: TradesNgComponent;
    @ViewChild('watchlist', { static: true }) private _watchlistComponent: WatchlistNgComponent;
    @ViewChild(SplitComponent) private _depthTradesSplitComponent: SplitComponent;
    @ViewChild('dialogContainer', { read: ViewContainerRef, static: true }) private _dialogContainer: ViewContainerRef;
    @ViewChild('commandBar') private _commandBarComponent: CommandBarNgComponent;

    public splitterGutterSize = 3;
    public depthWidth: AngularSplitTypes.AreaSize.Html = 200; // pushed
    // public depthActiveWidth = 200;
    // public tradesActiveWidth = 200;

    public explicitDepthWidth = false;

    private _layoutEditorComponent: ParidepthGridLayoutsEditorDialogNgComponent | undefined;

    private _symbolEditUiAction: LitIvemIdUiAction;
    private _symbolApplyUiAction: IconButtonUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private _rollUpUiAction: IconButtonUiAction;
    private _expandUiAction: IconButtonUiAction;
    private _filterUiAction: IconButtonUiAction;
    private _filterEditUiAction: StringUiAction;
    private _historicalTradesDateUiAction: DateUiAction;
    private _columnsUiAction: IconButtonUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _modeId = ParidepthDitemNgComponent.ModeId.Main;
    private _frame: ParidepthDitemFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        textFormatterNgService: TextFormatterNgService,
    ) {
        super(elRef, ++ParidepthDitemNgComponent.typeInstanceCreateCount, cdr, container, settingsNgService.service, commandRegisterNgService.service);

        this._frame = new ParidepthDitemFrame(
            this,
            this.settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            textFormatterNgService.service,
        );

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._rollUpUiAction = this.createRollUpUiAction();
        this._expandUiAction = this.createExpandUiAction();
        this._filterUiAction = this.createFilterUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._historicalTradesDateUiAction = this.createHistoricalTradesDateUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol(this._frame.litIvemId);
        this.pushSymbolLinkSelectState();
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return ParidepthDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    public ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    // component interface methods

    public adjustDepthWidth(preferredDepthWidth: number) {
        const totalDepthTradesWidth = this._depthTradesDiv.nativeElement.offsetWidth;
        if (preferredDepthWidth > totalDepthTradesWidth - 50) {
            preferredDepthWidth = totalDepthTradesWidth - 50;
            if (preferredDepthWidth < 50) {
                preferredDepthWidth = Math.round(totalDepthTradesWidth / 2);
            }
        }

        this.depthWidth = preferredDepthWidth;
        this.markForCheck();
    }

    // public setTradesActiveWidth(width: Integer) {
    //     this.tradesActiveWidth = width;
    //     this.markForCheck();
    // }

    // template functions
    public isMainMode() {
        return this._modeId === ParidepthDitemNgComponent.ModeId.Main;
    }

    public isDialogMode() {
        switch (this._modeId) {
            case ParidepthDitemNgComponent.ModeId.LayoutDialog:
                return true;
            case ParidepthDitemNgComponent.ModeId.Main:
                return false;
            default:
                throw new UnreachableCaseError('PDNCIDM65312', this._modeId);
        }
    }

    public splitDragEnd(data: IOutputData) {
        this.explicitDepthWidth = true;
        const [depthWidth, ignoredTradesWidth] = this.getDepthTradesWidths();
        if (depthWidth === '*') {
            throw new AssertInternalError('PDNCSDE43369');
        } else {
            this.depthWidth = depthWidth;
            // this.markForCheck();
        }
    }

    // TradesDitemFrame.ComponentAccess methods
    public getHistoricalDate() {
        return this._historicalTradesDateUiAction.value;
    }

    public pushSymbol(litIvemId: LitIvemId | undefined) {
        this._symbolEditUiAction.pushValue(litIvemId);
    }

    public notifyOpenedClosed(litIvemId: LitIvemId | undefined, historicalTradesDate: Date | undefined) {
        this.pushSymbol(litIvemId);
        this.pushFilterEditValue();
        this.pushHistoricalTradesDate(historicalTradesDate);
        this._symbolApplyUiAction.pushDisabled();
        this.updateColumnsEnabledDiabled();
        this.pushAccepted();
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(
            this._watchlistComponent.frame,
            this._depthComponent.frame,
            this._tradesComponent.frame,
            frameElement,
        );

        this.pushFilterSelectState();
        this.pushFilterEditValue();

        // this.initialiseWidths();

        this.initialiseChildComponents();

        this.updateColumnsEnabledDiabled();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._rollUpUiAction.finalise();
        this._expandUiAction.finalise();
        this._filterUiAction.finalise();
        this._filterEditUiAction.finalise();
        this._historicalTradesDateUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);

        if (element === undefined) {
            this.explicitDepthWidth = false;
        } else {
            const depthWidthAsStringResult = element.tryGetString(ParidepthDitemNgComponent.JsonName.depthWidth);
            if (depthWidthAsStringResult.isErr()) {
                this.explicitDepthWidth = false;
            } else {
                const depthWidth = AngularSplitTypes.AreaSize.jsonValueToIOutput(depthWidthAsStringResult.value);
                if (depthWidth === undefined) {
                    this.explicitDepthWidth = false;
                } else {
                    this.depthWidth = AngularSplitTypes.AreaSize.iOutputToHtml(depthWidth);
                    this.explicitDepthWidth = true;
                }
            }
        }
    }

    protected save(element: JsonElement) {
        if (this.explicitDepthWidth) {
            const [depthWidth, ignoredTradesWidth] = this.getDepthTradesWidths();
            element.setString(ParidepthDitemNgComponent.JsonName.depthWidth, AngularSplitTypes.AreaSize.iOutputToJsonValue(depthWidth));
        }
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    // protected override processShown() {
    //     this._frame.adviseShown();
    // }

    private handleSymbolCommitEvent(typeId: UiAction.CommitTypeId) {
        this.commitSymbol(typeId);
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
            //     }
            // }
        }
    }

    private handleSymbolApplyUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.commitSymbol(UiAction.CommitTypeId.Explicit);
    }

    private handleSymbolLinkUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private handleRollUpUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.rollUp(ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift));
    }

    private handleExpandUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.expand(ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift));
    }

    private handleFilterUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.toggleFilterActive();
        this.pushFilterSelectState();
    }

    private handleFilterEditUiActionCommitEvent(typeId: UiAction.CommitTypeId) {
        const toArrayResult = CommaText.tryToStringArray(this._filterEditUiAction.definedValue, false);
        if (toArrayResult.isOk()) {
            this._frame.setFilter(toArrayResult.value);
            this.pushFilterEditValue();
        } else {
            this._filterUiAction.pushInvalid(Strings[StringId.InvalidFilterXrefs]);
        }
    }

    private handleHistoricalTradesDateCommitEvent(typeId: UiAction.CommitTypeId) {
        this._frame.historicalTradesDateCommit();
        // this.pushValid();
    }

    private handleColumnsUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.showLayoutDialog();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private createSymbolEditUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolEditTitle]);
        action.commitEvent = (typeId) => this.handleSymbolCommitEvent(typeId);
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
        action.signalEvent = (signalTypeId, downKeys) => this.handleSymbolApplyUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSymbolLinkUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createRollUpUiAction() {
        const commandName = InternalCommand.Id.Depth_Rollup;
        const displayId = StringId.RollUpDepthCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.RollUpDepthToPriceLevelsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RollUp);
        action.signalEvent = (signalTypeId, downKeys) => this.handleRollUpUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createExpandUiAction() {
        const commandName = InternalCommand.Id.Depth_Expand;
        const displayId = StringId.ExpandDepthCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ExpandDepthToOrdersTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RollDown);
        action.signalEvent = (signalTypeId, downKeys) => this.handleExpandUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createFilterUiAction() {
        const commandName = InternalCommand.Id.Depth_Filter;
        const displayId = StringId.FilterDepthCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.FilterDepthToXrefsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Filter);
        action.signalEvent = (signalTypeId, downKeys) => this.handleFilterUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.SpecifyDepthFilterXrefsTitle]);
        action.commitEvent = (typeId) => this.handleFilterEditUiActionCommitEvent(typeId);
        return action;
    }

    private createHistoricalTradesDateUiAction() {
        const action = new DateUiAction();
        action.valueRequired = false;
        action.commitEvent = (typeId) => this.handleHistoricalTradesDateCommitEvent(typeId);
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
        action.signalEvent = (signalTypeId, downKeys) => this.handleColumnsUiActionSignalEvent(signalTypeId, downKeys);
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

    private initialiseChildComponents() {
        if (defined(this._symbolEditComponent)) {
            this._symbolEditComponent.initialise(this._symbolEditUiAction);
        }

        if (defined(this._symbolButtonComponent)) {
            this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        }

        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._rollUpButtonComponent.initialise(this._rollUpUiAction);
        this._rollDownButtonComponent.initialise(this._expandUiAction);
        this._filterButtonComponent.initialise(this._filterUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._historicalTradesDateInput.initialise(this._historicalTradesDateUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);

        // this._commandBarComponent.addCommandProcessor(this._frame.watchlistCommandProcessor);
        // this._commandBarComponent.addCommandProcessor(this._frame.depthCommandProcessor);
        // this._commandBarComponent.addCommandProcessor(this._frame.dayTradesCommandProcessor);

        this._frame.open();
    }

    private commitSymbol(typeId: UiAction.CommitTypeId) {
        const litIvemId = this._symbolEditUiAction.value;
        if (litIvemId !== undefined) {
            this._frame.setLitIvemIdFromDitem(litIvemId);
        }
        this.pushValid();
    }

    private pushSymbolLinkSelectState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private pushFilterSelectState() {
        if (this._frame.filterActive) {
            this._filterUiAction.pushSelected();
        } else {
            this._filterUiAction.pushUnselected();
        }
    }

    private pushFilterEditValue() {
        const filterXrefs = this._frame.filterXrefs;
        const value = CommaText.fromStringArray(filterXrefs);
        this._filterEditUiAction.pushValue(value);
    }

    private pushHistoricalTradesDate(historicalTradesDate: Date | undefined) {
        this._historicalTradesDateUiAction.pushValue(historicalTradesDate);
    }

    private pushAccepted() {
        this._symbolApplyUiAction.pushAccepted();
        this._historicalTradesDateUiAction.pushAccepted();
    }

    private pushValid() {
        this._symbolApplyUiAction.pushValid();
        this._historicalTradesDateUiAction.pushValid();
    }

    private updateColumnsEnabledDiabled() {
        if (this._frame.canCreateAllowedFieldsGridLayoutDefinition()) {
            this._columnsUiAction.pushAccepted();
        } else {
            this._columnsUiAction.pushDisabled();
        }
    }

    private showLayoutDialog() {
        this._modeId = ParidepthDitemNgComponent.ModeId.LayoutDialog;
        const allowedFieldsAndLayoutDefinitions = this._frame.createAllowedFieldsAndLayoutDefinition();

        const closePromise = ParidepthGridLayoutsEditorDialogNgComponent.open(this._dialogContainer, allowedFieldsAndLayoutDefinitions);
        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    this._frame.applyGridLayoutDefinitions(layoutOrReferenceDefinition);
                }
                this.closeDialog();
            },
            (reason) => {
                const errorText = getErrorMessage(reason);
                Logger.logError(`ParidepthInput Layout Editor error: ${errorText}`);
                this.closeDialog();
            }
        );


        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._modeId = ParidepthDitemNgComponent.ModeId.Main;
        this.markForCheck();
    }

    private getDepthTradesWidths() {
        const sizes = this._depthTradesSplitComponent.getVisibleAreaSizes();
        if (sizes.length !== 2) {
            throw new AssertInternalError('PDCGDTW2323998L', sizes.length.toString(10));
        } else {
            const depthWidth: AngularSplitTypes.AreaSize.IOutput = sizes[0];
            const tradesWidth: AngularSplitTypes.AreaSize.IOutput = sizes[1];
            return [depthWidth, tradesWidth];
        }
    }

    // private async initialiseWidths() {
    //     this.depthActiveWidth = await this._frame.getDepthRenderedActiveWidth();
    //     this.tradesActiveWidth = await this._frame.getTradesRenderedActiveWidth();
    //     if (!this._explicitDepthWidth) {
    //         this.depthWidth = this.depthActiveWidth;
    //     }
    //     this.markForCheck();
    // }
}

export namespace ParidepthDitemNgComponent {
    export const enum ModeId {
        Main,
        LayoutDialog,
    }

    export namespace JsonName {
        export const depthWidth = 'depthWidth';
    }

    export const stateSchemaVersion = '2';
}
