/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ColorScheme, ColorSettings, SettingsService } from '@motifmarkets/motif-core';
import Toastify from 'toastify-js';

export class ToastService {
    private readonly _colorSettings: ColorSettings;

    constructor(settingsService: SettingsService) {
        this._colorSettings = settingsService.color;
    }

    popup(text: string) {
        Toastify({
            text,
            gravity: 'bottom',
            duration: 7000,
            close: true,
            style: {
                'background': this._colorSettings.getBkgd(ColorScheme.ItemId.Toast),
                'color': this._colorSettings.getFore(ColorScheme.ItemId.Toast),
            },
        }).showToast();
    }
}
