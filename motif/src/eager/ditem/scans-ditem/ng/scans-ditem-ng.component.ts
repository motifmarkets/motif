import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    Self,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AllowedFieldsGridLayoutDefinition,
    AssertInternalError,
    ButtonUiAction,
    GridLayoutOrReferenceDefinition,
    IconButtonUiAction,
    InternalCommand,
    JsonElement,
    LitIvemId,
    LockOpenListItem,
    ModifierKey,
    ModifierKeyId,
    StringId,
    StringUiAction,
    Strings,
    UiAction,
    UiBadnessComparableList,
    delay1Tick,
    getErrorMessage
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, CoreInjectionTokens, LockOpenListItemOpenerNgUseClass, ScansNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { LitIvemIdListEditorDialogNgComponent, NameableGridLayoutEditorDialogNgComponent, ScanEditorNgComponent, ScanListNgComponent } from 'content-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { ScansDitemFrame } from '../scans-ditem-frame';

@Component({
    selector: 'app-scans-ditem-ng',
    templateUrl: './scans-ditem-ng.component.html',
    styleUrls: ['./scans-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ { provide: CoreInjectionTokens.lockOpenListItemOpener, useClass: LockOpenListItemOpenerNgUseClass }],
})
export class ScansDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('newButton', { static: true }) private _newButtonComponent: ButtonInputNgComponent;
    @ViewChild('filterEdit') private _filterEditComponent: TextInputNgComponent;
    @ViewChild('symbolLinkButton') private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('dialogContainer', { read: ViewContainerRef, static: true }) private _dialogContainer: ViewContainerRef;
    @ViewChild('scanList', { static: true }) private _listComponent: ScanListNgComponent;
    @ViewChild('scanEditor', { static: true }) private _editorComponent: ScanEditorNgComponent;

    readonly listAreaWidth = 540;
    readonly listAreaMinWidth = 50;
    readonly splitterGutterSize = 3;

    // recordFocusEventer: ScansNgComponent.RecordFocusEventer;
    // gridClickEventer: ScansNgComponent.GridClickEventer;
    // columnsViewWithsChangedEventer: ScansNgComponent.ColumnsViewWithsChangedEventer;

    public dialogActive = false;

    private _newUiAction: ButtonUiAction;
    private _filterEditUiAction: StringUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;

    private _frame: ScansDitemFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        scansNgService: ScansNgService,
        @Self() @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        super(
            elRef,
            ++ScansDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );

        this._opener = {
            lockerName: `${Strings[StringId.ScanEditor]}:${ScansDitemNgComponent.typeInstanceCreateCount}`,
        };

        this._frame = new ScansDitemFrame(
            this,
            this.settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            scansNgService.service,
            this._opener,
            (editor) => this._editorComponent.setEditor(editor),
        );

        this._newUiAction = this.createNewUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
        this.pushSymbolLinkSelectState();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return ScansDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    public ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    handleSplitterDragEnd() {
        //
    }

    override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._listComponent.frame);

        // this.pushFilterSelectState();
        this.pushFilterEditValue();

        this.initialiseChildComponents();

        // this._frame.open();

        super.initialise();
    }

    protected override finalise() {
        this._editorComponent.editTargetsMultiSymbolGridColumnsEventer = undefined;
        this._editorComponent.popoutTargetsMultiSymbolListEditorEventer = undefined;

        this._newUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
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

    private handleNewUiActionSignalEvent() {
        this._frame.newScan();
    }

    private handleFilterEditUiActionCommitEvent() {
        this._frame.filterText = this._filterEditUiAction.definedValue;
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleColumnsUiActionSignalEvent() {
        // this.showLayoutEditor();
    }

    private handleSymbolLinkUiActionSignalEvent() {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private createNewUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.NewScan;
        const displayId = StringId.NewScan;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_ContactMeTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleNewUiActionSignalEvent();
        return action;
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        action.commitEvent = () => this.handleFilterEditUiActionCommitEvent();
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

    private initialiseChildComponents() {
        this._newButtonComponent.initialise(this._newUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        this._editorComponent.editTargetsMultiSymbolGridColumnsEventer = (
            caption,
            allowedFieldsAndLayoutDefinition
        ) => this.openGridColumnsEditorDialog(caption, allowedFieldsAndLayoutDefinition);

        this._editorComponent.popoutTargetsMultiSymbolListEditorEventer = (caption, list, columnsEditCaption) => {
            this.openTargetMultiSymbolListEditorDialog(caption, list, columnsEditCaption);
        }

        // this._frame.open();
    }

    private pushSymbolLinkSelectState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private pushFilterEditValue() {
        this._filterEditUiAction.pushValue(this._frame.filterText);
    }

    private openGridColumnsEditorDialog(caption: string, allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition) {
        this.dialogActive = true;

        // We cannot just return the promise from the dialog as we need to close the dialog as well.
        // So return a separate promise which is resolved when dialog is closed.
        let definitonResolveFtn: (this: void, definition: GridLayoutOrReferenceDefinition | undefined) => void;

        const definitionPromise = new Promise<GridLayoutOrReferenceDefinition | undefined>(
            (resolve) => {
                definitonResolveFtn = resolve;
            }
        )

        const closePromise = NameableGridLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            caption,
            allowedFieldsAndLayoutDefinition,
        );
        closePromise.then(
            (definition) => {
                definitonResolveFtn(definition);
                this.closeDialog();
            },
            (reason) => {
                throw new AssertInternalError('ODNCSLEDCPTR20987', getErrorMessage(reason));
            }
        );

        this.markForCheck();

        return definitionPromise;
    }

    private openTargetMultiSymbolListEditorDialog(caption: string, list: UiBadnessComparableList<LitIvemId>, columnsEditCaption: string) {
        this.dialogActive = true;

        const closePromise = LitIvemIdListEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            caption,
            list,
            columnsEditCaption
        );
        closePromise.then(
            () => {
                this.closeDialog();
            },
            (reason) => {
                throw new AssertInternalError('ODNCSLEDCPTR20987', getErrorMessage(reason));
            }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this.dialogActive = false;
        this.markForCheck();
    }
}

export namespace ScansDitemNgComponent {
    export const stateSchemaVersion = '2';
}
