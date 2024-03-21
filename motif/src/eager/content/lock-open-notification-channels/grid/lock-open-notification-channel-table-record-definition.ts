/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenNotificationChannel, PayloadTableRecordDefinition, TypedTableFieldSourceDefinition, TypedTableRecordDefinition } from '@motifmarkets/motif-core';

export interface LockOpenNotificationChannelTableRecordDefinition extends PayloadTableRecordDefinition<LockOpenNotificationChannel> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.LockOpenNotificationChannel;
}

export namespace LockerScanAttachedNotificationChannelTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is LockOpenNotificationChannelTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.LockOpenNotificationChannel;
    }
}
