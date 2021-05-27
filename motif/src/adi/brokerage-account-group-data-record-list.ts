/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountDataRecord } from './brokerage-account-data-record';
import { BrokerageAccountDataRecordList } from './brokerage-account-data-record-list';
import { BrokerageAccountGroup } from './brokerage-account-group';

export interface BrokerageAccountGroupDataRecordList<Record extends BrokerageAccountDataRecord>
    extends BrokerageAccountDataRecordList<Record> {

    brokerageAccountGroup: BrokerageAccountGroup;
}
