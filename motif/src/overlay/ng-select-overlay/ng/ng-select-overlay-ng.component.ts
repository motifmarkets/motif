/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { NgSelectUtils } from 'src/controls/internal-api';
import { NgSelectOverlayNgService } from 'src/controls/ng-api';
import { ColorScheme, ColorSettings, SettingsService } from 'src/core/internal-api';
import { AssertInternalError, MultiEvent } from 'src/sys/internal-api';

@Component({
    selector: 'app-ng-select-overlay',
    templateUrl: './ng-select-overlay-ng.component.html',
    styleUrls: ['./ng-select-overlay-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NgSelectOverlayNgComponent implements OnDestroy {
    @ViewChild('measureCanvas', { static: true }) private _measureCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('measureBoldCanvas', { static: true }) private _measureBoldCanvas: ElementRef<HTMLCanvasElement>;

    private _settingsService: SettingsService;
    private _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _measureBoldCanvasContext: CanvasRenderingContext2D;

    constructor(
        private _placeHolderService: NgSelectOverlayNgService,
        private _elementRef: ElementRef,
        settingsNgService: SettingsNgService
    ) {
        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
        this._colorSettings = this._settingsService.color;
        this._placeHolderService.dropDownPanelWidthEvent = (width) => this.handleNgSelectDropDownPanelWidthEvent(width);
        this._placeHolderService.firstColumnWidthEvent = (width) => this.handleNgSelectFirstColumnWidthEvent(width);
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
            boldFontParts[0] = 'bold';
            boldFontParts[1] = fontSize;
            boldFontParts[2] = fontFamily;
            measureBoldCanvasContext.font = boldFontParts.join(' ');
            this._measureBoldCanvasContext = measureBoldCanvasContext;

            this._placeHolderService.setMeasureCanvasContexts(this._measureCanvasContext, this._measureBoldCanvasContext);
        }
    }

    private handleSettingsChangedEvent() {
        const foreColor = this._colorSettings.getFore(ColorScheme.ItemId.TextControl);
        const bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.TextControl);
        NgSelectUtils.ApplyColors(this._elementRef.nativeElement, foreColor, bkgdColor);
    }

    private handleNgSelectDropDownPanelWidthEvent(width: string) {
        this._elementRef.nativeElement.style.setProperty('--ngSelectDropDownPanelWidth', width);
    }

    private handleNgSelectFirstColumnWidthEvent(width: string) {
        this._elementRef.nativeElement.style.setProperty('--ngSelectBoldFirstColumnWidth', width);
    }
}
