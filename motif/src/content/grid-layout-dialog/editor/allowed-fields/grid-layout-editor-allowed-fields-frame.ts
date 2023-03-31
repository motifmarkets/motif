/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
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

export class GridLayoutEditorAllowedFieldsFrame extends ContentFrame {
    selectionChangedEventer: GridLayoutEditorAllowedFieldsFrame.SelectionChangedEventer;

    private _gridSourceFrame: GridSourceFrame;
    private _recordGrid: RecordGrid;

    constructor(
        private readonly _componentAccess: GridLayoutEditorAllowedFieldsFrame.ComponentAccess,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _allowedFields: GridField[],
    ) {
        super();
    }

    get selectedCount() { return 0; }
    get selectedFields() { return new Array<GridField>(0); }

    initialise(gridSourceFrame: GridSourceFrame, recordGrid: RecordGrid) {
        this._gridSourceFrame = gridSourceFrame;
        this._recordGrid = recordGrid;

        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createGridField(this._allowedFields);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        const gridSourceOrNamedReferenceDefinition = new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
        gridSourceFrame.tryOpenGridSource(gridSourceOrNamedReferenceDefinition, false);
    }

    setUsedFieldNames(names: string[]) {

    }

    selectAll() {
        this._recordGrid.selectAllRows();
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
            const field = this._allowedFields[recordIndex];
            const upperHeading = field.heading.toUpperCase();
            if (upperHeading.includes(upperSearchText)) {
                this._recordGrid.focusedRecordIndex = recordIndex;
                break;
            } else {
                rowIndex += rowIncrement;
            }
        }
    }
}

export namespace GridLayoutEditorAllowedFieldsFrame {
    export interface ComponentAccess {
    }

    export type SelectionChangedEventer = (this: void) => void;
}
