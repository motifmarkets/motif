/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { SettingsNgService } from 'component-services-ng-api';
import {
    ButtonInputNgComponent,
    CaptionedCheckboxNgComponent,
    CheckboxInputNgComponent,
    SvgButtonNgComponent
} from '../boolean/ng-api';
import { BrokerageAccountGroupInputNgComponent, BrokerageAccountGroupNameLabelNgComponent } from '../brokerage-account-group/ng-api';
import { CommandBarNgComponent, CommandSelectNgComponent } from '../command/ng-api';
import { DateInputNgComponent } from '../date/ng-api';
import { DecimalInputNgComponent } from '../decimal/ng-api';
import {
    CaptionedEnumArrayCheckboxNgComponent,
    EnumArrayCheckboxNgComponent,
    EnumArrayElementCaptionNgComponent,
    EnumArrayInputNgComponent
} from '../enum-array/ng-api';
import {
    CaptionedRadioNgComponent,
    EnumCaptionNgComponent,
    EnumElementCaptionNgComponent,
    EnumInputNgComponent,
    RadioInputNgComponent
} from '../enum/ng-api';
import { IvemIdInputNgComponent } from '../ivem-id/ng-api';
import { CaptionLabelNgComponent } from '../label/ng-api';
import { LitIvemIdInputNgComponent, LitIvemIdSelectNgComponent } from '../lit-ivem-id/ng-api';
import {
    MenuBarOverlayChildItemNgComponent,
    MenuBarOverlayCommandItemNgComponent,
    MenuBarOverlayDividerItemNgComponent,
    MenuBarOverlayMenuNgComponent,
    MenuBarOverlayNgComponent,
    MenuBarRootChildItemNgComponent,
    MenuBarRootCommandItemNgComponent,
    MenuBarRootDividerItemNgComponent,
    MenuBarRootMenuNgComponent
} from '../menu-bar/ng-api';
import { NgSelectUtilsModule } from '../ng-select-utils';
import { IntegerLabelNgComponent, IntegerTextInputNgComponent, NumberInputNgComponent } from '../number/ng-api';
import { OrderRouteInputNgComponent } from '../order-route/ng-api';
import { RoutedIvemIdInputNgComponent, RoutedIvemIdSelectNgComponent, SymbolNameLabelNgComponent } from '../routed-ivem-id/ng-api';
import { StaticInitialise } from '../static-initialise';
import { TextInputNgComponent } from '../string/ng-api';
import { TabListNgComponent } from '../tab-list/ng-api';

@NgModule({
    declarations: [
        ButtonInputNgComponent,
        SvgButtonNgComponent,
        CaptionedCheckboxNgComponent,
        CheckboxInputNgComponent,
        BrokerageAccountGroupInputNgComponent,
        BrokerageAccountGroupNameLabelNgComponent,
        CommandBarNgComponent,
        CommandSelectNgComponent,
        DateInputNgComponent,
        DecimalInputNgComponent,
        CaptionedRadioNgComponent,
        EnumCaptionNgComponent,
        EnumElementCaptionNgComponent,
        EnumInputNgComponent,
        RadioInputNgComponent,
        CaptionedEnumArrayCheckboxNgComponent,
        EnumArrayCheckboxNgComponent,
        EnumArrayElementCaptionNgComponent,
        EnumArrayInputNgComponent,
        IvemIdInputNgComponent,
        CaptionLabelNgComponent,
        LitIvemIdInputNgComponent,
        LitIvemIdSelectNgComponent,
        IntegerLabelNgComponent,
        IntegerTextInputNgComponent,
        MenuBarRootCommandItemNgComponent,
        MenuBarRootDividerItemNgComponent,
        MenuBarRootChildItemNgComponent,
        MenuBarRootMenuNgComponent,
        MenuBarOverlayNgComponent,
        MenuBarOverlayMenuNgComponent,
        MenuBarOverlayCommandItemNgComponent,
        MenuBarOverlayDividerItemNgComponent,
        MenuBarOverlayChildItemNgComponent,
        NumberInputNgComponent,
        OrderRouteInputNgComponent,
        RoutedIvemIdInputNgComponent,
        RoutedIvemIdSelectNgComponent,
        SymbolNameLabelNgComponent,
        TabListNgComponent,
        TextInputNgComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgSelectModule,
    ],
    exports: [
        ButtonInputNgComponent,
        SvgButtonNgComponent,
        CaptionedCheckboxNgComponent,
        CheckboxInputNgComponent,
        BrokerageAccountGroupInputNgComponent,
        BrokerageAccountGroupNameLabelNgComponent,
        CommandBarNgComponent,
        CommandSelectNgComponent,
        DateInputNgComponent,
        DecimalInputNgComponent,
        CaptionedRadioNgComponent,
        EnumCaptionNgComponent,
        EnumElementCaptionNgComponent,
        EnumInputNgComponent,
        RadioInputNgComponent,
        CaptionedEnumArrayCheckboxNgComponent,
        EnumArrayCheckboxNgComponent,
        EnumArrayElementCaptionNgComponent,
        EnumArrayInputNgComponent,
        IvemIdInputNgComponent,
        CaptionLabelNgComponent,
        LitIvemIdInputNgComponent,
        LitIvemIdSelectNgComponent,
        IntegerLabelNgComponent,
        IntegerTextInputNgComponent,
        MenuBarRootMenuNgComponent,
        MenuBarOverlayNgComponent,
        NumberInputNgComponent,
        OrderRouteInputNgComponent,
        RoutedIvemIdInputNgComponent,
        RoutedIvemIdSelectNgComponent,
        SymbolNameLabelNgComponent,
        TabListNgComponent,
        TextInputNgComponent,
    ]
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ControlsNgModule {
    constructor(
        ngSelectConfig: NgSelectConfig,
        settingsNgService: SettingsNgService
    ) {
        ngSelectConfig.appendTo = '.paritechMotifNgSelectOverlay';
        NgSelectUtilsModule.setColorSettings(settingsNgService.service.color);

        StaticInitialise.initialise();
    }
}
