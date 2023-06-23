/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdaptedRevgridOnlyColumnSettings } from './adapted-revgrid-only-column-settings';
import { defaultAdaptedRevgridOnlyGridSettings } from './default-adapted-revgrid-only-grid-settings';

/** @public */
export const defaultAdaptedRevgridOnlyColumnSettings: AdaptedRevgridOnlyColumnSettings = {
    font: defaultAdaptedRevgridOnlyGridSettings.font,
    columnHeaderFont: defaultAdaptedRevgridOnlyGridSettings.columnHeaderFont,
    horizontalAlign: defaultAdaptedRevgridOnlyGridSettings.horizontalAlign,
    columnHeaderHorizontalAlign: defaultAdaptedRevgridOnlyGridSettings.columnHeaderHorizontalAlign,
} as const;
