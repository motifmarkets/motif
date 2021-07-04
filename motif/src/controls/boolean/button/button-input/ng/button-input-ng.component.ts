/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { BooleanUiAction, ButtonUiAction, UiAction } from 'src/core/internal-api';
import { AssertInternalError, MultiEvent } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-button-input',
    templateUrl: './button-input-ng.component.html',
    styleUrls: ['./button-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonInputNgComponent extends ControlComponentBaseNgDirective implements OnInit {
    @Input() inputId: string;

    @ViewChild('buttonInput', { static: true }) private _buttonRef: ElementRef;

    private _pushButtonEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _value: boolean;

    private get value() { return this._value; }

    public override get uiAction() { return super.uiAction as ButtonUiAction; }

    constructor(private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this.inputId = 'Button' + this.instanceNumber.toString(10);
    }

    ngOnInit() {
        this.setInitialiseReady();
    }

    onClick(event: Event) {
        if (!(event instanceof MouseEvent)) {
            throw new AssertInternalError('BICOE1999580');
        } else {
            const downKeys = UiAction.makeDownKeys(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.MouseClick, downKeys);
        }
    }

    onEnterKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('BICOSED33845092');
        } else {
            const downKeys = UiAction.makeDownKeys(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.EnterKeyPress, downKeys);
        }
    }

    onSpacebarKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('BICOSKD4474982');
        } else {
            const downKeys = UiAction.makeDownKeys(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.SpacebarKeyPress, downKeys);
        }
    }

    protected override setUiAction(action: ButtonUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: BooleanUiAction.PushEventHandlersInterface = {
            value: (value) => this.handleValuePushEvent(value),
        };
        this._pushButtonEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushButtonEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: boolean | undefined) {
        this.applyValue(value);
    }

    private applyValue(value: boolean | undefined) {
        if (value === undefined) {
            this._value = false;
        } else {
            this._value = value;
        }
        this.markForCheck();
    }
}
