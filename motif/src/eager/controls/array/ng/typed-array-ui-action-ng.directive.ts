/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive, Input } from '@angular/core';
import { MultiEvent, TypedArrayUiAction, UiAction } from '@motifmarkets/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class TypedArrayUiActionNgDirective<T> extends ControlComponentBaseNgDirective {
    @Input() inputId: string;

    private _pushTypedArrayEventsSubscriptionId: MultiEvent.SubscriptionId;

    override get uiAction() { return super.uiAction as TypedArrayUiAction<T>; }

    protected applyValue(_value: readonly T[] | undefined, _edited: boolean) {
        this.markForCheck();
    }

    protected commitValue(value: readonly T[] | undefined) {
        if (value !== undefined) {
            this.uiAction.commitValue(value, UiAction.CommitTypeId.Explicit);
        } else {
            if (!this.uiAction.valueRequired) {
                this.uiAction.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            }
        }
    }

    protected override setUiAction(action: TypedArrayUiAction<T>) {
        super.setUiAction(action);

        const pushEventHandlersInterface: TypedArrayUiAction.PushEventHandlersInterface<T> = {
            value: (value, edited) => this.handleValuePushEvent(value, edited),
        };
        this._pushTypedArrayEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushTypedArrayEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: readonly T[] | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }
}
