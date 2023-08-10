/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ContentFrame } from '../../content-frame';
import { GridLayoutEditorAllowedFieldsFrame } from './allowed-fields/internal-api';
import { GridLayoutEditorColumnsFrame } from './columns/internal-api';

export class GridLayoutEditorFrame extends ContentFrame {

    private _allowedFieldsFrame: GridLayoutEditorAllowedFieldsFrame;
    private _columnsFrame: GridLayoutEditorColumnsFrame;

    constructor(
        private readonly _componentAccess: GridLayoutEditorFrame.ComponentAccess,
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

    insertSelectedFields() {
        const selectedFields = this._allowedFieldsFrame.selectedFields;
        if (selectedFields.length > 0) {
            this._columnsFrame.insertFields(selectedFields);
        }
    }

    removeSelectedColumns() {
        this._columnsFrame.removeSelected();
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

    private updateControlsDependentOnAllowedFieldsSelection() {
        const selectedCount = this._allowedFieldsFrame.selectedCount;
        this._componentAccess.insertEnabled = selectedCount > 0;
    }

    private updateControlsDependentOnColumnsSelection() {
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
