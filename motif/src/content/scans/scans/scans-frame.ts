import {
    AdiService,
    EditableScan,
    GridLayout,
    GridLayoutIO,
    GridLayoutRecordStore,
    GridRecordFieldState,
    Integer,
    JsonElement,
    ScansGridField,
    ScansGridRecordStore,
    ScansService,
    Strings
} from '@motifmarkets/motif-core';
import { RecordGrid } from '../../adapted-revgrid/internal-api';
import { ContentFrame } from '../../content-frame';

export class ScansFrame extends ContentFrame {
    // activeWidthChangedEvent: TradesFrame.ActiveWidthChangedEventHandler;

    readonly recordStore: ScansGridRecordStore;

    private _grid: RecordGrid;
    private _gridPrepared = false;

    private _filterText = '';
    private _uppercaseFilterText = '';

    // private _dataItem: DayTradesDataItem | undefined;
    // private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private _dataItemDataCorrectnessId = CorrectnessId.Suspect;

    constructor(
        private readonly _componentAccess: ScansFrame.ComponentAccess,
        private readonly _scansService: ScansService,
        private readonly _adiService: AdiService,
    ) {
        super();
        this.recordStore = new ScansGridRecordStore(_scansService);
    }

    public get filterText() { return this._filterText; }
    public set filterText(value: string) {
        this._filterText = value;
        this._uppercaseFilterText = value.toLocaleUpperCase();
        this.applyFilter();
    }

    initialise() {

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
            const context = 'ScanFrame';
            const layoutElement = element.tryGetElement(
                ScansFrame.JsonName.layout,
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
        const layoutElement = element.newElement(ScansFrame.JsonName.layout);
        // const columns = this._grid.saveLayout().serialise();
        // GridLayoutIO.saveLayout(columns, layoutElement);
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

        const fields = ScansGridField.allIds.map((id) => ScansGridField.createField(id));
        this.recordStore.addFields(fields);

        fields.forEach((field) => {
            this.setFieldState(field);
            this._grid.setFieldVisible(field, field.defaultVisible);
        });

        this.recordStore.recordsLoaded();

        this._gridPrepared = true;

        this.applyFilter();

        // const fieldsAndInitialStates = this._table.getGridFieldsAndInitialStates();
        // this._componentAccess.gridAddFields(fieldsAndInitialStates.fields);
        // const states = fieldsAndInitialStates.states;
        // const fieldCount = states.length; // one state for each field
        // for (let i = 0; i < fieldCount; i++) {
        //     this._componentAccess.gridSetFieldState(i, states[i]);
        // }

        // this._componentAccess.gridLoadLayout(this._table.layout);

    }

    autoSizeAllColumnWidths() {
        this._grid.autoSizeAllColumnWidths();
    }

    handleRecordFocusEvent(
        newRecordIndex: Integer | undefined,
        oldRecordIndex: Integer | undefined
    ) {
        if (newRecordIndex === undefined) {
            this._componentAccess.setFocusedScan(undefined);
        } else {
            const scan = this._scansService.getScan(newRecordIndex);
            this._componentAccess.setFocusedScan(scan);
        }
    }

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

    private setFieldState(field: ScansGridField) {
        const fieldStateDefinition = field.fieldStateDefinition;
        const state: GridRecordFieldState = {
            header: Strings[fieldStateDefinition.headerId],
            width: undefined,
            alignment: fieldStateDefinition.alignment
        };
        this._grid.setFieldState(field, state);
    }

    private filterItems(scan: EditableScan) {
        if (this._uppercaseFilterText.length === 0) {
            return true;
        } else {
            return scan.uppercaseName.includes(this._uppercaseFilterText) || scan.uppercaseDescription.includes(this._uppercaseFilterText);
        }
    }

    private applyFilter(): void {
        this._grid.clearFilter();

        if (this._uppercaseFilterText.length > 0) {
            this._grid.applyFilter((record) => this.filterItems(record as EditableScan));
        }
    }
}

export namespace ScansFrame {
    // export type ActiveWidthChangedEventHandler = (this: void) => void;

    export interface ComponentAccess {
        setFocusedScan(value: EditableScan | undefined): void;
        // readonly id: string;

        // setBadness(value: Badness): void;
        // hideBadnessWithVisibleDelay(badness: Badness): void;
    }

    export namespace JsonName {
        export const layout = 'layout';
    }
}
