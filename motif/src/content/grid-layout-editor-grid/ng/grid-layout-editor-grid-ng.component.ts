/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import {
    EnumUiAction,
    GridLayout,
    GridLayoutChange,
    GridLayoutRecordStore,
    Integer,
    StringId,
    Strings,
    UnexpectedCaseError,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { AdaptedRevgrid, RecordGrid } from 'content-internal-api';
import { RevRecordFieldIndex, RevRecordIndex, RevRecordValueRecentChangeTypeId } from 'revgrid';
import { RecordGridNgComponent } from '../../adapted-revgrid/record-grid/ng/record-grid-ng.component';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-grid-layout-editor-grid',
    templateUrl: './grid-layout-editor-grid-ng.component.html',
    styleUrls: ['./grid-layout-editor-grid-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorGridNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit {
    @ViewChild(RecordGridNgComponent, { static: true }) private _gridComponent: RecordGridNgComponent;

    recordFocusEventer: GridLayoutEditorGridNgComponent.RecordFocusEventer;
    gridClickEventer: GridLayoutEditorGridNgComponent.GridClickEventer;

    private _recordStore: GridLayoutRecordStore;
    private _grid: RecordGrid;
    private _gridPrepared = false;
    private _allowedFieldsAndLayoutDefinition: RecordGrid.AllowedFieldsAndLayoutDefinition;

    private _visibleField: GridLayoutRecordStore.VisibleField;

    private _columnFilterId: GridLayoutEditorGridNgComponent.ColumnFilterId = GridLayoutEditorGridNgComponent.ColumnFilterId.ShowAll;

    constructor() {
        super();

        this._recordStore = new GridLayoutRecordStore();
    }

    get gridLayoutDefinition() { return this._recordStore.getLayout(); }
    get focusedRecordIndex() { return this._grid.focusedRecordIndex; }

    public get columnFilterId(): GridLayoutEditorGridNgComponent.ColumnFilterId { return this._columnFilterId; }
    public set columnFilterId(value: GridLayoutEditorGridNgComponent.ColumnFilterId) {
        this._columnFilterId = value;
        this.applyColumnFilter();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this._gridComponent.destroyGrid();
        };

        this._grid = this._gridComponent.createGrid(this._recordStore, GridLayoutEditorGridNgComponent.frameGridProperties);
        this._grid.recordFocusEventer = (recIdx) => this.handleRecordFocusEvent(recIdx);
        this._grid.mainClickEventer = (fieldIdx, recIdx) => this.handleGridClickEvent(fieldIdx, recIdx);

        this.prepareGrid();
    }

    // private initialise() {
    // }

    setAllowedFieldsAndLayoutDefinition(allowedFieldsAndLayoutDefinition: RecordGrid.AllowedFieldsAndLayoutDefinition) {
        this._allowedFieldsAndLayoutDefinition = allowedFieldsAndLayoutDefinition;
        this.prepareGrid();
    }

    handleRecordFocusEvent(recordIndex: RevRecordIndex | undefined) {
        if (this.recordFocusEventer) {
            this.recordFocusEventer(recordIndex);
        }
    }

    handleGridClickEvent(fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex): void {
        if (this.gridClickEventer) {
            this.gridClickEventer(fieldIndex, recordIndex);
        }
    }

    invalidateVisibleValue(rowIndex: Integer): void {
        const fieldIndex = this._grid.getFieldIndex(this._visibleField);
        this._recordStore.invalidateValue(fieldIndex, rowIndex, RevRecordValueRecentChangeTypeId.Update);
    }

    /** @return New focused record index or undefined if no move occurred */
    applyGridLayoutChangeAction(action: GridLayoutChange.Action): number | undefined {

        const moveColumn = (currentIndex: number, newIndex: number): boolean => {
            const result = this._allowedFieldsAndLayoutDefinition.layout.moveColumn(currentIndex, newIndex);
            if (result) {
                this._recordStore.recordsLoaded();
            }
            return result;
        };

        switch (action.id) {
            case GridLayoutChange.ActionId.MoveUp: {
                const newIndex = Math.max(0, action.columnIndex - 1);
                if (!moveColumn(action.columnIndex, newIndex)) {
                    return undefined;
                } else {
                    this._grid.focusedRecordIndex = undefined;
                    this._grid.focusedRecordIndex = newIndex;
                    return newIndex;
                }
            }

            case GridLayoutChange.ActionId.MoveTop: {
                const newIndex = 0;
                if (!moveColumn(action.columnIndex, newIndex)) {
                    return undefined;
                } else {
                    this._grid.focusedRecordIndex = undefined;
                    this._grid.focusedRecordIndex = newIndex;
                    return newIndex;
                }
            }

            case GridLayoutChange.ActionId.MoveDown: {
                const newIndex = Math.min(this._recordStore.recordCount, action.columnIndex + 2);
                if (!moveColumn(action.columnIndex, newIndex)) {
                    return undefined;
                } else {
                    this._grid.focusedRecordIndex = undefined;
                    this._grid.focusedRecordIndex = newIndex - 1;
                    return newIndex - 1;
                }
            }

            case GridLayoutChange.ActionId.MoveBottom: {
                const newIndex = this._recordStore.recordCount;
                if (!moveColumn(action.columnIndex, newIndex)) {
                    return undefined;
                } else {
                    this._grid.focusedRecordIndex = undefined;
                    this._grid.focusedRecordIndex = newIndex - 1;
                    return newIndex - 1;
                }
            }

            case GridLayoutChange.ActionId.SetVisible: {
                throw new UnexpectedCaseError('GLEGNCALCV91006');
            }


            case GridLayoutChange.ActionId.SetWidth: {
                throw new UnexpectedCaseError('GLEGNCALCW91006');
            }

            default:
                throw new UnexpectedCaseError('GLEGNCALCD91006');
        }
    }

    getColumn(columnIndex: number): GridLayout.Column {
        return this._allowedFieldsAndLayoutDefinition.layout.getColumn(columnIndex);
    }

    getColumnHeading(columnIndex: number) {
        const fieldName = this._allowedFieldsAndLayoutDefinition.layout.getColumn(columnIndex).field.name;
        const heading = this._allowedFieldsAndLayoutDefinition.headersMap.get(fieldName);
        if (heading !== undefined) {
            return heading;
        } else {
            return fieldName; // looks like headings are not configured
        }
    }

    focusNextSearchMatch(searchText: string) {
        const focusedRecIdx = this._grid.focusedRecordIndex;

        let prevMatchRowIdx: Integer;
        if (focusedRecIdx === undefined) {
            prevMatchRowIdx = 0;
        } else {
            const focusedRowIdx = this._grid.recordToRowIndex(focusedRecIdx);
            if (focusedRowIdx === undefined) {
                prevMatchRowIdx = 0;
            } else {
                prevMatchRowIdx = focusedRowIdx;
            }
        }
    }

    private applyColumnFilter(): void {
        this._grid.clearFilter();

        const value = this._columnFilterId;
        switch (value) {
            case GridLayoutEditorGridNgComponent.ColumnFilterId.ShowAll:
                this._grid.applyFilter((record) => showAllFilter(record));
                break;

            case GridLayoutEditorGridNgComponent.ColumnFilterId.ShowVisible:
                this._grid.applyFilter((record) => showVisibleFilter(record));
                break;

            case GridLayoutEditorGridNgComponent.ColumnFilterId.ShowHidden:
                this._grid.applyFilter((record) => showHiddenFilter(record));
                break;

            default:
                throw new UnreachableCaseError('ID:8424163216', value);
        }
    }

    private prepareGrid() {
        if (this._grid !== undefined) {
            if (this._gridPrepared) {
                this._grid.reset();
            }

            if (this._allowedFieldsAndLayoutDefinition) {
                this._recordStore.setData(this._allowedFieldsAndLayoutDefinition);

                const positionField = this._recordStore.createPositionField();
                const headingField = this._recordStore.createHeadingField();
                const widthField = this._recordStore.createWidthField();
                this._visibleField = this._recordStore.createVisibleField();

                this._recordStore.addFields([
                    positionField,
                    headingField,
                    this._visibleField,
                    widthField,
                ]);

                this._grid.setFieldState(positionField, GridLayoutRecordStore.IntegerGridFieldState);
                this._grid.setFieldState(headingField, GridLayoutRecordStore.StringGridFieldState);
                this._grid.setFieldState(this._visibleField, GridLayoutRecordStore.StringGridFieldState);
                this._grid.setFieldState(widthField, GridLayoutRecordStore.IntegerGridFieldState);

                this._recordStore.recordsInserted(0, this._recordStore.recordCount);

                this.applyColumnFilter();
            }

            this._gridPrepared = true;
        }
    }
}

export namespace GridLayoutEditorGridNgComponent {
    export type RecordFocusEventer = (recordIndex: Integer | undefined) => void;
    export type GridClickEventer = (fieldIndex: Integer, recordIndex: Integer) => void;

    export const frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

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
    return (record as GridLayout.Column).visible;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function showHiddenFilter(record: object): boolean {
    return !(record as GridLayout.Column).visible;
}
