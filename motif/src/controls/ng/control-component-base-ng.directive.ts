/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive, HostBinding, Input, OnDestroy } from '@angular/core';
import { ComponentBaseNgDirective } from 'src/component-services/ng-api';
import { ColorScheme, ColorSettings, CoreSettings, SettingsService, UiAction } from 'src/core/internal-api';
import { delay1Tick, HtmlTypes, MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';

@Directive()
export abstract class ControlComponentBaseNgDirective extends ComponentBaseNgDirective implements OnDestroy {
    @HostBinding('style.display') displayPropertyNoneOverride = ''; // no override

    // Assumes that the component has DOM display attribute !== 'none'
    @Input()
    get displayed() { return this.displayPropertyNoneOverride === ''; }
    set displayed(value: boolean) {
        if (value) {
            if (!this.displayed) {
                this.displayPropertyNoneOverride = '';
                this.markForCheck();
            }
        } else {
            if (this.displayed) {
                this.displayPropertyNoneOverride = HtmlTypes.Display.None;
                this.markForCheck();
            }
        }
    }

    initialiseReady = false;
    initialiseReadyEventer: ControlComponentBaseNgDirective.InitialiseReadyEventHandler;

    public disabled = true;
    public readonly = true;
    public waiting = true;
    public caption = '';
    public title = '';
    public dropDownEditableSearchTerm = false;
    public placeholderText = '';
    public bkgdColor: ColorScheme.ResolvedColor;
    public foreColor: ColorScheme.ResolvedColor;

    private _uiAction: UiAction;
    private _pushEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _coreSettings: CoreSettings;
    private _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _stateId: UiAction.StateId;

    private _readonlyAlways = false;

    protected get uiAction() { return this._uiAction; }
    protected get stateId() { return this._stateId; }
    protected get coreSettings() { return this._coreSettings; }
    protected get colorSettings() { return this._colorSettings; }

    get readonlyAlways() { return this._readonlyAlways; }
    set readonlyAlways(value: boolean) {
        this._readonlyAlways = value;
        this.applyStateId(this.stateId);
    }

    constructor(private _cdr: ChangeDetectorRef,
        private _settingsService: SettingsService,
        private _stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray
    ) {
        super();
        this._coreSettings = this._settingsService.core;
        this._colorSettings = this._settingsService.color;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    ngOnDestroy() {
        this.finalise();
    }

    setInitialiseReady() {
        this.initialiseReady = true;
        if (this.initialiseReadyEventer !== undefined) {
            this.initialiseReadyEventer();
        }
    }

    initialise(action: UiAction) {
        this.setUiAction(action);
        this.pushSettings();

        delay1Tick(() => this.markForCheck());
    }

    protected finalise() {
        this._uiAction.unsubscribePushEvents(this._pushEventsSubscriptionId);
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this._settingsChangedSubscriptionId = undefined;
    }

    protected applyStateId(newStateId: UiAction.StateId) {
        this._stateId = newStateId;

        this.setStateColors(newStateId);

        switch (newStateId) {
            case UiAction.StateId.Disabled:
                this.disabled = true;
                this.readonly = this._readonlyAlways;
                this.waiting = false;
                break;
            case UiAction.StateId.Readonly:
                this.disabled = false;
                this.readonly = true;
                this.waiting = false;
                break;
            case UiAction.StateId.Waiting:
                this.disabled = false;
                this.readonly = this._readonlyAlways;
                this.waiting = true;
                break;
            case UiAction.StateId.Missing:
            case UiAction.StateId.Invalid:
            case UiAction.StateId.Valid:
            case UiAction.StateId.Accepted:
            case UiAction.StateId.Warning:
            case UiAction.StateId.Error:
                this.disabled = false;
                this.readonly = this._readonlyAlways;
                this.waiting = false;
                break;
            default:
                throw new UnreachableCaseError('UACBASI66676', newStateId);
        }

        this.markForCheck();
    }

    protected applyCaption(caption: string) {
        this.caption = caption;
        this.markForCheck();
    }

    protected applyPlaceholder(text: string) {
        this.placeholderText = text;
        this.markForCheck();
    }

    protected applyTitle(title: string) {
        this.title = title;
        this.markForCheck();
    }

    protected applySettingColors() {
        this.setStateColors(this.uiAction.stateId);
        this.markForCheck();
    }

    protected getBkgdColorCssVariableName(itemId: ColorScheme.ItemId) {
        return ColorScheme.Item.idToBkgdCssVariableName(itemId);
    }

    protected getForeColorCssVariableName(itemId: ColorScheme.ItemId) {
        return ColorScheme.Item.idToForeCssVariableName(itemId);
    }

    protected getBkgdColor(itemId: ColorScheme.ItemId) {
        return this.colorSettings.getBkgd(itemId);
    }

    protected getForeColor(itemId: ColorScheme.ItemId) {
        return this.colorSettings.getFore(itemId);
    }

    protected getDisabledBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Disabled);
    }
    protected getDisabledForeColor() {
        return this.getStateForeColor(UiAction.StateId.Disabled);
    }

    protected getReadOnlyBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Readonly);
    }
    protected getReadOnlyForeColor() {
        return this.getStateForeColor(UiAction.StateId.Readonly);
    }

    protected getMissingBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Missing);
    }
    protected getMissingForeColor() {
        return this.getStateForeColor(UiAction.StateId.Missing);
    }

    protected getInvalidBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Invalid);
    }
    protected getInvalidForeColor() {
        return this.getStateForeColor(UiAction.StateId.Invalid);
    }

    protected getAcceptedBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Accepted);
    }
    protected getAcceptedForeColor() {
        return this.getStateForeColor(UiAction.StateId.Accepted);
    }

    protected getValidBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Valid);
    }
    protected getValidForeColor() {
        return this.getStateForeColor(UiAction.StateId.Valid);
    }

    protected getWaitingBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Waiting);
    }
    protected getWaitingForeColor() {
        return this.getStateForeColor(UiAction.StateId.Waiting);
    }

    protected getWarningBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Warning);
    }
    protected getWarningForeColor() {
        return this.getStateForeColor(UiAction.StateId.Warning);
    }

    protected getErrorBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Error);
    }
    protected getErrorForeColor() {
        return this.getStateForeColor(UiAction.StateId.Error);
    }

    protected getStateBkgdColor(stateId: UiAction.StateId) {
        const itemId = this.getStateColorItemId(stateId);
        return this.colorSettings.getBkgd(itemId);
    }

    protected getStateForeColor(stateId: UiAction.StateId) {
        const itemId = this.getStateColorItemId(stateId);
        return this.colorSettings.getFore(itemId);
    }

    protected pushSettings() {
        const dropDownEditableSearchTerm = this._coreSettings.control_DropDownEditableSearchTerm;
        if (dropDownEditableSearchTerm !== this.dropDownEditableSearchTerm) {
            this.dropDownEditableSearchTerm = dropDownEditableSearchTerm;
            this.markForCheck();
        }
        this.applySettingColors();
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    protected setUiAction(action: UiAction) {

        this._uiAction = action;

        const pushEventHandlersInterface: UiAction.PushEventHandlersInterface = {
            stateChange: (oldState, newState) => this.handleStateChangePushEvent(oldState, newState),
            placeholder: (text) => this.handlePlaceholderPushEvent(text),
            title: (title) => this.handleTitlePushEvent(title),
            caption: (caption) => this.handleCaptionPushEvent(caption),
            requiredChange: () => this.handleRequiredChangePushEvent(),
        };
        this._pushEventsSubscriptionId = this._uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyStateId(action.stateId);
        this.applyPlaceholder(action.placeholder);
        this.applyTitle(action.title);
        this.applyCaption(action.caption);
    }

    protected setStateColors(stateId: UiAction.StateId) {
        this.bkgdColor = this.getStateBkgdColor(stateId);
        this.foreColor = this.getStateForeColor(stateId);
    }

    private getStateColorItemId(stateId: UiAction.StateId) {
        return this._stateColorItemIdArray[stateId];
    }

    private handleSettingsChangedEvent() {
        this.pushSettings();
    }

    private handleStateChangePushEvent(oldState: UiAction.StateId, newState: UiAction.StateId) {
        if (newState !== this.stateId) {
            this.applyStateId(newState);
        }
    }

    private handlePlaceholderPushEvent(text: string) {
        if (text !== this.placeholderText) {
            this.applyPlaceholder(text);
        }
    }

    private handleTitlePushEvent(title: string) {
        if (title !== this.title) {
            this.applyTitle(title);
        }
    }

    private handleCaptionPushEvent(caption: string) {
        if (caption !== this.caption) {
            this.applyCaption(caption);
        }
    }

    private handleRequiredChangePushEvent() {

    }
}

