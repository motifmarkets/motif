/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import {
    GridAdapter, GridDataStore, GridField, GridFieldState, GridHost, GridLayout,
    RevgridComponent, TFieldIndex, TRecordFilter, TRecordIndex
} from '@motifmarkets/revgrid';
import { GridCustomEvent } from 'fin-hypergrid';
import { BidAskSideId } from 'src/adi/internal-api';
import { SettingsNgService } from 'src/component-services/ng-api';
import {
    defaultGridCellRendererName,
    defaultGridCellRenderPaint,
    DepthSideGridField,
    GridLayoutDataStore,
    SettingsService
} from 'src/core/internal-api';
import { Integer, MultiEvent } from 'src/sys/internal-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { DepthSideFrame } from '../depth-side-frame';

@Component({
    selector: 'app-depth-side',
    templateUrl: './depth-side-ng.component.html',
    styleUrls: ['./depth-side-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthSideNgComponent implements OnDestroy, GridHost, DepthSideFrame.ComponentAccess {
    @ViewChild(RevgridComponent, { static: true }) private _grid: RevgridComponent;

    private _settingsService: SettingsService;
    private _frame: DepthSideFrame;
    private _gridAdapter: GridAdapter;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _contentService: ContentNgService,
        settingsNgService: SettingsNgService,
    ) {
        this._settingsService = settingsNgService.settingsService;
        this._frame = this._contentService.createDepthSideFrame(this);
    }

    ngOnDestroy() {
        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        }

        this.frame.finalise();
    }

    get frame(): DepthSideFrame { return this._frame; }

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

    onGridRendered(event: GridCustomEvent) {
        this._frame.adviseGridRendered();
    }

    // Component Access members

    get id(): string {
        return '';
        // todo - needs to return a unique id for this component
    }

    gridCreateAdaptor(dataStore: GridDataStore, sideId: BidAskSideId) {
        if (this._gridAdapter !== undefined) {
            this._gridAdapter.finalise();
        }
        const revGridSettings = this._settingsService.createRevGridSettings(sideId === BidAskSideId.Bid);
        this._gridAdapter = this._grid.CreateAdapter(this, dataStore, revGridSettings,
            defaultGridCellRendererName, defaultGridCellRenderPaint);
        if (this._settingsChangedSubscriptionId === undefined) {
            this._settingsChangedSubscriptionId =
                this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingChangedEvent());
        }
    }

    gridInsertRecord(index: Integer) {
        this._gridAdapter.InsertRecord(index);
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

    gridMoveFieldColumn(field: Integer | GridField, columnIndex: Integer) {
        this._gridAdapter.MoveFieldColumn(field, columnIndex);
    }

    gridDeleteRecord(recordIndex: Integer) {
        this._gridAdapter.DeleteRecord(recordIndex);
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

    gridAddFields(fields: DepthSideGridField[]) {
        this._gridAdapter.AddFields(fields);
    }

    gridSetFieldState(field: GridField, state?: GridFieldState | undefined) {
        this._gridAdapter.SetFieldState(field, state);
    }

    gridSetFieldVisible(field: GridField, visible: boolean) {
        this._gridAdapter.SetFieldVisible(field, visible);
    }

    get gridFocusedRecordIndex(): Integer | undefined {
        // TODO:MED this.gridAdapter.FocusedRecordIndex always returns null. Find out why.
        return this._gridAdapter.FocusedRecordIndex;
    }

    set gridFocusedRecordIndex(value: Integer | undefined) {
        // this.gridAdapter.FocusedRecordIndex = value;
    }

    getGridLayoutWithHeadings(): GridLayoutDataStore.GridLayoutWithHeaders {
        return {
            layout: this.gridSaveLayout(),
            headersMap: this._gridAdapter.GetFieldNameToHeaderMap()
        };
    }

    get gridClickToSort() {
        return this._gridAdapter.ClickToSort;
    }

    set gridClickToSort(value: boolean) {
        this._gridAdapter.ClickToSort = value;
    }

    gridApplyFilter(filterFtn: TRecordFilter) {
        this._gridAdapter.ApplyFilter(filterFtn);
    }

    gridClearFilter() {
        this._gridAdapter.clearFilter();
    }

    get gridContinuousFiltering() {
        return this._gridAdapter.ContinuousFiltering;
    }

    set gridContinuousFiltering(value: boolean) {
        this._gridAdapter.ContinuousFiltering = value;
    }

    gridGetRenderedActiveWidth() {
        return this._gridAdapter.GetRenderedActiveWidth(true);
    }

    gridGetScrollbaredActiveWidth() {
        return this._gridAdapter.GetActiveWidth(true);
    }

    private handleSettingChangedEvent() {
        this.applySettings();
    }

    private applySettings() {
        const revGridSettings = this._settingsService.createRevGridSettings();
        this._gridAdapter.ApplySettings(revGridSettings);
        if (this._gridAdapter.getRowCount() > 0) {
            this._gridAdapter.InvalidateAll();
        }
    }
}
