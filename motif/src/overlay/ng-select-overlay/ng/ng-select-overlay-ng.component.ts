/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { AssertInternalError, ColorScheme, ColorSettings, delay1Tick, HtmlTypes, MultiEvent, numberToPixels, SettingsService } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { NgSelectUtils } from 'controls-internal-api';
import { NgSelectOverlayNgService } from 'controls-ng-api';
import { OverlayComponentBaseNgDirective } from '../../ng/overlay-component-base-ng.directive';

@Component({
    selector: 'app-ng-select-overlay',
    templateUrl: './ng-select-overlay-ng.component.html',
    styleUrls: ['./ng-select-overlay-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NgSelectOverlayNgComponent extends OverlayComponentBaseNgDirective implements OnDestroy {
    @ViewChild('measureCanvas', { static: true }) private _measureCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('measureBoldCanvas', { static: true }) private _measureBoldCanvas: ElementRef<HTMLCanvasElement>;

    private readonly _element: HTMLElement;
    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _measureBoldCanvasContext: CanvasRenderingContext2D;

    private _firstColumnWidth: number | undefined;
    private _dropDownPanelClientWidth: number | undefined;

    private _scrollHostCollection: HTMLCollectionOf<Element> | undefined;

    constructor(
        private readonly _ngSelectOverlayNgService: NgSelectOverlayNgService,
        elementRef: ElementRef,
        settingsNgService: SettingsNgService
    ) {
        super();

        this._element = elementRef.nativeElement;
        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
        this._colorSettings = this._settingsService.color;
        this._ngSelectOverlayNgService.dropDownPanelClientWidthEvent =
            (width, widenOnly) => this.handleNgSelectDropDownPanelClientWidthEvent(width, widenOnly);
        this._ngSelectOverlayNgService.firstColumnWidthEvent =
            (width, widenOnly) => this.handleNgSelectFirstColumnWidthEvent(width, widenOnly);
        this._ngSelectOverlayNgService.dropDownOpenEvent = () => this.handleDropDownOpenEvent();

        this._scrollHostCollection = this._element.getElementsByClassName('scroll-host');
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
    }

    updateMeasure(fontFamily: string, fontSize: string) {
        const measureCanvasContext = this._measureCanvas.nativeElement.getContext('2d');
        const measureBoldCanvasContext = this._measureBoldCanvas.nativeElement.getContext('2d');
        if (measureCanvasContext === null || measureBoldCanvasContext === null) {
            throw new AssertInternalError('BPPCSM552833777');
        } else {
            const fontParts = new Array<string>(2);
            fontParts[0] = fontSize;
            fontParts[1] = fontFamily;
            measureCanvasContext.font = fontParts.join(' ');
            this._measureCanvasContext = measureCanvasContext;

            const boldFontParts = new Array<string>(3);
            boldFontParts[0] = HtmlTypes.FontWeight.Bold;
            boldFontParts[1] = fontSize;
            boldFontParts[2] = fontFamily;
            measureBoldCanvasContext.font = boldFontParts.join(' ');
            this._measureBoldCanvasContext = measureBoldCanvasContext;

            this._firstColumnWidth = undefined;
            this._dropDownPanelClientWidth = undefined;

            this._ngSelectOverlayNgService.setMeasureCanvasContexts(this._measureCanvasContext, this._measureBoldCanvasContext);
        }
    }

    private handleSettingsChangedEvent() {
        const foreColor = this._colorSettings.getFore(ColorScheme.ItemId.TextControl);
        const bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.TextControl);
        NgSelectUtils.ApplyColors(this._element, foreColor, bkgdColor);
    }

    private handleDropDownOpenEvent() {
        this._firstColumnWidth = undefined;
        this._dropDownPanelClientWidth = undefined;
    }

    private handleNgSelectDropDownPanelClientWidthEvent(clientWidth: number, widenOnly: boolean) {
        const apply = this._dropDownPanelClientWidth === undefined
            || (clientWidth !== this._dropDownPanelClientWidth && (!widenOnly || clientWidth > this._dropDownPanelClientWidth));

        if (apply) {
            this._dropDownPanelClientWidth = clientWidth;

            let scrollbarWidth = NgSelectOverlayNgComponent.scrollbarWidth;
            if (scrollbarWidth === undefined) {
                scrollbarWidth = 30; // a guess as to scrollbar width
            }
            const offsetWidth = clientWidth + scrollbarWidth + NgSelectOverlayNgComponent.dropDownBordersWidth; // allow for border
            const offsetWidthPixels = numberToPixels(offsetWidth);
            this._element.style.setProperty('--ngSelectDropDownPanelWidth', offsetWidthPixels);

        }

        this.checkCalculateScrollbarWidth();
    }

    private handleNgSelectFirstColumnWidthEvent(width: number, widenOnly: boolean) {
        const apply = this._firstColumnWidth === undefined
            || (width !== this._firstColumnWidth && (!widenOnly || width > this._firstColumnWidth));
        if (apply) {
            this._firstColumnWidth = width;
            const widthPixels = numberToPixels(width);
            this._element.style.setProperty('--ngSelectBoldFirstColumnWidth', widthPixels);
        }
    }

    private checkCalculateScrollbarWidth() {
        if (NgSelectOverlayNgComponent.scrollbarWidth === undefined) {
            delay1Tick(() => {
                if (this._scrollHostCollection !== undefined && this._scrollHostCollection.length > 0) {
                    const scrollHost = this._scrollHostCollection[0] as HTMLElement;
                    const currentClientWidth = scrollHost.clientWidth;
                    const currentOffsetWidth = scrollHost.offsetWidth;
                    if (currentClientWidth > 0 && currentOffsetWidth > currentClientWidth) {
                        NgSelectOverlayNgComponent.scrollbarWidth = currentOffsetWidth - currentClientWidth;
                        this._scrollHostCollection = undefined;
                    }
                }
            });
        }
    }
}

export namespace NgSelectOverlayNgComponent {
    export let scrollbarWidth: number;
    export const dropDownBordersWidth = 4;
}
