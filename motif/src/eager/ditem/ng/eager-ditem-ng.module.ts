/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { EagerContentNgModule } from 'content-ng-api';
import { EagerControlsNgModule } from 'controls-ng-api';
import { AlertsDitemNgComponent } from '../alerts-ditem/ng-api';
import { BalancesDitemNgComponent } from '../balances-ditem/ng-api';
import { BrokerageAccountsDitemNgComponent } from '../brokerage-accounts-ditem/ng-api';
import { DepthAndSalesDitemNgComponent } from '../depth-and-sales-ditem/ng-api';
import { DepthDitemNgComponent } from '../depth-ditem/ng-api';
import { DiagnosticsDitemNgComponent } from '../diagnostics-ditem/ng-api';
import { EtoPriceQuotationDitemNgComponent } from '../eto-price-quotation-ditem/ng-api';
import { ExtensionsDitemNgComponent } from '../extensions-ditem/ng-api';
import { HoldingsDitemNgComponent } from '../holdings-ditem/ng-api';
import { NewsBodyDitemNgComponent } from '../news-body-ditem/ng-api';
import { NewsHeadlinesDitemNgComponent } from '../news-headlines-ditem/ng-api';
import { NotificationChannelsDitemNgComponent } from '../notification-channels-ditem/ng-api';
import { OrderAuthoriseDitemNgComponent } from '../order-authorise-ditem/ng-api';
import { OrderRequestDitemNgComponent } from '../order-request-ditem/ng-api';
import { OrdersDitemNgComponent } from '../orders-ditem/ng-api';
import { PlaceholderDitemNgComponent } from '../placeholder-ditem/ng-api';
import { ScansDitemNgComponent } from '../scans-ditem/ng-api';
import { SearchDitemNgComponent } from '../search-ditem/ng-api';
import { SearchSymbolsDitemNgComponent } from '../search-symbols-ditem/ng-api';
import { SettingsDitemNgComponent } from '../settings-ditem/ng-api';
import { StaticInitialise } from '../static-initialise';
import { StatusDitemNgComponent } from '../status-ditem/ng-api';
import { TopShareholdersDitemNgComponent } from '../top-shareholders-ditem/ng-api';
import { TradesDitemNgComponent } from '../trades-ditem/ng-api';
import { WatchlistDitemNgComponent } from '../watchlist-ditem/ng-api';
import { AdvertWebPageDitemNgComponent, BrandingSplashWebPageDitemNgComponent } from '../web-page-ditem/ng-api';

@NgModule({
    declarations: [
        AdvertWebPageDitemNgComponent,
        AlertsDitemNgComponent,
        BalancesDitemNgComponent,
        BrandingSplashWebPageDitemNgComponent,
        BrokerageAccountsDitemNgComponent,
        DepthAndSalesDitemNgComponent,
        DepthDitemNgComponent,
        DiagnosticsDitemNgComponent,
        EtoPriceQuotationDitemNgComponent,
        ExtensionsDitemNgComponent,
        HoldingsDitemNgComponent,
        NewsBodyDitemNgComponent,
        NewsHeadlinesDitemNgComponent,
        NotificationChannelsDitemNgComponent,
        OrderAuthoriseDitemNgComponent,
        OrderRequestDitemNgComponent,
        OrdersDitemNgComponent,
        PlaceholderDitemNgComponent,
        ScansDitemNgComponent,
        SearchDitemNgComponent,
        SearchSymbolsDitemNgComponent,
        SettingsDitemNgComponent,
        StatusDitemNgComponent,
        TopShareholdersDitemNgComponent,
        TradesDitemNgComponent,
        WatchlistDitemNgComponent,
    ],
    imports: [
        CommonModule,
        EagerControlsNgModule,
        EagerContentNgModule,
        AngularSplitModule,
    ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerDitemNgModule {
    constructor() {
        StaticInitialise.initialise();
    }
}
