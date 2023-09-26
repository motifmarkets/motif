import { ChangeDetectionStrategy, Component, ElementRef, HostBinding } from '@angular/core';
import { IroColor } from '@irojs/iro-core';
import iro from '@jaames/iro';
import { ColorPickerProps, ColorPickerState, IroColorPicker } from '@jaames/iro/dist/ColorPicker';
import { AssertInternalError, ColorScheme, Integer, RGB, UnreachableCaseError, compareInteger } from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-multi-color-picker',
    templateUrl: './multi-color-picker-ng.component.html',
    styleUrls: ['./multi-color-picker-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiColorPickerNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    @HostBinding('class.hidden') public hidden = true;

    activeChangedEventer: MultiColorPickerNgComponent.ActiveChangedEventer;
    inputChangeEventer: MultiColorPickerNgComponent.InputChangeEventer;

    private readonly _colorPicker: IroColorPicker;
    private _pickerType = MultiColorPickerNgComponent.PickerTypeId.HueSaturation;

    private _entries: BkgdFore.Entries = [
        {
            hidden: false,
            defined: false,
            rgb: undefinedRgbColor,
            index: -1,
        },
        {
            hidden: false,
            defined: false,
            rgb: undefinedRgbColor,
            index: -1,
        }
    ];

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++MultiColorPickerNgComponent.typeInstanceCreateCount);

        this._colorPicker = this.createColorPicker();
    }

    get approximateWidth() { return this._colorPicker.el.offsetWidth; }

    get pickerType() { return this._pickerType; }
    set pickerType(value: MultiColorPickerNgComponent.PickerTypeId) {
        this._pickerType = value;
        const layout = this.createLayout();
        const options: Partial<ColorPickerState> = {
            layout,
        };
        this._colorPicker.setOptions(options);
    }

    requestActive(bkgdForeId: ColorScheme.BkgdForeId) {
        const entry = this._entries[bkgdForeId];
        const index = entry.index;
        if (index >= 0) {
            this._colorPicker.setActiveColor(index);
        }
    }

    setColorHidden(bkgdForeId: ColorScheme.BkgdForeId, hidden: boolean) {
        const entry = this._entries[bkgdForeId];
        if (hidden) {
            if (!entry.hidden) {
                entry.hidden = true;
                this.checkRemoveColor(bkgdForeId);
            }
        } else {
            if (entry.hidden) {
                entry.hidden = false;
                this.checkAddColor(bkgdForeId);
            }
        }
    }

    setColor(bkgdForeId: ColorScheme.BkgdForeId, rgb: RGB | undefined) {
        const entry = this._entries[bkgdForeId];
        if (rgb === undefined) {
            if (entry.defined) {
                entry.rgb = undefinedRgbColor;
                entry.defined = false;
                this.checkRemoveColor(bkgdForeId);
            }
        } else {
            if (!entry.defined) {
                entry.defined = true;
                entry.rgb = rgb;
                this.checkAddColor(bkgdForeId);
            } else {
                entry.rgb = rgb;
                const index = entry.index;
                this._colorPicker.colors[index].rgb = rgb;
            }
        }
    }

    private _inputChangeListener = (color: IroColor) => this.handleInputChangeCallback(color);
    private _activeChangedListener = (color: IroColor) => this.handleActiveChangedCallback(color);

    private handleInputChangeCallback(color: IroColor) {
        const colorIndex = color.index;
        const entryIndex = this._entries.findIndex((entry) => entry.index === colorIndex);
        if (entryIndex < 0) {
            throw new AssertInternalError('MCPNCHICC16003');
        } else {
            const entry = this._entries[entryIndex];
            const rgb = color.rgb;
            entry.rgb = rgb;
            this.inputChangeEventer(entryIndex, rgb);
        }
    }

    private handleActiveChangedCallback(color: IroColor) {
        const colorIndex = color.index;
        const entryIndex = this._entries.findIndex((entry) => entry.index === colorIndex);
        if (entryIndex < 0) {
            throw new AssertInternalError('MCPNCHACC16003');
        } else {
            this.activeChangedEventer(entryIndex);
        }
    }

    private createColorPicker() {
        const layout = this.createLayout();

        const definedEntries = this._entries.slice();
        definedEntries.filter( (entry) => entry.defined );
        if (definedEntries.length > 0) {
            definedEntries.sort((left, right) => compareInteger(left.index, right.index));
        }
        const colors: RGB[] = []; // definedEntries.map((entry) => entry.rgb);

        const pickerProps: Partial<ColorPickerProps> = {
            layoutDirection: 'horizontal',
            width: 100,
            sliderSize: 8,
            layout,
            colors,
            activeHandleRadius: 10,
        };

        const picker = iro.ColorPicker(this.rootHtmlElement, pickerProps);
        picker.on('input:change', this._inputChangeListener);
        picker.on('color:setActive', this._activeChangedListener);
        return picker;
    }

    private createLayout() {
        let layout: ColorPickerLayoutDefinition[];
        switch (this._pickerType) {
            case MultiColorPickerNgComponent.PickerTypeId.HueSaturation: layout = hueSaturationLayout; break;
            case MultiColorPickerNgComponent.PickerTypeId.ValueSaturation: layout = valueSaturationLayout; break;
            default: throw new UnreachableCaseError('MCPNCCL91664', this._pickerType);
        }
        return layout;
    }

    private checkAddColor(bkgdForeId: ColorScheme.BkgdForeId) {
        const entry = this._entries[bkgdForeId];
        if (entry.defined && !entry.hidden) {
            if (entry.index >= 0) {
                throw new AssertInternalError('MCPNCCAC60224');
            } else {
                const colorsCount = this._colorPicker.colors.length;
                if (colorsCount === 1 && this.getOtherEntry(bkgdForeId).index < 0) {
                    // Color Picker cannot have 0 colors. So if we already have 1 color but the other entry is unused, the existing
                    // color is not a real one. To handle this, this component is hidden when there are 0 colors.
                    // Overwrite the existing color and make this component visible again.
                    entry.index = 0;
                    this._colorPicker.colors[0].rgb = entry.rgb;
                    this.hidden = false;
                } else {
                    entry.index = colorsCount;
                    this._colorPicker.addColor(entry.rgb);
                }
            }
        }
    }

    private checkRemoveColor(bkgdForeId: ColorScheme.BkgdForeId) {
        const entry = this._entries[bkgdForeId];
        const index = entry.index;
        if (index >= 0 && (!entry.defined || entry.hidden)) {
            entry.index = -1;
            const otherId = BkgdFore.getOtherId(bkgdForeId);
            const otherEntry = this._entries[otherId];
            if (otherEntry.index > index) {
                otherEntry.index--;
            }

            if (this._colorPicker.colors.length > 1) {
                this._colorPicker.removeColor(index);
            } else {
                // Color picker cannot have 0 colors.  So hide this component when neither background or foreground have a color.
                this.hidden = true;
            }
        }
    }

    private getOtherEntry(bkgdForeId: ColorScheme.BkgdForeId) {
        const otherBkgdForeId = BkgdFore.getOtherId(bkgdForeId);
        return this._entries[otherBkgdForeId];
    }
}

