/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId, JsonElement, MapKey, MultiEvent } from 'sys-internal-api';

export interface DataRecord {
    readonly correctnessId: CorrectnessId;
    readonly mapKey: MapKey;

    createKey(): DataRecord.Key;

    dispose(): void;
    setListCorrectness(value: CorrectnessId): void;

    subscribeCorrectnessChangedEvent(handler: DataRecord.CorrectnessChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace DataRecord {
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export interface Key {
        readonly mapKey: MapKey;
        saveToJson(element: JsonElement): void;
    }
}
