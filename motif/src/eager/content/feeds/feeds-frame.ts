/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    Feed,
    FeedTableRecordSource,
    GridField,
    GridSourceDefinition,
    GridSourceOrReference,
    GridSourceOrReferenceDefinition,
    Integer,
    KeyedCorrectnessList,
    RenderValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextRenderValueCellPainter,
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from '@xilytix/revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class FeedsFrame extends DelayedBadnessGridSourceFrame {
    private _recordSource: FeedTableRecordSource;
    private _recordList: KeyedCorrectnessList<Feed>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    get recordList() { return this._recordList; }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {},
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this.cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this.cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);

        return grid;
    }

    createDefaultLayoutGridSourceOrReferenceDefinition() {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createFeed();
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrReferenceDefinition(gridSourceDefinition);
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: GridSourceOrReference) {
        const table = this.openedTable;
        this._recordSource = table.recordSource as FeedTableRecordSource;
        this._recordList = this._recordSource.recordList;
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const feed = this._recordList.getAt(newRecordIndex);
            this.processFeedFocusChange(feed);
        }
    }

    private processFeedFocusChange(newFocusedFeed: Feed) {
        // not yet used
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
}
