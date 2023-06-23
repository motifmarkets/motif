/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import {
    ColorScheme,
    ColorSchemeGridField,
    ColorSchemeGridRecordStore,
    GridField,
    GridLayout,
    GridLayoutDefinition,
    Integer,
    PickEnum,
    SettingsService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { SettingsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { AdaptedRevgridBehavioredColumnSettings, RevRecord, RevRecordFieldIndex, RevRecordIndex, StandardHeaderTextCellPainter } from 'revgrid';
import { RenderValueTextCellPainter } from '../../adapted-revgrid/cell-painters/render-value-text-cell-painter';
import { AdaptedRevgrid, AdaptedRevgridBehavioredGridSettings, AdaptedRevgridGridSettings, RecordGrid } from '../../adapted-revgrid/internal-api';
import { RecordGridNgComponent } from '../../adapted-revgrid/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-color-scheme-grid',
    templateUrl: './color-scheme-grid-ng.component.html',
    styleUrls: ['./color-scheme-grid-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemeGridNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit {
    @ViewChild(RecordGridNgComponent, { static: true }) private _gridComponent: RecordGridNgComponent;

    recordFocusEventer: ColorSchemeGridNgComponent.RecordFocusEventer | undefined;
    gridClickEventer: ColorSchemeGridNgComponent.GridClickEventer | undefined;
    columnsViewWithsChangedEventer: ColorSchemeGridNgComponent.ColumnsViewWithsChangedEventer | undefined;

    private readonly _settingsService: SettingsService;
    private readonly _textFormatterService: TextFormatterService;

    private _recordStore: ColorSchemeGridRecordStore;
    private _gridSettings: AdaptedRevgridBehavioredGridSettings;
    private _grid: RecordGrid;
    private _mainCellPainter: RenderValueTextCellPainter;
    private _headerCellPainter: StandardHeaderTextCellPainter<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField>;

    private _filterActive = false;
    private _filterFolderId = ColorScheme.Item.FolderId.Grid;

    constructor(
        settingsNgService: SettingsNgService,
        textFormatterNgService: TextFormatterNgService,
    ) {
        super();
        this._settingsService = settingsNgService.settingsService;
        this._textFormatterService = textFormatterNgService.service;
        this._recordStore = new ColorSchemeGridRecordStore(this._settingsService);
    }

    get focusedRecordIndex() { return this._grid.focusedRecordIndex; }
    get fixedColumnsViewWidth() { return this._grid.fixedColumnsViewWidth; }
    get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }

    public get filterFolderId() { return this._filterFolderId; }
    public set filterFolderId(value: ColorScheme.Item.FolderId) {
        this._filterFolderId = value;
        this.applyFilter();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this._gridComponent.destroyGrid();
        };

        const customGridSettings: Partial<AdaptedRevgridGridSettings> = {
            mouseColumnSelection: false,
            mouseRowSelection: false,
            mouseRectangleSelection: false,
            multipleSelectionAreas: false,
            sortOnDoubleClick: false,
            visibleColumnWidthAdjust: true,
            fixedColumnCount: 1,
            gridRightAligned: false,
        };

        this._gridSettings = AdaptedRevgrid.createGridSettings(this._settingsService, customGridSettings);

        const grid = this._gridComponent.createGrid(
            this._recordStore,
            this._gridSettings,
            () => this.getSettingsForNewColumn(),
            () => this.getMainCellPainter(),
            () => this.getHeaderCellPainter(),
        );
        this._grid = grid;
        grid.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        grid.columnsViewWidthsChangedEventer =
            (fixedChanged, nonFixedChanged, allChanged) => this.handleColumnsViewWidthsChangedEvent(
                fixedChanged, nonFixedChanged, allChanged
            );

        this._mainCellPainter = new RenderValueTextCellPainter(grid, grid.mainDataServer, this._settingsService, this._textFormatterService);
        this._headerCellPainter = new StandardHeaderTextCellPainter(grid, grid.mainDataServer);

        this.dataResetGrid();

        this._recordStore.recordsInserted(0, this._recordStore.recordCount);
        this.applyFilter();
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
        this._recordStore.invalidateAll();
    }

    invalidateRecord(recordIndex: Integer): void {
        this._recordStore.invalidateRecord(recordIndex);
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

    private dataResetGrid() {
        const colorSettings = this._recordStore.colorSettings;
        const fieldNames = ColorSchemeGridNgComponent.fieldNames;
        const fieldCount = fieldNames.length;
        const fields = new Array<ColorSchemeGridField>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            fields[i] = ColorSchemeGridField.createField(fieldNames[i], colorSettings);
        }
        const columns = new Array<GridLayoutDefinition.Column>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            columns[i] = {
                fieldName: fieldNames[i],
            };
        }
        const gridLayoutDefinition = new GridLayoutDefinition(columns);
        const gridLayout = new GridLayout(gridLayoutDefinition);
        this._grid.fieldsLayoutReset(fields, gridLayout);
    }

    private getSettingsForNewColumn() {
        return AdaptedRevgrid.createColumnSettings(this._gridSettings);
    }

    private getMainCellPainter() {
        return this._mainCellPainter;
    }

    private getHeaderCellPainter() {
        return this._headerCellPainter;
    }
}

export namespace ColorSchemeGridNgComponent {
    export type RenderedEvent = (this: void) => void;
    export type RecordFocusEventer = (recordIndex: RevRecordIndex | undefined) => void;
    export type GridClickEventer = (fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type ColumnsViewWithsChangedEventer = (this: void) => void;

    export type FieldName = PickEnum<ColorSchemeGridField.FieldName,
        ColorSchemeGridField.FieldName.Display |
        ColorSchemeGridField.FieldName.ResolvedBkgdColorText |
        ColorSchemeGridField.FieldName.ResolvedBkgdColor |
        ColorSchemeGridField.FieldName.ResolvedForeColorText |
        ColorSchemeGridField.FieldName.ResolvedForeColor |
        ColorSchemeGridField.FieldName.Readability |
        ColorSchemeGridField.FieldName.IsReadable
    >;

    export const fieldNames: FieldName[] = [
        ColorSchemeGridField.FieldName.Display,
        ColorSchemeGridField.FieldName.ResolvedBkgdColorText,
        ColorSchemeGridField.FieldName.ResolvedBkgdColor,
        ColorSchemeGridField.FieldName.ResolvedForeColorText,
        ColorSchemeGridField.FieldName.ResolvedForeColor,
        ColorSchemeGridField.FieldName.Readability,
        ColorSchemeGridField.FieldName.IsReadable
    ];
}
