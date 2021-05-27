/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/* eslint-disable brace-style */
import { OrderTypeId, TimeInForceId } from 'src/adi/internal-api';
import { Integer, SourceTzOffsetDateTime, SysTick } from 'src/sys/internal-api';
import { TypedKeyValueSettingsGroup } from './typed-key-value-settings-group';

export class CoreSettings extends TypedKeyValueSettingsGroup {
    private _symbol_DefaultParseModeAuto = CoreSettings.Default.symbol_DefaultParseModeAuto;
    private _symbol_ExplicitDefaultParseModeId = CoreSettings.Default.symbol_ExplicitDefaultParseModeId;
    private _symbol_PromptDefaultExchangeIfRicParseModeId = CoreSettings.Default.symbol_PromptDefaultExchangeIfRicParseModeId;
    private _symbol_DefaultExchangeId = CoreSettings.Default.symbol_DefaultExchangeId;
    private _symbol_RicAnnouncerChar = CoreSettings.Default.symbol_RicAnnouncerChar;
    private _symbol_PscAnnouncerChar = CoreSettings.Default.symbol_PscAnnouncerChar;
    private _symbol_PscExchangeAnnouncerChar = CoreSettings.Default.symbol_PscExchangeAnnouncerChar;
    private _symbol_PscMarketAnnouncerChar = CoreSettings.Default.symbol_PscMarketAnnouncerChar;
    private _symbol_PscExchangeHideModeId = CoreSettings.Default.symbol_PscExchangeHideModeId;
    private _symbol_PscDefaultMarketHidden = CoreSettings.Default.symbol_PscDefaultMarketHidden;
    private _symbol_PscMarketCodeAsLocalWheneverPossible = CoreSettings.Default.symbol_PscMarketCodeAsLocalWheneverPossible;
    private _symbol_AutoSelectDefaultMarketDest = CoreSettings.Default.symbol_AutoSelectDefaultMarketDest;

    private _grid_HorizontalLinesVisible = CoreSettings.Default.grid_HorizontalLinesVisible;
    private _grid_VerticalLinesVisible = CoreSettings.Default.grid_VerticalLinesVisible;
    private _grid_HorizontalLineWeight = CoreSettings.Default.grid_HorizontalLineWeight;
    private _grid_VerticalLineWeight = CoreSettings.Default.grid_VerticalLineWeight;
    private _grid_RowHeightFixed = CoreSettings.Default.grid_RowHeightFixed;
    private _grid_CellPadding = CoreSettings.Default.grid_CellPadding;
    private _grid_AddHighlightDuration = CoreSettings.Default.grid_AddHighlightDuration;
    private _grid_UpdateHighlightDuration = CoreSettings.Default.grid_UpdateHighlightDuration;
    private _grid_Font = CoreSettings.Default.grid_Font;
    private _grid_FocusedColumnHeaderFont = CoreSettings.Default.grid_FocusedColumnHeaderFont;
    private _grid_ColumnHeaderFont = CoreSettings.Default.grid_ColumnHeaderFont;
    private _grid_FocusedFont = CoreSettings.Default.grid_FocusedFont;
    private _grid_FocusedRowColored = CoreSettings.Default.grid_FocusedRowColored;
    private _grid_FocusedRowBordered = CoreSettings.Default.grid_FocusedRowBordered;
    private _grid_FocusedRowBorderWidth = CoreSettings.Default.grid_FocusedRowBorderWidth;
    private _grid_HorizontalScrollbarWidth = CoreSettings.Default.grid_HorizontalScrollbarWidth;
    private _grid_VerticalScrollbarWidth = CoreSettings.Default.grid_VerticalScrollbarWidth;
    private _grid_VerticalScrollbarLeftPos = CoreSettings.Default.grid_VerticalScrollbarLeftPos;
    private _grid_ScrollbarsOverlayAllowed = CoreSettings.Default.grid_ScrollbarsOverlayAllowed;
    private _grid_ScrollbarMargin = CoreSettings.Default.grid_ScrollbarMargin;

    private _data_InitialTradesHistoryCount = CoreSettings.Default.data_InitialTradesHistoryCount;
    private _format_NumberGroupingActive = CoreSettings.Default.format_NumberGroupingActive;
    private _format_MinimumPriceFractionDigitsCount = CoreSettings.Default.format_MinimumPriceFractionDigitsCount;
    private _format_24Hour = CoreSettings.Default.format_24Hour;
    private _format_DateTimeTimezoneModeId = CoreSettings.Default.format_DateTimeTimezoneModeId;

    private _orderPad_ReviewEnabled = CoreSettings.Default.orderPad_ReviewEnabled;
    private _orderPad_DefaultOrderTypeId = CoreSettings.Default.orderPad_DefaultOrderTypeId;
    private _orderPad_DefaultTimeInForceId = CoreSettings.Default.orderPad_DefaultTimeInForceId;

    private _fontFamily = CoreSettings.Default.fontFamily;
    private _fontSize = CoreSettings.Default.fontSize;
    private _instrumentMovementColorSet = CoreSettings.Default.instrumentMovementColorSet;

