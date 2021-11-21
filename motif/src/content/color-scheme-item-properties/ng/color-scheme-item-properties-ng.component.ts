/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { isReadable as tinyColorIsReadable, readability as tinyColorReadability } from '@ctrl/tinycolor';
import { SettingsNgService } from 'src/component-services/ng-api';
import { MultiColorPickerNgComponent } from 'src/content/multi-color-picker/ng/multi-color-picker-ng.component';
import { CaptionedRadioNgComponent, CaptionLabelNgComponent, NumberInputNgComponent } from 'src/controls/ng-api';
import { ColorScheme, ColorSettings, EnumUiAction, ExplicitElementsEnumUiAction, NumberUiAction } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { delay1Tick, EnumInfoOutOfOrderError, Integer, UnreachableCaseError } from 'src/sys/internal-api';
import { ColorControlsNgComponent } from '../../color-controls/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-color-scheme-item-properties',
    templateUrl: './color-scheme-item-properties-ng.component.html',
    styleUrls: ['./color-scheme-item-properties-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSchemeItemPropertiesNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('bkgdControls', { static: true }) private _bkgdControls: ColorControlsNgComponent;
    @ViewChild('multiPicker', { static: true }) private _multiPicker: MultiColorPickerNgComponent;
    @ViewChild('foreControls', { static: true }) private _foreControls: ColorControlsNgComponent;
    @ViewChild('readabilityLabel', { static: true }) private _readabilityLabel: CaptionLabelNgComponent;
    @ViewChild('readabilityControl', { static: true }) private _readabilityInput: NumberInputNgComponent;
    @ViewChild('hueSaturationRadio', { static: true }) private _hueSaturationRadio: CaptionedRadioNgComponent;
    @ViewChild('valueSaturationRadio', { static: true }) private _valueSaturationRadio: CaptionedRadioNgComponent;

    itemChangedEvent: ColorSchemeItemPropertiesComponent.ItemChangedEvent;

    public hasBkgd = true;
    public hasFore = true;

    private _colorSettings: ColorSettings;
    private _readabilityUiAction: NumberUiAction;
    private _pickerTypeUiAction: ExplicitElementsEnumUiAction;

    private _itemId: ColorScheme.ItemId | undefined;
    private _width: Integer;

    constructor(private _cdr: ChangeDetectorRef, private readonly _hostElementRef: ElementRef, settingsNgService: SettingsNgService) {
        super();

        this._colorSettings = settingsNgService.settingsService.color;

        this._readabilityUiAction = this.createReadbilityUiAction();
        this._pickerTypeUiAction = this.createPickerTypeUiAction();
    }

    get approximateWidth() { return this._multiPicker.approximateWidth; }

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

        this._bkgdControls.itemId = value;
        this._foreControls.itemId = value;

        this.updateReadability();
    }

    ngAfterViewInit() {
        this._bkgdControls.bkdgFore = ColorScheme.BkgdForeId.Bkgd;
        this._bkgdControls.position = ColorControlsNgComponent.Position.Top;
        this._bkgdControls.itemChangedEventer = (itemId) => this.handleItemChangedEvent(itemId);
        this._bkgdControls.colorInternallyChangedEventer = (rgb) => this._multiPicker.setColor(ColorScheme.BkgdForeId.Bkgd, rgb);
        this._bkgdControls.requestActiveInPickerEventer = () => this._multiPicker.requestActive(ColorScheme.BkgdForeId.Bkgd);
        this._bkgdControls.hideInPickerChangedEventer = (hide) => this._multiPicker.setHide(ColorScheme.BkgdForeId.Bkgd, hide);

        this._foreControls.bkdgFore = ColorScheme.BkgdForeId.Fore;
        this._foreControls.position = ColorControlsNgComponent.Position.Bottom;
        this._foreControls.itemChangedEventer = (itemId) => this.handleItemChangedEvent(itemId);
        this._foreControls.colorInternallyChangedEventer = (rgb) => this._multiPicker.setColor(ColorScheme.BkgdForeId.Fore, rgb);
        this._foreControls.requestActiveInPickerEventer = () => this._multiPicker.requestActive(ColorScheme.BkgdForeId.Fore);
        this._foreControls.hideInPickerChangedEventer = (hide) => this._multiPicker.setHide(ColorScheme.BkgdForeId.Fore, hide);

        this._multiPicker.inputChangeEventer = (backForeId, rgb) => {
            switch (backForeId) {
                case ColorScheme.BkgdForeId.Bkgd:
                    this._bkgdControls.setColor(rgb);
                    break;
                case ColorScheme.BkgdForeId.Fore:
                    this._foreControls.setColor(rgb);
                    break;
                default:
                    throw new UnreachableCaseError('CSIPNCNAVI67723', backForeId);
            }
        };

        this._multiPicker.activeChangedEventer = (backForeId) => {
            this._bkgdControls.setActiveInPicker(backForeId === ColorScheme.BkgdForeId.Bkgd);
            this._foreControls.setActiveInPicker(backForeId === ColorScheme.BkgdForeId.Fore);
        };

        this._pickerTypeUiAction.pushValue(this._multiPicker.pickerType);

        delay1Tick(() => this.initialiseControls());
    }

    ngOnDestroy() {
        this.finalise();
    }

    processSettingsChanged() {
        this._bkgdControls.processSettingsChanged();
        this._foreControls.processSettingsChanged();
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
        action.pushTitle(Strings[StringId.ColorSchemeItemProperties_ReadabilityTitle]);
        action.pushCaption(Strings[StringId.ColorSchemeItemProperties_ReadabilityCaption]);
        action.pushReadonly();
        return action;
    }

    private createPickerTypeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ColorSchemeItemProperties_PickerTypeCaption]);
        action.pushTitle(Strings[StringId.ColorSchemeItemProperties_PickerTypeTitle]);

        const entryCount = ColorSchemeItemPropertiesComponent.PickerType.idCount;
        const elementPropertiesArray = new Array<EnumUiAction.ElementProperties>(entryCount);
        for (let id = 0; id < entryCount; id++) {
            elementPropertiesArray[id] = {
                element: id,
                caption: ColorSchemeItemPropertiesComponent.PickerType.idToCaption(id),
                title: ColorSchemeItemPropertiesComponent.PickerType.idToTitle(id),
            };
        }

        action.pushElements(elementPropertiesArray);
        action.commitEvent = () => { this._multiPicker.pickerType = this._pickerTypeUiAction.definedValue; };
        return action;
    }

    private initialiseControls() {
        this._readabilityLabel.initialise(this._readabilityUiAction);
        this._readabilityInput.initialise(this._readabilityUiAction);
        this._readabilityInput.readonlyAlways = true;
        this._hueSaturationRadio.initialiseEnum(this._pickerTypeUiAction, MultiColorPickerNgComponent.PickerTypeId.HueSaturation);
        this._valueSaturationRadio.initialiseEnum(this._pickerTypeUiAction, MultiColorPickerNgComponent.PickerTypeId.ValueSaturation);
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
        this._pickerTypeUiAction.finalise();
    }
}

