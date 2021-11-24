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
import { IvemId } from 'adi-internal-api';
import { SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { IvemIdUiAction, SymbolsService, UiAction } from 'core-internal-api';
import { StringId, Strings } from 'res-internal-api';
import { MultiEvent } from 'sys-internal-api';
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

    private _symbolsManager: SymbolsService;
    private _pushIvemidEventsSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        _symbolsManagerService: SymbolsNgService
    ) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);
        this._symbolsManager = _symbolsManagerService.symbolsManager;
        this.inputId = 'IvemIdInput' + this.componentInstanceId;
    }

    public override get uiAction() { return super.uiAction as IvemIdUiAction; }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    onInput(value: string): void {
        this.input(value);
    }

    onEnterKeyDown(value: string): void {
        this.tryCommitText(value, UiAction.CommitTypeId.Explicit);
    }

    onBlur(value: string): void {
        this.tryCommitText(value, UiAction.CommitTypeId.Implicit);
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, false);
    }

    protected override setUiAction(action: IvemIdUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: IvemIdUiAction.PushEventHandlersInterface = {
            value: (value, selectAll) => this.handleValuePushEvent(value, selectAll),
        };
        this._pushIvemidEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushIvemidEventsSubscriptionId);
        super.finalise();
    }

    private handleValuePushEvent(value: IvemId | undefined, selectAll: boolean) {
        this.applyValue(value, selectAll);
    }

    private applyValue(value: IvemId | undefined, selectAll: boolean = true) {
        if (!this.uiAction.edited) {
            let symbol: string;
            if (value === undefined) {
                symbol = IvemIdInputNgComponent.emptySymbol;
            } else {
                symbol = this._symbolsManager.ivemIdToDisplay(value);
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
        return this._symbolsManager.parseIvemId(value);
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
