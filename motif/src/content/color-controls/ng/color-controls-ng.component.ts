/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    HostListener,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { TinyColor } from '@ctrl/tinycolor';
import { CommandRegisterNgService, SettingsNgService } from 'src/component-services/ng-api';
import {
    CaptionedCheckboxNgComponent,
    CaptionedRadioNgComponent,
    CaptionLabelNgComponent,
    IntegerTextInputNgComponent,
    NumberInputNgComponent,
    SvgButtonNgComponent,
    TextInputNgComponent
} from 'src/controls/ng-api';
import {
    BooleanUiAction,
    ColorScheme,
    ColorSettings,
    CommandRegisterService,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    IconButtonUiAction,
    IntegerUiAction,
    InternalCommand,
    NumberUiAction,
    SettingsService,
    StringUiAction,
    UiAction
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { delay1Tick, EnumInfoOutOfOrderError, HtmlTypes, MultiEvent, RGB, UnreachableCaseError } from 'src/sys/internal-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';


@Component({
    selector: 'app-color-controls',
    templateUrl: './color-controls-ng.component.html',
    styleUrls: ['./color-controls-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorControlsNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @HostBinding('style.flex-direction') public flexDirection: string;

    @ViewChild('hideInPickerControl', { static: true }) private _hideInPickerControl: CaptionedCheckboxNgComponent;
    @ViewChild('inheritedRadio', { static: true }) private _inheritedRadio: CaptionedRadioNgComponent;
    @ViewChild('transparentRadio', { static: true }) private _transparentRadio: CaptionedRadioNgComponent;
    @ViewChild('opaqueRadio', { static: true }) private _opaqueRadio: CaptionedRadioNgComponent;
    @ViewChild('lightenButton', { static: true }) private _lightenButton: SvgButtonNgComponent;
    @ViewChild('darkenButton', { static: true }) private _darkenButton: SvgButtonNgComponent;
    @ViewChild('brightenButton', { static: true }) private _brightenButton: SvgButtonNgComponent;
    @ViewChild('complementButton', { static: true }) private _complementButton: SvgButtonNgComponent;
    @ViewChild('saturateButton', { static: true }) private _saturateButton: SvgButtonNgComponent;
    @ViewChild('desaturateButton', { static: true }) private _desaturateButton: SvgButtonNgComponent;
    @ViewChild('spinButton', { static: true }) private _spinButton: SvgButtonNgComponent;
    @ViewChild('copyButton', { static: true }) private _copyButton: SvgButtonNgComponent;
    @ViewChild('hexControl', { static: true }) private _hexControl: TextInputNgComponent;
    @ViewChild('redLabel', { static: true }) private _redLabel: CaptionLabelNgComponent;
    @ViewChild('redControl', { static: true }) private _redControl: IntegerTextInputNgComponent;
    @ViewChild('blueLabel', { static: true }) private _blueLabel: CaptionLabelNgComponent;
    @ViewChild('blueControl', { static: true }) private _blueControl: IntegerTextInputNgComponent;
    @ViewChild('greenLabel', { static: true }) private _greenLabel: CaptionLabelNgComponent;
    @ViewChild('greenControl', { static: true }) private _greenControl: IntegerTextInputNgComponent;
    @ViewChild('hueLabel', { static: true }) private _hueLabel: CaptionLabelNgComponent;
    @ViewChild('hueControl', { static: true }) private _hueControl: NumberInputNgComponent;
    @ViewChild('saturationLabel', { static: true }) private _saturationLabel: CaptionLabelNgComponent;
    @ViewChild('saturationControl', { static: true }) private _saturationControl: NumberInputNgComponent;
    @ViewChild('valueLabel', { static: true }) private _valueLabel: CaptionLabelNgComponent;
    @ViewChild('valueControl', { static: true }) private _valueControl: NumberInputNgComponent;

    itemChangedEventer: ColorControlsNgComponent.ItemChangedEventer;
    colorInternallyChangedEventer: ColorControlsNgComponent.ColorInternallyChangedEventer;
    requestActiveInPickerEventer: ColorControlsNgComponent.RequestActiveInPickerEventer;
    hideInPickerChangedEventer: ColorControlsNgComponent.HideInPickerChangedEventer;

    public activeInPickerIndicatorFontWeight: string;
    public heading: string;

    private _commandRegisterService: CommandRegisterService;

    private _hideInPickerUiAction: BooleanUiAction;
    private _itemColorTypeUiAction: EnumUiAction;
    private _lightenUiAction: IconButtonUiAction;
    private _darkenUiAction: IconButtonUiAction;
    private _brightenUiAction: IconButtonUiAction;
    private _complementUiAction: IconButtonUiAction;
    private _saturateUiAction: IconButtonUiAction;
    private _desaturateUiAction: IconButtonUiAction;
    private _spinUiAction: IconButtonUiAction;
    private _copyUiAction: IconButtonUiAction;
    private _hexUiAction: StringUiAction;
    private _redUiAction: IntegerUiAction;
    private _greenUiAction: IntegerUiAction;
    private _blueUiAction: IntegerUiAction;
    private _hueUiAction: NumberUiAction;
    private _saturationUiAction: NumberUiAction;
    private _valueUiAction: NumberUiAction;

    private _bkgdForeId: ColorScheme.BkgdForeId;
    private _position: ColorControlsNgComponent.Position;
    private _itemId: ColorScheme.ItemId | undefined;
    private _enabledItemId: ColorScheme.ItemId | undefined;
    private _tinyColor: TinyColor | undefined;
    private _activeInPicker = false;

    private _settingsService: SettingsService;
    private _colorSettings: ColorSettings;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        settingsNgService: SettingsNgService
    ) {
        super();

        this._commandRegisterService = commandRegisterNgService.service;
        this._settingsService = settingsNgService.settingsService;
        this._colorSettings = settingsNgService.settingsService.color;

        this._hideInPickerUiAction = this.createHideInPickerUiAction();
        this._itemColorTypeUiAction = this.createItemColorTypeUiAction();
        this._lightenUiAction = this.createLightenUiAction();
        this._darkenUiAction = this.createDarkenUiAction();
        this._brightenUiAction = this.createBrightenUiAction();
        this._complementUiAction = this.createComplementUiAction();
        this._saturateUiAction = this.createSaturateUiAction();
        this._desaturateUiAction = this.createDesaturateUiAction();
        this._spinUiAction = this.createSpinUiAction();
        this._copyUiAction = this.createCopyUiAction();
        this._hexUiAction = this.createHexUiAction();
        this._redUiAction = this.createRedUiAction();
        this._greenUiAction = this.createGreenUiAction();
        this._blueUiAction = this.createBlueUiAction();
        this._hueUiAction = this.createHueUiAction();
        this._saturationUiAction = this.createSaturationUiAction();
        this._valueUiAction = this.createValueUiAction();

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.processSettingsChanged());
    }

    get bkgdFore() { return this._bkgdForeId; }
    set bkdgFore(value: ColorScheme.BkgdForeId) {
        this._bkgdForeId = value;
        switch (this._bkgdForeId) {
            case ColorScheme.BkgdForeId.Bkgd:
                this.heading = Strings[StringId.BackgroundColor];
                break;
            case ColorScheme.BkgdForeId.Fore:
                this.heading = Strings[StringId.ForegroundColor];
                break;
            default:
                throw new UnreachableCaseError('CSCGBF5774209', this._bkgdForeId);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get position() { return this._position; }
    set position(value: ColorControlsNgComponent.Position) {
        this._position = value;
        switch (value) {
            case ColorControlsNgComponent.Position.Top:
                this.flexDirection = 'column-reverse';
                break;
            case ColorControlsNgComponent.Position.Bottom:
                this.flexDirection = 'column';
                break;
            default:
                throw new UnreachableCaseError('CSCSP19377530', value);
        }
        this.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get itemId() { return this._enabledItemId; }
    set itemId(value: ColorScheme.ItemId | undefined) {
        this._itemId = value;

        if (this._itemId === undefined || !ColorScheme.Item.idHas(this._itemId, this._bkgdForeId)) {
            this._enabledItemId = undefined;
            this._itemColorTypeUiAction.pushValue(ColorControlsNgComponent.ItemColorTypeId.Opaque);
            this._itemColorTypeUiAction.pushDisabled();

            this.setUiColor(undefined);

            this._lightenUiAction.pushDisabled();
            this._darkenUiAction.pushDisabled();
            this._brightenUiAction.pushDisabled();
            this._complementUiAction.pushDisabled();
            this._saturateUiAction.pushDisabled();
            this._desaturateUiAction.pushDisabled();
            this._spinUiAction.pushDisabled();
            this._copyUiAction.pushDisabled();
            this._hexUiAction.pushDisabled();
            this._redUiAction.pushDisabled();
            this._greenUiAction.pushDisabled();
            this._blueUiAction.pushDisabled();
            this._hueUiAction.pushDisabled();
            this._saturationUiAction.pushDisabled();
            this._valueUiAction.pushDisabled();
        } else {
            this._enabledItemId = this._itemId;
            const calculatedColor = this.calculateColor(this._itemId, this.bkdgFore);

            this._itemColorTypeUiAction.pushValue(calculatedColor.typeId);
            this._itemColorTypeUiAction.pushAccepted();

            const opaqueColor = calculatedColor.opaqueColor;
            if (opaqueColor === undefined) {
                this.setUiColor(undefined);
            } else {
                const tinyColor = new TinyColor(opaqueColor);
                this.setUiColor(tinyColor);
            }

            this._lightenUiAction.pushAccepted();
            this._darkenUiAction.pushAccepted();
            this._brightenUiAction.pushAccepted();
            this._complementUiAction.pushAccepted();
            this._saturateUiAction.pushAccepted();
            this._desaturateUiAction.pushAccepted();
            this._spinUiAction.pushAccepted();
            const otherBkgdForeId = ColorScheme.BkgdFore.getOther(this._bkgdForeId);
            if (ColorScheme.Item.idHas(this._enabledItemId, otherBkgdForeId)) {
                this._copyUiAction.pushAccepted();
            } else {
                this._copyUiAction.pushDisabled();
            }
            this._hexUiAction.pushAccepted();
            this._redUiAction.pushAccepted();
            this._greenUiAction.pushAccepted();
            this._blueUiAction.pushAccepted();
            this._hueUiAction.pushAccepted();
            this._saturationUiAction.pushAccepted();
            this._valueUiAction.pushAccepted();
        }
    }

    @HostListener('click') handleClickEvent() {
        if (this._enabledItemId !== undefined) {
            this.requestActiveInPickerEventer();
        }
    }

    @HostListener('focusin') handleFocusInEvent() {
        if (this._enabledItemId !== undefined) {
            this.requestActiveInPickerEventer();
        }
    }

    ngAfterViewInit() {
        delay1Tick(() => this.setUiActions());
    }

    ngOnDestroy() {
        this.finalise();
    }

    processSettingsChanged() {
        if (this._enabledItemId !== undefined) {
            const calculatedColor = this.calculateColor(this._enabledItemId, this.bkdgFore);
            const calculatedOpaqueColor = calculatedColor.opaqueColor;
            const calculatedTinyColor = calculatedOpaqueColor === undefined ? undefined : new TinyColor(calculatedOpaqueColor);
            this.setUiColor(calculatedTinyColor);
            this._itemColorTypeUiAction.pushValue(calculatedColor.typeId);
        }
        this.updateActiveIndicator();
    }

    setActiveInPicker(value: boolean) {
        this._activeInPicker = value;
        this.updateActiveIndicator();
    }

    setColor(value: RGB) {
        if (this._enabledItemId !== undefined) {
            const newTinyColor = new TinyColor(value);
            if (!newTinyColor.equals(this._tinyColor)) {
                const newColor = this.setUiColor(newTinyColor, false);
                this.setItemColor(this._enabledItemId, newColor);
            }
        }
    }

    private handleItemColorTypeCommitEvent(typeId: UiAction.CommitTypeId) {
        if (this._enabledItemId !== undefined) {
            const itemColorTypeId = this._itemColorTypeUiAction.definedValue;
            switch (itemColorTypeId) {
                case ColorControlsNgComponent.ItemColorTypeId.Inherited: {
                    this.setItemColor(this._enabledItemId, ColorScheme.schemeInheritColor);
                    break;
                }
                case ColorControlsNgComponent.ItemColorTypeId.Transparent: {
                    this.setItemColor(this._enabledItemId, ColorScheme.schemeTransparentColor);
                    break;
                }
                case ColorControlsNgComponent.ItemColorTypeId.Opaque: {
                    const color = this._colorSettings.getLastOpaqueItemColor(this._enabledItemId, this._bkgdForeId);
                    if (color !== undefined) {
                        this.setItemColor(this._enabledItemId, color);
                    }
                    break;
                }

            }
        }
    }

    private handleLightenSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._enabledItemId !== undefined) {
            const tinyColor = new TinyColor(this._tinyColor);
            let amount: number;
            if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                amount = 0.5;
            } else {
                if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Shift)) {
                    amount = 2.5;
                } else {
                    amount = 10;
                }
            }
            const newTinyColor = tinyColor.lighten(amount);
            const newColor = this.setUiColor(newTinyColor);
            this.setItemColor(this._enabledItemId, newColor);
        }
    }

    private handleDarkenSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._enabledItemId !== undefined) {
            const tinyColor = new TinyColor(this._tinyColor);
            let amount: number;
            if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                amount = 0.5;
            } else {
                if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                    amount = 2.5;
                } else {
                    amount = 10;
                }
            }
            const newTinyColor = tinyColor.darken(amount);
            const newColor = this.setUiColor(newTinyColor);
            this.setItemColor(this._enabledItemId, newColor);
        }
    }

    private handleBrightenSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._enabledItemId !== undefined) {
            const tinyColor = new TinyColor(this._tinyColor);
            let amount: number;
            if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                amount = 0.5;
            } else {
                if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                    amount = 2.5;
                } else {
                    amount = 10;
                }
            }
            const newTinyColor = tinyColor.brighten(amount);
            const newColor = this.setUiColor(newTinyColor);
            this.setItemColor(this._enabledItemId, newColor);
        }
    }

    private handleComplementSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._enabledItemId !== undefined) {
            const tinyColor = new TinyColor(this._tinyColor);
            const newTinyColor = tinyColor.complement();
            const newColor = this.setUiColor(newTinyColor);
            this.setItemColor(this._enabledItemId, newColor);
        }
    }

    private handleSaturateSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._enabledItemId !== undefined) {
            const tinyColor = new TinyColor(this._tinyColor);
            let amount: number;
            if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                amount = 0.5;
            } else {
                if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                    amount = 2.5;
                } else {
                    amount = 10;
                }
            }
            const newTinyColor = tinyColor.saturate(amount);
            const newColor = this.setUiColor(newTinyColor);
            this.setItemColor(this._enabledItemId, newColor);
        }
    }

    private handleDesaturateSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._enabledItemId !== undefined) {
            const tinyColor = new TinyColor(this._tinyColor);
            let amount: number;
            if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                amount = 0.5;
            } else {
                if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                    amount = 2.5;
                } else {
                    amount = 10;
                }
            }
            const newTinyColor = tinyColor.desaturate(amount);
            const newColor = this.setUiColor(newTinyColor);
            this.setItemColor(this._enabledItemId, newColor);
        }
    }

    private handleSpinSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._enabledItemId !== undefined) {
            const tinyColor = new TinyColor(this._tinyColor);
            let amount: number;
            if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                amount = 2;
            } else {
                if (UiAction.downKeysIncludesId(downKeys, UiAction.DownKeyId.Ctrl)) {
                    amount = 10;
                } else {
                    amount = 45;
                }
            }
            const newTinyColor = tinyColor.spin(amount);
            const newColor = this.setUiColor(newTinyColor);
            this.setItemColor(this._enabledItemId, newColor);
        }
    }

    private handleCopySignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._enabledItemId !== undefined) {
            const otherBkgdForeId = ColorScheme.BkgdFore.getOther(this._bkgdForeId);
            const calculatedColor = this.calculateColor(this._enabledItemId, otherBkgdForeId);
            let color = calculatedColor.opaqueColor;

            if (color === undefined) {
                color = this._colorSettings.getColor(this._enabledItemId, otherBkgdForeId);
            }

            if (color !== undefined) {
                const newColor = this.setUiColor(new TinyColor(color));
                this.setItemColor(this._enabledItemId, newColor);
            }
        }
    }

    private handleHexCommitEvent() {
        if (this._enabledItemId !== undefined) {
            const newTinyColor = new TinyColor(this._hexUiAction.value);
            if (!newTinyColor.equals(this._tinyColor)) {
                const newColor = this.setUiColor(newTinyColor);
                this.setItemColor(this._enabledItemId, newColor);
            }
        }
    }

    private handleRedCommitEvent() {
        if (this._enabledItemId !== undefined) {
            const existingColor = this._tinyColor;
            const newRed = this._redUiAction.value;
            if (existingColor !== undefined && newRed !== undefined) {
                const existingRgb = existingColor.toRgb();
                const newTinyColor = new TinyColor({ r: newRed, g: existingRgb.g, b: existingRgb.b } );
                if (!newTinyColor.equals(this._tinyColor)) {
                    const newColor = this.setUiColor(newTinyColor);
                    this.setItemColor(this._enabledItemId, newColor);
                }
            }
        }
    }

    private handleGreenCommitEvent() {
        if (this._enabledItemId !== undefined) {
            const existingColor = this._tinyColor;
            const newGreen = this._greenUiAction.value;
            if (existingColor !== undefined && newGreen !== undefined) {
                const existingRgb = existingColor.toRgb();
                const newTinyColor = new TinyColor({ r: existingRgb.r, g: newGreen, b: existingRgb.b } );
                if (!newTinyColor.equals(this._tinyColor)) {
                    const newColor = this.setUiColor(newTinyColor);
                    this.setItemColor(this._enabledItemId, newColor);
                }
            }
        }
    }

    private handleBlueCommitEvent() {
        if (this._enabledItemId !== undefined) {
            const existingColor = this._tinyColor;
            const newBlue = this._blueUiAction.value;
            if (existingColor !== undefined && newBlue !== undefined) {
                const existingRgb = existingColor.toRgb();
                const newTinyColor = new TinyColor({ r: existingRgb.r, g: existingRgb.g, b: newBlue } );
                if (!newTinyColor.equals(this._tinyColor)) {
                    const newColor = this.setUiColor(newTinyColor);
                    this.setItemColor(this._enabledItemId, newColor);
                }
            }
        }
    }

    private handleHueCommitEvent() {
        if (this._enabledItemId !== undefined) {
            const existingColor = this._tinyColor;
            const newHue = this._hueUiAction.value;
            if (existingColor !== undefined && newHue !== undefined) {
                const existingHsv = existingColor.toHsv();
                const newTinyColor = new TinyColor({ h: newHue, s: existingHsv.s, v: existingHsv.v } );
                if (!newTinyColor.equals(this._tinyColor)) {
                    const newColor = this.setUiColor(newTinyColor);
                    this.setItemColor(this._enabledItemId, newColor);
                }
            }
        }
    }

    private handleSaturationCommitEvent() {
        if (this._enabledItemId !== undefined) {
            const existingColor = this._tinyColor;
            const newSaturation = this._saturationUiAction.value;
            if (existingColor !== undefined && newSaturation !== undefined) {
                const existingHsv = existingColor.toHsv();
                const newTinyColor = new TinyColor({ h: existingHsv.h, s: newSaturation, v: existingHsv.v } );
                if (!newTinyColor.equals(this._tinyColor)) {
                    const newColor = this.setUiColor(newTinyColor);
                    this.setItemColor(this._enabledItemId, newColor);
                }
            }
        }
    }

    private handleValueCommitEvent() {
        if (this._enabledItemId !== undefined) {
            const existingColor = this._tinyColor;
            const newValue = this._valueUiAction.value;
            if (existingColor !== undefined && newValue !== undefined) {
                const existingHsv = existingColor.toHsv();
                const newTinyColor = new TinyColor({ h: existingHsv.h, s: existingHsv.s, v: newValue } );
                if (!newTinyColor.equals(this._tinyColor)) {
                    const newColor = this.setUiColor(newTinyColor);
                    this.setItemColor(this._enabledItemId, newColor);
                }
            }
        }
    }

    private setUiColor(tinyColor: TinyColor | undefined, internallyChanged = true) {
        this._tinyColor = tinyColor;
        let rgb: RGB | undefined;
        let color: ColorScheme.OpaqueColor;
        if (tinyColor === undefined) {
            this._hexUiAction.pushValue(undefined);
            this._redUiAction.pushValue(undefined);
            this._greenUiAction.pushValue(undefined);
            this._blueUiAction.pushValue(undefined);
            this._hueUiAction.pushValue(undefined);
            this._saturationUiAction.pushValue(undefined);
            this._valueUiAction.pushValue(undefined);

            this._hexUiAction.pushDisabled();
            this._redUiAction.pushDisabled();
            this._greenUiAction.pushDisabled();
            this._blueUiAction.pushDisabled();
            this._hueUiAction.pushDisabled();
            this._saturationUiAction.pushDisabled();
            this._valueUiAction.pushDisabled();

            rgb = undefined;
            color = ''; // should be ignored
        } else {
            this._hexUiAction.pushValue(tinyColor.toHexString());
            rgb = tinyColor.toRgb();
            this._redUiAction.pushValue(rgb.r);
            this._greenUiAction.pushValue(rgb.g);
            this._blueUiAction.pushValue(rgb.b);
            const hsv = tinyColor.toHsv();
            this._hueUiAction.pushValue(hsv.h);
            this._saturationUiAction.pushValue(hsv.s);
            this._valueUiAction.pushValue(hsv.v);

            // this._hexUiAction.pushEnabled();
            // this._redUiAction.pushEnabled();
            // this._greenUiAction.pushEnabled();
            // this._blueUiAction.pushEnabled();
            // this._hueUiAction.pushEnabled();
            // this._saturationUiAction.pushEnabled();
            // this._valueUiAction.pushEnabled();

            color = tinyColor.toHexString();
        }

        if (internallyChanged) {
            this.colorInternallyChangedEventer(rgb);
        }

        return color;
    }

    private setItemColor(itemId: ColorScheme.ItemId, color: ColorScheme.ItemColor) {
        this._colorSettings.setItemColor(itemId, this._bkgdForeId, color);
        this.itemChangedEventer(itemId);
    }

    private markForCheck() {
        this._cdr.markForCheck();
    }

    private createHideInPickerUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_HideInPickerCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_HideInPickerTitle]);
        action.pushValue(false);
        action.pushAccepted(true);
        action.commitEvent = () => {
            this.hideInPickerChangedEventer(this._hideInPickerUiAction.definedValue);
        };
        return action;
    }

    private createItemColorTypeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_ItemColorTypeCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_ItemColorTypeTitle]);

        const entryCount = ColorControlsNgComponent.ItemColorType.idCount;
        const elementPropertiesArray = new Array<EnumUiAction.ElementProperties>(entryCount);
        for (let id = 0; id < entryCount; id++) {
            elementPropertiesArray[id] = {
                element: id,
                caption: ColorControlsNgComponent.ItemColorType.idToCaption(id),
                title: ColorControlsNgComponent.ItemColorType.idToTitle(id),
            };
        }

        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = (typeId) => this.handleItemColorTypeCommitEvent(typeId);
        return action;
    }

    private createLightenUiAction() {
        const commandName = InternalCommand.Name.ColorSelector_Lighten;
        const displayId = StringId.ColorSelector_LightenCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ColorSelector_LightenTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Lighten);
        action.signalEvent = (signalTypeId, downKeys) => this.handleLightenSignal(signalTypeId, downKeys);
        return action;
    }

    private createDarkenUiAction() {
        const commandName = InternalCommand.Name.ColorSelector_Darken;
        const displayId = StringId.ColorSelector_DarkenCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ColorSelector_DarkenTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Darken);
        action.signalEvent = (signalTypeId, downKeys) => this.handleDarkenSignal(signalTypeId, downKeys);
        return action;
    }

    private createBrightenUiAction() {
        const commandName = InternalCommand.Name.ColorSelector_Brighten;
        const displayId = StringId.ColorSelector_BrightenCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ColorSelector_BrightenTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Brighten);
        action.signalEvent = (signalTypeId, downKeys) => this.handleBrightenSignal(signalTypeId, downKeys);
        return action;
    }

    private createComplementUiAction() {
        const commandName = InternalCommand.Name.ColorSelector_Complement;
        const displayId = StringId.ColorSelector_ComplementCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ColorSelector_ComplementTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Complement);
        action.signalEvent = (signalTypeId, downKeys) => this.handleComplementSignal(signalTypeId, downKeys);
        return action;
    }

    private createSaturateUiAction() {
        const commandName = InternalCommand.Name.ColorSelector_Saturate;
        const displayId = StringId.ColorSelector_SaturateCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ColorSelector_SaturateTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Saturate);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSaturateSignal(signalTypeId, downKeys);
        return action;
    }

    private createDesaturateUiAction() {
        const commandName = InternalCommand.Name.ColorSelector_Desaturate;
        const displayId = StringId.ColorSelector_DesaturateCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ColorSelector_DesaturateTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Desaturate);
        action.signalEvent = (signalTypeId, downKeys) => this.handleDesaturateSignal(signalTypeId, downKeys);
        return action;
    }

    private createSpinUiAction() {
        const commandName = InternalCommand.Name.ColorSelector_Spin;
        const displayId = StringId.ColorSelector_SpinCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ColorSelector_SpinTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SpinColor);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSpinSignal(signalTypeId, downKeys);
        return action;
    }

    private createCopyUiAction() {
        const commandName = InternalCommand.Name.ColorSelector_Copy;
        const displayId = StringId.ColorSelector_CopyCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ColorSelector_CopyTitle]);
        action.pushIcon(IconButtonUiAction.IconId.CopyColor);
        action.signalEvent = (signalTypeId, downKeys) => this.handleCopySignal(signalTypeId, downKeys);
        return action;
    }

    private createHexUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_HexCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_HexTitle]);
        action.commitEvent = () => this.handleHexCommitEvent();
        return action;
    }

    private createRedUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_RedCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_RedTitle]);
        action.commitEvent = () => this.handleRedCommitEvent();
        return action;
    }

    private createGreenUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_GreenCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_GreenTitle]);
        action.commitEvent = () => this.handleGreenCommitEvent();
        return action;
    }

    private createBlueUiAction() {
        const action = new IntegerUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_BlueCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_BlueTitle]);
        action.commitEvent = () => this.handleBlueCommitEvent();
        return action;
    }

    private createHueUiAction() {
        const action = new NumberUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_HueCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_HueTitle]);
        action.commitEvent = () => this.handleHueCommitEvent();
        return action;
    }

    private createSaturationUiAction() {
        const action = new NumberUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_SaturationCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_SaturationTitle]);
        action.commitEvent = () => this.handleSaturationCommitEvent();
        return action;
    }

    private createValueUiAction() {
        const action = new NumberUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_ValueCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_ValueTitle]);
        action.commitEvent = () => this.handleValueCommitEvent();
        return action;
    }

    private setUiActions() {
        this._hideInPickerControl.initialise(this._hideInPickerUiAction);
        this._inheritedRadio.initialiseEnum(this._itemColorTypeUiAction, ColorControlsNgComponent.ItemColorTypeId.Inherited);
        this._transparentRadio.initialiseEnum(this._itemColorTypeUiAction, ColorControlsNgComponent.ItemColorTypeId.Transparent);
        this._opaqueRadio.initialiseEnum(this._itemColorTypeUiAction, ColorControlsNgComponent.ItemColorTypeId.Opaque);
        this._lightenButton.initialise(this._lightenUiAction);
        this._darkenButton.initialise(this._darkenUiAction);
        this._brightenButton.initialise(this._brightenUiAction);
        this._complementButton.initialise(this._complementUiAction);
        this._saturateButton.initialise(this._saturateUiAction);
        this._desaturateButton.initialise(this._desaturateUiAction);
        this._spinButton.initialise(this._spinUiAction);
        this._copyButton.initialise(this._copyUiAction);
        this._hexControl.initialise(this._hexUiAction);
        this._redLabel.initialise(this._redUiAction);
        this._redControl.initialise(this._redUiAction);
        this._greenLabel.initialise(this._greenUiAction);
        this._greenControl.initialise(this._greenUiAction);
        this._blueLabel.initialise(this._blueUiAction);
        this._blueControl.initialise(this._blueUiAction);
        this._hueLabel.initialise(this._hueUiAction);
        this._hueControl.initialise(this._hueUiAction);
        this._saturationLabel.initialise(this._saturationUiAction);
        this._saturationControl.initialise(this._saturationUiAction);
        this._valueLabel.initialise(this._valueUiAction);
        this._valueControl.initialise(this._valueUiAction);
    }

    private calculateColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId): ColorControlsNgComponent.CalculatedColor {
        const itemColor = this._colorSettings.getItemColor(itemId, this._bkgdForeId);
        if (itemColor === ColorScheme.schemeInheritColor) {
            return { typeId: ColorControlsNgComponent.ItemColorTypeId.Inherited, opaqueColor: undefined };
        } else {
            if (itemColor === ColorScheme.schemeTransparentColor) {
                return { typeId: ColorControlsNgComponent.ItemColorTypeId.Transparent, opaqueColor: undefined };
            } else {
                return { typeId: ColorControlsNgComponent.ItemColorTypeId.Opaque, opaqueColor: itemColor };
            }
        }
    }

    private updateActiveIndicator() {
        const weight = this._activeInPicker ? HtmlTypes.FontWeight.Bold : '';
        if (weight !== this.activeInPickerIndicatorFontWeight) {
            this.activeInPickerIndicatorFontWeight = weight;
            this.markForCheck();
        }
    }

    private finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);

        this._hideInPickerUiAction.finalise();
        this._itemColorTypeUiAction.finalise();
        this._lightenUiAction.finalise();
        this._darkenUiAction.finalise();
        this._brightenUiAction.finalise();
        this._complementUiAction.finalise();
        this._saturateUiAction.finalise();
        this._desaturateUiAction.finalise();
        this._spinUiAction.finalise();
        this._copyUiAction.finalise();
        this._hexUiAction.finalise();
        this._redUiAction.finalise();
        this._greenUiAction.finalise();
        this._blueUiAction.finalise();
        this._hueUiAction.finalise();
        this._saturationUiAction.finalise();
        this._valueUiAction.finalise();
    }
}

