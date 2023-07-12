/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    GridField,
    GridSourceDefinition,
    GridSourceOrNamedReference,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    LitIvemDetail,
    LitIvemIdFromSearchSymbolsTableRecordSource,
    NamedGridLayoutsService,
    NamedGridSourcesService,
    SearchSymbolsDataDefinition,
    SettingsService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { AdaptedRevgridBehavioredColumnSettings, HeaderTextCellPainter, RecordGridMainTextCellPainter } from '../adapted-revgrid/internal-api';
import { GridSourceFrame } from '../grid-source/internal-api';

export class SearchSymbolsFrame extends GridSourceFrame {
    gridSourceOpenedEventer: SearchSymbolsFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: SearchSymbolsFrame.RecordFocusedEventer | undefined

    private _recordList: LitIvemDetail[];

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    private _showFull: boolean;

    constructor(
        settingsService: SettingsService,
        textFormatterService: TextFormatterService,
        namedGridLayoutsService: NamedGridLayoutsService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        namedGridSourcesService: NamedGridSourcesService,
        componentAccess: GridSourceFrame.ComponentAccess,
        hostElement: HTMLElement,
    ) {
        super(
            settingsService,
            namedGridLayoutsService,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactoryService,
            namedGridSourcesService,
            componentAccess,
            hostElement,
            {},
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
            (viewCell) => this.getGridMainCellPainter(viewCell),
        );

        const grid = this.grid;
        this._gridHeaderCellPainter = new HeaderTextCellPainter(settingsService, grid, grid.headerDataServer);
        this._gridMainCellPainter = new RecordGridMainTextCellPainter(settingsService, textFormatterService, grid, grid.mainDataServer);
    }

    get recordList() { return this._recordList; }

    executeRequest(dataDefinition: SearchSymbolsDataDefinition) {
        this.keepPreviousLayoutIfPossible = dataDefinition.fullSymbol === this._showFull;
        this._showFull = dataDefinition.fullSymbol;

        const gridSourceOrNamedReferenceDefinition = this.createDefaultLayoutGridSourceOrNamedReferenceDefinition(dataDefinition);

        this.tryOpenGridSource(gridSourceOrNamedReferenceDefinition, false);
    }

    protected override getDefaultGridSourceOrNamedReferenceDefinition() {
        return undefined;
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrNamedReference: GridSourceOrNamedReference) {
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

    private createDefaultLayoutGridSourceOrNamedReferenceDefinition(dataDefinition: SearchSymbolsDataDefinition) {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createLitIvemIdFromSearchSymbols(dataDefinition);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
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
