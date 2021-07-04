/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridDataStore, GridField, GridFieldState, GridLayout, TRecordFilter } from '@motifmarkets/revgrid';
import { BidAskSideId as BidAskSideId, DataItem, DepthDataItem, DepthLevelsDataItem, DepthStyle, DepthStyleId } from 'src/adi/internal-api';
import {
    DepthRecord,
    DepthSideGridDataStore,
    DepthSideGridField,
    FullDepthSideGridDataStore,
    FullDepthSideGridField,
    GridLayoutDataStore,
    GridLayoutIO,
    ShortDepthSideGridDataStore,
    ShortDepthSideGridField
} from 'src/core/internal-api';
import { assigned, Integer, JsonElement, UnreachableCaseError } from 'src/sys/internal-api';
import { ContentFrame } from '../content-frame';

export class DepthSideFrame extends ContentFrame {
    public columnWidthChangedEvent: DepthSideFrame.ColumnWidthChangedEventHandler;
    public activeWidthChangedEvent: DepthSideFrame.ActiveWidthChangedEventHandler;

    private _sideId: BidAskSideId;
    private _dataItem: DataItem;
    private _activeStore: DepthSideGridDataStore;
    private _styleCache = new Array<DepthSideFrame.StyleCacheElement>(DepthStyle.idCount);
    private _filterXrefs: string[] = [];
    private _activeWidth = 0;

    constructor(private _componentAccess: DepthSideFrame.ComponentAccess) {
        super();
    }

    initialise(sideId: BidAskSideId) {
        this._sideId = sideId;
        for (let styleId: DepthStyleId = 0; styleId < DepthStyle.idCount; styleId++) {
            this.initialiseStyle(styleId);
        }
        this.activateStyle(DepthSideFrame.initialDepthStyleId);
    }

    override finalise() {
        if (this._activeStore !== undefined) {
            this._activeStore.finalise();
        }
        super.finalise();
    }

    openFull(dataItem: DepthDataItem, expand: boolean) {
        this._dataItem = dataItem;
        this.activateStyle(DepthStyleId.Full);
        (this._activeStore as FullDepthSideGridDataStore).open(dataItem, expand);
    }

    openShort(dataItem: DepthLevelsDataItem, expand: boolean) {
        this._dataItem = dataItem;
        this.activateStyle(DepthStyleId.Short);
        (this._activeStore as ShortDepthSideGridDataStore).open(dataItem);
    }

    close() {
        this._activeStore.close();
    }

    loadLayoutConfig(element: JsonElement | undefined) {
        if (element !== undefined) {
            const context = 'DepthSideFrame';

            const fullStyleCacheElement = this._styleCache[DepthStyleId.Full];
            const fullLayoutElement = element.tryGetElement(DepthSideFrame.JsonName.fullLayout, context + '_full');
            const fullSerialisedColumns = GridLayoutIO.loadLayout(fullLayoutElement);
            if (fullSerialisedColumns) {
                const layout = new GridLayout();
                layout.Deserialise(fullSerialisedColumns);
                fullStyleCacheElement.lastLayout = layout;
            }

            const shortStyleCacheElement = this._styleCache[DepthStyleId.Short];
            const shortLayoutElement = element.tryGetElement(DepthSideFrame.JsonName.shortLayout, context + '_short');
            const shortSerialisedColumns = GridLayoutIO.loadLayout(shortLayoutElement);
            if (shortSerialisedColumns) {
                const layout = new GridLayout();
                layout.Deserialise(shortSerialisedColumns);
                shortStyleCacheElement.lastLayout = layout;
            }
        }
    }

