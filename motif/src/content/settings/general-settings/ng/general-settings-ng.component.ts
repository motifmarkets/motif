/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
    ComponentFactoryResolver, OnDestroy, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { ExchangeInfo, SymbolField, SymbolFieldId } from 'src/adi/internal-api';
import { SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import {
    CaptionedCheckboxNgComponent,
    CaptionedRadioNgComponent,
    CaptionLabelNgComponent,
    CheckboxInputNgComponent,
    EnumArrayInputNgComponent,
    EnumInputNgComponent,
    IntegerTextInputNgComponent,
    TextInputNgComponent
} from 'src/controls/ng-api';
import { ArrayUiAction } from 'src/core/array-ui-action';
import {
    BooleanUiAction,
    EnumArrayUiAction,
    EnumUiAction,
    ExplicitElementsEnumArrayUiAction,
    ExplicitElementsEnumUiAction,
    IntegerUiAction,
    MasterSettings,
    StringUiAction,
    SymbolsService
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { assert, delay1Tick, MultiEvent, SourceTzOffsetDateTime } from 'src/sys/internal-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings-ng.component.html',
    styleUrls: ['./general-settings-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('fontFamilyLabel', { static: true }) private _fontFamilyLabelComponent: CaptionLabelNgComponent;
    @ViewChild('fontFamilyControl', { static: true }) private _fontFamilyControlComponent: TextInputNgComponent;
    @ViewChild('fontSizeLabel', { static: true }) private _fontSizeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('fontSizeControl', { static: true }) private _fontSizeControlComponent: TextInputNgComponent;
    @ViewChild('defaultExchangeLabel', { static: true }) private _defaultExchangeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('defaultExchangeControl', { static: true }) private _defaultExchangeControlComponent: EnumInputNgComponent;
    @ViewChild('dropDownEditableSearchTermLabel', { static: true })
        private _dropDownEditableSearchTermLabelComponent: CaptionLabelNgComponent;
    @ViewChild('dropDownEditableSearchTermControl', { static: true })
        private _dropDownEditableSearchTermControlComponent: CheckboxInputNgComponent;
    @ViewChild('numberGroupingActiveLabel', { static: true }) private _numberGroupingActiveLabelComponent: CaptionLabelNgComponent;
    @ViewChild('numberGroupingActiveControl', { static: true }) private _numberGroupingActiveControlComponent: CheckboxInputNgComponent;
    @ViewChild('minimumPriceFractionDigitsCountLabel', { static: true })
        private _minimumPriceFractionDigitsCountLabelComponent: CaptionLabelNgComponent;
    @ViewChild('minimumPriceFractionDigitsCountControl', { static: true })
        private _minimumPriceFractionDigitsCountControlComponent: IntegerTextInputNgComponent;
    @ViewChild('24HourLabel', { static: true }) private _24HourLabelComponent: CaptionLabelNgComponent;
    @ViewChild('24HourControl', { static: true }) private _24HourControlComponent: CheckboxInputNgComponent;
    @ViewChild('dateTimeTimezoneModeLabel', { static: true }) private _dateTimeTimezoneModeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('sourceDateTimeTimezoneModeControl', { static: true })
        private _sourceDateTimeTimezoneModeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('localDateTimeTimezoneModeControl', { static: true })
        private _localDateTimeTimezoneModeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('utcDateTimeTimezoneModeControl', { static: true })
        private _utcDateTimeTimezoneModeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('settingsProfileLabel', { static: true }) private _settingsProfileLabelComponent: CaptionLabelNgComponent;
    @ViewChild('settingsProfileControl', { static: true }) private _settingsProfileControlComponent: EnumInputNgComponent;

    @ViewChild('exchangeHideModeLabel', { static: true }) private _exchangeHideModeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('exchangeHideModeControl', { static: true }) private _exchangeHideModeControlComponent: EnumInputNgComponent;
    @ViewChild('defaultMarketHiddenLabel', { static: true }) private _defaultMarketHiddenLabelComponent: CaptionLabelNgComponent;
    @ViewChild('defaultMarketHiddenControl', { static: true }) private _defaultMarketHiddenControlComponent: CheckboxInputNgComponent;
    @ViewChild('marketCodeAsLocalWheneverPossibleLabel', { static: true })
        private _marketCodeAsLocalWheneverPossibleLabelComponent: CaptionLabelNgComponent;
    @ViewChild('marketCodeAsLocalWheneverPossibleControl', { static: true })
        private _marketCodeAsLocalWheneverPossibleControlComponent: CheckboxInputNgComponent;
    @ViewChild('symbol_ExplicitSearchFieldsLabel', { static: true })
        private _symbol_ExplicitSearchFieldsLabelComponent: CaptionLabelNgComponent;
    @ViewChild('symbol_ExplicitSearchFieldsEnabledControl', { static: true })
        private _symbol_ExplicitSearchFieldsEnabledControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('symbol_ExplicitSearchFieldsControl', { static: true })
        private _symbol_ExplicitSearchFieldsControlComponent: EnumArrayInputNgComponent;

    public restartRequired = false;
    public restartRequiredText = '';

    private _masterSettings: MasterSettings;
    private _symbolsService: SymbolsService;

    private _fontFamilyUiAction: StringUiAction;
    private _fontSizeUiAction: StringUiAction;
    private _defaultExchangeUiAction: ExplicitElementsEnumUiAction;
    private _exchangeHideModeUiAction: ExplicitElementsEnumUiAction;
    private _defaultMarketHiddenUiAction: BooleanUiAction;
    private _marketCodeAsLocalWheneverPossibleUiAction: BooleanUiAction;
    private _dropDownEditableSearchTermUiAction: BooleanUiAction;
    private _numberGroupingActiveUiAction: BooleanUiAction;
    private _minimumPriceFractionDigitsCountUiAction: IntegerUiAction;
    private _24HourUiAction: BooleanUiAction;
    private _dateTimeTimezoneModeUiAction: ExplicitElementsEnumUiAction;
    private _explicitSymbolSearchFieldsEnabledUiAction: BooleanUiAction;
    private _explicitSymbolSearchFieldsUiAction: ExplicitElementsEnumArrayUiAction;
    private _settingsProfileUiAction: ExplicitElementsEnumUiAction;

    private _allowedExchangeIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService, symbolsNgService: SymbolsNgService) {
        super(cdr, settingsNgService.settingsService);
        this._masterSettings = settingsNgService.settingsService.master;
        this._symbolsService = symbolsNgService.symbolsManager;

        this._allowedExchangeIdsChangedSubscriptionId = this._symbolsService.subscribeAllowedExchangeIdsChangedEvent(
            () => this.handleAllowedExchangeIdsChangedEvent()
        );

        this._fontFamilyUiAction = this.createFontFamilyUiAction();
        this._fontSizeUiAction = this.createFontSizeUiAction();
        this._defaultExchangeUiAction = this.createDefaultExchangeUiAction();
        this._exchangeHideModeUiAction = this.createExchangeHideModeUiAction();
        this._defaultMarketHiddenUiAction = this.createDefaultMarketHiddenUiAction();
        this._marketCodeAsLocalWheneverPossibleUiAction = this.createMarketCodeAsLocalWheneverPossibleUiAction();
        this._dropDownEditableSearchTermUiAction = this.createDropDownEditableSearchTermUiAction();
        this._numberGroupingActiveUiAction = this.createNumberGroupingActiveUiAction();
        this._minimumPriceFractionDigitsCountUiAction = this.createMinimumPriceFractionDigitsCountUiAction();
        this._24HourUiAction = this.create24HourUiAction();
        this._dateTimeTimezoneModeUiAction = this.createDateTimeTimezoneModeUiAction();
        this._explicitSymbolSearchFieldsEnabledUiAction = this.createExplicitSymbolSearchFieldsEnabledUiAction();
        this._explicitSymbolSearchFieldsUiAction = this.createExplicitSymbolSearchFieldsUiAction();
        this._settingsProfileUiAction = this.createSettingsProfileUiAction();

        this.updateAllowedExchangeIds();
        this.processSettingsChanged();
    }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();

        delay1Tick(() => this.markForCheck());
    }

    protected processSettingsChanged() {
        this.pushValues();
    }

    protected override finalise() {
        this._symbolsService.unsubscribeAllowedExchangeIdsChangedEvent(this._allowedExchangeIdsChangedSubscriptionId);

        this._fontFamilyUiAction.finalise();
        this._fontSizeUiAction.finalise();
        this._defaultExchangeUiAction.finalise();
        this._exchangeHideModeUiAction.finalise();
        this._defaultMarketHiddenUiAction.finalise();
        this._marketCodeAsLocalWheneverPossibleUiAction.finalise();
        this._dropDownEditableSearchTermUiAction.finalise();
        this._numberGroupingActiveUiAction.finalise();
        this._minimumPriceFractionDigitsCountUiAction.finalise();
        this._24HourUiAction.finalise();
        this._dateTimeTimezoneModeUiAction.finalise();
        this._explicitSymbolSearchFieldsEnabledUiAction.finalise();
        this._explicitSymbolSearchFieldsUiAction.finalise();
        this._settingsProfileUiAction.finalise();

        super.finalise();
    }

    private handleAllowedExchangeIdsChangedEvent() {
        this.updateAllowedExchangeIds();
    }

    private createFontFamilyUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_FontFamily]);
        action.pushTitle(Strings[StringId.SettingTitle_FontFamily]);
        action.commitEvent = () => {
            this.coreSettings.fontFamily = this._fontFamilyUiAction.definedValue;
        };
        return action;
    }

    private createFontSizeUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_FontSize]);
        action.pushTitle(Strings[StringId.SettingTitle_FontSize]);
        action.commitEvent = () => {
            this.coreSettings.fontSize = this._fontSizeUiAction.definedValue;
        };
        return action;
    }

    private createDefaultExchangeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_DefaultExchange]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_DefaultExchange]);
        action.commitEvent = () => {
            this._symbolsService.defaultExchangeId = this._defaultExchangeUiAction.definedValue;
        };
        return action;
    }

    private createExchangeHideModeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_ExchangeHideMode]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_ExchangeHideMode]);
        const modeIds = SymbolsService.ExchangeHideMode.getAll();
        const elementPropertiesArray = modeIds.map<EnumUiAction.ElementProperties>(
            (modeId) => (
                {
                    element: modeId,
                    caption: SymbolsService.ExchangeHideMode.idToDisplay(modeId),
                    title: SymbolsService.ExchangeHideMode.idToDescription(modeId),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this._symbolsService.pscExchangeHideModeId = this._exchangeHideModeUiAction.definedValue;
        };
        return action;
    }

    private createDefaultMarketHiddenUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_DefaultMarketHidden]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_DefaultMarketHidden]);
        action.commitEvent = () => {
            this._symbolsService.pscDefaultMarketHidden = this._defaultMarketHiddenUiAction.definedValue;
        };
        return action;
    }

    private createMarketCodeAsLocalWheneverPossibleUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_MarketCodeAsLocalWheneverPossible]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_MarketCodeAsLocalWheneverPossible]);
        action.commitEvent = () => {
            this._symbolsService.pscMarketCodeAsLocalWheneverPossible = this._marketCodeAsLocalWheneverPossibleUiAction.definedValue;
        };
        return action;
    }

    private createDropDownEditableSearchTermUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Control_DropDownEditableSearchTerm]);
        action.pushTitle(Strings[StringId.SettingTitle_Control_DropDownEditableSearchTerm]);
        action.commitEvent = () => {
            this.coreSettings.control_DropDownEditableSearchTerm = this._dropDownEditableSearchTermUiAction.definedValue;
        };
        return action;
    }

    private createNumberGroupingActiveUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Format_NumberGroupingActive]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_NumberGroupingActive]);
        action.commitEvent = () => {
            this.coreSettings.format_NumberGroupingActive = this._numberGroupingActiveUiAction.definedValue;
        };
        return action;
    }

    private createMinimumPriceFractionDigitsCountUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Format_MinimumPriceFractionDigitsCount]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_MinimumPriceFractionDigitsCount]);
        action.commitEvent = () => {
            this.coreSettings.format_MinimumPriceFractionDigitsCount = this._minimumPriceFractionDigitsCountUiAction.definedValue;
        };
        return action;
    }

    private create24HourUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Format_24Hour]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_24Hour]);
        action.commitEvent = () => {
            this.coreSettings.format_24Hour = this._24HourUiAction.definedValue;
        };
        return action;
    }

    private createDateTimeTimezoneModeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Format_DateTimeTimezoneModeId]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_DateTimeTimezoneModeId]);
        const modeIds = SourceTzOffsetDateTime.TimezoneMode.allIds;
        const elementPropertiesArray = modeIds.map<EnumUiAction.ElementProperties>(
            (modeId) => (
                {
                    element: modeId,
                    caption: SourceTzOffsetDateTime.TimezoneMode.idToDisplay(modeId),
                    title: SourceTzOffsetDateTime.TimezoneMode.idToDescription(modeId),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this.coreSettings.format_DateTimeTimezoneModeId = this._dateTimeTimezoneModeUiAction.definedValue;
        };
        return action;
    }

    private createExplicitSymbolSearchFieldsEnabledUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_ExplicitSearchFieldsEnabled]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_ExplicitSearchFieldsEnabled]);
        action.commitEvent = () => {
            this.coreSettings.symbol_ExplicitSearchFieldsEnabled = this._explicitSymbolSearchFieldsEnabledUiAction.definedValue;
            this.updateExplicitSearchFieldsUiActionEnabled();
        };
        return action;
    }

    private createExplicitSymbolSearchFieldsUiAction() {
        const action = new ExplicitElementsEnumArrayUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Symbol_ExplicitSearchFields]);
        action.pushTitle(Strings[StringId.SettingTitle_Symbol_ExplicitSearchFields]);

        const allowableSymbolSearchFieldIds = SymbolField.allIds;
        const entryCount = allowableSymbolSearchFieldIds.length;
        const elementPropertiesArray = new Array<ArrayUiAction.ElementProperties<SymbolFieldId>>(entryCount);
        for (let i = 0; i < entryCount; i++) {
            const id = allowableSymbolSearchFieldIds[i];
            elementPropertiesArray[i] = {
                element: id,
                caption: SymbolField.idToDisplay(id),
                title: SymbolField.idToDescription(id),
            };
        }

        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this.coreSettings.symbol_ExplicitSearchFieldIds = this._explicitSymbolSearchFieldsUiAction.definedValue as SymbolFieldId[];
        };
        return action;
    }

    private createSettingsProfileUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Master_SettingsProfile]);
        action.pushTitle(Strings[StringId.SettingTitle_Master_SettingsProfile]);
        const selectorIds: MasterSettings.ApplicationEnvironmentSelector.SelectorId[] = [
            MasterSettings.ApplicationEnvironmentSelector.SelectorId.Default,
            MasterSettings.ApplicationEnvironmentSelector.SelectorId.ExchangeEnvironment,
            MasterSettings.ApplicationEnvironmentSelector.SelectorId.Test,
        ];
        const elementPropertiesArray = selectorIds.map<EnumUiAction.ElementProperties>(
            (selectorId) => (
                {
                    element: selectorId,
                    caption: MasterSettings.ApplicationEnvironmentSelector.idToDisplay(selectorId),
                    title: MasterSettings.ApplicationEnvironmentSelector.idToDescription(selectorId),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this._masterSettings.applicationEnvironmentSelectorId = this._settingsProfileUiAction.definedValue;
        };
        return action;
    }

    private initialiseComponents() {
        this._fontFamilyLabelComponent.initialise(this._fontFamilyUiAction);
        this._fontFamilyControlComponent.initialise(this._fontFamilyUiAction);
        this._fontSizeLabelComponent.initialise(this._fontSizeUiAction);
        this._fontSizeControlComponent.initialise(this._fontSizeUiAction);
        this._defaultExchangeLabelComponent.initialise(this._defaultExchangeUiAction);
        this._defaultExchangeControlComponent.initialise(this._defaultExchangeUiAction);
        this._exchangeHideModeLabelComponent.initialise(this._exchangeHideModeUiAction);
        this._exchangeHideModeControlComponent.initialise(this._exchangeHideModeUiAction);
        this._defaultMarketHiddenLabelComponent.initialise(this._defaultMarketHiddenUiAction);
        this._defaultMarketHiddenControlComponent.initialise(this._defaultMarketHiddenUiAction);
        this._marketCodeAsLocalWheneverPossibleLabelComponent.initialise(this._marketCodeAsLocalWheneverPossibleUiAction);
        this._marketCodeAsLocalWheneverPossibleControlComponent.initialise(this._marketCodeAsLocalWheneverPossibleUiAction);
        this._dropDownEditableSearchTermLabelComponent.initialise(this._dropDownEditableSearchTermUiAction);
        this._dropDownEditableSearchTermControlComponent.initialise(this._dropDownEditableSearchTermUiAction);
        this._numberGroupingActiveLabelComponent.initialise(this._numberGroupingActiveUiAction);
        this._numberGroupingActiveControlComponent.initialise(this._numberGroupingActiveUiAction);
        this._minimumPriceFractionDigitsCountLabelComponent.initialise(this._minimumPriceFractionDigitsCountUiAction);
        this._minimumPriceFractionDigitsCountControlComponent.initialise(this._minimumPriceFractionDigitsCountUiAction);
        this._24HourLabelComponent.initialise(this._24HourUiAction);
        this._24HourControlComponent.initialise(this._24HourUiAction);
        this._dateTimeTimezoneModeLabelComponent.initialise(this._dateTimeTimezoneModeUiAction);
        this._sourceDateTimeTimezoneModeControlComponent.initialiseEnum(this._dateTimeTimezoneModeUiAction,
            SourceTzOffsetDateTime.TimezoneModeId.Source);
        this._localDateTimeTimezoneModeControlComponent.initialiseEnum(this._dateTimeTimezoneModeUiAction,
            SourceTzOffsetDateTime.TimezoneModeId.Local);
        this._utcDateTimeTimezoneModeControlComponent.initialiseEnum(this._dateTimeTimezoneModeUiAction,
            SourceTzOffsetDateTime.TimezoneModeId.Utc);
        this._symbol_ExplicitSearchFieldsLabelComponent.initialise(this._explicitSymbolSearchFieldsUiAction);
        this._symbol_ExplicitSearchFieldsEnabledControlComponent.initialise(this._explicitSymbolSearchFieldsEnabledUiAction);
        this._symbol_ExplicitSearchFieldsControlComponent.initialise(this._explicitSymbolSearchFieldsUiAction);
        this._settingsProfileLabelComponent.initialise(this._settingsProfileUiAction);
        this._settingsProfileControlComponent.initialise(this._settingsProfileUiAction);
    }

    private pushValues() {
        this._fontFamilyUiAction.pushValue(this.coreSettings.fontFamily);
        this._fontSizeUiAction.pushValue(this.coreSettings.fontSize);
        this._defaultExchangeUiAction.pushValue(this._symbolsService.defaultExchangeId);
        this._exchangeHideModeUiAction.pushValue(this._symbolsService.pscExchangeHideModeId);
        this._defaultMarketHiddenUiAction.pushValue(this._symbolsService.pscDefaultMarketHidden);
        this._marketCodeAsLocalWheneverPossibleUiAction.pushValue(this._symbolsService.pscMarketCodeAsLocalWheneverPossible);
        this._dropDownEditableSearchTermUiAction.pushValue(this.coreSettings.control_DropDownEditableSearchTerm);
        this._numberGroupingActiveUiAction.pushValue(this.coreSettings.format_NumberGroupingActive);
        this._minimumPriceFractionDigitsCountUiAction.pushValue(this.coreSettings.format_MinimumPriceFractionDigitsCount);
        this._24HourUiAction.pushValue(this.coreSettings.format_24Hour);
        this._dateTimeTimezoneModeUiAction.pushValue(this.coreSettings.format_DateTimeTimezoneModeId);
        this._explicitSymbolSearchFieldsEnabledUiAction.pushValue(this.coreSettings.symbol_ExplicitSearchFieldsEnabled);
        this._explicitSymbolSearchFieldsUiAction.pushValue(this.coreSettings.symbol_ExplicitSearchFieldIds);
        this.updateExplicitSearchFieldsUiActionEnabled();
        this._settingsProfileUiAction.pushValue(this._masterSettings.applicationEnvironmentSelectorId);

        if (this.settingsService.restartRequired !== this.restartRequired) {
            this.restartRequired = this.settingsService.restartRequired;
            this.markForCheck();
        }
    }

    private updateAllowedExchangeIds() {
        const exchangeIds = this._symbolsService.allowedExchangeIds;
        const elementPropertiesArray = exchangeIds.map<EnumUiAction.ElementProperties>(
            (exchangeId) => (
                {
                    element: exchangeId,
                    caption: ExchangeInfo.idToAbbreviatedDisplay(exchangeId),
                    title: ExchangeInfo.idToFullDisplay(exchangeId),
                }
            )
        );
        this._defaultExchangeUiAction.pushElements(elementPropertiesArray, undefined);
    }

    private updateExplicitSearchFieldsUiActionEnabled() {
        const enabled = this._explicitSymbolSearchFieldsEnabledUiAction.definedValue;
        if (enabled) {
            this._explicitSymbolSearchFieldsUiAction.pushAccepted();
        } else {
            this._explicitSymbolSearchFieldsUiAction.pushDisabled();
        }
    }
}

export namespace GeneralSettingsNgComponent {

    export function create(
        container: ViewContainerRef,
        resolver: ComponentFactoryResolver,
    ) {
        container.clear();
        const factory = resolver.resolveComponentFactory(GeneralSettingsNgComponent);
        const componentRef = container.createComponent(factory);
        assert(componentRef.instance instanceof GeneralSettingsNgComponent, 'ASCC2288532');
        return componentRef.instance as GeneralSettingsNgComponent;
    }
}
