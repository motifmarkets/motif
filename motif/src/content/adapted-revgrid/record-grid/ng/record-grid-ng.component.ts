/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AdaptedRevgrid, AdaptedRevgridBehavioredColumnSettings, GridField, RecordGrid } from '@motifmarkets/motif-core';
import { SettingsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { RevRecordStore, Subgrid } from 'revgrid';
import { AdaptedRevgridComponentNgDirective } from '../../ng/adapted-revgrid-component-ng.directive';

@Component({
    selector: 'app-record-grid',
    templateUrl: './record-grid-ng.component.html',
    styleUrls: ['./record-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class RecordGridNgComponent extends AdaptedRevgridComponentNgDirective implements OnDestroy {
    private _grid: RecordGrid;

    constructor(elRef: ElementRef<HTMLElement>, settingsNgService: SettingsNgService, textFormatterNgService: TextFormatterNgService) {
        const settingsService = settingsNgService.service;
        super(elRef, 1, settingsService);
    }

    get recordGrid() { return this._grid; }

    ngOnDestroy() {
        if (this.destroyEventer !== undefined) {
            this.destroyEventer();
        }
    }

    createGrid(
        recordStore: RevRecordStore,
        customGridSettings: AdaptedRevgrid.CustomGridSettings,
        customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    ) {
        this.destroyGrid(); // Can only have one grid so destroy previous one if it exists

        const grid = new RecordGrid(
            this._settingsService,
            this.rootHtmlElement,
            recordStore,
            customGridSettings,
            customiseSettingsForNewColumnEventer,
            getMainCellPainterEventer,
            getHeaderCellPainterEventer,
            this,
        );

        this._grid = grid;

        // this.initialiseGridRightAlignedAndCtrlKeyMouseMoveEventer(grid, frameGridSettings);

        grid.activate();

        return grid;
    }

    override destroyGrid() {
        super.destroyGrid();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._grid !== undefined) {
            this._grid.destroy();
        }
    }
}
