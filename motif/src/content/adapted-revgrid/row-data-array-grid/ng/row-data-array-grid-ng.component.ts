/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { GridField } from '@motifmarkets/motif-core';
import { SettingsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { SingleHeadingDataRowArrayServerSet, Subgrid } from 'revgrid';
import { AdaptedRevgrid } from '../../adapted-revgrid';
import { AdaptedRevgridComponentNgDirective } from '../../ng/adapted-revgrid-component-ng.directive';
import { AdaptedRevgridBehavioredColumnSettings } from '../../settings/adapted-revgrid-behaviored-column-settings';
import { AdaptedRevgridGridSettings } from '../../settings/content-adapted-revgrid-settings-internal-api';
import { RowDataArrayGrid } from '../row-data-array-grid';

@Component({
    selector: 'app-row-data-array-grid',
    templateUrl: './row-data-array-grid-ng.component.html',
    styleUrls: ['./row-data-array-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class RowDataArrayGridNgComponent extends AdaptedRevgridComponentNgDirective implements OnDestroy {
    private _grid: RowDataArrayGrid | undefined;

    constructor(elRef: ElementRef<HTMLElement>, settingsNgService: SettingsNgService, textFormatterNgService: TextFormatterNgService) {
        const settingsService = settingsNgService.settingsService;
        super(elRef.nativeElement, settingsService);
    }

    ngOnDestroy() {
        if (this.destroyEventer !== undefined) {
            this.destroyEventer();
        }
    }

    createGrid(
        customGridSettings: Partial<AdaptedRevgridGridSettings>,
        createFieldEventer: SingleHeadingDataRowArrayServerSet.CreateFieldEventer<GridField>,
        customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    ) {
        this.destroyGrid(); // Can only have one grid so destroy previous one if it exists

        // const gridSettings: Partial<GridSettings> = {
        //     renderFalsy: true,
        //     autoSelectRows: false,
        //     singleRowSelectionMode: false,
        //     columnSelection: false,
        //     rowSelection: false,
        //     restoreColumnSelections: false,
        //     multipleSelections: false,
        //     sortOnDoubleClick: false,
        //     visibleColumnWidthAdjust: true,
        //     halign: 'left',
        //     ...frameGridSettings,
        //     ...AdaptedRevgrid.createSettingsServicePartialGridSettings(this._settingsService, frameGridSettings, undefined),
        // };

        const grid = new RowDataArrayGrid(
            this._settingsService,
            this._hostElement,
            customGridSettings,
            createFieldEventer,
            customiseSettingsForNewColumnEventer,
            getMainCellPainterEventer,
            getHeaderCellPainterEventer,
        );

        this._grid = grid;

        grid.activate();

        return grid;
    }

    override destroyGrid() {
        super.destroyGrid();

        if (this._grid !== undefined) {
            this._grid.destroy();
        }
    }

}
