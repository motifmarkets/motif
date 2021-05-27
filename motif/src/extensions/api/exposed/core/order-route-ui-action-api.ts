/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderRoute } from '../adi/extension-api';
import { UiAction } from './ui-action-api';

/** @public */
export interface OrderRouteUiAction extends UiAction {
    readonly value: OrderRoute | undefined;
    readonly definedValue: OrderRoute;
    readonly allowedValues: readonly OrderRoute[];

    pushValue(value: OrderRoute | undefined): void;
    pushAllowedValues(value: readonly OrderRoute[]): void;
}
