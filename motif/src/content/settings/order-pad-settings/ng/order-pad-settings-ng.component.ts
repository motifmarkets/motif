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
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    BooleanUiAction,
    delay1Tick,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    OrderType,
    StringId,
    Strings,
    TimeInForce
} from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, CheckboxInputNgComponent, EnumInputNgComponent } from 'controls-ng-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-order-pad-settings',
    templateUrl: './order-pad-settings-ng.component.html',
    styleUrls: ['./order-pad-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPadSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('reviewEnabledLabel', { static: true }) private _reviewEnabledComponent: CaptionLabelNgComponent;
    @ViewChild('reviewEnabledControl', { static: true }) private _reviewEnabledControlComponent: CheckboxInputNgComponent;
    @ViewChild('defaultOrderTypeIdLabel', { static: true }) private _defaultOrderTypeIdLabelComponent: CaptionLabelNgComponent;
    @ViewChild('defaultOrderTypeIdControl', { static: true }) private _defaultOrderTypeIdControlComponent: EnumInputNgComponent;
    @ViewChild('defaultTimeInForceIdLabel', { static: true }) private _defaultTimeInForceIdLabelComponent: CaptionLabelNgComponent;
    @ViewChild('defaultTimeInForceIdControl', { static: true }) private _defaultTimeInForceIdControlComponent: EnumInputNgComponent;

    private _reviewEnabledUiAction: BooleanUiAction;
    private _defaultOrderTypeIdUiAction: ExplicitElementsEnumUiAction;
    private _defaultTimeInForceIdUiAction: ExplicitElementsEnumUiAction;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService);

        this._reviewEnabledUiAction = this.createReviewEnabledUiAction();
        this._defaultOrderTypeIdUiAction = this.createDefaultOrderTypeIdUiAction();
        this._defaultTimeInForceIdUiAction = this.createDefaultTimeInForceIdUiAction();

        this.processSettingsChanged();
    }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();

        delay1Tick(() => this.markForCheck());
    }

    protected processSettingsChanged() {
        this.pushValues();
    }

    protected override finalise() {
        this._reviewEnabledUiAction.finalise();
        this._defaultOrderTypeIdUiAction.finalise();
        this._defaultTimeInForceIdUiAction.finalise();

        super.finalise();
    }

    private handleDefaultOrderTypeIdUiActionCommit() {
        const enumValue = this._defaultOrderTypeIdUiAction.definedValue;
        if (enumValue < 0) {
            this.coreSettings.orderPad_DefaultOrderTypeId = undefined;
        } else {
            this.coreSettings.orderPad_DefaultOrderTypeId = enumValue;
        }
    }

    private handleDefaultTimeInForceIdUiActionCommit() {
        const enumValue = this._defaultTimeInForceIdUiAction.definedValue;
        if (enumValue < 0) {
            this.coreSettings.orderPad_DefaultTimeInForceId = undefined;
        } else {
            this.coreSettings.orderPad_DefaultTimeInForceId = enumValue;
        }
    }

    private createDefaultOrderTypeIdUiAction() {
        const action = new ExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.SettingCaption_OrderPad_DefaultOrderTypeId]);
        action.pushTitle(Strings[StringId.SettingTitle_OrderPad_DefaultOrderTypeId]);

        const allIds = OrderType.all;
        const allIdsCount = allIds.length;
        const elementPropertiesArray = new Array<EnumUiAction.ElementProperties>(allIdsCount + 1);

        const undefinedElementProperties: EnumUiAction.ElementProperties = {
            element: -1,
            caption: Strings[StringId.Undefined],
            title: Strings[StringId.DefaultOrderTypeIdNotSpecified],
        };
        elementPropertiesArray[0] = undefinedElementProperties;

        let idx = 1;
        for (let i = 0; i < allIdsCount; i++) {
            const id = allIds[i];
            const elementProperties: EnumUiAction.ElementProperties = {
                element: id,
                caption: OrderType.idToDisplay(id),
                title: OrderType.idToDisplay(id),
            };
            elementPropertiesArray[idx++] = elementProperties;
        }
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleDefaultOrderTypeIdUiActionCommit();
        return action;
    }

    private createDefaultTimeInForceIdUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.valueRequired = false;
        action.pushCaption(Strings[StringId.SettingCaption_OrderPad_DefaultTimeInForceId]);
        action.pushTitle(Strings[StringId.SettingTitle_OrderPad_DefaultTimeInForceId]);

        const allIds = TimeInForce.all;
        const allIdsCount = allIds.length;
        const elementPropertiesArray = new Array<EnumUiAction.ElementProperties>(allIdsCount + 1);

        const undefinedElementProperties: EnumUiAction.ElementProperties = {
            element: -1,
            caption: Strings[StringId.Undefined],
            title: Strings[StringId.DefaultTimeInForceIdNotSpecified],
        };
        elementPropertiesArray[0] = undefinedElementProperties;

        let idx = 1;
        for (let i = 0; i < allIdsCount; i++) {
            const id = allIds[i];
            const elementProperties: EnumUiAction.ElementProperties = {
                element: id,
                caption: TimeInForce.idToDisplay(id),
                title: TimeInForce.idToDisplay(id),
            };
            elementPropertiesArray[idx++] = elementProperties;
        }
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleDefaultTimeInForceIdUiActionCommit();
        return action;
    }

    private createReviewEnabledUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_OrderPad_ReviewEnabled]);
        action.pushTitle(Strings[StringId.SettingTitle_OrderPad_ReviewEnabled]);
        action.commitEvent = () => {
            this.coreSettings.orderPad_ReviewEnabled = this._reviewEnabledUiAction.definedValue;
        };
        return action;
    }

    private initialiseComponents() {
        this._reviewEnabledComponent.initialise(this._reviewEnabledUiAction);
        this._reviewEnabledControlComponent.initialise(this._reviewEnabledUiAction);
        this._defaultOrderTypeIdLabelComponent.initialise(this._defaultOrderTypeIdUiAction);
        this._defaultOrderTypeIdControlComponent.initialise(this._defaultOrderTypeIdUiAction);
        this._defaultTimeInForceIdLabelComponent.initialise(this._defaultTimeInForceIdUiAction);
        this._defaultTimeInForceIdControlComponent.initialise(this._defaultTimeInForceIdUiAction);
    }

    private pushValues() {
        this._reviewEnabledUiAction.pushValue(this.coreSettings.orderPad_ReviewEnabled);

        const defaultOrderTypeId = this.coreSettings.orderPad_DefaultOrderTypeId === undefined ?
            OrderPadSettingsNgComponent.UndefinedOrderTypeIdEnumValue :
            this.coreSettings.orderPad_DefaultOrderTypeId;
        this._defaultOrderTypeIdUiAction.pushValue(defaultOrderTypeId);

        const defaultTimeInForceId = this.coreSettings.orderPad_DefaultTimeInForceId === undefined ?
            OrderPadSettingsNgComponent.UndefinedTimeInForceIdEnumValue :
            this.coreSettings.orderPad_DefaultTimeInForceId;
        this._defaultTimeInForceIdUiAction.pushValue(defaultTimeInForceId);
    }
}

export namespace OrderPadSettingsNgComponent {

    export const UndefinedOrderTypeIdEnumValue = -1;
    export const UndefinedTimeInForceIdEnumValue = -1;

    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(OrderPadSettingsNgComponent);
        return componentRef.instance;
    }
}
