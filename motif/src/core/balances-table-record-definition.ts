/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Balances, DataRecord } from 'adi-internal-api';
import { JsonElement, Logger } from 'sys-internal-api';
import { BrokerageAccountDataRecordTableRecordDefinition } from './brokerage-account-data-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export class BalancesTableRecordDefinition extends BrokerageAccountDataRecordTableRecordDefinition<Balances> {
    constructor(balances: Balances | undefined, key?: DataRecord.Key) {
        super(TableRecordDefinition.TypeId.Balances, balances, key);
    }

    balancesInterfaceDescriminator() {
        // no code
    }

    createCopy(): TableRecordDefinition {
        return new BalancesTableRecordDefinition(this.record);
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!BalancesTableRecordDefinition.hasBalancesInterface(other)) {
            return false;
        } else {
            return Balances.Key.isEqual(this.key as Balances.Key, other.key as Balances.Key);
        }
    }
}

export namespace BalancesTableRecordDefinition {
    export function hasBalancesInterface(definition: TableRecordDefinition):
        definition is BalancesTableRecordDefinition {
        return (definition as BalancesTableRecordDefinition).balancesInterfaceDescriminator !== undefined;
    }

    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = Balances.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDACBTRDTCKFJ122233', keyOrError);
            return undefined;
        }
    }
}

