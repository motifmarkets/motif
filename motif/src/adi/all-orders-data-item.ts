/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountsDataRecordsDataItem } from './all-brokerage-accounts-data-records-data-item';
import { BrokerageAccountGroupOrderList } from './brokerage-account-group-order-list';
import { BrokerageAccountOrdersDataDefinition } from './common/internal-api';
import { Order } from './order';

export class AllOrdersDataItem extends AllBrokerageAccountsDataRecordsDataItem<Order> implements BrokerageAccountGroupOrderList {

    protected createDataRecordsDataDefinition() {
        return new BrokerageAccountOrdersDataDefinition();
    }
}
