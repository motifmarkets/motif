/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BadnessComparableList,
    BadnessListTableRecordSourceDefinition,
    GridFieldCustomHeadingsService,
    GridLayoutDefinition,
    PickEnum,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionRegistryService,
    TableRecordSourceDefinition,
} from '@motifmarkets/motif-core';
import { ScanFieldEditorFrame } from '../field/internal-api';
import { ScanFieldEditorFrameTableFieldSourceDefinition } from './scan-field-editor-frame-table-field-source-definition';

export class ScanFieldEditorFrameComparableListTableRecordSourceDefinition extends BadnessListTableRecordSourceDefinition<ScanFieldEditorFrame> {
    declare list: BadnessComparableList<ScanFieldEditorFrame>;

    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        list: BadnessComparableList<ScanFieldEditorFrame>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.LitIvemIdComparableList,
            ScanFieldEditorFrameComparableListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override createDefaultLayoutDefinition(): GridLayoutDefinition {
        const scanFieldEditorFrameFieldSourceDefinition = ScanFieldEditorFrameTableFieldSourceDefinition.getRegistered(this.fieldSourceDefinitionRegistryService);

        const fieldNames = new Array<string>();

        fieldNames.push(scanFieldEditorFrameFieldSourceDefinition.getFieldNameById(ScanFieldEditorFrame.FieldId.Name));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ScanFieldEditorFrameComparableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame
    ];

    export type FieldId = ScanFieldEditorFrameTableFieldSourceDefinition.FieldId;

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
    //     tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
    //     element: JsonElement,
    // ): Result<ScanFieldEditorFrameComparableListTableRecordSourceDefinition> {
    //     const listCreateResult = tryCreateListFromElement(element);
    //     if (listCreateResult.isErr()) {
    //         const errorCode = ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
    //         return listCreateResult.createOuter(errorCode);
    //     } else {
    //         const list = listCreateResult.value;
    //         const definition = new ScanFieldEditorFrameComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionRegistryService, list);
    //         return new Ok(definition);
    //     }
    // }

    export function create(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        list: BadnessComparableList<ScanFieldEditorFrame>,
    ) {
        return new ScanFieldEditorFrameComparableListTableRecordSourceDefinition(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
            list,
        );
    }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        fieldIds: FieldId[],
    ): GridLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is ScanFieldEditorFrameComparableListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.LitIvemIdComparableList;
    }
}
