/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Command } from 'src/core/internal-api';
import {
    BrokerageAccountGroupSelect as BrokerageAccountGroupSelectApi,
    BuiltinIconButton as BuiltinIconButtonApi,
    Button as ButtonApi,
    CaptionedCheckbox as CaptionedCheckboxApi,
    Checkbox as CheckboxApi,
    DateInput as DateInputApi,
    DecimalInput as DecimalInputApi,
    IntegerInput as IntegerInputApi,
    LitIvemIdSelect as LitIvemIdSelectApi,
    NumberInput as NumberInputApi,
    OrderRouteSelect as OrderRouteSelectApi,
    RoutedIvemIdSelect as RoutedIvemIdSelectApi
} from '../../api/extension-api';
import { ApiComponentFactory } from './api-component-factory';

export interface ApiControlComponentFactory extends ApiComponentFactory {
    createButton(command: Command): Promise<ButtonApi>;
    createBuiltinIconButton(command: Command): Promise<BuiltinIconButtonApi>;
    createCaptionedCheckbox(valueRequired: boolean | undefined): Promise<CaptionedCheckboxApi>;
    createCheckbox(valueRequired: boolean | undefined): Promise<CheckboxApi>;
    createIntegerInput(valueRequired: boolean | undefined): Promise<IntegerInputApi>;
    createNumberInput(valueRequired: boolean | undefined): Promise<NumberInputApi>;
    createDecimalInput(valueRequired: boolean | undefined): Promise<DecimalInputApi>;
    createDateInput(valueRequired: boolean | undefined): Promise<DateInputApi>;
    createBrokerageAccountGroupSelect(valueRequired: boolean | undefined): Promise<BrokerageAccountGroupSelectApi>;
    createLitIvemIdSelect(valueRequired: boolean | undefined): Promise<LitIvemIdSelectApi>;
    createRoutedIvemIdSelect(valueRequired: boolean | undefined): Promise<RoutedIvemIdSelectApi>;
    createOrderRouteSelect(valueRequired: boolean | undefined): Promise<OrderRouteSelectApi>;
}
