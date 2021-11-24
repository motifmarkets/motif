/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { ControlsNgModule } from 'controls-ng-api';
import { CashHoldingsNgComponent } from '../cash-holdings/ng-api';
import { ColorControlsNgComponent } from '../color-controls/ng-api';
import { ColorSchemeGridNgComponent } from '../color-scheme-grid/ng-api';
import { ColorSchemeItemPropertiesNgComponent } from '../color-scheme-item-properties/ng-api';
import { ColorSchemePresetCodeNgComponent } from '../color-scheme-preset-code/ng-api';
import { ContentGridLayoutEditorNgComponent } from '../content-grid-layout-editor/ng-api';
import { DelayedBadnessNgComponent } from '../delayed-badness/ng-api';
import { DepthGridLayoutsEditorNgComponent } from '../depth-grid-layouts-editor/ng-api';
import { DepthSideNgComponent } from '../depth-side/ng-api';
import { DepthNgComponent } from '../depth/ng-api';
import { ExchangeSettingsNgComponent } from '../exchange-settings/ng-api';
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
import { GridColumnPropertiesNgComponent } from '../grid-column-properties/ng-api';
import { GridLayoutEditorGridNgComponent } from '../grid-layout-editor-grid/ng-api';
import { GridLayoutEditorNgComponent } from '../grid-layout-editor/ng-api';
import { IvemHoldingsNgComponent } from '../ivem-holdings/ng-api';
import { MarketsNgComponent } from '../markets/ng-api';
import { MotifGridNgComponent } from '../motif-grid/ng-api';
import { MultiColorPickerNgComponent } from '../multi-color-picker/ng/multi-color-picker-ng.component';
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
import { ParidepthGridLayoutsEditorNgComponent } from '../paridepth-grid-layouts-editor/ng-api';
import { SearchSymbolsConditionNgComponent } from '../search-symbols-condition/ng-api';
import { ExchangesSettingsNgComponent } from '../settings/exchanges-settings/ng-api';
import {
    ColorSettingsNgComponent,
    GeneralSettingsNgComponent,
    GridSettingsNgComponent,
    OrderPadSettingsNgComponent
} from '../settings/ng-api';
import { StaticInitialise } from '../static-initialise';
import { StatusSummaryNgComponent } from '../status-summary/ng-api';
import { TableNgComponent } from '../table/ng-api';
import { TradesNgComponent } from '../trades/ng-api';
import { ZenithStatusNgComponent } from '../zenith-status/ng-api';

@NgModule({
    declarations: [
        CashHoldingsNgComponent,
        ColorSchemeGridNgComponent,
        ColorSchemeItemPropertiesNgComponent,
        ColorSchemePresetCodeNgComponent,
        ColorControlsNgComponent,
        ContentGridLayoutEditorNgComponent,
        DelayedBadnessNgComponent,
        DepthNgComponent,
        DepthGridLayoutsEditorNgComponent,
        DepthSideNgComponent,
        FeedsNgComponent,
        GridColumnPropertiesNgComponent,
        GridLayoutEditorNgComponent,
        GridLayoutEditorGridNgComponent,
        IvemHoldingsNgComponent,
        MarketsNgComponent,
        PadOrderRequestStepNgComponent,
        ResultOrderRequestStepNgComponent,
        ParidepthGridLayoutsEditorNgComponent,
        ColorSettingsNgComponent,
        GeneralSettingsNgComponent,
        GridSettingsNgComponent,
        StatusSummaryNgComponent,
        TableNgComponent,
        TradesNgComponent,
        ZenithStatusNgComponent,
        OrderPadSettingsNgComponent,
        ReviewOrderRequestStepNgComponent,
        ReviewPlaceOrderRequestNgComponent,
        ReviewAmendOrderRequestNgComponent,
        ReviewCancelOrderRequestNgComponent,
        ReviewMoveOrderRequestNgComponent,
        ReviewOrderRequestZenithMessageNgComponent,
        ExtensionsSidebarNgComponent,
        ExtensionListsNgComponent,
        InstalledExtensionListNgComponent,
        AvailableExtensionListNgComponent,
        ExtensionListInfoItemNgComponent,
        ExtensionDetailNgComponent,
        ExtensionsSearchNgComponent,
        ExtensionListRegisteredItemNgComponent,
        MotifGridNgComponent,
        MultiColorPickerNgComponent,
        ExchangesSettingsNgComponent,
        ExchangeSettingsNgComponent,
        SearchSymbolsConditionNgComponent,
    ],
    imports: [
        CommonModule,
        AngularSplitModule,
        ControlsNgModule,
    ],
    exports: [
        ContentGridLayoutEditorNgComponent,
        DepthNgComponent,
        DepthGridLayoutsEditorNgComponent,
        ExtensionsSidebarNgComponent,
        ExtensionDetailNgComponent,
        FeedsNgComponent,
        GridLayoutEditorNgComponent,
        MarketsNgComponent,
        PadOrderRequestStepNgComponent,
        ReviewOrderRequestStepNgComponent,
        ResultOrderRequestStepNgComponent,
        ParidepthGridLayoutsEditorNgComponent,
        ColorSettingsNgComponent,
        GeneralSettingsNgComponent,
        GridSettingsNgComponent,
        StatusSummaryNgComponent,
        TableNgComponent,
        TradesNgComponent,
        ZenithStatusNgComponent,
    ]
})
export class ContentNgModule {
    constructor() {
        StaticInitialise.initialise();
    }
}
