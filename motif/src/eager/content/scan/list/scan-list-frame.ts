import {
    AdaptedRevgridBehavioredColumnSettings,
    DataSourceDefinition,
    DataSourceOrReference,
    DataSourceOrReferenceDefinition,
    GridField,
    Integer,
    RenderValueRecordGridCellPainter,
    Scan,
    ScanList,
    ScanTableRecordSource,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from '@xilytix/revgrid';
import { DelayedBadnessGridSourceFrame } from '../../delayed-badness-grid-source/internal-api';

export class ScanListFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: ScanListFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: ScanListFrame.RecordFocusedEventer | undefined

    private _recordSource: ScanTableRecordSource;
    private _scanList: ScanList;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    private _filterText = '';
    private _uppercaseFilterText = '';

    // private _dataItem: DayTradesDataItem | undefined;
    // private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessId = CorrectnessId.Suspect;

    get scanList() { return this._scanList; }

    public get filterText() { return this._filterText; }
    public set filterText(value: string) {
        if (value !== this._filterText) {
            this._filterText = value;
            this._uppercaseFilterText = value.toLocaleUpperCase();

            if (this._uppercaseFilterText.length > 0) {
                this.applyFilter((record) => {
                    const index = record.index;
                    const scan = this._scanList.getAt(index);
                    return this.filterItems(scan);
            });
            } else {
                this.clearFilter();
            }
        }
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            { fixedColumnCount: 1, mouseRowSelectionEnabled: false },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this.cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this.cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);

        return grid;
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: DataSourceOrReference) {
        const table = this.openedTable;
        this._recordSource = table.recordSource as ScanTableRecordSource;
        this._scanList = this._recordSource.recordList;
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

    private createDefaultLayoutGridSourceOrReferenceDefinition() {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createScan();
        const gridSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new DataSourceOrReferenceDefinition(gridSourceDefinition);
    }

    private filterItems(scan: Scan) {
        if (this._uppercaseFilterText.length === 0) {
            return true;
        } else {
            return scan.upperCaseName.includes(this._uppercaseFilterText) || scan.upperCaseDescription.includes(this._uppercaseFilterText);
        }
    }
}

export namespace ScanListFrame {
    export type GridSourceOpenedEventer = (this: void) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
