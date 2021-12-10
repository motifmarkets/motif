/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import { DecimalUiAction, MultiEvent, SettingsService, UiAction } from '@motifmarkets/motif-core';
import { Decimal } from 'decimal.js-light';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class DecimalComponentBaseNgDirective extends ControlComponentBaseNgDirective {
    public max?: number;
    public min?: number;
    public step?: number;

    private _pushDecimalEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray) {
        super(cdr, settingsService, stateColorItemIdArray);
    }

    public override get uiAction() { return super.uiAction as DecimalUiAction; }

    protected applyValue(value: Decimal | undefined) {
        this.markForCheck();
    }

    protected applyOptions(options: DecimalUiAction.Options) {
        this.max = options.max;
        this.min = options.min;
        this.step = options.step;
    }

    protected override pushSettings() {
        this.applyOptions(this.uiAction.options);
        this.applyValue(this.uiAction.value);
        super.pushSettings();
    }

    protected commitValue(value: Decimal | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }

    protected override setUiAction(action: DecimalUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: DecimalUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value),
            options: (options) => this.handleOptionsPushEvent(options),
        };
        this._pushDecimalEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyOptions(action.options);
        this.applyValue(action.value);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushDecimalEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: Decimal | undefined) {
        this.applyValue(value);
    }

    private handleOptionsPushEvent(options: DecimalUiAction.Options) {
        if (options !== this.uiAction.options) {
            this.applyOptions(options);
            this.applyValue(this.uiAction.value);
        }
    }
}
