/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridField, GridFieldState, GridLayout, GridTransform } from '@motifmarkets/revgrid';
import { AdiService, DayTradesDataDefinition, DayTradesDataItem, LitIvemId } from 'src/adi/internal-api';
import { DayTradesGridDataStore, DayTradesGridField, GridLayoutDataStore, GridLayoutIO, pulseGridTransforms } from 'src/core/internal-api';
import {
    AssertInternalError,
    Badness,
    CorrectnessId,
    Integer,
    JsonElement,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { ContentFrame } from '../content-frame';

export class TradesFrame extends ContentFrame {
    activeWidthChangedEvent: TradesFrame.ActiveWidthChangedEventHandler;

    private _dataStore: DayTradesGridDataStore;

    private _dataItem: DayTradesDataItem | undefined;
    private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemDataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemDataCorrectnessId = CorrectnessId.Suspect;

    get dataStore() { return this._dataStore; }

    constructor(private _componentAccess: TradesFrame.ComponentAccess, protected adi: AdiService) {
        super();
        this._dataStore = new DayTradesGridDataStore();
        this._dataStore.listChangeEvent =
            (listChangeTypeId, index, count) => this.handleDataStoreListChangeEvent(listChangeTypeId, index, count);
        this._dataStore.recordChangeEvent = (index) => this.handleDataStoreRecordChangeEvent(index);
        this._dataStore.allRecordsChangeEvent = () => this.handleDataStoreAllRecordsChangeEvent();
    }

    override finalise() {
        this.checkClose();

        super.finalise();
    }

    loadLayoutConfig(element: JsonElement | undefined) {
        if (element !== undefined) {
            const context = 'TradesFrame';
            const layoutElement = element.tryGetElement(TradesFrame.JsonName.layout, context);
            const serialisedColumns = GridLayoutIO.loadLayout(layoutElement);
            if (serialisedColumns) {
                const layout = this._componentAccess.gridSaveLayout();
                layout.Deserialise(serialisedColumns);
                this._componentAccess.gridLoadLayout(layout);
            }
        }
    }

    saveLayoutConfig(element: JsonElement) {
        const layoutElement = element.newElement(TradesFrame.JsonName.layout);
        const columns = this._componentAccess.gridSaveLayout().Serialise();
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
        this._dataStore.setDataItem(this._dataItem);

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
        this._componentAccess.gridBeginChange();
        try {
            this._componentAccess.gridReset();
            pulseGridTransforms.forEach(transform => this._componentAccess.gridAddTransform(transform));

            const fieldCount = DayTradesGridField.idCount;
            const fields = new Array<DayTradesGridField>(fieldCount);

            for (let id = 0; id < fieldCount; id++) {
                const gridField = DayTradesGridField.createField(id, () => this.handleGetDataItemCorrectnessIdEvent());
                this._componentAccess.gridAddField(gridField);
                fields[id] = gridField;
            }

            for (let id = 0; id < fieldCount; id++) {
                this._componentAccess.gridSetFieldState(fields[id], fields[id].fieldStateDefinition);
            }

            for (let id = 0; id < fieldCount; id++) {
                this._componentAccess.gridSetFieldVisible(fields[id], fields[id].defaultVisible);
            }

            // const fieldsAndInitialStates = this._table.getGridFieldsAndInitialStates();
            // this._componentAccess.gridAddFields(fieldsAndInitialStates.fields);
            // const states = fieldsAndInitialStates.states;
            // const fieldCount = states.length; // one state for each field
            // for (let i = 0; i < fieldCount; i++) {
            //     this._componentAccess.gridSetFieldState(i, states[i]);
            // }

            // this._componentAccess.gridLoadLayout(this._table.layout);
            this._componentAccess.gridInvalidateAll();
        } finally {
            this._componentAccess.gridEndChange();
        }
    }

    autoSizeAllColumnWidths() {
        this._componentAccess.gridAutoSizeAllColumnWidths();
    }

    adviseTableRecordFocus(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
    }

    adviseTableRecordFocusClick(recordIndex: Integer, fieldIndex: Integer) {
    }

    adviseTableRecordFocusDblClick(recordIndex: Integer, fieldIndex: Integer) {
    }

    adviseColumnWidthChanged(columnIndex: Integer) {
        if (this.activeWidthChangedEvent !== undefined) {
            this.activeWidthChangedEvent(); // advise PariDepth frame
        }
    }

    getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders {
        return this._componentAccess.getGridLayoutWithHeadings();
    }

    setGridLayout(layout: GridLayout): void {
        this._componentAccess.gridLoadLayout(layout);
    }

    getRenderedActiveWidth() {
        return this._componentAccess.gridGetRenderedActiveWidth();
    }

    private handleDataStoreListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer): void {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                // handled through badness change
                break;

            case UsableListChangeTypeId.PreUsableClear:
                this._componentAccess.gridDeleteAllRecords();
                break;

            case UsableListChangeTypeId.PreUsableAdd:
                this._componentAccess.gridInsertRecords(idx, count);
                break;

            case UsableListChangeTypeId.Usable:
                // handled through badness change
                break;

            case UsableListChangeTypeId.Insert:
                this._componentAccess.gridInsertRecords(idx, count);
                break;

            case UsableListChangeTypeId.Remove:
                this._componentAccess.gridDeleteRecords(idx, count);
                break;

            case UsableListChangeTypeId.Clear:
                this._componentAccess.gridDeleteAllRecords();
                break;

            default:
                throw new UnreachableCaseError('TFHDSLC23333232', listChangeTypeId);
        }
    }

    private handleDataStoreRecordChangeEvent(index: Integer) {
        this._componentAccess.gridInvalidateRecord(index);
    }

    private handleDataStoreAllRecordsChangeEvent() {
        this._componentAccess.gridInvalidateAll();
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
            this._dataStore.clearDataItem();
            this.adi.unsubscribe(this._dataItem);
            this._dataItem = undefined;
            this._dataItemDataCorrectnessId = CorrectnessId.Suspect;
        }
    }
}

export namespace TradesFrame {
    export type ActiveWidthChangedEventHandler = (this: void) => void;

    export class TradesSubscriptionIds {
        beginChanges: MultiEvent.SubscriptionId;
        endChanges: MultiEvent.SubscriptionId;
        statusChange: MultiEvent.SubscriptionId;
        listChange: MultiEvent.SubscriptionId;
    }

    export interface ComponentAccess {
        readonly id: string;
        readonly gridRowRecIndices: Integer[];
        gridFocusedRecordIndex: Integer | undefined;
        gridAddTransform(transform: GridTransform): void;
        gridInsertRecords(index: Integer, count: Integer): void;
        gridInsertRecordsInSameRowPosition(index: Integer, count: Integer): void;
        gridMoveRecordRow(fromRecordIndex: Integer, toRowIndex: Integer): void;
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
        gridAddField(field: DayTradesGridField): void;
        gridSetFieldState(field: GridField, state?: GridFieldState | undefined): void;
        gridSetFieldVisible(field: GridField, visible: boolean): void;
        getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders;
        gridGetRenderedActiveWidth(): Promise<Integer>;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }

    export namespace JsonName {
        export const layout = 'layout';
    }
}
