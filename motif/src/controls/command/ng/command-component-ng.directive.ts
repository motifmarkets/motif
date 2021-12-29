/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, Input } from '@angular/core';
import {
    Command, MultiEvent,
    SettingsService
} from '@motifmarkets/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class CommandComponentNgDirective extends ControlComponentBaseNgDirective {
    @Input() inputId: string;

    private _pushCommandEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray
    ) {
        super(cdr, settingsService, stateColorItemIdArray);
    }

    // protected override get uiAction() {
    //     return super.uiAction as ProcessorCommandUiAction;
    // }

    // protected applyValue(value: ProcessorCommandUiAction.Item | undefined) {
    //     this.markForCheck();
    // }

    protected applyItemTitle(enumValue: Command, title: string) {
        // for descendants
    }
    protected applyItemCaption(enumValue: Command, caption: string) {
        // for descendants
    }
    protected applyItems() {
        // for descendants
    }

    // protected commitValue(value: ProcessorCommandUiAction.Item | undefined) {
    //     if (this.uiAction.isValueDefined()) {
    //         this.uiAction.commitValue(value, UiAction.CommitTypeId.Explicit);
    //     } else {
    //         if (!this.uiAction.valueRequired) {
    //             this.uiAction.commitValue(
    //                 undefined,
    //                 UiAction.CommitTypeId.Explicit
    //             );
    //         }
    //     }
    // }

    // protected override setUiAction(action: ProcessorCommandUiAction) {
    //     super.setUiAction(action);

    //     const pushEventHandlersInterface: ProcessorCommandUiAction.PushEventHandlersInterface = {
    //         value: (value) => this.handleValuePushEvent(value),
    //         items: () => this.handleItemsPushEvent(),
    //     };
    //     this._pushCommandEventsSubscriptionId = this.uiAction.subscribePushEvents(
    //         pushEventHandlersInterface
    //     );

    //     this.applyValue(action.value);
    // }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(
            this._pushCommandEventsSubscriptionId
        );
        super.finalise();
    }

    // private handleValuePushEvent(
    //     value: ProcessorCommandUiAction.Item | undefined
    // ) {
    //     this.applyValue(value);
    // }

    private handleItemsPushEvent() {
        this.applyItems();
    }
}
