import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import { GridProperties } from 'revgrid';
import { AdaptedRevgrid } from '../../adapted-revgrid';
import { AdaptedRevgridComponentNgDirective } from '../../ng/adapted-revgrid-component-ng.directive';
import { SimpleGrid } from '../simple-grid';
import { SimpleGridCellPainter } from '../simple-grid-cell-painter';

@Component({
    selector: 'app-simple-grid',
    templateUrl: './simple-grid-ng.component.html',
    styleUrls: ['./simple-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class SimpleGridNgComponent extends AdaptedRevgridComponentNgDirective implements OnDestroy, SimpleGrid.ComponentAccess {
    private readonly _cellPainter: SimpleGridCellPainter;

    private _grid: SimpleGrid;

    constructor(elRef: ElementRef, settingsNgService: SettingsNgService) {
        const settingsService = settingsNgService.settingsService;
        super(elRef.nativeElement, settingsService);

        if (simpleGridCellPainter === undefined) {
            simpleGridCellPainter = new SimpleGridCellPainter(settingsService);
        }
        this._cellPainter = simpleGridCellPainter;

        this.applySettings();
    }

    get grid() { return this._grid; }

    ngOnDestroy() {
        if (this.destroyEventer !== undefined) {
            this.destroyEventer();
        }
    }

    createGrid(frameGridProperties: AdaptedRevgrid.FrameGridProperties) {
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
            halign: 'left',
            ...AdaptedRevgrid.createGridPropertiesFromSettings(this._settingsService, frameGridProperties, undefined),
        };

        this._grid = new SimpleGrid(
            this,
            this._settingsService,
            this._hostElement,
            this._cellPainter,
            gridProperties,
        );

        this.initialiseGridRightAlignedAndCtrlKeyMouseMoveEventer(this._grid, frameGridProperties);

        return this._grid;
    }

    override destroyGrid() {
        super.destroyGrid();

        if (this._grid !== undefined) {
            this._grid.destroy();
        }
    }

}

let simpleGridCellPainter: SimpleGridCellPainter; // singleton shared with all RecordGrid instantiations