    saveLayoutConfig(element: JsonElement) {
        if (assigned(this._activeStore)) {
            const styleCacheElement = this._styleCache[this._activeStore.styleId];
            styleCacheElement.lastLayout = this._componentAccess.gridSaveLayout();
        }

        const fullGridLayout = this._styleCache[DepthStyleId.Full].lastLayout;
        if (fullGridLayout !== undefined) {
            const fullGridLayoutElement = element.newElement(DepthSideFrame.JsonName.fullLayout);
            const serialisedColumns = fullGridLayout.Serialise();
            GridLayoutIO.saveLayout(serialisedColumns, fullGridLayoutElement);
        }

        const shortGridLayout = this._styleCache[DepthStyleId.Short].lastLayout;
        if (shortGridLayout !== undefined) {
            const shortGridLayoutElement = element.newElement(DepthSideFrame.JsonName.shortLayout);
            const serialisedColumns = shortGridLayout.Serialise();
            GridLayoutIO.saveLayout(serialisedColumns, shortGridLayoutElement);
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    recordFilter(record: object) {
        return (record as DepthRecord).acceptedByFilter(this._filterXrefs);
    }

    getRenderedActiveWidth(): Promise<Integer> {
        return this._componentAccess.gridGetRenderedActiveWidth();
    }

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
        this._componentAccess.gridApplyFilter((record) => this.recordFilter(record));
        this._componentAccess.gridContinuousFiltering = true;
    }

    deactivateFilter() {
        this._componentAccess.gridClearFilter();
        this._componentAccess.gridContinuousFiltering = false;
    }

    autoSizeAllColumnWidths() {
        this._componentAccess.gridAutoSizeAllColumnWidths();
    }

    adviseTableRecordFocus(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
    }

    adviseTableRecordFocusClick(recordIndex: Integer, fieldIndex: Integer) {
    }

    adviseTableRecordFocusDblClick(recordIndex: Integer, fieldIndex: Integer) {
        if (this._activeStore !== undefined) {
            this._activeStore.toggleRecordOrderPriceLevel(recordIndex);
        }
    }

    adviseColumnWidthChanged(columnIndex: Integer) {
        this.columnWidthChangedEvent(columnIndex);
    }

    adviseGridRendered() {
        const activeWidth = this._componentAccess.gridGetScrollbaredActiveWidth();
        if (activeWidth !== this._activeWidth) {
            this._activeWidth = activeWidth;
            this.activeWidthChangedEvent();
        }
    }

    getGridLayoutWithHeadings() {
        return this._componentAccess.getGridLayoutWithHeadings();
    }

    setGridLayout(layout: GridLayout) {
        this._componentAccess.gridLoadLayout(layout);
    }

    private handleGetDataItemCorrectnessIdEvent() {
        return this._dataItem.correctnessId;
    }

    private initialiseStyle(styleId: DepthStyleId) {
        let allFieldsStatesVisibles: DepthSideGridField.AllFieldsAndDefaults;
        let store: DepthSideGridDataStore;
        switch (styleId) {
            case DepthStyleId.Full:
                allFieldsStatesVisibles = FullDepthSideGridField.createAllFieldsAndDefaults(
                    this._sideId,
                    () => this.handleGetDataItemCorrectnessIdEvent()
                );
                store = new FullDepthSideGridDataStore(styleId, this._sideId);
                break;
            case DepthStyleId.Short:
                allFieldsStatesVisibles = ShortDepthSideGridField.createAllFieldsAndDefaults(
                    this._sideId,
                    () => this.handleGetDataItemCorrectnessIdEvent()
                );
                store = new ShortDepthSideGridDataStore(styleId, this._sideId);
                break;
            default:
                throw new UnreachableCaseError('DSFI225576', styleId);
        }

        const fields = allFieldsStatesVisibles.fields;
        const defaultVisibles = allFieldsStatesVisibles.defaultVisibles;
        const defaultLayout = new GridLayout();
        for (let idx = 0; idx < fields.length; idx++) {
            defaultLayout.AddField(fields[idx].Name, defaultVisibles[idx]);
        }

        if (this._sideId === BidAskSideId.Bid) {
            // Reverse the order of columns in the asks grid.
            const lastColumnIdx = defaultLayout.columnCount - 1;
            for (let idx = 0; idx < lastColumnIdx; idx++) {
                defaultLayout.MoveColumn(lastColumnIdx, idx);
            }
        }

        store.insertRecordEvent = (index) => this._componentAccess.gridInsertRecord(index);
        store.insertRecordsEvent = (index, count) => this._componentAccess.gridInsertRecords(index, count);
        store.deleteRecordEvent = (index) => this._componentAccess.gridDeleteRecord(index);
        store.deleteRecordsEvent = (index, count) => this._componentAccess.gridDeleteRecords(index, count);
        store.deleteAllRecordsEvent = () => this._componentAccess.gridDeleteAllRecords();
        store.invalidateRecordEvent = (index) => this._componentAccess.gridInvalidateRecord(index);
        store.invalidateAllEvent = () => this._componentAccess.gridInvalidateAll();

        const element: DepthSideFrame.StyleCacheElement = {
            gridFields: allFieldsStatesVisibles.fields,
            defaultGridFieldStates: allFieldsStatesVisibles.defaultStates,
            defaultGridFieldVisibles: allFieldsStatesVisibles.defaultVisibles,
            lastLayout: defaultLayout,
            store,
        };

        this._styleCache[styleId] = element;
    }

    private activateStyle(newStyleId: DepthStyleId) {
        if (this._activeStore === undefined) {
            this.activateStore(newStyleId);
        } else {
            const oldStyleId = this._activeStore.styleId;
            if (oldStyleId !== newStyleId) {
                this._styleCache[oldStyleId].lastLayout = this._componentAccess.gridSaveLayout();
                this._activeStore.finalise();
                this.activateStore(newStyleId);
            }
        }
    }

    private activateStore(styleId: DepthStyleId) {
        this._activeStore = this._styleCache[styleId].store;
        switch (this._activeStore.styleId) {
            case DepthStyleId.Full:
                const fullDataStore = this._activeStore as FullDepthSideGridDataStore;
                this._componentAccess.gridCreateAdaptor(fullDataStore, this._sideId);
                break;
            case DepthStyleId.Short:
                const shortDataStore = this._activeStore as ShortDepthSideGridDataStore;
                this._componentAccess.gridCreateAdaptor(shortDataStore, this._sideId);
                break;
            default:
                throw new UnreachableCaseError('DSFDSFAS333387', this._activeStore.styleId);
        }
        const styleCacheElement = this._styleCache[styleId];
        this.prepareGrid(styleCacheElement);
    }

    private prepareGrid(element: DepthSideFrame.StyleCacheElement) {
        this._componentAccess.gridBeginChange();
        try {
            this._componentAccess.gridReset();
            this._componentAccess.gridAddFields(element.gridFields);

            for (let id = 0; id < element.defaultGridFieldStates.length; id++) {
                this._componentAccess.gridSetFieldState(element.gridFields[id], element.defaultGridFieldStates[id]);
            }

            this._componentAccess.gridLoadLayout(element.lastLayout);

            this. _componentAccess.gridClickToSort = false;
            this. _componentAccess.gridContinuousFiltering = true;

            this._componentAccess.gridInvalidateAll();
        } finally {
            this._componentAccess.gridEndChange();
        }
    }

    // === Data store methods ====
    // public GetDataStatus(): DataItemStatusId {
    //     return (this._tradeDataItem) ? this._tradeDataItem.statusId : DataItemStatusId.Inactive;
    // }
}

export namespace DepthSideFrame {
    export const initialDepthStyleId = DepthStyleId.Full;

