/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockerScanAttachedNotificationChannel, PayloadTableRecordDefinition, TableRecordDefinition } from '@motifmarkets/motif-core';

export interface LockerScanAttachedNotificationChannelTableRecordDefinition extends PayloadTableRecordDefinition<LockerScanAttachedNotificationChannel> {
    readonly typeId: TableRecordDefinition.TypeId.LockerScanAttachedNotificationChannel;
}

export namespace LockerScanAttachedNotificationChannelTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LockerScanAttachedNotificationChannelTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.LockerScanAttachedNotificationChannel;
    }
}