export namespace MultiColorPickerNgComponent {
    export const enum PickerTypeId {
        HueSaturation, // Circle
        ValueSaturation // Box
    }

    export type ActiveChangedEventer = (this: void, bkgdForeId: ColorScheme.BkgdForeId) => void;
    export type InputChangeEventer = (this: void, bkgdForeId: ColorScheme.BkgdForeId, rgb: RGB) => void;
}

namespace BkgdFore {
    export interface Entry {
        hidden: boolean;
        defined: boolean;
        rgb: RGB;
        index: Integer;
    }
    export type Entries = [bkgd: Entry, fore: Entry];

    export function getOtherId(bkgdForeId: ColorScheme.BkgdForeId) {
        switch (bkgdForeId) {
            case ColorScheme.BkgdForeId.Bkgd: return ColorScheme.BkgdForeId.Fore;
            case ColorScheme.BkgdForeId.Fore: return ColorScheme.BkgdForeId.Bkgd;
            default: throw new UnreachableCaseError('MCPNCGOE87773', bkgdForeId);
        }
    }
}

interface ColorPickerLayoutDefinition {
    component: unknown;
    options?: unknown;
}

const undefinedRgbColor = { r: 0, g: 0, b: 0 }; // logical undefined only

const hueSaturationLayout = [
    { component: iro.ui.Wheel },
    { component: iro.ui.Slider, options: { sliderType: 'red' } },
    { component: iro.ui.Slider, options: { sliderType: 'green' } },
    { component: iro.ui.Slider, options: { sliderType: 'blue' } },
    { component: iro.ui.Slider, options: { sliderType: 'saturation' } },
    { component: iro.ui.Slider, options: { sliderType: 'value' } },
];

const valueSaturationLayout = [
    { component: iro.ui.Box },
    { component: iro.ui.Slider, options: { sliderType: 'red' } },
    { component: iro.ui.Slider, options: { sliderType: 'green' } },
    { component: iro.ui.Slider, options: { sliderType: 'blue' } },
    { component: iro.ui.Slider, options: { sliderType: 'saturation' } },
    { component: iro.ui.Slider, options: { sliderType: 'value' } },
];

