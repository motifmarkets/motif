/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from 'src/sys/internal-api';
import { Command } from './command';

export interface InternalCommand extends Command {
    readonly name: InternalCommand.Name;
}

export namespace InternalCommand {
    export const enum Name {
        Null = 'Null',
        Missing = 'Missing',
        // // Menu
        // ChildMenu = 'ChildMenu',
        // MenuDivider = 'MenuDivider',

        CommandParametersExecute = 'CommandParametersExecute',

        LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed = 'LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed',
        RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed = 'RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed',

        // Ditem
        ToggleSymbolLinking = 'ToggleSymbolLinking',
        SetSymbolLinking = 'SetSymbolLinking',
        ToggleAccountLinking = 'ToggleAccountLinking',
        SetAccountLinking = 'SetAccountLinking',
        // Content
        ApplySymbol = 'ApplySymbol',
        SelectGridColumns = 'SelectGridColumns',
        AutoSizeGridColumnWidths = 'AutoSizeGridColumnWidths',
        // Desktop
        NewPlaceholderDitem = 'NewPlaceholderDitem',
        NewExtensionsDitem = 'NewExtensionsDitem',
        NewSymbolsDitem = 'NewSymbolsDitem',
        NewDepthAndTradesDitem = 'NewDepthAndTradesDitem',
        NewWatchlistDitem = 'NewWatchlistDitem',
        NewDepthDitem = 'NewDepthDitem',
        NewNewsHeadlinesDitem = 'NewNewsHeadlinesDitem',
        NewNewsBodyDitem = 'NewNewsBodyDitem',
        NewTopShareholdersDitem = 'NewTopShareholdersDitem',
        NewStatusDitem = 'NewStatusDitem',
        NewTradesDitem = 'NewTradesDitem',
        NewOrderRequestDitem = 'NewOrderRequestDitem',
        NewBrokerageAccountsDitem = 'NewBrokerageAccountsDitem',
        NewOrdersDitem = 'NewOrdersDitem',
        NewHoldingsDitem = 'NewHoldingsDitem',
        NewBalancesDitem = 'NewBalancesDitem',
        NewSettingsDitem = 'NewSettingsDitem',
        NewEtoPriceQuotationDitem = 'NewEtoPriceQuotationDitem',
        NewBuyOrderRequestDitem = 'NewBuyOrderRequestDitem',
        NewSellOrderRequestDitem = 'NewSellOrderRequestDitem',
        SaveLayout = 'SaveLayout',
        ResetLayout = 'ResetLayout',
        SignOut = 'SignOut',
        // SignedOut component
        SignInAgain = 'SignInAgain',

        ColorSelector_Lighten = 'ColorSelector_Lighten',
        ColorSelector_Darken = 'ColorSelector_Darken',
        ColorSelector_Brighten = 'ColorSelector_Brighten',
        ColorSelector_Complement = 'ColorSelector_Complement',
        ColorSelector_Saturate = 'ColorSelector_Saturate',
        ColorSelector_Desaturate = 'ColorSelector_Desaturate',
        ColorSelector_Spin = 'ColorSelector_Spin',
        ColorSelector_Copy = 'ColorSelector_Copy',

        ColorSettings_SaveScheme = 'ColorSettings_SaveScheme',

        ContentGridLayoutEditor_Ok = 'ContentGridLayoutEditor_Ok',
        ContentGridLayoutEditor_Cancel = 'ContentGridLayoutEditor_Cancel',

        Watchlist_DeleteSymbol = 'Watchlist_DeleteSymbol',
        Watchlist_New = 'Watchlist_New',
        Watchlist_Open = 'Watchlist_Open',
        Watchlist_Save = 'Watchlist_Save',

        DepthGridsLayoutEditor_BidDepth = 'DepthGridsLayoutEditor_BidDepth',
        DepthGridsLayoutEditor_AskDepth = 'DepthGridsLayoutEditor_AskDepth',
        DepthGridsLayoutEditor_Ok = 'DepthGridsLayoutEditor_Ok',
        DepthGridsLayoutEditor_Cancel = 'DepthGridsLayoutEditor_Cancel',

        PariDepthGridsLayoutEditor_BidDepth = 'PariDepthGridsLayoutEditor_BidDepth',
        PariDepthGridsLayoutEditor_AskDepth = 'PariDepthGridsLayoutEditor_AskDepth',
        PariDepthGridsLayoutEditor_Watchlist = 'PariDepthGridsLayoutEditor_Watchlist',
        PariDepthGridsLayoutEditor_Trades = 'PariDepthGridsLayoutEditor_Trades',
        PariDepthGridsLayoutEditor_Ok = 'PariDepthGridsLayoutEditor_Ok',
        PariDepthGridsLayoutEditor_Cancel = 'PariDepthGridsLayoutEditor_Cancel',

        GridLayoutEditor_CancelSearch = 'GridLayoutEditor_CancelSearch',
        GridLayoutEditor_SearchNext = 'GridLayoutEditor_SearchNext',
        GridLayoutEditor_MoveUp = 'GridLayoutEditor_MoveUp',
        GridLayoutEditor_MoveTop = 'GridLayoutEditor_MoveTop',
        GridLayoutEditor_MoveDown = 'GridLayoutEditor_MoveDown',
        GridLayoutEditor_MoveBottom = 'GridLayoutEditor_MoveBottom',

        ColorSchemePresetCode_Ok = 'ColorSchemePresetCode_Ok',
        ColorSchemePresetCode_CopyToClipboard = 'ColorSchemePresetCode_CopyToClipboard',

        Symbols_Query = 'Symbols_Query',
        Symbols_Subscribe = 'Symbols_Subscribe',
        Symbols_NextPage = 'Symbols_NextPage',

        Depth_Rollup = 'Depth_Rollup',
        Depth_Expand = 'Depth_Expand',
        Depth_Filter = 'Depth_Filter',

        TopShareholders_TodayMode = 'TopShareholders_TodayMode',
        TopShareholders_HistoricalMode = 'TopShareholders_HistoricalMode',
        TopShareholders_CompareMode = 'TopShareholders_CompareMode',
        TopShareholders_DetailsMode = 'TopShareholders_DetailsMode',
        TopShareholders_Compare = 'TopShareholders_Compare',

        OrderRequest_New = 'OrderRequest_New',
        OrderRequest_Back = 'OrderRequest_Back',
        OrderRequest_Review = 'OrderRequest_Review',
        OrderRequest_Send = 'OrderRequest_Send',
        OrderRequest_TogglePrimary = 'OrderRequest_TogglePrimary',

        BuyOrderPad = 'BuyOrderPad',
        SellOrderPad = 'SellOrderPad',
        AmendOrderPad = 'AmendOrderPad',
        CancelOrderPad = 'CancelOrderPad',
        MoveOrderPad = 'MoveOrderPad',

        EtoPriceQuotation_ApplySymbol = 'EtoPriceQuotation_ApplySymbol',
    }

