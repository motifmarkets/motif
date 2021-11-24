/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountDataRecord } from 'adi-internal-api';
import { DataRecordTableRecordDefinition } from './data-record-table-record-definition';

export abstract class BrokerageAccountDataRecordTableRecordDefinition<Record extends BrokerageAccountDataRecord>
    extends DataRecordTableRecordDefinition<Record> {

    BrokerageAccountDataRecordInterfaceDescriminator() {
        // no code
    }
}
