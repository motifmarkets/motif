import { SettingsService } from '@motifmarkets/motif-core';
import { CanvasRenderingContext2DEx, CellPaintConfig, CellPainter } from 'revgrid';
import { AdaptedRevgridCellPainter } from '../adapted-revgrid-cell-painter';

export class SimpleGridCellPainter extends CellPainter {
    private readonly _adaptedRevgridCellPainter: AdaptedRevgridCellPainter;

    constructor(settingsService: SettingsService) {
        super();
        this._adaptedRevgridCellPainter = new AdaptedRevgridCellPainter(settingsService);
    }

    paint(gc: CanvasRenderingContext2DEx, config: CellPaintConfig): void {
        this._adaptedRevgridCellPainter.paint(gc, config, undefined, undefined);
    }
}
