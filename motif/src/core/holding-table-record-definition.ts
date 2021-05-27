/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataRecord, Holding } from 'src/adi/internal-api';
import { JsonElement, Logger } from 'src/sys/internal-api';
import { BrokerageAccountDataRecordTableRecordDefinition } from './brokerage-account-data-record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export class HoldingTableRecordDefinition extends BrokerageAccountDataRecordTableRecordDefinition<Holding> {
    constructor(holding: Holding | undefined, key?: DataRecord.Key) {
        super(TableRecordDefinition.TypeId.Holding, holding, key);
    }

    holdingInterfaceDescriminator() {
        // no code
    }

    createCopy() {
        return new HoldingTableRecordDefinition(this.record, this.key);
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!HoldingTableRecordDefinition.hasHoldingInterface(other)) {
            return false;
        } else {
            return Holding.Key.isEqual(this.key as Holding.Key, other.key as Holding.Key);
        }
    }
}

export namespace HoldingTableRecordDefinition {
    export function hasHoldingInterface(definition: TableRecordDefinition): definition is HoldingTableRecordDefinition {
        return (definition as HoldingTableRecordDefinition).holdingInterfaceDescriminator !== undefined;
    }

    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = Holding.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDBHTRD99871', keyOrError);
            return undefined;
        }
    }
}
