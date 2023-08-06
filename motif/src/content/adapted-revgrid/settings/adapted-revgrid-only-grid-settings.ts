/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { HorizontalAlign } from 'revgrid';


/** @public */
export interface AdaptedRevgridOnlyGridSettings {
    // /** The highlight duration when all values/records are changed. 0 to disable*/
    // allChangedRecentDuration: RevRecordSysTick.Span;
    // /** The highlight duration for added values. 0 to disable*/
    // recordInsertedRecentDuration: RevRecordSysTick.Span;
    // /** The highlight duration for updated records. 0 to disable*/
    // recordUpdatedRecentDuration: RevRecordSysTick.Span;
    // /** The highlight duration for changed values. 0 to disable */
    // valueChangedRecentDuration: RevRecordSysTick.Span;

    // focusedRowBorderWidth: number;

    // alternateBackgroundColor: GridSettings.Color; // will not be needed when stripes are improved
    // grayedOutForegroundColor: GridSettings.Color;
    // focusedRowBackgroundColor: GridSettings.Color | undefined;
    // focusedRowBorderColor: GridSettings.Color | undefined;

    // valueRecentlyModifiedBorderColor: GridSettings.Color;
    // valueRecentlyModifiedUpBorderColor: GridSettings.Color;
    // valueRecentlyModifiedDownBorderColor: GridSettings.Color;
    // recordRecentlyUpdatedBorderColor: GridSettings.Color;
    // recordRecentlyInsertedBorderColor: GridSettings.Color;
    font: string;
    columnHeaderFont: string;
    horizontalAlign: HorizontalAlign;
    columnHeaderHorizontalAlign: HorizontalAlign;
    focusedCellSelectColored: boolean;
}
