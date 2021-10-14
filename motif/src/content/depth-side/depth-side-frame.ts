/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordInvalidatedValue, RevRecordStore } from 'revgrid';
import { BidAskSideId, DataItem, DepthDataItem, DepthLevelsDataItem, DepthStyle, DepthStyleId } from 'src/adi/internal-api';
import { GridLayout, MotifGrid } from 'src/content/internal-api';
import {
    DepthRecord,
    DepthSideGridRecordStore,
    DepthSideGridField,
    FullDepthSideGridRecordStore,
    FullDepthSideGridField, GridLayoutIO, ShortDepthSideGridRecordStore,
    ShortDepthSideGridField
} from 'src/core/internal-api';
import { assigned, Integer, JsonElement, UnreachableCaseError } from 'src/sys/internal-api';
import { ContentFrame } from '../content-frame';

export class DepthSideFrame extends ContentFrame {
    // public columnWidthChangedEvent: DepthSideFrame.ColumnWidthChangedEventHandler;
    // public activeWidthChangedEvent: DepthSideFrame.ActiveWidthChangedEventHandler;

    private _grid: MotifGrid;
    private _gridPrepared = false;
    private _sideId: BidAskSideId;
    private _dataItem: DataItem;
    private _activeStore: DepthSideGridRecordStore;
    private _styleCache = new Array<DepthSideFrame.StyleCacheElement>(DepthStyle.idCount);
    private _filterXrefs: string[] = [];
    // private _activeWidth = 0;

