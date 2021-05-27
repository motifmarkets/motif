/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BalancesModule } from './balances';
import { BrokerageAccountGroupModule } from './brokerage-account-group';
import { CommonStaticInitialise } from './common/internal-api';
import { DataItemModule } from './data-item';
import { DayTradesDataItemModule } from './day-trades-data-item';
import { HoldingModule } from './holding';
import { LitIvemDetailModule } from './lit-ivem-detail';
import { FullLitIvemDetailModule } from './lit-ivem-full-detail';
import { MyxLitIvemAttributesModule } from './myx-lit-ivem-attributes';
import { OrderModule } from './order';
import { FeedDataItemModule } from './publisher-subscription-data-item';
import { PublisherSubscriptionManagerModule } from './publisher-subscription-manager';
import { PublishersStaticInitialise } from './publishers/internal-api';
import { SecurityDataItemModule } from './security-data-item';

export namespace AdiStaticInitialise {
    export function initialise() {
        CommonStaticInitialise.initialise();
        PublishersStaticInitialise.initialise();
        PublisherSubscriptionManagerModule.initialiseStatic();
        DataItemModule.initialiseStatic();
        FeedDataItemModule.initialiseStatic();
        LitIvemDetailModule.initialiseStatic();
        FullLitIvemDetailModule.initialiseStatic();
        MyxLitIvemAttributesModule.initialiseStatic();
        SecurityDataItemModule.initialiseStatic();
        BrokerageAccountGroupModule.initialiseStatic();
        OrderModule.initialiseStatic();
        HoldingModule.initialiseStatic();
        BalancesModule.initialiseStatic();
        DayTradesDataItemModule.initialiseStatic();
    }
}
