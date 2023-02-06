import { ColorScheme, MultiEvent, SettingsService } from '@motifmarkets/motif-core';
import { EventDetail, GridProperties, Revgrid } from 'revgrid';

export abstract class AdaptedRevgrid extends Revgrid {
    resizedEventer: AdaptedRevgrid.ResizedEventer | undefined;
    renderedEventer: AdaptedRevgrid.RenderedEventer | undefined;
    ctrlKeyMouseMoveEventer: AdaptedRevgrid.CtrlKeyMouseMoveEventer | undefined;
    columnsViewWidthsChangedEventer: AdaptedRevgrid.ColumnsViewWidthsChangedEventer | undefined;
    // columnWidthChangedEventer: AdaptedRevgrid.ColumnWidthChangedEventer | undefined;

    protected readonly _settingsService: SettingsService;

    private readonly _ctrlKeyMousemoveListener: (event: MouseEvent) => void;


    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        settingsService: SettingsService,
        gridElement: HTMLElement,
        options: Revgrid.Options,
    ) {
        super(gridElement, options);

        this._settingsService = settingsService;

        this._ctrlKeyMousemoveListener = (event) => this.handleHypegridCtrlKeyMousemoveEvent(event.ctrlKey);

        this.canvas.canvas.addEventListener('mousemove', this._ctrlKeyMousemoveListener);

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    override destroy(): void {
        this.canvas.canvas.removeEventListener('mousemove', this._ctrlKeyMousemoveListener );
        this._settingsService.unsubscribeSettingsChangedEvent(
            this._settingsChangedSubscriptionId
        );
        this._settingsChangedSubscriptionId = undefined;
        super.destroy();
    }

    override fireSyntheticColumnsViewWidthsChangedEvent(eventDetail: EventDetail.ColumnsViewWidthsChanged): boolean {
        if (this.columnsViewWidthsChangedEventer !== undefined) {
            this.columnsViewWidthsChangedEventer(
                eventDetail.fixedChanged,
                eventDetail.nonFixedChanged,
                eventDetail.activeChanged
            );
        }
        return super.fireSyntheticColumnsViewWidthsChangedEvent(eventDetail);
    }

    override fireSyntheticGridResizedEvent(detail: EventDetail.Resize): boolean {
        if (this.resizedEventer !== undefined) {
            this.resizedEventer(detail);
        }
        return super.fireSyntheticGridResizedEvent(detail);
    }

    override fireSyntheticGridRenderedEvent(): boolean {
        if (this.renderedEventer !== undefined) {
            this.renderedEventer();
        }
        return super.fireSyntheticGridRenderedEvent();
    }

    // autoSizeColumnWidth(columnIndex: number): void {
    //     this.autosizeColumn(columnIndex);
    // }

    autoSizeAllColumnWidths(): void {
        this.autosizeAllColumns();
    }

    getHeaderPlusFixedLineHeight(): number {
        const gridProps = this.properties;
        const rowHeight = gridProps.defaultRowHeight;
        let lineWidth = gridProps.fixedLinesHWidth;
        if (lineWidth === undefined) {
            lineWidth = gridProps.gridLinesHWidth;
        }
        return rowHeight + lineWidth;
    }

    moveActiveColumn(fromColumnIndex: number, toColumnIndex: number): void {
        this.showColumns(true, fromColumnIndex, toColumnIndex, false);
    }

    protected applySettings() {
        const updatedProperties = AdaptedRevgrid.createGridPropertiesFromSettings(
            this._settingsService,
            undefined,
            this.properties
        );

        const updatedPropertiesCount = Object.keys(updatedProperties).length;
        let result: boolean;
        if (updatedPropertiesCount > 0) {
            result = this.addProperties(updatedProperties);
        } else {
            result = false;
        }

        return result;
    }

    private handleSettingsChangedEvent(): void {
        const gridPropertiesUpdated = this.applySettings();


        if (!gridPropertiesUpdated) {
            this.invalidateAll();
        }
    }

    private handleHypegridCtrlKeyMousemoveEvent(ctrlKey: boolean) {
        if (ctrlKey && this.ctrlKeyMouseMoveEventer !== undefined) {
            this.ctrlKeyMouseMoveEventer();
        }
    }

    protected abstract invalidateAll(): void;
}

