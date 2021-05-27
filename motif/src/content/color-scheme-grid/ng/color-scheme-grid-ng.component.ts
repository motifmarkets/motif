/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridAdapter, GridFieldState, RevgridComponent, TFieldIndex, TRecordIndex } from '@motifmarkets/revgrid';
import { GridCustomEvent } from 'fin-hypergrid';
import { SettingsNgService } from 'src/component-services/ng-api';
import {
    ColorScheme,
    ColorSchemeGridDataStore,
    defaultGridCellRendererName,
    defaultGridCellRenderPaint,
    SettingsService
} from 'src/core/internal-api';
import { Strings } from 'src/res/internal-api';
import { Integer, MultiEvent } from 'src/sys/internal-api';

@Component({
    selector: 'app-color-scheme-grid',
    templateUrl: './color-scheme-grid-ng.component.html',
    styleUrls: ['./color-scheme-grid-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemeGridNgComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('grid', { static: true }) private _gridComponent: RevgridComponent;

    renderedEvent: ColorSchemeGridComponent.RenderedEvent;
    recordFocusEvent: ColorSchemeGridComponent.RecordFocusEvent;
    recordFocusClickEvent: ColorSchemeGridComponent.RecordFocusClickEvent;

    private _settingsService: SettingsService;

    private _dataStore: ColorSchemeGridDataStore;
    private _gridAdapter: GridAdapter;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _gridPrepared = false;

    private _filterActive = false;
    private _filterFolderId = ColorScheme.Item.FolderId.Grid;

    public get filterFolderId() { return this._filterFolderId; }
    public set filterFolderId(value: ColorScheme.Item.FolderId) {
        this._filterFolderId = value;
        this.applyFilter();
    }

    constructor(settingsNgService: SettingsNgService) {
        this._settingsService = settingsNgService.settingsService;
        this._dataStore = new ColorSchemeGridDataStore(this._settingsService);
        this._dataStore.changedEvent = () => this.handleDataStoreChangedEvent();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        }
    }

    ngAfterViewInit() {
        const revGridSettings = this._settingsService.createRevGridSettings();
        this._gridAdapter = this._gridComponent.CreateAdapter(this, this._dataStore, revGridSettings,
            defaultGridCellRendererName, defaultGridCellRenderPaint);

        this._settingsChangedSubscriptionId =
        this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        this.applySettings();

        this.prepareGrid();
    }

    get focusedRecordIndex() { return this._gridAdapter.FocusedRecordIndex; }

    getActiveWidth() { return this._gridAdapter.GetActiveWidth(false); }

    onGridRendered(event: GridCustomEvent) {
        if (this.renderedEvent !== undefined) {
            this.renderedEvent();
        }
    }

    onRecordFocus(recordIndex: TRecordIndex) {
        if (this.recordFocusEvent !== undefined) {
            this.recordFocusEvent(recordIndex);
        }
    }

    OnRecordFocusClick(recordIndex: TRecordIndex, fieldIndex: TFieldIndex): void {
        if (this.recordFocusClickEvent !== undefined) {
            this.recordFocusClickEvent(recordIndex, fieldIndex);
        }
    }

    invalidateAll(): void {
        this._gridAdapter.InvalidateAll();
    }

    invalidateRecord(recordIndex: Integer): void {
        this._gridAdapter.InvalidateRecord(recordIndex);
    }

    private handleDataStoreChangedEvent() {
        this._gridAdapter.InvalidateAll();
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private filterItems(record: object) {
        if (!this._filterActive) {
            return true;
        } else {
            const dataStoreRecord = record as ColorSchemeGridDataStore.Record;
            const itemId = dataStoreRecord.itemId;
            return ColorScheme.Item.idInFolder(itemId, this._filterFolderId);
        }
    }

    private applyFilter(): void {
        this._gridAdapter.clearFilter();

        if (this._filterActive) {
            this._gridAdapter.ApplyFilter((record) => this.filterItems(record));
        }
    }

    private handleSettingsChangedEvent() {
        this.applySettings();
    }

    private applySettings() {
        const revGridSettings = this._settingsService.createRevGridSettings();
        this._gridAdapter.ApplySettings(revGridSettings);
        if (this._gridAdapter.getRowCount() > 0) {
            this._gridAdapter.InvalidateAll();
        }
    }

    private setFieldState(field: ColorSchemeGridDataStore.Field, fieldStateDefinition: ColorSchemeGridDataStore.FieldStateDefinition) {
        const state: GridFieldState = {
            Header: Strings[fieldStateDefinition.HeaderId],
            Width: undefined,
            Alignment: fieldStateDefinition.Alignment
        };
        this._gridAdapter.SetFieldState(field, state);
    }

    private prepareGrid() {
        if (this._gridAdapter && !this._gridPrepared) {
            this._gridAdapter.BeginChange();
            try {
                this._gridAdapter.Reset();
                const displayField = this._dataStore.createDisplayField();
                this._gridAdapter.AddField(displayField);
                // const bkgdItemStateField = this._dataStore.createBkgdItemStateField();
                // this._gridAdapter.AddField(bkgdItemStateField);
                // const itemBkgdColorTextField = this._dataStore.createItemBkgdColorTextField();
                // this._gridAdapter.AddField(itemBkgdColorTextField);
                // const itemBkgdColorField = this._dataStore.createItemBkgdColorField();
                // this._gridAdapter.AddField(itemBkgdColorField);
                const resolvedBkgdColorTextField = this._dataStore.createResolvedBkgdColorTextField();
                this._gridAdapter.AddField(resolvedBkgdColorTextField);
                const resolvedBkgdColorField = this._dataStore.createResolvedBkgdColorField();
                this._gridAdapter.AddField(resolvedBkgdColorField);
                // const foreItemStateField = this._dataStore.createForeItemStateField();
                // this._gridAdapter.AddField(foreItemStateField);
                // const itemForeColorTextField = this._dataStore.createItemForeColorTextField();
                // this._gridAdapter.AddField(itemForeColorTextField);
                // const itemForeColorField = this._dataStore.createItemForeColorField();
                // this._gridAdapter.AddField(itemForeColorField);
                const resolvedForeColorTextField = this._dataStore.createResolvedForeColorTextField();
                this._gridAdapter.AddField(resolvedForeColorTextField);
                const resolvedForeColorField = this._dataStore.createResolvedForeColorField();
                this._gridAdapter.AddField(resolvedForeColorField);
                const readabilityField = this._dataStore.createReadabilityField();
                this._gridAdapter.AddField(readabilityField);
                const isReadableField = this._dataStore.createIsReadableField();
                this._gridAdapter.AddField(isReadableField);

                this.setFieldState(displayField, ColorSchemeGridDataStore.DisplayField.fieldStateDefinition);
                // this.setFieldState(bkgdItemStateField, ColorSchemeGridDataStore.BkgdItemStateField.fieldStateDefinition);
                // this.setFieldState(itemBkgdColorTextField, ColorSchemeGridDataStore.ItemBkgdColorTextField.fieldStateDefinition);
                // this.setFieldState(itemBkgdColorField, ColorSchemeGridDataStore.ItemBkgdColorField.fieldStateDefinition);
                // this.setFieldState(foreItemStateField, ColorSchemeGridDataStore.ForeItemStateField.fieldStateDefinition);
                // this.setFieldState(itemForeColorTextField, ColorSchemeGridDataStore.ItemForeColorTextField.fieldStateDefinition);
                // this.setFieldState(itemForeColorField, ColorSchemeGridDataStore.ItemForeColorField.fieldStateDefinition);
                this.setFieldState(resolvedBkgdColorTextField, ColorSchemeGridDataStore.ResolvedBkgdColorTextField.fieldStateDefinition);
                this.setFieldState(resolvedBkgdColorField, ColorSchemeGridDataStore.ResolvedBkgdColorField.fieldStateDefinition);
                this.setFieldState(resolvedForeColorTextField, ColorSchemeGridDataStore.ResolvedForeColorTextField.fieldStateDefinition);
                this.setFieldState(resolvedForeColorField, ColorSchemeGridDataStore.ResolvedForeColorField.fieldStateDefinition);
                this.setFieldState(readabilityField, ColorSchemeGridDataStore.ReadabilityField.fieldStateDefinition);
                this.setFieldState(isReadableField, ColorSchemeGridDataStore.IsReadableField.fieldStateDefinition);

                this._gridAdapter.InsertRecords(0, this._dataStore.RecordCount);

                this._gridAdapter.InvalidateAll();
            } finally {
                this._gridAdapter.EndChange();
            }
            this._gridPrepared = true;

            this.applyFilter();
        }
    }
}

export namespace ColorSchemeGridComponent {
    export type RenderedEvent = (this: void) => void;
    export type RecordFocusEvent = (recordIndex: Integer) => void;
    export type RecordFocusClickEvent = (recordIndex: Integer, fieldIndex: Integer) => void;
}
