import {
    BigIntRenderValue,
    DateTimeRenderValue,
    NumberRenderValue,
    RenderValue,
    SettingsService,
    StringRenderValue,
    TextFormatterService,
    TrueFalseRenderValue
} from '@motifmarkets/motif-core';
import {
    CanvasRenderingContext2DEx,
    CellPaintConfig,
    CellPainter,
    DataModel,
    RevSimpleAdapterSet
} from 'revgrid';
import { AdaptedRevgridCellPainter } from '../adapted-revgrid-cell-painter';

export class SimpleGridCellPainter extends CellPainter {
    private readonly _adaptedRevgridCellPainter: AdaptedRevgridCellPainter;

    constructor(settingsService: SettingsService, textFormatterService: TextFormatterService) {
        super();
        this._adaptedRevgridCellPainter = new AdaptedRevgridCellPainter(
            settingsService,
            textFormatterService,
        );
    }

    paint(gc: CanvasRenderingContext2DEx, config: CellPaintConfig): void {
        this._adaptedRevgridCellPainter.paint(
            gc,
            config,
            this.createRenderValue(config.value),
            undefined,
            undefined
        );
    }

    createRenderValue(configValue: SimpleGridCellPainter.DataValue): RenderValue {
        switch (typeof configValue) {
            case 'string':
                return new StringRenderValue(configValue);
            case 'number':
                return new NumberRenderValue(configValue);
            case 'boolean':
                return new TrueFalseRenderValue(configValue);
            case 'bigint':
                return new BigIntRenderValue(configValue);
            case 'object': {
                if (configValue instanceof RenderValue) {
                    return configValue as RenderValue;
                } else {
                    if (Object.prototype.toString.call(configValue) === '[object Date]') {
                        return new DateTimeRenderValue(configValue as Date);
                    } else {
                        return new StringRenderValue('');
                    }
                }
            }
            default:
                return new StringRenderValue('');
        }
    }
}

export namespace SimpleGridCellPainter {
    export type DataValue = DataModel.DataValue | string | RenderValue;
    export interface DataRow extends RevSimpleAdapterSet.DataRow {
        [columnName: string]: DataValue;
    }
}
