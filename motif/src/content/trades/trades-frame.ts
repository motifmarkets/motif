/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    Badness,
    CorrectnessId,
    DayTradesDataDefinition,
    DayTradesDataItem,
    DayTradesGridField,
    DayTradesGridRecordStore,
    GridLayout,
    GridLayoutIO,
    GridLayoutRecordStore,
    Integer,
    JsonElement,
    LitIvemId,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from '@motifmarkets/motif-core';
import { RecordGrid } from 'content-internal-api';
import { ContentFrame } from '../content-frame';

export class TradesFrame extends ContentFrame {
    // activeWidthChangedEvent: TradesFrame.ActiveWidthChangedEventHandler;

    private _grid: RecordGrid;
    private _gridPrepared = false;
    private _recordStore: DayTradesGridRecordStore;

    private _dataItem: DayTradesDataItem | undefined;
    private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemDataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemDataCorrectnessId = CorrectnessId.Suspect;

    constructor(
        private readonly _componentAccess: TradesFrame.ComponentAccess,
        protected readonly adi: AdiService
    ) {
        super();
        this._recordStore = new DayTradesGridRecordStore();
        this._recordStore.listChangeEvent =
            (listChangeTypeId, index, count) => this.handleDataStoreListChangeEvent(listChangeTypeId, index, count);
        this._recordStore.recordChangeEvent = (index) => this.handleDataStoreRecordChangeEvent(index);
        this._recordStore.allRecordsChangeEvent = () => this.handleDataStoreAllRecordsChangeEvent();
    }

    get recordStore() { return this._recordStore; }

    override finalise() {
        if (!this.finalised) {
            this.checkClose();
            super.finalise();
        }
    }

    // grid functions used by Component

    setGrid(value: RecordGrid) {
        this._grid = value;
        this._grid.rowOrderReversed = true;
        this._grid.recordFocusEventer = (newRecIdx, oldRecIdx) => this.handleRecordFocusEvent(newRecIdx, oldRecIdx);
        this._grid.mainClickEventer = (fieldIdx, recIdx) => this.handleGridClickEvent(fieldIdx, recIdx);
        this._grid.mainDblClickEventer = (fieldIdx, recIdx) => this.handleGridDblClickEvent(fieldIdx, recIdx);

        this.prepareGrid();
    }

    loadLayoutConfig(element: JsonElement | undefined) {
        if (element !== undefined) {
            const context = 'TradesFrame';
            const layoutElement = element.tryGetElement(TradesFrame.JsonName.layout, context);
            const serialisedColumns = GridLayoutIO.loadLayout(layoutElement);
            if (serialisedColumns) {
                const layout = this._grid.saveLayout();
                layout.deserialise(serialisedColumns);
                this._grid.loadLayout(layout);
            }
        }
    }

    saveLayoutConfig(element: JsonElement) {
        const layoutElement = element.newElement(TradesFrame.JsonName.layout);
        const columns = this._grid.saveLayout().serialise();
        GridLayoutIO.saveLayout(columns, layoutElement);
    }

    close() {
        this.checkClose();
    }

