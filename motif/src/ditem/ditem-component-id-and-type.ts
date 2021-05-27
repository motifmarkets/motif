/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Type } from '@angular/core';
import { BalancesDitemNgComponent } from './balances-ditem/ng-api';
import { BrokerageAccountsDitemNgComponent } from './brokerage-accounts-ditem/ng-api';
import { BuiltinDitemFrame } from './builtin-ditem-frame';
import { DepthDitemNgComponent } from './depth-ditem/ng-api';
import { EtoPriceQuotationDitemNgComponent } from './eto-price-quotation-ditem/ng-api';
import { ExtensionsDitemNgComponent } from './extensions-ditem/ng-api';
import { HoldingsDitemNgComponent } from './holdings-ditem/ng-api';
import { NewsBodyDitemNgComponent } from './news-body-ditem/ng-api';
import { NewsHeadlinesDitemNgComponent } from './news-headlines-ditem/ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from './ng/builtin-ditem-ng-component-base.directive';
import { OrderRequestDitemNgComponent } from './order-request-ditem/ng-api';
import { OrdersDitemNgComponent } from './orders-ditem/ng-api';
import { ParidepthDitemNgComponent } from './paridepth-ditem/ng-api';
import { PlaceholderDitemNgComponent } from './placeholder-ditem/ng-api';
import { SettingsDitemNgComponent } from './settings-ditem/ng-api';
import { StatusDitemNgComponent } from './status-ditem/ng-api';
import { SymbolsDitemNgComponent } from './symbols-ditem/ng-api';
import { TopShareholdersDitemNgComponent } from './top-shareholders-ditem/ng-api';
import { TradesDitemNgComponent } from './trades-ditem/ng-api';
import { WatchlistDitemNgComponent } from './watchlist-ditem/ng-api';

export namespace DitemComponentIdAndType {
    interface IdAndType {
        readonly id: BuiltinDitemFrame.BuiltinTypeId;
        readonly type: Type<BuiltinDitemNgComponentBaseNgDirective>;
    }

    type InfosObject = { [id in keyof typeof BuiltinDitemFrame.BuiltinTypeId]: IdAndType };

    const infosObject: InfosObject = {
        Placeholder: {
            id: BuiltinDitemFrame.BuiltinTypeId.Placeholder,
            type: PlaceholderDitemNgComponent,
        },
        Extensions: {
            id: BuiltinDitemFrame.BuiltinTypeId.Extensions,
            type: ExtensionsDitemNgComponent,
        },
        Symbols: {
            id: BuiltinDitemFrame.BuiltinTypeId.Symbols,
            type: SymbolsDitemNgComponent,
        },
        DepthAndTrades: {
            id: BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades,
            type: ParidepthDitemNgComponent,
        },
        Watchlist: {
            id: BuiltinDitemFrame.BuiltinTypeId.Watchlist,
            type: WatchlistDitemNgComponent,
        },
        Depth: {
            id: BuiltinDitemFrame.BuiltinTypeId.Depth,
            type: DepthDitemNgComponent,
        },
        NewsHeadlines: {
            id: BuiltinDitemFrame.BuiltinTypeId.NewsHeadlines,
            type: NewsHeadlinesDitemNgComponent,
        },
        NewsBody: {
            id: BuiltinDitemFrame.BuiltinTypeId.NewsBody,
            type: NewsBodyDitemNgComponent,
        },
        TopShareholders: {
            id: BuiltinDitemFrame.BuiltinTypeId.TopShareholders,
            type: TopShareholdersDitemNgComponent,
        },
        Status: {
            id: BuiltinDitemFrame.BuiltinTypeId.Status,
            type: StatusDitemNgComponent,
        },
        Trades: {
            id: BuiltinDitemFrame.BuiltinTypeId.Trades,
            type: TradesDitemNgComponent,
        },
        OrderRequest: {
            id: BuiltinDitemFrame.BuiltinTypeId.OrderRequest,
            type: OrderRequestDitemNgComponent,
        },
        BrokerageAccounts: {
            id: BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts,
            type: BrokerageAccountsDitemNgComponent,
        },
        Orders: {
            id: BuiltinDitemFrame.BuiltinTypeId.Orders,
            type: OrdersDitemNgComponent,
        },
        Holdings: {
            id: BuiltinDitemFrame.BuiltinTypeId.Holdings,
            type: HoldingsDitemNgComponent,
        },
        Balances: {
            id: BuiltinDitemFrame.BuiltinTypeId.Balances,
            type: BalancesDitemNgComponent,
        },
        Settings: {
            id: BuiltinDitemFrame.BuiltinTypeId.Settings,
            type: SettingsDitemNgComponent,
        },
        EtoPriceQuotation: {
            id: BuiltinDitemFrame.BuiltinTypeId.EtoPriceQuotation,
            type: EtoPriceQuotationDitemNgComponent,
        },
    } as const;

    export const all = Object.values(infosObject);
    export const count = all.length;
}
