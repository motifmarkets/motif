/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AssertInternalError, BooleanUiAction, ButtonUiAction, ModifierKey, MultiEvent, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-button-input',
    templateUrl: './button-input-ng.component.html',
    styleUrls: ['./button-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonInputNgComponent extends ControlComponentBaseNgDirective implements OnInit {
    private static typeInstanceCreateCount = 0;

    @Input() inputId: string;

    @ViewChild('buttonInput', { static: true }) private _buttonRef: ElementRef;

    private _pushButtonEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _value: boolean;

    constructor(elRef: ElementRef<HTMLElement>, private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++ButtonInputNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service, ControlComponentBaseNgDirective.clickControlStateColorItemIdArray);
        this.inputId = 'Button' + this.typeInstanceId;
    }

    public override get uiAction() { return super.uiAction as ButtonUiAction; }
    private get value() { return this._value; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    onClick(event: Event) {
        if (!(event instanceof MouseEvent)) {
            throw new AssertInternalError('BICOE1999580');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.MouseClick, downKeys);
        }
    }

    onEnterKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('BICOSED33845092');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.EnterKeyPress, downKeys);
        }
    }

    onSpacebarKeyDown(event: Event) {
        if (!(event instanceof KeyboardEvent)) {
            throw new AssertInternalError('BICOSKD4474982');
        } else {
            const downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            this.uiAction.signal(UiAction.SignalTypeId.SpacebarKeyPress, downKeys);
        }
    }

    protected override setUiAction(action: ButtonUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: BooleanUiAction.PushEventHandlersInterface = {
            value: (value, edited) => this.handleValuePushEvent(value, edited),
        };
        this._pushButtonEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushButtonEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: boolean | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private applyValue(value: boolean | undefined, _edited: boolean) {
        if (value === undefined) {
            this._value = false;
        } else {
            this._value = value;
        }
        this.markForCheck();
    }
}
