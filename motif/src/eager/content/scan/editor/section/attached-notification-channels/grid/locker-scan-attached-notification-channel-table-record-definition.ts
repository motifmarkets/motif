/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockerScanAttachedNotificationChannel, PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@motifmarkets/motif-core';

export interface LockerScanAttachedNotificationChannelTableRecordDefinition extends PayloadTableRecordDefinition<LockerScanAttachedNotificationChannel> {
    readonly typeId: TableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel;
}

export namespace LockerScanAttachedNotificationChannelTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LockerScanAttachedNotificationChannelTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel;
    }
}
