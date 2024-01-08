/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from './types-api';

/** @public */
export interface SourceTzOffsetDateTime {
    readonly utcDate: Date;
    readonly offset: Integer;
}

/** @public */
export namespace SourceTzOffsetDateTime {
    export const enum TimezoneModeEnum {
        Utc = 'Utc',
        Local = 'Local',
        Source = 'Source',
    }
    export type TimezoneMode = keyof typeof TimezoneModeEnum;
}
