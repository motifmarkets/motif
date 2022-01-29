import { SettingsService } from '@motifmarkets/motif-core';
import { CanvasRenderingContext2DEx, CellPainter, RevRecordCellPaintConfig } from 'revgrid';
import { AdaptedRevgridCellPainter } from '../adapted-revgrid-cell-painter';

export class RecordGridCellPainter extends CellPainter {
    private readonly _adaptedRevgridCellPainter: AdaptedRevgridCellPainter;

    constructor(settingsService: SettingsService) {
        super();
        this._adaptedRevgridCellPainter = new AdaptedRevgridCellPainter(settingsService);
    }

    paint(gc: CanvasRenderingContext2DEx, config: RevRecordCellPaintConfig): void {
        this._adaptedRevgridCellPainter.paint(gc, config, config.recordRecentChangeTypeId, config.valueRecentChangeTypeId);
    }
}