    private _infosObject: CoreSettings.InfosObject = {
        Symbol_DefaultParseModeAuto: { id: CoreSettings.Id.Symbol_DefaultParseModeAuto,
            name: 'symbol_DefaultParseModeAuto',
            defaulter: () => this.formatBoolean(CoreSettings.Default.symbol_DefaultParseModeAuto),
            getter: () => this.formatBoolean(this._symbol_DefaultParseModeAuto),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._symbol_DefaultParseModeAuto = this.parseBoolean(value); }
        },
        Symbol_ExplicitDefaultParseModeId: { id: CoreSettings.Id.Symbol_ExplicitDefaultParseModeId,
            name: 'symbol_ExplicitDefaultParseModeId',
            defaulter: () => this.formatEnumString(CoreSettings.Default.symbol_ExplicitDefaultParseModeId),
            getter: () => this.formatEnumString(this._symbol_ExplicitDefaultParseModeId),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._symbol_ExplicitDefaultParseModeId = this.parseEnumString(value);
            }
        },
        Symbol_PromptDefaultExchangeIfRicParseModeId: { id: CoreSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId,
            name: 'symbol_PromptDefaultExchangeIfRicParseModeId',
            defaulter: () => this.formatBoolean(CoreSettings.Default.symbol_PromptDefaultExchangeIfRicParseModeId),
            getter: () => this.formatBoolean(this._symbol_PromptDefaultExchangeIfRicParseModeId),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._symbol_PromptDefaultExchangeIfRicParseModeId = this.parseBoolean(value);
            }
        },
        Symbol_DefaultExchangeId: { id: CoreSettings.Id.Symbol_DefaultExchangeId,
            name: 'symbol_DefaultExchangeId',
            defaulter: () => this.formatEnumString(CoreSettings.Default.symbol_DefaultExchangeId),
            getter: () => this.formatEnumString(this._symbol_DefaultExchangeId),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._symbol_DefaultExchangeId = this.parseEnumString(value); }
        },
        Symbol_RicAnnouncerChar: { id: CoreSettings.Id.Symbol_RicAnnouncerChar,
            name: 'symbol_RicAnnouncerChar',
            defaulter: () => this.formatChar(CoreSettings.Default.symbol_RicAnnouncerChar),
            getter: () => this.formatChar(this._symbol_RicAnnouncerChar),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._symbol_RicAnnouncerChar = this.parseChar(value); }
        },
        Symbol_PscAnnouncerChar: { id: CoreSettings.Id.Symbol_PscAnnouncerChar,
            name: 'symbol_PscAnnouncerChar',
            defaulter: () => this.formatChar(CoreSettings.Default.symbol_PscAnnouncerChar),
            getter: () => this.formatChar(this._symbol_PscAnnouncerChar),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._symbol_PscAnnouncerChar = this.parseChar(value); }
        },
        Symbol_PscExchangeAnnouncerChar: { id: CoreSettings.Id.Symbol_PscExchangeAnnouncerChar,
            name: 'symbol_PscExchangeAnnouncerChar',
            defaulter: () => this.formatChar(CoreSettings.Default.symbol_PscExchangeAnnouncerChar),
            getter: () => this.formatChar(this._symbol_PscExchangeAnnouncerChar),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._symbol_PscExchangeAnnouncerChar = this.parseChar(value); }
        },
        Symbol_PscMarketAnnouncerChar: { id: CoreSettings.Id.Symbol_PscMarketAnnouncerChar,
            name: 'symbol_PscMarketAnnouncerChar',
            defaulter: () => this.formatChar(CoreSettings.Default.symbol_PscMarketAnnouncerChar),
            getter: () => this.formatChar(this._symbol_PscMarketAnnouncerChar),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._symbol_PscMarketAnnouncerChar = this.parseChar(value); }
        },
        Symbol_PscExchangeHideModeId: { id: CoreSettings.Id.Symbol_PscExchangeHideModeId,
            name: 'symbol_PscExchangeHideModeId',
            defaulter: () => this.formatEnumString(CoreSettings.Default.symbol_PscExchangeHideModeId),
            getter: () => this.formatEnumString(this._symbol_PscExchangeHideModeId),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._symbol_PscExchangeHideModeId = this.parseEnumString(value); }
        },
        Symbol_PscDefaultMarketHidden: { id: CoreSettings.Id.Symbol_PscDefaultMarketHidden,
            name: 'symbol_PscDefaultMarketHidden',
            defaulter: () => this.formatBoolean(CoreSettings.Default.symbol_PscDefaultMarketHidden),
            getter: () => this.formatBoolean(this._symbol_PscDefaultMarketHidden),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._symbol_PscDefaultMarketHidden = this.parseBoolean(value); }
        },
        Symbol_PscMarketCodeAsLocalWheneverPossible: { id: CoreSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible,
            name: 'symbol_PscMarketCodeAsLocalWheneverPossible',
            defaulter: () => this.formatBoolean(CoreSettings.Default.symbol_PscMarketCodeAsLocalWheneverPossible),
            getter: () => this.formatBoolean(this._symbol_PscMarketCodeAsLocalWheneverPossible),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._symbol_PscMarketCodeAsLocalWheneverPossible = this.parseBoolean(value);
            }
        },
        Symbol_AutoSelectDefaultMarketDest: { id: CoreSettings.Id.Symbol_AutoSelectDefaultMarketDest,
            name: 'symbol_AutoSelectDefaultMarketDest',
            defaulter: () => this.formatBoolean(CoreSettings.Default.symbol_AutoSelectDefaultMarketDest),
            getter: () => this.formatBoolean(this._symbol_AutoSelectDefaultMarketDest),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._symbol_AutoSelectDefaultMarketDest = this.parseBoolean(value);
            }
        },
        Grid_HorizontalLinesVisible: { id: CoreSettings.Id.Grid_HorizontalLinesVisible,
            name: 'grid_HorizontalLinesVisible',
            defaulter: () => this.formatBoolean(CoreSettings.Default.grid_HorizontalLinesVisible),
            getter: () => this.formatBoolean(this._grid_HorizontalLinesVisible),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_HorizontalLinesVisible = this.parseBoolean(value); }
        },
        Grid_VerticalLinesVisible: { id: CoreSettings.Id.Grid_VerticalLinesVisible,
            name: 'grid_VerticalLinesVisible',
            defaulter: () => this.formatBoolean(CoreSettings.Default.grid_VerticalLinesVisible),
            getter: () => this.formatBoolean(this._grid_VerticalLinesVisible),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_VerticalLinesVisible = this.parseBoolean(value); }
        },
        Grid_HorizontalLineWeight: { id: CoreSettings.Id.Grid_HorizontalLineWeight,
            name: 'grid_HorizontalLineWeight',
            defaulter: () => this.formatNumber(CoreSettings.Default.grid_HorizontalLineWeight),
            getter: () => this.formatNumber(this._grid_HorizontalLineWeight),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_HorizontalLineWeight = this.parseNumber(value); }
        },
        Grid_VerticalLineWeight: { id: CoreSettings.Id.Grid_VerticalLineWeight,
            name: 'grid_VerticalLineWeight',
            defaulter: () => this.formatNumber(CoreSettings.Default.grid_VerticalLineWeight),
            getter: () => this.formatNumber(this._grid_VerticalLineWeight),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_VerticalLineWeight = this.parseNumber(value); }
        },
        Grid_RowHeightFixed: { id: CoreSettings.Id.Grid_RowHeightFixed,
            name: 'grid_RowHeightFixed',
            defaulter: () => this.formatUndefinableInteger(CoreSettings.Default.grid_RowHeightFixed),
            getter: () => this.formatUndefinableInteger(this._grid_RowHeightFixed),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_RowHeightFixed = this.parseUndefinableInteger(value); }
        },
        Grid_CellPadding: { id: CoreSettings.Id.Grid_CellPadding,
            name: 'grid_CellPadding',
            defaulter: () => this.formatInteger(CoreSettings.Default.grid_CellPadding),
            getter: () => this.formatInteger(this._grid_CellPadding),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_CellPadding = this.parseInteger(value); }
        },
        Grid_AddHighlightDuration: { id: CoreSettings.Id.Grid_AddHighlightDuration,
            name: 'grid_AddHighlightDuration',
            defaulter: () => this.formatInteger(CoreSettings.Default.grid_AddHighlightDuration),
            getter: () => this.formatInteger(this._grid_AddHighlightDuration),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_AddHighlightDuration = this.parseInteger(value); }
        },
        Grid_UpdateHighlightDuration: { id: CoreSettings.Id.Grid_UpdateHighlightDuration,
            name: 'grid_UpdateHighlightDuration',
            defaulter: () => this.formatInteger(CoreSettings.Default.grid_UpdateHighlightDuration),
            getter: () => this.formatInteger(this._grid_UpdateHighlightDuration),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_UpdateHighlightDuration = this.parseInteger(value); }
        },
        Grid_Font: { id: CoreSettings.Id.Grid_Font,
            name: 'grid_Font',
            defaulter: () => this.formatString(CoreSettings.Default.grid_Font),
            getter: () => this.formatString(this._grid_Font),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_Font = this.parseString(value); }
        },
        Grid_FocusedColumnHeaderFont: { id: CoreSettings.Id.Grid_FocusedColumnHeaderFont,
            name: 'grid_FocusedColumnHeaderFont',
            defaulter: () => this.formatString(CoreSettings.Default.grid_FocusedColumnHeaderFont),
            getter: () => this.formatString(this._grid_FocusedColumnHeaderFont),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_FocusedColumnHeaderFont = this.parseString(value); }
        },
        Grid_ColumnHeaderFont: { id: CoreSettings.Id.Grid_ColumnHeaderFont,
            name: 'grid_ColumnHeaderFont',
            defaulter: () => this.formatString(CoreSettings.Default.grid_ColumnHeaderFont),
            getter: () => this.formatString(this._grid_ColumnHeaderFont),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_ColumnHeaderFont = this.parseString(value); }
        },
        Grid_FocusedFont: { id: CoreSettings.Id.Grid_FocusedFont,
            name: 'grid_FocusedFont',
            defaulter: () => this.formatString(CoreSettings.Default.grid_FocusedFont),
            getter: () => this.formatString(this._grid_FocusedFont),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_FocusedFont = this.parseString(value); }
        },
        Grid_FocusedRowColored: { id: CoreSettings.Id.Grid_FocusedRowColored,
            name: 'grid_FocusedRowColored',
            defaulter: () => this.formatBoolean(CoreSettings.Default.grid_FocusedRowColored),
            getter: () => this.formatBoolean(this._grid_FocusedRowColored),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_FocusedRowColored = this.parseBoolean(value); }
        },
        Grid_FocusedRowBordered: { id: CoreSettings.Id.Grid_FocusedRowBordered,
            name: 'grid_FocusedRowBordered',
            defaulter: () => this.formatBoolean(CoreSettings.Default.grid_FocusedRowBordered),
            getter: () => this.formatBoolean(this._grid_FocusedRowBordered),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_FocusedRowBordered = this.parseBoolean(value); }
        },
        Grid_FocusedRowBorderWidth: { id: CoreSettings.Id.Grid_FocusedRowBorderWidth,
            name: 'grid_FocusedRowBorderWidth',
            defaulter: () => this.formatInteger(CoreSettings.Default.grid_FocusedRowBorderWidth),
            getter: () => this.formatInteger(this._grid_FocusedRowBorderWidth),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_FocusedRowBorderWidth = this.parseInteger(value); }
        },
        Grid_HorizontalScrollbarWidth: { id: CoreSettings.Id.Grid_HorizontalScrollbarWidth,
            name: 'grid_HorizontalScrollbarWidth',
            defaulter: () => this.formatInteger(CoreSettings.Default.grid_HorizontalScrollbarWidth),
            getter: () => this.formatInteger(this._grid_HorizontalScrollbarWidth),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_HorizontalScrollbarWidth = this.parseInteger(value); }
        },
        Grid_VerticalScrollbarWidth: { id: CoreSettings.Id.Grid_VerticalScrollbarWidth,
            name: 'grid_VerticalScrollbarWidth',
            defaulter: () => this.formatInteger(CoreSettings.Default.grid_VerticalScrollbarWidth),
            getter: () => this.formatInteger(this._grid_VerticalScrollbarWidth),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_VerticalScrollbarWidth = this.parseInteger(value); }
        },
        Grid_VerticalScrollbarLeftPos: { id: CoreSettings.Id.Grid_VerticalScrollbarLeftPos,
            name: 'grid_VerticalScrollbarLeftPos',
            defaulter: () => this.formatBoolean(CoreSettings.Default.grid_VerticalScrollbarLeftPos),
            getter: () => this.formatBoolean(this._grid_VerticalScrollbarLeftPos),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_VerticalScrollbarLeftPos = this.parseBoolean(value); }
        },
        Grid_ScrollbarsOverlayAllowed: { id: CoreSettings.Id.Grid_ScrollbarsOverlayAllowed,
            name: 'grid_ScrollbarsOverlayAllowed',
            defaulter: () => this.formatBoolean(CoreSettings.Default.grid_ScrollbarsOverlayAllowed),
            getter: () => this.formatBoolean(this._grid_ScrollbarsOverlayAllowed),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_ScrollbarsOverlayAllowed = this.parseBoolean(value); }
        },
        Grid_ScrollbarMargin: { id: CoreSettings.Id.Grid_ScrollbarMargin,
            name: 'grid_ScrollbarMargin',
            defaulter: () => this.formatInteger(CoreSettings.Default.grid_ScrollbarMargin),
            getter: () => this.formatInteger(this._grid_ScrollbarMargin),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._grid_ScrollbarMargin = this.parseInteger(value); }
        },
        Data_InitialTradesHistoryCount: { id: CoreSettings.Id.Data_InitialTradesHistoryCount,
            name: 'data_InitialTradesHistoryCount',
            defaulter: () => this.formatUndefinableInteger(CoreSettings.Default.data_InitialTradesHistoryCount),
            getter: () => this.formatUndefinableInteger(this._data_InitialTradesHistoryCount),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._data_InitialTradesHistoryCount = this.parseUndefinableInteger(value);
            }
        },
        Format_NumberGroupingActive: { id: CoreSettings.Id.Format_NumberGroupingActive,
            name: 'format_NumberGroupingActive',
            defaulter: () => this.formatBoolean(CoreSettings.Default.format_NumberGroupingActive),
            getter: () => this.formatBoolean(this._format_NumberGroupingActive),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._format_NumberGroupingActive = this.parseBoolean(value); }
        },
        Format_MinimumPriceFractionDigitsCount: { id: CoreSettings.Id.Format_MinimumPriceFractionDigitsCount,
            name: 'format_MinimumPriceFractionDigitsCount',
            defaulter: () => this.formatInteger(CoreSettings.Default.format_MinimumPriceFractionDigitsCount),
            getter: () => this.formatInteger(this._format_MinimumPriceFractionDigitsCount),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._format_MinimumPriceFractionDigitsCount = this.parseInteger(value);
            }
        },
        Format_24Hour: { id: CoreSettings.Id.Format_24Hour,
            name: 'format_24Hour',
            defaulter: () => this.formatBoolean(CoreSettings.Default.format_24Hour),
            getter: () => this.formatBoolean(this._format_24Hour),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._format_24Hour = this.parseBoolean(value);
            }
        },
        Format_DateTimeTimezoneModeId: { id: CoreSettings.Id.Format_DateTimeTimezoneModeId,
            name: 'format_DateTimeTimezoneModeId',
            defaulter: () => this.formatEnumString(
                SourceTzOffsetDateTime.TimezoneMode.idToJsonValue(CoreSettings.Default.format_DateTimeTimezoneModeId)),
            getter: () => this.formatEnumString(SourceTzOffsetDateTime.TimezoneMode.idToJsonValue(this._format_DateTimeTimezoneModeId)),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                if (value.value === undefined) {
                    this._format_DateTimeTimezoneModeId = CoreSettings.Default.format_DateTimeTimezoneModeId;
                } else {
                    const id = SourceTzOffsetDateTime.TimezoneMode.tryJsonValueToId(value.value);
                    if (id === undefined) {
                        this._format_DateTimeTimezoneModeId = CoreSettings.Default.format_DateTimeTimezoneModeId;
                    } else {
                        this._format_DateTimeTimezoneModeId = id;
                    }
                }
            }
        },
        OrderPad_ReviewEnabled: { id: CoreSettings.Id.OrderPad_ReviewEnabled,
            name: 'orderPad_ReviewEnabled',
            defaulter: () => this.formatBoolean(CoreSettings.Default.orderPad_ReviewEnabled),
            getter: () => this.formatBoolean(this._orderPad_ReviewEnabled),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._orderPad_ReviewEnabled = this.parseBoolean(value);
            }
        },
        OrderPad_DefaultOrderTypeId: { id: CoreSettings.Id.OrderPad_DefaultOrderTypeId,
            name: 'orderPad_DefaultOrderTypeId',
            defaulter: () => this.formatUndefinableOrderTypeId(CoreSettings.Default.orderPad_DefaultOrderTypeId),
            getter: () => this.formatUndefinableOrderTypeId(this._orderPad_DefaultOrderTypeId),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._orderPad_DefaultOrderTypeId = this.parseUndefinableOrderTypeId(value);
            }
        },
        OrderPad_DefaultTimeInForceId: { id: CoreSettings.Id.OrderPad_DefaultTimeInForceId,
            name: 'orderPad_DefaultTimeInForceId',
            defaulter: () => this.formatUndefinableTimeInForceId(CoreSettings.Default.orderPad_DefaultTimeInForceId),
            getter: () => this.formatUndefinableTimeInForceId(this._orderPad_DefaultTimeInForceId),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => {
                this._orderPad_DefaultTimeInForceId = this.parseUndefinableTimeInForceId(value);
            }
        },
        FontFamily: { id: CoreSettings.Id.FontFamily,
            name: 'fontFamily',
            defaulter: () => this.formatString(CoreSettings.Default.fontFamily),
            getter: () => this.formatString(this._fontFamily),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._fontFamily = this.parseString(value); }
        },
        FontSize: { id: CoreSettings.Id.FontSize,
            name: 'fontSize',
            defaulter: () => this.formatString(CoreSettings.Default.fontSize),
            getter: () => this.formatString(this._fontSize),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._fontSize = this.parseString(value); }
        },
        InstrumentMovementColorSet: { id: CoreSettings.Id.InstrumentMovementColorSet,
            name: 'instrumentMovementColorSet',
            defaulter: () => this.formatEnumString(CoreSettings.Default.instrumentMovementColorSet),
            getter: () => this.formatEnumString(this._instrumentMovementColorSet),
            pusher: (value: TypedKeyValueSettingsGroup.PushValue) => { this._instrumentMovementColorSet = this.parseEnumString(value); }
        },
    } as const;

    private readonly _infos = Object.values(this._infosObject);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly idCount = Object.keys(this._infosObject).length;

    constructor() {
        super(CoreSettings.groupName);
    }

    get symbol_DefaultParseModeAuto() { return this._symbol_DefaultParseModeAuto; }
    set symbol_DefaultParseModeAuto(value: boolean) { this._symbol_DefaultParseModeAuto = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_DefaultParseModeAuto); }
    get symbol_ExplicitDefaultParseModeId() { return this._symbol_ExplicitDefaultParseModeId; }
    set symbol_ExplicitDefaultParseModeId(value: TypedKeyValueSettingsGroup.EnumString) { this._symbol_ExplicitDefaultParseModeId = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_ExplicitDefaultParseModeId); }
    get symbol_PromptDefaultExchangeIfRicParseModeId() { return this._symbol_PromptDefaultExchangeIfRicParseModeId; }
    set symbol_PromptDefaultExchangeIfRicParseModeId(value: boolean) { this._symbol_PromptDefaultExchangeIfRicParseModeId = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId); }
    get symbol_DefaultExchangeId() { return this._symbol_DefaultExchangeId; }
    set symbol_DefaultExchangeId(value: TypedKeyValueSettingsGroup.EnumString) { this._symbol_DefaultExchangeId = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_DefaultExchangeId); }
    get symbol_RicAnnouncerChar() { return this._symbol_RicAnnouncerChar; }
    set symbol_RicAnnouncerChar(value: string) { this._symbol_RicAnnouncerChar = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_RicAnnouncerChar); }
    get symbol_PscAnnouncerChar() { return this._symbol_PscAnnouncerChar; }
    set symbol_PscAnnouncerChar(value: string) { this._symbol_PscAnnouncerChar = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_PscAnnouncerChar); }
    get symbol_PscExchangeAnnouncerChar() { return this._symbol_PscExchangeAnnouncerChar; }
    set symbol_PscExchangeAnnouncerChar(value: string) { this._symbol_PscExchangeAnnouncerChar = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_PscExchangeAnnouncerChar); }
    get symbol_PscMarketAnnouncerChar() { return this._symbol_PscMarketAnnouncerChar; }
    set symbol_PscMarketAnnouncerChar(value: string) { this._symbol_PscMarketAnnouncerChar = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_PscMarketAnnouncerChar); }
    get symbol_PscExchangeHideModeId() { return this._symbol_PscExchangeHideModeId; }
    set symbol_PscExchangeHideModeId(value: TypedKeyValueSettingsGroup.EnumString) { this._symbol_PscExchangeHideModeId = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_PscExchangeHideModeId); }
    get symbol_PscDefaultMarketHidden() { return this._symbol_PscDefaultMarketHidden; }
    set symbol_PscDefaultMarketHidden(value: boolean) { this._symbol_PscDefaultMarketHidden = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_PscDefaultMarketHidden); }
    get symbol_PscMarketCodeAsLocalWheneverPossible() { return this._symbol_PscMarketCodeAsLocalWheneverPossible; }
    set symbol_PscMarketCodeAsLocalWheneverPossible(value: boolean) { this._symbol_PscMarketCodeAsLocalWheneverPossible = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible); }
    get symbol_AutoSelectDefaultMarketDest() { return this._symbol_AutoSelectDefaultMarketDest; }
    set symbol_AutoSelectDefaultMarketDest(value: boolean) { this._symbol_AutoSelectDefaultMarketDest = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_AutoSelectDefaultMarketDest); }

    get grid_HorizontalLinesVisible() { return this._grid_HorizontalLinesVisible; }
    set grid_HorizontalLinesVisible(value) { this._grid_HorizontalLinesVisible = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_HorizontalLinesVisible); }
    get grid_VerticalLinesVisible() { return this._grid_VerticalLinesVisible; }
    set grid_VerticalLinesVisible(value) { this._grid_VerticalLinesVisible = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_VerticalLinesVisible); }
    get grid_HorizontalLineWeight() { return this._grid_HorizontalLineWeight; }
    set grid_HorizontalLineWeight(value) { this._grid_HorizontalLineWeight = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_HorizontalLineWeight); }
    get grid_VerticalLineWeight() { return this._grid_VerticalLineWeight; }
    set grid_VerticalLineWeight(value) { this._grid_VerticalLineWeight = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_VerticalLineWeight); }
    get grid_RowHeightFixed() { return this._grid_RowHeightFixed; }
    set grid_RowHeightFixed(value) { this._grid_RowHeightFixed = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_RowHeightFixed); }
    get grid_CellPadding() { return this._grid_CellPadding; }
    set grid_CellPadding(value) { this._grid_CellPadding = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_CellPadding); }
    get grid_AddHighlightDuration() { return this._grid_AddHighlightDuration; }
    set grid_AddHighlightDuration(value) { this._grid_AddHighlightDuration = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_AddHighlightDuration); }
    get grid_UpdateHighlightDuration() { return this._grid_UpdateHighlightDuration; }
    set grid_UpdateHighlightDuration(value) { this._grid_UpdateHighlightDuration = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_UpdateHighlightDuration); }
    get grid_Font() { return this._grid_Font; }
    set grid_Font(value) { this._grid_Font = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_Font); }
    get grid_FocusedColumnHeaderFont() { return this._grid_FocusedColumnHeaderFont; }
    set grid_FocusedColumnHeaderFont(value) { this._grid_FocusedColumnHeaderFont = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_FocusedColumnHeaderFont); }
    get grid_ColumnHeaderFont() { return this._grid_ColumnHeaderFont; }
    set grid_ColumnHeaderFont(value) { this._grid_ColumnHeaderFont = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ColumnHeaderFont); }
    get grid_FocusedFont() { return this._grid_FocusedFont; }
    set grid_FocusedFont(value) { this._grid_FocusedFont = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_FocusedFont); }
    get grid_FocusedRowColored() { return this._grid_FocusedRowColored; }
    set grid_FocusedRowColored(value) { this._grid_FocusedRowColored = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_FocusedRowColored); }
    get grid_FocusedRowBordered() { return this._grid_FocusedRowBordered; }
    set grid_FocusedRowBordered(value) { this._grid_FocusedRowBordered = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_FocusedRowBordered); }
    get grid_FocusedRowBorderWidth() { return this._grid_FocusedRowBorderWidth; }
    set grid_FocusedRowBorderWidth(value) { this._grid_FocusedRowBorderWidth = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_FocusedRowBorderWidth); }
    get grid_HorizontalScrollbarWidth() { return this._grid_HorizontalScrollbarWidth; }
    set grid_HorizontalScrollbarWidth(value) { this._grid_HorizontalScrollbarWidth = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_HorizontalScrollbarWidth); }
    get grid_VerticalScrollbarWidth() { return this._grid_VerticalScrollbarWidth; }
    set grid_VerticalScrollbarWidth(value) { this._grid_VerticalScrollbarWidth = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_VerticalScrollbarWidth); }
    get grid_VerticalScrollbarLeftPos() { return this._grid_VerticalScrollbarLeftPos; }
    set grid_VerticalScrollbarLeftPos(value) { this._grid_VerticalScrollbarLeftPos = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_VerticalScrollbarLeftPos); }
    get grid_ScrollbarsOverlayAllowed() { return this._grid_ScrollbarsOverlayAllowed; }
    set grid_ScrollbarsOverlayAllowed(value) { this._grid_ScrollbarsOverlayAllowed = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ScrollbarsOverlayAllowed); }
    get grid_ScrollbarMargin() { return this._grid_ScrollbarMargin; }
    set grid_ScrollbarMargin(value) { this._grid_ScrollbarMargin = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ScrollbarMargin); }

    get data_InitialTradesHistoryCount() { return this._data_InitialTradesHistoryCount; }
    set data_InitialTradesHistoryCount(value) { this._data_InitialTradesHistoryCount = value;
        this.notifySettingChanged(CoreSettings.Id.Data_InitialTradesHistoryCount); }
    get format_NumberGroupingActive() { return this._format_NumberGroupingActive; }
    set format_NumberGroupingActive(value) { this._format_NumberGroupingActive = value;
        this.notifySettingChanged(CoreSettings.Id.Format_NumberGroupingActive); }
    get format_MinimumPriceFractionDigitsCount() { return this._format_MinimumPriceFractionDigitsCount; }
    set format_MinimumPriceFractionDigitsCount(value) { this._format_MinimumPriceFractionDigitsCount = value;
        this.notifySettingChanged(CoreSettings.Id.Format_MinimumPriceFractionDigitsCount); }
    get format_24Hour() { return this._format_24Hour; }
    set format_24Hour(value) { this._format_24Hour = value;
        this.notifySettingChanged(CoreSettings.Id.Format_24Hour); }
    get format_DateTimeTimezoneModeId() { return this._format_DateTimeTimezoneModeId; }
    set format_DateTimeTimezoneModeId(value) { this._format_DateTimeTimezoneModeId = value;
        this.notifySettingChanged(CoreSettings.Id.Format_DateTimeTimezoneModeId); }

    get orderPad_ReviewEnabled() { return this._orderPad_ReviewEnabled; }
    set orderPad_ReviewEnabled(value) { this._orderPad_ReviewEnabled = value;
        this.notifySettingChanged(CoreSettings.Id.OrderPad_ReviewEnabled); }
    get orderPad_DefaultOrderTypeId() { return this._orderPad_DefaultOrderTypeId; }
    set orderPad_DefaultOrderTypeId(value) { this._orderPad_DefaultOrderTypeId = value;
        this.notifySettingChanged(CoreSettings.Id.OrderPad_DefaultOrderTypeId); }
    get orderPad_DefaultTimeInForceId() { return this._orderPad_DefaultTimeInForceId; }
    set orderPad_DefaultTimeInForceId(value) { this._orderPad_DefaultTimeInForceId = value;
        this.notifySettingChanged(CoreSettings.Id.OrderPad_DefaultTimeInForceId); }

    get fontFamily() { return this._fontFamily; }
    set fontFamily(value) { this._fontFamily = value;
        this.notifySettingChanged(CoreSettings.Id.FontFamily); }
    get fontSize() { return this._fontSize; }
    set fontSize(value) { this._fontSize = value;
        this.notifySettingChanged(CoreSettings.Id.FontSize); }
    get instrumentMovementColorSet() { return this._instrumentMovementColorSet; }
    set instrumentMovementColorSet(value) { this._instrumentMovementColorSet = value;
        this.notifySettingChanged(CoreSettings.Id.InstrumentMovementColorSet); }

    protected getInfo(idx: Integer) {
        return this._infos[idx];
    }
}

