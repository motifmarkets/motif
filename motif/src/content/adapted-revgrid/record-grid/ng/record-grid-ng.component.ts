import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { GridField } from '@motifmarkets/motif-core';
import { SettingsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { AdaptedRevgridBehavioredColumnSettings, RevRecordStore, Revgrid, Subgrid } from 'revgrid';
import { AdaptedRevgridComponentNgDirective } from '../../ng/adapted-revgrid-component-ng.directive';
import { AdaptedRevgridBehavioredGridSettings } from '../../settings/content-adapted-revgrid-settings-internal-api';
import { RecordGrid } from '../record-grid';
import { RecordGridMainTextCellPainter } from '../record-grid-main-text-cell-painter';

@Component({
    selector: 'app-record-grid',
    templateUrl: './record-grid-ng.component.html',
    styleUrls: ['./record-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class RecordGridNgComponent extends AdaptedRevgridComponentNgDirective implements OnDestroy, RecordGrid.ComponentAccess {
    private readonly _cellPainter: RecordGridMainTextCellPainter;

    private _grid: RecordGrid;

    constructor(elRef: ElementRef<HTMLElement>, settingsNgService: SettingsNgService, textFormatterNgService: TextFormatterNgService) {
        const settingsService = settingsNgService.settingsService;
        super(elRef.nativeElement, settingsService);

        if (recordGridCellPainter === undefined) {
            recordGridCellPainter = new RecordGridMainTextCellPainter(settingsService, textFormatterNgService.service);
        }
        this._cellPainter = recordGridCellPainter;

        this.applySettings();
    }

    get recordGrid() { return this._grid; }

    ngOnDestroy() {
        if (this.destroyEventer !== undefined) {
            this.destroyEventer();
        }
    }

    createGrid(
        recordStore: RevRecordStore,
        gridSettings: AdaptedRevgridBehavioredGridSettings,
        getSettingsForNewColumnEventer: Revgrid.GetSettingsForNewColumnEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    ) {
        this.destroyGrid(); // Can only have one grid so destroy previous one if it exists

        const grid = new RecordGrid(
            this,
            this._settingsService,
            this._hostElement,
            recordStore,
            // this._cellPainter,
            gridSettings,
            getSettingsForNewColumnEventer,
            getMainCellPainterEventer,
            getHeaderCellPainterEventer,
        );

        this._grid = grid;

        this.initialiseGridRightAlignedAndCtrlKeyMouseMoveEventer(grid, frameGridSettings);

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

let recordGridCellPainter: RecordGridMainTextCellPainter | undefined; // singleton shared with all RecordGrid instantiations
