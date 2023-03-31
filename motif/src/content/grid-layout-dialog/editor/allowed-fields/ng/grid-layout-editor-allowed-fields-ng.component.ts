/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import {
    delay1Tick,
    GridField,
    StringId,
    Strings
} from '@motifmarkets/motif-core';
import { TableRecordSourceDefinitionFactoryNgService } from '../../../../../component-services/ng-api';
import { AdaptedRevgrid } from '../../../../adapted-revgrid/internal-api';
import { GridSourceNgComponent } from '../../../../grid-source/ng-api';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';
import { allowedFieldsInjectionToken } from '../../../ng/grid-layout-dialog-ng-injection-tokens';
import { GridLayoutEditorSearchGridNgComponent } from '../../search-grid/ng-api';
import { GridLayoutEditorAllowedFieldsFrame } from '../grid-layout-editor-allowed-fields-frame';

@Component({
    selector: 'app-grid-layout-editor-allowed-fields',
    templateUrl: './grid-layout-editor-allowed-fields-ng.component.html',
    styleUrls: ['./grid-layout-editor-allowed-fields-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorAllowedFieldsNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit {
    @ViewChild('search', { static: true }) private _searchComponent: GridLayoutEditorSearchGridNgComponent;
    @ViewChild('gridSource', { static: true }) private _gridSourceComponent: GridSourceNgComponent;

    public readonly frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    public readonly heading = Strings[StringId.AvailableColumns]

    private readonly _frame: GridLayoutEditorAllowedFieldsFrame;

    constructor(
        tableRecordSourceDefinitionFactoryNgService: TableRecordSourceDefinitionFactoryNgService,
        @Inject(allowedFieldsInjectionToken) allowedFields: GridField[],
    ) {
        super();

        this._frame = new GridLayoutEditorAllowedFieldsFrame(
            this,
            tableRecordSourceDefinitionFactoryNgService.service,
            allowedFields,
        );
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    private initialise() {
        this._frame.initialise(this._gridSourceComponent.frame, this._gridSourceComponent.recordGrid);

        this._searchComponent.selectAllEventer = () => this._frame.selectAll();
        this._searchComponent.searchTextChangedEventer = (searchText) => this._frame.tryFocusFirstSearchMatch(searchText);
        this._searchComponent.searchNextEventer = (searchText, downKeys) => this._frame.tryFocusNextSearchMatch(searchText, downKeys);
    }
}
