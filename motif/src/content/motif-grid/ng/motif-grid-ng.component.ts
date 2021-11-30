import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { numberToPixels, SettingsService } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { GridProperties, RevRecordStore } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { MotifGrid } from '../motif-grid';
import { MotifGridCellPainter } from '../motif-grid-cell-painter';

@Component({
    selector: 'app-motif-grid',
    templateUrl: './motif-grid-ng.component.html',
    styleUrls: ['./motif-grid-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class MotifGridNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    destroyEventer: MotifGridNgComponent.DestroyEventer;

    private readonly _hostElement: HTMLElement;
    private readonly _settingsService: SettingsService;
    private readonly _cellPainter: MotifGridCellPainter;

    private _grid: MotifGrid;

    private _horizontalScrollbarWidth: number;
    private _horizontalScrollbarThumbWidth: number;
    private _verticalScrollbarWidth: number;
    private _verticalScrollbarThumbWidth: number;
    private _scrollbarThumbInactiveOpacity: number;
    private _scrollbarMargin: number;
    private _gridRightAligned: boolean;

    private _scrollbarThumbInactiveOpaqueSetTimeoutId: ReturnType<typeof setInterval> | undefined;
    private _scrollbarThumbInactiveOpaqueExtended = false;

    constructor(elRef: ElementRef, settingsNgService: SettingsNgService) {
        super();

        this._hostElement = elRef.nativeElement;
        this._settingsService = settingsNgService.settingsService;

        if (motifGridCellPainter === undefined) {
            motifGridCellPainter = new MotifGridCellPainter(this._settingsService);
        }
        this._cellPainter = motifGridCellPainter;

        this.applySettings();
    }

    get grid() { return this._grid; }
    get horizontalScrollbarHeight() { return this._horizontalScrollbarWidth; }
    get horizontalScrollbarThumbHeight() { return this._horizontalScrollbarThumbWidth; }
    get verticalScrollbarWidth() { return this._verticalScrollbarWidth; }
    get verticalScrollbarThumbWidth() { return this._verticalScrollbarThumbWidth; }
    get scrollbarThumbInactiveOpacity() { return this._scrollbarThumbInactiveOpacity; }
    get scrollbarMargin() { return this._scrollbarMargin; }
    get gridRightAligned() { return this._gridRightAligned; }

    get horizontalScrollbarMarginedHeight() { return this._horizontalScrollbarWidth + this._scrollbarMargin; }

    ngOnDestroy() {
        if (this.destroyEventer !== undefined) {
            this.destroyEventer();
        }
    }

    createGrid(recordStore: RevRecordStore, frameGridProperties: MotifGrid.FrameGridProperties) {
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
            ...MotifGrid.createGridPropertiesFromSettings(this._settingsService, frameGridProperties, undefined),
        };

        this._grid = new MotifGrid(
            this._settingsService,
            this._hostElement,
            recordStore,
            this._cellPainter,
            gridProperties,
        );

        this._grid.ctrlKeyMouseMoveEventer = () => this.handleCtrlKeyMouseMoveEvent();

        const newGridRightAligned = frameGridProperties.gridRightAligned;
        if (newGridRightAligned !== undefined && newGridRightAligned !== this._gridRightAligned) {
            this._gridRightAligned = newGridRightAligned;
            if (newGridRightAligned) {
                this._hostElement.style.setProperty(CssVar.verticalScrollbarLeft, 'revert');
                this._hostElement.style.setProperty(CssVar.verticalScrollbarRight, 'null');
            } else {
                this._hostElement.style.setProperty(CssVar.verticalScrollbarLeft, 'null');
                this._hostElement.style.setProperty(CssVar.verticalScrollbarRight, 'revert');
            }
        }

        this._grid.settingsChangedEventer = () => this.applySettings();

        return this._grid;
    }

    destroyGrid() {
        if (this._scrollbarThumbInactiveOpaqueSetTimeoutId !== undefined) {
            clearTimeout(this._scrollbarThumbInactiveOpaqueSetTimeoutId);
            // leave scrollbarThumbInactiveOpaqueSetTimeoutId undefined so no subsequent setTimeouts are called
        }

        if (this._grid !== undefined) {
            this._grid.settingsChangedEventer = undefined;
            this._grid.destroy();
        }
    }

    private applySettings() {
        // this._gridHostElement.style.setProperty(CssVar.scrollbarThumbColor, colorSettings.getFore(settings.scrollbar));
        // this._gridHostElement.style.setProperty(CssVar.scrollbarThumbShadowColor, colors.scrollbarThumbShadowColor);
        const coreSettings = this._settingsService.core;

        const newHorizontalScrollbarWidth = coreSettings.grid_HorizontalScrollbarWidth;
        if (newHorizontalScrollbarWidth !== this._horizontalScrollbarWidth) {
            this._horizontalScrollbarWidth = newHorizontalScrollbarWidth;
            this._hostElement.style.setProperty(CssVar.horizontalScrollbarWidth, numberToPixels(newHorizontalScrollbarWidth));
        }

        let newHorizontalScrollbarThumbWidth: number;
        if (newHorizontalScrollbarWidth < 11) {
            newHorizontalScrollbarThumbWidth = newHorizontalScrollbarWidth;
        } else {
            newHorizontalScrollbarThumbWidth = newHorizontalScrollbarWidth - 4;
        }
        if (newHorizontalScrollbarThumbWidth !== this._horizontalScrollbarThumbWidth) {
            this._horizontalScrollbarThumbWidth = newHorizontalScrollbarThumbWidth;
            this._hostElement.style.setProperty(CssVar.horizontalScrollbarThumbWidth, numberToPixels(newHorizontalScrollbarThumbWidth));
        }

        const newVerticalScrollbarWidth = coreSettings.grid_VerticalScrollbarWidth;
        if (newVerticalScrollbarWidth !== this._verticalScrollbarWidth) {
            this._verticalScrollbarWidth = newVerticalScrollbarWidth;
            this._hostElement.style.setProperty(CssVar.verticalScrollbarWidth, numberToPixels(newVerticalScrollbarWidth));
        }

        let newVerticalScrollbarThumbWidth: number;
        if (newHorizontalScrollbarWidth < 11) {
            newVerticalScrollbarThumbWidth = newHorizontalScrollbarWidth;
        } else {
            newVerticalScrollbarThumbWidth = newHorizontalScrollbarWidth - 4;
        }
        if (newVerticalScrollbarThumbWidth !== this._verticalScrollbarThumbWidth) {
            this._verticalScrollbarThumbWidth = newVerticalScrollbarThumbWidth;
            this._hostElement.style.setProperty(CssVar.verticalScrollbarThumbWidth, numberToPixels(newVerticalScrollbarThumbWidth));
        }

        const newScrollbarMargin = coreSettings.grid_ScrollbarMargin;
        if (newScrollbarMargin !== undefined && newScrollbarMargin !== this._scrollbarMargin) {
            this._scrollbarMargin = newScrollbarMargin;
            this._hostElement.style.setProperty(CssVar.scrollbarMargin, numberToPixels(newScrollbarMargin));
        }

        const newScrollbarThumbInactiveOpacity = coreSettings.grid_ScrollbarThumbInactiveOpacity;
        if (newScrollbarThumbInactiveOpacity !== undefined && newScrollbarThumbInactiveOpacity !== this._scrollbarThumbInactiveOpacity) {
            this._scrollbarThumbInactiveOpacity = newScrollbarThumbInactiveOpacity;
            this._hostElement.style.setProperty(CssVar.scrollbarThumbInactiveOpacity, newScrollbarThumbInactiveOpacity.toString());
        }
    }

    private handleCtrlKeyMouseMoveEvent() {
        if (this._scrollbarThumbInactiveOpaqueSetTimeoutId !== undefined) {
            this._scrollbarThumbInactiveOpaqueExtended = true;
        } else {
            this.temporarilySetScrollbarThumbInactiveOpaque();
        }
    }

    private temporarilySetScrollbarThumbInactiveOpaque() {
        this._hostElement.style.setProperty(CssVar.scrollbarThumbInactiveOpacity, '1');
        this._scrollbarThumbInactiveOpaqueSetTimeoutId = setTimeout(() => {
            this._scrollbarThumbInactiveOpaqueSetTimeoutId = undefined;
            if (this._scrollbarThumbInactiveOpaqueExtended) {
                this._scrollbarThumbInactiveOpaqueExtended = false;
                this.temporarilySetScrollbarThumbInactiveOpaque();
            } else {
                this._hostElement.style.setProperty(CssVar.scrollbarThumbInactiveOpacity,
                    this._settingsService.core.grid_ScrollbarThumbInactiveOpacity.toString()
                );
            }
        }, 250);
    }
}

export namespace MotifGridNgComponent {
    export type DestroyEventer = (this: void) => void;
}

let motifGridCellPainter: MotifGridCellPainter; // singleton shared with all grids

namespace CssVar {
    export const scrollbarThumbColor = '--scrollbar-thumb-color';
    export const scrollbarThumbInactiveOpacity = '--scrollbar-thumb-inactive-opacity';
    export const verticalScrollbarLeft = '--vertical-scrollbar-left';
    export const verticalScrollbarRight = '--vertical-scrollbar-right';
    export const verticalScrollbarWidth = '--vertical-scrollbar-width';
    export const verticalScrollbarThumbWidth = '--vertical-scrollbar-thumb-width';
    export const horizontalScrollbarTop = '--horizontal-scrollbar-top';
    export const horizontalScrollbarBottom = '--horizontal-scrollbar-bottom';
    export const horizontalScrollbarWidth = '--horizontal-scrollbar-width';
    export const horizontalScrollbarThumbWidth = '--horizontal-scrollbar-thumb-width';
    export const scrollbarMargin = '--scrollbar-margin';
}
