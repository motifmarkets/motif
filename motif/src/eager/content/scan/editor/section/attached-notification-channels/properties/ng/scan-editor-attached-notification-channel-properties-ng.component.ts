import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    AssertInternalError,
    IntegerExplicitElementsEnumUiAction,
    LockerScanAttachedNotificationChannel,
    MultiEvent,
    NotificationChannel,
    NumberUiAction,
    StringId,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import {
    CaptionLabelNgComponent,
    IntegerEnumInputNgComponent,
    IntegerTextInputNgComponent
} from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-scan-editor-attached-notification-channel-properties',
    templateUrl: './scan-editor-attached-notification-channel-properties-ng.component.html',
    styleUrls: ['./scan-editor-attached-notification-channel-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanEditorAttachedNotificationChannelPropertiesNgComponent extends ContentComponentBaseNgDirective
    implements  OnDestroy, AfterViewInit {

    @ViewChild('minimumStableLabel', { static: true }) private _minimumStableLabelComponent: CaptionLabelNgComponent;
    @ViewChild('minimumStableControl', { static: true }) private _minimumStableControlComponent: IntegerTextInputNgComponent;
    @ViewChild('minimumElapsedLabel', { static: true }) private _minimumElapsedLabelComponent: CaptionLabelNgComponent;
    @ViewChild('minimumElapsedControl', { static: true }) private _minimumElapsedControlComponent: IntegerTextInputNgComponent;
    @ViewChild('ttlLabel', { static: true }) private _ttlLabelComponent: CaptionLabelNgComponent;
    @ViewChild('ttlControl', { static: true }) private _ttlControlComponent: IntegerTextInputNgComponent;
    @ViewChild('urgencyLabel', { static: true }) private _urgencyLabelComponent: CaptionLabelNgComponent;
    @ViewChild('urgencyControl', { static: true }) private _urgencyControlComponent: IntegerEnumInputNgComponent;

    public readonly channelNameLabel: string;
    public channelName = '';
    public channelId = '';

    private readonly _modifier: LockerScanAttachedNotificationChannel.Modifier;

    private readonly _minimumStableUiAction: NumberUiAction;
    private readonly _minimumElapsedUiAction: NumberUiAction;
    private readonly _ttlUiAction: NumberUiAction;
    private readonly _urgencyUiAction: IntegerExplicitElementsEnumUiAction;

    private _channel: LockerScanAttachedNotificationChannel | undefined;
    private _channelFieldsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
    ) {
        super(elRef, ++ScanEditorAttachedNotificationChannelPropertiesNgComponent.typeInstanceCreateCount);

        this._modifier = this.instanceId;
        this.channelNameLabel = Strings[StringId.LockerScanAttachedNotificationChannelHeader_Name];

        this._minimumStableUiAction = this.createMinimumStableUiAction();
        this._minimumElapsedUiAction = this.createMinimumElapsedUiAction();
        this._ttlUiAction = this.createTtlUiAction();
        this._urgencyUiAction = this.createUrgencyUiAction();

        this.pushChannelUndefined();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    setAttachedNotificationChannel(value: LockerScanAttachedNotificationChannel | undefined, finalise: boolean) {
        if (this._channel !== undefined) {
            this._channel.unsubscribeFieldsChangedEvent(this._channelFieldsChangedSubscriptionId);
            this._channelFieldsChangedSubscriptionId = undefined;
            this._channel = undefined;
            if (value === undefined && !finalise) {
                this.pushChannelUndefined();
            }
        }

        if (value !== undefined) {
            this._channel = value;
            this._channelFieldsChangedSubscriptionId = value.subscribeFieldsChangedEvent(
                (fieldIds, modifier) => this.processChangedFields(fieldIds, modifier)
            );
            this.pushChannelDefined(value);
        }
    }

    areAllControlValuesOk() {
        return (
            this._minimumStableUiAction.isValueOk() &&
            this._minimumElapsedUiAction.isValueOk() &&
            this._ttlUiAction.isValueOk() &&
            this._urgencyUiAction.isValueOk()
        );
    }

    cancelAllControlsEdited() {
        this._minimumStableUiAction.cancelEdit();
        this._minimumElapsedUiAction.cancelEdit();
        this._ttlUiAction.cancelEdit();
        this._urgencyUiAction.cancelEdit();
    }

    private initialiseComponents() {
        this._minimumStableLabelComponent.initialise(this._minimumStableUiAction);
        this._minimumStableControlComponent.initialise(this._minimumStableUiAction);
        this._minimumElapsedLabelComponent.initialise(this._minimumElapsedUiAction);
        this._minimumElapsedControlComponent.initialise(this._minimumElapsedUiAction);
        this._ttlLabelComponent.initialise(this._ttlUiAction);
        this._ttlControlComponent.initialise(this._ttlUiAction);
        this._urgencyLabelComponent.initialise(this._urgencyUiAction);
        this._urgencyControlComponent.initialise(this._urgencyUiAction);
    }

    private finalise() {
        this._ttlUiAction.finalise();
        this._urgencyUiAction.finalise();
        this._minimumStableUiAction.finalise();
        this._minimumElapsedUiAction.finalise();
    }

    private createMinimumStableUiAction() {
        const action = new NumberUiAction(false);
        action.pushCaption(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesCaption_MinimumStable]);
        action.pushTitle(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesDescription_MinimumStable]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCCMSUAC45098');
            } else {
                const value = this._minimumStableUiAction.value;
                channel.setMinimumStable(value)
            }
        };
        return action;
    }

    private createMinimumElapsedUiAction() {
        const action = new NumberUiAction(false);
        action.pushCaption(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesCaption_MinimumElapsed]);
        action.pushTitle(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesDescription_MinimumElapsed]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCCMEUAC45098');
            } else {
                const value = this._minimumElapsedUiAction.value;
                channel.setMinimumStable(value)
            }
        };
        return action;
    }

    private createTtlUiAction() {
        const action = new NumberUiAction(true);
        action.pushCaption(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesCaption_Ttl]);
        action.pushTitle(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesDescription_Ttl]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCCTUACC45098');
            } else {
                const value = this._ttlUiAction.value;
                if (value === undefined) {
                    throw new AssertInternalError('SEANCPNCCTUACV45098');
                } else {
                    channel.setTtl(value)
                }
            }
        };
        return action;
    }

    private createUrgencyUiAction() {
        const action = new IntegerExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesCaption_Urgency]);
        action.pushTitle(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesDescription_Urgency]);
        const ids = NotificationChannel.SourceSettings.Urgency.allIds;
        const elementPropertiesArray = ids.map<IntegerExplicitElementsEnumUiAction.ElementProperties>(
            (id) => (
                {
                    element: id,
                    caption: NotificationChannel.SourceSettings.Urgency.idToDisplay(id),
                    title: NotificationChannel.SourceSettings.Urgency.idToDescription(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCCUUAC45098');
            } else {
                const value = this._urgencyUiAction.value;
                channel.setUrgency(value);
            }
        };
        return action;
    }

    private pushChannelUndefined() {
        this.channelName = '';
        this.channelId = '';
        this._minimumStableUiAction.pushValue(undefined);
        this._minimumStableUiAction.pushDisabled();
        this._minimumElapsedUiAction.pushValue(undefined);
        this._minimumElapsedUiAction.pushDisabled();
        this._ttlUiAction.pushValue(undefined);
        this._ttlUiAction.pushDisabled();
        this._urgencyUiAction.pushValue(undefined);
        this._urgencyUiAction.pushDisabled();
        this._cdr.markForCheck();
    }

    private pushChannelDefined(channel: LockerScanAttachedNotificationChannel) {
        this.channelId = channel.channelId;
        this.channelName = channel.name;
        this._minimumStableUiAction.pushValue(channel.minimumStable);
        this._minimumStableUiAction.pushValidOrMissing();
        this._minimumElapsedUiAction.pushValue(channel.minimumElapsed);
        this._minimumElapsedUiAction.pushValidOrMissing();
        this._ttlUiAction.pushValue(channel.ttl);
        this._ttlUiAction.pushValidOrMissing();
        this._urgencyUiAction.pushValue(channel.urgencyId);
        this._urgencyUiAction.pushValidOrMissing();
        this._cdr.markForCheck();
    }

    private processChangedFields(
        fieldIds: readonly LockerScanAttachedNotificationChannel.FieldId[],
        modifier: LockerScanAttachedNotificationChannel.Modifier | undefined
    ) {
        if (modifier !== this._modifier) {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCPCF44452')
            } else {
                const count = fieldIds.length;
                for (let i = 0; i < count; i++) {
                    const fieldId = fieldIds[i];
                    this.pushFieldId(channel, fieldId);
                }
            }
        }
    }

    private pushFieldId(channel: LockerScanAttachedNotificationChannel, fieldId: LockerScanAttachedNotificationChannel.FieldId): void {
        switch (fieldId) {
            case LockerScanAttachedNotificationChannel.FieldId.ChannelId:
                throw new AssertInternalError('SEANCPNCPFII44452', channel.channelId);
            case LockerScanAttachedNotificationChannel.FieldId.Name:
                this.channelName = channel.name;
                this._cdr.markForCheck();
                break;
            case LockerScanAttachedNotificationChannel.FieldId.CultureCode:
                break;
            case LockerScanAttachedNotificationChannel.FieldId.MinimumStable:
                this._minimumStableUiAction.pushValue(channel.minimumStable);
                break;
            case LockerScanAttachedNotificationChannel.FieldId.MinimumElapsed:
                this._minimumElapsedUiAction.pushValue(channel.minimumElapsed);
                break;
            case LockerScanAttachedNotificationChannel.FieldId.Ttl:
                this._ttlUiAction.pushValue(channel.ttl);
                break;
            case LockerScanAttachedNotificationChannel.FieldId.Urgency:
                this._urgencyUiAction.pushValue(channel.urgencyId);
                break;
            case LockerScanAttachedNotificationChannel.FieldId.Topic:
                break;
            default:
                throw new UnreachableCaseError('SEANCPNCPFID44452', fieldId);
        }
    }

}

export namespace ScanEditorAttachedNotificationChannelPropertiesNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
}
