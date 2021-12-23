/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { InternalCommand } from '@motifmarkets/motif-core';

export namespace InternalDesktopCommand {

    export const enum Name {
        NewPlaceholderDitem = InternalCommand.Id.NewPlaceholderDitem,
        NewExtensionsDitem = InternalCommand.Id.NewExtensionsDitem,
        NewSymbolsDitem = InternalCommand.Id.NewSymbolsDitem,
        NewDepthAndTradesDitem = InternalCommand.Id.NewDepthAndTradesDitem,
        NewWatchlistDitem = InternalCommand.Id.NewWatchlistDitem,
        NewDepthDitem = InternalCommand.Id.NewDepthDitem,
        NewNewsHeadlinesDitem = InternalCommand.Id.NewNewsHeadlinesDitem,
        NewNewsBodyDitem = InternalCommand.Id.NewNewsBodyDitem,
        NewTopShareholdersDitem = InternalCommand.Id.NewTopShareholdersDitem,
        NewStatusDitem = InternalCommand.Id.NewStatusDitem,
        NewTradesDitem = InternalCommand.Id.NewTradesDitem,
        NewOrderRequestDitem = InternalCommand.Id.NewOrderRequestDitem,
        NewBrokerageAccountsDitem = InternalCommand.Id.NewBrokerageAccountsDitem,
        NewOrdersDitem = InternalCommand.Id.NewOrdersDitem,
        NewHoldingsDitem = InternalCommand.Id.NewHoldingsDitem,
        NewBalancesDitem = InternalCommand.Id.NewBalancesDitem,
        NewSettingsDitem = InternalCommand.Id.NewSettingsDitem,
        NewEtoPriceQuotationDitem = InternalCommand.Id.NewEtoPriceQuotationDitem,
        NewBuyOrderRequestDitem = InternalCommand.Id.NewBuyOrderRequestDitem,
        NewSellOrderRequestDitem = InternalCommand.Id.NewSellOrderRequestDitem,
        SaveLayout = InternalCommand.Id.SaveLayout,
        ResetLayout = InternalCommand.Id.ResetLayout,
        SignOut = InternalCommand.Id.SignOut,
    }

    export type NameUnion = keyof typeof Name;
}
