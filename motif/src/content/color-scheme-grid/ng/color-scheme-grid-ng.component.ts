/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { RevRecord, RevRecordFieldIndex, RevRecordIndex } from 'revgrid';
import { SettingsNgService } from 'src/component-services/ng-api';
import { MotifGrid } from 'src/content/internal-api';
import { ColorScheme, ColorSchemeGridRecordStore } from 'src/core/internal-api';
import { Strings } from 'src/res/internal-api';
import { Integer } from 'src/sys/internal-api';
import { MotifGridNgComponent } from '../../motif-grid/ng/motif-grid-ng.component';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-color-scheme-grid',
    templateUrl: './color-scheme-grid-ng.component.html',
    styleUrls: ['./color-scheme-grid-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemeGridNgComponent extends ContentComponentBaseNgDirective implements OnInit, AfterViewInit {
    @ViewChild(MotifGridNgComponent, { static: true }) private _gridComponent: MotifGridNgComponent;

    recordFocusEventer: ColorSchemeGridComponent.RecordFocusEventer;
    gridClickEventer: ColorSchemeGridComponent.GridClickEventer;
    columnsViewWithsChangedEventer: ColorSchemeGridComponent.ColumnsViewWithsChangedEventer;

    private _recordStore: ColorSchemeGridRecordStore;
    private _grid: MotifGrid;
    private _gridPrepared = false;

    private _filterActive = false;
    private _filterFolderId = ColorScheme.Item.FolderId.Grid;

    constructor(settingsNgService: SettingsNgService) {
        super();
        this._recordStore = new ColorSchemeGridRecordStore(settingsNgService.settingsService);
    }

    get focusedRecordIndex() { return this._grid.focusedRecordIndex; }
    get fixedColumnsViewWidth() { return this._grid.fixedColumnsViewWidth; }
    get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }

    public get filterFolderId() { return this._filterFolderId; }
    public set filterFolderId(value: ColorScheme.Item.FolderId) {
        this._filterFolderId = value;
        this.applyFilter();
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

    invalidateAll(): void {
        this._recordStore.recordsEventers.invalidateAll();
    }

    invalidateRecord(recordIndex: Integer): void {
        this._recordStore.recordsEventers.invalidateRecord(recordIndex);
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

            this._recordStore.fieldsEventers.addFields([
                displayField,
                resolvedBkgdColorTextField,
                resolvedBkgdColorField,
                resolvedForeColorTextField,
                resolvedForeColorField,
                readabilityField,
                isReadableField,
            ]);

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

            this._recordStore.recordsEventers.recordsInserted(0, this._recordStore.recordCount);

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
