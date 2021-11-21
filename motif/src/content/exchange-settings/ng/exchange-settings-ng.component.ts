import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ExchangeId, ExchangeInfo, SymbolField, SymbolFieldId } from 'src/adi/internal-api';
import { SettingsNgService } from 'src/component-services/ng-api';
import { CaptionLabelNgComponent, EnumArrayInputNgComponent, EnumInputNgComponent } from 'src/controls/ng-api';
import { ArrayUiAction } from 'src/core/array-ui-action';
import {
    EnumUiAction,
    ExchangeSettings,
    ExplicitElementsEnumArrayUiAction,
    ExplicitElementsEnumUiAction,
    SettingsService
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { delay1Tick } from 'src/sys/internal-api';
import { MultiEvent } from 'src/sys/multi-event';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-exchange-settings',
    templateUrl: './exchange-settings-ng.component.html',
    styleUrls: ['./exchange-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangeSettingsNgComponent extends ContentComponentBaseNgDirective implements OnInit, OnDestroy {
    @Input() exchangeId: ExchangeId;

    @ViewChild('symbolNameFieldLabel', { static: true }) private _symbolNameFieldLabelComponent: CaptionLabelNgComponent;
    @ViewChild('symbolNameFieldControl', { static: true }) private _symbolNameFieldControlComponent: EnumInputNgComponent;
    @ViewChild('symbolSearchFieldsLabel', { static: true }) private _symbolSearchFieldsLabelComponent: CaptionLabelNgComponent;
    @ViewChild('symbolSearchFieldsControl', { static: true }) private _symbolSearchFieldsControlComponent: EnumArrayInputNgComponent;

    public abbreviatedExchangeDisplay: string;
    public fullExchangeDisplay: string;

    private _settingsService: SettingsService;
    private _settingsChangedSubsciptionId: MultiEvent.SubscriptionId;
    private _exchange: ExchangeSettings;

    private _symbolNameFieldUiAction: ExplicitElementsEnumUiAction;
    private _symbolSearchFieldsUiAction: ExplicitElementsEnumArrayUiAction;

    constructor(settingsNgService: SettingsNgService) {
        super();

        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubsciptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    ngOnInit(): void {
        this._exchange = this._settingsService.exchanges.exchanges[this.exchangeId];

        this._symbolNameFieldUiAction = this.createSymbolNameFieldUiAction();
        this._symbolSearchFieldsUiAction = this.createSymbolSearchFieldsUiAction();

        this.pushValues();

        this.abbreviatedExchangeDisplay = ExchangeInfo.idToAbbreviatedDisplay(this.exchangeId);
        this.fullExchangeDisplay = ExchangeInfo.idToFullDisplay(this.exchangeId);

        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubsciptionId);
        this.finalise();
    }

    private handleSettingsChangedEvent() {
        this.pushValues();
    }

    private createSymbolNameFieldUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_Exchange_SymbolNameField]);
        action.pushTitle(Strings[StringId.SettingTitle_Exchange_SymbolNameField]);
        const fieldIds = ExchangeInfo.idToAllowableSymbolNameFieldIds(this.exchangeId);
        const elementPropertiesArray = fieldIds.map<EnumUiAction.ElementProperties>(
            (fieldId) => (
                {
                    element: fieldId,
                    caption: SymbolField.idToDisplay(fieldId),
                    title: SymbolField.idToDescription(fieldId),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this._exchange.symbolNameFieldId = this._symbolNameFieldUiAction.definedValue;
        };
        return action;
    }

    private createSymbolSearchFieldsUiAction() {
        const action = new ExplicitElementsEnumArrayUiAction();
        action.pushTitle(Strings[StringId.SettingTitle_Exchange_SymbolSearchFields]);
        action.pushCaption(Strings[StringId.SettingCaption_Exchange_SymbolSearchFields]);

        const allowableSymbolSearchFieldIds = ExchangeInfo.idToAllowableSymbolSearchFieldIds(this.exchangeId);
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
            this._exchange.symbolSearchFieldIds = this._symbolSearchFieldsUiAction.definedValue as SymbolFieldId[];
        };
        return action;
    }

    private initialise() {
        this._symbolNameFieldLabelComponent.initialise(this._symbolNameFieldUiAction);
        this._symbolNameFieldControlComponent.initialise(this._symbolNameFieldUiAction);
        this._symbolSearchFieldsLabelComponent.initialise(this._symbolSearchFieldsUiAction);
        this._symbolSearchFieldsControlComponent.initialise(this._symbolSearchFieldsUiAction);
    }

    private finalise() {
        this._symbolNameFieldUiAction.finalise();
        this._symbolSearchFieldsUiAction.finalise();
    }

    private pushValues() {
        this._symbolNameFieldUiAction.pushValue(this._exchange.symbolNameFieldId);
        this._symbolSearchFieldsUiAction.pushValue(this._exchange.symbolSearchFieldIds);
    }
}

