/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { HistorySequencer, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ApiError as ApiErrorApi, HistorySequencer as HistorySequencerApi } from '../../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../../sys/internal-api';

export abstract class HistorySequencerImplementation implements HistorySequencerApi {
    get type() { return HistorySequencerImplementation.TypeId.toApi(this.actual.typeId); }
    get changeBegun() { return this.actual.changeBegun; }

    get changeBegunEventer() { return this.actual.changeBegunEvent; }
    set changeBegunEventer(value: HistorySequencerApi.ChangeBegunEventHandler | undefined) { this.actual.changeBegunEvent = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get changeEndedEventer() { return this.actual.changeEndedEvent; }
    set changeEndedEventer(value: HistorySequencerApi.ChangeEndedEventHandler | undefined) { this.actual.changeEndedEvent = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get sequencerLoadedEventer() { return this.actual.sequencerLoadedEvent; }
    set sequencerLoadedEventer(value: HistorySequencerApi.SequencerLoadedEvent | undefined) { this.actual.sequencerLoadedEvent = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get allEngineSeriesLoadedEventer() { return this.actual.allEngineSeriesLoadedEvent; }
    set allEngineSeriesLoadedEventer(value: HistorySequencerApi.AllEngineSeriesLoadedEventHandler | undefined) {
        this.actual.allEngineSeriesLoadedEvent = value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    abstract get actual(): HistorySequencer;

    finalise() {
        this.actual.changeBegunEvent = undefined;
        this.actual.changeEndedEvent = undefined;
        this.actual.sequencerLoadedEvent = undefined;
        this.actual.allEngineSeriesLoadedEvent = undefined;

        this.actual.finalise();
    }

    beginHistoriesChange() {
        this.actual.beginHistoriesChange();
    }

    endHistoriesChange() {
        this.actual.endHistoriesChange();
    }
}

export namespace HistorySequencerImplementation {
    export function baseFromApi(sequencerApi: HistorySequencerApi): HistorySequencer {
        const implementation = sequencerApi as HistorySequencerImplementation;
        return implementation.actual;
    }

    export namespace TypeId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function toApi(value: HistorySequencer.TypeId) {
            switch (value) {
                case HistorySequencer.TypeId.Interval: return HistorySequencerApi.TypeEnum.Interval;
                case HistorySequencer.TypeId.RepeatableExact: return HistorySequencerApi.TypeEnum.RepeatableExact;
                default: throw new UnreachableCaseError('HSITIU775359999', value);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function fromApi(value: HistorySequencerApi.Type) {
            const enumValue = value as HistorySequencerApi.TypeEnum;
            switch (enumValue) {
                case HistorySequencerApi.TypeEnum.Interval: return HistorySequencer.TypeId.Interval;
                case HistorySequencerApi.TypeEnum.RepeatableExact: return HistorySequencer.TypeId.RepeatableExact;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidSequencerHistory, enumValue);
            }
        }
    }
}
