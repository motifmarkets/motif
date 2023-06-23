/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BehavioredColumnSettings } from 'revgrid';
import { AdaptedRevgridColumnSettings } from './adapted-revgrid-column-settings';

/** @public */
export interface AdaptedRevgridBehavioredColumnSettings extends AdaptedRevgridColumnSettings, BehavioredColumnSettings {
    merge(settings: Partial<AdaptedRevgridColumnSettings>): void;
    clone(): AdaptedRevgridBehavioredColumnSettings;
}
