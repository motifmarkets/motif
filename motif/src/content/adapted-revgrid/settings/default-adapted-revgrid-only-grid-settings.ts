/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdaptedRevgridOnlyGridSettings } from './adapted-revgrid-only-grid-settings';

/** @public */
export const defaultAdaptedRevgridOnlyGridSettings: AdaptedRevgridOnlyGridSettings = {
    // focusedRowBorderWidth: 1,

    // alternateBackgroundColor: '#2b2b2b',
    // grayedOutForegroundColor: '#595959',
    // focusedRowBackgroundColor: '#6e6835',
    // focusedRowBorderColor: '#C8B900',

    // valueRecentlyModifiedBorderColor: '#8C5F46',
    // valueRecentlyModifiedUpBorderColor: '#64FA64',
    // valueRecentlyModifiedDownBorderColor: '#4646FF',
    // recordRecentlyUpdatedBorderColor: 'orange',
    // recordRecentlyInsertedBorderColor: 'pink',
    font: '13px Tahoma, Geneva, sans-serif',
    columnHeaderFont: '12px Tahoma, Geneva, sans-serif',
    horizontalAlign: 'center',
    columnHeaderHorizontalAlign: 'center',
    focusedCellSelectColored: false,
} as const;
