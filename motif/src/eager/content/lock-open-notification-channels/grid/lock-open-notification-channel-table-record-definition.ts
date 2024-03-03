/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenNotificationChannel, PayloadTableRecordDefinition, TableRecordDefinition } from '@motifmarkets/motif-core';

export interface LockOpenNotificationChannelTableRecordDefinition extends PayloadTableRecordDefinition<LockOpenNotificationChannel> {
    readonly typeId: TableRecordDefinition.TypeId.LockOpenNotificationChannel;
}

export namespace LockerScanAttachedNotificationChannelTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LockOpenNotificationChannelTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.LockOpenNotificationChannel;
    }
}
