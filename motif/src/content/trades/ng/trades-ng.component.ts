/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import {
    GridAdapter, GridField,
    GridFieldState, GridHost, GridLayout,
    GridTransform, RevgridComponent,
    TFieldIndex, TRecordIndex
} from '@motifmarkets/revgrid';
import { SettingsNgService } from 'src/component-services/ng-api';
import {
    DayTradesGridField,
    defaultGridCellRendererName,
    defaultGridCellRenderPaint,
    GridLayoutDataStore,
    SettingsService
} from 'src/core/internal-api';
import { assert, assigned, Badness, delay1Tick, HtmlTypes, Integer, MultiEvent } from 'src/sys/internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { TradesFrame } from '../trades-frame';

@Component({
    selector: 'app-trades',
    templateUrl: './trades-ng.component.html',
    styleUrls: ['./trades-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesNgComponent implements OnDestroy, AfterViewInit, GridHost, TradesFrame.ComponentAccess {
    @ViewChild('delayedBadness') private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(RevgridComponent, { static: true }) private _grid: RevgridComponent;

    public gridVisibility = HtmlTypes.Visiblity.Hidden;

    private _settingsNgService: SettingsService;
    private _frame: TradesFrame;
    private _gridAdapter: GridAdapter;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        contentService: ContentNgService,
    ) {
        this._settingsNgService = settingsNgService.settingsService;
        this._frame = contentService.createTradesFrame(this);
    }

    ngOnDestroy() {
        // this._onAutoAdjustColumnWidths = undefined;
        this.frame.finalise();

        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsNgService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        }
    }

    ngAfterViewInit() {
        assert(assigned(this._grid), 'ID:3014133625');

        this._gridAdapter = this.createGridAdapter();
        this._settingsChangedSubscriptionId =
        this._settingsNgService.subscribeSettingsChangedEvent(() => this.handleSettingChangedEvent());

        this.frame.prepareGrid();

        this.applySettings();

        delay1Tick(() => { this.gridVisibility = HtmlTypes.Visiblity.Visible; this._cdr.markForCheck(); });


        // this._gridAccess.gridLoadLayout = (layout: GridLayout): void => {
        //     gridAdapter.LoadLayout(layout);
        // };
        // this._gridAccess.gridSaveLayout = (): GridLayoutDataStore.GridLayoutWithHeaders => {
        //     const layout = gridAdapter.SaveLayout();
        //     return {
        //         layout: layout,
        //         headersMap: calcGridHeadersMap(layout),
        //     };
        // };

        // pulseGridTransforms.forEach(transform => gridAdapter.AddTransform(transform));

        // for (let id = 0; id < TradeColumn.columnCount; id++) {
        //     gridAdapter.AddField(TradeColumn.createGridField(this._settings, id));
        // }

        // for (let id = 0; id < TradeColumn.columnCount; id++) {
        //     gridAdapter.SetFieldState(id, { Alignment: TradeColumn.idToFieldAlignment(id) });
        //     gridAdapter.SetFieldVisible(id, TradeColumn.idToIsVisibleDefault(id));
        // }

        // this.dataStore.AddEventListeners({
        //     onDataStatusChange: () => {},
        //     onBeginChange: () => { gridAdapter.BeginChange(); },
        //     onEndChange: () => { gridAdapter.EndChange(); },
        //     onClear: () => { gridAdapter.ClearRecords(); },
        //     onInsertRecords: (recordIndex: number, count: number) => { gridAdapter.InsertRecords(recordIndex, count); },
        //     onDeleteRecords: (recordIndex: number, count: number) => { gridAdapter.DeleteRecords(recordIndex, count); },
        //     onInvalidateRecord: (recordIndex: number) => { gridAdapter.InvalidateRecord(recordIndex); },
        //     onInvalidateAll: () => { gridAdapter.InvalidateAll(); },
        // });

        // this._onAutoAdjustColumnWidths = () => {
        //     for (let id = 0; id < TradeGridField.idCount; id++) {
        //         this._gridAdapter.SetFieldWidth(id, undefined);
        //     }
        // };

        // gridAdapter.BeginChange();
        // gridAdapter.EndChange();

        // this._revGridSettingsChangedSubscriptionId = this._gridSettingsService.subscribeSettingsChangedEvent(() => {
        //     gridAdapter.ApplySettings(this._gridSettingsService.revGridSettings);
        // });
    }

    get frame(): TradesFrame { return this._frame; }

    public autoSizeColumnWidths(): void {
        this._gridAdapter.AutoSizeAllColumnWidths();
    }

    // GridHost functions
    onRecordFocus(newRecordIndex: TRecordIndex | undefined, oldRecordIndex: TRecordIndex | undefined) {
        this._frame.adviseTableRecordFocus(newRecordIndex, oldRecordIndex);
    }

    onRecordFocusClick(recordIndex: TRecordIndex, fieldIndex: TFieldIndex) {
        this._frame.adviseTableRecordFocusClick(recordIndex, fieldIndex);
    }

    onRecordFocusDblClick(recordIndex: TRecordIndex, fieldIndex: TFieldIndex) {
        this._frame.adviseTableRecordFocusDblClick(recordIndex, fieldIndex);
    }

    onColumnWidthChanged(columnIndex: Integer) {
        this._frame.adviseColumnWidthChanged(columnIndex);
    }

   // Component Access members

    get id(): string {
        return '';
        // todo - needs to return a unique id for this component
    }

    gridAddTransform(transform: GridTransform) {
        this._gridAdapter.AddTransform(transform);
    }

    gridInsertRecords(index: Integer, count: Integer) {
        this._gridAdapter.InsertRecords(index, count);
    }

    gridInsertRecordsInSameRowPosition(index: Integer, count: Integer) {
        this._gridAdapter.InsertRecords(index, count);
        // Ensure in same position.  This is based on old revgrid code where new records were appended to end of grid
        // Records then needed to be moved to required position.
        // Different logic may now be needed
        let rowIdx = index;
        for (let i = index; i < index + count; i++) {
            // this.gridAdapter.moveRecordRow(itemIdx, rowIdx);
            rowIdx++;
        }
    }

    gridMoveRecordRow(fromRecordIndex: Integer, toRowIndex: Integer) {
        // todo
    }

    gridDeleteRecords(recordIndex: Integer, count: Integer) {
        this._gridAdapter.DeleteRecords(recordIndex, count);
    }

    gridDeleteAllRecords() {
        this._gridAdapter.ClearRecords();
    }

    gridInvalidateValue(fieldIndex: Integer, recordIndex: Integer) {
        this._gridAdapter.InvalidateValue(fieldIndex, recordIndex);
    }

    gridInvalidateRecord(recordIndex: Integer) {
        this._gridAdapter.InvalidateRecord(recordIndex);
    }

    gridInvalidateAll() {
        this._gridAdapter.InvalidateAll();
    }

    gridLoadLayout(layout: GridLayout) {
        this._gridAdapter.LoadLayout(layout);
        // todo need to think about scaling
    }

    gridSaveLayout(): GridLayout {
        return this._gridAdapter.SaveLayout();
    }

    gridReorderRecRows(rowRecIndices: Integer[]) {
        // todo
    }

    get gridRowRecIndices(): Integer[] {
        return [];
        // todo
    }

    gridAutoSizeAllColumnWidths() {
        // fixed currently always adjusted
        this._gridAdapter.AutoSizeAllColumnWidths();
    }

    gridBeginChange() {
        this._gridAdapter.BeginChange();
    }

    gridEndChange() {
        this._gridAdapter.EndChange();
    }

    gridReset() {
        this._gridAdapter.Reset();
    }

    gridAddField(field: DayTradesGridField) {
        this._gridAdapter.AddField(field);
    }

    gridSetFieldState(field: GridField, state?: GridFieldState | undefined) {
        this._gridAdapter.SetFieldState(field, state);
    }

    gridSetFieldVisible(fieldOrIndex: number | GridField, visible: boolean) {
        this._gridAdapter.SetFieldVisible(fieldOrIndex, visible);
    }

    get gridFocusedRecordIndex(): Integer | undefined {
        // TODO:MED this.gridAdapter.FocusedRecordIndex always returns null. Find out why.
        return this._gridAdapter.FocusedRecordIndex;
    }

    set gridFocusedRecordIndex(value: Integer | undefined) {
        // this.gridAdapter.FocusedRecordIndex = value;
    }

    public getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders {
        return {
            layout: this.gridSaveLayout(),
            headersMap: this._gridAdapter.GetFieldNameToHeaderMap()
        };
    }

    public gridGetRenderedActiveWidth() {
        return this._gridAdapter.GetRenderedActiveWidth(false);
    }

    public setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    public hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    private handleSettingChangedEvent() {
        this.applySettings();
    }

    private applySettings() {
        const revGridSettings = this._settingsNgService.createRevGridSettings();
        this._gridAdapter.ApplySettings(revGridSettings);
        if (this._gridAdapter.getRowCount() > 0) {
            this._gridAdapter.InvalidateAll();
        }
    }

    private createGridAdapter() {
        const revGridSettings = this._settingsNgService.createRevGridSettings();
        return this._grid.CreateAdapter(this, this._frame.dataStore, revGridSettings,
            defaultGridCellRendererName, defaultGridCellRenderPaint);
    }
}

export namespace TradesNgComponent {
    export namespace JsonName {
        export const frame = 'frame';
    }
}


// interface GridLayoutHack extends GridLayout {
//     columns: {
//         Field: { Name: string };
//         Visible: boolean;
//         Width?: number;
//         SortPriority?: number;
//         SortAscending?: boolean;
//     }[];
//     fields: { Name: string }[];
// }

// function isGridLayoutHack(gridLayout: GridLayout): gridLayout is GridLayoutHack {
//     const obj = gridLayout as any;
//     if (obj && obj.fields && obj.columns) {
//         return true;
//     } else {
//         return false;
//     }
// }

// function calcGridHeadersMap(gridLayout: GridLayout): GridFieldNameToHeaderMap {
//     const map = new Map<string, string | undefined>();
//     const columns = gridLayout.GetColumns();
//     for (const column of columns) {
//         map.set(column.Field.Name, column.Field.Name);
//     }
//     return map;
// }
