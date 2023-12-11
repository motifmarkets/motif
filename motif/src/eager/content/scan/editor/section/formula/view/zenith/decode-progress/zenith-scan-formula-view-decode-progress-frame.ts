/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgrid,
    AdaptedRevgridBehavioredColumnSettings,
    CellPainterFactoryService,
    GridField,
    Integer,
    IntegerRenderValue,
    RenderValueRowDataArrayGridCellPainter,
    RowDataArrayGrid,
    ScanFormulaZenithEncoding,
    SettingsService,
    StringId,
    StringRenderValue,
    Strings,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { DatalessViewCell, HorizontalAlignEnum, SingleHeadingDataRowArrayServerSet } from 'revgrid';

export class ZenithScanFormulaViewDecodeProgressFrame {
    private _grid: RowDataArrayGrid;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRowDataArrayGridCellPainter<TextRenderValueCellPainter>;
    private _dataBeenSet: boolean;

    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _cellPainterFactoryService: CellPainterFactoryService,
    ) {
    }

    get dataBeenSet() { return this._dataBeenSet; }
    get emWidth() { return this._grid.emWidth; }

    finalise() {
        this._grid.destroy();
    }

    setupGrid(gridHost: HTMLElement) {
        this._grid = this.createGridAndCellPainters(gridHost);
        this._grid.activate();
    }

    setData(nodes: readonly ScanFormulaZenithEncoding.DecodeProgress.DecodedNode[] | undefined) {
        if (nodes === undefined) {
            const rows = new Array<ZenithScanFormulaViewDecodeProgressFrame.DataRow>(1);
            rows[0] = {
                depth: Strings[StringId.Depth],
                nodeType: Strings[StringId.NodeType],
            };
            this._grid.setData(rows, false);
        } else {
            const count = nodes.length;
            const rows = new Array<ZenithScanFormulaViewDecodeProgressFrame.DataRow>(count + 1);
            rows[0] = {
                depth: Strings[StringId.Depth],
                nodeType: Strings[StringId.NodeType],
            };
            for (let i = 0; i < count; i++) {
                const node = nodes[i];
                const row: ZenithScanFormulaViewDecodeProgressFrame.DataRow = {
                    depth: new IntegerRenderValue(node.nodeDepth),
                    nodeType: new StringRenderValue(node.tupleNodeType),
                };
                rows[i + 1] = row;
            }
            this._grid.setData(rows, false);
        }

        this._dataBeenSet = true;
    }

    waitLastServerNotificationRendered() {
        return this._grid.renderer.waitLastServerNotificationRendered();
    }

    calculateActiveColumnsWidth() {
        return this._grid.calculateActiveColumnsWidth();
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
    }

    private createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(gridHostElement);

        grid.rowFocusEventer = (newRowIndex) => this.handleRowFocusEvent(newRowIndex);
        grid.mainClickEventer = (fieldIndex, rowIndex) => this.handleGridClickEvent(fieldIndex, rowIndex);

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextRenderValueRowDataArrayGrid(grid, grid.mainDataServer);

        return grid;
    }

    private createGrid(gridHostElement: HTMLElement) {
        const customGridSettings: AdaptedRevgrid.CustomGridSettings = {
        }

        const grid = new RowDataArrayGrid(
            this._settingsService,
            gridHostElement,
            customGridSettings,
            (index, key, heading) => this.createField(key, heading),
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
            this,
        );
        return grid;
    }

    private createField(key: string, heading: string) {
        const field = RowDataArrayGrid.createField(
            key,
            heading,
            HorizontalAlignEnum.left,
        );
        return field;
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

    // private createDefaultGridLayout() {
    //     const definition = DayTradesGridField.createDefaultGridLayoutDefinition();
    //     return new GridLayout(definition);
    // }

}

export namespace ZenithScanFormulaViewDecodeProgressFrame {
    export interface DataRow extends SingleHeadingDataRowArrayServerSet.DataRow {
        readonly depth: string | IntegerRenderValue;
        readonly nodeType: string | StringRenderValue;
    }
}
