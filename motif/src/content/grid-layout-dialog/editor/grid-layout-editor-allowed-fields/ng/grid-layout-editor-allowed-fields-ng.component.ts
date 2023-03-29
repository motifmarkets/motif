/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import {
    CommandRegisterService,
    delay1Tick,
    EnumUiAction,
    GridField,
    GridLayout,
    GridLayoutRecordStore,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    StringId,
    Strings,
    StringUiAction,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService, TableRecordSourceDefinitionFactoryNgService } from '../../../../../component-services/ng-api';
import { SvgButtonNgComponent, TextInputNgComponent } from '../../../../../controls/ng-api';
import { AdaptedRevgrid } from '../../../../adapted-revgrid/internal-api';
import { GridSourceNgComponent } from '../../../../grid-source/ng-api';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';
import { allowedFieldsInjectionToken } from '../../../grid-layout-dialog-injection-tokens';
import { ColumnFilterId } from '../../grid-layout-editor-types';
import { GridLayoutEditorAllowedFieldsFrame } from '../grid-layout-editor-allowed-fields-frame';

@Component({
    selector: 'app-grid-layout-editor-allowed-fields',
    templateUrl: './grid-layout-editor-allowed-fields-ng.component.html',
    styleUrls: ['./grid-layout-editor-allowed-fields-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorAllowedFieldsNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('cancelSearchButton', { static: true }) private _cancelSearchButtonComponent: SvgButtonNgComponent;
    @ViewChild('searchNextButton', { static: true }) private _searchNextButtonComponent: SvgButtonNgComponent;
    @ViewChild('searchInput', { static: true }) private _searchInputComponent: TextInputNgComponent;
    @ViewChild('gridSource', { static: true }) private _gridSourceComponent: GridSourceNgComponent;

    recordFocusEventer: GridLayoutEditorAllowedFieldsNgComponent.RecordFocusEventer | undefined;
    gridClickEventer: GridLayoutEditorAllowedFieldsNgComponent.GridClickEventer | undefined;

    public readonly frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    public readonly heading = Strings[StringId.AvailableColumns]

    private readonly _commandRegisterService: CommandRegisterService;

    private readonly _frame: GridLayoutEditorAllowedFieldsFrame;

    private readonly _cancelSearchUiAction: IconButtonUiAction;
    private readonly _searchNextUiAction: IconButtonUiAction;
    private readonly _searchEditUiAction: StringUiAction;

    private _visibleField: GridLayoutRecordStore.VisibleField;

    private _columnFilterId = ColumnFilterId.ShowAll;

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        tableRecordSourceDefinitionFactoryNgService: TableRecordSourceDefinitionFactoryNgService,
        @Inject(allowedFieldsInjectionToken) allowedFields: GridField[],
    ) {
        super();

        this._commandRegisterService = commandRegisterNgService.service;

        this._frame = new GridLayoutEditorAllowedFieldsFrame(
            this,
            tableRecordSourceDefinitionFactoryNgService.service,
            allowedFields,
        );

        this._cancelSearchUiAction = this.createCancelSearchUiAction();
        this._searchNextUiAction = this.createSearchNextUiAction();
        this._searchEditUiAction = this.createSearchEditUiAction();
    }

    // get gridLayoutDefinition() { return this._recordStore.getLayout().createDefinition(); }
    // get focusedRecordIndex() { return this._grid.focusedRecordIndex; }

    // public get columnFilterId() { return this._columnFilterId; }
    // public set columnFilterId(value: ColumnFilterId) {
    //     this._columnFilterId = value;
    //     this.applyColumnFilter();
    // }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this._cancelSearchUiAction.finalise();
        this._searchNextUiAction.finalise();
        this._searchEditUiAction.finalise();
    }

    // handleRecordFocusEvent(recordIndex: RevRecordIndex | undefined) {
    //     if (this.recordFocusEventer !== undefined) {
    //         this.recordFocusEventer(recordIndex);
    //     }
    // }

    // handleGridClickEvent(fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex): void {
    //     if (this.gridClickEventer !== undefined) {
    //         this.gridClickEventer(fieldIndex, recordIndex);
    //     }
    // }

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

    private handleCancelSearchButtonClickEvent() {
        //
    }

    private handleSearchNextButtonClickEvent() {
        this.searchNext();
    }

    private handleSearchInputInputEvent() {
        if (this._searchEditUiAction.inputtedText === '') {
            this._cancelSearchUiAction.pushDisabled();
            this._searchNextUiAction.pushDisabled();
        } else {
            this._cancelSearchUiAction.pushUnselected();
            this._searchNextUiAction.pushUnselected();
        }
    }

    private createCancelSearchUiAction() {
        const commandName = InternalCommand.Id.GridLayoutEditor_CancelSearch;
        const displayId = StringId.GridLayoutEditor_CancelSearchCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_CancelSearchTitle]);
        action.pushIcon(IconButtonUiAction.IconId.CancelSearch);
        action.signalEvent = () => this.handleCancelSearchButtonClickEvent();
        return action;
    }

    private createSearchNextUiAction() {
        const commandName = InternalCommand.Id.GridLayoutEditor_SearchNext;
        const displayId = StringId.GridLayoutEditor_SearchNextCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_SearchNextTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SearchNext);
        action.signalEvent = () => this.handleSearchNextButtonClickEvent();
        return action;
    }

    private createSearchEditUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.GridLayoutEditor_SearchInputTitle]);
        action.inputEvent = () => this.handleSearchInputInputEvent();
        return action;
    }

    private initialise() {
        this._cancelSearchButtonComponent.initialise(this._cancelSearchUiAction);
        this._searchNextButtonComponent.initialise(this._searchNextUiAction);
        this._searchInputComponent.initialise(this._searchEditUiAction);

        this._frame.initialise(this._gridSourceComponent.frame);

        this._cdr.markForCheck();
    }

    // private applyColumnFilter(): void {
    //     this._grid.clearFilter();

    //     const value = this._columnFilterId;
    //     switch (value) {
    //         case ColumnFilterId.ShowAll:
    //             this._grid.applyFilter((record) => showAllFilter(record));
    //             break;

    //         case ColumnFilterId.ShowVisible:
    //             this._grid.applyFilter((record) => showVisibleFilter(record));
    //             break;

    //         case ColumnFilterId.ShowHidden:
    //             this._grid.applyFilter((record) => showHiddenFilter(record));
    //             break;

    //         default:
    //             throw new UnreachableCaseError('ID:8424163216', value);
    //     }
    // }

    private searchNext() {
        // this._gridComponent.focusNextSearchMatch(this._searchEditUiAction.definedValue);

    }
}

export namespace GridLayoutEditorAllowedFieldsNgComponent {
    export type RecordFocusEventer = (recordIndex: Integer | undefined) => void;
    export type GridClickEventer = (fieldIndex: Integer, recordIndex: Integer) => void;

    export const frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

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
