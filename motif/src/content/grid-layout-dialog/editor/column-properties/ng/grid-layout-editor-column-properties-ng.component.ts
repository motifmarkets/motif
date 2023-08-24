/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    BooleanUiAction,
    EnumUiAction,
    GridLayout,
    GridLayoutChange,
    GridLayoutRecordStore,
    Integer,
    RecordGrid,
    StringId,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { RevRecordFieldIndex, RevRecordIndex } from 'revgrid';
import { RecordGridNgComponent } from '../../../../adapted-revgrid/record-grid/ng/record-grid-ng.component';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-grid-layout-editor-column-properties',
    templateUrl: './grid-layout-editor-column-properties-ng.component.html',
    styleUrls: ['./grid-layout-editor-column-properties-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorColumnPropertiesNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild(RecordGridNgComponent, { static: true }) private _gridComponent: RecordGridNgComponent;

    recordFocusEventer: GridLayoutEditorColumnPropertiesNgComponent.RecordFocusEventer | undefined;
    gridClickEventer: GridLayoutEditorColumnPropertiesNgComponent.GridClickEventer | undefined;

    public fieldName: string | undefined = undefined;

    private _recordStore: GridLayoutRecordStore;
    private _grid: RecordGrid;
    private _gridPrepared = false;

    private _visibleField: GridLayoutRecordStore.VisibleField;

    private _columnFilterId: GridLayoutEditorColumnPropertiesNgComponent.ColumnFilterId = GridLayoutEditorColumnPropertiesNgComponent.ColumnFilterId.ShowAll;
    private readonly _fieldVisibleUiAction: BooleanUiAction;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++GridLayoutEditorColumnPropertiesNgComponent.typeInstanceCreateCount);

        this._recordStore = new GridLayoutRecordStore();

        this._fieldVisibleUiAction = new BooleanUiAction();
        this._fieldVisibleUiAction.pushCaption(Strings[StringId.Visible]);
        this._fieldVisibleUiAction.pushValue(false);
        this._fieldVisibleUiAction.commitEvent = () => this.handleFieldVisibleCommitEvent();
    }

    get gridLayoutDefinition() { return this._recordStore.getLayout().createDefinition(); }
    get focusedRecordIndex() { return this._grid.focusedRecordIndex; }

    public get columnFilterId(): GridLayoutEditorColumnPropertiesNgComponent.ColumnFilterId { return this._columnFilterId; }
    public set columnFilterId(value: GridLayoutEditorColumnPropertiesNgComponent.ColumnFilterId) {
        this._columnFilterId = value;
        this.applyColumnFilter();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this._gridComponent.destroyGrid();
        };

        // this._grid = this._gridComponent.createGrid(this._recordStore, GridLayoutEditorColumnPropertiesNgComponent.frameGridProperties);
        this._grid.recordFocusedEventer = (recIdx) => this.handleRecordFocusEvent(recIdx);
        this._grid.mainClickEventer = (fieldIdx, recIdx) => this.handleGridClickEvent(fieldIdx, recIdx);

        this.prepareGrid();

        // this._fieldVisibleCheckboxComponent.initialise(this._fieldVisibleUiAction);
    }

    ngOnDestroy() {
        this._fieldVisibleUiAction.finalise();
    }

    // private initialise() {
    // }

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

    invalidateVisibleValue(rowIndex: Integer): void {
        // const fieldIndex = this._grid.getFieldIndex(this._visibleField);
        // this._recordStore.invalidateValue(fieldIndex, rowIndex, RevRecordValueRecentChangeTypeId.Update);
    }

    /** @return New focused record index or undefined if no move occurred */
    applyGridLayoutChangeAction(action: GridLayoutChange.Action): number | undefined {
        return undefined;
        // const moveColumn = (currentIndex: number, newIndex: number): boolean => {
        //     const result = this._allowedFieldsAndLayoutDefinition.layoutDefinition.moveColumn(currentIndex, newIndex);
        //     if (result) {
        //         this._recordStore.recordsLoaded();
        //     }
        //     return result;
        // };

        // switch (action.id) {
        //     case GridLayoutChange.ActionId.MoveUp: {
        //         const newIndex = Math.max(0, action.columnIndex - 1);
        //         if (!moveColumn(action.columnIndex, newIndex)) {
        //             return undefined;
        //         } else {
        //             this._grid.focusedRecordIndex = undefined;
        //             this._grid.focusedRecordIndex = newIndex;
        //             return newIndex;
        //         }
        //     }

        //     case GridLayoutChange.ActionId.MoveTop: {
        //         const newIndex = 0;
        //         if (!moveColumn(action.columnIndex, newIndex)) {
        //             return undefined;
        //         } else {
        //             this._grid.focusedRecordIndex = undefined;
        //             this._grid.focusedRecordIndex = newIndex;
        //             return newIndex;
        //         }
        //     }

        //     case GridLayoutChange.ActionId.MoveDown: {
        //         const newIndex = Math.min(this._recordStore.recordCount, action.columnIndex + 2);
        //         if (!moveColumn(action.columnIndex, newIndex)) {
        //             return undefined;
        //         } else {
        //             this._grid.focusedRecordIndex = undefined;
        //             this._grid.focusedRecordIndex = newIndex - 1;
        //             return newIndex - 1;
        //         }
        //     }

        //     case GridLayoutChange.ActionId.MoveBottom: {
        //         const newIndex = this._recordStore.recordCount;
        //         if (!moveColumn(action.columnIndex, newIndex)) {
        //             return undefined;
        //         } else {
        //             this._grid.focusedRecordIndex = undefined;
        //             this._grid.focusedRecordIndex = newIndex - 1;
        //             return newIndex - 1;
        //         }
        //     }

        //     case GridLayoutChange.ActionId.SetVisible: {
        //         throw new UnexpectedCaseError('GLEGNCALCV91006');
        //     }


        //     case GridLayoutChange.ActionId.SetWidth: {
        //         throw new UnexpectedCaseError('GLEGNCALCW91006');
        //     }

        //     default:
        //         throw new UnexpectedCaseError('GLEGNCALCD91006');
        // }
    }

    getColumn(columnIndex: number): GridLayout.Column {
        return {
            fieldName: '',
            visible: undefined,
            autoSizableWidth: undefined,
        };
        // return this._allowedFieldsAndLayoutDefinition.layout.getColumn(columnIndex);
    }

    getColumnHeading(columnIndex: number) {
        // const fieldName = this._allowedFieldsAndLayoutDefinition.layout.getColumn(columnIndex).field.name;
        // const heading = this._allowedFieldsAndLayoutDefinition.headersMap.get(fieldName);
        // if (heading !== undefined) {
        //     return heading;
        // } else {
        //     return fieldName; // looks like headings are not configured
        // }
        return '';
    }

    focusNextSearchMatch(searchText: string) {
        const focusedRecIdx = this._grid.focusedRecordIndex;

        let prevMatchRowIdx: Integer;
        if (focusedRecIdx === undefined) {
            prevMatchRowIdx = 0;
        } else {
            const focusedRowIdx = this._grid.recordToRowIndex(focusedRecIdx);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            prevMatchRowIdx = focusedRowIdx;
        }
    }

    private handleFieldVisibleCommitEvent() {
        // if (this._currentRecordIndex !== undefined) {
        //     const column = this._gridComponent.getColumn(this._currentRecordIndex);
        //     column.visible = this._fieldVisibleUiAction.definedValue;
        //     this._gridComponent.invalidateVisibleValue(this._currentRecordIndex);
        // } else {
        //     this.fieldName = undefined;
        // }
        // this.updateFieldProperties();
    }

    private applyColumnFilter(): void {
        this._grid.clearFilter();

        const value = this._columnFilterId;
        switch (value) {
            case GridLayoutEditorColumnPropertiesNgComponent.ColumnFilterId.ShowAll:
                this._grid.applyFilter((record) => showAllFilter(record));
                break;

            case GridLayoutEditorColumnPropertiesNgComponent.ColumnFilterId.ShowVisible:
                this._grid.applyFilter((record) => showVisibleFilter(record));
                break;

            case GridLayoutEditorColumnPropertiesNgComponent.ColumnFilterId.ShowHidden:
                this._grid.applyFilter((record) => showHiddenFilter(record));
                break;

            default:
                throw new UnreachableCaseError('ID:8424163216', value);
        }
    }

    private prepareGrid() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._grid !== undefined) {
            if (this._gridPrepared) {
                this._grid.reset();
            }

            // if (this._allowedFieldsAndLayoutDefinition) {
            //     this._recordStore.setData(this._allowedFieldsAndLayoutDefinition);

            //     const positionField = this._recordStore.createPositionField();
            //     const headingField = this._recordStore.createHeadingField();
            //     const widthField = this._recordStore.createWidthField();
            //     this._visibleField = this._recordStore.createVisibleField();

            //     this._recordStore.addFields([
            //         positionField,
            //         headingField,
            //         this._visibleField,
            //         widthField,
            //     ]);

            //     this._grid.setFieldState(positionField, GridLayoutRecordStore.IntegerGridFieldState);
            //     this._grid.setFieldState(headingField, GridLayoutRecordStore.StringGridFieldState);
            //     this._grid.setFieldState(this._visibleField, GridLayoutRecordStore.StringGridFieldState);
            //     this._grid.setFieldState(widthField, GridLayoutRecordStore.IntegerGridFieldState);

            //     this._recordStore.recordsInserted(0, this._recordStore.recordCount);

            //     this.applyColumnFilter();
            // }

            this._gridPrepared = true;
        }
    }
}

export namespace GridLayoutEditorColumnPropertiesNgComponent {
    export type RecordFocusEventer = (recordIndex: Integer | undefined) => void;
    export type GridClickEventer = (fieldIndex: Integer, recordIndex: Integer) => void;

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
                        caption: Strings[StringId.GridLayoutEditor_ShowAllRadioCaption],
                        title: Strings[StringId.GridLayoutEditor_ShowAllRadioTitle],
                    };
                case ColumnFilterId.ShowVisible:
                    return {
                        element: ColumnFilterId.ShowVisible,
                        caption: Strings[StringId.GridLayoutEditor_ShowVisibleRadioCaption],
                        title: Strings[StringId.GridLayoutEditor_ShowVisibleRadioTitle],
                    };
                case ColumnFilterId.ShowHidden:
                    return {
                        element: ColumnFilterId.ShowHidden,
                        caption: Strings[StringId.GridLayoutEditor_ShowHiddenRadioCaption],
                        title: Strings[StringId.GridLayoutEditor_ShowHiddenRadioTitle],
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
    return true;
    // return (record as GridLayout.Column).visible;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function showHiddenFilter(record: object): boolean {
    return !(record as GridLayout.Column).visible;
}
