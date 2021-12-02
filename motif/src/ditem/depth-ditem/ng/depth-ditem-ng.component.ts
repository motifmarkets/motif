/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver,

    ElementRef,

    Inject, OnDestroy, ViewChild, ViewContainerRef
} from '@angular/core';
import { CommaText, delay1Tick, IconButtonUiAction, InternalCommand, JsonElement, LitIvemId, LitIvemIdUiAction, Logger, StringId, Strings, StringUiAction, UiAction } from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreNgService, SettingsNgService } from 'component-services-ng-api';
import { DepthGridLayoutsEditorNgComponent, DepthNgComponent } from 'content-ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { DepthDitemFrame } from '../depth-ditem-frame';

@Component({
    selector: 'app-depth-ditem',
    templateUrl: './depth-ditem-ng.component.html',
    styleUrls: ['./depth-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective
    implements OnDestroy, AfterViewInit, DepthDitemFrame.ComponentAccess {

    @ViewChild('symbolEdit') private _symbolEditComponent: LitIvemIdSelectNgComponent;
    @ViewChild('symbolButton', { static: true }) private _symbolButtonComponent: SvgButtonNgComponent;
    @ViewChild('symbolLinkButton') private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('rollUpButton', { static: true }) private _rollUpButtonComponent: SvgButtonNgComponent;
    @ViewChild('rollDownButton', { static: true }) private _rollDownButtonComponent: SvgButtonNgComponent;
    @ViewChild('filterButton', { static: true }) private _filterButtonComponent: SvgButtonNgComponent;
    @ViewChild('filterEdit') private _filterEditComponent: TextInputNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('depthContent', { static: true }) private _contentComponent: DepthNgComponent;
    @ViewChild('layoutEditorContainer', { read: ViewContainerRef, static: true }) private _layoutEditorContainer: ViewContainerRef;

    public isLayoutEditorVisible = false;

    private _symbolEditUiAction: LitIvemIdUiAction;
    private _symbolApplyUiAction: IconButtonUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private _rollUpUiAction: IconButtonUiAction;
    private _expandUiAction: IconButtonUiAction;
    private _filterUiAction: IconButtonUiAction;
    private _filterEditUiAction: StringUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;

    private _frame: DepthDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        private _resolver: ComponentFactoryResolver,
        desktopAccessNgService: DesktopAccessNgService,
        pulseService: CoreNgService
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new DepthDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, pulseService.symbolsManager, pulseService.adi);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._rollUpUiAction = this.createRollUpUiAction();
        this._expandUiAction = this.createExpandUiAction();
        this._filterUiAction = this.createFilterUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol(this._frame.litIvemId);
        this.pushSymbolLinkSelectState();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return DepthDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    public ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    // TradesDitemFrame.ComponentAccess methods
    public pushSymbol(litIvemId: LitIvemId | undefined) {
        this._symbolEditUiAction.pushValue(litIvemId);
    }

    public notifyOpenedClosed(litIvemId: LitIvemId | undefined) {
        this.pushSymbol(litIvemId);
        this.pushFilterEditValue();
        this._symbolApplyUiAction.pushDisabled();
        this.pushAccepted();
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._contentComponent.frame, frameElement);

        this.pushFilterSelectState();
        this.pushFilterEditValue();

        this.initialiseChildComponents();

        this._frame.open();

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
            // if (!this._symbolEditUiAction.inputtedParseDetails.success) {
            //     this._symbolApplyUiAction.pushDisabled();
            // } else {
            //     if (this._symbolEditUiAction.isInputtedSameAsCommitted()) {
            //         this._symbolApplyUiAction.pushDisabled();
            //     } else {
                    this._symbolApplyUiAction.pushUnselected();
            //     }
            // }
        }
    }

    private handleSymbolApplyUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.commitSymbol(UiAction.CommitTypeId.Explicit);
    }

    private handleSymbolLinkUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private handleRollUpUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this._frame.rollUp(UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Shift));
    }

    private handleExpandUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this._frame.expand(UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Shift));
    }

    private handleFilterUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this._frame.toggleFilterActive();
        this.pushFilterSelectState();
    }

    private handleFilterEditUiActionCommitEvent(typeId: UiAction.CommitTypeId) {
        const toArrayResult = CommaText.toStringArrayWithResult(this._filterEditUiAction.definedValue, false);
        if (toArrayResult.success) {
            this._frame.setFilter(toArrayResult.array);
            this.pushFilterEditValue();
        } else {
            this._filterUiAction.pushInvalid(Strings[StringId.InvalidFilterXrefs]);
        }
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this._frame.autoSizeAllColumnWidths();
    }

    private handleColumnsUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        this.showLayoutEditor();
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
        const commandName = InternalCommand.Name.ApplySymbol;
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
        const commandName = InternalCommand.Name.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSymbolLinkUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createRollUpUiAction() {
        const commandName = InternalCommand.Name.Depth_Rollup;
        const displayId = StringId.RollUpDepthCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.RollUpDepthToPriceLevelsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RollUp);
        action.signalEvent = (signalTypeId, downKeys) => this.handleRollUpUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createExpandUiAction() {
        const commandName = InternalCommand.Name.Depth_Expand;
        const displayId = StringId.ExpandDepthCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ExpandDepthToOrdersTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RollDown);
        action.signalEvent = (signalTypeId, downKeys) => this.handleExpandUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createFilterUiAction() {
        const commandName = InternalCommand.Name.Depth_Filter;
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

    private createAutoSizeColumnWidthsUiAction() {
        const commandName = InternalCommand.Name.AutoSizeGridColumnWidths;
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
        const commandName = InternalCommand.Name.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = (signalTypeId, downKeys) => this.handleColumnsUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private initialiseChildComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._rollUpButtonComponent.initialise(this._rollUpUiAction);
        this._rollDownButtonComponent.initialise(this._expandUiAction);
        this._filterButtonComponent.initialise(this._filterUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

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
        let value: string;
        if (filterXrefs === undefined) {
            value = '';
        } else {
            value = CommaText.fromStringArray(filterXrefs);
        }
        this._filterEditUiAction.pushValue(value);
    }

    private pushAccepted() {
        this._symbolApplyUiAction.pushAccepted();
    }

    private pushValid() {
        this._symbolApplyUiAction.pushValid();
    }

    private showLayoutEditor() {
        this.isLayoutEditorVisible = true;
        const layoutWithHeadings = this._frame.getGridLayoutsWithHeadings();

        if (layoutWithHeadings !== undefined) {
            const closePromise = DepthGridLayoutsEditorNgComponent.open(this._layoutEditorContainer, this._resolver, layoutWithHeadings);
            closePromise.then(
                (layouts) => {
                    if (layouts !== undefined) {
                        this._frame.setGridLayouts(layouts);
                    }
                    this.closeLayoutEditor();
                },
                (reason) => {
                    Logger.logError(`DepthInput Layout Editor error: ${reason}`);
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

export namespace DepthDitemNgComponent {
    export const stateSchemaVersion = '2';
}
