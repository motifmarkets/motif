/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, Input } from '@angular/core';
import { EnumArrayUiAction, SettingsService, UiAction } from 'src/core/internal-api';
import { Integer, isUndefinableArrayEqualUniquely, MultiEvent } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class EnumArrayComponentBaseNgDirective extends ControlComponentBaseNgDirective {
    @Input() inputId: string;

    private _pushEnumEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _filter: readonly Integer[] | undefined;

    protected get uiAction() { return super.uiAction as EnumArrayUiAction; }

    constructor(
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray
    ) {
        super(cdr, settingsService, stateColorItemIdArray);
    }

    protected applyValue(value: readonly Integer[] | undefined) {
        this.markForCheck();
    }

    protected applyFilter(filter: readonly Integer[] | undefined) {
        if (filter === undefined) {
            this._filter = undefined;
        } else {
            this._filter = filter.slice();
        }
    }

    protected applyElementTitle(enumValue: Integer, title: string) {
        // for descendants
    }
    protected applyElementCaption(enumValue: Integer, caption: string) {
        // for descendants
    }
    protected applyElements() {
        // for descendants
    }

    protected commitValue(value: readonly Integer[] | undefined) {
        if (value !== undefined) {
            this.uiAction.commitValue(value, UiAction.CommitTypeId.Explicit);
        } else {
            if (!this.uiAction.valueRequired) {
                this.uiAction.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            }
        }
    }

    protected setUiAction(action: EnumArrayUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: EnumArrayUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value),
            filter: (filter) => this.handleFilterPushEvent(filter),
            element: (element, caption, title) => this.handleElementPushEvent(element, caption, title),
            elements: () => this.handleElementsPushEvent(),
        };
        this._pushEnumEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value);
        this.applyFilter(action.filter);
    }

    protected finalise() {
        this.uiAction.unsubscribePushEvents(this._pushEnumEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: readonly Integer[] | undefined) {
        this.applyValue(value);
    }

    private handleFilterPushEvent(filter: readonly Integer[] | undefined) {
        if (!isUndefinableArrayEqualUniquely(filter, this._filter)) {
            this.applyFilter(filter);
        }
    }

    private handleElementPushEvent(element: Integer, caption: string, title: string) {
        this.applyElementTitle(element, title);
        this.applyElementCaption(element, caption);
    }

    private handleElementsPushEvent() {
        this.applyElements();
    }
}
