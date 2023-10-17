/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { EagerControlsNgModule } from 'controls-ng-api';
import { RecordGridNgComponent, RowDataArrayGridNgComponent } from '../adapted-revgrid/ng-api';
import {
    AdvertTickerNgComponent, AdvertWebPageNgComponent, BannerAdvertNgComponent
} from '../advert/ng-api';
import { BalancesNgComponent } from '../balances/ng-api';
import { BrokerageAccountsNgComponent } from '../brokerage-accounts/ng-api';
import { CashHoldingsNgComponent } from '../cash-holdings/ng-api';
import { ColorControlsNgComponent } from '../color-controls/ng-api';
import { ColorSchemeGridNgComponent } from '../color-scheme-grid/ng-api';
import { ColorSchemeItemPropertiesNgComponent } from '../color-scheme-item-properties/ng-api';
import { ColorSchemePresetCodeNgComponent } from '../color-scheme-preset-code/ng-api';
import { DelayedBadnessNgComponent } from '../delayed-badness/ng-api';
import { DepthAndSalesGridLayoutsDialogNgComponent } from '../depth-and-sales-grid-layouts-dialog/ng-api';
import { DepthGridLayoutsDialogNgComponent } from '../depth-grid-layouts-dialog/ng-api';
import { DepthSideNgComponent } from '../depth-side/ng-api';
import { DepthNgComponent } from '../depth/ng-api';
import { ExchangeSettingsNgComponent } from '../exchange-settings/ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../expandable-collapsible-lined-heading/ng-api';
import {
    AvailableExtensionListNgComponent,
    ExtensionDetailNgComponent,
    ExtensionListInfoItemNgComponent,
    ExtensionListRegisteredItemNgComponent,
    ExtensionListsNgComponent,
    ExtensionsSearchNgComponent,
    ExtensionsSidebarNgComponent,
    InstalledExtensionListNgComponent
} from '../extensions/ng-api';
import { FeedsNgComponent } from '../feeds/ng-api';
import {
    GridLayoutDialogNgComponent,
    GridLayoutEditorAllowedFieldsNgComponent,
    GridLayoutEditorColumnsNgComponent,
    GridLayoutEditorFieldControlsNgComponent,
    GridLayoutEditorNgComponent,
    GridLayoutEditorSearchGridNgComponent
} from '../grid-layout-dialog/ng-api';
import { HoldingsGridLayoutsDialogNgComponent } from '../holdings-grid-layouts-dialog/ng-api';
import { HoldingsNgComponent } from '../holdings/ng-api';
import { IvemHoldingsNgComponent } from '../ivem-holdings/ng-api';
import { MarketsNgComponent } from '../markets/ng-api';
import { MultiColorPickerNgComponent } from '../multi-color-picker/ng/multi-color-picker-ng.component';
import { NameableGridLayoutEditorDialogNgComponent } from '../nameable-grid-layout-editor-dialog/ng-api';
import { OpenWatchlistDialogNgComponent } from '../open-watchlist/ng-api';
import { OrderAuthoriseNgComponent } from '../order-authorise/ng-api';
import {
    PadOrderRequestStepNgComponent,
    ResultOrderRequestStepNgComponent,
    ReviewAmendOrderRequestNgComponent,
    ReviewCancelOrderRequestNgComponent,
    ReviewMoveOrderRequestNgComponent,
    ReviewOrderRequestStepNgComponent,
    ReviewOrderRequestZenithMessageNgComponent,
    ReviewPlaceOrderRequestNgComponent
} from '../order-request-step/ng-api';
import { OrdersNgComponent } from '../orders/ng-api';
import { SaveWatchlistDialogNgComponent } from '../save-watchlist/dialog/ng-api';
import {
    CriteriaScanPropertiesSectionNgComponent,
    GeneralScanPropertiesSectionNgComponent,
    NotifiersScanPropertiesSectionNgComponent,
    ScanListNgComponent,
    ScanNewNgComponent,
    ScanPropertiesNgComponent,
    ScanTypeDescriptionNgComponent,
    ScanTypesControlsNgComponent,
    ScanTypesGridNgComponent,
    ScansNgComponent,
    TargetsScanPropertiesNgComponent,
    ZenithScanCriteriaViewNgComponent
} from '../scan/ng-api';
import { SearchSymbolsConditionNgComponent } from '../search-symbols-condition/ng-api';
import { SearchSymbolsNgComponent } from '../search-symbols/ng-api';
import { ExchangesSettingsNgComponent } from '../settings/exchanges-settings/ng-api';
import {
    ColorSettingsNgComponent,
    GeneralSettingsNgComponent,
    GridSettingsNgComponent,
    OrderPadSettingsNgComponent
} from '../settings/ng-api';
import { StaticInitialise } from '../static-initialise';
import { StatusSummaryNgComponent } from '../status-summary/ng-api';
import { TradesNgComponent } from '../trades/ng-api';
import { WatchlistNgComponent } from '../watchlist/ng-api';
import { ZenithStatusNgComponent } from '../zenith-status/ng-api';

