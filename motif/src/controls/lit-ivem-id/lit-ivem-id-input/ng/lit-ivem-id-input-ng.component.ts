/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    ViewChild
} from '@angular/core';
import { LitIvemId, LitIvemIdUiAction, MultiEvent, StringId, Strings, SymbolsService, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-lit-ivem-id-input',
    templateUrl: './lit-ivem-id-input-ng.component.html',
    styleUrls: ['./lit-ivem-id-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LitIvemIdInputNgComponent extends ControlComponentBaseNgDirective {
    @Input() inputId: string;

    @ViewChild('litivemidInput', { static: true }) private symbolInput: ElementRef;

    public symbol = LitIvemIdInputNgComponent.emptySymbol;

    private _symbolsService: SymbolsService;
    private _pushLitivemidEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService
    ) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this._symbolsService = symbolsNgService.service;
        this.inputId = 'LitIvemIdInput' + this.componentInstanceId;
    }

    public override get uiAction() { return super.uiAction as LitIvemIdUiAction; }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    onInput(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.input(value);
        }
    }

    onEnterKeyDown(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(text, UiAction.CommitTypeId.Explicit);
        }
    }

    onBlur(text: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
        }
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, false);
    }

    protected override setUiAction(action: LitIvemIdUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: LitIvemIdUiAction.PushEventHandlersInterface = {
            value: (value, edited, selectAll) => this.handleValuePushEvent(value, edited, selectAll)
        };
        this._pushLitivemidEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushLitivemidEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: LitIvemId | undefined, edited: boolean, selectAll: boolean) {
        this.applyValue(value, edited, selectAll);
    }

    private applyValue(value: LitIvemId | undefined, edited: boolean, selectAll: boolean = true) {
        if (!edited) {
            let symbol: string;
            if (value === undefined) {
                symbol = LitIvemIdInputNgComponent.emptySymbol;
            } else {
                symbol = this._symbolsService.litIvemIdToDisplay(value);
            }

            if (symbol !== this.symbol) {
                this.symbol = symbol;
                this.markForCheck();
            }

            if (selectAll) {
//                delay1Tick(() => this.selectAllText() );
            }
        }
    }

    private parseSymbol(value: string): SymbolsService.LitIvemIdParseDetails {
        return this._symbolsService.parseLitIvemId(value);
    }

    private input(text: string) {
        let parseDetails: SymbolsService.LitIvemIdParseDetails;
        const missing = text === '';
        if (!missing) {
            parseDetails = this.parseSymbol(text);
        } else {
            if (this.uiAction.valueRequired) {
                parseDetails = SymbolsService.LitIvemIdParseDetails.createFail(text, Strings[StringId.ValueRequired]);
            } else {
                parseDetails = SymbolsService.LitIvemIdParseDetails.createUndefinedSuccess(text);
            }
        }

        this.uiAction.input(text, parseDetails.success, missing, parseDetails.errorText);

        if (parseDetails.success && this.uiAction.commitOnAnyValidInput) {
            this.commitValue(parseDetails, UiAction.CommitTypeId.Input);
        }
    }

    private commitValue(parseDetails: SymbolsService.LitIvemIdParseDetails, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(parseDetails, typeId);
    }

    private tryCommitText(text: string, typeId: UiAction.CommitType.NotInputId) {
        if (text === '') {
            if (!this.uiAction.valueRequired) {
                const parseDetails = SymbolsService.LitIvemIdParseDetails.createUndefinedSuccess(text);
                this.commitValue(parseDetails, typeId);
            }
        } else {
            const parseDetails = this.parseSymbol(text);
            if (parseDetails.success) {
                this.commitValue(parseDetails, typeId);
            } // else input will show error
        }
    }

    private selectAllText() {
        (this.symbolInput.nativeElement as HTMLInputElement).select();
    }
}

export namespace LitIvemIdInputNgComponent {
    export const emptySymbol = '';
}
