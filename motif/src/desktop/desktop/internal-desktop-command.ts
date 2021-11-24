/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { InternalCommand } from 'core-internal-api';

export namespace InternalDesktopCommand {

    export const enum Name {
        NewPlaceholderDitem = InternalCommand.Name.NewPlaceholderDitem,
        NewExtensionsDitem = InternalCommand.Name.NewExtensionsDitem,
        NewSymbolsDitem = InternalCommand.Name.NewSymbolsDitem,
        NewDepthAndTradesDitem = InternalCommand.Name.NewDepthAndTradesDitem,
        NewWatchlistDitem = InternalCommand.Name.NewWatchlistDitem,
        NewDepthDitem = InternalCommand.Name.NewDepthDitem,
        NewNewsHeadlinesDitem = InternalCommand.Name.NewNewsHeadlinesDitem,
        NewNewsBodyDitem = InternalCommand.Name.NewNewsBodyDitem,
        NewTopShareholdersDitem = InternalCommand.Name.NewTopShareholdersDitem,
        NewStatusDitem = InternalCommand.Name.NewStatusDitem,
        NewTradesDitem = InternalCommand.Name.NewTradesDitem,
        NewOrderRequestDitem = InternalCommand.Name.NewOrderRequestDitem,
        NewBrokerageAccountsDitem = InternalCommand.Name.NewBrokerageAccountsDitem,
        NewOrdersDitem = InternalCommand.Name.NewOrdersDitem,
        NewHoldingsDitem = InternalCommand.Name.NewHoldingsDitem,
        NewBalancesDitem = InternalCommand.Name.NewBalancesDitem,
        NewSettingsDitem = InternalCommand.Name.NewSettingsDitem,
        NewEtoPriceQuotationDitem = InternalCommand.Name.NewEtoPriceQuotationDitem,
        NewBuyOrderRequestDitem = InternalCommand.Name.NewBuyOrderRequestDitem,
        NewSellOrderRequestDitem = InternalCommand.Name.NewSellOrderRequestDitem,
        SaveLayout = InternalCommand.Name.SaveLayout,
        ResetLayout = InternalCommand.Name.ResetLayout,
        SignOut = InternalCommand.Name.SignOut,
    }

    export type NameUnion = keyof typeof Name;
}
