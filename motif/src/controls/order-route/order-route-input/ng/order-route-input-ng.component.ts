/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MultiEvent, OrderRoute, OrderRouteUiAction, StringId, Strings, UiAction, isArrayEqualUniquely } from '@motifmarkets/motif-core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SettingsNgService } from 'component-services-ng-api';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-order-route-input',
    templateUrl: './order-route-input-ng.component.html',
    styleUrls: ['./order-route-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRouteInputNgComponent extends ControlComponentBaseNgDirective implements OnInit {
    @Input() inputId: string;

    @ViewChild('ngSelect', { static: true }) private _ngSelectComponent: NgSelectComponent;

    public inputAttrs: InputAttrs = { size: '5' };
    public selected: OrderRoute | undefined;
    public allowedValues: OrderRoute[] = [];

    private _pushOrderRouteEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _renderer: Renderer2, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.service, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
    }

    public override get uiAction() { return super.uiAction as OrderRouteUiAction; }

    ngOnInit() {
        this.setInitialiseReady();
    }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    public customSearchFtn(term: string, item: OrderRoute) {
        term = term.toUpperCase();
        return item.upperCode.indexOf(term) > -1 || item.upperDisplay.indexOf(term) > -1;
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as ChangeEvent;

        if (changeEvent !== undefined && changeEvent !== null) {
            this.commitValue(changeEvent, UiAction.CommitTypeId.Explicit);
        } else {
            if (!this.uiAction.valueRequired) {
                this.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            }
        }
    }

    public handleSelectSearchEvent(event: SearchEvent) {
        const text = event.term;
        let value: OrderRoute | undefined;
        let valid: boolean;
        let missing: boolean;
        let errorText: string | undefined;
        if (text === '') {
            value = undefined;
            missing = this.uiAction.valueRequired;
            if (missing) {
                valid = false;
                errorText = Strings[StringId.ValueRequired];
            } else {
                valid = true;
                errorText = undefined;
            }
        } else {
            missing = false;
            if (event.items.length === 1) {
                if (text === event.items[0].code) {
                    value = event.items[0];
                    valid = true;
                    errorText = undefined;
                } else {
                    value = undefined;
                    valid = false;
                    errorText = Strings[StringId.BrokerageAccountNotMatched];
                }
            } else {
                value = undefined;
                valid = false;
                if (event.items.length === 0) {
                    errorText = Strings[StringId.BrokerageAccountNotFound];
                } else {
                    errorText = Strings[StringId.BrokerageAccountNotMatched];
                }
            }
        }

        this.uiAction.input(text, valid, missing, errorText);

        if (valid && this.uiAction.commitOnAnyValidInput) {
            this.uiAction.commitValue(value, UiAction.CommitTypeId.Input);
        }
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected override setUiAction(action: OrderRouteUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: OrderRouteUiAction.PushEventHandlersInterface = {
            value: (value, edited) => this.handleValuePushEvent(value, edited),
            allowedValues: (allowedValues) => this.handleAllowedValuesPushEvent(allowedValues),
        };
        this._pushOrderRouteEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
        this.applyAllowedValues(action.allowedValues);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushOrderRouteEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: OrderRoute | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleAllowedValuesPushEvent(allowedValues: readonly OrderRoute[]) {
        const arraysEqual = isArrayEqualUniquely(allowedValues, this.allowedValues);
        if (!arraysEqual) {
            this.applyAllowedValues(allowedValues);
        }
    }

    private applyValue(value: OrderRoute | undefined, edited: boolean) {
        if (!edited) {
            this._ngSelectComponent.searchTerm = '';
            if (value === undefined) {
                this.selected = undefined;
            } else {
                this.selected = value;
            }
            this.markForCheck();
        }
    }

    private applyAllowedValues(allowedValues: readonly OrderRoute[]) {
        this.allowedValues = allowedValues.slice();
        this.markForCheck();
    }

    private commitValue(value: OrderRoute | undefined, typeId: UiAction.CommitType.NotInputId) {
        this.uiAction.commitValue(value, typeId);
    }
}

interface InputAttrs { [key: string]: string }

interface SearchEvent {
    term: string;
    items: OrderRoute[];
}

type ChangeEvent = OrderRoute | undefined | null;
