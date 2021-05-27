/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountDataRecord } from 'src/adi/internal-api';
import { DataRecordTableRecordDefinitionList } from './data-record-table-record-definition-list';

export abstract class BrokerageAccountDataRecordTableRecordDefinitionList<Record extends BrokerageAccountDataRecord>
    extends DataRecordTableRecordDefinitionList<Record> {

}
