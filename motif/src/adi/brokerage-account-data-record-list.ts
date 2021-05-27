/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountDataRecord } from './brokerage-account-data-record';
import { DataRecordList } from './data-record-list';

export interface BrokerageAccountDataRecordList<Record extends BrokerageAccountDataRecord> extends DataRecordList<Record> {
}
