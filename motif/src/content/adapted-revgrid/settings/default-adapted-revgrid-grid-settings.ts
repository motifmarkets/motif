/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { defaultTextGridSettings } from 'revgrid';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { defaultAdaptedRevgridOnlyGridSettings } from './default-adapted-revgrid-only-grid-settings';

/** @public */
export const defaultAdaptedRevgridGridSettings: AdaptedRevgridGridSettings = {
    ...defaultTextGridSettings,
    ...defaultAdaptedRevgridOnlyGridSettings,
} as const;
