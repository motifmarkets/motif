/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgrid,
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
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { DatalessViewCell, HorizontalAlignEnum } from '@xilytix/revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';


export class SearchDitemFrame extends BuiltinDitemFrame {
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
        super(BuiltinDitemFrame.BuiltinTypeId.Search,
            ditemComponentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );

        const customGridSettings: AdaptedRevgrid.CustomGridSettings = {
            mouseColumnSelectionEnabled: false,
            mouseRowSelectionEnabled: false,
            mouseAddToggleExtendSelectionAreaEnabled: false,
            multipleSelectionAreas: false,
            sortOnDoubleClick: false,
            visibleColumnWidthAdjust: true,
            fixedColumnCount: 0,
        };

        const grid = new RowDataArrayGrid(
            this.settingsService,
            ditemHtmlElement,
            customGridSettings,
            (index, key, heading) => this.createField(index, key, heading),
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

        this._grid.setData(demoSearchResults.slice(), false);
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Search; }

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

    private createField(index: Integer, key: string, heading: string) {
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

interface SearchResult {
    code: string | StringRenderValue;
    company: string | StringRenderValue;
    product: string  | StringRenderValue;
    price: string | StringRenderValue;
}

const demoSearchResults: IndexSignatureHack<readonly SearchResult[]> = [
    {
        code: 'Code',
        company: 'Company',
        product: 'Product',
        price: 'Price',
    },
    {
        code: createAdvertStringRenderValue('trav1.ad'),
        company: createAdvertStringRenderValue('Example Travel Company 1'),
        product: createAdvertStringRenderValue('See Arizona in style'),
        price: createAdvertStringRenderValue('18,000'),
    },
    {
        code: createAdvertStringRenderValue('spc.ad'),
        company: createAdvertStringRenderValue('Spectaculix Travel'),
        product: createAdvertStringRenderValue('Magical Arizona'),
        price: createAdvertStringRenderValue('11,999'),
    },
    {
        code: createAdvertStringRenderValue('trav2.ad'),
        company: createAdvertStringRenderValue('Example Travel Company 1'),
        product: createAdvertStringRenderValue('The best of Arizona'),
        price: createAdvertStringRenderValue('10,500'),
    },
] as const;

function createAdvertStringRenderValue(text: string) {
    const result = new StringRenderValue(text);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}
