import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    AllowedFieldsGridLayoutDefinition,
    AssertInternalError,
    CommandRegisterService,
    GridLayoutOrReferenceDefinition,
    HtmlTypes,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    LockerScanAttachedNotificationChannelList,
    MultiEvent,
    NotificationChannelsService,
    ScanEditor,
    StringExplicitElementsEnumUiAction,
    StringId,
    Strings,
    UnreachableCaseError,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService, NotificationChannelsNgService } from 'component-services-ng-api';
import {
    IntegerEnumInputNgComponent, SvgButtonNgComponent
} from 'controls-ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanEditorSectionNgDirective } from '../../scan-editor-section-ng.directive';
import { ScanEditorAttachedNotificationChannelsGridFrame } from '../grid/internal-api';
import { ScanEditorAttachedNotificationChannelsGridNgComponent } from '../grid/ng-api';
import { ScanEditorAttachedNotificationChannelPropertiesNgComponent } from '../properties/ng-api';

@Component({
    selector: 'app-scan-editor-attached-notification-channels',
    templateUrl: './scan-editor-attached-notification-channels-ng.component.html',
    styleUrls: ['./scan-editor-attached-notification-channels-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanEditorAttachedNotificationChannelsNgComponent extends ScanEditorSectionNgDirective
    implements  OnDestroy, AfterViewInit {

    @ViewChild('sectionHeading', { static: true }) override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;
    @ViewChild('content', { static: true }) private _contentSection: HTMLElement;
    @ViewChild('channelsGrid', { static: true }) private _channelsGridComponent: ScanEditorAttachedNotificationChannelsGridNgComponent;
    @ViewChild('channelProperties', { static: true }) private _channelPropertiesComponent: ScanEditorAttachedNotificationChannelPropertiesNgComponent;
    @ViewChild('addChannelControl', { static: true }) private _addChannelControlComponent: IntegerEnumInputNgComponent;
    @ViewChild('selectAllControl') private _selectAllControlComponent: SvgButtonNgComponent;
    @ViewChild('removeSelectedControl') private _removeSelectedControlComponent: SvgButtonNgComponent;
    @ViewChild('columnsControl') private _columnsControlComponent: SvgButtonNgComponent;

    editGridColumnsEventer: ScanEditorAttachedNotificationChannelsNgComponent.EditGridColumnsEventer | undefined;

    public sectionHeadingText = Strings[StringId.Notifications];

    private readonly _notificationChannelsService: NotificationChannelsService;
    private readonly _addChannelUiAction: StringExplicitElementsEnumUiAction;
    private readonly _selectAllUiAction: IconButtonUiAction;
    private readonly _removeSelectedUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;

    private _list: LockerScanAttachedNotificationChannelList | undefined;
    private _listBeforeChannelsDetachSubscriptionId: MultiEvent.SubscriptionId;
    private _channelsGridFrame: ScanEditorAttachedNotificationChannelsGridFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        commandRegisterNgService: CommandRegisterNgService,
        notificationChannelsNgService: NotificationChannelsNgService,
    ) {
        super(elRef, ++ScanEditorAttachedNotificationChannelsNgComponent.typeInstanceCreateCount);

        this._notificationChannelsService = notificationChannelsNgService.service;

        const commandRegisterService = commandRegisterNgService.service;
        this._addChannelUiAction = this.createAddChannelUiAction();
        this._selectAllUiAction = this.createSelectAllUiAction(commandRegisterService);
        this._removeSelectedUiAction = this.createRemoveSelectedUiAction(commandRegisterService);
        this._columnsUiAction = this.createColumnsUiAction(commandRegisterService);
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    override setEditor(value: ScanEditor | undefined) {
        if (value !== this.scanEditor) {
            if (this._list !== undefined) {
                this._list.unsubscribeBeforeChannelsDetachEvent(this._listBeforeChannelsDetachSubscriptionId);
                this._listBeforeChannelsDetachSubscriptionId = undefined;
            }
            super.setEditor(value);
            this._channelPropertiesComponent.setAttachedNotificationChannel(undefined, false);
            if (value === undefined) {
                this._list = undefined;
                this._channelsGridComponent.setList(undefined);
            } else {
                const list = value.attachedNotificationChannelsList;
                this._list = list;
                this._channelsGridComponent.setList(list);
                this._listBeforeChannelsDetachSubscriptionId = list.subscribeBeforeChannelsDetachEvent(
                    (idx, count) => this.processBeforeChannelsDetach(idx, count)
                );
            }
        }
    }

    areAllControlValuesOk() {
        return (
            this._channelPropertiesComponent.areAllControlValuesOk()
        );
    }

    cancelAllControlsEdited() {
        this._channelPropertiesComponent.cancelAllControlsEdited();
    }

    protected override processExpandCollapseRestoreStateChanged() {
        switch (this.expandCollapseRestoreStateId) {
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Expanded:
                this._contentSection.style.display = HtmlTypes.Display.Flex;
                break;
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Restored:
                this._contentSection.style.display = HtmlTypes.Display.Flex;
                break;
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Collapsed:
                this._contentSection.style.display = HtmlTypes.Display.Flex;
                break;
            default:
                throw new UnreachableCaseError('NSESNC10198', this.expandCollapseRestoreStateId);
        }
    }

    protected override processFieldChanges(fieldIds: readonly ScanEditor.FieldId[], fieldChanger: number | undefined): void {
        // nothing to do
    }
    protected override processLifeCycleStateChange(): void {
        // nothing to do
    }
    protected override processModifiedStateChange(): void {
        // nothing to do
    }

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

        this._channelsGridFrame = this._channelsGridComponent.frame;
        this._channelsGridFrame.recordFocusedEventer = (index) => this.processChannelsGridFrameFocusChange(index);
        this._channelPropertiesComponent.setRootComponentInstanceId(this.instanceId);
        this._addChannelControlComponent.initialise(this._addChannelUiAction);
        this._addChannelControlComponent.openEventer = () => this.pushAddChannelElements();
        this._selectAllControlComponent.initialise(this._selectAllUiAction);
        this._removeSelectedControlComponent.initialise(this._removeSelectedUiAction);
        this._columnsControlComponent.initialise(this._columnsUiAction);
    }

    private finalise() {
        this._addChannelUiAction.finalise();
        this._selectAllUiAction.finalise();
        this._removeSelectedUiAction.finalise();
        this._columnsUiAction.finalise();
    }

    private createAddChannelUiAction() {
        const action = new StringExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.Attach]);
        action.pushPlaceholder(Strings[StringId.Attach]);
        action.pushTitle(Strings[StringId.ScanEditorAttachNotificationChannels_AttachDescription]);
        action.commitEvent = () => {
            const list = this._list;
            if (list === undefined) {
                throw new AssertInternalError('SEANCNCCACUAU22098');
            } else {
                const channelId = action.definedValue;
                delay1Tick(() => action.pushValue(undefined));
                const attachPromise = list.attachChannel(channelId);
                attachPromise.then(
                    () => {
                        const idx = list.indexOfChannelId(channelId);
                        if (idx >= 0) {
                            this._channelsGridFrame.focusItem(idx);
                        }
                    },
                    (reason) => { throw AssertInternalError.createIfNotError(reason, 'SEANCNCCACUAR22098'); }
                )
            }
        }

        return action;
    }

    private createSelectAllUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_SelectAll;
        const displayId = StringId.Grid_SelectAllCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Grid_SelectAllTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MarkAll);
        action.pushUnselected();
        action.signalEvent = () => {
            this._channelsGridComponent.selectAllRows();
        };
        return action;
    }

    private createRemoveSelectedUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_RemoveSelected;
        const displayId = StringId.ScanEditorAttachNotificationChannels_DetachSelectedChannelsCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanEditorAttachNotificationChannels_DetachSelectedChannelsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RemoveSelectedFromList);
        action.pushUnselected();
        action.signalEvent = () => {
            const list = this._list;
            if (list === undefined) {
                throw new AssertInternalError('SEANCNCCRSUAU22098');
            } else {
                const selectedIndices = this._channelsGridComponent.getSelectedRecordIndices();
                list.detachChannelsAtIndices(selectedIndices);
            }
        };
        return action;
    }

    private createColumnsUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => { this.handleColumnsSignalEvent(); };
        return action;
    }

    private async pushAddChannelElements(): Promise<void> {
        const channelList = await this._notificationChannelsService.getChannelList(false);
        if (channelList === undefined) {
            this._addChannelUiAction.pushElements([], undefined);
        } else {
            const lockerList = this._list;
            if (lockerList === undefined) {
                throw new AssertInternalError('SEANCNCPACE11334');
            } else {
                const maxCount = channelList.count;
                const elementPropertiesArray = new Array<StringExplicitElementsEnumUiAction.ElementProperties>(maxCount);
                let count = 0;
                for (let i = 0; i < maxCount; i++) {
                    const channel = channelList.getAt(i);
                    const channelId = channel.channelId;
                    if (lockerList.indexOfChannelId(channelId) < 0) {
                        // only include channels not yet attached
                        const description = channel.channelDescription;
                        const elementProperties: StringExplicitElementsEnumUiAction.ElementProperties = {
                            element: channel.channelId,
                            caption: channel.channelName,
                            title: description === undefined ? '' : description,
                        };
                        elementPropertiesArray[count++] = elementProperties;
                    }
                }
                elementPropertiesArray.length = count;
                this._addChannelUiAction.pushElements(elementPropertiesArray, undefined);
            }
        }
    }

    private processBeforeChannelsDetach(idx: Integer, count: Integer) {
        const activeChannel = this._channelPropertiesComponent.channel;
        if (activeChannel !== undefined) {
            const list = this._list;
            if (list === undefined) {
                throw new AssertInternalError('SEANCNCPBCD56081');
            } else {
                for (let i = idx + count - 1; i >= idx; i--) {
                    const channel = list.getAt(i);
                    if (channel === activeChannel) {
                        this._channelPropertiesComponent.setAttachedNotificationChannel(undefined, false);
                        break;
                    }
                }
            }
        }
    }

    private processChannelsGridFrameFocusChange(index: Integer | undefined) {
        if (index === undefined) {
            this._channelPropertiesComponent.setAttachedNotificationChannel(undefined, false);
        } else {
            const channel = this._channelsGridFrame.getLockerScanAttachedNotificationChannelAt(index);
            this._channelPropertiesComponent.setAttachedNotificationChannel(channel, false);
        }
    }

    private handleColumnsSignalEvent() {
        const allowedFieldsAndLayoutDefinition = this._channelsGridFrame.createAllowedFieldsGridLayoutDefinition();
        const promise = this.editGridColumns(allowedFieldsAndLayoutDefinition);
        promise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    this._channelsGridFrame.openGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SEANCNCHCSE45698'); }
        );
    }

    private editGridColumns(allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition) {
        if (this.editGridColumnsEventer === undefined) {
            return Promise.resolve(undefined);
        } else {
            return this.editGridColumnsEventer(Strings[StringId.ScanEditorAttachNotificationChannels_EditGridColumns], allowedFieldsAndLayoutDefinition);
        }
    }

}

export namespace ScanEditorAttachedNotificationChannelsNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type EditGridColumnsEventer = (
        this: void,
        caption: string,
        allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition
    ) => Promise<GridLayoutOrReferenceDefinition | undefined>;
}
