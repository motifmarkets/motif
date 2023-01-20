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
    GridLayoutDefinition,
    Integer,
    JsonElement,
    LitIvemId,
    MultiEvent
} from '@motifmarkets/motif-core';
import { RecordGrid } from '../adapted-revgrid/internal-api';
import { ContentFrame } from '../content-frame';

export class TradesFrame extends ContentFrame {
    // activeWidthChangedEvent: TradesFrame.ActiveWidthChangedEventHandler;

    private _grid: RecordGrid;
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
    }

    initialise(element: JsonElement | undefined) {
        this._grid = this._componentAccess.createGrid(this._recordStore);
        this._grid.rowOrderReversed = true;
        this._grid.recordFocusedEventer = (newRecIdx, oldRecIdx) => this.handleRecordFocusEvent(newRecIdx, oldRecIdx);
        this._grid.mainClickEventer = (fieldIdx, recIdx) => this.handleGridClickEvent(fieldIdx, recIdx);
        this._grid.mainDblClickEventer = (fieldIdx, recIdx) => this.handleGridDblClickEvent(fieldIdx, recIdx);

        let gridLayout: GridLayout;
        if (element === undefined) {
            gridLayout = this.createDefaultGridLayout();
        } else {
            const tryGetElementResult = element.tryGetElementType(TradesFrame.JsonName.layout);
            if (tryGetElementResult.isErr()) {
                gridLayout = this.createDefaultGridLayout();
            } else {
                const definitionResult = GridLayoutDefinition.tryCreateFromJson(tryGetElementResult.value);
                if (definitionResult.isErr()) {
                    gridLayout = this.createDefaultGridLayout();
                } else {
                    gridLayout = new GridLayout(definitionResult.value);
                }
            }
        }

        const fieldCount = DayTradesGridField.idCount;
        const fields = new Array<DayTradesGridField>(fieldCount);

        for (let id = 0; id < fieldCount; id++) {
            const gridField = DayTradesGridField.createField(id, () => this.handleGetDataItemCorrectnessIdEvent());
            fields[id] = gridField;
        }

        this._grid.fieldsLayoutReset(fields, gridLayout);
        this._grid.sortable = false;

        this._recordStore.recordsLoaded();
    }

    override finalise() {
        if (!this.finalised) {
            this.checkClose();
            super.finalise();
        }
    }

    saveLayoutToConfig(element: JsonElement) {
        const layoutElement = element.newElement(TradesFrame.JsonName.layout);
        const definition = this._grid.createGridLayoutDefinition();
        definition.saveToJson(layoutElement);
    }

    open(litIvemId: LitIvemId, historicalDate: Date | undefined): void {
        this.checkClose();
        this._grid.dataReset();
        const definition = new DayTradesDataDefinition();
        definition.litIvemId = litIvemId;
        definition.date = historicalDate;
        this._dataItem = this.adi.subscribe(definition) as DayTradesDataItem;
        this._recordStore.setDataItem(this._dataItem);

        this._dataItemDataCorrectnessChangeEventSubscriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
            () => this.handleDataItemDataCorrectnessChangeEvent()
        );
        this._dataItemDataCorrectnessId = this._dataItem.correctnessId;

        this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
            () => this.handleDataItemBadnessChangeEvent()
        );
        this._componentAccess.hideBadnessWithVisibleDelay(this._dataItem.badness);
    }

    close() {
        this.checkClose();
    }

    createAllowedFieldsAndLayoutDefinition(): RecordGrid.AllowedFieldsAndLayoutDefinition {
        return this._grid.createAllowedFieldsAndLayoutDefinition();
    }

    applyGridLayoutDefinition(layoutDefinition: GridLayoutDefinition) {
        this._grid.applyGridLayoutDefinition(layoutDefinition);
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

    // getRenderedActiveWidth() {
    //     return this._componentAccess.gridGetRenderedActiveWidth();
    // }

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

    private createDefaultGridLayout() {
        const fieldIds: DayTradesGridField.Id[] = [
            DayTradesDataItem.Field.Id.Time,
            DayTradesDataItem.Field.Id.Price,
            DayTradesDataItem.Field.Id.Quantity,
        ];

        const count = fieldIds.length;
        const columns = new Array<GridLayoutDefinition.Column>(count);
        for (let i = 0; i < count; i++) {
            const fieldId = fieldIds[i];
            const column: GridLayoutDefinition.Column = {
                fieldName: DayTradesDataItem.Field.idToName(fieldId),
            };
            columns[i] = column;
        }
        const definition = new GridLayoutDefinition(columns);
        return new GridLayout(definition);
    }

    private checkClose() {
        if (this._dataItem !== undefined) {
            this._dataItem.unsubscribeCorrectnessChangedEvent(this._dataItemDataCorrectnessChangeEventSubscriptionId);
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

        createGrid(dataStore: DayTradesGridRecordStore): RecordGrid;
        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }

    export namespace JsonName {
        export const layout = 'layout';
    }
}
