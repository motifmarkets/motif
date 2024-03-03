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
    LitIvemIdExecuteScanDataDefinition,
    LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    RankedLitIvemIdList,
    RankedLitIvemIdListTableRecordSource,
    RenderValueRecordGridCellPainter,
    StringId,
    Strings,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from '@xilytix/revgrid';
import { DelayedBadnessGridSourceFrame } from '../../../delayed-badness-grid-source/internal-api';

export class ScanTestMatchesFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: ScanTestMatchesFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: ScanTestMatchesFrame.RecordFocusedEventer | undefined

    private _rankedLitIvemIdList: RankedLitIvemIdList;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    private _showFull: boolean;

    get rankedLitIvemIdList() { return this._rankedLitIvemIdList; }

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

    executeTest(
        name: string,
        description: string,
        category: string,
        dataDefinition: LitIvemIdExecuteScanDataDefinition
    ) {
        this.keepPreviousLayoutIfPossible = true;

        const gridSourceOrReferenceDefinition = this.createDefaultLayoutGridSourceOrReferenceDefinition(name, description, category, dataDefinition);

        const openPromise = this.tryOpenGridSource(gridSourceOrReferenceDefinition, false);
        openPromise.then(
            (result) => {
                if (result.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.ScanTestMatches]}: ${result.error}`);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SSFER13971') }
        );
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        throw new AssertInternalError('SCMFGDGSORD44218');
        return new GridSourceOrReferenceDefinition(''); // Invalid definition - should never be returned
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: GridSourceOrReference) {
        const table = this.openedTable;
        const recordSource = table.recordSource as RankedLitIvemIdListTableRecordSource;
        this._rankedLitIvemIdList = recordSource.recordList;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer();
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition(
        name: string,
        description: string,
        category: string,
        dataDefinition: LitIvemIdExecuteScanDataDefinition
    ) {
        const listDefinition = new LitIvemIdExecuteScanRankedLitIvemIdListDefinition(
            name,
            description,
            category,
            dataDefinition
        )
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createScanTest(listDefinition);
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

export namespace ScanTestMatchesFrame {
    export type GridSourceOpenedEventer = (this: void) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