export namespace CoreSettings {
    export const groupName = 'core';

    export const enum Id {
        Symbol_DefaultParseModeAuto,
        Symbol_ExplicitDefaultParseModeId,
        Symbol_PromptDefaultExchangeIfRicParseModeId,
        Symbol_DefaultExchangeId,
        Symbol_RicAnnouncerChar,
        Symbol_PscAnnouncerChar,
        Symbol_PscExchangeAnnouncerChar,
        Symbol_PscMarketAnnouncerChar,
        Symbol_PscExchangeHideModeId,
        Symbol_PscDefaultMarketHidden,
        Symbol_PscMarketCodeAsLocalWheneverPossible,
        Symbol_AutoSelectDefaultMarketDest,

        Grid_HorizontalLinesVisible,
        Grid_VerticalLinesVisible,
        Grid_HorizontalLineWeight,
        Grid_VerticalLineWeight,
        Grid_RowHeightFixed,
        Grid_CellPadding,
        Grid_AddHighlightDuration,
        Grid_UpdateHighlightDuration,
        Grid_Font,
        Grid_FocusedColumnHeaderFont,
        Grid_ColumnHeaderFont,
        Grid_FocusedFont,
        Grid_FocusedRowColored,
        Grid_FocusedRowBordered,
        Grid_FocusedRowBorderWidth,
        Grid_HorizontalScrollbarWidth,
        Grid_VerticalScrollbarWidth,
        Grid_VerticalScrollbarLeftPos,
        Grid_ScrollbarsOverlayAllowed,
        Grid_ScrollbarMargin,

        Data_InitialTradesHistoryCount,

        Format_NumberGroupingActive,
        Format_MinimumPriceFractionDigitsCount,
        Format_24Hour,
        Format_DateTimeTimezoneModeId,

        OrderPad_ReviewEnabled,
        OrderPad_DefaultOrderTypeId,
        OrderPad_DefaultTimeInForceId,

        FontFamily,
        FontSize,
        InstrumentMovementColorSet,
    }

