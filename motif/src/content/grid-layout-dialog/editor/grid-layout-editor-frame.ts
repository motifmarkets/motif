/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EditableGridLayoutDefinitionColumnList } from '@motifmarkets/motif-core';
import { ContentFrame } from '../../content-frame';
import { GridLayoutEditorAllowedFieldsFrame } from './allowed-fields/internal-api';
import { GridLayoutEditorColumnsFrame } from './columns/internal-api';

export class GridLayoutEditorFrame extends ContentFrame {

    private _allowedFieldsFrame: GridLayoutEditorAllowedFieldsFrame;
    private _columnsFrame: GridLayoutEditorColumnsFrame;

    constructor(
        private readonly _componentAccess: GridLayoutEditorFrame.ComponentAccess,
        private readonly _columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super();
    }

    initialise(
        allowedFieldsFrame: GridLayoutEditorAllowedFieldsFrame,
        columnsFrame: GridLayoutEditorColumnsFrame,
    ) {
        this._allowedFieldsFrame = allowedFieldsFrame;
        this._columnsFrame = columnsFrame;

        this._allowedFieldsFrame.selectionChangedEventer = () => this.updateControlsDependentOnAllowedFieldsSelection();
        this._columnsFrame.selectionChangedEventer = () => this.updateControlsDependentOnColumnsSelection();

        this.updateControlsDependentOnAllowedFieldsSelection();
        this.updateControlsDependentOnColumnsSelection();
    }

    getGridLayoutDefinition() {
        return this._columnList.createGridLayoutDefinition();
    }

    insertSelectedFields() {
        const selectedFields = this._allowedFieldsFrame.selectedFields;
        this._columnsFrame.appendFields(selectedFields)
    }

    removeSelectedColumns() {
        this._columnsFrame.removeSelectedColumns();
    }

    moveSelectedColumnsUp() {
        this._columnsFrame.moveSelectedColumnsUp()
    }

    moveSelectedColumnsToTop() {
        this._columnsFrame.moveSelectedColumnsToTop();
    }

    moveSelectedColumnsDown() {
        this._columnsFrame.moveSelectedColumnsDown();
    }

    moveSelectedColumnsToBottom() {
        this._columnsFrame.moveSelectedColumnsToBottom();
    }

    private updateControlsDependentOnAllowedFieldsSelection() {
        const selectedCount = this._allowedFieldsFrame.selectedCount;
        this._componentAccess.insertEnabled = selectedCount > 0;
    }

    private updateControlsDependentOnColumnsSelection() {
        const selectedRecordIndices = this._columnsFrame.selectedRecordIndices;
        if (selectedRecordIndices.length === 0) {
            this._componentAccess.removeEnabled = false;
            this._componentAccess.moveTopEnabled = false;
            this._componentAccess.moveUpEnabled = false;
            this._componentAccess.moveDownEnabled = false;
            this._componentAccess.moveBottomEnabled = false;
        } else {
            selectedRecordIndices.sort((left, right) => left - right);
            this._componentAccess.removeEnabled = !this._columnList.areAllIndexedRecordsFixed(selectedRecordIndices);;
            const allSelectedNotAtTop = !this._columnList.areSortedIndexedRecordsAllAtStart(selectedRecordIndices);
            this._componentAccess.moveTopEnabled = allSelectedNotAtTop;
            this._componentAccess.moveUpEnabled = allSelectedNotAtTop;
            const allSelectedNotAtBottom = !this._columnList.areSortedIndexedRecordsAllAtEnd(selectedRecordIndices);
            this._componentAccess.moveDownEnabled = allSelectedNotAtBottom;
            this._componentAccess.moveBottomEnabled = allSelectedNotAtBottom;
        }
    }
}

export namespace GridLayoutEditorFrame {
    export interface ComponentAccess {
        insertEnabled: boolean;
        removeEnabled: boolean;
        moveTopEnabled: boolean;
        moveUpEnabled: boolean;
        moveDownEnabled: boolean;
        moveBottomEnabled: boolean;
    }
}
