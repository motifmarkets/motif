import { Directive } from '@angular/core';
import { numberToPixels, SettingsService } from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { AdaptedRevgrid } from '../adapted-revgrid';

@Directive()
export class AdaptedRevgridComponentNgDirective extends ContentComponentBaseNgDirective {
    destroyEventer: AdaptedRevgridComponentNgDirective.DestroyEventer;

    private _horizontalScrollbarWidth: number;
    private _horizontalScrollbarThumbWidth: number;
    private _verticalScrollbarWidth: number;
    private _verticalScrollbarThumbWidth: number;
    private _scrollbarThumbInactiveOpacity: number;
    private _scrollbarMargin: number;
    private _gridRightAligned: boolean;

    private _scrollbarThumbInactiveOpaqueSetTimeoutId: ReturnType<typeof setInterval> | undefined;
    private _scrollbarThumbInactiveOpaqueExtended = false;

    constructor(protected readonly _hostElement: HTMLElement, protected readonly _settingsService: SettingsService) {
        super();
    }

    get horizontalScrollbarHeight() { return this._horizontalScrollbarWidth; }
    get horizontalScrollbarThumbHeight() { return this._horizontalScrollbarThumbWidth; }
    get verticalScrollbarWidth() { return this._verticalScrollbarWidth; }
    get verticalScrollbarThumbWidth() { return this._verticalScrollbarThumbWidth; }
    get scrollbarThumbInactiveOpacity() { return this._scrollbarThumbInactiveOpacity; }
    get scrollbarMargin() { return this._scrollbarMargin; }
    get gridRightAligned() { return this._gridRightAligned; }

    get horizontalScrollbarMarginedHeight() { return this._horizontalScrollbarWidth + this._scrollbarMargin; }

    destroyGrid() {
        if (this._scrollbarThumbInactiveOpaqueSetTimeoutId !== undefined) {
            clearTimeout(this._scrollbarThumbInactiveOpaqueSetTimeoutId);
            // leave scrollbarThumbInactiveOpaqueSetTimeoutId undefined so no subsequent setTimeouts are called
        }
    }

    applySettings() {
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

    protected initialiseGridRightAlignedAndCtrlKeyMouseMoveEventer(
        grid: AdaptedRevgrid,
        frameGridProperties: AdaptedRevgrid.FrameGridProperties
    ) {
        grid.ctrlKeyMouseMoveEventer = () => this.handleCtrlKeyMouseMoveEvent();

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

export namespace AdaptedRevgridComponentNgDirective {
    export type DestroyEventer = (this: void) => void;
}

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
