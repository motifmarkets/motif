import {
    AdiService, Integer,
    JsonElement,
    Scan,
    ScansGridRecordStore,
    ScansService
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

    initialise(element: JsonElement | undefined) {
        // if (element !== undefined) {
        //     const layoutElementResult = element.tryGetElement(ScansFrame.JsonName.layout);
        //     if (layoutElementResult.isOk()) {
        //         const definitionResult = GridLayoutDefinition.tryCreateFromJson(layoutElementResult.value);
        //         if (definitionResult.isOk()) {
        //             this._grid.loadLayoutDefinition(definitionResult.value);
        //         }
        //     }
        // }
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
        this._grid.recordFocusedEventer = (newRecIdx, oldRecIdx) => this.handleRecordFocusEvent(newRecIdx, oldRecIdx);
        this._grid.mainClickEventer = (fieldIdx, recIdx) => this.handleGridClickEvent(fieldIdx, recIdx);
        this._grid.mainDblClickEventer = (fieldIdx, recIdx) => this.handleGridDblClickEvent(fieldIdx, recIdx);

        this.prepareGrid();
    }

    save(element: JsonElement) {
        // const layoutElement = element.newElement(ScansFrame.JsonName.layout);
        // const definition = this._grid.saveLayoutDefinition();
        // definition.saveToJson(layoutElement);
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

    //     this._dataItemDataCorrectnessChangeEventSubscriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
    //         () => this.handleDataItemDataCorrectnessChangeEvent()
    //     );
    //     this._dataItemDataCorrectnessId = this._dataItem.correctnessId;

    //     this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
    //         () => this.handleDataItemBadnessChangeEvent()
    //     );
    //     this._componentAccess.hideBadnessWithVisibleDelay(this._dataItem.badness);
    // }

    prepareGrid() {
        // if (this._gridPrepared) {
        //     this._grid.reset();
        // }

        // this._grid.sortable = true;

        // const fields = ScansGridField.allIds.map((id) => ScansGridField.createField(id));
        // this.recordStore.addFields(fields);

        // fields.forEach((field) => {
        //     this.setFieldState(field);
        //     this._grid.setFieldVisible(field, field.defaultVisible);
        // });

        // this.recordStore.recordsLoaded();

        // this._gridPrepared = true;

        // this.applyFilter();


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
            const scan = this._scansService.getAt(newRecordIndex);
            this._componentAccess.setFocusedScan(scan);
        }
    }

    handleGridClickEvent(_fieldIndex: Integer, _recordIndex: Integer) {
        //
    }

    handleGridDblClickEvent(_fieldIndex: Integer, _recordIndex: Integer) {
        //
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
    //         this._dataItem.unsubscribeCorrectnessChangedEvent(this._dataItemDataCorrectnessChangeEventSubscriptionId);
    //         this._dataItem.unsubscribeBadnessChangeEvent(this._dataItemBadnessChangeEventSubscriptionId);
    //         this._recordStore.clearDataItem();
    //         this.adi.unsubscribe(this._dataItem);
    //         this._dataItem = undefined;
    //         this._dataItemDataCorrectnessId = CorrectnessId.Suspect;
    //     }
    // }

    private filterItems(scan: Scan) {
        if (this._uppercaseFilterText.length === 0) {
            return true;
        } else {
            return scan.upperCaseName.includes(this._uppercaseFilterText) || scan.upperCaseDescription.includes(this._uppercaseFilterText);
        }
    }

    private applyFilter(): void {
        this._grid.clearFilter();

        if (this._uppercaseFilterText.length > 0) {
            this._grid.applyFilter((record) => this.filterItems(record as Scan));
        }
    }
}

export namespace ScansFrame {
    // export type ActiveWidthChangedEventHandler = (this: void) => void;

    export interface ComponentAccess {
        setFocusedScan(value: Scan | undefined): void;
        // readonly id: string;

        // setBadness(value: Badness): void;
        // hideBadnessWithVisibleDelay(badness: Badness): void;
    }

    export namespace JsonName {
        export const layout = 'layout';
    }
}
