import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    ActiveFaultedStatus,
    AllowedFieldsGridLayoutDefinition,
    AssertInternalError,
    BooleanUiAction,
    GridLayoutOrReferenceDefinition,
    LockOpenNotificationChannel,
    MultiEvent,
    NotificationDistributionMethod,
    StringId,
    StringUiAction,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import {
    CaptionLabelNgComponent,
    IntegerTextInputNgComponent
} from 'controls-ng-api';
import { ComponentBaseNgDirective } from '../../../../component/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-lock-open-notification-channel-properties',
    templateUrl: './lock-open-notification-channel-properties-ng.component.html',
    styleUrls: ['./lock-open-notification-channel-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LockOpenNotificationChannelPropertiesNgComponent extends ContentComponentBaseNgDirective
    implements  OnDestroy, AfterViewInit {

    @ViewChild('enabledLabel', { static: true }) private _enabledLabelComponent: CaptionLabelNgComponent;
    @ViewChild('enabledControl', { static: true }) private _enabledControlComponent: IntegerTextInputNgComponent;
    @ViewChild('nameLabel', { static: true }) private _nameLabelComponent: CaptionLabelNgComponent;
    @ViewChild('nameControl', { static: true }) private _nameControlComponent: IntegerTextInputNgComponent;
    @ViewChild('descriptionLabel', { static: true }) private _descriptionLabelComponent: CaptionLabelNgComponent;
    @ViewChild('descriptionControl', { static: true }) private _descriptionControlComponent: IntegerTextInputNgComponent;

    editGridColumnsEventer: LockOpenNotificationChannelPropertiesNgComponent.EditGridColumnsEventer | undefined;

    public readonly typeLabel: string;
    public readonly statusLabel: string;
    public type = '';
    public status = '';

    private _modifier: LockOpenNotificationChannel.Modifier;

    private readonly _enabledUiAction: BooleanUiAction;
    private readonly _nameUiAction: StringUiAction;
    private readonly _descriptionUiAction: StringUiAction;

    private _channel: LockOpenNotificationChannel | undefined;
    private _channelFieldsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
    ) {
        super(elRef, ++LockOpenNotificationChannelPropertiesNgComponent.typeInstanceCreateCount);

        this.typeLabel = Strings[StringId.LockOpenNotificationChannelHeader_Name];

        this._enabledUiAction = this.createEnabledUiAction();
        this._nameUiAction = this.createNameUiAction();
        this._descriptionUiAction = this.createDescriptionUiAction();

        this.pushChannelUndefined();
    }

    get channel() { return this._channel; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    setRootComponentInstanceId(root: ComponentBaseNgDirective.InstanceId) {
        this._modifier = root;
    }

    setLockOpenNotificationChannel(value: LockOpenNotificationChannel | undefined, finalise: boolean) {
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
        if (this._channel === undefined) {
            return true;
        } else {
            return (
                this._enabledUiAction.isValueOk() &&
                this._nameUiAction.isValueOk() &&
                this._descriptionUiAction.isValueOk()
            );
        }
    }

    cancelAllControlsEdited() {
        this._enabledUiAction.cancelEdit();
        this._nameUiAction.cancelEdit();
        this._descriptionUiAction.cancelEdit();
    }

    private initialiseComponents() {
        this._enabledLabelComponent.initialise(this._enabledUiAction);
        this._enabledControlComponent.initialise(this._enabledUiAction);
        this._nameLabelComponent.initialise(this._nameUiAction);
        this._nameControlComponent.initialise(this._nameUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._descriptionControlComponent.initialise(this._descriptionUiAction);
    }

    private finalise() {
        this._descriptionUiAction.finalise();
        this._enabledUiAction.finalise();
        this._nameUiAction.finalise();
    }

    private createEnabledUiAction() {
        const action = new BooleanUiAction(false);
        action.pushCaption(Strings[StringId.LockOpenNotificationChannelHeader_Enabled]);
        action.pushTitle(Strings[StringId.LockOpenNotificationChannelDescription_Enabled]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('LONCPNCCEUAC11008');
            } else {
                const value = this._enabledUiAction.value;
                if (value === undefined) {
                    throw new AssertInternalError('LONCPNCCEUAV11008');
                } else {
                    channel.setEnabled(value, this._modifier);
                }
            }
        };
        return action;
    }

    private createNameUiAction() {
        const action = new StringUiAction(false);
        action.pushCaption(Strings[StringId.LockOpenNotificationChannelHeader_Name]);
        action.pushTitle(Strings[StringId.LockOpenNotificationChannelDescription_Name]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('LONCPNCCNUAC11008');
            } else {
                const value = this._nameUiAction.value;
                if (value === undefined) {
                    throw new AssertInternalError('LONCPNCCNUAV11008');
                } else {
                    channel.setName(value, this._modifier);
                }
            }
        };
        return action;
    }

    private createDescriptionUiAction() {
        const action = new StringUiAction(true);
        action.pushCaption(Strings[StringId.LockOpenNotificationChannelHeader_Description]);
        action.pushTitle(Strings[StringId.LockOpenNotificationChannelDescription_Description]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('LONCPNCCDUAC11008');
            } else {
                const value = this._descriptionUiAction.value;
                channel.setDescription(value, this._modifier);
            }
        };
        return action;
    }

    private pushChannelUndefined() {
        this.type = '';
        this.status = '';
        this._enabledUiAction.pushValue(undefined);
        this._enabledUiAction.pushDisabled();
        this._nameUiAction.pushValue(undefined);
        this._nameUiAction.pushDisabled();
        this._descriptionUiAction.pushValue(undefined);
        this._descriptionUiAction.pushDisabled();
        this._cdr.markForCheck();
    }

    private pushChannelDefined(channel: LockOpenNotificationChannel) {
        this.type = NotificationDistributionMethod.idToDisplay(channel.distributionMethodId);
        this.status = ActiveFaultedStatus.idToDisplay(channel.statusId);
        this._enabledUiAction.pushValue(channel.enabled);
        this._enabledUiAction.pushValidOrMissing();
        this._nameUiAction.pushValue(channel.name);
        this._nameUiAction.pushValidOrMissing();
        this._descriptionUiAction.pushValue(channel.description);
        this._descriptionUiAction.pushValidOrMissing();
        this._cdr.markForCheck();
    }

    private processChangedFields(
        fieldIds: readonly LockOpenNotificationChannel.FieldId[],
        modifier: LockOpenNotificationChannel.Modifier | undefined
    ) {
        if (modifier === undefined || modifier !== this._modifier) {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('LONCPNCPCF44452')
            } else {
                const count = fieldIds.length;
                for (let i = 0; i < count; i++) {
                    const fieldId = fieldIds[i];
                    this.pushFieldId(channel, fieldId);
                }
            }
        }
    }

    private pushFieldId(channel: LockOpenNotificationChannel, fieldId: LockOpenNotificationChannel.FieldId): void {
        switch (fieldId) {
            case LockOpenNotificationChannel.FieldId.Id:
                throw new AssertInternalError('LONCPNCPFII44452', channel.id);
            case LockOpenNotificationChannel.FieldId.Valid:
                // may need in future
                break;
            case LockOpenNotificationChannel.FieldId.Enabled:
                this._enabledUiAction.pushValue(channel.enabled);
                break;
            case LockOpenNotificationChannel.FieldId.Name:
                this._nameUiAction.pushValue(channel.name);
                break;
            case LockOpenNotificationChannel.FieldId.Description:
                this._descriptionUiAction.pushValue(channel.name);
                break;
            case LockOpenNotificationChannel.FieldId.Favourite:
                // may use in future
                break;
            case LockOpenNotificationChannel.FieldId.StatusId:
                this.status = ActiveFaultedStatus.idToDisplay(channel.statusId);
                this._cdr.markForCheck();
                break;
            case LockOpenNotificationChannel.FieldId.DistributionMethodId:
                // This should never change
                this.status = NotificationDistributionMethod.idToDisplay(channel.distributionMethodId);
                this._cdr.markForCheck();
                break;
            case LockOpenNotificationChannel.FieldId.Faulted:
                // Same as status so ignore
                break;
            case LockOpenNotificationChannel.FieldId.Settings:
                // Ignore for now
                break;
            default:
                throw new UnreachableCaseError('LONCPNCPFID44452', fieldId);
        }
    }

}

export namespace LockOpenNotificationChannelPropertiesNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type EditGridColumnsEventer = (
        this: void,
        caption: string,
        allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition
    ) => Promise<GridLayoutOrReferenceDefinition | undefined>;
}
