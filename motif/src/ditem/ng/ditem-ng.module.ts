/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { ContentNgModule } from 'src/content/ng-api';
import { ControlsNgModule } from 'src/controls/ng-api';
import { BalancesDitemNgComponent } from '../balances-ditem/ng-api';
import { BrokerageAccountsDitemNgComponent } from '../brokerage-accounts-ditem/ng-api';
import { DepthDitemNgComponent } from '../depth-ditem/ng-api';
import { EtoPriceQuotationDitemNgComponent } from '../eto-price-quotation-ditem/ng-api';
import { ExtensionsDitemNgComponent } from '../extensions-ditem/ng-api';
import { HoldingsDitemNgComponent } from '../holdings-ditem/ng-api';
import { NewsBodyDitemNgComponent } from '../news-body-ditem/ng-api';
import { NewsHeadlinesDitemNgComponent } from '../news-headlines-ditem/ng-api';
import { OrderRequestDitemNgComponent } from '../order-request-ditem/ng-api';
import { OrdersDitemNgComponent } from '../orders-ditem/ng-api';
import { ParidepthDitemNgComponent } from '../paridepth-ditem/ng-api';
import { PlaceholderDitemNgComponent } from '../placeholder-ditem/ng-api';
import { SettingsDitemNgComponent } from '../settings-ditem/ng-api';
import { StaticInitialise } from '../static-initialise';
import { StatusDitemNgComponent } from '../status-ditem/ng-api';
import { SearchSymbolsDitemNgComponent } from '../search-symbols-ditem/ng-api';
import { TopShareholdersDitemNgComponent } from '../top-shareholders-ditem/ng-api';
import { TradesDitemNgComponent } from '../trades-ditem/ng-api';
import { WatchlistDitemNgComponent } from '../watchlist-ditem/ng-api';
import { BrandingSplashWebPageDitemNgComponent } from '../web-page-ditem/ng-api';

@NgModule({
    declarations: [
        BalancesDitemNgComponent,
        BrokerageAccountsDitemNgComponent,
        DepthDitemNgComponent,
        EtoPriceQuotationDitemNgComponent,
        HoldingsDitemNgComponent,
        NewsBodyDitemNgComponent,
        NewsHeadlinesDitemNgComponent,
        OrderRequestDitemNgComponent,
        OrdersDitemNgComponent,
        ParidepthDitemNgComponent,
        PlaceholderDitemNgComponent,
        StatusDitemNgComponent,
        SearchSymbolsDitemNgComponent,
        SettingsDitemNgComponent,
        TopShareholdersDitemNgComponent,
        TradesDitemNgComponent,
        WatchlistDitemNgComponent,
        ExtensionsDitemNgComponent,
        BrandingSplashWebPageDitemNgComponent
    ],
    imports: [
        CommonModule,
        ControlsNgModule,
        ContentNgModule,
        AngularSplitModule,
    ],
})
export class DitemNgModule {
    constructor() {
        StaticInitialise.initialise();
    }
}
