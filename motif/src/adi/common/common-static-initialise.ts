/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataDefinitionModule } from './data-definition';
import { DataTypesModule } from './data-types';
import { LitIvemAlternateCodesModule } from './lit-ivem-alternate-codes';
import { OrderStatusModule } from './order-status';
import { OrderTriggerModule } from './order-trigger';
import { TradingStateModule } from './trading-state';

export namespace CommonStaticInitialise {
    export function initialise() {
        DataTypesModule.initialiseStatic();
        TradingStateModule.initialiseStatic();
        OrderStatusModule.initialiseStatic();
        DataDefinitionModule.initialiseStatic();
        LitIvemAlternateCodesModule.initialiseStatic();
        OrderTriggerModule.initialiseStatic();
    }
}