export namespace ControlComponentBaseNgDirective {
    export type StateColorItemIdArray = ColorScheme.ItemId[];

    export const textControlStateColorItemIdArray: StateColorItemIdArray = [
        ColorScheme.ItemId.TextControl_Disabled,
        ColorScheme.ItemId.TextControl_ReadOnly,
        ColorScheme.ItemId.TextControl_Missing,
        ColorScheme.ItemId.TextControl_Invalid,
        ColorScheme.ItemId.TextControl_Valid,
        ColorScheme.ItemId.TextControl_Accepted,
        ColorScheme.ItemId.TextControl_Waiting,
        ColorScheme.ItemId.TextControl_Warning,
        ColorScheme.ItemId.TextControl_Error,
    ];

    export const clickControlStateColorItemIdArray: StateColorItemIdArray = [
        ColorScheme.ItemId.ClickControl_Disabled,
        ColorScheme.ItemId.ClickControl_ReadOnly,
        ColorScheme.ItemId.ClickControl_Missing,
        ColorScheme.ItemId.ClickControl_Invalid,
        ColorScheme.ItemId.ClickControl_Valid,
        ColorScheme.ItemId.ClickControl_Accepted,
        ColorScheme.ItemId.ClickControl_Waiting,
        ColorScheme.ItemId.ClickControl_Warning,
        ColorScheme.ItemId.ClickControl_Error,
    ];

    export const labelStateColorItemIdArray: StateColorItemIdArray = [
        ColorScheme.ItemId.Label_Disabled,
        ColorScheme.ItemId.Label_ReadOnly,
        ColorScheme.ItemId.Label_Missing,
        ColorScheme.ItemId.Label_Invalid,
        ColorScheme.ItemId.Label_Valid,
        ColorScheme.ItemId.Label_Accepted,
        ColorScheme.ItemId.Label_Waiting,
        ColorScheme.ItemId.Label_Warning,
        ColorScheme.ItemId.Label_Error,
    ];

    export type InitialiseReadyEventHandler = (this: void) => void;
}
