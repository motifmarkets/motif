/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import {
    AssertInternalError,
    EditableGridLayoutDefinitionColumnList,
    IntegerUiAction,
    LockOpenListItem,
    StringId,
    Strings,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CoreInjectionTokens } from 'component-services-ng-api';
import { IntegerTextInputNgComponent } from 'controls-ng-api';
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
export class GridLayoutEditorColumnsNgComponent extends GridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    @ViewChild('search', { static: true }) private _searchComponent: GridLayoutEditorSearchGridNgComponent;
    @ViewChild('widthEditorControl', { static: true }) private _widthEditorComponent: IntegerTextInputNgComponent;

    public readonly heading = Strings[StringId.InUse]

    declare readonly frame: GridLayoutEditorColumnsFrame;

    private readonly _widthEditorUiAction: IntegerUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
        @Inject(definitionColumnListInjectionToken) columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        const frame = contentNgService.createGridLayoutEditorColumnsFrame(columnList);
        super(elRef, ++GridLayoutEditorColumnsNgComponent.typeInstanceCreateCount, cdr, frame);

        this._widthEditorUiAction = this.createWidthEditorUiAction();
    }

    protected override processOnDestroy(): void {
        this._widthEditorUiAction.finalise();
    }

    protected override processAfterViewInit() {
        this.frame.setupGrid(this._gridHost.nativeElement);
        this._widthEditorComponent.dataServer = this.frame.grid.mainDataServer;
        const initialisePromise = this.frame.initialiseGrid(this._opener, undefined, false);
        initialisePromise.then(
            (gridSourceOrReference) => {
                if (gridSourceOrReference === undefined) {
                    throw new AssertInternalError('GLECNCPU50137');
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'GLECNCPR50137') }
        );
        delay1Tick(() => this.initialiseComponents());
    }

    private initialiseComponents() {
        this._searchComponent.selectAllEventer = () => this.frame.selectAllRows();
        this._searchComponent.searchTextChangedEventer = (searchText) => this.frame.tryFocusFirstSearchMatch(searchText);
        this._searchComponent.searchNextEventer = (searchText, downKeys) => this.frame.tryFocusNextSearchMatch(searchText, downKeys);

        this._widthEditorComponent.initialise(this._widthEditorUiAction);
        this.frame.setWidthEditor(this._widthEditorComponent);
    }

    private createWidthEditorUiAction() {
        const action = new IntegerUiAction(false);
        action.pushCaption(Strings[StringId.GridLayoutEditorColumns_SetWidthCaption]);
        action.pushTitle(Strings[StringId.GridLayoutEditorColumns_SetWidthTitle]);
        action.commitEvent = () => {
            const focus = this.frame.grid.focus;
            if (focus.canSetFocusedEditValue()) {
                focus.setFocusedEditValue(this._widthEditorUiAction.value);
            }
        };
        return action;
    }
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
