/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { RevRecord, RevRecordFieldIndex, RevRecordIndex } from 'revgrid';
import { SettingsNgService } from 'src/component-services/ng-api';
import { MotifGrid } from 'src/content/internal-api';
import { MotifGridNgComponent } from 'src/content/ng-api';
import { ColorScheme, ColorSchemeGridRecordStore } from 'src/core/internal-api';
import { Strings } from 'src/res/internal-api';
import { Integer } from 'src/sys/internal-api';

@Component({
    selector: 'app-color-scheme-grid',
    templateUrl: './color-scheme-grid-ng.component.html',
    styleUrls: ['./color-scheme-grid-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemeGridNgComponent implements OnInit, AfterViewInit {
    @ViewChild(MotifGridNgComponent, { static: true }) private _gridComponent: MotifGridNgComponent;

    recordFocusEventer: ColorSchemeGridComponent.RecordFocusEventer;
    gridClickEventer: ColorSchemeGridComponent.GridClickEventer;
    columnsViewWithsChangedEventer: ColorSchemeGridComponent.ColumnsViewWithsChangedEventer;

    private _recordStore: ColorSchemeGridRecordStore;
    private _grid: MotifGrid;
    private _gridPrepared = false;

    private _filterActive = false;
    private _filterFolderId = ColorScheme.Item.FolderId.Grid;

    public get filterFolderId() { return this._filterFolderId; }
    public set filterFolderId(value: ColorScheme.Item.FolderId) {
        this._filterFolderId = value;
        this.applyFilter();
    }

    constructor(settingsNgService: SettingsNgService) {
        this._recordStore = new ColorSchemeGridRecordStore(settingsNgService.settingsService);
        this._recordStore.changedEvent = () => this.handleRecordStoreChangedEvent();
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this._gridComponent.destroyGrid();
        };

        this._grid = this._gridComponent.createGrid(this._recordStore, ColorSchemeGridComponent.frameGridProperties);
        this._grid.recordFocusEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        this._grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        this._grid.columnsViewWidthsChangedEventer =
            (fixedChanged, nonFixedChanged, allChanged) => this.handleColumnsViewWidthsChangedEvent(
                fixedChanged, nonFixedChanged, allChanged
            );

        this.prepareGrid();
    }

    get focusedRecordIndex() { return this._grid.focusedRecordIndex; }
    get fixedColumnsViewWidth() { return this._grid.fixedColumnsViewWidth; }
    get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }

    calculateActiveColumnsWidth() {
        return this._grid.calculateActiveColumnsWidth();
    }

    calculateFixedColumnsWidth() {
        return this._grid.calculateFixedColumnsWidth();
    }

    waitRendered() {
        return this._grid.waitModelRendered();
    }

    handleRecordFocusEvent(recordIndex: RevRecordIndex | undefined) {
        if (this.recordFocusEventer !== undefined) {
            this.recordFocusEventer(recordIndex);
        }
    }

    handleGridClickEvent(fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex): void {
        if (this.gridClickEventer !== undefined) {
            this.gridClickEventer(fieldIndex, recordIndex);
        }
    }

    handleColumnsViewWidthsChangedEvent(fixedChanged: boolean, nonFixedChanged: boolean, allChanged: boolean) {
        if ((fixedChanged || allChanged) && this.columnsViewWithsChangedEventer !== undefined) {
            this.columnsViewWithsChangedEventer();
        }
    }

    invalidateExisting(): void {
        this._grid.invalidateExisting();
    }

    invalidateRecord(recordIndex: Integer): void {
        this._grid.invalidateRecord(recordIndex);
    }

    private handleRecordStoreChangedEvent() {
        this._grid.invalidateExisting();
    }

    private filterItems(record: RevRecord) {
        if (!this._filterActive) {
            return true;
        } else {
            const colorSchemeGridRecord = record as ColorSchemeGridRecordStore.Record;
            const itemId = colorSchemeGridRecord.itemId;
            return ColorScheme.Item.idInFolder(itemId, this._filterFolderId);
        }
    }

    private applyFilter(): void {
        this._grid.clearFilter();

        if (this._filterActive) {
            this._grid.applyFilter((record) => this.filterItems(record));
        }
    }

    private setFieldState(field: ColorSchemeGridRecordStore.Field, fieldStateDefinition: ColorSchemeGridRecordStore.FieldStateDefinition) {
        const state: MotifGrid.FieldState = {
            header: Strings[fieldStateDefinition.HeaderId],
            width: undefined,
            alignment: fieldStateDefinition.Alignment
        };
        this._grid.setFieldState(field, state);
    }

    private prepareGrid() {
        if (this._grid && !this._gridPrepared) {
            const displayField = this._recordStore.createDisplayField();
            const resolvedBkgdColorTextField = this._recordStore.createResolvedBkgdColorTextField();
            const resolvedBkgdColorField = this._recordStore.createResolvedBkgdColorField();
            const resolvedForeColorTextField = this._recordStore.createResolvedForeColorTextField();
            const resolvedForeColorField = this._recordStore.createResolvedForeColorField();
            const readabilityField = this._recordStore.createReadabilityField();
            const isReadableField = this._recordStore.createIsReadableField();

            this._grid.beginFieldChanges();
            try {
                this._grid.addField(displayField);
                // const bkgdItemStateField = this._dataStore.createBkgdItemStateField();
                // this._gridAdapter.AddField(bkgdItemStateField);
                // const itemBkgdColorTextField = this._dataStore.createItemBkgdColorTextField();
                // this._gridAdapter.AddField(itemBkgdColorTextField);
                // const itemBkgdColorField = this._dataStore.createItemBkgdColorField();
                // this._gridAdapter.AddField(itemBkgdColorField);
                this._grid.addField(resolvedBkgdColorTextField);
                this._grid.addField(resolvedBkgdColorField);
                // const foreItemStateField = this._dataStore.createForeItemStateField();
                // this._gridAdapter.AddField(foreItemStateField);
                // const itemForeColorTextField = this._dataStore.createItemForeColorTextField();
                // this._gridAdapter.AddField(itemForeColorTextField);
                // const itemForeColorField = this._dataStore.createItemForeColorField();
                // this._gridAdapter.AddField(itemForeColorField);
                this._grid.addField(resolvedForeColorTextField);
                this._grid.addField(resolvedForeColorField);
                this._grid.addField(readabilityField);
                this._grid.addField(isReadableField);
            } finally {
                this._grid.endFieldChanges();
            }

            this._grid.beginRecordChanges();
            try {
                this.setFieldState(displayField, ColorSchemeGridRecordStore.DisplayField.fieldStateDefinition);
                // this.setFieldState(bkgdItemStateField, ColorSchemeGridDataStore.BkgdItemStateField.fieldStateDefinition);
                // this.setFieldState(itemBkgdColorTextField, ColorSchemeGridDataStore.ItemBkgdColorTextField.fieldStateDefinition);
                // this.setFieldState(itemBkgdColorField, ColorSchemeGridDataStore.ItemBkgdColorField.fieldStateDefinition);
                // this.setFieldState(foreItemStateField, ColorSchemeGridDataStore.ForeItemStateField.fieldStateDefinition);
                // this.setFieldState(itemForeColorTextField, ColorSchemeGridDataStore.ItemForeColorTextField.fieldStateDefinition);
                // this.setFieldState(itemForeColorField, ColorSchemeGridDataStore.ItemForeColorField.fieldStateDefinition);
                this.setFieldState(resolvedBkgdColorTextField, ColorSchemeGridRecordStore.ResolvedBkgdColorTextField.fieldStateDefinition);
                this.setFieldState(resolvedBkgdColorField, ColorSchemeGridRecordStore.ResolvedBkgdColorField.fieldStateDefinition);
                this.setFieldState(resolvedForeColorTextField, ColorSchemeGridRecordStore.ResolvedForeColorTextField.fieldStateDefinition);
                this.setFieldState(resolvedForeColorField, ColorSchemeGridRecordStore.ResolvedForeColorField.fieldStateDefinition);
                this.setFieldState(readabilityField, ColorSchemeGridRecordStore.ReadabilityField.fieldStateDefinition);
                this.setFieldState(isReadableField, ColorSchemeGridRecordStore.IsReadableField.fieldStateDefinition);

                this._grid.recordsInserted(0, this._recordStore.recordCount);
            } finally {
                this._grid.endRecordChanges();
            }
            this._gridPrepared = true;

            this.applyFilter();
        }
    }
}

export namespace ColorSchemeGridComponent {
    export type RenderedEvent = (this: void) => void;
    export type RecordFocusEventer = (recordIndex: RevRecordIndex | undefined) => void;
    export type GridClickEventer = (fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type ColumnsViewWithsChangedEventer = (this: void) => void;

    export const frameGridProperties: MotifGrid.FrameGridProperties = {
        fixedColumnCount: 1,
        gridRightAligned: false,
    };
}
