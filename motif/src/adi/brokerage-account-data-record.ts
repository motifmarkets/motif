/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MapKey } from 'src/sys/internal-api';
import { DataRecord } from './data-record';

export interface BrokerageAccountDataRecord extends DataRecord {
    readonly accountMapKey: MapKey;
}
