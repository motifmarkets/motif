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
    Inject,
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { ComponentContainer } from 'golden-layout';
import { LitIvemId } from 'src/adi/internal-api';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import { ContentGridLayoutEditorNgComponent, GridLayoutEditorNgComponent, TableNgComponent } from 'src/content/ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent } from 'src/controls/ng-api';
import { IconButtonUiAction, InternalCommand, LitIvemIdUiAction, UiAction } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { assert, assigned, delay1Tick, Integer, JsonElement, Logger } from 'src/sys/internal-api';
import { BuiltinDitemFrame } from '../../builtin-ditem-frame';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { WatchlistDitemFrame } from '../watchlist-ditem-frame';

@Component({
    selector: 'app-watchlist-ditem',
    templateUrl: './watchlist-ditem-ng.component.html',
    styleUrls: ['./watchlist-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WatchlistDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('symbolInput', { static: true }) private _symbolEditComponent: LitIvemIdSelectNgComponent;
    @ViewChild('symbolButton', { static: true }) private _symbolButtonComponent: SvgButtonNgComponent;
    @ViewChild('deleteButton', { static: true }) private _deleteButtonComponent: SvgButtonNgComponent;
    @ViewChild('newButton', { static: true }) private _newButtonComponent: SvgButtonNgComponent;
    @ViewChild('openButton', { static: true }) private _openButtonComponent: SvgButtonNgComponent;
    @ViewChild('saveButton', { static: true }) private _saveButtonComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('symbolLinkButton', { static: true }) private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('table', { static: true }) private _contentComponent: TableNgComponent;
    @ViewChild('layoutEditorContainer', { read: ViewContainerRef, static: true }) private _layoutEditorContainer: ViewContainerRef;

    public watchlistCaption: string;
    public watchlistAbbreviatedDescription: string;
    public WatchListFullDescription: string;

    private _layoutEditorComponent: GridLayoutEditorNgComponent | undefined;

    private _symbolEditUiAction: LitIvemIdUiAction;
    private _symbolApplyUiAction: IconButtonUiAction;
    private _deleteSymbolUiAction: IconButtonUiAction;
    private _newUiAction: IconButtonUiAction;
    private _openUiAction: IconButtonUiAction;
    private _saveUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;

    private _modeId = WatchlistDitemNgComponent.ModeId.Input;
    private _frame: WatchlistDitemFrame;
    private _forceOnNextCommit = false;

    protected get stateSchemaVersion() { return WatchlistDitemNgComponent.stateSchemaVersion; }
    get ditemFrame() { return this._frame; }

    constructor(cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        private _resolver: ComponentFactoryResolver,
    ) {
        super(cdr, container, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new WatchlistDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.symbolsManager, adiNgService.adiService
        );
        this._frame.recordFocusEvent = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        this._frame.newTableEvent = (description) => this.handleNewTableEvent(description);
        this._frame.litIvemIdAcceptedEvent = (litIvemId) => this.handleLitIvemIdAcceptedEvent(litIvemId);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._deleteSymbolUiAction = this.createDeleteSymbolUiAction();
        this._newUiAction = this.createNewUiAction();
        this._openUiAction = this.createOpenUiAction();
        this._saveUiAction = this.createSaveUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        if (this._frame.litIvemId !== undefined) {
            this._forceOnNextCommit = true;
        }

        this.pushSymbol();
        this.pushSymbolLinkSelectState();
    }


    ngAfterViewInit() {
        assert(assigned(this._contentComponent), '3111100759');

        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this.finalise();
    }

    public isInputMode() {
        return this._modeId === WatchlistDitemNgComponent.ModeId.Input;
    }

    public isLayoutEditorMode() {
        return this._modeId === WatchlistDitemNgComponent.ModeId.LayoutEditor;
    }

    public isOpenDialogMode() {
        return this._modeId === WatchlistDitemNgComponent.ModeId.OpenDialog;
    }

    public isSaveDialogMode() {
        return this._modeId === WatchlistDitemNgComponent.ModeId.SaveDialog;
    }

    public getStatusText(): string | undefined {
        // TODO:MED Will need to get the status.
        // return OverallStatus.toDisplay(this._itemFrame.overallStatus);
        return undefined;
    }

    public processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._contentComponent.frame, frameElement);

        this._symbolEditComponent.focus();

        this.pushDeleteButtonState(this._frame.getFocusedRecordIndex());

        this.initialiseComponents();

        super.initialise();
    }

    protected finalise() {
        this._symbolEditUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._deleteSymbolUiAction.finalise();
        this._newUiAction.finalise();
        this._openUiAction.finalise();
        this._saveUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();

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

    private handleRecordFocusEvent(currentRecordIndex: Integer | undefined) {
        this.pushDeleteButtonState(currentRecordIndex);
    }

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

    private handleSymbolApplyUiActionSignalEvent() {
        this.commitSymbol(UiAction.CommitTypeId.Explicit);
    }

    private handleDeleteSymbolUiActionEvent() {
        this._frame.deleteFocusedSymbol();
    }

    private handleNewUiActionSignalEvent(downKeys: UiAction.DownKeys) {
        const keepCurrentLayout = UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Shift);
        this._frame.newPrivate(keepCurrentLayout);
    }

    private handleOpenUiActionSignalEvent() {
        // TODO
    }

    private handleSaveUiActionEvent() {
        // TODO
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditor();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent() {
        this._frame.autoSizeAllColumnWidths();
    }

    private handleSymbolLinkUiActionSignalEvent() {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private handleNewTableEvent(description: WatchlistDitemFrame.TableDescription) {
        this.updateWatchlistDescription(description);
    }

    private handleLitIvemIdAcceptedEvent(litIvemId: LitIvemId) {
        this._symbolEditUiAction.pushValue(litIvemId);
        this._symbolApplyUiAction.pushDisabled();
    }

    private createSymbolEditUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.WatchlistSymbolInputTitle]);
        action.commitEvent = (typeId) => this.handleSymbolCommitEvent(typeId);
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createSymbolApplyUiAction() {
        const commandName = InternalCommand.Name.ApplySymbol;
        const displayId = StringId.ApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.WatchlistSymbolButtonTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        action.signalEvent = () => this.handleSymbolApplyUiActionSignalEvent();
        return action;
    }

    private createDeleteSymbolUiAction() {
        const commandName = InternalCommand.Name.Watchlist_DeleteSymbol;
        const displayId = StringId.WatchlistDeleteSymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.WatchlistDeleteSymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.DeleteSymbol);
        action.signalEvent = () => this.handleDeleteSymbolUiActionEvent();
        return action;
    }

    private createNewUiAction() {
        const commandName = InternalCommand.Name.Watchlist_New;
        const displayId = StringId.NewWatchlistCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.NewWatchlistTitle]);
        action.pushIcon(IconButtonUiAction.IconId.NewWatchlist);
        action.pushUnselected();
        action.signalEvent = (signalTypeId) => this.handleNewUiActionSignalEvent(signalTypeId);
        return action;
    }

    private createOpenUiAction() {
        const commandName = InternalCommand.Name.Watchlist_Open;
        const displayId = StringId.OpenWatchlistCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.OpenWatchlistTitle]);
        action.pushIcon(IconButtonUiAction.IconId.OpenWatchlist);
        action.pushUnselected();
        action.signalEvent = () => this.handleOpenUiActionSignalEvent();
        return action;
    }

    private createSaveUiAction() {
        const commandName = InternalCommand.Name.Watchlist_Save;
        const displayId = StringId.SaveWatchlistCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SaveWatchlistTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SaveWatchlist);
        action.pushUnselected();
        action.signalEvent = () => this.handleSaveUiActionEvent();
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
        action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
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
        action.signalEvent = () => this.handleAutoSizeColumnWidthsUiActionSignalEvent();
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Name.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkUiActionSignalEvent();
        return action;
    }

    private showLayoutEditor() {
        this._modeId = WatchlistDitemNgComponent.ModeId.LayoutEditor;
        const layoutWithHeadings = this._frame.getGridLayoutWithHeadings();

        if (layoutWithHeadings !== undefined) {
            const closePromise = ContentGridLayoutEditorNgComponent.open(this._layoutEditorContainer, this._resolver, layoutWithHeadings);
            closePromise.then(
                (layout) => {
                    if (layout !== undefined) {
                        this._frame.setGridLayout(layout);
                    }
                    this.closeLayoutEditor();
                },
                (reason) => {
                    Logger.logError(`Watchlist Layout Editor error: ${reason}`);
                    this.closeLayoutEditor();
                }
            );
        }

        this.markForCheck();
    }

    private closeLayoutEditor() {
        this._layoutEditorContainer.clear();
        this._modeId = WatchlistDitemNgComponent.ModeId.Input;
        this.markForCheck();
    }

    private pushDeleteButtonState(newRecordIndex: Integer | undefined) {
        if (newRecordIndex === undefined) {
            this._deleteSymbolUiAction.pushDisabled();
        } else {
            if (this._frame.canDeleteFocusedRecord()) {
                this._deleteSymbolUiAction.pushUnselected();
            } else {
                this._deleteSymbolUiAction.pushDisabled();
            }
        }
    }

    private initialiseComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        this._deleteButtonComponent.initialise(this._deleteSymbolUiAction);
        this._newButtonComponent.initialise(this._newUiAction);
        this._openButtonComponent.initialise(this._openUiAction);
        this._saveButtonComponent.initialise(this._saveUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
    }

    private pushSymbol() {
        this._symbolEditUiAction.pushValue(this._frame.litIvemId);
    }

    private pushSymbolLinkSelectState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private commitSymbol(typeId: UiAction.CommitTypeId) {
        const litIvemId = this._symbolEditUiAction.value;
        if (litIvemId !== undefined) {
            this._frame.setLitIvemIdFromDitem(litIvemId, this._forceOnNextCommit);
            this._forceOnNextCommit = false;
        }
    }

    private updateWatchlistDescription(description: WatchlistDitemFrame.TableDescription) {
        this.watchlistCaption = Strings[StringId.Watchlist] + ' ' + description.name;
        this.watchlistAbbreviatedDescription = description.abbreviate;
        this.WatchListFullDescription = description.full;
        const moduleTitle = BuiltinDitemFrame.BuiltinType.idToTabTitle(BuiltinDitemFrame.BuiltinTypeId.Watchlist) + ' ' + description.name;
        this.setTitle(moduleTitle);
        this.markForCheck();
    }
}

export namespace WatchlistDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Input,
        LayoutEditor,
        OpenDialog,
        SaveDialog,
    }
}