    get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }

    constructor(private readonly _componentAccess: DepthSideFrame.ComponentAccess) {
        super();
    }

    override finalise() {
        if (!this.finalised) {
            if (this._activeStore !== undefined) {
                this._activeStore.finalise();
            }
            super.finalise();
        }
    }

    setBidAskSideId(sideId: BidAskSideId) {
        this._sideId = sideId;
        for (let styleId: DepthStyleId = 0; styleId < DepthStyle.idCount; styleId++) {
            this.initialiseStyle(styleId);
        }
        this.activateStyle(DepthSideFrame.initialDepthStyleId);
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
                layout.deserialise(fullSerialisedColumns);
                fullStyleCacheElement.lastLayout = layout;
            }

            const shortStyleCacheElement = this._styleCache[DepthStyleId.Short];
            const shortLayoutElement = element.tryGetElement(DepthSideFrame.JsonName.shortLayout, context + '_short');
            const shortSerialisedColumns = GridLayoutIO.loadLayout(shortLayoutElement);
            if (shortSerialisedColumns) {
                const layout = new GridLayout();
                layout.deserialise(shortSerialisedColumns);
                shortStyleCacheElement.lastLayout = layout;
            }
        }
    }

    saveLayoutConfig(element: JsonElement) {
        if (assigned(this._activeStore)) {
            const styleCacheElement = this._styleCache[this._activeStore.styleId];
            styleCacheElement.lastLayout = this._grid.saveLayout();
        }

        const fullGridLayout = this._styleCache[DepthStyleId.Full].lastLayout;
        if (fullGridLayout !== undefined) {
            const fullGridLayoutElement = element.newElement(DepthSideFrame.JsonName.fullLayout);
            const serialisedColumns = fullGridLayout.serialise();
            GridLayoutIO.saveLayout(serialisedColumns, fullGridLayoutElement);
        }

        const shortGridLayout = this._styleCache[DepthStyleId.Short].lastLayout;
        if (shortGridLayout !== undefined) {
            const shortGridLayoutElement = element.newElement(DepthSideFrame.JsonName.shortLayout);
            const serialisedColumns = shortGridLayout.serialise();
            GridLayoutIO.saveLayout(serialisedColumns, shortGridLayoutElement);
        }
    }

    waitOpenPopulated() {
        return this._activeStore.waitOpenPopulated();
    }

    waitRendered() {
        return this._grid.waitModelRendered();
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

    autoSizeAllColumnWidths() {
        this._grid.autoSizeAllColumnWidths();
    }

    handleRecordFocusEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
    }

    handleRecordFocusClickEvent(recordIndex: Integer, fieldIndex: Integer) {
    }

    handleRecordFocusDblClickEvent(recordIndex: Integer, fieldIndex: Integer) {
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

    getLayoutWithHeadersMap() {
        return this._grid.getLayoutWithHeadersMap();
    }

    setGridLayout(layout: GridLayout) {
        this._grid.loadLayout(layout);
    }

    private handleGetDataItemCorrectnessIdEvent() {
        return this._dataItem.correctnessId;
    }

    private handleRecordInsertedEvent(recordIndex: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) {
        if (lastAffectedFollowingRecordIndex !== undefined) {
            this._grid.beginRecordChanges();
            try {
                this._grid.recordInserted(recordIndex);
                this._grid.invalidateRecords(recordIndex + 1, lastAffectedFollowingRecordIndex - recordIndex);
            } finally {
                this._grid.endRecordChanges();
            }
        } else {
            this._grid.recordInserted(recordIndex);
        }
    }

    private handleRecordsInsertedEvent(recordIndex: Integer, count: number, invalidateAll: boolean) {
        if (invalidateAll) {
            this._grid.beginRecordChanges();
            try {
                this._grid.recordsInserted(recordIndex, count);
                this._grid.invalidateAll(); // this could be improved to only invalidate record range affected
            } finally {
                this._grid.endRecordChanges();
            }
        } else {
            this._grid.recordsInserted(recordIndex, count);
        }
    }

    private handleRecordDeletedEvent(recordIndex: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) {
        if (lastAffectedFollowingRecordIndex !== undefined) {
            this._grid.beginRecordChanges();
            try {
                this._grid.recordDeleted(recordIndex);
                this._grid.invalidateRecords(recordIndex + 1, lastAffectedFollowingRecordIndex - recordIndex);
            } finally {
                this._grid.endRecordChanges();
            }
        } else {
            this._grid.recordDeleted(recordIndex);
        }
    }

    private handleRecordsDeletedEvent(recordIndex: Integer, count: number, invalidateAll: boolean) {
        if (invalidateAll) {
            this._grid.beginRecordChanges();
            try {
                this._grid.recordsDeleted(recordIndex, count);
                this._grid.invalidateAll(); // this could be improved to only invalidate record range affected
            } finally {
                this._grid.endRecordChanges();
            }
        } else {
            this._grid.recordsDeleted(recordIndex, count);
        }
    }

    private handleInvalidateRecordAndFollowingRecordsEvent(recordIndex: Integer, lastAffectedFollowingRecordIndex: Integer | undefined) {
        if (lastAffectedFollowingRecordIndex !== undefined) {
            this._grid.beginRecordChanges();
            try {
                this._grid.invalidateRecord(recordIndex);
                this._grid.invalidateRecords(recordIndex + 1, lastAffectedFollowingRecordIndex - recordIndex);
            } finally {
                this._grid.endRecordChanges();
            }
        } else {
            this._grid.invalidateRecord(recordIndex);
        }
    }

    private handleInvalidateRecordAndValuesAndFollowingRecordsEvent(
        recordIndex: Integer,
        invalidatedRecordValues: RevRecordInvalidatedValue[],
        lastAffectedFollowingRecordIndex: Integer | undefined
    ) {
        if (lastAffectedFollowingRecordIndex !== undefined) {
            this._grid.beginRecordChanges();
            try {
                this._grid.invalidateRecordAndValues(recordIndex, invalidatedRecordValues);
                this._grid.invalidateRecords(recordIndex + 1, lastAffectedFollowingRecordIndex - recordIndex);
            } finally {
                this._grid.endRecordChanges();
            }
        } else {
            this._grid.invalidateRecordAndValues(recordIndex, invalidatedRecordValues);
        }
    }

    private handleInvalidateRecordsAndRecordValuesEvent(
        recordIndex: Integer,
        count: Integer,
        valuesRecordIndex: Integer,
        invalidatedRecordValues: RevRecordInvalidatedValue[],
    ) {
        if (invalidatedRecordValues.length === 0) {
            this._grid.invalidateRecords(recordIndex, count);
        } else {
            this._grid.beginRecordChanges();
            try {
                this._grid.invalidateRecords(recordIndex, count);
                this._grid.invalidateRecordAndValues(valuesRecordIndex, invalidatedRecordValues);
            } finally {
                this._grid.endRecordChanges();
            }
        }
    }

    private initialiseStyle(styleId: DepthStyleId) {
        let allFieldsStatesVisibles: DepthSideGridField.AllFieldsAndDefaults;
        let store: DepthSideGridRecordStore;
        switch (styleId) {
            case DepthStyleId.Full:
                allFieldsStatesVisibles = FullDepthSideGridField.createAllFieldsAndDefaults(
                    this._sideId,
                    () => this.handleGetDataItemCorrectnessIdEvent()
                );
                store = new FullDepthSideGridRecordStore(styleId, this._sideId);
                break;
            case DepthStyleId.Short:
                allFieldsStatesVisibles = ShortDepthSideGridField.createAllFieldsAndDefaults(
                    this._sideId,
                    () => this.handleGetDataItemCorrectnessIdEvent()
                );
                store = new ShortDepthSideGridRecordStore(styleId, this._sideId);
                break;
            default:
                throw new UnreachableCaseError('DSFI225576', styleId);
        }

        const fields = allFieldsStatesVisibles.fields;
        const defaultVisibles = allFieldsStatesVisibles.defaultVisibles;
        const defaultLayout = new GridLayout();
        for (let idx = 0; idx < fields.length; idx++) {
            defaultLayout.addField(fields[idx].name, defaultVisibles[idx]);
        }

        if (this._sideId === BidAskSideId.Bid) {
            // Reverse the order of columns in the asks grid.
            const lastColumnIdx = defaultLayout.columnCount - 1;
            for (let idx = 0; idx < lastColumnIdx; idx++) {
                defaultLayout.moveColumn(lastColumnIdx, idx);
            }
        }

        store.recordInsertedEvent =
            (index, lastAffectedFollowingRecordIndex) => this.handleRecordInsertedEvent(index, lastAffectedFollowingRecordIndex);
        store.recordsInsertedEvent = (index, count, allInvalidated) => this.handleRecordsInsertedEvent(index, count, allInvalidated);
        store.recordDeletedEvent =
            (index, lastAffectedFollowingRecordIndex) => this.handleRecordDeletedEvent(index, lastAffectedFollowingRecordIndex);
        store.recordsDeletedEvent = (index, count, allInvalidated) => this.handleRecordsDeletedEvent(index, count, allInvalidated);
        store.allRecordsDeletedEvent = () => this._grid.allRecordsDeleted();
        store.invalidateRecordsEvent = (index, count) => this._grid.invalidateRecords(index, count);
        store.invalidateRecordAndFollowingRecordsEvent =
            (index, lastAffectedFollowingRecordIndex) => this.handleInvalidateRecordAndFollowingRecordsEvent(
                index, lastAffectedFollowingRecordIndex
            );
        store.invalidateRecordAndValuesAndFollowingRecordsEventer =
            (recordIndex, valueChanges, lastAffectedFollowingRecordIndex) => this.handleInvalidateRecordAndValuesAndFollowingRecordsEvent(
                recordIndex, valueChanges, lastAffectedFollowingRecordIndex
            );
        store.invalidateRecordsAndRecordValuesEventer =
            (recordIndex, count, valuesRecordIndex, valueChanges) => this.handleInvalidateRecordsAndRecordValuesEvent(
                recordIndex, count, valuesRecordIndex, valueChanges
            );
        store.invalidateAllEvent = () => this._grid.invalidateAll();

        const element: DepthSideFrame.StyleCacheElement = {
            gridFields: fields,
            defaultGridFieldStates: allFieldsStatesVisibles.defaultStates,
            defaultGridFieldVisibles: defaultVisibles,
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
                this._styleCache[oldStyleId].lastLayout = this._grid.saveLayout();
                this._activeStore.finalise();
                this.activateStore(newStyleId);
            }
        }
    }

    private activateStore(styleId: DepthStyleId) {
        this._activeStore = this._styleCache[styleId].store;
        switch (this._activeStore.styleId) {
            case DepthStyleId.Full:
                const fullDataStore = this._activeStore as FullDepthSideGridRecordStore;
                this.setGrid(fullDataStore);
                break;
            case DepthStyleId.Short:
                const shortDataStore = this._activeStore as ShortDepthSideGridRecordStore;
                this.setGrid(shortDataStore);
                break;
            default:
                throw new UnreachableCaseError('DSFDSFAS333387', this._activeStore.styleId);
        }

        const styleCacheElement = this._styleCache[styleId];
        this.prepareGrid(styleCacheElement);
    }

    private setGrid(dataStore: RevRecordStore) {
        this._grid = this._componentAccess.createGrid(dataStore);
        this._grid.recordFocusEventer = (newRecordIndex, oldRecordIndex) => this.handleRecordFocusEvent(newRecordIndex, oldRecordIndex);
        this._grid.recordFocusClickEventer = (recordIndex, fieldIndex) => this.handleRecordFocusClickEvent(recordIndex, fieldIndex);
        this._grid.recordFocusDblClickEventer = (recordIndex, fieldIndex) => this.handleRecordFocusDblClickEvent(recordIndex, fieldIndex);
    }

    private prepareGrid(element: DepthSideFrame.StyleCacheElement) {
        if (this._gridPrepared) {
            this._grid.reset();
        }

        this._grid.addFields(element.gridFields);

        this._grid.beginRecordChanges();
        try {
            for (let id = 0; id < element.defaultGridFieldStates.length; id++) {
                this._grid.setFieldState(element.gridFields[id], element.defaultGridFieldStates[id]);
            }

            this._grid.loadLayout(element.lastLayout);

            this. _grid.sortable = false;
            this. _grid.continuousFiltering = true;
        } finally {
            this._grid.endRecordChanges();
        }

        this._gridPrepared = true;
    }

    // === Data store methods ====
    // public GetDataStatus(): DataItemStatusId {
    //     return (this._tradeDataItem) ? this._tradeDataItem.statusId : DataItemStatusId.Inactive;
    // }
}

