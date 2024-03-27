/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdaptedRevgridBehavioredColumnSettings,
    BrokerageAccountTableRecordSource,
    DataSourceDefinition,
    DataSourceOrReference,
    DataSourceOrReferenceDefinition,
    GridField,
    Integer,
    KeyedCorrectnessList,
    RenderValueRecordGridCellPainter,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from '@xilytix/revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class BrokerageAccountsFrame extends DelayedBadnessGridSourceFrame {
    recordFocusedEventer: BrokerageAccountsFrame.RecordFocusedEventer | undefined

    private _recordSource: BrokerageAccountTableRecordSource;
    private _recordList: KeyedCorrectnessList<Account>;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    get recordList() { return this._recordList; }

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

        return grid;
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrReferenceDefinition();
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: DataSourceOrReference) {
        const table = this.openedTable;
        this._recordSource = table.recordSource as BrokerageAccountTableRecordSource;
        this._recordList = this._recordSource.recordList;
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createDefaultLayoutGridSourceOrReferenceDefinition() {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createBrokerageAccount();
        const gridSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new DataSourceOrReferenceDefinition(gridSourceDefinition);
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


export namespace BrokerageAccountsFrame {
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type GridSourceOpenedEventer = (this: void) => void;
}

