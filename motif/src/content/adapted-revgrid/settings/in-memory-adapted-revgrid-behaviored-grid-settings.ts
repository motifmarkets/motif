/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { HorizontalAlign, InMemoryTextBehavioredGridSettings } from 'revgrid';
import { AdaptedRevgridBehavioredGridSettings } from './adapted-revgrid-behaviored-grid-settings';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { AdaptedRevgridOnlyGridSettings } from './adapted-revgrid-only-grid-settings';

/** @public */
export class InMemoryAdaptedRevgridBehavioredGridSettings extends InMemoryTextBehavioredGridSettings implements AdaptedRevgridBehavioredGridSettings {
    private _font: string;
    private _columnHeaderFont: string;
    private _horizontalAlign: HorizontalAlign;
    private _columnHeaderHorizontalAlign: HorizontalAlign;
    // private _focusedRowBorderWidth: number;
    // private _alternateBackgroundColor: GridSettings.Color;
    // private _grayedOutForegroundColor: GridSettings.Color;
    // private _focusedRowBackgroundColor: GridSettings.Color | undefined;
    // private _focusedRowBorderColor: GridSettings.Color | undefined;
    // private _valueRecentlyModifiedBorderColor: GridSettings.Color;
    // private _valueRecentlyModifiedUpBorderColor: GridSettings.Color;
    // private _valueRecentlyModifiedDownBorderColor: GridSettings.Color;
    // private _recordRecentlyUpdatedBorderColor: GridSettings.Color;
    // private _recordRecentlyInsertedBorderColor: GridSettings.Color;

    get font() { return this._font; }
    set font(value: string) {
        if (value !== this._font) {
            this.beginChange();
            this._font = value;
            this.notifyChangedViewRender();
            this.endChange();
        }
    }
    get horizontalAlign() { return this._horizontalAlign; }
    set horizontalAlign(value: HorizontalAlign) {
        if (value !== this._horizontalAlign) {
            this.beginChange();
            this._horizontalAlign = value;
            this.notifyChangedViewRender();
            this.endChange();
        }
    }
    get columnHeaderFont() { return this._columnHeaderFont; }
    set columnHeaderFont(value: string) {
        if (value !== this._columnHeaderFont) {
            this.beginChange();
            this._columnHeaderFont = value;
            this.notifyChangedViewRender();
            this.endChange();
        }
    }
    get columnHeaderHorizontalAlign() { return this._columnHeaderHorizontalAlign; }
    set columnHeaderHorizontalAlign(value: HorizontalAlign) {
        if (value !== this._columnHeaderHorizontalAlign) {
            this.beginChange();
            this._columnHeaderHorizontalAlign = value;
            this.notifyChangedViewRender();
            this.endChange();
        }
    }
    // get focusedRowBorderWidth() { return this._focusedRowBorderWidth; }
    // set focusedRowBorderWidth(value: number) {
    //     if (value !== this._focusedRowBorderWidth) {
    //         this.beginChange();
    //         this._focusedRowBorderWidth = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get alternateBackgroundColor() { return this._alternateBackgroundColor; }
    // set alternateBackgroundColor(value: GridSettings.Color) {
    //     if (value !== this._alternateBackgroundColor) {
    //         this.beginChange();
    //         this._alternateBackgroundColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get grayedOutForegroundColor() { return this._grayedOutForegroundColor; }
    // set grayedOutForegroundColor(value: GridSettings.Color) {
    //     if (value !== this._grayedOutForegroundColor) {
    //         this.beginChange();
    //         this._grayedOutForegroundColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get focusedRowBackgroundColor() { return this._focusedRowBackgroundColor; }
    // set focusedRowBackgroundColor(value: GridSettings.Color | undefined) {
    //     if (value !== this._focusedRowBackgroundColor) {
    //         this.beginChange();
    //         this._focusedRowBackgroundColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get focusedRowBorderColor() { return this._focusedRowBorderColor; }
    // set focusedRowBorderColor(value: GridSettings.Color | undefined) {
    //     if (value !== this._focusedRowBorderColor) {
    //         this.beginChange();
    //         this._focusedRowBorderColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get valueRecentlyModifiedBorderColor() { return this._valueRecentlyModifiedBorderColor; }
    // set valueRecentlyModifiedBorderColor(value: GridSettings.Color) {
    //     if (value !== this._valueRecentlyModifiedBorderColor) {
    //         this.beginChange();
    //         this._valueRecentlyModifiedBorderColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get valueRecentlyModifiedUpBorderColor() { return this._valueRecentlyModifiedUpBorderColor; }
    // set valueRecentlyModifiedUpBorderColor(value: GridSettings.Color) {
    //     if (value !== this._valueRecentlyModifiedUpBorderColor) {
    //         this.beginChange();
    //         this._valueRecentlyModifiedUpBorderColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get valueRecentlyModifiedDownBorderColor() { return this._valueRecentlyModifiedDownBorderColor; }
    // set valueRecentlyModifiedDownBorderColor(value: GridSettings.Color) {
    //     if (value !== this._valueRecentlyModifiedDownBorderColor) {
    //         this.beginChange();
    //         this._valueRecentlyModifiedDownBorderColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get recordRecentlyUpdatedBorderColor() { return this._recordRecentlyUpdatedBorderColor; }
    // set recordRecentlyUpdatedBorderColor(value: GridSettings.Color) {
    //     if (value !== this._recordRecentlyUpdatedBorderColor) {
    //         this.beginChange();
    //         this._recordRecentlyUpdatedBorderColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    // get recordRecentlyInsertedBorderColor() { return this._recordRecentlyInsertedBorderColor; }
    // set recordRecentlyInsertedBorderColor(value: GridSettings.Color) {
    //     if (value !== this._recordRecentlyInsertedBorderColor) {
    //         this.beginChange();
    //         this._recordRecentlyInsertedBorderColor = value;
    //         this.notifyChangedViewRender();
    //         this.endChange();
    //     }
    // }

