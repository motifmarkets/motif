/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
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
    Integer,
    JsonElement,
    OrderSideId,
    ShortDepthSideField,
    ShortDepthSideGridField,
    ShortDepthSideGridRecordStore,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { RevRecordStore } from 'revgrid';
import { RecordGrid } from '../adapted-revgrid/internal-api';
import { ContentFrame } from '../content-frame';

export class DepthSideFrame extends ContentFrame {
    // public columnWidthChangedEvent: DepthSideFrame.ColumnWidthChangedEventHandler;
    // public activeWidthChangedEvent: DepthSideFrame.ActiveWidthChangedEventHandler;

    private _grid: RecordGrid;
    private _gridPrepared = false;
    private _sideId: OrderSideId;
    private _dataItem: DataItem;
    private _activeStore: DepthSideGridRecordStore;
    private _styleCache = new Array<DepthSideFrame.StyleCacheElement>(DepthStyle.idCount);
    private _filterXrefs: string[] = [];
    // private _activeWidth = 0;

    constructor(private readonly _componentAccess: DepthSideFrame.ComponentAccess) {
        super();
    }

    get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }

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
        this._activeStore.close();
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

    handleGridClickEvent(fieldIndex: Integer, recordIndex: Integer) {
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
        let fieldDefaultVisibles: boolean[];
        let store: DepthSideGridRecordStore;
        switch (styleId) {
            case DepthStyleId.Full: {
                const idCount = FullDepthSideField.idCount;
                fields = new Array<DepthSideGridField>(idCount);
                fieldDefaultVisibles = new Array<boolean>(idCount);

                for (let id = 0; id < idCount; id++) {
                    const field = new FullDepthSideGridField(id, this._sideId, () => this.handleGetDataItemCorrectnessIdEvent());
                    fields[id] = field;
                    fieldDefaultVisibles[id] = FullDepthSideField.idToDefaultVisible(id);
                }

                store = new FullDepthSideGridRecordStore(styleId, this._sideId);
                break;
            }
            case DepthStyleId.Short: {
                const idCount = ShortDepthSideField.idCount;
                fields = new Array<DepthSideGridField>(idCount);
                fieldDefaultVisibles = new Array<boolean>(idCount);

                for (let id = 0; id < idCount; id++) {
                    const field = new ShortDepthSideGridField(id, this._sideId, () => this.handleGetDataItemCorrectnessIdEvent());
                    fields[id] = field;
                    fieldDefaultVisibles[id] = ShortDepthSideField.idToDefaultVisible(id);
                }

                store = new ShortDepthSideGridRecordStore(styleId, this._sideId);
                break;
            }
            default:
                throw new UnreachableCaseError('DSFI225576', styleId);
        }

        if (initialGridLayoutDefinition === undefined) {
            initialGridLayoutDefinition = this.createDefaultGridLayoutDefinition(fields, fieldDefaultVisibles);
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
        this._activeStore = this._styleCache[styleId].store;
        switch (this._activeStore.styleId) {
            case DepthStyleId.Full: {
                const fullDataStore = this._activeStore as FullDepthSideGridRecordStore;
                this.setGrid(fullDataStore);
                break;
            }
            case DepthStyleId.Short: {
                const shortDataStore = this._activeStore as ShortDepthSideGridRecordStore;
                this.setGrid(shortDataStore);
                break;
            }
            default:
                throw new UnreachableCaseError('DSFDSFAS333387', this._activeStore.styleId);
        }

        const styleCacheElement = this._styleCache[styleId];
        this.prepareGrid(styleCacheElement);
    }

    private setGrid(dataStore: RevRecordStore) {
        this._grid = this._componentAccess.createGrid(dataStore);
        this._grid.recordFocusedEventer = (newRecordIndex, oldRecordIndex) => this.handleRecordFocusEvent(newRecordIndex, oldRecordIndex);
        this._grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        this._grid.mainDblClickEventer = (fieldIndex, recordIndex) => this.handleGridDblClickEvent(fieldIndex, recordIndex);
    }

    private prepareGrid(element: DepthSideFrame.StyleCacheElement) {
        if (this._gridPrepared) {
            this._grid.reset();
        }

        const gridLayout = new GridLayout(element.lastLayoutDefinition);
        this._grid.fieldsLayoutReset(element.gridFields, gridLayout);

        this. _grid.sortable = false;
        this. _grid.continuousFiltering = true;

        this._gridPrepared = true;
    }
}

export namespace DepthSideFrame {
    export const initialDepthStyleId = DepthStyleId.Full;

    // export type ColumnWidthChangedEventHandler = (this: void, columnIndex: Integer) => void;
    // export type ActiveWidthChangedEventHandler = (this: void) => void;

    export class StyleCacheElement {
        gridFields: readonly DepthSideGridField[];
        // defaultGridFieldStates: readonly GridRecordFieldState[];
        // defaultGridFieldVisibles: readonly boolean[];
        lastLayoutDefinition: GridLayoutDefinition;
        store: DepthSideGridRecordStore;
    }

    export interface ComponentAccess {
        readonly id: string;
        createGrid(dataStore: RevRecordStore): RecordGrid;
    }

    export namespace JsonName {
        export const fullLayout = 'fullLayout';
        export const shortLayout = 'shortLayout';
    }
}
