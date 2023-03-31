/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EditableGridLayoutDefinitionColumn } from '@motifmarkets/motif-core';
import { ContentFrame } from '../../content-frame';
import { GridLayoutEditorAllowedFieldsFrame } from './allowed-fields/internal-api';
import { GridLayoutEditorColumnPropertiesFrame } from './column-properties/internal-api';
import { GridLayoutEditorColumnsFrame } from './columns/internal-api';

export class GridLayoutEditorFrame extends ContentFrame {

    private _allowedFieldsFrame: GridLayoutEditorAllowedFieldsFrame;
    private _columnsFrame: GridLayoutEditorColumnsFrame;
    private _columnPropertiesFrame: GridLayoutEditorColumnPropertiesFrame;

    constructor(
        private readonly _componentAccess: GridLayoutEditorFrame.ComponentAccess,
    ) {
        super();
    }

    initialise(
        allowedFieldsFrame: GridLayoutEditorAllowedFieldsFrame,
        columnsFrame: GridLayoutEditorColumnsFrame,
        columnPropertiesFrame: GridLayoutEditorColumnPropertiesFrame,
    ) {
        this._allowedFieldsFrame = allowedFieldsFrame;
        this._columnsFrame = columnsFrame;
        this._columnPropertiesFrame = columnPropertiesFrame;

        this._allowedFieldsFrame.selectionChangedEventer = () => this.handleAllowedFieldsSelectionChanged();
        this._columnsFrame.selectionChangedEventer = () => this.handleColumnsSelectionChanged();
        this._columnsFrame.focusChangedEventer = (focusedColumn) => this.handleColumnsFocusChanged(focusedColumn);
    }

    insertSelectedFields() {
        const selectedFields = this._allowedFieldsFrame.selectedFields;
        if (selectedFields.length > 0) {
            this._columnsFrame.insertFields(selectedFields);
            this.updateUsedFieldNames();
        }
    }

    removeSelectedColumns() {
        const removeCount = this._columnsFrame.removeSelected();
        if (removeCount > 0) {
            this.updateUsedFieldNames();
        }
    }

    moveSelectedColumnsUp() {
        this._columnsFrame.moveSelectedUp();
    }

    moveSelectedColumnsToTop() {
        this._columnsFrame.moveSelectedToTop();
    }

    moveSelectedColumnsDown() {
        this._columnsFrame.moveSelectedDown();
    }

    moveSelectedColumnsToBottom() {
        this._columnsFrame.moveSelectedToBottom();
    }

    private handleAllowedFieldsSelectionChanged() {
        const selectedCount = this._allowedFieldsFrame.selectedCount;
        this._componentAccess.insertEnabled = selectedCount > 0;
    }

    private handleColumnsSelectionChanged() {
        const selectedCount = this._columnsFrame.selectedCount;
        if (selectedCount === 0) {
            this._componentAccess.removeEnabled = false;
            this._componentAccess.moveTopEnabled = false;
            this._componentAccess.moveUpEnabled = false;
            this._componentAccess.moveDownEnabled = false;
            this._componentAccess.moveBottomEnabled = false;
        } else {
            this._componentAccess.removeEnabled = true;
            const allSelectedNotAtTop = !this._columnsFrame.isAllSelectedAtTop();
            this._componentAccess.moveTopEnabled = allSelectedNotAtTop;
            this._componentAccess.moveUpEnabled = allSelectedNotAtTop;
            const allSelectedNotAtBottom = !this._columnsFrame.isAllSelectedAtBottom();
            this._componentAccess.moveDownEnabled = allSelectedNotAtBottom;
            this._componentAccess.moveBottomEnabled = allSelectedNotAtBottom;
        }
    }

    private handleColumnsFocusChanged(focusedColumn: EditableGridLayoutDefinitionColumn | undefined) {
        this._columnPropertiesFrame.setColumn(focusedColumn);
    }

    private updateUsedFieldNames() {
        const usedFieldNames = this._columnsFrame.getAllFieldNames();
        this._allowedFieldsFrame.setUsedFieldNames(usedFieldNames);
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
