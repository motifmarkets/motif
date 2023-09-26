/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IntervalHistorySequencer, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    ComparableList as ComparableListApi,
    Integer as IntegerApi,
    IntervalHistorySequencer as IntervalHistorySequencerApi
} from '../../../../api/extension-api';
import { ComparableListImplementation, UnreachableCaseApiErrorImplementation } from '../../sys/internal-api';
import { HistorySequencerImplementation } from './history-sequencer-implementation';

export class IntervalHistorySequencerImplementation extends HistorySequencerImplementation implements IntervalHistorySequencerApi {
    constructor(private readonly _actual: IntervalHistorySequencer) {
        super();
    }

    get actual() { return this._actual; }

    get unit() { return IntervalHistorySequencerImplementation.UnitId.toApi(this._actual.unitId); }
    get unitCount() { return this._actual.unitCount; }
    get emptyPeriodsSkipped() { return this._actual.emptyPeriodsSkipped; }
    get weekendsSkipped() { return this._actual.weekendsSkipped; }

    get pointList() { return IntervalHistorySequencerImplementation.PointList.toApi(this._actual.pointList); }

    setParameters(unit: IntervalHistorySequencerApi.Unit,
        unitCount: IntegerApi,
        emptyPeriodsSkipped: boolean,
        weekendsSkipped: boolean,
    ) {
        const unitId = IntervalHistorySequencerImplementation.UnitId.fromApi(unit);
        this.actual.setParameters(unitId, unitCount, emptyPeriodsSkipped, weekendsSkipped);
    }
}

export namespace IntervalHistorySequencerImplementation {
    export function toApi(actual: IntervalHistorySequencer) {
        return new IntervalHistorySequencerImplementation(actual);
    }

    export function fromApi(value: IntervalHistorySequencerApi): IntervalHistorySequencer {
        const implementation = value as IntervalHistorySequencerImplementation;
        return implementation.actual;
    }

    export namespace UnitId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: IntervalHistorySequencer.UnitId) {
            switch (value) {
                case IntervalHistorySequencer.UnitId.Millisecond: return IntervalHistorySequencerApi.UnitEnum.Millisecond;
                case IntervalHistorySequencer.UnitId.Day: return IntervalHistorySequencerApi.UnitEnum.Day;
                case IntervalHistorySequencer.UnitId.Week: return IntervalHistorySequencerApi.UnitEnum.Week;
                case IntervalHistorySequencer.UnitId.Month: return IntervalHistorySequencerApi.UnitEnum.Month;
                case IntervalHistorySequencer.UnitId.Year: return IntervalHistorySequencerApi.UnitEnum.Year;
                default: throw new UnreachableCaseError('IHSIUITA2222993', value);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function fromApi(value: IntervalHistorySequencerApi.Unit) {
            const enumValue = value as IntervalHistorySequencerApi.UnitEnum;
            switch (enumValue) {
                case IntervalHistorySequencerApi.UnitEnum.Millisecond: return IntervalHistorySequencer.UnitId.Millisecond;
                case IntervalHistorySequencerApi.UnitEnum.Day: return IntervalHistorySequencer.UnitId.Day;
                case IntervalHistorySequencerApi.UnitEnum.Week: return IntervalHistorySequencer.UnitId.Week;
                case IntervalHistorySequencerApi.UnitEnum.Month: return IntervalHistorySequencer.UnitId.Month;
                case IntervalHistorySequencerApi.UnitEnum.Year: return IntervalHistorySequencer.UnitId.Year;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidHistorySequencerUnit, enumValue);
            }
        }
    }

    export class PointList extends ComparableListImplementation<IntervalHistorySequencerApi.Point> {
        constructor(private readonly _actual: IntervalHistorySequencer.PointList) {
            super(_actual);
        }

        findPoint(dateTime: Date, suggestedIndex: IntegerApi): ComparableListApi.BinarySearchResult {
            return this._actual.findPoint(dateTime, suggestedIndex);
        }
    }

    export namespace PointList {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: IntervalHistorySequencer.PointList): IntervalHistorySequencerApi.PointList {
            return new IntervalHistorySequencerImplementation.PointList(value);
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function fromApi(value: IntervalHistorySequencerApi.PointList) {
            const implementation = value as IntervalHistorySequencerImplementation.PointList;
            return implementation.actual;
        }
    }
}
