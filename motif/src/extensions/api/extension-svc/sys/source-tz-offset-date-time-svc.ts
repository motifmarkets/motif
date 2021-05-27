/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparisonResult, SourceTzOffsetDateTime } from '../../exposed/extension-api';

/** @public */
export interface SourceTzOffsetDateTimeSvc {
    getTimezonedDate(value: SourceTzOffsetDateTime, adjustment: SourceTzOffsetDateTime.TimezoneMode): Date;
    createCopy(value: SourceTzOffsetDateTime): SourceTzOffsetDateTime;
    isEqual(left: SourceTzOffsetDateTime, right: SourceTzOffsetDateTime): boolean;
    isUndefinableEqual(left: SourceTzOffsetDateTime | undefined, right: SourceTzOffsetDateTime | undefined): boolean;
    compare(left: SourceTzOffsetDateTime, right: SourceTzOffsetDateTime): ComparisonResult;
    compareUndefinable(
        left: SourceTzOffsetDateTime | undefined,
        right: SourceTzOffsetDateTime | undefined,
        undefinedIsLowest: boolean
    ): ComparisonResult;
}
