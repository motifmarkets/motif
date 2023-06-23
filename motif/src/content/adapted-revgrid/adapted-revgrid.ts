import { ColorScheme, GridField, MultiEvent, SettingsService } from '@motifmarkets/motif-core';
import { EventDetail, GridSettings, Revgrid } from 'revgrid';
import {
    AdaptedRevgridBehavioredColumnSettings,
    AdaptedRevgridBehavioredGridSettings,
    AdaptedRevgridGridSettings,
    InMemoryAdaptedRevgridBehavioredColumnSettings,
    InMemoryAdaptedRevgridBehavioredGridSettings,
    defaultAdaptedRevgridColumnSettings,
    defaultAdaptedRevgridGridSettings,
} from './settings/content-adapted-revgrid-settings-internal-api';

export abstract class AdaptedRevgrid extends Revgrid<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField> {
    resizedEventer: AdaptedRevgrid.ResizedEventer | undefined;
    renderedEventer: AdaptedRevgrid.RenderedEventer | undefined;
    ctrlKeyMouseMoveEventer: AdaptedRevgrid.CtrlKeyMouseMoveEventer | undefined;
    columnsViewWidthsChangedEventer: AdaptedRevgrid.ColumnsViewWidthsChangedEventer | undefined;
    // columnWidthChangedEventer: AdaptedRevgrid.ColumnWidthChangedEventer | undefined;

    protected readonly _settingsService: SettingsService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        settingsService: SettingsService,
        gridElement: HTMLElement,
        definition: Revgrid.Definition<AdaptedRevgridBehavioredColumnSettings, GridField>,
        gridSettings: AdaptedRevgridBehavioredGridSettings,
        getSettingsForNewColumnEventer: Revgrid.GetSettingsForNewColumnEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    ) {
        const options: Revgrid.Options<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField> = {
            canvasRenderingContext2DSettings: {
                alpha: false,
            }
        }
        super(gridElement, definition, gridSettings, getSettingsForNewColumnEventer, options);

        this._settingsService = settingsService;

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    override destroy(): void {
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
        const updatedProperties = AdaptedRevgrid.createSettingsServiceGridSettings(
            this._settingsService,
            undefined,
            this.settings,
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

    export type FrameGridSettings = Pick<
        GridSettings,
        'gridRightAligned' | 'fixedColumnCount'
    >;

    export function createGridSettings(settingsService: SettingsService, customSettings: Partial<AdaptedRevgridGridSettings>): AdaptedRevgridBehavioredGridSettings {
        const settingsServiceGridSettings = createSettingsServiceGridSettings(settingsService);
        const gridSettings = new InMemoryAdaptedRevgridBehavioredGridSettings();
        gridSettings.merge(defaultAdaptedRevgridGridSettings);
        gridSettings.merge(customSettings);
        gridSettings.merge(settingsServiceGridSettings);
        return gridSettings;
    }

    export function createColumnSettings(gridSettings: AdaptedRevgridBehavioredGridSettings): AdaptedRevgridBehavioredColumnSettings {
        const columnSettings = new InMemoryAdaptedRevgridBehavioredColumnSettings(gridSettings);
        columnSettings.merge(defaultAdaptedRevgridColumnSettings);
        return columnSettings;
    }

    export function createSettingsServiceGridSettings(settingsService: SettingsService) {
        const gridSettings: Partial<AdaptedRevgridGridSettings> = {};
        const core = settingsService.core;
        const color = settingsService.color;

        // scrollbarHorizontalThumbHeight,
        // scrollbarVerticalThumbWidth,
        // scrollbarThumbInactiveOpacity,
        // const scrollbarMargin = core.grid_ScrollbarMargin;
        const fontFamily = core.grid_FontFamily;
        if (fontFamily !== '') {
            const fontSize = core.grid_FontSize;
            if (fontSize !== '') {
                const font = fontSize + ' ' + fontFamily;
                gridSettings.font = font;
            }

            const columnHeaderFontSize = core.grid_ColumnHeaderFontSize;
            if (columnHeaderFontSize !== '') {
                const font = columnHeaderFontSize + ' ' + fontFamily;
                gridSettings.columnHeaderFont = font;
                gridSettings.filterFont = font;
            }
        }

        gridSettings.defaultRowHeight = core.grid_RowHeight;
        gridSettings.cellPadding = core.grid_CellPadding;

        const horizontalLinesVisible = core.grid_HorizontalLinesVisible;
        gridSettings.horizontalGridLinesVisible = horizontalLinesVisible;
        if (horizontalLinesVisible) {
            gridSettings.horizontalGridLinesWidth = core.grid_HorizontalLineWidth;
        } else {
            gridSettings.horizontalGridLinesWidth = 0;
        }

        const verticalLinesVisible = core.grid_VerticalLinesVisible;
        gridSettings.verticalGridLinesVisible = verticalLinesVisible;
        if (verticalLinesVisible) {
            gridSettings.verticalGridLinesWidth = core.grid_VerticalLineWidth;
        } else {
            gridSettings.verticalGridLinesWidth = 0;
        }

        gridSettings.scrollHorizontallySmoothly = core.grid_ScrollHorizontallySmoothly;

        gridSettings.backgroundColor = color.getBkgd(ColorScheme.ItemId.Grid_Base);
        gridSettings.color = color.getFore(ColorScheme.ItemId.Grid_Base);
        const columnHeaderBackgroundColor = color.getBkgd(ColorScheme.ItemId.Grid_ColumnHeader);
        gridSettings.columnHeaderBackgroundColor = columnHeaderBackgroundColor;
        const columnHeaderForegroundColor = color.getFore(ColorScheme.ItemId.Grid_ColumnHeader);
        gridSettings.columnHeaderForegroundColor = columnHeaderForegroundColor;
        gridSettings.focusedRowBackgroundColor = color.getBkgd(ColorScheme.ItemId.Grid_FocusedCell);
        gridSettings.columnHeaderSelectionBackgroundColor = columnHeaderBackgroundColor;
        gridSettings.columnHeaderSelectionForegroundColor = columnHeaderForegroundColor;
        gridSettings.cellFocusedBorderColor = color.getFore(ColorScheme.ItemId.Grid_FocusedCellBorder);
        const horizontalGridLinesColor = color.getFore(ColorScheme.ItemId.Grid_HorizontalLine);
        gridSettings.horizontalGridLinesColor = horizontalGridLinesColor;
        gridSettings.horizontalFixedLineColor = horizontalGridLinesColor;
        const verticalGridLinesColor = color.getFore(ColorScheme.ItemId.Grid_VerticalLine);
        gridSettings.verticalGridLinesColor = verticalGridLinesColor;
        gridSettings.verticalFixedLineColor = verticalGridLinesColor;
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

        return gridSettings;
    }
}