export namespace ColorControlsNgComponent {
    export enum Position {
        Top,
        Bottom,
    }

    export type ItemChangedEventer = (itemId: ColorScheme.ItemId) => void;
    export type ColorInternallyChangedEventer = (rgb: RGB | undefined) => void;
    export type RequestActiveInPickerEventer = (this: void) => void;
    export type HideInPickerChangedEventer = (this: void, hide: boolean) => void;

    export interface CalculatedColor {
        typeId: ItemColorTypeId;
        opaqueColor: ColorScheme.OpaqueColor | undefined;
    }

    export const enum ItemColorTypeId {
        Opaque,
        Transparent,
        Inherited,
    }

    export namespace ItemColorType {
        type Id = ItemColorTypeId;

        interface Info {
            readonly id: Id;
            readonly captionId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof ItemColorTypeId]: Info };

        const infosObject: InfosObject = {
            Opaque: {
                id: ItemColorTypeId.Opaque,
                captionId: StringId.ColorSelector_OpaqueCaption,
                titleId: StringId.ColorSelector_OpaqueTitle,
            },
            Transparent: {
                id: ItemColorTypeId.Transparent,
                captionId: StringId.ColorSelector_TransparentCaption,
                titleId: StringId.ColorSelector_TransparentTitle,
            },
            Inherited: {
                id: ItemColorTypeId.Inherited,
                captionId: StringId.ColorSelector_UseInheritedCaption,
                titleId: StringId.ColorSelector_UseInheritedTitle,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                if (infos[i].id !== i) {
                    throw new EnumInfoOutOfOrderError('ColorSelectComponent.ItemColorTypeId', i, idToCaption(i));
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

export namespace ColorControlsComponentModule {
    export function initialiseStatic() {
        ColorControlsNgComponent.ItemColorType.initialise();
    }
}
