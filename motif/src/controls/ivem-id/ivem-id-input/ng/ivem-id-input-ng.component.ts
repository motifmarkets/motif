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
import { IvemId, IvemIdUiAction, MultiEvent, StringId, Strings, SymbolsService, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';

@Component({
    selector: 'app-ivem-id-input',
    templateUrl: './ivem-id-input-ng.component.html',
    styleUrls: ['./ivem-id-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IvemIdInputNgComponent extends ControlComponentBaseNgDirective {
    @Input() inputId: string;

    @ViewChild('ivemidInput') private ivemidInput: ElementRef;

    public symbol = IvemIdInputNgComponent.emptySymbol;

    private _symbolsService: SymbolsService;
    private _pushIvemidEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService
    ) {
        super(cdr, settingsNgService.service, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this._symbolsService = symbolsNgService.service;
        this.inputId = 'IvemIdInput' + this.componentInstanceId;
    }

    public override get uiAction() { return super.uiAction as IvemIdUiAction; }

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

    onEnterKeyDown(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(value, UiAction.CommitTypeId.Explicit);
        }
    }

    onBlur(value: string): void {
        if (this.uiAction.stateId !== UiAction.StateId.Readonly) {
            this.tryCommitText(value, UiAction.CommitTypeId.Implicit);
        }
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, false);
    }

    protected override setUiAction(action: IvemIdUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: IvemIdUiAction.PushEventHandlersInterface = {
            value: (value, edited, selectAll) => this.handleValuePushEvent(value, edited, selectAll),
        };
        this._pushIvemidEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, action.edited);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushIvemidEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: IvemId | undefined, edited: boolean, selectAll: boolean) {
        this.applyValue(value, edited, selectAll);
    }

    private applyValue(value: IvemId | undefined, edited: boolean, selectAll = true) {
        if (!edited) {
            let symbol: string;
            if (value === undefined) {
                symbol = IvemIdInputNgComponent.emptySymbol;
            } else {
                symbol = this._symbolsService.ivemIdToDisplay(value);
            }

            if (symbol !== this.symbol) {
                this.symbol = symbol;
                this.markForCheck();
            }

            if (selectAll) {
                // delay1Tick(() => this.selectAllText() );
            }
        }
    }

    private parseSymbol(value: string): SymbolsService.IvemIdParseDetails {
        return this._symbolsService.parseIvemId(value);
    }

    private input(text: string) {
        let parseDetails: SymbolsService.IvemIdParseDetails;
        const missing = text === '';
        if (!missing) {
            parseDetails = this.parseSymbol(text);
        } else {
            if (this.uiAction.valueRequired) {
                parseDetails = SymbolsService.IvemIdParseDetails.createFail(text, Strings[StringId.ValueRequired]);
            } else {
                parseDetails = SymbolsService.IvemIdParseDetails.createUndefinedSuccess();
            }
        }

        this.uiAction.input(text, parseDetails.success, missing, parseDetails.errorText);

        if (parseDetails.success && this.uiAction.commitOnAnyValidInput) {
            this.commitValue(parseDetails, UiAction.CommitTypeId.Input);
        }
    }

    private commitValue(parseDetails: SymbolsService.IvemIdParseDetails, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(parseDetails, typeId);
    }

    private tryCommitText(text: string, typeId: UiAction.CommitType.NotInputId) {
        if (text === '') {
            if (!this.uiAction.valueRequired) {
                const parseDetails = SymbolsService.IvemIdParseDetails.createUndefinedSuccess();
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
        (this.ivemidInput.nativeElement as HTMLInputElement).select();
    }
}

export namespace IvemIdInputNgComponent {
    export const emptySymbol = '';
}
