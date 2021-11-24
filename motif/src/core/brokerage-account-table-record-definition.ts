/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account } from 'adi-internal-api';
import { JsonElement, Logger } from 'sys-internal-api';
import { DataRecordTableRecordDefinition } from './data-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export class BrokerageAccountTableRecordDefinition extends DataRecordTableRecordDefinition<Account> {
    constructor(account: Account | undefined, key?: Account.Key) {
        super(TableRecordDefinition.TypeId.BrokerageAccount, account, key);
    }

    brokerageAccountInterfaceDescriminator() {
        // no code
    }

    createCopy() {
        return new BrokerageAccountTableRecordDefinition(this.record, this.key as Account.Key);
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!BrokerageAccountTableRecordDefinition.hasBrokerageAccountInterface(other)) {
            return false;
        } else {
            return Account.Key.isEqual(this.key as Account.Key, other.key as Account.Key);
        }
    }
}

export namespace BrokerageAccountTableRecordDefinition {
    export function hasBrokerageAccountInterface(definition: TableRecordDefinition): definition is BrokerageAccountTableRecordDefinition {
        return (definition as BrokerageAccountTableRecordDefinition).brokerageAccountInterfaceDescriminator !== undefined;
    }

    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = Account.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDBATRD29983', keyOrError);
            return undefined;
        }
    }
}
