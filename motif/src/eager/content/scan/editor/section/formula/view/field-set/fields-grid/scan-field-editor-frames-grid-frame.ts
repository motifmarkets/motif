/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    AssertInternalError,
    Badness,
    BadnessComparableList,
    CheckboxRenderValueRecordGridCellEditor,
    CheckboxRenderValueRecordGridCellPainter,
    GridField,
    GridLayoutOrReferenceDefinition,
    GridSourceDefinition,
    GridSourceOrReferenceDefinition,
    Integer,
    RenderValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextRenderValueCellPainter,
    TypedGridSourceOrReference
} from '@motifmarkets/motif-core';
import { CellEditor, DatalessViewCell, Subgrid, ViewCell } from '@xilytix/revgrid';
import { GridSourceFrame } from '../../../../../../../grid-source/internal-api';
import { ScanFieldEditorFrame } from '../field/internal-api';
import { ScanFieldEditorFrameComparableListTableRecordSource } from './scan-field-editor-frame-comparable-list-table-record-source';
import { ScanFieldEditorFrameComparableListTableRecordSourceDefinition } from './scan-field-editor-frame-comparable-list-table-record-source-definition';

export class ScanFieldEditorFramesGridFrame extends GridSourceFrame {
    recordFocusedEventer: ScanFieldEditorFramesGridFrame.RecordFocusedEventer | undefined

    private _list: BadnessComparableList<ScanFieldEditorFrame>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;
    private _visibleCheckboxPainter: CheckboxRenderValueRecordGridCellPainter;
    private _visibleCheckboxEditor: CheckboxRenderValueRecordGridCellEditor;
    private _widthEditor: CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField>;

    get list() { return this._list; }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {
                fixedColumnCount: 1,
                mouseColumnSelectionEnabled: false,
                switchNewRectangleSelectionToRowOrColumn: 'row',
            },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this.cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this.cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxPainter = this.cellPainterFactoryService.createCheckboxRenderValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxEditor = new CheckboxRenderValueRecordGridCellEditor(this.settingsService, grid, grid.mainDataServer);

        grid.focus.getCellEditorEventer = (
            field,
            subgridRowIndex,
            subgrid,
            readonly,
            viewCell
        ) => this.getCellEditor(field, subgridRowIndex, subgrid, readonly, viewCell);


        return grid;
    }

    tryOpenList(list: BadnessComparableList<ScanFieldEditorFrame>, keepView: boolean) {
        const definition = this.createListGridSourceOrReferenceDefinition(list, undefined);
        return this.tryOpenGridSource(definition, keepView);
    }

    getScanFieldEditorFrameAt(index: Integer) {
        return this._list.getAt(index);
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        const list = new BadnessComparableList<ScanFieldEditorFrame>();
        return this.createListGridSourceOrReferenceDefinition(list, undefined);
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: TypedGridSourceOrReference) {
        const table = this.openedTable;
        const recordSource = table.recordSource as ScanFieldEditorFrameComparableListTableRecordSource;
        this._list = recordSource.list;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('GLECFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createListGridSourceOrReferenceDefinition(list: BadnessComparableList<ScanFieldEditorFrame>, layoutDefinition: GridLayoutOrReferenceDefinition | undefined) {
        const tableRecordSourceDefinition = new ScanFieldEditorFrameComparableListTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachedFactoryService,
            list,
        );
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, layoutDefinition, undefined);
        return new GridSourceOrReferenceDefinition(gridSourceDefinition);
    }

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private getCellEditor(
        field: GridField,
        subgridRowIndex: Integer,
        _subgrid: Subgrid<AdaptedRevgridBehavioredColumnSettings, GridField>,
        readonly: boolean,
        _viewCell: ViewCell<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined
    ): CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        return this.tryGetCellEditor(field.definition.sourcelessName, readonly, subgridRowIndex);
    }

    private tryGetCellEditor(sourcelesFieldName: string, readonly: boolean, subgridRowIndex: Integer): CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        // if (sourcelesFieldName === EditableGridLayoutDefinitionColumn.FieldName.visible) {
        //     this._visibleCheckboxEditor.readonly = readonly || subgridRowIndex < this._recordList.fixedColumnCount;
        //     return this._visibleCheckboxEditor;
        // } else {
        //     if (sourcelesFieldName === EditableGridLayoutDefinitionColumn.FieldName.width) {
        //         this._widthEditor.readonly = readonly
        //         return this._widthEditor;
        //     } else {
                return undefined;
        //     }
        // }
    }
}

export namespace ScanFieldEditorFramesGridFrame {
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
