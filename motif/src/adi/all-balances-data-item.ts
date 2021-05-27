/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountsDataRecordsDataItem } from './all-brokerage-accounts-data-records-data-item';
import { Balances } from './balances';
import { BrokerageAccountGroupBalancesList } from './brokerage-account-group-balances-list';
import { BrokerageAccountBalancesDataDefinition } from './common/internal-api';

export class AllBalancesDataItem extends AllBrokerageAccountsDataRecordsDataItem<Balances> implements BrokerageAccountGroupBalancesList {

    protected createDataRecordsDataDefinition() {
        return new BrokerageAccountBalancesDataDefinition();
    }
}