    export type ColumnWidthChangedEventHandler = (this: void, columnIndex: Integer) => void;
    export type ActiveWidthChangedEventHandler = (this: void) => void;

    export class StyleCacheElement {
        gridFields: DepthSideGridField[];
        defaultGridFieldStates: GridFieldState[];
        defaultGridFieldVisibles: boolean[];
        lastLayout: GridLayout;
        store: DepthSideGridDataStore;
    }

    export interface ComponentAccess {
        readonly id: string;

        readonly gridRowRecIndices: Integer[];
        gridFocusedRecordIndex: Integer | undefined;
        gridClickToSort: boolean;
        gridContinuousFiltering: boolean;
        gridCreateAdaptor(dataStore: GridDataStore, sideId: BidAskSideId): void;
        gridInsertRecord(index: Integer): void;
        gridInsertRecords(index: Integer, count: Integer): void;
        gridInsertRecordsInSameRowPosition(index: Integer, count: Integer): void;
        gridMoveRecordRow(fromRecordIndex: Integer, toRowIndex: Integer): void;
        gridMoveFieldColumn(field: Integer | GridField, columnIndex: Integer): void;
        gridDeleteRecord(recordIndex: Integer): void;
        gridDeleteRecords(recordIndex: Integer, count: Integer): void;
        gridDeleteAllRecords(): void;
        gridInvalidateAll(): void;
        gridInvalidateValue(fieldIndex: Integer, recordIndex: Integer): void;
        gridInvalidateRecord(recordIndex: Integer): void;
        gridLoadLayout(layout: GridLayout): void;
        gridSaveLayout(): GridLayout;
        gridReorderRecRows(recordIndices: Integer[]): void;
        gridAutoSizeAllColumnWidths(): void;
        gridBeginChange(): void;
        gridEndChange(): void;
        gridReset(): void;
        gridAddFields(fields: DepthSideGridField[]): void;
        gridSetFieldState(field: GridField, state?: GridFieldState | undefined): void;
        gridSetFieldVisible(field: GridField, visible: boolean): void;
        getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders;
        gridApplyFilter(filterFtn: TRecordFilter): void;
        gridClearFilter(): void;
        gridGetRenderedActiveWidth(): Promise<Integer>;
        gridGetScrollbaredActiveWidth(): Integer;
    }

    export namespace JsonName {
        export const fullLayout = 'fullLayout';
        export const shortLayout = 'shortLayout';
    }
}
