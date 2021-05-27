/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    GridAdapter,
    GridField,
    GridFieldState,
    GridHost,
    GridLayout,
    GridTransform,
    RevgridComponent,
    TFieldIndex,
    TRecordIndex
} from '@motifmarkets/revgrid';
import { SettingsNgService } from 'src/component-services/ng-api';
import {
    defaultGridCellRendererName,
    defaultGridCellRenderPaint,
    GridLayoutDataStore,
    SettingsService,
    TableGridField
} from 'src/core/internal-api';
import { Badness, Integer, MultiEvent } from 'src/sys/internal-api';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { TableFrame } from '../table-frame';

@Component({
    selector: 'app-table',
    templateUrl: './table-ng.component.html',
    styleUrls: ['./table-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableNgComponent implements OnInit, OnDestroy, AfterViewInit, GridHost, TableFrame.ComponentAccess {

    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;
    @ViewChild(RevgridComponent, { static: true }) private _grid: RevgridComponent;

    public gridVisible = false;

    private _settingsService: SettingsService;
    private _frame: TableFrame;
    private _gridAdapter: GridAdapter;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        contentService: ContentNgService,
    ) {
        this._settingsService = settingsNgService.settingsService;
        this._frame = contentService.createTableFrame(this);
        this._frame.tableOpenChangeEvent = (opened) => this.handleTableOpenChangeEvent(opened);
    }

    ngOnDestroy() {
        this.frame.finalise();

        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        }
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this._gridAdapter = this.createGridAdapter();

        this._settingsChangedSubscriptionId =
        this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingChangedEvent());

        this.applySettings();
    }

    get frame(): TableFrame { return this._frame; }
    get gridDefaultRowHeight() { return this._gridAdapter.getDefaultRowHeight(); }
    get gridHorizontalScrollbarWidthAndMargin() { return this._gridAdapter.horizontalScrollbarWidthAndMargin; }

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

    gridAddFields(fields: TableGridField[]) {
        this._gridAdapter.AddFields(fields);
    }

    gridSetFieldState(field: GridField, state?: GridFieldState | undefined) {
        this._gridAdapter.SetFieldState(field, state);
    }

    get gridFocusedRecordIndex(): Integer | undefined {
        // TODO:MED this.gridAdapter.FocusedRecordIndex always returns null. Find out why.
        return this._gridAdapter.FocusedRecordIndex;
    }

    set gridFocusedRecordIndex(value: Integer | undefined) {
        this._gridAdapter.FocusedRecordIndex = value;
        this._gridAdapter.InvalidateAll();
    }

    getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders {
        return {
            layout: this.gridSaveLayout(),
            headersMap: this._gridAdapter.GetFieldNameToHeaderMap()
        };
    }

    setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }

    private handleSettingChangedEvent() {
        this.applySettings();
    }

    private handleTableOpenChangeEvent(opened: boolean) {
        this.setGridVisible(opened);
    }

    private setGridVisible(value: boolean) {
        this.gridVisible = value;
        this._cdr.markForCheck();
    }

    private applySettings() {
        const revGridSettings = this._settingsService.createRevGridSettings();
        this._frame.clearTableRendering();
        this._gridAdapter.ApplySettings(revGridSettings);
        if (this._gridAdapter.getRowCount() > 0) {
            this._gridAdapter.InvalidateAll();
        }
    }

    private createGridAdapter() {
        const revGridSettings = this._settingsService.createRevGridSettings();
        return this._grid.CreateAdapter(this, this._frame, revGridSettings,
            defaultGridCellRendererName, defaultGridCellRenderPaint);
    }
}

export namespace TableNgComponent {
    export namespace JsonName {
        export const frame = 'frame';
    }
}
