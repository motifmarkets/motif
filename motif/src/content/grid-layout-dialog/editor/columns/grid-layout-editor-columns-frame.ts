/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    EditableGridLayoutDefinitionColumn,
    EditableGridLayoutDefinitionColumnList,
    GridField,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    ModifierKey,
    ModifierKeyId,
    TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { RecordGrid } from '../../../adapted-revgrid/internal-api';
import { ContentFrame } from '../../../content-frame';
import { GridSourceFrame } from '../../../grid-source/internal-api';

export class GridLayoutEditorColumnsFrame extends ContentFrame {
    selectionChangedEventer: GridLayoutEditorColumnsFrame.SelectionChangedEventer;
    focusChangedEventer: GridLayoutEditorColumnsFrame.FocusChangedEventer;

    private _gridSourceFrame: GridSourceFrame;
    private _recordGrid: RecordGrid;

    constructor(
        private _componentAccess: GridLayoutEditorColumnsFrame.ComponentAccess,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super();
    }

    get selectedCount() { return 0; }

    initialise(gridSourceFrame: GridSourceFrame, recordGrid: RecordGrid) {
        this._gridSourceFrame = gridSourceFrame;
        this._recordGrid = recordGrid;

        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createEditableGridLayoutDefinitionColumn(this._columnList);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        const gridSourceOrNamedReferenceDefinition = new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
        gridSourceFrame.tryOpenGridSource(gridSourceOrNamedReferenceDefinition, false);
    }

    insertFields(fields: GridField[]) {

    }

    getAllFieldNames() {
        return [];
    }

    removeSelected() {
        return 0;
    }

    moveSelectedUp() {

    }

    moveSelectedToTop() {

    }

    moveSelectedDown() {

    }

    moveSelectedToBottom() {

    }

    selectAll() {
        this._recordGrid.selectAllRows();
    }

    isAllSelectedAtTop() {
        return false;
    }

    isAllSelectedAtBottom() {
        return false;
    }

    tryFocusFirstSearchMatch(searchText: string) {
        this.tryFocusNextSearchMatchFromRow(searchText, 0, false);
    }

    tryFocusNextSearchMatch(searchText: string, downKeys: ModifierKey.IdSet) {
        const backwards = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        const focusedRecIdx = this._recordGrid.focusedRecordIndex;

        let rowIndex: Integer;
        if (focusedRecIdx === undefined) {
            rowIndex = 0;
        } else {
            const focusedRowIdx = this._recordGrid.recordToRowIndex(focusedRecIdx);
            if (backwards) {
                rowIndex = focusedRowIdx - 1;
            } else {
                rowIndex = focusedRowIdx + 1;
            }
        }

        this.tryFocusNextSearchMatchFromRow(searchText, rowIndex, backwards);
    }

    private tryFocusNextSearchMatchFromRow(searchText: string, rowIndex: Integer, backwards: boolean) {
        const rowIncrement = backwards ? -1 : 1;
        const upperSearchText = searchText.toUpperCase();
        const rowCount = this._recordGrid.getRowCount();

        while (rowIndex >= 0 && rowIndex < rowCount) {
            const recordIndex = this._recordGrid.rowToRecordIndex(rowIndex);
            const column = this._columnList.records[recordIndex];
            const upperHeading = column.fieldHeading.toUpperCase();
            if (upperHeading.includes(upperSearchText)) {
                this._recordGrid.focusedRecordIndex = recordIndex;
                break;
            } else {
                rowIndex += rowIncrement;
            }
        }
    }
}

export namespace GridLayoutEditorColumnsFrame {
    export interface ComponentAccess {
    }

    export type SelectionChangedEventer = (this: void) => void;
    export type FocusChangedEventer = (this: void, column: EditableGridLayoutDefinitionColumn | undefined) => void;
}
