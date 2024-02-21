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
    ExplicitElementsArrayUiAction,
    GridLayout,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    JsonElement,
    LitIvemId,
    LitIvemIdUiAction,
    ModifierKey,
    ModifierKeyId,
    RankedLitIvemIdList,
    RankedLitIvemIdListDefinition,
    ReferenceableGridLayoutDefinition,
    StringId,
    Strings,
    UiAction,
    UnreachableCaseError,
    assert,
    assigned,
    delay1Tick
} from '@motifmarkets/motif-core';
import {
    AdiNgService,
    CommandRegisterNgService,
    FavouriteReferenceableGridLayoutDefinitionsStoreNgService,
    SettingsNgService,
    SymbolsNgService,
    TableRecordSourceDefinitionFactoryNgService,
    TextFormatterNgService
} from 'component-services-ng-api';
import {
    NameableGridLayoutEditorDialogNgComponent,
    OpenWatchlistDialogNgComponent,
    SaveWatchlistDialogNgComponent,
    WatchlistNgComponent
} from 'content-ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
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
    private static typeInstanceCreateCount = 0;

    @ViewChild('symbolInput', { static: true }) private _symbolEditComponent: LitIvemIdSelectNgComponent;
    @ViewChild('symbolButton', { static: true }) private _symbolButtonComponent: SvgButtonNgComponent;
    @ViewChild('deleteButton', { static: true }) private _deleteButtonComponent: SvgButtonNgComponent;
    @ViewChild('newButton', { static: true }) private _newButtonComponent: SvgButtonNgComponent;
    @ViewChild('openButton', { static: true }) private _openButtonComponent: SvgButtonNgComponent;
    @ViewChild('saveButton', { static: true }) private _saveButtonComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('symbolLinkButton', { static: true }) private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('gridSource', { static: true }) private _watchlistComponent: WatchlistNgComponent;
    @ViewChild('dialogContainer', { read: ViewContainerRef, static: true }) private _dialogContainer: ViewContainerRef;

    public watchlistCaption: string;
    public watchlistAbbreviatedDescription: string;
    public watchListFullDescription: string;

    private _layoutEditorComponent: NameableGridLayoutEditorDialogNgComponent | undefined;

    private _symbolEditUiAction: LitIvemIdUiAction;
    private _symbolApplyUiAction: IconButtonUiAction;
    private _deleteSymbolUiAction: IconButtonUiAction;
    private _newUiAction: IconButtonUiAction;
    private _openUiAction: IconButtonUiAction;
    private _saveUiAction: IconButtonUiAction;
    private _favouriteLayoutsUiAction: ExplicitElementsArrayUiAction<ReferenceableGridLayoutDefinition>;
    private _columnsUiAction: IconButtonUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;

    private _modeId = WatchlistDitemNgComponent.ModeId.Input;
    private _frame: WatchlistDitemFrame;
    private _forceOnNextCommit = false;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        textFormatterNgService: TextFormatterNgService,
        favouriteNamedGridLayoutDefinitionReferencesNgService: FavouriteReferenceableGridLayoutDefinitionsStoreNgService,
        tableRecordSourceDefinitionFactoryNgService: TableRecordSourceDefinitionFactoryNgService,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
    ) {
        super(
            elRef,
            ++WatchlistDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );


        this._frame = new WatchlistDitemFrame(
            this,
            settingsNgService.service,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            textFormatterNgService.service,
            favouriteNamedGridLayoutDefinitionReferencesNgService.service,
            tableRecordSourceDefinitionFactoryNgService.service,
            (rankedLitIvemIdList, rankedLitIvemIdListName) => this.handleGridSourceOpenedEvent(
                rankedLitIvemIdList,
                rankedLitIvemIdListName
            ),
            (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex),
            (layout) => this.handleGridLayoutSetEvent(layout),
            (litIvemId) => this.handleLitIvemIdAcceptedEvent(litIvemId),
        );
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


    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return WatchlistDitemNgComponent.stateSchemaVersion; }

    ngAfterViewInit() {
        assert(assigned(this._watchlistComponent), '3111100759');

        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this.finalise();
    }

    public isInputMode() {
        return this._modeId === WatchlistDitemNgComponent.ModeId.Input;
    }

    public isDialogMode() {
        switch (this._modeId) {
            case WatchlistDitemNgComponent.ModeId.LayoutDialog:
            case WatchlistDitemNgComponent.ModeId.OpenDialog:
            case WatchlistDitemNgComponent.ModeId.SaveDialog:
                return true;
            case WatchlistDitemNgComponent.ModeId.Input:
                return false;
            default:
                throw new UnreachableCaseError('WDNCISM65311', this._modeId);
        }
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

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._watchlistComponent.frame);

        this._symbolEditComponent.focus();

        this.pushDeleteButtonState(this._frame.recordFocused);

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
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

    private handleRecordFocusedEvent(currentRecordIndex: Integer | undefined) {
        this.pushDeleteButtonState(currentRecordIndex !== undefined);
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
        this._frame.deleteFocusedRecord();
    }

    private handleNewUiActionSignalEvent(downKeys: ModifierKey.IdSet) {
        const keepView = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        const promise = this._frame.newEmpty(keepView);
        AssertInternalError.throwErrorIfPromiseRejected(promise, 'WDNCHNUASE44432');
    }

    private handleOpenUiActionSignalEvent() {
        this.showOpenDialog();
    }

    private handleSaveUiActionEvent() {
        this.showSaveDialog();
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditor();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleSymbolLinkUiActionSignalEvent() {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private handleGridSourceOpenedEvent(rankedLitIvemIdList: RankedLitIvemIdList, rankedLitIvemIdListName: string | undefined) {
        this.watchlistCaption = Strings[StringId.Watchlist];
        const baseTabDisplay = this._frame.baseTabDisplay;
        let tabTitle: string;
        if (rankedLitIvemIdListName === undefined) {
            tabTitle = baseTabDisplay;
            this.watchlistAbbreviatedDescription = '';
            this.watchListFullDescription = Strings[StringId.RankedLitIvemIdListDisplay_LitIvemIdArray];
        } else {
            tabTitle = `${baseTabDisplay} ${rankedLitIvemIdListName}`;
            const typeId = rankedLitIvemIdList.typeId;
            this.watchlistAbbreviatedDescription = `${rankedLitIvemIdListName} (${RankedLitIvemIdListDefinition.Type.idToAbbreviation(typeId)})`;
            this.watchListFullDescription = `${rankedLitIvemIdListName} (${RankedLitIvemIdListDefinition.Type.idToDisplay(typeId)})`;
        }
        this.setTitle(tabTitle, rankedLitIvemIdListName);
        this.markForCheck();
    }

    private handleLitIvemIdAcceptedEvent(litIvemId: LitIvemId) {
        this._symbolEditUiAction.pushValue(litIvemId);
        this._symbolApplyUiAction.pushDisabled();
    }

    private handleGridLayoutSetEvent(layout: GridLayout) {
        // not implemented
    }

    private createSymbolEditUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        action.commitEvent = (typeId) => this.handleSymbolCommitEvent(typeId);
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createSymbolApplyUiAction() {
        const commandName = InternalCommand.Id.ApplySymbol;
        const displayId = StringId.ApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_SymbolButtonTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        action.signalEvent = () => this.handleSymbolApplyUiActionSignalEvent();
        return action;
    }

    private createDeleteSymbolUiAction() {
        const commandName = InternalCommand.Id.Watchlist_DeleteSymbol;
        const displayId = StringId.Watchlist_DeleteSymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_DeleteSymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.DeleteSelectedItem);
        action.signalEvent = () => this.handleDeleteSymbolUiActionEvent();
        return action;
    }

    private createNewUiAction() {
        const commandName = InternalCommand.Id.Watchlist_New;
        const displayId = StringId.Watchlist_NewCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_NewTitle]);
        action.pushIcon(IconButtonUiAction.IconId.NewWatchlist);
        action.pushUnselected();
        action.signalEvent = (signalTypeId) => this.handleNewUiActionSignalEvent(signalTypeId);
        return action;
    }

    private createOpenUiAction() {
        const commandName = InternalCommand.Id.Watchlist_Open;
        const displayId = StringId.Watchlist_OpenCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_OpenTitle]);
        action.pushIcon(IconButtonUiAction.IconId.OpenWatchlist);
        action.pushUnselected();
        action.signalEvent = () => this.handleOpenUiActionSignalEvent();
        return action;
    }

    private createSaveUiAction() {
        const commandName = InternalCommand.Id.Watchlist_Save;
        const displayId = StringId.Watchlist_SaveCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Watchlist_SaveTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SaveWatchlist);
        action.pushUnselected();
        action.signalEvent = () => this.handleSaveUiActionEvent();
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

    private showOpenDialog() {
        this._modeId = WatchlistDitemNgComponent.ModeId.OpenDialog;

        const closePromise = OpenWatchlistDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Watchlist_OpenDialogCaption],
        );
        closePromise.then(
            () => { this.closeDialog(); },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'WDNCSOD32223', this._frame.opener.lockerName); }
        );

        this.markForCheck();
    }

    private showSaveDialog() {
        this._modeId = WatchlistDitemNgComponent.ModeId.SaveDialog;

        const closePromise = SaveWatchlistDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Watchlist_SaveDialogCaption],
        );
        closePromise.then(
            (saveAsDefinition) => {
                if (saveAsDefinition !== undefined) {
                    this._frame.saveGridSourceAs(saveAsDefinition);
                    this.closeDialog();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'WDNCSOD32223', this._frame.opener.lockerName); }
        );

        this.markForCheck();
    }

    private showLayoutEditor() {
        this._modeId = WatchlistDitemNgComponent.ModeId.LayoutDialog;
        const allowedFieldsGridLayoutDefinition = this._frame.createAllowedFieldsGridLayoutDefinition();

        const closePromise = NameableGridLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Watchlist_ColumnsDialogCaption],
            allowedFieldsGridLayoutDefinition
        );
        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    this._frame.openGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                }
                this.closeDialog();
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'WDNCSLE32223', this._frame.opener.lockerName); }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._modeId = WatchlistDitemNgComponent.ModeId.Input;
        this.markForCheck();
    }

    private pushDeleteButtonState(isRecordFocused: boolean) {
        if (!isRecordFocused) {
            this._deleteSymbolUiAction.pushDisabled();
        } else {
            if (this._frame.canDeleteRecord()) {
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
}

export namespace WatchlistDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Input,
        LayoutDialog,
        OpenDialog,
        SaveDialog,
    }
}
