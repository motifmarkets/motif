/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Feed,
    FeedTableRecordSource,
    GridField,
    GridSourceDefinition,
    GridSourceOrNamedReference,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    KeyedCorrectnessList
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { AdaptedRevgridBehavioredColumnSettings, HeaderTextCellPainter, RecordGridMainTextCellPainter } from '../adapted-revgrid/internal-api';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class FeedsFrame extends DelayedBadnessGridSourceFrame {
    private _recordSource: FeedTableRecordSource;
    private _recordList: KeyedCorrectnessList<Feed>;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    get recordList() { return this._recordList; }

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

        return grid;
    }

    tryOpenWithDefaultLayout(keepView: boolean) {
        const definition = this.createDefaultLayoutGridSourceOrNamedReferenceDefinition();
        return this.tryOpenGridSource(definition, keepView);
    }

    createDefaultLayoutGridSourceOrNamedReferenceDefinition() {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createFeed();
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    protected override getDefaultGridSourceOrNamedReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrNamedReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrNamedReference: GridSourceOrNamedReference) {
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
