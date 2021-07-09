/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import { RoutedIvemId } from 'src/adi/internal-api';
import { SymbolsNgService } from 'src/component-services/ng-api';
import { RoutedIvemIdUiAction, SettingsService, SymbolsService, UiAction } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class RoutedIvemIdComponentBaseNgDirective extends ControlComponentBaseNgDirective {
    public symbol = RoutedIvemIdComponentBaseNgDirective.emptySymbol;

    private _symbolsManager: SymbolsService;
    private _pushRoutedIvemIdEventsSubscriptionId: MultiEvent.SubscriptionId;

    protected get symbolsService() { return this._symbolsManager; }
    public override get uiAction() { return super.uiAction as RoutedIvemIdUiAction; }

    constructor(
        cdr: ChangeDetectorRef,
        settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray,
        _symbolsManagerService: SymbolsNgService
    ) {
        super(cdr, settingsService, stateColorItemIdArray);
        this._symbolsManager = _symbolsManagerService.symbolsManager;
    }

    get symbolsManager() { return this._symbolsManager; }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValue(this.uiAction.value, false);
    }

    protected applyValue(value: RoutedIvemId | undefined, selectAll: boolean) {
        let symbol: string;
        if (value === undefined) {
            symbol = RoutedIvemIdComponentBaseNgDirective.emptySymbol;
        } else {
            symbol = this._symbolsManager.routedIvemIdToDisplay(value);
        }

        if (symbol !== this.symbol) {
            this.symbol = symbol;
            this.markForCheck();
        }
    }

    protected input(text: string) {
        let parseDetails: SymbolsService.RoutedIvemIdParseDetails;
        const missing = text === '';
        if (!missing) {
            parseDetails = this.parseSymbol(text);
        } else {
            if (this.uiAction.valueRequired) {
                parseDetails = SymbolsService.RoutedIvemIdParseDetails.createFail(text, Strings[StringId.ValueRequired]);
            } else {
                parseDetails = SymbolsService.RoutedIvemIdParseDetails.createUndefinedSuccess();
            }
        }

        this.uiAction.input(text, parseDetails.success, missing, parseDetails.errorText);

        if (parseDetails.success && this.uiAction.commitOnAnyValidInput) {
            this.commitValue(parseDetails, UiAction.CommitTypeId.Input);
        }
    }

    protected commitValue(parseDetails: SymbolsService.RoutedIvemIdParseDetails, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(parseDetails, typeId);
    }

    protected tryCommitText(value: string, typeId: UiAction.CommitType.NotInputId) {
        if (value === '') {
            if (!this.uiAction.valueRequired) {
                const parseDetails = SymbolsService.RoutedIvemIdParseDetails.createUndefinedSuccess();
                this.commitValue(parseDetails, typeId);
            }
        } else {
            const parseDetails = this.parseSymbol(value);
            if (parseDetails.success) {
                this.commitValue(parseDetails, typeId);
            } // else input will show error
        }
    }

    protected override setUiAction(action: RoutedIvemIdUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: RoutedIvemIdUiAction.PushEventHandlersInterface = {
            value: (value, selectAll) => this.handleValuePushEvent(value, selectAll)
        };
        this._pushRoutedIvemIdEventsSubscriptionId = this.uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyValue(action.value, false);
    }

    protected override finalise() {
        this.uiAction.unsubscribePushEvents(this._pushRoutedIvemIdEventsSubscriptionId);
        super.finalise();
    }

    private parseSymbol(value: string): SymbolsService.RoutedIvemIdParseDetails {
        return this._symbolsManager.parseRoutedIvemId(value);
    }

    private handleValuePushEvent(value: RoutedIvemId | undefined, selectAll: boolean) {
        this.applyValue(value, selectAll);
    }
}

export namespace RoutedIvemIdComponentBaseNgDirective {
    export const emptySymbol = '';
}
