/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import {
    EnumUiAction,
    GridField,
    GridLayout,
    GridLayoutChange,
    GridLayoutDefinition,
    GridLayoutRecordStore,
    Integer,
    StringId,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { RevRecordFieldIndex, RevRecordIndex } from 'revgrid';
import { AdaptedRevgrid, RecordGrid } from '../../../../adapted-revgrid/internal-api';
import { RecordGridNgComponent } from '../../../../adapted-revgrid/record-grid/ng/record-grid-ng.component';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-grid-layout-editor-definition-column-properties',
    templateUrl: './grid-layout-editor-definition-column-properties-ng.component.html',
    styleUrls: ['./grid-layout-editor-definition-column-properties-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorDefinitionColumnPropertiesNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit {
    @ViewChild(RecordGridNgComponent, { static: true }) private _gridComponent: RecordGridNgComponent;

    recordFocusEventer: GridLayoutEditorDefinitionColumnPropertiesNgComponent.RecordFocusEventer | undefined;
    gridClickEventer: GridLayoutEditorDefinitionColumnPropertiesNgComponent.GridClickEventer | undefined;

    private _recordStore: GridLayoutRecordStore;
    private _grid: RecordGrid;
    private _gridPrepared = false;
    private _allowedFields: readonly GridField[];
    private _layoutDefinition: GridLayoutDefinition;

    private _visibleField: GridLayoutRecordStore.VisibleField;

    private _columnFilterId: GridLayoutEditorDefinitionColumnPropertiesNgComponent.ColumnFilterId = GridLayoutEditorDefinitionColumnPropertiesNgComponent.ColumnFilterId.ShowAll;

    constructor() {
        super();

        this._recordStore = new GridLayoutRecordStore();
    }

    get gridLayoutDefinition() { return this._recordStore.getLayout().createDefinition(); }
    get focusedRecordIndex() { return this._grid.focusedRecordIndex; }

    public get columnFilterId(): GridLayoutEditorDefinitionColumnPropertiesNgComponent.ColumnFilterId { return this._columnFilterId; }
    public set columnFilterId(value: GridLayoutEditorDefinitionColumnPropertiesNgComponent.ColumnFilterId) {
        this._columnFilterId = value;
        this.applyColumnFilter();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this._gridComponent.destroyGrid();
        };

        this._grid = this._gridComponent.createGrid(this._recordStore, GridLayoutEditorDefinitionColumnPropertiesNgComponent.frameGridProperties);
        this._grid.recordFocusedEventer = (recIdx) => this.handleRecordFocusEvent(recIdx);
        this._grid.mainClickEventer = (fieldIdx, recIdx) => this.handleGridClickEvent(fieldIdx, recIdx);

        this.prepareGrid();
    }

    // private initialise() {
    // }

    setAllowedFieldsAndLayoutDefinition(allowedFields: readonly GridField[], layoutDefinition: GridLayoutDefinition) {
        this._allowedFields = allowedFields;
        this._layoutDefinition = layoutDefinition;
        this.prepareGrid();
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
            fieldName: ''
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

    private applyColumnFilter(): void {
        this._grid.clearFilter();

        const value = this._columnFilterId;
        switch (value) {
            case GridLayoutEditorDefinitionColumnPropertiesNgComponent.ColumnFilterId.ShowAll:
                this._grid.applyFilter((record) => showAllFilter(record));
                break;

            case GridLayoutEditorDefinitionColumnPropertiesNgComponent.ColumnFilterId.ShowVisible:
                this._grid.applyFilter((record) => showVisibleFilter(record));
                break;

            case GridLayoutEditorDefinitionColumnPropertiesNgComponent.ColumnFilterId.ShowHidden:
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

export namespace GridLayoutEditorDefinitionColumnPropertiesNgComponent {
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
