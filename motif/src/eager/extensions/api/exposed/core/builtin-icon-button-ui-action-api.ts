/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ButtonUiAction } from './button-ui-action-api';

/** @public */
export interface BuiltinIconButtonUiAction extends ButtonUiAction {
    readonly iconId: BuiltinIconButtonUiAction.IconId | undefined;

    pushIcon(iconId: BuiltinIconButtonUiAction.IconId): void;
}

/** @public */
export namespace BuiltinIconButtonUiAction {
    export const enum IconIdEnum {
        Blankest = 'Blankest',
        PrimaryDitemFrame = 'PrimaryDitemFrame',
        SymbolLink = 'SymbolLink',
        AccountGroupLink = 'AccountGroupLink',
        SubWindowReturn = 'SubWindowReturn',
        CopyToClipboard = 'CopyToClipboard',
        Execute = 'Execute',
        BuyOrderPad = 'BuyOrderPad',
        SellOrderPad = 'SellOrderPad',
        AmendOrderPad = 'AmendOrderPad',
        CancelOrderPad = 'CancelOrderPad',
        MoveOrderPad = 'MoveOrderPad',
        SelectColumns = 'SelectColumns',
        AutoSizeColumnWidths = 'AutoSizeColumnWidths',
        RollUp = 'RollUp',
        RollDown = 'RollDown',
        Filter = 'Filter',
        Save = 'Save',
        DeleteSymbol = 'DeleteSymbol',
        NewWatchlist = 'NewWatchlist',
        OpenWatchlist = 'OpenWatchlist',
        SaveWatchlist = 'SaveWatchlist',
        Lighten = 'Lighten',
        Darken = 'Darken',
        Brighten = 'Brighten',
        Complement = 'Complement',
        Saturate = 'Saturate',
        Desaturate = 'Desaturate',
        SpinColor = 'SpinColor',
        CopyColor = 'CopyColor',
        ReturnOk = 'ReturnOk',
        ReturnCancel = 'ReturnCancel',
        SearchNext = 'SearchNext',
        CancelSearch = 'CancelSearch',
        MoveUp = 'MoveUp',
        MoveToTop = 'MoveToTop',
        MoveDown = 'MoveDown',
        MoveToBottom = 'MoveToBottom',
        NotHistorical = 'NotHistorical',
        Historical = 'Historical',
        HistoricalCompare = 'HistoricalCompare',
        Details = 'Details',
        ToggleSearchTermNotExchangedMarketProcessed = 'ToggleSearchTermNotExchangedMarketProcessed',
        ExpandVertically = 'ExpandVertically',
        RestoreVertically = 'RestoreVertically',
        CollapseVertically ='CollapseVertically',
        MarkAll = 'MarkAll',
        InsertIntoListFromLeft = 'InsertIntoListFromLeft',
        RemoveFromListToLeft = 'RemoveFromListToLeft',
        RemoveSelectedFromList = 'RemoveSelectedFromList',
        EnlargeToTopLeft = 'EnlargeToTopLeft',
        Dot = 'Dot',
        Exclamation = 'Exclamation',
        Delete = 'Delete',
    }

    export type IconId = keyof typeof IconIdEnum;
}
