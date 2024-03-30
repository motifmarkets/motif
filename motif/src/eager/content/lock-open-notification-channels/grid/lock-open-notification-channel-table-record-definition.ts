/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenNotificationChannel, PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@motifmarkets/motif-core';

export interface LockOpenNotificationChannelTableRecordDefinition extends PayloadTableRecordDefinition<LockOpenNotificationChannel> {
    readonly typeId: TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel;
}

export namespace LockerScanAttachedNotificationChannelTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LockOpenNotificationChannelTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel;
    }
}