export namespace ColorSchemeItemPropertiesComponent {
    export type ItemChangedEvent = (itemId: ColorScheme.ItemId) => void;

    export namespace PickerType {
        type Id = MultiColorPickerNgComponent.PickerTypeId;

        interface Info {
            readonly id: Id;
            readonly captionId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof MultiColorPickerNgComponent.PickerTypeId]: Info };

        const infosObject: InfosObject = {
            HueSaturation: {
                id: MultiColorPickerNgComponent.PickerTypeId.HueSaturation,
                captionId: StringId.ColorSchemeItemProperties_HueSaturationCaption,
                titleId: StringId.ColorSchemeItemProperties_HueSaturationTitle,
            },
            ValueSaturation: {
                id: MultiColorPickerNgComponent.PickerTypeId.ValueSaturation,
                captionId: StringId.ColorSchemeItemProperties_ValueSaturationCaption,
                titleId: StringId.ColorSchemeItemProperties_ValueSaturationTitle,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                if (infos[i].id !== i) {
                    throw new EnumInfoOutOfOrderError('ColorSchemeItemPropertiesComponent.PickerType', i, idToCaption(i));
                }
            }
        }

        function idToCaptionId(id: Id) {
            return infos[id].captionId;
        }

        export function idToCaption(id: Id) {
            return Strings[idToCaptionId(id)];
        }

        function idToTitleId(id: Id) {
            return infos[id].titleId;
        }

        export function idToTitle(id: Id) {
            return Strings[idToTitleId(id)];
        }
    }
}
