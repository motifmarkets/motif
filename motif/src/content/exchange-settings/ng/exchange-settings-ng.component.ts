import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ExchangeId, ExchangeInfo, SearchSymbolsDataDefinition } from 'src/adi/internal-api';
import { SettingsNgService } from 'src/component-services/ng-api';
import { CaptionLabelNgComponent, EnumArrayInputNgComponent, EnumInputNgComponent } from 'src/controls/ng-api';
import { EnumArrayUiAction, EnumUiAction, ExchangeSettings, ExplicitElementsEnumArrayUiAction, ExplicitElementsEnumUiAction, SettingsService, StringUiAction } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { delay1Tick } from 'src/sys/internal-api';
import { MultiEvent } from 'src/sys/multi-event';

@Component({
    selector: 'app-exchange-settings',
    templateUrl: './exchange-settings-ng.component.html',
    styleUrls: ['./exchange-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangeSettingsNgComponent implements OnInit, OnDestroy {
    @Input() exchangeId: ExchangeId;

    @ViewChild('exchangeLabel', { static: true }) private _exchangeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('symbolNameFieldControl', { static: true }) private _symbolNameFieldControlComponent: EnumInputNgComponent;
    @ViewChild('symbolSearchFieldsControl', { static: true }) private _symbolSearchFieldsControlComponent: EnumArrayInputNgComponent;

    private _settingsService: SettingsService;
    private _settingsChangedSubsciptionId: MultiEvent.SubscriptionId;
    private _exchange: ExchangeSettings;

    private _exchangeUiAction: StringUiAction;
    private _symbolNameFieldUiAction: ExplicitElementsEnumUiAction;
    private _symbolSearchFieldsUiAction: ExplicitElementsEnumArrayUiAction;

    constructor(
        settingsNgService: SettingsNgService,
    ) {
        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubsciptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        this._symbolNameFieldUiAction = this.createSymbolNameFieldUiAction();
        this._symbolSearchFieldsUiAction = this.createSymbolSearchFieldsUiAction();
    }

    ngOnInit(): void {
        this._exchange = this._settingsService.exchanges.exchanges[this.exchangeId];
        this.pushValues();
        delay1Tick(() => this.initailise());
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
        action.pushCaption(Strings[StringId.SettingCaption_Format_DateTimeTimezoneModeId]);
        action.pushTitle(Strings[StringId.SettingTitle_Format_DateTimeTimezoneModeId]);
        const fieldIds = ExchangeSettings.AllowableSymbolNameFieldIds;
        const elementPropertiesArray = fieldIds.map<EnumUiAction.ElementProperties>(
            (fieldId) => (
                {
                    element: fieldId,
                    caption: SearchSymbolsDataDefinition.Field.idToDisplay(fieldId),
                    title: SearchSymbolsDataDefinition.Field.idToDescription(fieldId),
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
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Fields]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Fields]);

        const allowableSymbolSearchFieldIds = ExchangeSettings.AllowableSymbolSearchFieldIds
        const entryCount = allowableSymbolSearchFieldIds.length;
        const elementPropertiesArray = new Array<EnumArrayUiAction.ElementProperties>(entryCount);
        for (let i = 0; i < entryCount; i++) {
            const id = allowableSymbolSearchFieldIds[i];
            elementPropertiesArray[i] = {
                element: id,
                caption: SearchSymbolsDataDefinition.Field.idToDisplay(id),
                title: SearchSymbolsDataDefinition.Field.idToDescription(id),
            };
        }

        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this._exchange.symbolSearchFieldIds = this._symbolSearchFieldsUiAction.definedValue as SearchSymbolsDataDefinition.FieldId[];
        };
        return action;
    }

    private initailise() {
        this._exchangeUiAction.pushValue(ExchangeInfo.idToFullDisplay(this._exchange.exchangeId));

        this._exchangeLabelComponent.initialise(this._exchangeUiAction);
        this._symbolNameFieldControlComponent.initialise(this._symbolNameFieldUiAction);
        this._symbolSearchFieldsControlComponent.initialise(this._symbolSearchFieldsUiAction);
    }

    private finalise() {
        this._exchangeUiAction.finalise();
        this._symbolNameFieldUiAction.finalise();
        this._symbolSearchFieldsUiAction.finalise();
    }

    private pushValues() {
        this._symbolNameFieldUiAction.pushValue(this._exchange.symbolNameFieldId);
        this._symbolSearchFieldsUiAction.pushValue(this._exchange.symbolSearchFieldIds);
    }
}

