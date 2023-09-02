/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgrid,
    AllowedGridField,
    AssertInternalError,
    CellPainterFactoryService,
    DataItem,
    DepthDataItem,
    DepthLevelsDataItem,
    DepthRecord,
    DepthSideGridField,
    DepthSideGridRecordStore,
    DepthStyle,
    DepthStyleId,
    FullDepthSideGridField,
    FullDepthSideGridRecordStore,
    GridLayout,
    GridLayoutDefinition,
    Integer,
    JsonElement,
    OrderSideId,
    RecordGrid,
    RenderValueRecordGridCellPainter,
    SettingsService,
    ShortDepthSideGridField,
    ShortDepthSideGridRecordStore,
    TextHeaderCellPainter,
    TextRenderValueCellPainter,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { RevRecordStore } from 'revgrid';
import { ContentFrame } from '../content-frame';

export class DepthSideFrame extends ContentFrame {
    public openedPopulatedAndRenderedEvent: DepthSideFrame.OpenedPopulatedAndRenderedEvent;
    // public columnWidthChangedEvent: DepthSideFrame.ColumnWidthChangedEventHandler;
    // public activeWidthChangedEvent: DepthSideFrame.ActiveWidthChangedEventHandler;

    private _grid: RecordGrid;
    private _sideId: OrderSideId;
    private _dataItem: DataItem;
    private _activeStore: DepthSideGridRecordStore | undefined;
    private _styleCache = new Array<DepthSideFrame.StyleCacheElement>(DepthStyle.idCount);
    private _filterXrefs: string[] = [];
    // private _activeWidth = 0;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    private _waitOpenPopulatedId = DepthSideFrame.initialWaitOpenPopulatedId;
    private _waitLastServerNotificationRenderedId = 0;
    private _openedPopulatedAndRendered = false;

    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _cellPainterFactoryService: CellPainterFactoryService,
        private readonly _hostElement: HTMLElement,
    ) {
        super();
    }

    get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }
    get openedPopulatedAndRendered() { return this._openedPopulatedAndRendered; }
    get lastServerNotificationId() { return this._grid.renderer.lastServerNotificationId; }

    initialise(sideId: OrderSideId, element: JsonElement | undefined) {
        this._sideId = sideId;

        const initialGridLayoutDefinitions = new Array<GridLayoutDefinition | undefined>(DepthStyle.idCount);
        if (element !== undefined) {
            const tryGetFullResult = element.tryGetElement(DepthSideFrame.JsonName.fullLayout);
            if (tryGetFullResult.isOk()) {
                const layoutDefinitionResult = GridLayoutDefinition.tryCreateFromJson(tryGetFullResult.value);
                if (layoutDefinitionResult.isOk()) {
                    const layoutDefinition = layoutDefinitionResult.value;
                    // const styleCacheElement = this._styleCache[DepthStyleId.Full];
                    // styleCacheElement.lastLayoutDefinition = layoutDefinition;
                    initialGridLayoutDefinitions[DepthStyleId.Full] = layoutDefinition;
                }
            }

            const tryGetShortResult = element.tryGetElement(DepthSideFrame.JsonName.shortLayout);
            if (tryGetShortResult.isOk()) {
                const layoutDefinitionResult = GridLayoutDefinition.tryCreateFromJson(tryGetShortResult.value);
                if (layoutDefinitionResult.isOk()) {
                    const layoutDefinition = layoutDefinitionResult.value;
                    // const styleCacheElement = this._styleCache[DepthStyleId.Short];
                    // styleCacheElement.lastLayoutDefinition = layoutDefinition;
                    initialGridLayoutDefinitions[DepthStyleId.Short] = layoutDefinition;
                }
            }
        }

        for (let styleId = 0; styleId < DepthStyle.idCount; styleId++) {
            this.initialiseStyle(styleId, initialGridLayoutDefinitions[styleId]);
        }

        const styleId = DepthSideFrame.initialDepthStyleId;
        this.activateStyle(styleId);
        this.applyFirstUsable(styleId);
        this.waitRendered();
    }

    override finalise() {
        if (!this.finalised) {
            if (this._activeStore !== undefined) {
                this._activeStore.finalise();
                this._activeStore = undefined;
            }
            super.finalise();
        }
    }

    openFull(dataItem: DepthDataItem, expand: boolean) {
        const styleId = DepthStyleId.Full;
        this._dataItem = dataItem;
        const styleActivated = this.activateStyle(styleId);
        (this._activeStore as FullDepthSideGridRecordStore).open(dataItem, expand);

        if (styleActivated || this._waitOpenPopulatedId === DepthSideFrame.initialWaitOpenPopulatedId) {
            this.waitPopulated(styleId)
        }
    }

    openShort(dataItem: DepthLevelsDataItem, expand: boolean) {
        const styleId = DepthStyleId.Short;
        this._dataItem = dataItem;
        const styleActivated = this.activateStyle(styleId);
        (this._activeStore as ShortDepthSideGridRecordStore).open(dataItem);

        if (styleActivated || this._waitOpenPopulatedId === DepthSideFrame.initialWaitOpenPopulatedId) {
            this.waitPopulated(styleId)
        }
    }

    close() {
        if (this._activeStore !== undefined) {
            this._activeStore.close();
        }
    }

    save(element: JsonElement) {
        if (this._activeStore !== undefined) {
            const styleCacheElement = this._styleCache[this._activeStore.styleId];
            styleCacheElement.lastLayoutDefinition = this._grid.createGridLayoutDefinition();
        }

        const fullGridLayoutDefinition = this._styleCache[DepthStyleId.Full].lastLayoutDefinition;
        if (fullGridLayoutDefinition !== undefined) {
            const fullGridLayoutElement = element.newElement(DepthSideFrame.JsonName.fullLayout);
            fullGridLayoutDefinition.saveToJson(fullGridLayoutElement);
        }

        const shortGridLayoutDefinition = this._styleCache[DepthStyleId.Short].lastLayoutDefinition;
        if (shortGridLayoutDefinition !== undefined) {
            const shortGridLayoutElement = element.newElement(DepthSideFrame.JsonName.shortLayout);
            shortGridLayoutDefinition.saveToJson(shortGridLayoutElement);
        }
    }

    calculateActiveColumnsWidth() {
        return this._grid.calculateActiveColumnsWidth();
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    recordFilter(record: object) {
        return (record as DepthRecord).acceptedByFilter(this._filterXrefs);
    }

    // getRenderedActiveWidth(): Promise<Integer> {
    //     return this._grid.getRenderedActiveWidth();
    // }

    setAuctionQuantity(value: Integer | undefined) {
        if (this._activeStore !== undefined) {
            this._activeStore.setAuctionQuantity(value);
        }
    }

    toggleRecordOrderPriceLevel(idx: Integer) {
        if (this._activeStore !== undefined) {
            this._activeStore.toggleRecordOrderPriceLevel(idx);
        }
    }

    setAllRecordsToOrder() {
        if (this._activeStore !== undefined) {
            this._activeStore.setAllRecordsToOrder();
        }
    }

    setAllRecordsToPriceLevel() {
        if (this._activeStore !== undefined) {
            this._activeStore.setAllRecordsToPriceLevel();
        }
    }

    setNewPriceLevelAsOrder(value: boolean) {
        if (this._activeStore !== undefined) {
            this._activeStore.setNewPriceLevelAsOrder(value);
        }
    }

    activateFilter(filterXrefs: string[]) {
        this._filterXrefs = filterXrefs;
        this._grid.applyFilter((record) => this.recordFilter(record));
        this._grid.continuousFiltering = true;
    }

    deactivateFilter() {
        this._grid.clearFilter();
        this._grid.continuousFiltering = false;
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        this._grid.autoSizeAllColumnWidths(widenOnly);
    }

    handleRecordFocusEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
        // not yet implemented
    }

    handleGridClickEvent(fieldIndex: Integer, recordIndex: Integer) {
        // not yet implemented
    }

    handleGridDblClickEvent(fieldIndex: Integer, recordIndex: Integer) {
        if (this._activeStore !== undefined) {
            this._activeStore.toggleRecordOrderPriceLevel(recordIndex);
        }
    }

    // adviseColumnWidthChanged(columnIndex: Integer) {
    //     this.columnWidthChangedEvent(columnIndex);
    // }

    // adviseGridRendered() {
    //     const activeWidth = this._grid.getScrollbaredActiveWidth();
    //     if (activeWidth !== this._activeWidth) {
    //         this._activeWidth = activeWidth;
    //         this.activeWidthChangedEvent();
    //     }
    // }

    canCreateAllowedFieldsGridLayoutDefinition() {
        return this._activeStore !== undefined;
    }

    createAllowedFieldsGridLayoutDefinition() {
        const activeStore = this._activeStore;
        if (activeStore === undefined) {
            throw new AssertInternalError('DSFCAFGLDU22209');
        } else {
            let allowedFields: readonly AllowedGridField[];
            switch (activeStore.styleId) {
                case DepthStyleId.Full:
                    allowedFields = FullDepthSideGridField.createAllowedFields();
                    break;
                case DepthStyleId.Short:
                    allowedFields = ShortDepthSideGridField.createAllowedFields();
                    break;
                default:
                    throw new UnreachableCaseError('DSFCAFGLDD22209', activeStore.styleId);
            }
            return this._grid.createAllowedFieldsGridLayoutDefinition(allowedFields);
        }
    }

    applyGridLayoutDefinition(definition: GridLayoutDefinition) {
        this._grid.applyGridLayoutDefinition(definition);
    }

    private handleGetDataItemCorrectnessIdEvent() {
        return this._dataItem.correctnessId;
    }

    private initialiseStyle(styleId: DepthStyleId, initialGridLayoutDefinition: GridLayoutDefinition | undefined) {
        let fields: DepthSideGridField[];
        let store: DepthSideGridRecordStore;
        switch (styleId) {
            case DepthStyleId.Full: {
                fields = FullDepthSideGridField.createAll(this._sideId, () => this.handleGetDataItemCorrectnessIdEvent());
                store = new FullDepthSideGridRecordStore(styleId, this._sideId);

                if (initialGridLayoutDefinition === undefined) {
                    initialGridLayoutDefinition = FullDepthSideGridField.createDefaultGridLayoutDefinition(this._sideId);
                }

                break;
            }
            case DepthStyleId.Short: {
                fields = ShortDepthSideGridField.createAll(this._sideId, () => this.handleGetDataItemCorrectnessIdEvent());
                store = new ShortDepthSideGridRecordStore(styleId, this._sideId);

                if (initialGridLayoutDefinition === undefined) {
                    initialGridLayoutDefinition = ShortDepthSideGridField.createDefaultGridLayoutDefinition(this._sideId);
                }

                break;
            }
            default:
                throw new UnreachableCaseError('DSFI225576', styleId);
        }

        const element: DepthSideFrame.StyleCacheElement = {
            allowedGridFields: fields,
            lastLayoutDefinition: initialGridLayoutDefinition,
            store,
        };

        this._styleCache[styleId] = element;
    }

    private createDefaultGridLayoutDefinition(fields: DepthSideGridField[], fieldVisibles: boolean[]) {
        const fieldCount = fields.length;
        const layoutDefinitionColumns = new Array<GridLayoutDefinition.Column>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            const field = fields[i];
            const layoutDefinitionColumn: GridLayoutDefinition.Column = {
                fieldName: field.name,
                visible: fieldVisibles[i],
                autoSizableWidth: undefined,
            };
            layoutDefinitionColumns[i] = layoutDefinitionColumn;
        }

        if (this._sideId === OrderSideId.Ask) {
            // Reverse the order of columns in the asks grid.
            layoutDefinitionColumns.reverse();
        }

        return new GridLayoutDefinition(layoutDefinitionColumns);
    }

    private activateStyle(newStyleId: DepthStyleId) {
        if (this._activeStore === undefined) {
            this.activateStore(newStyleId);
            return true;
        } else {
            const oldStyleId = this._activeStore.styleId;
            if (oldStyleId === newStyleId) {
                return false;
            } else {
                this._styleCache[oldStyleId].lastLayoutDefinition = this._grid.createGridLayoutDefinition();
                this._activeStore.finalise();
                this.activateStore(newStyleId);
                return true;
            }
        }
    }

    private activateStore(styleId: DepthStyleId) {
        this._openedPopulatedAndRendered = false;

        const styleCacheElement = this._styleCache[styleId];
        const allowedGridFields = styleCacheElement.allowedGridFields;
        this._activeStore = styleCacheElement.store;
        const activeStore = this._activeStore;
        switch (activeStore.styleId) {
            case DepthStyleId.Full: {
                const fullDataStore = activeStore as FullDepthSideGridRecordStore;
                this.setGrid(fullDataStore, allowedGridFields);
                break;
            }
            case DepthStyleId.Short: {
                const shortDataStore = activeStore as ShortDepthSideGridRecordStore;
                this.setGrid(shortDataStore, allowedGridFields);
                break;
            }
            default:
                throw new UnreachableCaseError('DSFDSFAS333387', activeStore.styleId);
        }
    }

    private waitPopulated(styleId: DepthStyleId) {
        const activeStore = this._activeStore;
        if (activeStore === undefined) {
            throw new AssertInternalError('DSFCOSA53881');
        } else {
            const waitOpenPopulatedId = ++this._waitOpenPopulatedId;
            const populatedPromise = activeStore.waitOpenPopulated();
            populatedPromise.then(
                (success) => {
                    if (success && waitOpenPopulatedId === this._waitOpenPopulatedId) {
                        this.applyFirstUsable(styleId);
                        this.waitRendered();
                    }
                },
                (error) => AssertInternalError.createIfNotError(error, 'DSFAS69114')
            );
        }
    }

    private setGrid(
        recordStore: RevRecordStore,
        allowedFields: readonly DepthSideGridField[],
    ) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._grid !== undefined) {
            this._grid.destroy();
        }

        const customGridSettings: AdaptedRevgrid.CustomGridSettings = {
            sortOnClick: false,
            sortOnDoubleClick: false,
            gridRightAligned: this._sideId === OrderSideId.Bid,
        };

        const grid = new RecordGrid(
            this._settingsService,
            this._hostElement,
            recordStore,
            customGridSettings,
            () => this.customiseSettingsForNewColumn(),
            () => this.getMainCellPainter(),
            () => this.getHeaderCellPainter(),
            this,
        );

        if (this._sideId === OrderSideId.Ask) {
            grid.verticalScroller.setBeforeInsideOffset(0);
        }

        grid.recordFocusedEventer = (newRecordIndex, oldRecordIndex) => this.handleRecordFocusEvent(newRecordIndex, oldRecordIndex);
        grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        grid.mainDblClickEventer = (fieldIndex, recordIndex) => this.handleGridDblClickEvent(fieldIndex, recordIndex);

        this._grid = grid;

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);

        grid.activate();

        grid.continuousFiltering = true;

        grid.initialiseAllowedFields(allowedFields);
    }

    private customiseSettingsForNewColumn() {
        // no customisation required
    }

    private getMainCellPainter() {
        return this._gridMainCellPainter;
    }

    private getHeaderCellPainter() {
        return this._gridHeaderCellPainter;
    }

    private applyFirstUsable(styleId: DepthStyleId) {
        const styleCacheElement = this._styleCache[styleId];
        const gridLayout = new GridLayout(styleCacheElement.lastLayoutDefinition);
        this._grid.applyFirstUsable(undefined, undefined, gridLayout);
    }

    private waitRendered() {
        const waitLastServerNotificationRenderedId = ++this._waitLastServerNotificationRenderedId;
        const renderPromise = this._grid.renderer.waitLastServerNotificationRendered();
        renderPromise.then(
            () => {
                if (waitLastServerNotificationRenderedId === this._waitLastServerNotificationRenderedId) {
                    this._openedPopulatedAndRendered = true;
                    this.openedPopulatedAndRenderedEvent()
                }
            },
            (error) => AssertInternalError.createIfNotError(error, 'DSFWR69114')
        );
    }
}

export namespace DepthSideFrame {
    export const initialDepthStyleId = DepthStyleId.Full;
    export const initialWaitOpenPopulatedId = 0;

    export type OpenedPopulatedAndRenderedEvent = (this: void) => void;
    // export type ColumnWidthChangedEventHandler = (this: void, columnIndex: Integer) => void;
    // export type ActiveWidthChangedEventHandler = (this: void) => void;

    export class StyleCacheElement {
        allowedGridFields: readonly DepthSideGridField[];
        // defaultGridFieldStates: readonly GridRecordFieldState[];
        // defaultGridFieldVisibles: readonly boolean[];
        lastLayoutDefinition: GridLayoutDefinition | undefined;
        store: DepthSideGridRecordStore;
    }

    export namespace JsonName {
        export const fullLayout = 'fullLayout';
        export const shortLayout = 'shortLayout';
    }
}