    override merge(settings: Partial<AdaptedRevgridGridSettings>) {
        this.beginChange();

        super.merge(settings);

        const requiredSettings = settings as Required<AdaptedRevgridGridSettings>; // since we only iterate over keys that exist we can assume that settings is not partial in the switch loop
        for (const key in settings) {
            // Use loop so that compiler will report error if any setting missing
            const gridSettingsKey = key as keyof AdaptedRevgridOnlyGridSettings;
            switch (gridSettingsKey) {
                case 'font':
                    this._font = requiredSettings.font;
                    break;
                case 'horizontalAlign':
                    this._horizontalAlign = requiredSettings.horizontalAlign;
                    break;
                case 'columnHeaderFont':
                    this._columnHeaderFont = requiredSettings.columnHeaderFont;
                    break;
                case 'columnHeaderHorizontalAlign':
                    this._columnHeaderHorizontalAlign = requiredSettings.columnHeaderHorizontalAlign;
                    break;
                // case 'alternateBackgroundColor':
                //     this._alternateBackgroundColor = requiredSettings.alternateBackgroundColor;
                //     break;
                // case 'focusedRowBorderWidth':
                //     this._focusedRowBorderWidth = requiredSettings.focusedRowBorderWidth;
                //     break;
                // case 'grayedOutForegroundColor':
                //     this._grayedOutForegroundColor = requiredSettings.grayedOutForegroundColor;
                //     break;
                // case 'focusedRowBackgroundColor':
                //     this._focusedRowBackgroundColor = requiredSettings.focusedRowBackgroundColor;
                //     break;
                // case 'focusedRowBorderColor':
                //     this._focusedRowBorderColor = requiredSettings.focusedRowBorderColor;
                //     break;
                // case 'valueRecentlyModifiedBorderColor':
                //     this._valueRecentlyModifiedBorderColor = requiredSettings.valueRecentlyModifiedBorderColor;
                //     break;
                // case 'valueRecentlyModifiedUpBorderColor':
                //     this._valueRecentlyModifiedUpBorderColor = requiredSettings.valueRecentlyModifiedUpBorderColor;
                //     break;
                // case 'valueRecentlyModifiedDownBorderColor':
                //     this._valueRecentlyModifiedDownBorderColor = requiredSettings.valueRecentlyModifiedDownBorderColor;
                //     break;
                // case 'recordRecentlyUpdatedBorderColor':
                //     this._recordRecentlyUpdatedBorderColor = requiredSettings.recordRecentlyUpdatedBorderColor;
                //     break;
                // case 'recordRecentlyInsertedBorderColor':
                //     this._recordRecentlyInsertedBorderColor = requiredSettings.recordRecentlyInsertedBorderColor;
                //     break;

                default: {
                    gridSettingsKey satisfies never;
                }
            }
        }

        this.endChange();
    }

    override clone() {
        const copy = new InMemoryAdaptedRevgridBehavioredGridSettings();
        copy.merge(this);
        return copy;
    }
}
