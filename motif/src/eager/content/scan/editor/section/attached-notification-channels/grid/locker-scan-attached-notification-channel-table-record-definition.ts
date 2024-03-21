/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockerScanAttachedNotificationChannel, PayloadTableRecordDefinition, TypedTableFieldSourceDefinition, TypedTableRecordDefinition } from '@motifmarkets/motif-core';

export interface LockerScanAttachedNotificationChannelTableRecordDefinition extends PayloadTableRecordDefinition<LockerScanAttachedNotificationChannel> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel;
}

export namespace LockerScanAttachedNotificationChannelTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is LockerScanAttachedNotificationChannelTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel;
    }
}
