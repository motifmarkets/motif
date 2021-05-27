/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// import { Badness } from '../../sys/badness-api';

import { Badness } from '../../sys/badness-api';

/** @public */
export interface SequenceHistory {
    badnessChangeEventer: SequenceHistory.BadnessChangeEventHandler | undefined;
    // becameUsableEventer: SequenceHistory.BecameUsableEventHandler | undefined;
    // allSeriesLoadedChangedEventer: SequenceHistory.AllSeriesLoadedChangedEventHandler | undefined;

    readonly badness: Badness;
    readonly good: boolean;
    readonly usable: boolean;

    finalise(): void;
    // readonly error: boolean;
    // readonly allSeriesLoadable: boolean;
    // readonly allSeriesLoaded: boolean;

    // clearAllSeries(): void;
    // loadAllTickDateTimes(): void;

    // loadAllEngineSeries(): void;

}

/** @public */
export namespace SequenceHistory {
    export type BadnessChangeEventHandler = (this: void) => void;
    // export type BecameUsableEventHandler = (this: void) => void;
    // export type AllSeriesLoadedChangedEventHandler = (this: void) => void;
}
