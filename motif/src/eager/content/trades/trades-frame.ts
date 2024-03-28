/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgrid,
    AdiService,
    AllowedFieldsGridLayoutDefinition,
    AssertInternalError,
    Badness,
    CellPainterFactoryService,
    CorrectnessId,
    DayTradesDataDefinition,
    DayTradesDataItem,
    DayTradesGridField,
    DayTradesGridRecordStore,
    GridLayoutDefinition,
    JsonElement,
    LitIvemId,
    MultiEvent,
    RecordGrid,
    RenderValueRecordGridCellPainter,
    SettingsService,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { RevGridLayout, RevGridLayoutDefinition } from '@xilytix/rev-data-source';
import { ContentFrame } from '../content-frame';

export class TradesFrame extends ContentFrame {
    private _grid: RecordGrid;
    private _recordStore: DayTradesGridRecordStore;

    private _dataItem: DayTradesDataItem | undefined;
    private _dataItemBadnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemDataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemDataCorrectnessId = CorrectnessId.Suspect;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    private _gridLayout: RevGridLayout;

    constructor(
        private readonly _settingsService: SettingsService,
        protected readonly adiService: AdiService,
        private readonly _cellPainterFactoryService: CellPainterFactoryService,
        private readonly _componentAccess: TradesFrame.ComponentAccess,
    ) {
        super();
        this._recordStore = new DayTradesGridRecordStore();
    }

    get opened() { return this._dataItem !== undefined; }

    setupGrid(gridHost: HTMLElement) {
        this._grid = this.createGridAndCellPainters(gridHost);
        // this.applySettings();
        this._grid.activate();
        this._grid.rowOrderReversed = true;
    }

    initialise(tradesFrameElement: JsonElement | undefined) {
        if (tradesFrameElement === undefined) {
            this._gridLayout = this.createDefaultGridLayout();
        } else {
            const tryGetElementResult = tradesFrameElement.tryGetElement(TradesFrame.JsonName.layout);
            if (tryGetElementResult.isErr()) {
                this._gridLayout = this.createDefaultGridLayout();
            } else {
                const definitionResult = GridLayoutDefinition.tryCreateFromJson(tryGetElementResult.value);
                if (definitionResult.isErr()) {
                    this._gridLayout = this.createDefaultGridLayout();
                } else {
                    this._gridLayout = new RevGridLayout(definitionResult.value);
                }
            }
        }

        const fieldCount = DayTradesGridField.idCount;
        const fields = new Array<DayTradesGridField>(fieldCount);

        for (let id = 0; id < fieldCount; id++) {
            const gridField = DayTradesGridField.createField(id, () => this.handleGetDataItemCorrectnessIdEvent());
            fields[id] = gridField;
        }

        this._grid.initialiseAllowedFields(fields);

        this._recordStore.recordsLoaded();
    }

    override finalise() {
        if (!this.finalised) {
            this._grid.destroy();
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
        this._grid.resetUsable();
        const definition = new DayTradesDataDefinition();
        definition.litIvemId = litIvemId;
        definition.date = historicalDate;
        this._dataItem = this.adiService.subscribe(definition) as DayTradesDataItem;
        this._recordStore.setDataItem(this._dataItem);

        this._dataItemDataCorrectnessChangeEventSubscriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
            () => this.handleDataItemDataCorrectnessChangeEvent()
        );
        this._dataItemDataCorrectnessId = this._dataItem.correctnessId;

        this._dataItemBadnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangedEvent(
            () => this.handleDataItemBadnessChangeEvent()
        );
        this._componentAccess.hideBadnessWithVisibleDelay(this._dataItem.badness);

        if (this._dataItem.usable) {
            this._grid.applyFirstUsable(undefined, undefined, this._gridLayout);
        }
    }

    close() {
        this.checkClose();
    }

    createAllowedFieldsGridLayoutDefinition(): AllowedFieldsGridLayoutDefinition {
        const allowedFields = DayTradesGridField.createAllowedFields();
        return this._grid.createAllowedFieldsGridLayoutDefinition(allowedFields);
    }

    applyGridLayoutDefinition(layoutDefinition: RevGridLayoutDefinition) {
        this._grid.applyGridLayoutDefinition(layoutDefinition);
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        this._grid.autoSizeAllColumnWidths(widenOnly);
    }

    // private handleRecordFocusEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
    // }

    // private handleGridClickEvent(fieldIndex: Integer, recordIndex: Integer) {
    // }

    // private handleGridDblClickEvent(fieldIndex: Integer, recordIndex: Integer) {
    // }

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
            if (this._dataItem.usable && !this._grid.beenUsable) {
                this._grid.applyFirstUsable(undefined, undefined, this._gridLayout);
            }
            this._componentAccess.setBadness(this._dataItem.badness);
        }
    }

    private handleGetDataItemCorrectnessIdEvent() {
        return this._dataItemDataCorrectnessId;
    }

    private createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(gridHostElement);

        this._gridHeaderCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this._cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);

        return grid;
    }

    private createGrid(gridHostElement: HTMLElement) {
        const customGridSettings: AdaptedRevgrid.CustomGridSettings = {
            sortOnClick: false,
            sortOnDoubleClick: false,
        }

        const grid = new RecordGrid(
            this._settingsService,
            gridHostElement,
            this._recordStore,
            customGridSettings,
            () => this.customiseSettingsForNewColumn(),
            () => this.getMainCellPainter(),
            () => this.getHeaderCellPainter(),
            this,
        );

        return grid;
    }

    private createDefaultGridLayout() {
        const definition = DayTradesGridField.createDefaultGridLayoutDefinition();
        return new RevGridLayout(definition);
    }

    private checkClose() {
        if (this._dataItem !== undefined) {
            this._dataItem.unsubscribeCorrectnessChangedEvent(this._dataItemDataCorrectnessChangeEventSubscriptionId);
            this._dataItem.unsubscribeBadnessChangedEvent(this._dataItemBadnessChangeEventSubscriptionId);
            this._recordStore.clearDataItem();
            this.adiService.unsubscribe(this._dataItem);
            this._dataItem = undefined;
            this._dataItemDataCorrectnessId = CorrectnessId.Suspect;
        }
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
}

export namespace TradesFrame {
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
