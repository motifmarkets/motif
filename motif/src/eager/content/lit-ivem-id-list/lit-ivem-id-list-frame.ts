import {
    AdaptedRevgridBehavioredColumnSettings,
    BadnessComparableList,
    GridField,
    GridSourceDefinition,
    GridSourceOrReference,
    GridSourceOrReferenceDefinition,
    Integer,
    LitIvemId,
    LitIvemIdComparableListTableRecordSource,
    MarketInfo,
    RenderValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class LitIvemIdListFrame extends DelayedBadnessGridSourceFrame {
    getListEventer: LitIvemIdListFrame.GetListEventer | undefined;
    gridSourceOpenedEventer: LitIvemIdListFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: LitIvemIdListFrame.RecordFocusedEventer | undefined
    selectionChangedEventer: LitIvemIdListFrame.SelectionChangedEventer | undefined;

    private _recordSource: LitIvemIdComparableListTableRecordSource;
    private _list: BadnessComparableList<LitIvemId>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    private _filterText = '';
    private _uppercaseFilterText = '';

    // private _dataItem: DayTradesDataItem | undefined;
    // private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessId = CorrectnessId.Suspect;

    get list() { return this._list; }

    public get filterText() { return this._filterText; }
    public set filterText(value: string) {
        if (value !== this._filterText) {
            this._filterText = value;
            this._uppercaseFilterText = value.toLocaleUpperCase();

            if (this._uppercaseFilterText.length > 0) {
                this.applyFilter((record) => {
                    const index = record.index;
                    const listIvemId = this.list.getAt(index);
                    return this.filterItems(listIvemId);
            });
            } else {
                this.clearFilter();
            }
        }
    }

    override finalise() {
        this.grid.selectionChangedEventer = undefined;
        super.finalise();
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            { fixedColumnCount: 1 },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this.cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this.cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);

        grid.selectionChangedEventer = () => {
            if (this.selectionChangedEventer !== undefined) {
                this.selectionChangedEventer();
            }
        }

        return grid;
    }

    tryOpenWithDefaultLayout(list: BadnessComparableList<LitIvemId>, keepView: boolean) {
        const definition = this.createDefaultLayoutGridSourceOrReferenceDefinition(list);
        return this.tryOpenGridSource(definition, keepView);
    }

    createDefaultLayoutGridSourceOrReferenceDefinition(list: BadnessComparableList<LitIvemId>) {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createLitIvemIdComparableList(list);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrReferenceDefinition(gridSourceDefinition);
    }

    deleteSelected() {
        const grid = this.grid;
        if (!grid.isFiltered && grid.selection.allAuto) {
            this._list.clear();
        } else {
            const rowIndices = grid.selection.getRowIndices(true);
            const count = rowIndices.length;
            const recordIndices = new Array<Integer>(count);
            for (let i = 0; i < count; i++) {
                const rowIndex = rowIndices[i];
                recordIndices[i] = this.grid.rowToRecordIndex(rowIndex);
            }
            this.list.removeAtIndices(recordIndices);
        }
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        let list: BadnessComparableList<LitIvemId> | undefined;
        if (this.getListEventer !== undefined) {
            list = this.getListEventer();
        }
        if (list === undefined) {
            list = new BadnessComparableList<LitIvemId>();
        }
        return this.createDefaultLayoutGridSourceOrReferenceDefinition(list);
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: GridSourceOrReference) {
        const table = this.openedTable;
        this._recordSource = table.recordSource as LitIvemIdComparableListTableRecordSource;
        this._list = this._recordSource.list;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer();
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
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

    private filterItems(litIvemId: LitIvemId) {
        if (this._uppercaseFilterText.length === 0) {
            return true;
        } else {
            return litIvemId.code.toUpperCase().includes(this._uppercaseFilterText) || MarketInfo.idToDisplay(litIvemId.litId).toUpperCase().includes(this._uppercaseFilterText);
        }
    }
}

export namespace LitIvemIdListFrame {
    export type GetListEventer = (this: void) => BadnessComparableList<LitIvemId> | undefined;
    export type GridSourceOpenedEventer = (this: void) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type SelectionChangedEventer = (this: void) => void;
}
