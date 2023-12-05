/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    CellPainterFactoryService,
    GridField,
    GridFieldSourceDefinition,
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
    readonly initialised = true;

    private readonly _grid: RowDataArrayGrid;

    private readonly _gridHeaderCellPainter: TextHeaderCellPainter;
    private readonly _gridMainCellPainter: RenderValueRowDataArrayGridCellPainter<TextRenderValueCellPainter>;

    constructor(
        settingsService: SettingsService,
        cellPainterFactoryService: CellPainterFactoryService,
        ditemHtmlElement: HTMLElement,
    ) {
        const grid = new RowDataArrayGrid(
            settingsService,
            ditemHtmlElement,
            {},
            (index, key, heading) => this.createField(key, heading),
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            this,
        );
        this._grid = grid;

        grid.rowFocusEventer = (newRowIndex) => this.handleRowFocusEvent(newRowIndex);
        grid.mainClickEventer = (fieldIndex, rowIndex) => this.handleGridClickEvent(fieldIndex, rowIndex);

        this._gridHeaderCellPainter = cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = cellPainterFactoryService.createTextRenderValueRowDataArrayGrid(grid, grid.mainDataServer);
    }

    finalise() {
        this._grid.destroy();
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
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
    }

    private createField(key: string, heading: string) {
        const field = RowDataArrayGrid.createField(
            ZenithScanFormulaViewDecodeProgressFrame.gridFieldSourceDefinition,
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
}

export namespace ZenithScanFormulaViewDecodeProgressFrame {
    export const gridFieldSourceDefinition = new GridFieldSourceDefinition('ZenithScanFormulaViewDecodeProgress');

    export interface DataRow extends SingleHeadingDataRowArrayServerSet.DataRow {
        readonly depth: string | IntegerRenderValue;
        readonly nodeType: string | StringRenderValue;
    }
}
