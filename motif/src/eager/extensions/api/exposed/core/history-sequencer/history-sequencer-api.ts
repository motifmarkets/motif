/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// import { Integer, SourceTzOffsetDateTime } from '../../sys/extension-api';
// import { SequenceHistory } from './sequence-history-api';

import { SourceTzOffsetDateTime } from '../../sys/extension-api';

/** @public */
export interface HistorySequencer {
    readonly type: HistorySequencer.Type;
    readonly changeBegun: boolean;
    // readonly allSeriesLoading: boolean;

    changeBegunEventer: HistorySequencer.ChangeBegunEventHandler | undefined;
    changeEndedEventer: HistorySequencer.ChangeEndedEventHandler | undefined;
    sequencerLoadedEventer: HistorySequencer.SequencerLoadedEvent | undefined;
    allEngineSeriesLoadedEventer: HistorySequencer.AllEngineSeriesLoadedEventHandler | undefined;

    finalise(): void;

    // beginChange(): void;
    // endChange(): void;
    beginHistoriesChange(): void;
    endHistoriesChange(): void;

    // registerHistory(history: SequenceHistory): void;
    // deregisterHistory(history: SequenceHistory): void;

    // addDateTime(dateTime: SourceTzOffsetDateTime, tickDateTimeRepeatCount: Integer): boolean;
    // addTick(tickDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatCount: Integer): void;
    // clear(): void;

    // getLastSourceTimezoneOffset(): Integer | undefined;
}

/** @public */
export namespace HistorySequencer {
    export const enum TypeEnum {
        Interval = 'Interval',
        RepeatableExact = 'RepeatableExact',
    }
    export type Type = keyof typeof TypeEnum;

    export type Point = SourceTzOffsetDateTime;

    export type ChangeBegunEventHandler = (this: void) => void;
    export type ChangeEndedEventHandler = (this: void) => void;
    export type SequencerLoadedEvent= (this: void) => void;
    export type AllEngineSeriesLoadedEventHandler = (this: void) => void;
}
