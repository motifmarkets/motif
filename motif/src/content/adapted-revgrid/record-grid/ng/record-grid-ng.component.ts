import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { SettingsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { GridProperties, RevRecordStore } from 'revgrid';
import { AdaptedRevgrid } from '../../adapted-revgrid';
import { AdaptedRevgridComponentNgDirective } from '../../ng/adapted-revgrid-component-ng.directive';
import { RecordGrid } from '../record-grid';
import { RecordGridCellPainter } from '../record-grid-cell-painter';

@Component({
    selector: 'app-record-grid',
    templateUrl: './record-grid-ng.component.html',
    styleUrls: ['./record-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class RecordGridNgComponent extends AdaptedRevgridComponentNgDirective implements OnDestroy, RecordGrid.ComponentAccess {
    private readonly _cellPainter: RecordGridCellPainter;

    private _grid: RecordGrid;

    constructor(elRef: ElementRef<HTMLElement>, settingsNgService: SettingsNgService, textFormatterNgService: TextFormatterNgService) {
        const settingsService = settingsNgService.settingsService;
        super(elRef.nativeElement, settingsService);

        if (recordGridCellPainter === undefined) {
            recordGridCellPainter = new RecordGridCellPainter(settingsService, textFormatterNgService.service);
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

    createGrid(recordStore: RevRecordStore, frameGridProperties: AdaptedRevgrid.FrameGridProperties) {
        this.destroyGrid(); // Can only have one grid so destroy previous one if it exists

        const gridProperties: Partial<GridProperties> = {
            renderFalsy: true,
            autoSelectRows: false,
            singleRowSelectionMode: false,
            columnSelection: false,
            rowSelection: false,
            restoreColumnSelections: false,
            multipleSelections: false,
            sortOnDoubleClick: false,
            visibleColumnWidthAdjust: true,
            ...AdaptedRevgrid.createGridPropertiesFromSettings(this._settingsService, frameGridProperties, undefined),
        };

        const grid = new RecordGrid(
            this,
            this._settingsService,
            this._hostElement,
            recordStore,
            this._cellPainter,
            gridProperties,
        );

        this._grid = grid;

        this.initialiseGridRightAlignedAndCtrlKeyMouseMoveEventer(grid, frameGridProperties);

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

let recordGridCellPainter: RecordGridCellPainter | undefined; // singleton shared with all RecordGrid instantiations
