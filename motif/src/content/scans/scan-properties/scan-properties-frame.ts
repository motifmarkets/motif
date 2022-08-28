import {
    Badness,
    GridLayout,
    GridLayoutIO,
    GridLayoutRecordStore,
    Integer,
    JsonElement,
    ScansGridField,
    ScansGridRecordStore,
    ScansService
} from '@motifmarkets/motif-core';
import { RecordGrid } from '../../adapted-revgrid/internal-api';
import { ContentFrame } from '../../content-frame';

export class ScansGridFrame extends ContentFrame {
    // activeWidthChangedEvent: TradesFrame.ActiveWidthChangedEventHandler;

    private _grid: RecordGrid;
    private _gridPrepared = false;
    private _recordStore: ScansGridRecordStore;

    // private _dataItem: DayTradesDataItem | undefined;
    // private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessId = CorrectnessId.Suspect;

    constructor(
        private readonly _componentAccess: ScansGridFrame.ComponentAccess,
        private readonly _scansService: ScansService
    ) {
        super();
        this._recordStore = new ScansGridRecordStore(_scansService);
    }

    get recordStore() {
        return this._recordStore;
    }

    override finalise() {
        if (!this.finalised) {
            // this.checkClose();
            super.finalise();
        }
    }

    // grid functions used by Component

    setGrid(value: RecordGrid) {
        this._grid = value;
        this._grid.rowOrderReversed = true;
        this._grid.recordFocusEventer = (newRecIdx, oldRecIdx) =>
            this.handleRecordFocusEvent(newRecIdx, oldRecIdx);
        this._grid.mainClickEventer = (fieldIdx, recIdx) =>
            this.handleGridClickEvent(fieldIdx, recIdx);
        this._grid.mainDblClickEventer = (fieldIdx, recIdx) =>
            this.handleGridDblClickEvent(fieldIdx, recIdx);

        this.prepareGrid();
    }

    loadLayoutConfig(element: JsonElement | undefined) {
        if (element !== undefined) {
            const context = 'ScansGridFrame';
            const layoutElement = element.tryGetElement(
                ScansGridFrame.JsonName.layout,
                context
            );
            const serialisedColumns = GridLayoutIO.loadLayout(layoutElement);
            if (serialisedColumns) {
                const layout = this._grid.saveLayout();
                layout.deserialise(serialisedColumns);
                this._grid.loadLayout(layout);
            }
        }
    }

    saveLayoutConfig(element: JsonElement) {
        const layoutElement = element.newElement(
            ScansGridFrame.JsonName.layout
        );
        const columns = this._grid.saveLayout().serialise();
        GridLayoutIO.saveLayout(columns, layoutElement);
    }

    // close() {
    //     this.checkClose();
    // }

    // open(litIvemId: LitIvemId, historicalDate: Date | undefined): void {
    //     this.checkClose();
    //     const definition = new DayTradesDataDefinition();
    //     definition.litIvemId = litIvemId;
    //     definition.date = historicalDate;
    //     this._dataItem = this.adi.subscribe(definition) as DayTradesDataItem;
    //     this._recordStore.setDataItem(this._dataItem);

    //     this._dataItemDataCorrectnessChangeEventSubscriptionId = this._dataItem.subscribeCorrectnessChangeEvent(
    //         () => this.handleDataItemDataCorrectnessChangeEvent()
    //     );
    //     this._dataItemDataCorrectnessId = this._dataItem.correctnessId;

    //     this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
    //         () => this.handleDataItemBadnessChangeEvent()
    //     );
    //     this._componentAccess.hideBadnessWithVisibleDelay(this._dataItem.badness);
    // }

    prepareGrid() {
        if (this._gridPrepared) {
            this._grid.reset();
        }

        const fieldCount = ScansGridField.allIds.length;
        const fields = new Array<ScansGridField>(fieldCount);

        for (let id = 0; id < fieldCount; id++) {
            const gridField = ScansGridField.createField(id);
            fields[id] = gridField;
        }
        this._recordStore.addFields(fields);

        this._grid.sortable = true;

        for (let id = 0; id < fieldCount; id++) {
            this._grid.setFieldState(
                fields[id],
                fields[id].fieldStateDefinition
            );
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
        this._recordStore.recordsLoaded();

        this._gridPrepared = true;
    }

    autoSizeAllColumnWidths() {
        this._grid.autoSizeAllColumnWidths();
    }

    handleRecordFocusEvent(
        newRecordIndex: Integer | undefined,
        oldRecordIndex: Integer | undefined
    ) {}

    handleGridClickEvent(fieldIndex: Integer, recordIndex: Integer) {}

    handleGridDblClickEvent(fieldIndex: Integer, recordIndex: Integer) {}

    getGridLayoutWithHeadersMap(): GridLayoutRecordStore.LayoutWithHeadersMap {
        return this._grid.getLayoutWithHeadersMap();
    }

    setGridLayout(layout: GridLayout): void {
        this._grid.loadLayout(layout);
    }

    // private handleDataItemDataCorrectnessChangeEvent() {
    //     if (this._dataItem === undefined) {
    //         throw new AssertInternalError('TFHDIDCCE4554594722');
    //     } else {
    //         this._dataItemDataCorrectnessId = this._dataItem.correctnessId;
    //     }
    // }

    // private handleDataItemBadnessChangeEvent() {
    //     if (this._dataItem === undefined) {
    //         throw new AssertInternalError('TFHDIBCE23000447878');
    //     } else {
    //         this._componentAccess.setBadness(this._dataItem.badness);
    //     }
    // }

    // private handleGetDataItemCorrectnessIdEvent() {
    //     return this._dataItemDataCorrectnessId;
    // }

    // private checkClose() {
    //     if (this._dataItem !== undefined) {
    //         this._dataItem.unsubscribeCorrectnessChangeEvent(this._dataItemDataCorrectnessChangeEventSubscriptionId);
    //         this._dataItem.unsubscribeBadnessChangeEvent(this._dataItemBadnessChangeEventSubscriptionId);
    //         this._recordStore.clearDataItem();
    //         this.adi.unsubscribe(this._dataItem);
    //         this._dataItem = undefined;
    //         this._dataItemDataCorrectnessId = CorrectnessId.Suspect;
    //     }
    // }
}

export namespace ScansGridFrame {
    // export type ActiveWidthChangedEventHandler = (this: void) => void;

    export interface ComponentAccess {
        readonly id: string;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }

    export namespace JsonName {
        export const layout = 'layout';
    }
}
