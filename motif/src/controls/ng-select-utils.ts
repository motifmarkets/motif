/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TinyColor } from '@ctrl/tinycolor';
import { ColorScheme, ColorSettings } from '@motifmarkets/motif-core';

export namespace NgSelectUtils {
    export const ngOptionLeftRightPadding = 3; // should come from src/scss/partials/ng-select/_default_var.theme.scss

    export const enum CssCustomPropertyName {
        Highlight = '--ng-select-highlight',
        PrimaryText = '--ng-select-primary-text',
        PrimaryTextLighten60 = '--ng-select-primary-text-lighten60', // lighten($ng-select-primary-text, 60);
        DisabledText = '--ng-select-disabled-text',
        Border = '--ng-select-border',
        BorderLighten5 = '--ng-select-border-lighten5', // lighten($ng-select-border, 5);
        BorderLighten10 = '--ng-select-border-lighten10', // lighten($ng-select-border, 10);
        BorderDarken10 = '--ng-select-border-darken10', // darken($ng-select-border, 10);
        BorderDarken20 = '--ng-select-border-darken20', // darken($ng-select-border, 20);
        BorderDarken40 = '--ng-select-border-darken40', // darken($ng-select-border, 40);
        BorderDarken60 = '--ng-select-border-darken60', // darken($ng-select-border, 60);
        BorderRadius = '--ng-select-border-radius',
        Bg = '--ng-select-bg',
        BlackWhiteFore = 'ng-select-black-white-fore',
        Selected = '--ng-select-selected', // lighten($ng-select-highlight, 46);
        SelectedDarken5 = '--ng-select-selected-darken5', // darken($ng-select-selected, 5);
        SelectedDarken10 = '--ng-select-selected-darken10', // darken($ng-select-selected, 10);
        Marked = '--ng-select-marked', // lighten($ng-select-highlight, 48);
        Placeholder = '--ng-select-placeholder', // lighten($ng-select-primary-text, 40);
        ClearHover = '--ng-select-clear-hover',
        BoxFocusedShadow2Color = '--ng-select-box-focused-shadow2-color',
        BoxFocusedShadow = '--ng-select-box-focused-shadow',
        ContainerHoverBoxShadow = '--ng-select-container-hover-box-shadow', // rgba($ng-select-black-white-fore, 0.06) !default;
        DropdownPanelBoxShadow = '--ng-select-dropdown-panel-box-shadow', // rgba($ng-select-black-white-fore, 0.06) !default;
        DropdownPanelItemsOptgroup = '--ng-select-dropdown-panel-items-optgroup', // rgba($ng-select-black-white-fore, 0.54) !default;
        DropdownPanelItemsOption = '--ng-select-dropdown-panel-items-option', // rgba($ng-select-black-white-fore, 0.87) !default;
        Height = '--ng-select-height',
        ValuePaddingLeft = '--ng-select-value-padding-left',
        ValueFontSize = '--ng-select-value-font-size',
    }

    export function ApplyColors(element: HTMLElement, foreColor: string, bkgdColor: string) {

        const highlightTinyColor = new TinyColor(colorSettings.getFore(ColorScheme.ItemId.TextControl_Highlight));
        const primaryTextTinyColor = new TinyColor(foreColor);
        const primaryTextLighten60TinyColor = primaryTextTinyColor.clone().lighten(60);
        const placeholderTinyColor = primaryTextTinyColor.clone().lighten(40);

        const bkgdColorTinyColor = new TinyColor(bkgdColor);
        const selectedTinyColor = bkgdColorTinyColor.clone().lighten(8);
        const selectedDarken5TinyColor = selectedTinyColor.clone().lighten(5);
        const selectedDarken10TinyColor = selectedTinyColor.clone().lighten(10);

        const markedTinyColor = bkgdColorTinyColor.clone().lighten(30);

        const borderTinyColor = new TinyColor(colorSettings.getFore(ColorScheme.ItemId.Text_ControlBorder));
        const borderLighten5TinyColor = borderTinyColor.clone().lighten(5);
        const borderLighten10TinyColor = borderTinyColor.clone().lighten(10);
        const borderDarken10TinyColor = borderTinyColor.clone().darken(10);
        const borderDarken20TinyColor = borderTinyColor.clone().darken(20);
        const borderDarken40TinyColor = borderTinyColor.clone().darken(40);
        const borderDarken60TinyColor = borderTinyColor.clone().darken(60);

        let blackWhiteForeTinyColor: TinyColor;
        if (primaryTextTinyColor.isDark()) {
            blackWhiteForeTinyColor = new TinyColor('black');
        } else {
            blackWhiteForeTinyColor = new TinyColor('white');
        }

        const dropdownPanelItemsOptgroupTinyColor = blackWhiteForeTinyColor.clone().setAlpha(0.54);
        const dropdownPanelItemsOptionTinyColor = blackWhiteForeTinyColor.clone().setAlpha(0.87);

        element.style.setProperty(CssCustomPropertyName.Highlight, highlightTinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.PrimaryText, primaryTextTinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.PrimaryTextLighten60, primaryTextLighten60TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.DisabledText, colorSettings.getFore(ColorScheme.ItemId.TextControl_Disabled));
        element.style.setProperty(CssCustomPropertyName.Border, borderTinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.BorderLighten5, borderLighten5TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.BorderLighten10, borderLighten10TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.BorderDarken10, borderDarken10TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.BorderDarken20, borderDarken20TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.BorderDarken40, borderDarken40TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.BorderDarken60, borderDarken60TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.Bg, bkgdColor);
        element.style.setProperty(CssCustomPropertyName.Selected, selectedTinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.SelectedDarken5, selectedDarken5TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.SelectedDarken10, selectedDarken10TinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.Marked, markedTinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.Placeholder, placeholderTinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.DropdownPanelItemsOptgroup, dropdownPanelItemsOptgroupTinyColor.toHexString());
        element.style.setProperty(CssCustomPropertyName.DropdownPanelItemsOption, dropdownPanelItemsOptionTinyColor.toHexString());
    }
}

let colorSettings: ColorSettings;

export namespace NgSelectUtilsModule {
    export function setColorSettings(colorSettingsValue: ColorSettings) {
        colorSettings = colorSettingsValue;
    }
}