export namespace DepthSideFrame {
    export const initialDepthStyleId = DepthStyleId.Full;

    // export type ColumnWidthChangedEventHandler = (this: void, columnIndex: Integer) => void;
    // export type ActiveWidthChangedEventHandler = (this: void) => void;

    export class StyleCacheElement {
        gridFields: DepthSideGridField[];
        defaultGridFieldStates: MotifGrid.FieldState[];
        defaultGridFieldVisibles: boolean[];
        lastLayout: GridLayout;
        store: DepthSideGridRecordStore;
    }

    export interface ComponentAccess {
        readonly id: string;
        createGrid(dataStore: RevRecordStore): MotifGrid;

        // readonly gridRowRecIndices: Integer[];
        // gridFocusedRecordIndex: Integer | undefined;
        // gridClickToSort: boolean;
        // gridContinuousFiltering: boolean;
        // gridCreateAdaptor(dataStore: GridDataStore, sideId: BidAskSideId): void;
        // gridInsertRecord(index: Integer): void;
        // gridInsertRecords(index: Integer, count: Integer): void;
        // gridInsertRecordsInSameRowPosition(index: Integer, count: Integer): void;
        // gridMoveRecordRow(fromRecordIndex: Integer, toRowIndex: Integer): void;
        // gridMoveFieldColumn(field: Integer | GridField, columnIndex: Integer): void;
        // gridDeleteRecord(recordIndex: Integer): void;
        // gridDeleteRecords(recordIndex: Integer, count: Integer): void;
        // gridDeleteAllRecords(): void;
        // gridInvalidateAll(): void;
        // gridInvalidateValue(fieldIndex: Integer, recordIndex: Integer): void;
        // gridInvalidateRecord(recordIndex: Integer): void;
        // gridLoadLayout(layout: GridLayout): void;
        // gridSaveLayout(): GridLayout;
        // gridReorderRecRows(recordIndices: Integer[]): void;
        // gridAutoSizeAllColumnWidths(): void;
        // gridBeginChange(): void;
        // gridEndChange(): void;
        // gridReset(): void;
        // gridAddFields(fields: DepthSideGridField[]): void;
        // gridSetFieldState(field: GridField, state?: GridFieldState | undefined): void;
        // gridSetFieldVisible(field: GridField, visible: boolean): void;
        // getGridLayoutWithHeadings(): MotifGrid.LayoutWithHeadersMap;
        // gridApplyFilter(filterFtn: TRecordFilter): void;
        // gridClearFilter(): void;
        // gridGetRenderedActiveWidth(): Promise<Integer>;
        // gridGetScrollbaredActiveWidth(): Integer;
    }

    export namespace JsonName {
        export const fullLayout = 'fullLayout';
        export const shortLayout = 'shortLayout';
    }
}
