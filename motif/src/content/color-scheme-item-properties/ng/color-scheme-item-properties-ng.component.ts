/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { isReadable as tinyColorIsReadable, readability as tinyColorReadability } from '@ctrl/tinycolor';
import { SettingsNgService } from 'src/component-services/ng-api';
import { CaptionLabelNgComponent, NumberInputNgComponent } from 'src/controls/ng-api';
import { ColorScheme, ColorSettings, NumberUiAction } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { delay1Tick, Integer } from 'src/sys/internal-api';
import { ColorSelectorNgComponent } from '../../color-selector/ng-api';

@Component({
    selector: 'app-color-scheme-item-properties',
    templateUrl: './color-scheme-item-properties-ng.component.html',
    styleUrls: ['./color-scheme-item-properties-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemeItemPropertiesNgComponent implements AfterViewInit, OnDestroy {
    @ViewChild('topDiv', { static: true }) private _topDiv: ElementRef;
    @ViewChild('bkgdColorSelector', { static: true }) private _bkgdColorSelector: ColorSelectorNgComponent;
    @ViewChild('foreColorSelector', { static: true }) private _foreColorSelector: ColorSelectorNgComponent;
    @ViewChild('readabilityLabel', { static: true }) private _readabilityLabel: CaptionLabelNgComponent;
    @ViewChild('readabilityInput', { static: true }) private _readabilityInput: NumberInputNgComponent;

    itemChangedEvent: ColorSchemeItemPropertiesComponent.ItemChangedEvent;

    public hasBkgd = true;
    public hasFore = true;

    private _colorSettings: ColorSettings;
    private _readabilityUiAction: NumberUiAction;

    private _itemId: ColorScheme.ItemId | undefined;
    private _width: Integer;

    constructor(private _cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        this._colorSettings = settingsNgService.settingsService.color;

        this._readabilityUiAction = this.createReadbilityUiAction();
    }

    get width() { return this._width; }

    ngAfterViewInit() {
        this._bkgdColorSelector.bkdgFore = ColorScheme.BkgdForeId.Bkgd;
        this._bkgdColorSelector.position = ColorSelectorNgComponent.Position.Top;
        this._bkgdColorSelector.itemChangedEvent = (itemId) => this.handleItemChangedEvent(itemId);
        this._foreColorSelector.bkdgFore = ColorScheme.BkgdForeId.Fore;
        this._foreColorSelector.position = ColorSelectorNgComponent.Position.Bottom;
        this._foreColorSelector.itemChangedEvent = (itemId) => this.handleItemChangedEvent(itemId);

        this._width = this._topDiv.nativeElement.offsetWidth;

        delay1Tick(() => this.setUiActions());
    }

    ngOnDestroy() {
        this.finalise();
    }

    get itemId() { return this._itemId; }
    set itemId(value: ColorScheme.ItemId | undefined) {
        this._itemId = value;
        let hasBkgd: boolean;
        let hasFore: boolean;
        if (this._itemId === undefined) {
            hasBkgd = false;
            hasFore = false;
        } else {
            hasBkgd = ColorScheme.Item.idHasBkgd(this._itemId);
            hasFore = ColorScheme.Item.idHasFore(this._itemId);
        }

        let checkRequired = false;
        if (hasBkgd !== this.hasBkgd) {
            this.hasBkgd = hasBkgd;
            checkRequired = true;
        }

        if (hasFore !== this.hasFore) {
            this.hasFore = hasFore;
            checkRequired = true;
        }

        if (checkRequired) {
            this.markForCheck();
        }

        this._bkgdColorSelector.itemId = value;
        this._foreColorSelector.itemId = value;

        this.updateReadability();
    }

    processSettingsChanged() {
        this._bkgdColorSelector.processSettingsChanged();
        this._foreColorSelector.processSettingsChanged();
        this.updateReadability();
    }

    private handleItemChangedEvent(itemId: ColorScheme.ItemId) {
        this.itemChangedEvent(itemId);
        this.updateReadability();
    }

    private markForCheck() {
        this._cdr.markForCheck();
    }

    private createReadbilityUiAction() {
        const action = new NumberUiAction();
        action.pushTitle(Strings[StringId.ColorItemProperties_ReadabilityTitle]);
        action.pushCaption(Strings[StringId.ColorItemProperties_ReadabilityCaption]);
        action.pushReadonly();
        return action;
    }

    private setUiActions() {
        this._readabilityLabel.initialise(this._readabilityUiAction);
        this._readabilityInput.initialise(this._readabilityUiAction);
    }

    private updateReadability() {
        if (this._itemId === undefined) {
            this._readabilityUiAction.pushDisabled();
            this._readabilityUiAction.pushValue(undefined);
        } else {
            if (!this.hasBkgd || !this.hasFore) {
                this._readabilityUiAction.pushDisabled();
                this._readabilityUiAction.pushValue(undefined);
            } else {
                const resolvedBkgdColor = this._colorSettings.getBkgd(this._itemId);
                const resolvedForeColor = this._colorSettings.getFore(this._itemId);
                const value = tinyColorReadability(resolvedBkgdColor, resolvedForeColor);
                this._readabilityUiAction.pushValue(value);

                const isReadable = tinyColorIsReadable(resolvedBkgdColor, resolvedForeColor);
                if (isReadable) {
                    this._readabilityUiAction.pushReadonly();
                } else {
                    this._readabilityUiAction.pushError(Strings[StringId.NotReadable]);
                }
            }
        }
    }

    private finalise() {
        this._readabilityUiAction.finalise();
    }
}

export namespace ColorSchemeItemPropertiesComponent {
    export type ItemChangedEvent = (itemId: ColorScheme.ItemId) => void;
}
