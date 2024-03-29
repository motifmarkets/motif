/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    AdiService,
    CellPainterFactoryService,
    CommandRegisterService,
    GridField,
    IndexSignatureHack,
    Integer,
    RenderValue,
    RenderValueRowDataArrayGridCellPainter,
    RowDataArrayGrid,
    SettingsService,
    StringRenderValue,
    SymbolsService,
    TextHeaderCellPainter,
    TextRenderValueCellPainter,
    TimeRenderValue
} from '@motifmarkets/motif-core';
import { DatalessViewCell, HorizontalAlignEnum } from '@xilytix/revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class AlertsDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    private readonly _grid: RowDataArrayGrid;

    private readonly _gridHeaderCellPainter: TextHeaderCellPainter;
    private readonly _gridMainCellPainter: RenderValueRowDataArrayGridCellPainter<TextRenderValueCellPainter>;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        cellPainterFactoryService: CellPainterFactoryService,
        ditemHtmlElement: HTMLElement,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Alerts,
            ditemComponentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        const grid = new RowDataArrayGrid(
            this.settingsService,
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

        this._grid.setData(demoAlerts.slice(), false);
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Alerts; }

    override finalise() {
        this._grid.destroy();
        super.finalise();
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
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
}

interface Alert {
    code: string | StringRenderValue;
    time: Date | string  | TimeRenderValue;
    eventText: string | StringRenderValue;
}

const demoAlerts: IndexSignatureHack<readonly Alert[]> = [
    {
        code: 'Code',
        time: 'Time',
        eventText: 'Event',
    },
    {
        code: 'BHP.AX',
        time: new TimeRenderValue(new Date(2022, 1, 31, 12, 43)),
        eventText: 'BHP.AX last price dropped below 45',
    },
    {
        code: createAdvertStringRenderValue('SPC.AD'),
        time: createAdvertTimeRenderValue(new Date(2022, 1, 31, 11, 48)),
        eventText: createAdvertStringRenderValue('New Arizona holiday package under $12000 announced'),
    },
    {
        code: 'CBA.AX',
        time: new TimeRenderValue(new Date(2022, 1, 31, 11, 10)),
        eventText: 'CBA.AX moving average crossing',
    },
] as const;

function createAdvertStringRenderValue(text: string) {
    const result = new StringRenderValue(text);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}

function createAdvertTimeRenderValue(value: Date) {
    const result = new TimeRenderValue(value);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}