export namespace AdaptedRevgrid {
    export type SettingsChangedEventer = (this: void) => void;
    export type CtrlKeyMouseMoveEventer = (this: void) => void;
    export type ResizedEventer = (this: void, detail: EventDetail.Resize) => void;
    export type RenderedEventer = (this: void /*, detail: Hypergrid.GridEventDetail*/) => void;
    export type ColumnsViewWidthsChangedEventer = (
        this: void,
        fixedChanged: boolean,
        nonFixedChanged: boolean,
        allChanged: boolean
    ) => void;

    export type FrameGridProperties = Pick<
        GridProperties,
        'gridRightAligned' | 'fixedColumnCount'
    >;

    export function createGridPropertiesFromSettings(
        settings: SettingsService,
        frameGridProperties: FrameGridProperties | undefined,
        existingGridProperties: GridProperties | undefined
    ): Partial<GridProperties> {
        const properties: Partial<GridProperties> = {};
        const core = settings.core;
        const color = settings.color;

        if (frameGridProperties !== undefined) {
            const { fixedColumnCount, gridRightAligned } = frameGridProperties;
            if (
                fixedColumnCount >= 0 &&
                fixedColumnCount !== existingGridProperties?.fixedColumnCount
            ) {
                properties.fixedColumnCount = fixedColumnCount;
            }
            if (gridRightAligned !== existingGridProperties?.gridRightAligned) {
                properties.gridRightAligned = gridRightAligned;
            }
        }

        // scrollbarHorizontalThumbHeight,
        // scrollbarVerticalThumbWidth,
        // scrollbarThumbInactiveOpacity,
        // const scrollbarMargin = core.grid_ScrollbarMargin;
        const fontFamily = core.grid_FontFamily;
        if (fontFamily !== '') {
            const fontSize = core.grid_FontSize;
            if (fontSize !== '') {
                const font = fontSize + ' ' + fontFamily;
                if (font !== existingGridProperties?.font) {
                    properties.font = font;
                    properties.foregroundSelectionFont = font;
                }
            }

            const columnHeaderFontSize = core.grid_ColumnHeaderFontSize;
            if (columnHeaderFontSize !== '') {
                const font = columnHeaderFontSize + ' ' + fontFamily;
                if (font !== existingGridProperties?.columnHeaderFont) {
                    properties.columnHeaderFont = font;
                }
                if (
                    font !==
                    existingGridProperties?.columnHeaderForegroundSelectionFont
                ) {
                    properties.columnHeaderForegroundSelectionFont = font;
                }
                if (font !== existingGridProperties?.filterFont) {
                    properties.filterFont = font;
                }
            }
        }

        const defaultRowHeight = core.grid_RowHeight;
        if (
            defaultRowHeight > 0 &&
            defaultRowHeight !== existingGridProperties?.defaultRowHeight
        ) {
            properties.defaultRowHeight = defaultRowHeight;
        }

        const cellPadding = core.grid_CellPadding;
        if (
            cellPadding >= 0 &&
            cellPadding !== existingGridProperties?.cellPadding
        ) {
            properties.cellPadding = cellPadding;
        }

        const gridLinesH = core.grid_HorizontalLinesVisible;
        if (gridLinesH !== existingGridProperties?.gridLinesH) {
            properties.gridLinesH = gridLinesH;
        }

        let gridLinesHWidth: number;
        if (gridLinesH) {
            gridLinesHWidth = core.grid_HorizontalLineWidth;
        } else {
            gridLinesHWidth = 0;
        }
        if (
            gridLinesHWidth !== existingGridProperties?.gridLinesHWidth &&
            gridLinesHWidth >= 0
        ) {
            properties.gridLinesHWidth = gridLinesHWidth;
        }

        const gridLinesV = core.grid_VerticalLinesVisible;
        if (gridLinesV !== existingGridProperties?.gridLinesV) {
            properties.gridLinesV = gridLinesV;
        }

        let gridLinesVWidth: number;
        if (gridLinesV) {
            gridLinesVWidth = core.grid_VerticalLineWidth;
        } else {
            gridLinesVWidth = 0;
        }
        if (
            gridLinesVWidth !== existingGridProperties?.gridLinesVWidth &&
            gridLinesVWidth >= 0
        ) {
            properties.gridLinesVWidth = gridLinesVWidth;
        }

        const scrollHorizontallySmoothly = core.grid_ScrollHorizontallySmoothly;
        if (
            scrollHorizontallySmoothly !==
            existingGridProperties?.scrollHorizontallySmoothly
        ) {
            properties.scrollHorizontallySmoothly = scrollHorizontallySmoothly;
        }

        const bkgdBase = color.getBkgd(ColorScheme.ItemId.Grid_Base);
        if (bkgdBase !== existingGridProperties?.backgroundColor) {
            properties.backgroundColor = bkgdBase;
        }
        const foreBase = color.getFore(ColorScheme.ItemId.Grid_Base);
        if (foreBase !== existingGridProperties?.color) {
            properties.color = foreBase;
        }
        const bkgdColumnHeader = color.getBkgd(
            ColorScheme.ItemId.Grid_ColumnHeader
        );
        if (
            bkgdColumnHeader !==
            existingGridProperties?.columnHeaderBackgroundColor
        ) {
            properties.columnHeaderBackgroundColor = bkgdColumnHeader;
        }
        const foreColumnHeader = color.getFore(
            ColorScheme.ItemId.Grid_ColumnHeader
        );
        if (foreColumnHeader !== existingGridProperties?.columnHeaderColor) {
            properties.columnHeaderColor = foreColumnHeader;
        }
        const bkgdSelection = color.getBkgd(
            ColorScheme.ItemId.Grid_FocusedCell
        );
        if (
            bkgdSelection !== existingGridProperties?.backgroundSelectionColor
        ) {
            properties.backgroundSelectionColor = bkgdSelection;
        }
        const foreSelection = color.getFore(
            ColorScheme.ItemId.Grid_FocusedCell
        );
        if (
            foreSelection !== existingGridProperties?.foregroundSelectionColor
        ) {
            properties.foregroundSelectionColor = foreSelection;
        }
        if (
            bkgdColumnHeader !==
            existingGridProperties?.columnHeaderBackgroundSelectionColor
        ) {
            properties.columnHeaderBackgroundSelectionColor = bkgdColumnHeader;
        }
        if (
            foreColumnHeader !==
            existingGridProperties?.columnHeaderForegroundSelectionColor
        ) {
            properties.columnHeaderForegroundSelectionColor = foreColumnHeader;
        }
        const foreFocusedCellBorder = color.getFore(
            ColorScheme.ItemId.Grid_FocusedCellBorder
        );
        if (
            foreFocusedCellBorder !==
            existingGridProperties?.selectionRegionOutlineColor
        ) {
            properties.selectionRegionOutlineColor = foreFocusedCellBorder;
        }
        const foreVerticalLine = color.getFore(
            ColorScheme.ItemId.Grid_VerticalLine
        );
        if (foreVerticalLine !== existingGridProperties?.gridLinesHColor) {
            properties.gridLinesHColor = foreVerticalLine;
        }
        const foreHorizontalLine = color.getFore(
            ColorScheme.ItemId.Grid_HorizontalLine
        );
        if (foreHorizontalLine !== existingGridProperties?.gridLinesVColor) {
            properties.gridLinesVColor = foreHorizontalLine;
        }
        if (foreVerticalLine !== existingGridProperties?.fixedLinesHColor) {
            properties.fixedLinesHColor = foreVerticalLine;
        }
        if (foreHorizontalLine !== existingGridProperties?.fixedLinesVColor) {
            properties.fixedLinesVColor = foreHorizontalLine;
        }
        // uncomment below when row stripes are working
        // const bkgdBaseAlt = color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);
        // properties.rowStripes = [
        //     {
        //         backgroundColor: bkgdBase,
        //     },
        //     {
        //         backgroundColor: bkgdBaseAlt,
        //     }
        // ];

        return properties;
    }
}