    export type InfosObject = { [id in keyof typeof Id]: TypedKeyValueSettingsGroup.Info };

    export namespace Default {
        export const symbol_DefaultParseModeAuto = true;
        export const symbol_ExplicitDefaultParseModeId: TypedKeyValueSettingsGroup.EnumString = 'ric';
        export const symbol_PromptDefaultExchangeIfRicParseModeId = false;
        export const symbol_DefaultExchangeId: TypedKeyValueSettingsGroup.EnumString = '';
        export const symbol_RicAnnouncerChar = ']';
        export const symbol_PscAnnouncerChar = '{';
        export const symbol_PscExchangeAnnouncerChar = '.';
        export const symbol_PscMarketAnnouncerChar = '@';
        export const symbol_PscExchangeHideModeId: TypedKeyValueSettingsGroup.EnumString = 'wheneverPossible';
        export const symbol_PscDefaultMarketHidden = true;
        export const symbol_PscMarketCodeAsLocalWheneverPossible = true;
        export const symbol_AutoSelectDefaultMarketDest = true;

        export const grid_HorizontalLinesVisible = false;
        export const grid_VerticalLinesVisible = true;
        export const grid_HorizontalLineWeight = 1;
        export const grid_VerticalLineWeight = 1;
        export const grid_RowHeightFixed: Integer | undefined = undefined;
        export const grid_CellPadding = 2;
        export const grid_AddHighlightDuration: SysTick.Span = 1500;
        export const grid_UpdateHighlightDuration: SysTick.Span = 2000;
        export const grid_Font = '';
        export const grid_FocusedColumnHeaderFont = '';
        export const grid_ColumnHeaderFont = '';
        export const grid_FocusedFont = '';
        export const grid_FocusedRowColored = true;
        export const grid_FocusedRowBordered = false;
        export const grid_FocusedRowBorderWidth = 2;
        export const grid_HorizontalScrollbarWidth = 11;
        export const grid_VerticalScrollbarWidth = 11;
        export const grid_VerticalScrollbarLeftPos = false;
        export const grid_ScrollbarsOverlayAllowed = false;
        export const grid_ScrollbarMargin = 1;

        export const orderPad_ReviewEnabled = true;
        export const orderPad_DefaultOrderTypeId: OrderTypeId | undefined = undefined;
        export const orderPad_DefaultTimeInForceId: TimeInForceId | undefined = undefined;

        export const data_InitialTradesHistoryCount: Integer | undefined = undefined;
        export const format_NumberGroupingActive = false;
        export const format_MinimumPriceFractionDigitsCount = 3;
        export const format_24Hour = true;
        export const format_DateTimeTimezoneModeId = SourceTzOffsetDateTime.TimezoneModeId.Source;

        export const fontFamily = '\'Roboto\', Arial, \'Helvetica Neue\', Helvetica, sans-serif';
        export const fontSize = '12px';
        export const instrumentMovementColorSet: TypedKeyValueSettingsGroup.EnumString = 'American';
    }
}