    open(litIvemId: LitIvemId, historicalDate: Date | undefined): void {
        this.checkClose();
        const definition = new DayTradesDataDefinition();
        definition.litIvemId = litIvemId;
        definition.date = historicalDate;
        this._dataItem = this.adi.subscribe(definition) as DayTradesDataItem;
        this._recordStore.setDataItem(this._dataItem);

        this._dataItemDataCorrectnessChangeEventSubscriptionId = this._dataItem.subscribeCorrectnessChangeEvent(
            () => this.handleDataItemDataCorrectnessChangeEvent()
        );
        this._dataItemDataCorrectnessId = this._dataItem.correctnessId;

        this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
            () => this.handleDataItemBadnessChangeEvent()
        );
        this._componentAccess.hideBadnessWithVisibleDelay(this._dataItem.badness);
    }

    prepareGrid() {
        if (this._gridPrepared) {
            this._grid.reset();
        }

        const fieldCount = DayTradesGridField.idCount;
        const fields = new Array<DayTradesGridField>(fieldCount);

        for (let id = 0; id < fieldCount; id++) {
            const gridField = DayTradesGridField.createField(id, () => this.handleGetDataItemCorrectnessIdEvent());
            fields[id] = gridField;
        }
        this._recordStore.fieldsEventers.addFields(fields);

        this._grid.sortable = false;

        for (let id = 0; id < fieldCount; id++) {
            this._grid.setFieldState(fields[id], fields[id].fieldStateDefinition);
        }

        for (let id = 0; id < fieldCount; id++) {
            this._grid.setFieldVisible(fields[id], fields[id].defaultVisible);
        }

        // const fieldsAndInitialStates = this._table.getGridFieldsAndInitialStates();
        // this._componentAccess.gridAddFields(fieldsAndInitialStates.fields);
        // const states = fieldsAndInitialStates.states;
        // const fieldCount = states.length; // one state for each field
        // for (let i = 0; i < fieldCount; i++) {
        //     this._componentAccess.gridSetFieldState(i, states[i]);
        // }

        // this._componentAccess.gridLoadLayout(this._table.layout);
        this._recordStore.recordsEventers.recordsLoaded();

        this._gridPrepared = true;
    }

    autoSizeAllColumnWidths() {
        this._grid.autoSizeAllColumnWidths();
    }

    handleRecordFocusEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
    }

    handleGridClickEvent(fieldIndex: Integer, recordIndex: Integer) {
    }

    handleGridDblClickEvent(fieldIndex: Integer, recordIndex: Integer) {
    }

    // adviseColumnWidthChanged(columnIndex: Integer) {
    //     if (this.activeWidthChangedEvent !== undefined) {
    //         this.activeWidthChangedEvent(); // advise PariDepth frame
    //     }
    // }

    getGridLayoutWithHeadersMap(): GridLayoutRecordStore.LayoutWithHeadersMap {
        return this._grid.getLayoutWithHeadersMap();
    }

    setGridLayout(layout: GridLayout): void {
        this._grid.loadLayout(layout);
    }

    // getRenderedActiveWidth() {
    //     return this._componentAccess.gridGetRenderedActiveWidth();
    // }

    private handleDataStoreListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer): void {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                // handled through badness change
                break;

            case UsableListChangeTypeId.PreUsableClear:
                this._recordStore.recordsEventers.allRecordsDeleted();
                break;

            case UsableListChangeTypeId.PreUsableAdd:
                this._recordStore.recordsEventers.recordsInserted(idx, count);
                break;

            case UsableListChangeTypeId.Usable:
                // handled through badness change
                break;

            case UsableListChangeTypeId.Insert:
                this._recordStore.recordsEventers.recordsInserted(idx, count);
                break;

            case UsableListChangeTypeId.Remove:
                this._recordStore.recordsEventers.recordsDeleted(idx, count);
                break;

            case UsableListChangeTypeId.Clear:
                this._recordStore.recordsEventers.allRecordsDeleted();
                break;

            default:
                throw new UnreachableCaseError('TFHDSLC23333232', listChangeTypeId);
        }
    }

    private handleDataStoreRecordChangeEvent(index: Integer) {
        this._recordStore.recordsEventers.invalidateRecord(index);
    }

    private handleDataStoreAllRecordsChangeEvent() {
        this._recordStore.recordsEventers.recordsLoaded();
    }

    private handleDataItemDataCorrectnessChangeEvent() {
        if (this._dataItem === undefined) {
            throw new AssertInternalError('TFHDIDCCE4554594722');
        } else {
            this._dataItemDataCorrectnessId = this._dataItem.correctnessId;
        }
    }

    private handleDataItemBadnessChangeEvent() {
        if (this._dataItem === undefined) {
            throw new AssertInternalError('TFHDIBCE23000447878');
        } else {
            this._componentAccess.setBadness(this._dataItem.badness);
        }
    }

    private handleGetDataItemCorrectnessIdEvent() {
        return this._dataItemDataCorrectnessId;
    }

    private checkClose() {
        if (this._dataItem !== undefined) {
            this._dataItem.unsubscribeCorrectnessChangeEvent(this._dataItemDataCorrectnessChangeEventSubscriptionId);
            this._dataItem.unsubscribeBadnessChangeEvent(this._dataItemBadnessChangeEventSubscriptionId);
            this._recordStore.clearDataItem();
            this.adi.unsubscribe(this._dataItem);
            this._dataItem = undefined;
            this._dataItemDataCorrectnessId = CorrectnessId.Suspect;
        }
    }
}

export namespace TradesFrame {
    // export type ActiveWidthChangedEventHandler = (this: void) => void;

    export class TradesSubscriptionIds {
        beginChanges: MultiEvent.SubscriptionId;
        endChanges: MultiEvent.SubscriptionId;
        statusChange: MultiEvent.SubscriptionId;
        listChange: MultiEvent.SubscriptionId;
    }

    export interface ComponentAccess {
        readonly id: string;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }

    export namespace JsonName {
        export const layout = 'layout';
    }
}
