import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    AssertInternalError,
    HtmlTypes,
    Integer,
    LockerScanAttachedNotificationChannelList,
    NotificationChannelsService,
    ScanEditor,
    StringExplicitElementsEnumUiAction,
    StringId,
    Strings,
    UnreachableCaseError,
    delay1Tick
} from '@motifmarkets/motif-core';
import { NotificationChannelsNgService } from 'component-services-ng-api';
import {
    IntegerEnumInputNgComponent
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
    @ViewChild('addChannelControl', { static: true }) private _addChannelControlComponent: IntegerEnumInputNgComponent;
    @ViewChild('channelsGrid', { static: true }) private _channelsGridComponent: ScanEditorAttachedNotificationChannelsGridNgComponent;
    @ViewChild('channelProperties', { static: true }) private _channelPropertiesComponent: ScanEditorAttachedNotificationChannelPropertiesNgComponent;

    public sectionHeadingText = Strings[StringId.Notifiers];

    private readonly _notificationChannelsService: NotificationChannelsService;
    private readonly _addChannelUiAction: StringExplicitElementsEnumUiAction;

    private _list: LockerScanAttachedNotificationChannelList | undefined;
    private _channelsGridFrame: ScanEditorAttachedNotificationChannelsGridFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        notificationChannelsNgService: NotificationChannelsNgService,
    ) {
        super(elRef, ++ScanEditorAttachedNotificationChannelsNgComponent.typeInstanceCreateCount);

        this._notificationChannelsService = notificationChannelsNgService.service;
        this._addChannelUiAction = this.createAddChannelUiAction();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    override setEditor(value: ScanEditor | undefined) {
        if (value !== this.scanEditor) {
            super.setEditor(value);
            this._channelPropertiesComponent.setAttachedNotificationChannel(undefined, false);
            if (value === undefined) {
                this._list = undefined;
                this._channelsGridComponent.setList(undefined);
            } else {
                const list = value.attachedNotificationChannelsList;
                this._list = list;
                this._channelsGridComponent.setList(list);
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

        this._addChannelControlComponent.initialise(this._addChannelUiAction);
        this._addChannelControlComponent.openEventer = () => this.pushAddChannelElements();
        this._channelsGridFrame = this._channelsGridComponent.frame;
        this._channelsGridFrame.recordFocusedEventer = (index) => this.processChannelsGridFrameFocusChange(index);
    }

    private finalise() {
        this._addChannelUiAction.finalise();
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

    private async pushAddChannelElements(): Promise<void> {
        const channelList = await this._notificationChannelsService.getChannelList(false);
        if (channelList === undefined) {
            this._addChannelUiAction.pushElements([], undefined);
        } else {
            const count = channelList.count;
            const elementPropertiesArray = new Array<StringExplicitElementsEnumUiAction.ElementProperties>(count);
            for (let i = 0; i < count; i++) {
                const channel = channelList.getAt(i);
                const description = channel.channelDescription;
                const elementProperties: StringExplicitElementsEnumUiAction.ElementProperties = {
                    element: channel.channelId,
                    caption: channel.channelName,
                    title: description === undefined ? '' : description,
                };
                elementPropertiesArray[i] = elementProperties;
            }
            this._addChannelUiAction.pushElements(elementPropertiesArray, undefined);
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
}

export namespace ScanEditorAttachedNotificationChannelsNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
}
