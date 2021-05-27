/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { TinyColor } from '@ctrl/tinycolor';
import { CommandRegisterNgService, SettingsNgService } from 'src/component-services/ng-api';
import { CaptionedRadioNgComponent, SvgButtonNgComponent } from 'src/controls/ng-api';
import {
    ColorScheme,
    ColorSettings,
    CommandRegisterService,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    IconButtonUiAction,
    InternalCommand,
    UiAction
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { delay1Tick, EnumInfoOutOfOrderError, UnreachableCaseError } from 'src/sys/internal-api';
// import iro from '@jaames/iro';

@Component({
    selector: 'app-color-selector',
    templateUrl: './color-selector-ng.component.html',
    styleUrls: ['./color-selector-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSelectorNgComponent implements AfterViewInit, OnDestroy {
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
    // @ViewChild('#picker', { static: true }) private _pickerContainer: ElementRef;

    itemChangedEvent: ColorSelectorNgComponent.ItemChangedEvent;

    public disabled = false;
    public color: string;
    public colorHeading: string;
    public flexDirection: string;

    private _commandRegisterService: CommandRegisterService;

    private _itemColorTypeUiAction: EnumUiAction;
    private _lightenUiAction: IconButtonUiAction;
    private _darkenUiAction: IconButtonUiAction;
    private _brightenUiAction: IconButtonUiAction;
    private _complementUiAction: IconButtonUiAction;
    private _saturateUiAction: IconButtonUiAction;
    private _desaturateUiAction: IconButtonUiAction;
    private _spinUiAction: IconButtonUiAction;
    private _copyUiAction: IconButtonUiAction;

    private _bkgdForeId: ColorScheme.BkgdForeId;
    private _position: ColorSelectorNgComponent.Position;
    private _itemId: ColorScheme.ItemId | undefined;

    // private _colorPicker: unknown;

    private _colorSettings: ColorSettings;

    get bkgdFore() { return this._bkgdForeId; }
    set bkdgFore(value: ColorScheme.BkgdForeId) {
        this._bkgdForeId = value;
        switch (this._bkgdForeId) {
            case ColorScheme.BkgdForeId.Bkgd:
                this.colorHeading = Strings[StringId.BackgroundColor];
                break;
            case ColorScheme.BkgdForeId.Fore:
                this.colorHeading = Strings[StringId.ForegroundColor];
                break;
            default:
                throw new UnreachableCaseError('CSCGBF5774209', this._bkgdForeId);
        }
    }

    get position() { return this._position; }
    set position(value: ColorSelectorNgComponent.Position) {
        this._position = value;
        switch (value) {
            case ColorSelectorNgComponent.Position.Top:
                this.flexDirection = 'column-reverse';
                break;
            case ColorSelectorNgComponent.Position.Bottom:
                this.flexDirection = 'column';
                break;
            default:
                throw new UnreachableCaseError('CSCSP19377530', value);
        }
        this.markForCheck();
    }

    get itemId() { return this._itemId; }
    set itemId(value: ColorScheme.ItemId | undefined) {
        this._itemId = value;
        this.disabled = this._itemId === undefined || !ColorScheme.Item.idHas(this._itemId, this._bkgdForeId);

        if (this.disabled || this._itemId === undefined) { // reduce this._itemId type
            this.setUiColor('black');
            this._itemColorTypeUiAction.pushValue(ColorSelectorNgComponent.ItemColorTypeId.Opaque);
            this._itemColorTypeUiAction.pushDisabled();
            this._lightenUiAction.pushDisabled();
            this._darkenUiAction.pushDisabled();
            this._brightenUiAction.pushDisabled();
            this._complementUiAction.pushDisabled();
            this._saturateUiAction.pushDisabled();
            this._desaturateUiAction.pushDisabled();
            this._spinUiAction.pushDisabled();
            this._copyUiAction.pushDisabled();
        } else {
            const calculatedColor = this.calculateColor(this._itemId, this.bkdgFore);
            this.setUiColor(calculatedColor.opaqueColor);
            this._itemColorTypeUiAction.pushValue(calculatedColor.typeId);
            this._itemColorTypeUiAction.pushAccepted();
            this._lightenUiAction.pushAccepted();
            this._darkenUiAction.pushAccepted();
            this._brightenUiAction.pushAccepted();
            this._complementUiAction.pushAccepted();
            this._saturateUiAction.pushAccepted();
            this._desaturateUiAction.pushAccepted();
            this._spinUiAction.pushAccepted();
            const otherBkgdForeId = ColorScheme.BkgdFore.getOther(this._bkgdForeId);
            if (ColorScheme.Item.idHas(this._itemId, otherBkgdForeId)) {
                this._copyUiAction.pushAccepted();
            } else {
                this._copyUiAction.pushDisabled();
            }
        }
    }

    constructor(private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        settingsNgService: SettingsNgService
    ) {
        this._commandRegisterService = commandRegisterNgService.service;
        this._colorSettings = settingsNgService.settingsService.color;

        this._itemColorTypeUiAction = this.createItemColorTypeUiAction();
        this._lightenUiAction = this.createLightenUiAction();
        this._darkenUiAction = this.createDarkenUiAction();
        this._brightenUiAction = this.createBrightenUiAction();
        this._complementUiAction = this.createComplementUiAction();
        this._saturateUiAction = this.createSaturateUiAction();
        this._desaturateUiAction = this.createDesaturateUiAction();
        this._spinUiAction = this.createSpinUiAction();
        this._copyUiAction = this.createCopyUiAction();

        // this.bkgdPicker = new ColorPicker();
    }

    ngAfterViewInit() {
        // this._colorPicker = iro.ColorPicker(this._pickerContainer.nativeElement, {
        //     layoutDirection: 'horizontal',
        //     width: 100,
        //     sliderSize: 5,
        //     colors: [
        //         'rgb(100%, 0, 0)', // pure red
        //         'rgb(0, 100%, 0)', // pure green
        //         'rgb(0, 0, 100%)', // pure blue
        //       ]
        // });
        delay1Tick(() => this.setUiActions());
    }

    ngOnDestroy() {
        this.finalise();
    }

    processSettingsChanged() {
        if (!this.disabled && this._itemId !== undefined) {
            const calculatedColor = this.calculateColor(this._itemId, this.bkdgFore);
            this.setUiColor(calculatedColor.opaqueColor);
            this._itemColorTypeUiAction.pushValue(calculatedColor.typeId);
        }
    }

    onColorPickerChange(color: string) {
        if (this._itemId !== undefined) {
            this.setItemColor(this._itemId, color);
        }
    }

    private handleItemColorTypeCommitEvent(typeId: UiAction.CommitTypeId) {
        if (this._itemId !== undefined) {
            const itemColorTypeId = this._itemColorTypeUiAction.definedValue;
            switch (itemColorTypeId) {
                case ColorSelectorNgComponent.ItemColorTypeId.Inherited: {
                    this.setItemColor(this._itemId, ColorScheme.schemeInheritColor);
                    break;
                }
                case ColorSelectorNgComponent.ItemColorTypeId.Transparent: {
                    this.setItemColor(this._itemId, ColorScheme.schemeTransparentColor);
                    break;
                }
                case ColorSelectorNgComponent.ItemColorTypeId.Opaque: {
                    const color = this._colorSettings.getLastOpaqueItemColor(this._itemId, this._bkgdForeId);
                    if (color !== undefined) {
                        this.setItemColor(this._itemId, color);
                    }
                    break;
                }

            }
        }
    }

    private handleLightenSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._itemId !== undefined) {
            const tinyColor = new TinyColor(this.color);
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
            const color = tinyColor.lighten(amount).toHexString();
            this.setUiColor(color);
            this.setItemColor(this._itemId, color);
        }
    }

    private handleDarkenSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._itemId !== undefined) {
            const tinyColor = new TinyColor(this.color);
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
            const color = tinyColor.darken(amount).toHexString();
            this.setUiColor(color);
            this.setItemColor(this._itemId, color);
        }
    }

    private handleBrightenSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._itemId !== undefined) {
            const tinyColor = new TinyColor(this.color);
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
            const color = tinyColor.brighten(amount).toHexString();
            this.setUiColor(color);
            this.setItemColor(this._itemId, color);
        }
    }

    private handleComplementSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._itemId !== undefined) {
            const tinyColor = new TinyColor(this.color);
            const color = tinyColor.complement().toHexString();
            this.setUiColor(color);
            this.setItemColor(this._itemId, color);
        }
    }

    private handleSaturateSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._itemId !== undefined) {
            const tinyColor = new TinyColor(this.color);
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
            const color = tinyColor.saturate(amount).toHexString();
            this.setUiColor(color);
            this.setItemColor(this._itemId, color);
        }
    }

    private handleDesaturateSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._itemId !== undefined) {
            const tinyColor = new TinyColor(this.color);
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
            const color = tinyColor.desaturate(amount).toHexString();
            this.setUiColor(color);
            this.setItemColor(this._itemId, color);
        }
    }

    private handleSpinSignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._itemId !== undefined) {
            const tinyColor = new TinyColor(this.color);
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
            const color = tinyColor.spin(amount).toHexString();
            this.setUiColor(color);
            this.setItemColor(this._itemId, color);
        }
    }

    private handleCopySignal(signalTypeId: UiAction.SignalTypeId, downKeys: UiAction.DownKeys) {
        if (this._itemId !== undefined) {
            const otherBkgdForeId = ColorScheme.BkgdFore.getOther(this._bkgdForeId);
            const calculatedColor = this.calculateColor(this._itemId, otherBkgdForeId);
            let color = calculatedColor.opaqueColor;

            if (color === undefined) {
                color = this._colorSettings.getColor(this._itemId, otherBkgdForeId);
            }

            if (color !== undefined) {
                this.setUiColor(color);
                this.setItemColor(this._itemId, color);
            }
        }
    }

    private setUiColor(color: ColorScheme.OpaqueColor | undefined) {
        if (color === undefined) {
            this.color = '';
        } else {
            this.color = new TinyColor(color).toHexString();
        }
        this.markForCheck();
    }

    private setItemColor(itemId: ColorScheme.ItemId, color: ColorScheme.ItemColor) {
        this._colorSettings.setItemColor(itemId, this._bkgdForeId, color);
        this.itemChangedEvent(itemId);
    }

    private markForCheck() {
        this._cdr.markForCheck();
    }

    private createItemColorTypeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ColorSelector_ItemColorTypeCaption]);
        action.pushTitle(Strings[StringId.ColorSelector_ItemColorTypeTitle]);

        const entryCount = ColorSelectorNgComponent.ItemColorType.idCount;
        const elementPropertiesArray = new Array<EnumUiAction.ElementProperties>(entryCount);
        for (let id = 0; id < entryCount; id++) {
            elementPropertiesArray[id] = {
                element: id,
                caption: ColorSelectorNgComponent.ItemColorType.idToCaption(id),
                title: ColorSelectorNgComponent.ItemColorType.idToTitle(id),
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

    private setUiActions() {
        this._inheritedRadio.initialiseEnum(this._itemColorTypeUiAction, ColorSelectorNgComponent.ItemColorTypeId.Inherited);
        this._transparentRadio.initialiseEnum(this._itemColorTypeUiAction, ColorSelectorNgComponent.ItemColorTypeId.Transparent);
        this._opaqueRadio.initialiseEnum(this._itemColorTypeUiAction, ColorSelectorNgComponent.ItemColorTypeId.Opaque);
        this._lightenButton.initialise(this._lightenUiAction);
        this._darkenButton.initialise(this._darkenUiAction);
        this._brightenButton.initialise(this._brightenUiAction);
        this._complementButton.initialise(this._complementUiAction);
        this._saturateButton.initialise(this._saturateUiAction);
        this._desaturateButton.initialise(this._desaturateUiAction);
        this._spinButton.initialise(this._spinUiAction);
        this._copyButton.initialise(this._copyUiAction);
    }

    private calculateColor(itemId: ColorScheme.ItemId, bkgdFore: ColorScheme.BkgdForeId): ColorSelectorNgComponent.CalculatedColor {
        const itemColor = this._colorSettings.getItemColor(itemId, this._bkgdForeId);
        if (itemColor === ColorScheme.schemeInheritColor) {
            const lastColor = this._colorSettings.getLastOpaqueItemColor(itemId, bkgdFore);
            return { typeId: ColorSelectorNgComponent.ItemColorTypeId.Inherited, opaqueColor: lastColor };
        } else {
            if (itemColor === ColorScheme.schemeTransparentColor) {
                return { typeId: ColorSelectorNgComponent.ItemColorTypeId.Transparent, opaqueColor: 'white' };
            } else {
                return { typeId: ColorSelectorNgComponent.ItemColorTypeId.Opaque, opaqueColor: itemColor };
            }
        }
    }

    private finalise() {
        this._itemColorTypeUiAction.finalise();
        this._lightenUiAction.finalise();
        this._darkenUiAction.finalise();
        this._brightenUiAction.finalise();
        this._complementUiAction.finalise();
        this._saturateUiAction.finalise();
        this._desaturateUiAction.finalise();
        this._spinUiAction.finalise();
        this._copyUiAction.finalise();
    }
}

export namespace ColorSelectorNgComponent {
    export enum Position {
        Top,
        Bottom,
    }

    export type ItemChangedEvent = (itemId: ColorScheme.ItemId) => void;

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

export namespace ColorSelectorComponentModule {
    export function initialiseStatic() {
        ColorSelectorNgComponent.ItemColorType.initialise();
    }
}
