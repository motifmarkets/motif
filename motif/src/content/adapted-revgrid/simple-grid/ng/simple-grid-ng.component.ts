import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { SettingsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { GridSettings } from 'revgrid';
import { AdaptedRevgrid } from '../../adapted-revgrid';
import { AdaptedRevgridComponentNgDirective } from '../../ng/adapted-revgrid-component-ng.directive';
import { SimpleGrid } from '../simple-grid';
import { SimpleGridTextCellPainter } from '../simple-grid-text-cell-painter';

@Component({
    selector: 'app-simple-grid',
    templateUrl: './simple-grid-ng.component.html',
    styleUrls: ['./simple-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class SimpleGridNgComponent extends AdaptedRevgridComponentNgDirective implements OnDestroy, SimpleGrid.ComponentAccess {
    private readonly _cellPainter: SimpleGridTextCellPainter;

    private _grid: SimpleGrid | undefined;

    constructor(elRef: ElementRef<HTMLElement>, settingsNgService: SettingsNgService, textFormatterNgService: TextFormatterNgService) {
        const settingsService = settingsNgService.settingsService;
        super(elRef.nativeElement, settingsService);

        if (simpleGridCellPainter === undefined) {
            simpleGridCellPainter = new SimpleGridTextCellPainter(settingsService, textFormatterNgService.service);
        }
        this._cellPainter = simpleGridCellPainter;

        this.applySettings();
    }

    ngOnDestroy() {
        if (this.destroyEventer !== undefined) {
            this.destroyEventer();
        }
    }

    createGrid(frameGridSettings: AdaptedRevgrid.FrameGridSettings) {
        this.destroyGrid(); // Can only have one grid so destroy previous one if it exists

        const gridSettings: Partial<GridSettings> = {
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
            ...frameGridSettings,
            ...AdaptedRevgrid.createSettingsServiceGridSettings(this._settingsService, frameGridSettings, undefined),
        };

        const grid = new SimpleGrid(
            this,
            this._settingsService,
            this._hostElement,
            this._cellPainter,
            gridSettings,
        );

        this._grid = grid;

        this.initialiseGridRightAlignedAndCtrlKeyMouseMoveEventer(grid, frameGridSettings);

        return grid;
    }

    override destroyGrid() {
        super.destroyGrid();

        if (this._grid !== undefined) {
            this._grid.destroy();
        }
    }

}

let simpleGridCellPainter: SimpleGridTextCellPainter | undefined; // singleton shared with all RecordGrid instantiations
