/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RepeatableExactHistorySequencer } from 'core-internal-api';
import {
    ComparableList as ComparableListApi,
    Integer as IntegerApi,
    RepeatableExactHistorySequencer as RepeatableExactHistorySequencerApi
} from '../../../../api/extension-api';
import { ComparableListImplementation } from '../../sys/internal-api';
import { HistorySequencerImplementation } from './history-sequencer-implementation';

export class RepeatableExactHistorySequencerImplementation extends HistorySequencerImplementation
    implements RepeatableExactHistorySequencerApi {

    constructor(private readonly _actual: RepeatableExactHistorySequencer) {
        super();
    }

    get actual() { return this._actual; }
    get pointList() { return RepeatableExactHistorySequencerImplementation.PointList.toApi(this._actual.pointList); }
}

export namespace RepeatableExactHistorySequencerImplementation {
    export function toApi(actual: RepeatableExactHistorySequencer) {
        return new RepeatableExactHistorySequencerImplementation(actual);
    }

    export function fromApi(value: RepeatableExactHistorySequencerApi) {
        const implementation = value as RepeatableExactHistorySequencerImplementation;
        return implementation.actual;
    }

    export class PointList extends ComparableListImplementation<RepeatableExactHistorySequencerApi.Point> {
        constructor(private readonly _actual: RepeatableExactHistorySequencer.PointList) {
            super(_actual);
        }

        findPoint(dateTime: Date, dateTimeRepeatIndex: IntegerApi, suggestedIndex: IntegerApi): ComparableListApi.BinarySearchResult {
            return this._actual.findPoint(dateTime, dateTimeRepeatIndex, suggestedIndex);
        }
    }

    export namespace PointList {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: RepeatableExactHistorySequencer.PointList): RepeatableExactHistorySequencerApi.PointList {
            return new RepeatableExactHistorySequencerImplementation.PointList(value);
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function fromApi(value: RepeatableExactHistorySequencerApi.PointList) {
            const implementation = value as RepeatableExactHistorySequencerImplementation.PointList;
            return implementation.actual;
        }
    }
}
