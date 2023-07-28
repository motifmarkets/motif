import {
    GridField,
    GridSourceDefinition,
    GridSourceOrNamedReference,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    Scan,
    ScanTableRecordSource,
    ScansService
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { AdaptedRevgridBehavioredColumnSettings, HeaderTextCellPainter, RecordGridMainTextCellPainter } from '../../adapted-revgrid/internal-api';
import { DelayedBadnessGridSourceFrame } from '../../delayed-badness-grid-source/internal-api';

export class ScanListFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: ScanListFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: ScanListFrame.RecordFocusedEventer | undefined

    private _recordSource: ScanTableRecordSource;
    private _scansService: ScansService;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    private _filterText = '';
    private _uppercaseFilterText = '';

    // private _dataItem: DayTradesDataItem | undefined;
    // private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessId = CorrectnessId.Suspect;

    get recordList() { return this._scansService; }

    public get filterText() { return this._filterText; }
    public set filterText(value: string) {
        if (value !== this._filterText) {
            this._filterText = value;
            this._uppercaseFilterText = value.toLocaleUpperCase();

            if (this._uppercaseFilterText.length > 0) {
                this.applyFilter((record) => this.filterItems(record as Scan));
            } else {
                this.clearFilter();
            }
        }
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            { fixedColumnCount: 1 },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = new HeaderTextCellPainter(this.settingsService, grid, grid.headerDataServer);
        this._gridMainCellPainter = new RecordGridMainTextCellPainter(this.settingsService, this.textFormatterService, grid, grid.mainDataServer);

        return grid;
    }

    tryOpenWithDefaultLayout(keepView: boolean) {
        const definition = this.createDefaultLayoutGridSourceOrNamedReferenceDefinition();
        return this.tryOpenGridSource(definition, keepView);
    }

    createDefaultLayoutGridSourceOrNamedReferenceDefinition() {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createScan();
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    protected override getDefaultGridSourceOrNamedReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrNamedReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrNamedReference: GridSourceOrNamedReference) {
        const table = this.openedTable;
        this._recordSource = table.recordSource as ScanTableRecordSource;
        this._scansService = this._recordSource.recordList;
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
