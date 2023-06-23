/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { HorizontalAlign, InMemoryTextBehavioredColumnSettings } from 'revgrid';
import { AdaptedRevgridBehavioredColumnSettings } from './adapted-revgrid-behaviored-column-settings';
import { AdaptedRevgridColumnSettings } from './adapted-revgrid-column-settings';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { AdaptedRevgridOnlyColumnSettings } from './adapted-revgrid-only-column-settings';

/** @public */
export class InMemoryAdaptedRevgridBehavioredColumnSettings extends InMemoryTextBehavioredColumnSettings implements AdaptedRevgridBehavioredColumnSettings {
    declare gridSettings: AdaptedRevgridGridSettings;

    private _font: string | undefined;
    private _horizontalAlign: HorizontalAlign | undefined;
    private _columnHeaderFont: string | undefined;
    private _columnHeaderHorizontalAlign: HorizontalAlign | undefined;

    get font() { return this._font !== undefined ? this._font : this.gridSettings.font; }
    set font(value: string) {
        if (value !== this._font) {
            this.beginChange();
            this._font = value;
            this.notifyChangedViewRender();
            this.endChange();
        }
    }
    get horizontalAlign() { return this._horizontalAlign !== undefined ? this._horizontalAlign : this.gridSettings.horizontalAlign; }
    set horizontalAlign(value: HorizontalAlign) {
        if (value !== this._horizontalAlign) {
            this.beginChange();
            this._horizontalAlign = value;
            this.notifyChangedViewRender();
            this.endChange();
        }
    }
    get columnHeaderFont() { return this._columnHeaderFont !== undefined ? this._columnHeaderFont : this.gridSettings.columnHeaderFont; }
    set columnHeaderFont(value: string) {
        if (value !== this._columnHeaderFont) {
            this.beginChange();
            this._columnHeaderFont = value;
            this.notifyChangedViewRender();
            this.endChange();
        }
    }
    get columnHeaderHorizontalAlign() {
        return this._columnHeaderHorizontalAlign !== undefined ? this._columnHeaderHorizontalAlign : this.gridSettings.columnHeaderHorizontalAlign;
    }
    set columnHeaderHorizontalAlign(value: HorizontalAlign) {
        if (value !== this._columnHeaderHorizontalAlign) {
            this.beginChange();
            this._columnHeaderHorizontalAlign = value;
            this.notifyChangedViewRender();
            this.endChange();
        }
    }

    override merge(settings: Partial<AdaptedRevgridColumnSettings>) {
        this.beginChange();

        super.merge(settings);

        const requiredSettings = settings as Required<AdaptedRevgridColumnSettings>; // since we only iterate over keys that exist we can assume that settings is not partial in the switch loop
        for (const key in settings) {
            // Use loop so that compiler will report error if any setting missing
            const columnSettingsKey = key as keyof AdaptedRevgridOnlyColumnSettings;
            switch (columnSettingsKey) {
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

                default:
                    columnSettingsKey satisfies never;
            }
        }

        this.endChange();
    }

    override clone() {
        const copy = new InMemoryAdaptedRevgridBehavioredColumnSettings(this.gridSettings);
        copy.merge(this);
        return copy;
    }
}
