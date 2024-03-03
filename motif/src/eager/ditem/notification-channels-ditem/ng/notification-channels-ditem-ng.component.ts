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
    IntegerExplicitElementsEnumUiAction,
    InternalCommand,
    JsonElement,
    LockOpenListItem,
    ModifierKey,
    ModifierKeyId,
    NotificationDistributionMethod,
    StringId,
    Strings,
    UiAction,
    delay1Tick,
    getErrorMessage
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, CoreInjectionTokens, LockOpenListItemOpenerNgUseClass, NotificationChannelsNgService, SettingsNgService, SymbolsNgService, ToastNgService } from 'component-services-ng-api';
import { LockOpenNotificationChannelPropertiesNgComponent, LockOpenNotificationChannelsGridNgComponent, NameableGridLayoutEditorDialogNgComponent } from 'content-ng-api';
import { ButtonInputNgComponent, IntegerEnumInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { NotificationChannelsDitemFrame } from '../notification-channels-ditem-frame';

@Component({
    selector: 'app-notifications-ditem-ng',
    templateUrl: './notification-channels-ditem-ng.component.html',
    styleUrls: ['./notification-channels-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ { provide: CoreInjectionTokens.lockOpenListItemOpener, useClass: LockOpenListItemOpenerNgUseClass }],
})
export class NotificationChannelsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('addControl') private _addControlComponent: IntegerEnumInputNgComponent;
    @ViewChild('deleteSelectedControl') private _deleteSelectedControlComponent: SvgButtonNgComponent;
    @ViewChild('selectAllControl') private _selectAllControlComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('grid', { static: true }) private _gridComponent: LockOpenNotificationChannelsGridNgComponent;
    @ViewChild('refreshListButton', { static: true }) private _refreshListControlComponent: ButtonInputNgComponent;
    @ViewChild('properties', { static: true }) private _propertiesComponent: LockOpenNotificationChannelPropertiesNgComponent;
    @ViewChild('dialogContainer', { read: ViewContainerRef, static: true }) private _dialogContainer: ViewContainerRef;

    // recordFocusEventer: ScansNgComponent.RecordFocusEventer;
    // gridClickEventer: ScansNgComponent.GridClickEventer;
    // columnsViewWithsChangedEventer: ScansNgComponent.ColumnsViewWithsChangedEventer;

    public listAreaWidth = 540;
    public listAreaMinWidth = 50;
    public splitterGutterSize = 3;

    public dialogActive = false;

    private _refreshListUiAction: ButtonUiAction;
    private _addUiAction: IntegerExplicitElementsEnumUiAction;
    private _deleteSelectedUiAction: IconButtonUiAction;
    private _selectAllUiAction: IconButtonUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;

    private _frame: NotificationChannelsDitemFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        notificationChannelsNgService: NotificationChannelsNgService,
        toastNgService: ToastNgService,
        @Self() @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        super(
            elRef,
            ++NotificationChannelsDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );

        this._opener = {
            lockerName: `${Strings[StringId.Notifications]}:${NotificationChannelsDitemNgComponent.typeInstanceCreateCount}`,
        };

        this._frame = new NotificationChannelsDitemFrame(
            this,
            this.settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            notificationChannelsNgService.service,
            toastNgService.service,
            this._opener,
            (channel) => this._propertiesComponent.setLockOpenNotificationChannel(channel, false),
        );

        this._refreshListUiAction = this.createRefreshListUiAction();
        this._addUiAction = this.createAddUiAction();
        this._deleteSelectedUiAction = this.createDeleteSelectedUiAction();
        this._selectAllUiAction = this.createSelectAllUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
        this.pushDeleteSelectedState();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return NotificationChannelsDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    public ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    handleSplitterDragEnd() {
        //
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(frameElement, this._gridComponent.frame);

        // this.pushFilterSelectState();
        this.initialiseChildComponents();

        // this._frame.open();

        super.initialise();
    }

    protected override finalise() {
        this._propertiesComponent.setLockOpenNotificationChannel(undefined, true);

        this._refreshListUiAction.finalise();
        this._deleteSelectedUiAction.finalise();
        this._selectAllUiAction.finalise();
        this._addUiAction.finalise();
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

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleColumnsUiActionSignalEvent() {
        const allowedFieldsGridLayoutDefinition = this._frame.createAllowedFieldsGridLayoutDefinition();

        const closePromise = NameableGridLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._opener,
            Strings[StringId.Scans_ColumnsDialogCaption],
            allowedFieldsGridLayoutDefinition,
        );

        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    this._frame.openGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                }
                this.closeDialog();
            },
            (reason) => {
                throw new AssertInternalError('SDNCHCUASE44534', getErrorMessage(reason));
            }
        );

        this.dialogActive = true;
        this.markForCheck();
    }

    private createRefreshListUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RefreshAllNotificationChannels;
        const displayId = StringId.NotificationChannels_RefreshAllCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.NotificationChannels_RefreshAllDescription]);
        action.pushUnselected();
        action.signalEvent = () => this.handleNewUiActionSignalEvent();
        return action;
    }

    private createAddUiAction() {
        const action = new IntegerExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.NotificationChannels_AddCaption]);
        action.pushTitle(Strings[StringId.NotificationChannels_AddDescription]);
        this.pushAddElements();
        action.commitEvent = () => {
            const methodId = this._addUiAction.definedValue;
            this._frame.add(methodId);
        };
        return action;
    }

    private pushAddElements() {
        const getPromise = this._frame.getSupportedDistributionMethodIds();
        getPromise.then(
            (ids) => {
                if (ids !== undefined) { // ignore if undefined as error or closing down
                    const elementPropertiesArray = ids.map<IntegerExplicitElementsEnumUiAction.ElementProperties>(
                        (id) => (
                            {
                                element: id,
                                caption: NotificationDistributionMethod.idToDisplay(id),
                                title: '',
                            }
                        )
                    );
                    this._addUiAction.pushElements(elementPropertiesArray, undefined);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCDNCPAE55667'); }
        )
    }

    private createDeleteSelectedUiAction() {
        const commandName = InternalCommand.Id.Grid_RemoveSelected;
        const displayId = StringId.NotificationChannels_RemoveSelectedCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.NotificationChannels_RemoveSelectedDescription]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => {
            const rowIndices = this._gridComponent.selection.getRowIndices(true);
            const count = rowIndices.length;
            const recordIndices = new Array<Integer>(count);
            for (let i = 0; i < count; i++) {
                const rowIndex = rowIndices[i];
                recordIndices[i] = this.grid.rowToRecordIndex(rowIndex);
            }
            this.list.removeAtIndices(recordIndices);
            const promise = this._frame.delete
        }
        return action;
    }

    private createSelectAllUiAction() {
        const commandName = InternalCommand.Id.Grid_SelectAll;
        const displayId = StringId.NotificationChannels_SelectAllCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.NotificationChannels_SelectAllDescription]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => {
            this._frame.sele(methodId);
        }
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

    private initialiseChildComponents() {
        this._refreshListControlComponent.initialise(this._refreshListUiAction);
        this._deleteSelectedControlComponent.initialise(this._deleteSelectedUiAction);
        this._selectAllControlComponent.initialise(this._selectAllUiAction);
        this._addControlComponent.initialise(this._addUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        this._propertiesComponent.editGridColumnsEventer = (
            caption,
            allowedFieldsAndLayoutDefinition
        ) => this.openGridColumnsEditorDialog(caption, allowedFieldsAndLayoutDefinition);

        // this._frame.open();
    }

    private pushDeleteSelectedState() {
        if (this._frame.litIvemIdLinked) {
            this._deleteSelectedUiAction.pushSelected();
        } else {
            this._deleteSelectedUiAction.pushUnselected();
        }
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

    private closeDialog() {
        this._dialogContainer.clear();
        this.dialogActive = false;
        this.markForCheck();
    }
}

export namespace NotificationChannelsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
