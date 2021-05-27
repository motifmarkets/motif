/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { GridAdapter, GridHost, GridLayout, RevgridComponent, TFieldIndex, TRecordIndex } from '@motifmarkets/revgrid';
import { SettingsNgService } from 'src/component-services/ng-api';
import {
    defaultGridCellRendererName,
    defaultGridCellRenderPaint,
    EnumUiAction,
    GridLayoutChange,
    GridLayoutDataStore,
    SettingsService
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from 'src/sys/internal-api';

@Component({
    selector: 'app-grid-layout-editor-grid',
    templateUrl: './grid-layout-editor-grid-ng.component.html',
    styleUrls: ['./grid-layout-editor-grid-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorGridNgComponent implements OnDestroy, AfterViewInit, GridHost {
    @ViewChild(RevgridComponent, { static: true }) private _gridComponent: RevgridComponent;

    recordFocusEvent: GridLayoutEditorGridNgComponent.RecordFocusEvent;
    recordFocusClickEvent: GridLayoutEditorGridNgComponent.RecordFocusClickEvent;

    private _settingsService: SettingsService;
    private _dataStore: GridLayoutDataStore;
    private _gridAdapter: GridAdapter;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _layoutWithHeadings: GridLayoutDataStore.GridLayoutWithHeaders;

    private _columnFilterId: GridLayoutEditorGridNgComponent.ColumnFilterId = GridLayoutEditorGridNgComponent.ColumnFilterId.ShowAll;

    get gridLayout() { return this._dataStore.getLayout(); }
    get focusedRecordIndex() { return this._gridAdapter.FocusedRecordIndex; }

    public get columnFilterId(): GridLayoutEditorGridNgComponent.ColumnFilterId { return this._columnFilterId; }
    public set columnFilterId(value: GridLayoutEditorGridNgComponent.ColumnFilterId) {
        this._columnFilterId = value;
        this.applyColumnFilter();
    }

    constructor(settingsNgService: SettingsNgService) {
        this._settingsService = settingsNgService.settingsService;
        this._dataStore = new GridLayoutDataStore();
    }

    ngOnDestroy() {
        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        }
    }

    ngAfterViewInit() {
        // delay1Tick(() => this.initialise());
        const revGridSettings = this._settingsService.createRevGridSettings();
        this._gridAdapter = this._gridComponent.CreateAdapter(this, this._dataStore, revGridSettings,
            defaultGridCellRendererName, defaultGridCellRenderPaint);

        this._settingsChangedSubscriptionId =
        this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        this.applySettings();
        this.prepareGrid();
    }

    // private initialise() {
    // }

    setLayoutWithHeadings(layoutWithHeadings: GridLayoutDataStore.GridLayoutWithHeaders) {
        this._layoutWithHeadings = layoutWithHeadings;
        this.prepareGrid();
    }

    onRecordFocus(recordIndex: TRecordIndex) {
        if (this.recordFocusEvent) {
            this.recordFocusEvent(recordIndex);
        }
    }

    OnRecordFocusClick(recordIndex: TRecordIndex, fieldIndex: TFieldIndex): void {
        if (this.recordFocusClickEvent) {
            this.recordFocusClickEvent(recordIndex, fieldIndex);
        }
    }

    invalidateAll(): void {
        this._gridAdapter.InvalidateAll();
    }

    invalidateRecord(rowIndex: Integer): void {
        this._gridAdapter.InvalidateRecord(rowIndex);
    }

    applyLayoutChange(action: GridLayoutChange.Action): { focusedIndex?: number | null } {

        const moveColumn = (currentIndex: number, newIndex: number): void => {
            this._layoutWithHeadings.layout.MoveColumn(currentIndex, newIndex);
            this._gridAdapter.InvalidateAll();
        };

        switch (action.id) {
            case GridLayoutChange.ActionId.MoveUp: {
                const newIndex = Math.max(0, action.columnIndex - 1);
                moveColumn(action.columnIndex, newIndex);
                this._gridAdapter.FocusedRecordIndex = undefined;
                this._gridAdapter.FocusedRecordIndex = newIndex;
                return { focusedIndex: newIndex };
            }

            case GridLayoutChange.ActionId.MoveTop: {
                const newIndex = 0;
                moveColumn(action.columnIndex, newIndex);
                this._gridAdapter.FocusedRecordIndex = undefined;
                this._gridAdapter.FocusedRecordIndex = newIndex;
                return { focusedIndex: newIndex };
            }

            case GridLayoutChange.ActionId.MoveDown: {
                const newIndex = Math.min(this._dataStore.RecordCount, action.columnIndex + 2);
                moveColumn(action.columnIndex, newIndex);
                this._gridAdapter.FocusedRecordIndex = undefined;
                this._gridAdapter.FocusedRecordIndex = newIndex - 1;
                return { focusedIndex: newIndex - 1 };
            }

            case GridLayoutChange.ActionId.MoveBottom: {
                const newIndex = this._dataStore.RecordCount;
                moveColumn(action.columnIndex, newIndex);
                this._gridAdapter.FocusedRecordIndex = undefined;
                this._gridAdapter.FocusedRecordIndex = newIndex - 1;
                return { focusedIndex: newIndex - 1 };
            }

            case GridLayoutChange.ActionId.SetVisible: {
                throw new Error('Condition not handled [ID:14923165702]');
            }


            case GridLayoutChange.ActionId.SetWidth: {
                throw new Error('Condition not handled [ID:14923165702]');
            }

            default:
                throw new Error('Condition not handled [ID:15723165637]');
        }
    }

    getColumn(columnIndex: number): GridLayout.Column {
        return this._layoutWithHeadings.layout.GetColumn(columnIndex);
    }

    getColumnHeading(columnIndex: number) {
        const fieldName = this._layoutWithHeadings.layout.GetColumn(columnIndex).Field.Name;
        const heading = this._layoutWithHeadings.headersMap.get(fieldName);
        if (heading !== undefined) {
            return heading;
        } else {
            return fieldName; // looks like headings are not configured
        }
    }

    focusNextSearchMatch(searchText: string) {
        const focusedRecIdx = this._gridAdapter.FocusedRecordIndex;

        let prevMatchRowIdx: Integer;
        if (focusedRecIdx === undefined) {
            prevMatchRowIdx = 0;
        } else {
            const focusedRowIdx = this._gridAdapter.RecordToRowIndex(focusedRecIdx);
            if (focusedRowIdx === undefined) {
                prevMatchRowIdx = 0;
            } else {
                prevMatchRowIdx = focusedRowIdx;
            }
        }
    }

    private applyColumnFilter(): void {
        this._gridAdapter.clearFilter();

        const value = this._columnFilterId;
        switch (value) {
            case GridLayoutEditorGridNgComponent.ColumnFilterId.ShowAll:
                this._gridAdapter.ApplyFilter((record) => showAllFilter(record));
                break;

            case GridLayoutEditorGridNgComponent.ColumnFilterId.ShowVisible:
                this._gridAdapter.ApplyFilter((record) => showVisibleFilter(record));
                break;

            case GridLayoutEditorGridNgComponent.ColumnFilterId.ShowHidden:
                this._gridAdapter.ApplyFilter((record) => showHiddenFilter(record));
                break;

            default:
                throw new UnreachableCaseError('ID:8424163216', value);
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

    private prepareGrid() {
        if (this._gridAdapter && this._layoutWithHeadings) {
            this._dataStore.setData(this._layoutWithHeadings);
            this._gridAdapter.BeginChange();
            try {
                this._gridAdapter.Reset();
                const positionField = this._dataStore.createPositionField();
                this._gridAdapter.AddField(positionField);
                // this._gridAdapter.AddField(this._dataStore.createNameField());
                const headingField = this._dataStore.createHeadingField();
                this._gridAdapter.AddField(headingField);
                const visibleField = this._dataStore.createVisibleField();
                this._gridAdapter.AddField(visibleField);
                const widthField = this._dataStore.createWidthField();
                this._gridAdapter.AddField(widthField);
                // this._gridAdapter.AddField(this._dataStore.createSortPriorityField(), GridLayoutDataStore.IntegerGridFieldState);
                // this._gridAdapter.AddField(this._dataStore.createSortAscendingField());

                this._gridAdapter.SetFieldState(positionField, GridLayoutDataStore.IntegerGridFieldState);
                this._gridAdapter.SetFieldState(headingField, GridLayoutDataStore.StringGridFieldState);
                this._gridAdapter.SetFieldState(visibleField, GridLayoutDataStore.StringGridFieldState);
                this._gridAdapter.SetFieldState(widthField, GridLayoutDataStore.IntegerGridFieldState);

                this._gridAdapter.InsertRecords(0, this._dataStore.RecordCount);

                this._gridAdapter.InvalidateAll();
            } finally {
                this._gridAdapter.EndChange();
            }

            this.applyColumnFilter();
        }
    }
}

export namespace GridLayoutEditorGridNgComponent {
    export type RecordFocusEvent = (recordIndex: Integer) => void;
    export type RecordFocusClickEvent = (recordIndex: Integer, fieldIndex: Integer) => void;

    export const enum ColumnFilterId {
        ShowAll = 1,
        ShowVisible = 2,
        ShowHidden = 3,
    }

    export namespace ColumnFilter {
        export function getEnumUiActionElementProperties(id: ColumnFilterId): EnumUiAction.ElementProperties {
            switch (id) {
                case ColumnFilterId.ShowAll:
                    return {
                        element: ColumnFilterId.ShowAll,
                        caption: Strings[StringId.GridLayoutEditorShowAllRadioCaption],
                        title: Strings[StringId.GridLayoutEditorShowAllRadioTitle],
                    };
                case ColumnFilterId.ShowVisible:
                    return {
                        element: ColumnFilterId.ShowVisible,
                        caption: Strings[StringId.GridLayoutEditorShowVisibleRadioCaption],
                        title: Strings[StringId.GridLayoutEditorShowVisibleRadioTitle],
                    };
                case ColumnFilterId.ShowHidden:
                    return {
                        element: ColumnFilterId.ShowHidden,
                        caption: Strings[StringId.GridLayoutEditorShowHiddenRadioCaption],
                        title: Strings[StringId.GridLayoutEditorShowHiddenRadioTitle],
                    };
                default:
                    throw new UnreachableCaseError('GLEGCCFGEUAEP0098233', id);
            }
        }
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function showAllFilter(record: object): boolean {
    return true;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function showVisibleFilter(record: object): boolean {
    return (record as GridLayout.Column).Visible;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function showHiddenFilter(record: object): boolean {
    return !(record as GridLayout.Column).Visible;
}
