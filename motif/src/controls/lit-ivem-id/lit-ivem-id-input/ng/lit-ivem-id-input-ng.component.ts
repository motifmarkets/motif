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
import { LitIvemId } from 'src/adi/internal-api';
import { SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import { LitIvemIdUiAction, SymbolsService, UiAction } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
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

    private _symbolsManager: SymbolsService;
    private _pushLitivemidEventsSubscriptionId: MultiEvent.SubscriptionId;

    public override get uiAction() { return super.uiAction as LitIvemIdUiAction; }

    constructor(
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        _symbolsManagerService: SymbolsNgService
    ) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this._symbolsManager = _symbolsManagerService.symbolsManager;
        this.inputId = 'LitIvemIdInput' + this.instanceNumber.toString(10);
    }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    onInput(value: string): void {
        this.input(value);
    }

    onEnterKeyDown(text: string): void {
        this.tryCommitText(text, UiAction.CommitTypeId.Explicit);
    }

    onBlur(text: string): void {
        this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, false);
    }

    protected override setUiAction(action: LitIvemIdUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: LitIvemIdUiAction.PushEventHandlersInterface = {
            value: (value, selectAll) => this.handleValuePushEvent(value, selectAll)
        };
        this._pushLitivemidEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushLitivemidEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: LitIvemId | undefined, selectAll: boolean) {
        this.applyValue(value, selectAll);
    }

    private applyValue(value: LitIvemId | undefined, selectAll: boolean = true) {
        if (!this.uiAction.edited) {
            let symbol: string;
            if (value === undefined) {
                symbol = LitIvemIdInputNgComponent.emptySymbol;
            } else {
                symbol = this._symbolsManager.litIvemIdToDisplay(value);
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
        return this._symbolsManager.parseLitIvemId(value);
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
