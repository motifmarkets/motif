/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BrokerageAccountGroupSelect,
    BuiltinIconButton,
    Button,
    CaptionedCheckbox,
    Checkbox,
    Command,
    ControlComponent,
    DateInput,
    DecimalInput,
    IntegerInput,
    LitIvemIdSelect,
    NumberInput,
    OrderRouteSelect,
    RoutedIvemIdSelect,
    UiAction
} from '../exposed/extension-api';

/** @public */
export interface ControlsSvc {
    readonly controls: readonly ControlComponent[];
    readonly uiActions: readonly UiAction[];

    destroyAllControls(): void;
    destroyControl(control: UiAction | ControlComponent): void;

    createButton(command: Command): Promise<Button>;
    createBuiltinIconButton(command: Command): Promise<BuiltinIconButton>;
    createCaptionedCheckbox(valueRequired?: boolean): Promise<CaptionedCheckbox>;
    createCheckbox(valueRequired?: boolean): Promise<Checkbox>;
    createIntegerInput(valueRequired?: boolean): Promise<IntegerInput>;
    createNumberInput(valueRequired?: boolean): Promise<NumberInput>;
    createDecimalInput(valueRequired?: boolean): Promise<DecimalInput>;
    createDateInput(valueRequired?: boolean): Promise<DateInput>;
    createBrokerageAccountGroupSelect(valueRequired?: boolean): Promise<BrokerageAccountGroupSelect>;
    createLitIvemIdSelect(valueRequired?: boolean): Promise<LitIvemIdSelect>;
    createRoutedIvemIdSelect(valueRequired?: boolean): Promise<RoutedIvemIdSelect>;
    createOrderRouteSelect(valueRequired?: boolean): Promise<OrderRouteSelect>;
}
