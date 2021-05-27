/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataRecord, Order } from 'src/adi/internal-api';
import { JsonElement, Logger } from 'src/sys/internal-api';
import { BrokerageAccountDataRecordTableRecordDefinition } from './brokerage-account-data-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export class OrderTableRecordDefinition extends BrokerageAccountDataRecordTableRecordDefinition<Order> {
    constructor(order: Order | undefined, key?: DataRecord.Key) {
        super(TableRecordDefinition.TypeId.Order, order, key);
    }

    orderInterfaceDescriminator() {
        // no code
    }

    createCopy() {
        return new OrderTableRecordDefinition(this.record, this.key);
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!OrderTableRecordDefinition.hasOrderInterface(other)) {
            return false;
        } else {
            return Order.Key.isEqual(this.key as Order.Key, other.key as Order.Key);
        }
    }
}

export namespace OrderTableRecordDefinition {
    export function hasOrderInterface(definition: TableRecordDefinition): definition is OrderTableRecordDefinition {
        return (definition as OrderTableRecordDefinition).orderInterfaceDescriminator !== undefined;
    }

    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = Order.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDBOTRD85558', keyOrError);
            return undefined;
        }
    }
}
