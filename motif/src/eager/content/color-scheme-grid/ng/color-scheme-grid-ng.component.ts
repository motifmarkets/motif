/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy } from '@angular/core';
import {
    AdaptedRevgrid,
    CellPainterFactoryService,
    ColorScheme,
    ColorSchemeGridField,
    ColorSchemeGridRecordStore,
    Integer,
    RecordGrid,
    RenderValueRecordGridCellPainter,
    SettingsService,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { RevGridLayout, RevRecord, RevRecordFieldIndex, RevRecordIndex } from '@xilytix/rev-data-source';
import { CellPainterFactoryNgService, SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-color-scheme-grid',
    templateUrl: './color-scheme-grid-ng.component.html',
    styleUrls: ['./color-scheme-grid-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemeGridNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    recordFocusEventer: ColorSchemeGridNgComponent.RecordFocusEventer | undefined;
    gridClickEventer: ColorSchemeGridNgComponent.GridClickEventer | undefined;
    columnsViewWithsChangedEventer: ColorSchemeGridNgComponent.ColumnsViewWithsChangedEventer | undefined;

    private readonly _settingsService: SettingsService;
    private readonly _cellPainterFactoryService: CellPainterFactoryService;

    private _recordStore: ColorSchemeGridRecordStore;
    private _grid: RecordGrid;
    private _mainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;
    private _headerCellPainter: TextHeaderCellPainter;

    private _filterActive = false;
    private _filterFolderId = ColorScheme.Item.FolderId.Grid;

    constructor(
        elRef: ElementRef<HTMLElement>,
        settingsNgService: SettingsNgService,
        cellPainterFactoryNgService: CellPainterFactoryNgService,
    ) {
        super(elRef, ++ColorSchemeGridNgComponent.typeInstanceCreateCount);
        this._settingsService = settingsNgService.service;
        this._cellPainterFactoryService = cellPainterFactoryNgService.service;
        this._recordStore = new ColorSchemeGridRecordStore(this._settingsService);
        this._grid = this.createGrid(this.rootHtmlElement,);

        const grid = this._grid;
        this._mainCellPainter = this._cellPainterFactoryService.createTextRenderValueRecordGrid(this._grid, grid.mainDataServer);
        this._headerCellPainter = this._cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);

        grid.activate();

        this.initialiseGrid();

        this._recordStore.recordsInserted(0, this._recordStore.recordCount);

        const gridLayoutDefinition = ColorSchemeGridField.createDefaultGridLayoutDefinition();
        const gridLayout = new RevGridLayout(gridLayoutDefinition);
        grid.applyFirstUsable(undefined, undefined, gridLayout);

        this.applyFilter();
    }

    get focusedRecordIndex() { return this._grid.focusedRecordIndex; }
    get fixedColumnsViewWidth() { return this._grid.fixedColumnsViewWidth; }
    get activeColumnsViewWidth() { return this._grid.activeColumnsViewWidth; }
    get emWidth() { return this._grid.emWidth; }

    public get filterFolderId() { return this._filterFolderId; }
    public set filterFolderId(value: ColorScheme.Item.FolderId) {
        this._filterFolderId = value;
        this.applyFilter();
    }

    ngOnDestroy() {
        this._grid.destroy();
    }

    calculateActiveColumnsWidth() {
        return this._grid.calculateActiveColumnsWidth();
    }

    calculateFixedColumnsWidth() {
        return this._grid.columnsManager.calculateFixedColumnsWidth();
    }

    waitLastServerNotificationRendered() {
        return this._grid.renderer.waitLastServerNotificationRendered();
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

    private createGrid(gridHostElement: HTMLElement) {
        const customGridSettings: AdaptedRevgrid.CustomGridSettings = {
            mouseColumnSelectionEnabled: false,
            mouseRowSelectionEnabled: false,
            mouseAddToggleExtendSelectionAreaEnabled: false,
            multipleSelectionAreas: false,
            sortOnDoubleClick: false,
            visibleColumnWidthAdjust: true,
            fixedColumnCount: 1,
            gridRightAligned: false,
        };

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


        grid.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        grid.mainClickEventer = (fieldIndex, recordIndex) => this.handleGridClickEvent(fieldIndex, recordIndex);
        grid.columnsViewWidthsChangedEventer =
            (fixedChanged, nonFixedChanged, allChanged) => this.handleColumnsViewWidthsChangedEvent(
                fixedChanged, nonFixedChanged, allChanged
            );

        return grid;
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

    private initialiseGrid() {
        const colorSettings = this._recordStore.colorSettings;
        const fieldNames = ColorSchemeGridField.allFieldNames;
        const fieldCount = fieldNames.length;
        const fields = new Array<ColorSchemeGridField>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            fields[i] = ColorSchemeGridField.createField(fieldNames[i], colorSettings);
        }
        this._grid.initialiseAllowedFields(fields);
    }

    private customiseSettingsForNewColumn() {
        // no customisation required
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
}
