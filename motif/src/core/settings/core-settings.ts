/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/* eslint-disable brace-style */
import { OrderTypeId, SymbolField, SymbolFieldId, TimeInForceId } from 'src/adi/internal-api';
import { Integer, SourceTzOffsetDateTime, SysTick } from 'src/sys/internal-api';
import { TypedKeyValueSettings } from './typed-key-value-settings';
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
    private _symbol_ExplicitSearchFieldsEnabled = CoreSettings.Default.symbol_ExplicitSearchFieldsEnabled;
    private _symbol_ExplicitSearchFieldIds = CoreSettings.Default.symbol_ExplicitSearchFieldIds;

    private _grid_HorizontalLinesVisible = CoreSettings.Default.grid_HorizontalLinesVisible;
    private _grid_VerticalLinesVisible = CoreSettings.Default.grid_VerticalLinesVisible;
    private _grid_HorizontalLineWidth = CoreSettings.Default.grid_HorizontalLineWidth;
    private _grid_VerticalLineWidth = CoreSettings.Default.grid_VerticalLineWidth;
    private _grid_RowHeight = CoreSettings.Default.grid_RowHeight;
    private _grid_CellPadding = CoreSettings.Default.grid_CellPadding;
    private _grid_AllChangedRecentDuration = CoreSettings.Default.grid_AllChangedRecentDuration;
    private _grid_RecordInsertedRecentDuration = CoreSettings.Default.grid_RecordInsertedRecentDuration;
    private _grid_RecordUpdatedRecentDuration = CoreSettings.Default.grid_RecordUpdatedRecentDuration;
    private _grid_ValueChangedRecentDuration = CoreSettings.Default.grid_ValueChangedRecentDuration;
    private _grid_FontFamily = CoreSettings.Default.grid_FontFamily;
    private _grid_FontSize = CoreSettings.Default.grid_FontSize;
    private _grid_ColumnHeaderFontSize = CoreSettings.Default.grid_ColumnHeaderFontSize;
    private _grid_FocusedRowColored = CoreSettings.Default.grid_FocusedRowColored;
    private _grid_FocusedRowBordered = CoreSettings.Default.grid_FocusedRowBordered;
    private _grid_FocusedRowBorderWidth = CoreSettings.Default.grid_FocusedRowBorderWidth;
    private _grid_HorizontalScrollbarWidth = CoreSettings.Default.grid_HorizontalScrollbarWidth;
    private _grid_VerticalScrollbarWidth = CoreSettings.Default.grid_VerticalScrollbarWidth;
    private _grid_ScrollbarThumbInactiveOpacity = CoreSettings.Default.grid_ScrollbarThumbInactiveOpacity;
    private _grid_ScrollbarsOverlayAllowed = CoreSettings.Default.grid_ScrollbarsOverlayAllowed;
    private _grid_ScrollbarMargin = CoreSettings.Default.grid_ScrollbarMargin;
    private _grid_ScrollHorizontallySmoothly = CoreSettings.Default.grid_ScrollHorizontallySmoothly;

    private _data_InitialTradesHistoryCount = CoreSettings.Default.data_InitialTradesHistoryCount;
    private _format_NumberGroupingActive = CoreSettings.Default.format_NumberGroupingActive;
    private _format_MinimumPriceFractionDigitsCount = CoreSettings.Default.format_MinimumPriceFractionDigitsCount;
    private _format_24Hour = CoreSettings.Default.format_24Hour;
    private _format_DateTimeTimezoneModeId = CoreSettings.Default.format_DateTimeTimezoneModeId;

    private _control_DropDownEditableSearchTerm = CoreSettings.Default.control_DropDownEditableSearchTerm;

    private _orderPad_ReviewEnabled = CoreSettings.Default.orderPad_ReviewEnabled;
    private _orderPad_DefaultOrderTypeId = CoreSettings.Default.orderPad_DefaultOrderTypeId;
    private _orderPad_DefaultTimeInForceId = CoreSettings.Default.orderPad_DefaultTimeInForceId;

    private _fontFamily = CoreSettings.Default.fontFamily;
    private _fontSize = CoreSettings.Default.fontSize;
    private _instrumentMovementColorSet = CoreSettings.Default.instrumentMovementColorSet;

    private _infosObject: CoreSettings.InfosObject = {
        Symbol_DefaultParseModeAuto: { id: CoreSettings.Id.Symbol_DefaultParseModeAuto,
            name: 'symbol_DefaultParseModeAuto',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.symbol_DefaultParseModeAuto),
            getter: () => TypedKeyValueSettings.formatBoolean(this._symbol_DefaultParseModeAuto),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._symbol_DefaultParseModeAuto = TypedKeyValueSettings.parseBoolean(value); }
        },
        Symbol_ExplicitDefaultParseModeId: { id: CoreSettings.Id.Symbol_ExplicitDefaultParseModeId,
            name: 'symbol_ExplicitDefaultParseModeId',
            defaulter: () => TypedKeyValueSettings.formatEnumString(CoreSettings.Default.symbol_ExplicitDefaultParseModeId),
            getter: () => TypedKeyValueSettings.formatEnumString(this._symbol_ExplicitDefaultParseModeId),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._symbol_ExplicitDefaultParseModeId = TypedKeyValueSettings.parseEnumString(value);
            }
        },
        Symbol_PromptDefaultExchangeIfRicParseModeId: { id: CoreSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId,
            name: 'symbol_PromptDefaultExchangeIfRicParseModeId',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.symbol_PromptDefaultExchangeIfRicParseModeId),
            getter: () => TypedKeyValueSettings.formatBoolean(this._symbol_PromptDefaultExchangeIfRicParseModeId),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._symbol_PromptDefaultExchangeIfRicParseModeId = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Symbol_DefaultExchangeId: { id: CoreSettings.Id.Symbol_DefaultExchangeId,
            name: 'symbol_DefaultExchangeId',
            defaulter: () => TypedKeyValueSettings.formatEnumString(CoreSettings.Default.symbol_DefaultExchangeId),
            getter: () => TypedKeyValueSettings.formatEnumString(this._symbol_DefaultExchangeId),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._symbol_DefaultExchangeId = TypedKeyValueSettings.parseEnumString(value); }
        },
        Symbol_RicAnnouncerChar: { id: CoreSettings.Id.Symbol_RicAnnouncerChar,
            name: 'symbol_RicAnnouncerChar',
            defaulter: () => TypedKeyValueSettings.formatChar(CoreSettings.Default.symbol_RicAnnouncerChar),
            getter: () => TypedKeyValueSettings.formatChar(this._symbol_RicAnnouncerChar),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._symbol_RicAnnouncerChar = TypedKeyValueSettings.parseChar(value); }
        },
        Symbol_PscAnnouncerChar: { id: CoreSettings.Id.Symbol_PscAnnouncerChar,
            name: 'symbol_PscAnnouncerChar',
            defaulter: () => TypedKeyValueSettings.formatChar(CoreSettings.Default.symbol_PscAnnouncerChar),
            getter: () => TypedKeyValueSettings.formatChar(this._symbol_PscAnnouncerChar),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._symbol_PscAnnouncerChar = TypedKeyValueSettings.parseChar(value); }
        },
        Symbol_PscExchangeAnnouncerChar: { id: CoreSettings.Id.Symbol_PscExchangeAnnouncerChar,
            name: 'symbol_PscExchangeAnnouncerChar',
            defaulter: () => TypedKeyValueSettings.formatChar(CoreSettings.Default.symbol_PscExchangeAnnouncerChar),
            getter: () => TypedKeyValueSettings.formatChar(this._symbol_PscExchangeAnnouncerChar),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._symbol_PscExchangeAnnouncerChar = TypedKeyValueSettings.parseChar(value); }
        },
        Symbol_PscMarketAnnouncerChar: { id: CoreSettings.Id.Symbol_PscMarketAnnouncerChar,
            name: 'symbol_PscMarketAnnouncerChar',
            defaulter: () => TypedKeyValueSettings.formatChar(CoreSettings.Default.symbol_PscMarketAnnouncerChar),
            getter: () => TypedKeyValueSettings.formatChar(this._symbol_PscMarketAnnouncerChar),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._symbol_PscMarketAnnouncerChar = TypedKeyValueSettings.parseChar(value); }
        },
        Symbol_PscExchangeHideModeId: { id: CoreSettings.Id.Symbol_PscExchangeHideModeId,
            name: 'symbol_PscExchangeHideModeId',
            defaulter: () => TypedKeyValueSettings.formatEnumString(CoreSettings.Default.symbol_PscExchangeHideModeId),
            getter: () => TypedKeyValueSettings.formatEnumString(this._symbol_PscExchangeHideModeId),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._symbol_PscExchangeHideModeId = TypedKeyValueSettings.parseEnumString(value); }
        },
        Symbol_PscDefaultMarketHidden: { id: CoreSettings.Id.Symbol_PscDefaultMarketHidden,
            name: 'symbol_PscDefaultMarketHidden',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.symbol_PscDefaultMarketHidden),
            getter: () => TypedKeyValueSettings.formatBoolean(this._symbol_PscDefaultMarketHidden),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._symbol_PscDefaultMarketHidden = TypedKeyValueSettings.parseBoolean(value); }
        },
        Symbol_PscMarketCodeAsLocalWheneverPossible: { id: CoreSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible,
            name: 'symbol_PscMarketCodeAsLocalWheneverPossible',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.symbol_PscMarketCodeAsLocalWheneverPossible),
            getter: () => TypedKeyValueSettings.formatBoolean(this._symbol_PscMarketCodeAsLocalWheneverPossible),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._symbol_PscMarketCodeAsLocalWheneverPossible = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Symbol_AutoSelectDefaultMarketDest: { id: CoreSettings.Id.Symbol_AutoSelectDefaultMarketDest,
            name: 'symbol_AutoSelectDefaultMarketDest',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.symbol_AutoSelectDefaultMarketDest),
            getter: () => TypedKeyValueSettings.formatBoolean(this._symbol_AutoSelectDefaultMarketDest),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._symbol_AutoSelectDefaultMarketDest = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Symbol_ExplicitSearchFieldsEnabled: { id: CoreSettings.Id.Symbol_ExplicitSearchFieldsEnabled,
            name: 'symbol_ExplicitSearchFieldsEnabled',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.symbol_ExplicitSearchFieldsEnabled),
            getter: () => TypedKeyValueSettings.formatBoolean(this._symbol_ExplicitSearchFieldsEnabled),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._symbol_ExplicitSearchFieldsEnabled = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Symbol_ExplicitSearchFieldIds: { id: CoreSettings.Id.Symbol_ExplicitSearchFieldIds,
            name: 'symbol_ExplicitSearchFieldIds',
            defaulter: () => TypedKeyValueSettings.formatEnumArrayString(
                SymbolField.idArrayToJsonValue(CoreSettings.Default.symbol_ExplicitSearchFieldIds)
            ),
            getter: () => TypedKeyValueSettings.formatEnumArrayString(
                SymbolField.idArrayToJsonValue(this._symbol_ExplicitSearchFieldIds)
            ),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                if (value.value === undefined) {
                    this._symbol_ExplicitSearchFieldIds = CoreSettings.Default.symbol_ExplicitSearchFieldIds;
                } else {
                    const idArray = SymbolField.tryJsonValueToIdArray(value.value);
                    if (idArray === undefined) {
                        this._symbol_ExplicitSearchFieldIds = CoreSettings.Default.symbol_ExplicitSearchFieldIds;
                    } else {
                        this._symbol_ExplicitSearchFieldIds = idArray;
                    }
                }
            }
        },
        Grid_HorizontalLinesVisible: { id: CoreSettings.Id.Grid_HorizontalLinesVisible,
            name: 'grid_HorizontalLinesVisible',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.grid_HorizontalLinesVisible),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_HorizontalLinesVisible),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_HorizontalLinesVisible = TypedKeyValueSettings.parseBoolean(value); }
        },
        Grid_VerticalLinesVisible: { id: CoreSettings.Id.Grid_VerticalLinesVisible,
            name: 'grid_VerticalLinesVisible',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.grid_VerticalLinesVisible),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_VerticalLinesVisible),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_VerticalLinesVisible = TypedKeyValueSettings.parseBoolean(value); }
        },
        Grid_HorizontalLineWidth: { id: CoreSettings.Id.Grid_HorizontalLineWidth,
            name: 'grid_HorizontalLineWidth',
            defaulter: () => TypedKeyValueSettings.formatNumber(CoreSettings.Default.grid_HorizontalLineWidth),
            getter: () => TypedKeyValueSettings.formatNumber(this._grid_HorizontalLineWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_HorizontalLineWidth = TypedKeyValueSettings.parseNumber(value); }
        },
        Grid_VerticalLineWidth: { id: CoreSettings.Id.Grid_VerticalLineWidth,
            name: 'grid_VerticalLineWidth',
            defaulter: () => TypedKeyValueSettings.formatNumber(CoreSettings.Default.grid_VerticalLineWidth),
            getter: () => TypedKeyValueSettings.formatNumber(this._grid_VerticalLineWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_VerticalLineWidth = TypedKeyValueSettings.parseNumber(value); }
        },
        Grid_RowHeight: { id: CoreSettings.Id.Grid_RowHeight,
            name: 'grid_RowHeight',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_RowHeight),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_RowHeight),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_RowHeight = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_CellPadding: { id: CoreSettings.Id.Grid_CellPadding,
            name: 'grid_CellPadding',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_CellPadding),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_CellPadding),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_CellPadding = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_AllChangedRecentDuration: { id: CoreSettings.Id.Grid_AllChangedRecentDuration,
            name: 'grid_AllChangedRecentDuration',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_AllChangedRecentDuration),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_AllChangedRecentDuration),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_AllChangedRecentDuration = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_RecordInsertedRecentDuration: { id: CoreSettings.Id.Grid_RecordInsertedRecentDuration,
            name: 'grid_RecordInsertedRecentDuration',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_RecordInsertedRecentDuration),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_RecordInsertedRecentDuration),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_RecordInsertedRecentDuration = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_RecordUpdatedRecentDuration: { id: CoreSettings.Id.Grid_RecordUpdatedRecentDuration,
            name: 'grid_RecordUpdatedRecentDuration',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_RecordUpdatedRecentDuration),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_RecordUpdatedRecentDuration),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_RecordUpdatedRecentDuration = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Grid_ValueChangedRecentDuration: { id: CoreSettings.Id.Grid_ValueChangedRecentDuration,
            name: 'grid_ValueChangedRecentDuration',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_ValueChangedRecentDuration),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_ValueChangedRecentDuration),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_ValueChangedRecentDuration = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_FontFamily: { id: CoreSettings.Id.Grid_FontFamily,
            name: 'grid_FontFamily',
            defaulter: () => TypedKeyValueSettings.formatString(CoreSettings.Default.grid_FontFamily),
            getter: () => TypedKeyValueSettings.formatString(this._grid_FontFamily),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_FontFamily = TypedKeyValueSettings.parseString(value); }
        },
        Grid_FontSize: { id: CoreSettings.Id.Grid_FontSize,
            name: 'grid_FontSize',
            defaulter: () => TypedKeyValueSettings.formatString(CoreSettings.Default.grid_FontSize),
            getter: () => TypedKeyValueSettings.formatString(this._grid_FontSize),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_FontSize = TypedKeyValueSettings.parseString(value); }
        },
        Grid_ColumnHeaderFontSize: { id: CoreSettings.Id.Grid_ColumnHeaderFontSize,
            name: 'grid_ColumnHeaderFontSize',
            defaulter: () => TypedKeyValueSettings.formatString(CoreSettings.Default.grid_ColumnHeaderFontSize),
            getter: () => TypedKeyValueSettings.formatString(this._grid_ColumnHeaderFontSize),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_ColumnHeaderFontSize = TypedKeyValueSettings.parseString(value); }
        },
        Grid_FocusedRowColored: { id: CoreSettings.Id.Grid_FocusedRowColored,
            name: 'grid_FocusedRowColored',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.grid_FocusedRowColored),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_FocusedRowColored),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_FocusedRowColored = TypedKeyValueSettings.parseBoolean(value); }
        },
        Grid_FocusedRowBordered: { id: CoreSettings.Id.Grid_FocusedRowBordered,
            name: 'grid_FocusedRowBordered',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.grid_FocusedRowBordered),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_FocusedRowBordered),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_FocusedRowBordered = TypedKeyValueSettings.parseBoolean(value); }
        },
        Grid_FocusedRowBorderWidth: { id: CoreSettings.Id.Grid_FocusedRowBorderWidth,
            name: 'grid_FocusedRowBorderWidth',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_FocusedRowBorderWidth),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_FocusedRowBorderWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_FocusedRowBorderWidth = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_HorizontalScrollbarWidth: { id: CoreSettings.Id.Grid_HorizontalScrollbarWidth,
            name: 'grid_HorizontalScrollbarWidth',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_HorizontalScrollbarWidth),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_HorizontalScrollbarWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_HorizontalScrollbarWidth = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_VerticalScrollbarWidth: { id: CoreSettings.Id.Grid_VerticalScrollbarWidth,
            name: 'grid_VerticalScrollbarWidth',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_VerticalScrollbarWidth),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_VerticalScrollbarWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_VerticalScrollbarWidth = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_ScrollbarThumbInactiveOpacity: { id: CoreSettings.Id.Grid_ScrollbarThumbInactiveOpacity,
            name: 'grid_ScrollbarThumbInactiveOpacity',
            defaulter: () => TypedKeyValueSettings.formatNumber(CoreSettings.Default.grid_ScrollbarThumbInactiveOpacity),
            getter: () => TypedKeyValueSettings.formatNumber(this._grid_ScrollbarThumbInactiveOpacity),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_ScrollbarThumbInactiveOpacity = TypedKeyValueSettings.parseNumber(value); }
        },
        Grid_ScrollbarsOverlayAllowed: { id: CoreSettings.Id.Grid_ScrollbarsOverlayAllowed,
            name: 'grid_ScrollbarsOverlayAllowed',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.grid_ScrollbarsOverlayAllowed),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_ScrollbarsOverlayAllowed),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_ScrollbarsOverlayAllowed = TypedKeyValueSettings.parseBoolean(value); }
        },
        Grid_ScrollbarMargin: { id: CoreSettings.Id.Grid_ScrollbarMargin,
            name: 'grid_ScrollbarMargin',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.grid_ScrollbarMargin),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_ScrollbarMargin),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_ScrollbarMargin = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_ScrollHorizontallySmoothly: { id: CoreSettings.Id.Grid_ScrollHorizontallySmoothly,
            name: 'grid_ScrollHorizontallySmoothly',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.grid_ScrollHorizontallySmoothly),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_ScrollHorizontallySmoothly),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_ScrollHorizontallySmoothly = TypedKeyValueSettings.parseBoolean(value); }
        },
        Data_InitialTradesHistoryCount: { id: CoreSettings.Id.Data_InitialTradesHistoryCount,
            name: 'data_InitialTradesHistoryCount',
            defaulter: () => TypedKeyValueSettings.formatUndefinableInteger(CoreSettings.Default.data_InitialTradesHistoryCount),
            getter: () => TypedKeyValueSettings.formatUndefinableInteger(this._data_InitialTradesHistoryCount),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._data_InitialTradesHistoryCount = TypedKeyValueSettings.parseUndefinableInteger(value);
            }
        },
        Format_NumberGroupingActive: { id: CoreSettings.Id.Format_NumberGroupingActive,
            name: 'format_NumberGroupingActive',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.format_NumberGroupingActive),
            getter: () => TypedKeyValueSettings.formatBoolean(this._format_NumberGroupingActive),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._format_NumberGroupingActive = TypedKeyValueSettings.parseBoolean(value); }
        },
        Format_MinimumPriceFractionDigitsCount: { id: CoreSettings.Id.Format_MinimumPriceFractionDigitsCount,
            name: 'format_MinimumPriceFractionDigitsCount',
            defaulter: () => TypedKeyValueSettings.formatInteger(CoreSettings.Default.format_MinimumPriceFractionDigitsCount),
            getter: () => TypedKeyValueSettings.formatInteger(this._format_MinimumPriceFractionDigitsCount),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._format_MinimumPriceFractionDigitsCount = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Format_24Hour: { id: CoreSettings.Id.Format_24Hour,
            name: 'format_24Hour',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.format_24Hour),
            getter: () => TypedKeyValueSettings.formatBoolean(this._format_24Hour),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._format_24Hour = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Format_DateTimeTimezoneModeId: { id: CoreSettings.Id.Format_DateTimeTimezoneModeId,
            name: 'format_DateTimeTimezoneModeId',
            defaulter: () => TypedKeyValueSettings.formatEnumString(
                SourceTzOffsetDateTime.TimezoneMode.idToJsonValue(CoreSettings.Default.format_DateTimeTimezoneModeId)),
            getter: () => TypedKeyValueSettings.formatEnumString(SourceTzOffsetDateTime.TimezoneMode.idToJsonValue(this._format_DateTimeTimezoneModeId)),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
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
        Control_DropDownEditableSearchTerm: { id: CoreSettings.Id.Control_DropDownEditableSearchTerm,
            name: 'control_DropDownEditableSearchTerm',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.control_DropDownEditableSearchTerm),
            getter: () => TypedKeyValueSettings.formatBoolean(this._control_DropDownEditableSearchTerm),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._control_DropDownEditableSearchTerm = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        OrderPad_ReviewEnabled: { id: CoreSettings.Id.OrderPad_ReviewEnabled,
            name: 'orderPad_ReviewEnabled',
            defaulter: () => TypedKeyValueSettings.formatBoolean(CoreSettings.Default.orderPad_ReviewEnabled),
            getter: () => TypedKeyValueSettings.formatBoolean(this._orderPad_ReviewEnabled),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._orderPad_ReviewEnabled = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        OrderPad_DefaultOrderTypeId: { id: CoreSettings.Id.OrderPad_DefaultOrderTypeId,
            name: 'orderPad_DefaultOrderTypeId',
            defaulter: () => TypedKeyValueSettings.formatUndefinableOrderTypeId(CoreSettings.Default.orderPad_DefaultOrderTypeId),
            getter: () => TypedKeyValueSettings.formatUndefinableOrderTypeId(this._orderPad_DefaultOrderTypeId),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._orderPad_DefaultOrderTypeId = TypedKeyValueSettings.parseUndefinableOrderTypeId(value);
            }
        },
        OrderPad_DefaultTimeInForceId: { id: CoreSettings.Id.OrderPad_DefaultTimeInForceId,
            name: 'orderPad_DefaultTimeInForceId',
            defaulter: () => TypedKeyValueSettings.formatUndefinableTimeInForceId(CoreSettings.Default.orderPad_DefaultTimeInForceId),
            getter: () => TypedKeyValueSettings.formatUndefinableTimeInForceId(this._orderPad_DefaultTimeInForceId),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._orderPad_DefaultTimeInForceId = TypedKeyValueSettings.parseUndefinableTimeInForceId(value);
            }
        },
        FontFamily: { id: CoreSettings.Id.FontFamily,
            name: 'fontFamily',
            defaulter: () => TypedKeyValueSettings.formatString(CoreSettings.Default.fontFamily),
            getter: () => TypedKeyValueSettings.formatString(this._fontFamily),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._fontFamily = TypedKeyValueSettings.parseString(value); }
        },
        FontSize: { id: CoreSettings.Id.FontSize,
            name: 'fontSize',
            defaulter: () => TypedKeyValueSettings.formatString(CoreSettings.Default.fontSize),
            getter: () => TypedKeyValueSettings.formatString(this._fontSize),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._fontSize = TypedKeyValueSettings.parseString(value); }
        },
        InstrumentMovementColorSet: { id: CoreSettings.Id.InstrumentMovementColorSet,
            name: 'instrumentMovementColorSet',
            defaulter: () => TypedKeyValueSettings.formatEnumString(CoreSettings.Default.instrumentMovementColorSet),
            getter: () => TypedKeyValueSettings.formatEnumString(this._instrumentMovementColorSet),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._instrumentMovementColorSet = TypedKeyValueSettings.parseEnumString(value); }
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
    set symbol_ExplicitDefaultParseModeId(value: TypedKeyValueSettings.EnumString) { this._symbol_ExplicitDefaultParseModeId = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_ExplicitDefaultParseModeId); }
    get symbol_PromptDefaultExchangeIfRicParseModeId() { return this._symbol_PromptDefaultExchangeIfRicParseModeId; }
    set symbol_PromptDefaultExchangeIfRicParseModeId(value: boolean) { this._symbol_PromptDefaultExchangeIfRicParseModeId = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId); }
    get symbol_DefaultExchangeId() { return this._symbol_DefaultExchangeId; }
    set symbol_DefaultExchangeId(value: TypedKeyValueSettings.EnumString) { this._symbol_DefaultExchangeId = value;
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
    set symbol_PscExchangeHideModeId(value: TypedKeyValueSettings.EnumString) { this._symbol_PscExchangeHideModeId = value;
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
    get symbol_ExplicitSearchFieldsEnabled() { return this._symbol_ExplicitSearchFieldsEnabled; }
    set symbol_ExplicitSearchFieldsEnabled(value: boolean) { this._symbol_ExplicitSearchFieldsEnabled = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_ExplicitSearchFieldsEnabled); }
    get symbol_ExplicitSearchFieldIds() { return this._symbol_ExplicitSearchFieldIds; }
    set symbol_ExplicitSearchFieldIds(value: SymbolFieldId[]) { this._symbol_ExplicitSearchFieldIds = value;
        this.notifySettingChanged(CoreSettings.Id.Symbol_ExplicitSearchFieldIds); }

    get grid_HorizontalLinesVisible() { return this._grid_HorizontalLinesVisible; }
    set grid_HorizontalLinesVisible(value) { this._grid_HorizontalLinesVisible = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_HorizontalLinesVisible); }
    get grid_VerticalLinesVisible() { return this._grid_VerticalLinesVisible; }
    set grid_VerticalLinesVisible(value) { this._grid_VerticalLinesVisible = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_VerticalLinesVisible); }
    get grid_HorizontalLineWidth() { return this._grid_HorizontalLineWidth; }
    set grid_HorizontalLineWidth(value) { this._grid_HorizontalLineWidth = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_HorizontalLineWidth); }
    get grid_VerticalLineWidth() { return this._grid_VerticalLineWidth; }
    set grid_VerticalLineWidth(value) { this._grid_VerticalLineWidth = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_VerticalLineWidth); }
    get grid_RowHeight() { return this._grid_RowHeight; }
    set grid_RowHeight(value) { this._grid_RowHeight = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_RowHeight); }
    get grid_CellPadding() { return this._grid_CellPadding; }
    set grid_CellPadding(value) { this._grid_CellPadding = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_CellPadding); }
    get grid_AllChangedRecentDuration() { return this._grid_AllChangedRecentDuration; }
    set grid_AllChangedRecentDuration(value) { this._grid_AllChangedRecentDuration = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_AllChangedRecentDuration); }
    get grid_RecordInsertedRecentDuration() { return this._grid_RecordInsertedRecentDuration; }
    set grid_RecordInsertedRecentDuration(value) { this._grid_RecordInsertedRecentDuration = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_RecordInsertedRecentDuration); }
    get grid_RecordUpdatedRecentDuration() { return this._grid_RecordUpdatedRecentDuration; }
    set grid_RecordUpdatedRecentDuration(value) { this._grid_RecordUpdatedRecentDuration = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_RecordUpdatedRecentDuration); }
    get grid_ValueChangedRecentDuration() { return this._grid_ValueChangedRecentDuration; }
    set grid_ValueChangedRecentDuration(value) { this._grid_ValueChangedRecentDuration = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ValueChangedRecentDuration); }
    get grid_FontFamily() { return this._grid_FontFamily; }
    set grid_FontFamily(value) { this._grid_FontFamily = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_FontFamily); }
    get grid_FontSize() { return this._grid_FontSize; }
    set grid_FontSize(value) { this._grid_FontSize = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_FontSize); }
    get grid_ColumnHeaderFontSize() { return this._grid_ColumnHeaderFontSize; }
    set grid_ColumnHeaderFontSize(value) { this._grid_ColumnHeaderFontSize = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ColumnHeaderFontSize); }
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
    get grid_ScrollbarThumbInactiveOpacity() { return this._grid_ScrollbarThumbInactiveOpacity; }
    set grid_ScrollbarThumbInactiveOpacity(value) { this._grid_ScrollbarThumbInactiveOpacity = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ScrollbarThumbInactiveOpacity); }
    get grid_ScrollbarsOverlayAllowed() { return this._grid_ScrollbarsOverlayAllowed; }
    set grid_ScrollbarsOverlayAllowed(value) { this._grid_ScrollbarsOverlayAllowed = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ScrollbarsOverlayAllowed); }
    get grid_ScrollbarMargin() { return this._grid_ScrollbarMargin; }
    set grid_ScrollbarMargin(value) { this._grid_ScrollbarMargin = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ScrollbarMargin); }
    get grid_ScrollHorizontallySmoothly() { return this._grid_ScrollHorizontallySmoothly; }
    set grid_ScrollHorizontallySmoothly(value) { this._grid_ScrollHorizontallySmoothly = value;
        this.notifySettingChanged(CoreSettings.Id.Grid_ScrollHorizontallySmoothly); }

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

    get control_DropDownEditableSearchTerm() { return this._control_DropDownEditableSearchTerm; }
    set control_DropDownEditableSearchTerm(value) { this._control_DropDownEditableSearchTerm = value;
        this.notifySettingChanged(CoreSettings.Id.Control_DropDownEditableSearchTerm); }

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
        Symbol_ExplicitSearchFieldsEnabled,
        Symbol_ExplicitSearchFieldIds,

        Grid_HorizontalLinesVisible,
        Grid_VerticalLinesVisible,
        Grid_HorizontalLineWidth,
        Grid_VerticalLineWidth,
        Grid_RowHeight,
        Grid_CellPadding,
        Grid_AllChangedRecentDuration,
        Grid_RecordInsertedRecentDuration,
        Grid_RecordUpdatedRecentDuration,
        Grid_ValueChangedRecentDuration,
        Grid_FontFamily,
        Grid_FontSize,
        Grid_ColumnHeaderFontSize,
        Grid_FocusedRowColored,
        Grid_FocusedRowBordered,
        Grid_FocusedRowBorderWidth,
        Grid_HorizontalScrollbarWidth,
        Grid_VerticalScrollbarWidth,
        Grid_ScrollbarThumbInactiveOpacity,
        Grid_ScrollbarsOverlayAllowed,
        Grid_ScrollbarMargin,
        Grid_ScrollHorizontallySmoothly,

        Data_InitialTradesHistoryCount,

        Format_NumberGroupingActive,
        Format_MinimumPriceFractionDigitsCount,
        Format_24Hour,
        Format_DateTimeTimezoneModeId,

        Control_DropDownEditableSearchTerm,

        OrderPad_ReviewEnabled,
        OrderPad_DefaultOrderTypeId,
        OrderPad_DefaultTimeInForceId,

        FontFamily,
        FontSize,
        InstrumentMovementColorSet,
    }

    export type InfosObject = { [id in keyof typeof Id]: TypedKeyValueSettings.Info };

    export namespace Default {
        export const symbol_DefaultParseModeAuto = true;
        export const symbol_ExplicitDefaultParseModeId: TypedKeyValueSettings.EnumString = 'ric';
        export const symbol_PromptDefaultExchangeIfRicParseModeId = false;
        export const symbol_DefaultExchangeId: TypedKeyValueSettings.EnumString = '';
        export const symbol_RicAnnouncerChar = ']';
        export const symbol_PscAnnouncerChar = '{';
        export const symbol_PscExchangeAnnouncerChar = '.';
        export const symbol_PscMarketAnnouncerChar = '@';
        export const symbol_PscExchangeHideModeId: TypedKeyValueSettings.EnumString = 'wheneverPossible';
        export const symbol_PscDefaultMarketHidden = true;
        export const symbol_PscMarketCodeAsLocalWheneverPossible = true;
        export const symbol_AutoSelectDefaultMarketDest = true;
        export const symbol_ExplicitSearchFieldsEnabled = false;
        export const symbol_ExplicitSearchFieldIds = [SymbolFieldId.Code, SymbolFieldId.Name];

        export const grid_HorizontalLinesVisible = false;
        export const grid_VerticalLinesVisible = true;
        export const grid_HorizontalLineWidth = 1;
        export const grid_VerticalLineWidth = 1;
        export const grid_RowHeight = 14;
        export const grid_CellPadding = 2;
        export const grid_AllChangedRecentDuration: SysTick.Span = 250;
        export const grid_RecordInsertedRecentDuration: SysTick.Span = 750;
        export const grid_RecordUpdatedRecentDuration: SysTick.Span = 1500;
        export const grid_ValueChangedRecentDuration: SysTick.Span = 1500;
        export const grid_FontFamily = 'Tahoma, Geneva, sans-serif';
        export const grid_FontSize = '13px';
        export const grid_ColumnHeaderFontSize = '12px';
        export const grid_FocusedRowColored = true;
        export const grid_FocusedRowBordered = false;
        export const grid_FocusedRowBorderWidth = 2;
        export const grid_HorizontalScrollbarWidth = 11;
        export const grid_VerticalScrollbarWidth = 11;
        export const grid_ScrollbarThumbInactiveOpacity = 0.2;
        export const grid_ScrollbarsOverlayAllowed = false;
        export const grid_ScrollbarMargin = 1;
        export const grid_ScrollHorizontallySmoothly = true;

        export const orderPad_ReviewEnabled = true;
        export const orderPad_DefaultOrderTypeId: OrderTypeId | undefined = undefined;
        export const orderPad_DefaultTimeInForceId: TimeInForceId | undefined = undefined;

        export const data_InitialTradesHistoryCount: Integer | undefined = undefined;
        export const format_NumberGroupingActive = false;
        export const format_MinimumPriceFractionDigitsCount = 3;
        export const format_24Hour = true;
        export const format_DateTimeTimezoneModeId = SourceTzOffsetDateTime.TimezoneModeId.Source;

        export const control_DropDownEditableSearchTerm = true;

        export const fontFamily = '\'Roboto\', Arial, \'Helvetica Neue\', Helvetica, sans-serif';
        export const fontSize = '12px';
        export const instrumentMovementColorSet: TypedKeyValueSettings.EnumString = 'American';
    }
}
