/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    LockOpenNotificationChannel,
    PickEnum,
    RevFieldCustomHeadingsService,
    RevGridLayoutDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactoryService,
    TableRecordSourceDefinition
} from '@motifmarkets/motif-core';
import { LockOpenNotificationChannelTableFieldSourceDefinition } from './lock-open-notification-channel-table-field-source-definition';

export class LockOpenNotificationChannelListTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TableRecordSourceDefinition.TypeId.LockOpenNotificationChannelList,
            LockOpenNotificationChannelListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefaultLayoutDefinition(): RevGridLayoutDefinition {
        const notificationChannelTableFieldSourceDefinition = LockOpenNotificationChannelTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(notificationChannelTableFieldSourceDefinition.getFieldNameById(LockOpenNotificationChannel.FieldId.Name));

        return RevGridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace LockOpenNotificationChannelListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel
    ];

    export type FieldId = LockOpenNotificationChannelTableFieldSourceDefinition.FieldId;

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
    //     customHeadingsService: RevFieldCustomHeadingsService,
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
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
    ) {
        return new LockOpenNotificationChannelListTableRecordSourceDefinition(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
        );
    }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactoryService,
        fieldIds: FieldId[],
    ): RevGridLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is LockOpenNotificationChannelListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel;
    }
}
