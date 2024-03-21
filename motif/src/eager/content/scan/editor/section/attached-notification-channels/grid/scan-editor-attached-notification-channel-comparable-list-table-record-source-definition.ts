/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BadnessListTableRecordSourceDefinition,
    GridFieldCustomHeadingsService,
    GridLayoutDefinition,
    LockerScanAttachedNotificationChannel,
    LockerScanAttachedNotificationChannelList,
    PickEnum,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService,
    TypedTableRecordSourceDefinition
} from '@motifmarkets/motif-core';
import { LockerScanAttachedNotificationChannelTableFieldSourceDefinition } from './locker-scan-attached-notification-channel-table-field-source-definition';

export class ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition extends BadnessListTableRecordSourceDefinition<LockerScanAttachedNotificationChannel> {
    declare list: LockerScanAttachedNotificationChannelList;

    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        list: LockerScanAttachedNotificationChannelList,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel,
            ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override createDefaultLayoutDefinition(): GridLayoutDefinition {
        const notificationChannelTableFieldSourceDefinition = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(notificationChannelTableFieldSourceDefinition.getFieldNameById(LockerScanAttachedNotificationChannel.FieldId.Name));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel
    ];

    export type FieldId = LockerScanAttachedNotificationChannelTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const list = 'list';
    }

    // export function tryCreateListFromElement(element: JsonElement): Result<BadnessComparableList<ScanFieldEditorFrame>> {
    //     const elementArrayResult = element.tryGetElementArray(JsonName.list);
    //     if (elementArrayResult.isErr()) {
    //         const error = elementArrayResult.error;
    //         if (error === JsonElement.arrayErrorCode_NotSpecified) {
    //             return new Err(ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonLitIvemIdsNotSpecified);
    //         } else {
    //             return new Err(ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonLitIvemIdsIsInvalid);
    //         }
    //     } else {
    //         const litIvemIdsResult = LitIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
    //         if (litIvemIdsResult.isErr()) {
    //             return litIvemIdsResult.createOuter(ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonLitIvemIdArrayIsInvalid);
    //         } else {
    //             const litIvemIds = litIvemIdsResult.value;
    //             const list = new UiBadnessComparableList<LitIvemId>();
    //             list.addRange(litIvemIds);
    //             return new Ok(list);
    //         }
    //     }
    // }

    // export function tryCreateDefinition(
    //     customHeadingsService: GridFieldCustomHeadingsService,
    //     tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
    //     element: JsonElement,
    // ): Result<ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition> {
    //     const listCreateResult = tryCreateListFromElement(element);
    //     if (listCreateResult.isErr()) {
    //         const errorCode = ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
    //         return listCreateResult.createOuter(errorCode);
    //     } else {
    //         const list = listCreateResult.value;
    //         const definition = new ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachingFactoryService, list);
    //         return new Ok(definition);
    //     }
    // }

    export function create(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        list: LockerScanAttachedNotificationChannelList,
    ) {
        return new ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            list,
        );
    }

    export function createLayoutDefinition(
        fieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        fieldIds: FieldId[],
    ): GridLayoutDefinition {
        return fieldSourceDefinitionCachingFactoryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TypedTableRecordSourceDefinition): definition is ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition {
        return definition.typeId === TypedTableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel;
    }
}
