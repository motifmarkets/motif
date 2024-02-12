/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BadnessComparableList,
    BadnessListTableRecordSource,
    Integer,
    TableFieldSourceDefinition,
    TableRecord,
    TableRecordDefinition,
    TableRecordSourceDefinitionFactoryService,
    TextFormatterService,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { ScanFieldEditorFrame } from '../field/scan-field-editor-frame';
import { ScanFieldEditorFrameComparableListTableRecordSourceDefinition } from './scan-field-editor-frame-comparable-list-table-record-source-definition';
import { ScanFieldEditorFrameTableRecordDefinition } from './scan-field-editor-frame-table-record-definition';
import { ScanFieldEditorFrameTableValueSource } from './scan-field-editor-frame-table-value-source';

export class ScanFieldEditorFrameComparableListTableRecordSource extends BadnessListTableRecordSource<ScanFieldEditorFrame> {
    declare readonly definition: ScanFieldEditorFrameComparableListTableRecordSourceDefinition;
    declare readonly list: BadnessComparableList<ScanFieldEditorFrame>;

    constructor(
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: ScanFieldEditorFrameComparableListTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            definition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override get recordList() { return super.recordList as BadnessComparableList<ScanFieldEditorFrame>; }

    override createDefinition(): ScanFieldEditorFrameComparableListTableRecordSourceDefinition {
        return ScanFieldEditorFrameComparableListTableRecordSourceDefinition.create(
            this._gridFieldCustomHeadingsService,
            this._tableFieldSourceDefinitionCachedFactoryService,
            this.list.clone()
        )
    }

    override createRecordDefinition(idx: Integer): ScanFieldEditorFrameTableRecordDefinition {
        const scanFieldEditorFrame = this.list.getAt(idx);
        return {
            typeId: TableRecordDefinition.TypeId.ScanFieldEditorFrame,
            mapKey: scanFieldEditorFrame.name,
            record: scanFieldEditorFrame,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const scanFieldEditorFrame = this.list.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as ScanFieldEditorFrameComparableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            if (this.allowedFieldSourceDefinitionTypeIds.includes(fieldSourceDefinitionTypeId)) {
                switch (fieldSourceDefinitionTypeId) {
                    case TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame: {
                        const valueSource = new ScanFieldEditorFrameTableValueSource(result.fieldCount, scanFieldEditorFrame);
                        result.addSource(valueSource);
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('SFEFCLTRSCTR19909', fieldSourceDefinitionTypeId);
                }
            }
        }

        return result;
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return ScanFieldEditorFrameComparableListTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