@NgModule({
    declarations: [
        BalancesNgComponent,
        BrokerageAccountsNgComponent,
        CashHoldingsNgComponent,
        ColorSchemeGridNgComponent,
        ColorSchemeItemPropertiesNgComponent,
        ColorSchemePresetCodeNgComponent,
        ColorControlsNgComponent,
        GridLayoutDialogNgComponent,
        NameableGridLayoutEditorDialogNgComponent,
        DelayedBadnessNgComponent,
        DepthNgComponent,
        DepthGridLayoutsDialogNgComponent,
        DepthSideNgComponent,
        FeedsNgComponent,
        GridLayoutEditorNgComponent,
        GridLayoutEditorAllowedFieldsNgComponent,
        GridLayoutEditorColumnsNgComponent,
        GridLayoutEditorFieldControlsNgComponent,
        GridLayoutEditorSearchGridNgComponent,
        HoldingsNgComponent,
        HoldingsGridLayoutsDialogNgComponent,
        IvemHoldingsNgComponent,
        MarketsNgComponent,
        OrdersNgComponent,
        OrderAuthoriseNgComponent,
        PadOrderRequestStepNgComponent,
        ResultOrderRequestStepNgComponent,
        DepthAndSalesGridLayoutsDialogNgComponent,
        ColorSettingsNgComponent,
        GeneralSettingsNgComponent,
        GridSettingsNgComponent,
        StatusSummaryNgComponent,
        TradesNgComponent,
        ZenithStatusNgComponent,
        OrderPadSettingsNgComponent,
        ReviewOrderRequestStepNgComponent,
        ReviewPlaceOrderRequestNgComponent,
        ReviewAmendOrderRequestNgComponent,
        ReviewCancelOrderRequestNgComponent,
        ReviewMoveOrderRequestNgComponent,
        ReviewOrderRequestZenithMessageNgComponent,
        SearchSymbolsNgComponent,
        ExtensionsSidebarNgComponent,
        ExtensionListsNgComponent,
        InstalledExtensionListNgComponent,
        AvailableExtensionListNgComponent,
        ExtensionListInfoItemNgComponent,
        ExtensionDetailNgComponent,
        ExtensionsSearchNgComponent,
        ExtensionListRegisteredItemNgComponent,
        RecordGridNgComponent,
        MultiColorPickerNgComponent,
        ExchangesSettingsNgComponent,
        ExchangeSettingsNgComponent,
        SearchSymbolsConditionNgComponent,
        BannerAdvertNgComponent,
        AdvertWebPageNgComponent,
        AdvertTickerNgComponent,
        RowDataArrayGridNgComponent,
        ScansNgComponent,
        ScanPropertiesNgComponent,
        GeneralScanPropertiesSectionNgComponent,
        ScanNewNgComponent,
        ScanListNgComponent,
        ScanTypesGridNgComponent,
        ScanTypesControlsNgComponent,
        ScanTypeDescriptionNgComponent,
        TargetsScanPropertiesNgComponent,
        NotifiersScanPropertiesSectionNgComponent,
        CriteriaScanPropertiesSectionNgComponent,
        ExpandableCollapsibleLinedHeadingNgComponent,
        ZenithScanCriteriaViewNgComponent,
        OpenWatchlistDialogNgComponent,
        SaveWatchlistDialogNgComponent,
        WatchlistNgComponent,
    ],
    exports: [
        AdvertTickerNgComponent,
        AdvertWebPageNgComponent,
        BannerAdvertNgComponent,
        BalancesNgComponent,
        BrokerageAccountsNgComponent,
        DelayedBadnessNgComponent,
        DepthNgComponent,
        DepthGridLayoutsDialogNgComponent,
        ExtensionsSidebarNgComponent,
        ExtensionDetailNgComponent,
        FeedsNgComponent,
        GridLayoutEditorNgComponent,
        GridLayoutDialogNgComponent,
        HoldingsNgComponent,
        HoldingsGridLayoutsDialogNgComponent,
        NameableGridLayoutEditorDialogNgComponent,
        MarketsNgComponent,
        OrdersNgComponent,
        OrderAuthoriseNgComponent,
        PadOrderRequestStepNgComponent,
        ReviewOrderRequestStepNgComponent,
        ResultOrderRequestStepNgComponent,
        SearchSymbolsNgComponent,
        DepthAndSalesGridLayoutsDialogNgComponent,
        ColorSettingsNgComponent,
        GeneralSettingsNgComponent,
        GridSettingsNgComponent,
        StatusSummaryNgComponent,
        TradesNgComponent,
        ZenithStatusNgComponent,
        RowDataArrayGridNgComponent,
        ScansNgComponent,
        OpenWatchlistDialogNgComponent,
        SaveWatchlistDialogNgComponent,
        WatchlistNgComponent,
    ],
    imports: [
        CommonModule,
        AngularSplitModule,
        EagerControlsNgModule
    ]
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EagerContentNgModule {
    constructor() {
        StaticInitialise.initialise();
    }
}