    export type NameUnion = keyof typeof Name;

    // InfosObject is just used to check for typos in Name enum
    type InfosObject = { [name in keyof typeof Name]: Name };

    const infosObject: InfosObject = {
        Null: Name.Null,
        Missing: Name.Missing,
        // ChildMenu: Name.ChildMenu,
        // MenuDivider: Name.MenuDivider,
        CommandParametersExecute: Name.CommandParametersExecute,
        LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed: Name.LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed,
        RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed: Name.RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed,
        ToggleSymbolLinking: Name.ToggleSymbolLinking,
        SetSymbolLinking: Name.SetSymbolLinking,
        ToggleAccountLinking: Name.ToggleAccountLinking,
        SetAccountLinking: Name.SetAccountLinking,
        ApplySymbol: Name.ApplySymbol,
        SelectGridColumns: Name.SelectGridColumns,
        AutoSizeGridColumnWidths: Name.AutoSizeGridColumnWidths,
        NewPlaceholderDitem: Name.NewPlaceholderDitem,
        NewExtensionsDitem: Name.NewExtensionsDitem,
        NewSymbolsDitem: Name.NewSymbolsDitem,
        NewDepthAndTradesDitem: Name.NewDepthAndTradesDitem,
        NewWatchlistDitem: Name.NewWatchlistDitem,
        NewDepthDitem: Name.NewDepthDitem,
        NewNewsHeadlinesDitem: Name.NewNewsHeadlinesDitem,
        NewNewsBodyDitem: Name.NewNewsBodyDitem,
        NewTopShareholdersDitem: Name.NewTopShareholdersDitem,
        NewStatusDitem: Name.NewStatusDitem,
        NewTradesDitem: Name.NewTradesDitem,
        NewOrderRequestDitem: Name.NewOrderRequestDitem,
        NewBrokerageAccountsDitem: Name.NewBrokerageAccountsDitem,
        NewOrdersDitem: Name.NewOrdersDitem,
        NewHoldingsDitem: Name.NewHoldingsDitem,
        NewBalancesDitem: Name.NewBalancesDitem,
        NewSettingsDitem: Name.NewSettingsDitem,
        NewEtoPriceQuotationDitem: Name.NewEtoPriceQuotationDitem,
        NewBuyOrderRequestDitem: Name.NewBuyOrderRequestDitem,
        NewSellOrderRequestDitem: Name.NewSellOrderRequestDitem,
        SaveLayout: Name.SaveLayout,
        ResetLayout: Name.ResetLayout,
        SignOut: Name.SignOut,
        SignInAgain: Name.SignInAgain,
        ColorSelector_Lighten: Name.ColorSelector_Lighten,
        ColorSelector_Darken: Name.ColorSelector_Darken,
        ColorSelector_Brighten: Name.ColorSelector_Brighten,
        ColorSelector_Complement: Name.ColorSelector_Complement,
        ColorSelector_Saturate: Name.ColorSelector_Saturate,
        ColorSelector_Desaturate: Name.ColorSelector_Desaturate,
        ColorSelector_Spin: Name.ColorSelector_Spin,
        ColorSelector_Copy: Name.ColorSelector_Copy,
        ColorSettings_SaveScheme: Name.ColorSettings_SaveScheme,
        ContentGridLayoutEditor_Ok: Name.ContentGridLayoutEditor_Ok,
        ContentGridLayoutEditor_Cancel: Name.ContentGridLayoutEditor_Cancel,
        Watchlist_DeleteSymbol: Name.Watchlist_DeleteSymbol,
        Watchlist_New: Name.Watchlist_New,
        Watchlist_Open: Name.Watchlist_Open,
        Watchlist_Save: Name.Watchlist_Save,
        DepthGridsLayoutEditor_BidDepth: Name.DepthGridsLayoutEditor_BidDepth,
        DepthGridsLayoutEditor_AskDepth: Name.DepthGridsLayoutEditor_AskDepth,
        DepthGridsLayoutEditor_Ok: Name.DepthGridsLayoutEditor_Ok,
        DepthGridsLayoutEditor_Cancel: Name.DepthGridsLayoutEditor_Cancel,
        PariDepthGridsLayoutEditor_BidDepth: Name.PariDepthGridsLayoutEditor_BidDepth,
        PariDepthGridsLayoutEditor_AskDepth: Name.PariDepthGridsLayoutEditor_AskDepth,
        PariDepthGridsLayoutEditor_Watchlist: Name.PariDepthGridsLayoutEditor_Watchlist,
        PariDepthGridsLayoutEditor_Trades: Name.PariDepthGridsLayoutEditor_Trades,
        PariDepthGridsLayoutEditor_Ok: Name.PariDepthGridsLayoutEditor_Ok,
        PariDepthGridsLayoutEditor_Cancel: Name.PariDepthGridsLayoutEditor_Cancel,
        GridLayoutEditor_CancelSearch: Name.GridLayoutEditor_CancelSearch,
        GridLayoutEditor_SearchNext: Name.GridLayoutEditor_SearchNext,
        GridLayoutEditor_MoveUp: Name.GridLayoutEditor_MoveUp,
        GridLayoutEditor_MoveTop: Name.GridLayoutEditor_MoveTop,
        GridLayoutEditor_MoveDown: Name.GridLayoutEditor_MoveDown,
        GridLayoutEditor_MoveBottom: Name.GridLayoutEditor_MoveBottom,
        ColorSchemePresetCode_Ok: Name.ColorSchemePresetCode_Ok,
        ColorSchemePresetCode_CopyToClipboard: Name.ColorSchemePresetCode_CopyToClipboard,
        Symbols_Query: Name.Symbols_Query,
        Symbols_Subscribe: Name.Symbols_Subscribe,
        Symbols_NextPage: Name.Symbols_NextPage,
        Depth_Rollup: Name.Depth_Rollup,
        Depth_Expand: Name.Depth_Expand,
        Depth_Filter: Name.Depth_Filter,
        TopShareholders_TodayMode: Name.TopShareholders_TodayMode,
        TopShareholders_HistoricalMode: Name.TopShareholders_HistoricalMode,
        TopShareholders_CompareMode: Name.TopShareholders_CompareMode,
        TopShareholders_DetailsMode: Name.TopShareholders_DetailsMode,
        TopShareholders_Compare: Name.TopShareholders_Compare,
        OrderRequest_New: Name.OrderRequest_New,
        OrderRequest_Back: Name.OrderRequest_Back,
        OrderRequest_Review: Name.OrderRequest_Review,
        OrderRequest_Send: Name.OrderRequest_Send,
        OrderRequest_TogglePrimary: Name.OrderRequest_TogglePrimary,
        BuyOrderPad: Name.BuyOrderPad,
        SellOrderPad: Name.SellOrderPad,
        AmendOrderPad: Name.AmendOrderPad,
        CancelOrderPad: Name.CancelOrderPad,
        MoveOrderPad: Name.MoveOrderPad,
        EtoPriceQuotation_ApplySymbol: Name.EtoPriceQuotation_ApplySymbol,
    } as const;

    export function initialise() {
        const keys = Object.keys(infosObject);
        const values = Object.values(infosObject);
        const count = keys.length;
        for (let i = 0; i < count; i++) {
            if (keys[i] !== values[i]) {
                throw new AssertInternalError('ICI300918843', i.toString());
            }
        }
    }
}

export namespace InternalCommandModule {
    export function initialiseStatic() {
        InternalCommand.initialise();
    }
}
