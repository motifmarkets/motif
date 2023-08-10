/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import {
    EditableGridLayoutDefinitionColumnList,
    LockOpenListItem,
    StringId,
    Strings,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CoreInjectionTokens } from '../../../../../component-services/ng-api';
import { GridSourceNgDirective } from '../../../../grid-source/ng-api';
import { ContentNgService } from '../../../../ng/content-ng.service';
import { definitionColumnListInjectionToken } from '../../../ng/grid-layout-dialog-ng-injection-tokens';
import { GridLayoutEditorSearchGridNgComponent } from '../../search-grid/ng-api';
import { GridLayoutEditorColumnsFrame } from '../grid-layout-editor-columns-frame';

@Component({
    selector: 'app-grid-layout-editor-columns',
    templateUrl: './grid-layout-editor-columns-ng.component.html',
    styleUrls: ['./grid-layout-editor-columns-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorColumnsNgComponent extends  GridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    @ViewChild('search', { static: true }) private _searchComponent: GridLayoutEditorSearchGridNgComponent;

    public readonly heading = Strings[StringId.InUse]

    declare readonly frame: GridLayoutEditorColumnsFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
        @Inject(definitionColumnListInjectionToken) columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        const frame = contentNgService.createGridLayoutEditorColumnsFrame(columnList);
        super(elRef, ++GridLayoutEditorColumnsNgComponent.typeInstanceCreateCount, cdr, frame);
    }

    protected override processAfterViewInit() {
        this.frame.setupGrid(this._gridHost.nativeElement);
        this.frame.initialiseGrid(this._opener, undefined, false);
        delay1Tick(() => this.linkSearchComponent());
    }

    private linkSearchComponent() {
        this._searchComponent.selectAllEventer = () => this.frame.selectAll();
        this._searchComponent.searchTextChangedEventer = (searchText) => this.frame.tryFocusFirstSearchMatch(searchText);
        this._searchComponent.searchNextEventer = (searchText, downKeys) => this.frame.tryFocusNextSearchMatch(searchText, downKeys);
    }

    // invalidateVisibleValue(rowIndex: Integer): void {
    //     // const fieldIndex = this._grid.getFieldIndex(this._visibleField);
    //     // this._recordStore.invalidateValue(fieldIndex, rowIndex, RevRecordValueRecentChangeTypeId.Update);
    // }

    // /** @return New focused record index or undefined if no move occurred */
    // applyGridLayoutChangeAction(action: GridLayoutChange.Action): number | undefined {
    //     return undefined;
    //     // const moveColumn = (currentIndex: number, newIndex: number): boolean => {
    //     //     const result = this._allowedFieldsAndLayoutDefinition.layoutDefinition.moveColumn(currentIndex, newIndex);
    //     //     if (result) {
    //     //         this._recordStore.recordsLoaded();
    //     //     }
    //     //     return result;
    //     // };

    //     // switch (action.id) {
    //     //     case GridLayoutChange.ActionId.MoveUp: {
    //     //         const newIndex = Math.max(0, action.columnIndex - 1);
    //     //         if (!moveColumn(action.columnIndex, newIndex)) {
    //     //             return undefined;
    //     //         } else {
    //     //             this._grid.focusedRecordIndex = undefined;
    //     //             this._grid.focusedRecordIndex = newIndex;
    //     //             return newIndex;
    //     //         }
    //     //     }

    //     //     case GridLayoutChange.ActionId.MoveTop: {
    //     //         const newIndex = 0;
    //     //         if (!moveColumn(action.columnIndex, newIndex)) {
    //     //             return undefined;
    //     //         } else {
    //     //             this._grid.focusedRecordIndex = undefined;
    //     //             this._grid.focusedRecordIndex = newIndex;
    //     //             return newIndex;
    //     //         }
    //     //     }

    //     //     case GridLayoutChange.ActionId.MoveDown: {
    //     //         const newIndex = Math.min(this._recordStore.recordCount, action.columnIndex + 2);
    //     //         if (!moveColumn(action.columnIndex, newIndex)) {
    //     //             return undefined;
    //     //         } else {
    //     //             this._grid.focusedRecordIndex = undefined;
    //     //             this._grid.focusedRecordIndex = newIndex - 1;
    //     //             return newIndex - 1;
    //     //         }
    //     //     }

    //     //     case GridLayoutChange.ActionId.MoveBottom: {
    //     //         const newIndex = this._recordStore.recordCount;
    //     //         if (!moveColumn(action.columnIndex, newIndex)) {
    //     //             return undefined;
    //     //         } else {
    //     //             this._grid.focusedRecordIndex = undefined;
    //     //             this._grid.focusedRecordIndex = newIndex - 1;
    //     //             return newIndex - 1;
    //     //         }
    //     //     }

    //     //     case GridLayoutChange.ActionId.SetVisible: {
    //     //         throw new UnexpectedCaseError('GLEGNCALCV91006');
    //     //     }


    //     //     case GridLayoutChange.ActionId.SetWidth: {
    //     //         throw new UnexpectedCaseError('GLEGNCALCW91006');
    //     //     }

    //     //     default:
    //     //         throw new UnexpectedCaseError('GLEGNCALCD91006');
    //     // }
    // }

    // getColumn(columnIndex: number): GridLayout.Column {
    //     return {
    //         fieldName: ''
    //     };
    //     // return this._allowedFieldsAndLayoutDefinition.layout.getColumn(columnIndex);
    // }

    // getColumnHeading(columnIndex: number) {
    //     // const fieldName = this._allowedFieldsAndLayoutDefinition.layout.getColumn(columnIndex).field.name;
    //     // const heading = this._allowedFieldsAndLayoutDefinition.headersMap.get(fieldName);
    //     // if (heading !== undefined) {
    //     //     return heading;
    //     // } else {
    //     //     return fieldName; // looks like headings are not configured
    //     // }
    //     return '';
    // }

    // focusNextSearchMatch(searchText: string) {
    //     const focusedRecIdx = this._grid.focusedRecordIndex;

    //     let prevMatchRowIdx: Integer;
    //     if (focusedRecIdx === undefined) {
    //         prevMatchRowIdx = 0;
    //     } else {
    //         const focusedRowIdx = this._grid.recordToRowIndex(focusedRecIdx);
    //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //         prevMatchRowIdx = focusedRowIdx;
    //     }
    // }

    // private applyColumnFilter(): void {
    //     this._grid.clearFilter();

    //     const value = this._columnFilterId;
    //     switch (value) {
    //         case GridLayoutEditorColumnsNgComponent.ColumnFilterId.ShowAll:
    //             this._grid.applyFilter((record) => showAllFilter(record));
    //             break;

    //         case GridLayoutEditorColumnsNgComponent.ColumnFilterId.ShowVisible:
    //             this._grid.applyFilter((record) => showVisibleFilter(record));
    //             break;

    //         case GridLayoutEditorColumnsNgComponent.ColumnFilterId.ShowHidden:
    //             this._grid.applyFilter((record) => showHiddenFilter(record));
    //             break;

    //         default:
    //             throw new UnreachableCaseError('ID:8424163216', value);
    //     }
    // }

    // private prepareGrid() {
    //     // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    //     if (this._grid !== undefined) {
    //         if (this._gridPrepared) {
    //             this._grid.reset();
    //         }

    //         // if (this._allowedFieldsAndLayoutDefinition) {
    //         //     this._recordStore.setData(this._allowedFieldsAndLayoutDefinition);

    //         //     const positionField = this._recordStore.createPositionField();
    //         //     const headingField = this._recordStore.createHeadingField();
    //         //     const widthField = this._recordStore.createWidthField();
    //         //     this._visibleField = this._recordStore.createVisibleField();

    //         //     this._recordStore.addFields([
    //         //         positionField,
    //         //         headingField,
    //         //         this._visibleField,
    //         //         widthField,
    //         //     ]);

    //         //     this._grid.setFieldState(positionField, GridLayoutRecordStore.IntegerGridFieldState);
    //         //     this._grid.setFieldState(headingField, GridLayoutRecordStore.StringGridFieldState);
    //         //     this._grid.setFieldState(this._visibleField, GridLayoutRecordStore.StringGridFieldState);
    //         //     this._grid.setFieldState(widthField, GridLayoutRecordStore.IntegerGridFieldState);

    //         //     this._recordStore.recordsInserted(0, this._recordStore.recordCount);

    //         //     this.applyColumnFilter();
    //         // }

    //         this._gridPrepared = true;
    //     }
    // }
}

export namespace GridLayoutEditorColumnsNgComponent {
    // export const enum ColumnFilterId {
    //     ShowAll = 1,
    //     ShowVisible = 2,
    //     ShowHidden = 3,
    // }

    // export namespace ColumnFilter {
    //     export function getEnumUiActionElementProperties(id: ColumnFilterId): EnumUiAction.ElementProperties {
    //         switch (id) {
    //             case ColumnFilterId.ShowAll:
    //                 return {
    //                     element: ColumnFilterId.ShowAll,
    //                     caption: Strings[StringId.GridLayoutEditor_ShowAllRadioCaption],
    //                     title: Strings[StringId.GridLayoutEditor_ShowAllRadioTitle],
    //                 };
    //             case ColumnFilterId.ShowVisible:
    //                 return {
    //                     element: ColumnFilterId.ShowVisible,
    //                     caption: Strings[StringId.GridLayoutEditor_ShowVisibleRadioCaption],
    //                     title: Strings[StringId.GridLayoutEditor_ShowVisibleRadioTitle],
    //                 };
    //             case ColumnFilterId.ShowHidden:
    //                 return {
    //                     element: ColumnFilterId.ShowHidden,
    //                     caption: Strings[StringId.GridLayoutEditor_ShowHiddenRadioCaption],
    //                     title: Strings[StringId.GridLayoutEditor_ShowHiddenRadioTitle],
    //                 };
    //             default:
    //                 throw new UnreachableCaseError('GLEGCCFGEUAEP0098233', id);
    //         }
    //     }
    // }
}

// // eslint-disable-next-line @typescript-eslint/ban-types
// function showAllFilter(record: object): boolean {
//     return true;
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// function showVisibleFilter(record: object): boolean {
//     return true;
//     // return (record as GridLayout.Column).visible;
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// function showHiddenFilter(record: object): boolean {
//     return !(record as GridLayout.Column).visible;
// }
