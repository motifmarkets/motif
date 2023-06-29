/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BehavioredGridSettings } from 'revgrid';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';

/** @public */
export interface AdaptedRevgridBehavioredGridSettings extends AdaptedRevgridGridSettings, BehavioredGridSettings {
    merge(settings: Partial<AdaptedRevgridGridSettings>): boolean;
    clone(): AdaptedRevgridBehavioredGridSettings;
}
