/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import {
    EditableGridLayoutDefinitionColumnList,
    GridField,
    LockOpenListItem,
    StringId,
    Strings,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CoreInjectionTokens } from 'component-services-ng-api';
import { GridSourceNgDirective } from '../../../../grid-source/ng-api';
import { ContentNgService } from '../../../../ng/content-ng.service';
import { allowedFieldsInjectionToken, definitionColumnListInjectionToken } from '../../../ng/grid-layout-dialog-ng-injection-tokens';
import { GridLayoutEditorSearchGridNgComponent } from '../../search-grid/ng-api';
import { GridLayoutEditorAllowedFieldsFrame } from '../grid-layout-editor-allowed-fields-frame';

@Component({
    selector: 'app-grid-layout-editor-allowed-fields',
    templateUrl: './grid-layout-editor-allowed-fields-ng.component.html',
    styleUrls: ['./grid-layout-editor-allowed-fields-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorAllowedFieldsNgComponent extends GridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    @ViewChild('search', { static: true }) private _searchComponent: GridLayoutEditorSearchGridNgComponent;

    columnsViewWithsChangedEventer: GridLayoutEditorAllowedFieldsNgComponent.ColumnsViewWithsChangedEventer | undefined;

    public readonly heading = Strings[StringId.Available]

    declare readonly frame: GridLayoutEditorAllowedFieldsFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
        @Inject(allowedFieldsInjectionToken) allowedFields: GridField[],
        @Inject(definitionColumnListInjectionToken) columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        const frame = contentNgService.createGridLayoutEditorAllowedFieldsFrame(allowedFields, columnList);
        super(elRef, ++GridLayoutEditorAllowedFieldsNgComponent.typeInstanceCreateCount, cdr, frame);
    }

    get emWidth() { return this.frame.grid.canvas.gc.getEmWidth(); }

    calculateFixedColumnsWidth() {
        return this.frame.grid.columnsManager.calculateFixedColumnsWidth();
    }

    calculateActiveColumnsWidth() {
        return this.frame.grid.calculateActiveColumnsWidth();
    }

    waitLastServerNotificationRendered() {
        return this.frame.grid.renderer.waitLastServerNotificationRendered();
    }

    protected override processAfterViewInit() {
        this.frame.setupGrid(this._gridHost.nativeElement);
        this.frame.initialiseGrid(this._opener, undefined, false);

        this.frame.grid.columnsViewWidthsChangedEventer = (_fixedChanged, _nonFixedChanged, allChanged) => {
            if (allChanged && this.columnsViewWithsChangedEventer !== undefined) {
                this.columnsViewWithsChangedEventer();
            }
        }

        delay1Tick(() => this.linkSearchComponent());
    }

    private linkSearchComponent() {
        this._searchComponent.selectAllEventer = () => this.frame.selectAll();
        this._searchComponent.searchTextChangedEventer = (searchText) => this.frame.tryFocusFirstSearchMatch(searchText);
        this._searchComponent.searchNextEventer = (searchText, downKeys) => this.frame.tryFocusNextSearchMatch(searchText, downKeys);
    }
}

export namespace GridLayoutEditorAllowedFieldsNgComponent {
    export type ColumnsViewWithsChangedEventer = (this: void) => void;
}
