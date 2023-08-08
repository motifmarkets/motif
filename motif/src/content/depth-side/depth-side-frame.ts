/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgrid,
    AssertInternalError,
    DataItem,
    DepthDataItem,
    DepthLevelsDataItem,
    DepthRecord,
    DepthSideGridField,
    DepthSideGridRecordStore,
    DepthStyle,
    DepthStyleId,
    FullDepthSideField,
    FullDepthSideGridField,
    FullDepthSideGridRecordStore,
    GridLayout,
    GridLayoutDefinition,
    HeaderTextCellPainter,
    Integer,
    JsonElement,
    OrderSideId,
    RecordGrid,
    RecordGridMainTextCellPainter,
    SettingsService,
    ShortDepthSideField,
    ShortDepthSideGridField,
    ShortDepthSideGridRecordStore,
    TextFormatterService,
    UnreachableCaseError,
} from '@motifmarkets/motif-core';
import { RevRecordStore } from 'revgrid';
import { ContentFrame } from '../content-frame';

export class DepthSideFrame extends ContentFrame {
    public openedPopulatedAndRenderedEvent: DepthSideFrame.OpenedPopulatedAndRenderedEvent;
    // public columnWidthChangedEvent: DepthSideFrame.ColumnWidthChangedEventHandler;
    // public activeWidthChangedEvent: DepthSideFrame.ActiveWidthChangedEventHandler;

    private _grid: RecordGrid;
    private _gridPrepared = false;
    private _sideId: OrderSideId;
    private _dataItem: DataItem;
    private _activeStore: DepthSideGridRecordStore | undefined;
    private _styleCache = new Array<DepthSideFrame.StyleCacheElement>(DepthStyle.idCount);
    private _filterXrefs: string[] = [];
    // private _activeWidth = 0;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    private _storeActivationId = 0;
    private _openedPopulatedAndRendered = false;

    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _textFormatterService: TextFormatterService,
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

        for (let styleId: DepthStyleId = 0; styleId < DepthStyle.idCount; styleId++) {
            this.initialiseStyle(styleId, initialGridLayoutDefinitions[styleId]);
        }
        this.activateStyle(DepthSideFrame.initialDepthStyleId);
    }

    override finalise() {
        if (!this.finalised) {
            if (this._activeStore !== undefined) {
                this._activeStore.finalise();
            }
            super.finalise();
        }
    }

    openFull(dataItem: DepthDataItem, expand: boolean) {
        this._dataItem = dataItem;
        this.activateStyle(DepthStyleId.Full);
        (this._activeStore as FullDepthSideGridRecordStore).open(dataItem, expand);
    }

    openShort(dataItem: DepthLevelsDataItem, expand: boolean) {
        this._dataItem = dataItem;
        this.activateStyle(DepthStyleId.Short);
        (this._activeStore as ShortDepthSideGridRecordStore).open(dataItem);
    }

    close() {
        if (this._activeStore !== undefined) {
            this._activeStore.close();
            this._activeStore = undefined;
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

    createAllowedFieldsAndLayoutDefinition() {
        return this._grid.createAllowedFieldsAndLayoutDefinition();
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
                const idCount = FullDepthSideField.idCount;
                fields = new Array<DepthSideGridField>(idCount);

                for (let id = 0; id < idCount; id++) {
                    const field = new FullDepthSideGridField(id, this._sideId, () => this.handleGetDataItemCorrectnessIdEvent());
                    fields[id] = field;
                }

                store = new FullDepthSideGridRecordStore(styleId, this._sideId);

                if (initialGridLayoutDefinition === undefined) {
                    initialGridLayoutDefinition = FullDepthSideGridField.createDefaultGridLayoutDefinition(this._sideId);
                }

                break;
            }
            case DepthStyleId.Short: {
                const idCount = ShortDepthSideField.idCount;
                fields = new Array<DepthSideGridField>(idCount);

                for (let id = 0; id < idCount; id++) {
                    const field = new ShortDepthSideGridField(id, this._sideId, () => this.handleGetDataItemCorrectnessIdEvent());
                    fields[id] = field;
                }

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
            gridFields: fields,
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
        } else {
            const oldStyleId = this._activeStore.styleId;
            if (oldStyleId !== newStyleId) {
                this._styleCache[oldStyleId].lastLayoutDefinition = this._grid.createGridLayoutDefinition();
                this._activeStore.finalise();
                this.activateStore(newStyleId);
            }
        }
    }

    private activateStore(styleId: DepthStyleId) {
        ++this._storeActivationId;
        this._openedPopulatedAndRendered = false;

        this._activeStore = this._styleCache[styleId].store;
        const activeStore = this._activeStore;
        switch (activeStore.styleId) {
            case DepthStyleId.Full: {
                const fullDataStore = activeStore as FullDepthSideGridRecordStore;
                this.setGrid(fullDataStore);
                break;
            }
            case DepthStyleId.Short: {
                const shortDataStore = activeStore as ShortDepthSideGridRecordStore;
                this.setGrid(shortDataStore);
                break;
            }
            default:
                throw new UnreachableCaseError('DSFDSFAS333387', activeStore.styleId);
        }

        const styleCacheElement = this._styleCache[styleId];
        this.prepareGrid(styleCacheElement);

        const storeActivationId = this._storeActivationId;
        const populatedPromise = activeStore.waitOpenPopulated();
        populatedPromise.then(
            (success) => {
                if (success && storeActivationId === this._storeActivationId) {
                    this.waitRendered();
                }
            },
            (error) => AssertInternalError.createIfNotError(error, 'DSFAS69114')
        );
    }

    private setGrid(
        recordStore: RevRecordStore,
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

        this._gridHeaderCellPainter = new HeaderTextCellPainter(this._settingsService, grid, grid.headerDataServer);
        this._gridMainCellPainter = new RecordGridMainTextCellPainter(this._settingsService, this._textFormatterService, grid, grid.mainDataServer);

        grid.activate();
    }

    private prepareGrid(element: DepthSideFrame.StyleCacheElement) {
        if (this._gridPrepared) {
            this._grid.reset();
        }

        const gridLayout = new GridLayout(element.lastLayoutDefinition);
        this._grid.fieldsLayoutReset(element.gridFields, gridLayout);

        this. _grid.continuousFiltering = true;

        this._gridPrepared = true;
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

    private waitRendered() {
        const storeActivationId = this._storeActivationId;
        const renderPromise = this._grid.renderer.waitLastServerNotificationRendered();
        renderPromise.then(
            () => {
                if (storeActivationId === this._storeActivationId) {
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

    export type OpenedPopulatedAndRenderedEvent = (this: void) => void;
    // export type ColumnWidthChangedEventHandler = (this: void, columnIndex: Integer) => void;
    // export type ActiveWidthChangedEventHandler = (this: void) => void;

    export class StyleCacheElement {
        gridFields: readonly DepthSideGridField[];
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
