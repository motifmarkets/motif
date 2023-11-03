/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    AssertInternalError,
    GridField,
    GridSourceDefinition,
    GridSourceOrReference,
    GridSourceOrReferenceDefinition,
    Integer,
    LitIvemDetail,
    LitIvemIdFromSearchSymbolsTableRecordSource,
    RenderValueRecordGridCellPainter,
    SearchSymbolsDataDefinition,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class SearchSymbolsFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: SearchSymbolsFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: SearchSymbolsFrame.RecordFocusedEventer | undefined

    private _recordList: LitIvemDetail[];

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    private _showFull: boolean;

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

    executeRequest(dataDefinition: SearchSymbolsDataDefinition) {
        this.keepPreviousLayoutIfPossible = dataDefinition.fullSymbol === this._showFull;
        this._showFull = dataDefinition.fullSymbol;

        const gridSourceOrReferenceDefinition = this.createDefaultLayoutGridSourceOrReferenceDefinition(dataDefinition);

        const gridSourceOrReferencePromise = this.tryOpenGridSource(gridSourceOrReferenceDefinition, false);
        AssertInternalError.throwErrorIfVoidPromiseRejected(gridSourceOrReferencePromise, 'SSFER13971', `${this.opener.lockerName}: ${dataDefinition.description}`);
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return undefined;
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: GridSourceOrReference) {
        const table = this.openedTable;
        const recordSource = table.recordSource as LitIvemIdFromSearchSymbolsTableRecordSource;
        this._recordList = recordSource.recordList;
        const dataDefinition = recordSource.dataDefinition;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer(dataDefinition);
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition(dataDefinition: SearchSymbolsDataDefinition) {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createLitIvemIdFromSearchSymbols(dataDefinition);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
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
}

export namespace SearchSymbolsFrame {
    export type GridSourceOpenedEventer = (this: void, dataDefinition: SearchSymbolsDataDefinition) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
