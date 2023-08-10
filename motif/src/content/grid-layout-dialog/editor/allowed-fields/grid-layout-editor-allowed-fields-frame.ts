/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    AssertInternalError,
    Badness,
    EditableGridLayoutDefinitionColumnList,
    GridField,
    GridFieldTableRecordSource,
    GridSourceDefinition,
    GridSourceOrNamedReference,
    GridSourceOrNamedReferenceDefinition,
    HeaderTextCellPainter,
    Integer,
    JsonElement,
    LockOpenListItem,
    ModifierKey,
    ModifierKeyId,
    MultiEvent,
    NamedGridLayoutsService,
    NamedGridSourcesService,
    RecordGridMainTextCellPainter,
    SettingsService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService,
    TextFormatterService,
    UsableListChangeTypeId,
} from '@motifmarkets/motif-core';
import { DatalessViewCell, RevRecord } from 'revgrid';
import { GridSourceFrame } from '../../../grid-source/internal-api';

export class GridLayoutEditorAllowedFieldsFrame extends GridSourceFrame {
    selectionChangedEventer: GridLayoutEditorAllowedFieldsFrame.SelectionChangedEventer | undefined;

    private _records: readonly GridField[];

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    private _columnListChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        settingsService: SettingsService,
        textFormatterService: TextFormatterService,
        namedGridLayoutsService: NamedGridLayoutsService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        namedGridSourcesService: NamedGridSourcesService,
        private readonly _allowedFields: GridField[],
        private readonly _columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super(
            settingsService,
            textFormatterService,
            namedGridLayoutsService,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactoryService,
            namedGridSourcesService,
        );

        this._columnListChangeSubscriptionId = this._columnList.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleColumnListChangeEvent(listChangeTypeId, idx, count)
        );
    }

    get selectedCount() {
        const selection = this.grid.selection;
        return selection.getRowCount();
    }

    get selectedFields() {
        const selection = this.grid.selection
        const rowIndices = selection.getRowIndices();
        const count = rowIndices.length;
        const fields = new Array<GridField>(count);
        for (let i = 0; i < count; i++) {
            const rowIndex = rowIndices[i];
            const recordIndex = this.grid.rowToRecordIndex(rowIndex);
            fields[i] = this._records[recordIndex];
        }
        return fields;
    }

    override finalise() {
        super.finalise();
        this._columnList.unsubscribeListChangeEvent(this._columnListChangeSubscriptionId);
        this._columnListChangeSubscriptionId = undefined;
        this.grid.clearFilter();
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {},
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = new HeaderTextCellPainter(this.settingsService, grid, grid.headerDataServer);
        this._gridMainCellPainter = new RecordGridMainTextCellPainter(this.settingsService, this.textFormatterService, grid, grid.mainDataServer);

        grid.selectionChangedEventer = () => this.handleGridSelectionChangedEventer();

        return grid;
    }

    override initialiseGrid(
        opener: LockOpenListItem.Opener,
        frameElement: JsonElement | undefined,
        keepPreviousLayoutIfPossible: boolean,
    ) {
        super.initialiseGrid(opener, frameElement, keepPreviousLayoutIfPossible);
        this.applyColumnListFilter();
    }

    selectAll() {
        this.grid.selectAllRows();
    }

    tryFocusFirstSearchMatch(searchText: string) {
        this.tryFocusNextSearchMatchFromRow(searchText, 0, false);
    }

    tryFocusNextSearchMatch(searchText: string, downKeys: ModifierKey.IdSet) {
        const backwards = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        const focusedRecIdx = this.grid.focusedRecordIndex;

        let rowIndex: Integer;
        if (focusedRecIdx === undefined) {
            rowIndex = 0;
        } else {
            const focusedRowIdx = this.grid.recordToRowIndex(focusedRecIdx);
            if (backwards) {
                rowIndex = focusedRowIdx - 1;
            } else {
                rowIndex = focusedRowIdx + 1;
            }
        }

        this.tryFocusNextSearchMatchFromRow(searchText, rowIndex, backwards);
    }

    protected override getDefaultGridSourceOrNamedReferenceDefinition() {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createGridField(this._allowedFields);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrNamedReference: GridSourceOrNamedReference) {
        const table = this.openedTable;
        const recordSource = table.recordSource as GridFieldTableRecordSource;
        this._records = recordSource.records;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('GLEAFFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    // initialiseGrid(gridSourceFrame: GridSourceFrame) {
    //     this._gridSourceFrame = gridSourceFrame;
    //     // this._recordGrid = recordGrid;

    //     const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createGridField(this._allowedFields);
    //     const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
    //     const gridSourceOrNamedReferenceDefinition = new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    //     gridSourceFrame.tryOpenGridSource(gridSourceOrNamedReferenceDefinition, false);
    // }

    private handleGridSelectionChangedEventer() {
        if (this.selectionChangedEventer !== undefined) {
            this.selectionChangedEventer();
        }
    }

    private handleColumnListChangeEvent(_listChangeTypeId: UsableListChangeTypeId, _idx: Integer, _count: Integer) {
        this.applyColumnListFilter();
    }

    private tryFocusNextSearchMatchFromRow(searchText: string, rowIndex: Integer, backwards: boolean) {
        const rowIncrement = backwards ? -1 : 1;
        const upperSearchText = searchText.toUpperCase();
        const rowCount = 0; //this._recordGrid.getRowCount();

        while (rowIndex >= 0 && rowIndex < rowCount) {
            const recordIndex = this.grid.rowToRecordIndex(rowIndex);
            const field = this._allowedFields[recordIndex];
            const upperHeading = field.heading.toUpperCase();
            if (upperHeading.includes(upperSearchText)) {
                this.grid.focusedRecordIndex = recordIndex;
                break;
            } else {
                rowIndex += rowIncrement;
            }
        }
    }

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private applyColumnListFilter() {
        this.grid.applyFilter((record) => this.filterInuseFields(record));
    }

    private filterInuseFields(record: RevRecord) {
        const gridField = this._records[record.index];
        return !this._columnList.includesField(gridField);
    }
}

export namespace GridLayoutEditorAllowedFieldsFrame {
    export type SelectionChangedEventer = (this: void) => void;
}
