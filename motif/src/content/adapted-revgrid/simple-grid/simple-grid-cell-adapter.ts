import { CellModel, CellPainter } from 'revgrid';

export class SimpleGridCellAdapter implements CellModel {
    constructor(
        private readonly _cellPainter: CellPainter) {
    }

    getCellPainter(): CellPainter | undefined {
        return this._cellPainter;
    }
}
