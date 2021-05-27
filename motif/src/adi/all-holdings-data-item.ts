/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountsDataRecordsDataItem } from './all-brokerage-accounts-data-records-data-item';
import { BrokerageAccountGroupHoldingList } from './brokerage-account-group-holding-list';
import { BrokerageAccountHoldingsDataDefinition } from './common/internal-api';
import { Holding } from './holding';

export class AllHoldingsDataItem extends AllBrokerageAccountsDataRecordsDataItem<Holding> implements BrokerageAccountGroupHoldingList {

    protected createDataRecordsDataDefinition() {
        return new BrokerageAccountHoldingsDataDefinition();
    }
}
