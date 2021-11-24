/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, EnumInfoOutOfOrderError, Integer, MultiEvent, SourceTzOffsetDateTime } from 'sys-internal-api';
import { SequenceHistory } from './sequence-history';

export abstract class HistorySequencer {
    changeBegunEvent: HistorySequencer.ChangeBegunEventHandler | undefined;
    changeEndedEvent: HistorySequencer.ChangeEndedEventHandler | undefined;
    sequencerLoadedEvent: HistorySequencer.SequencerLoadedEvent | undefined;
    allEngineSeriesLoadedEvent: HistorySequencer.AllEngineSeriesLoadedEventHandler | undefined;

    private _histories: SequenceHistory[] = [];

    private _changeBeginCount = 0;
    private _changeBegun = false;

    private _historiesChangeBeginCount = 0;
    private _historiesChangeBegun = false;
    private _begunRegisterCount = 0;
    private _begunDeregisterCount = 0;
    private _allHistoriesUsableTimerActive = false;
    private _allHistoriesUsableTransactionId = 0;
    private _moreHistoriesRegisteredWhileAllHistoriesUsableTimerActive = false;

    private _allSeriesLoading = false;

    private _emptyPointsInsertMultiEvent = new MultiEvent<HistorySequencer.EmptyPointsInsertEventHandler>();

    constructor(private _typeId: HistorySequencer.TypeId) { }

    get typeId() { return this._typeId; }
    get changeBegun() { return this._changeBegun; }
    get allSeriesLoading() { return this._allSeriesLoading; }
    get pointCount() { return this.getPointCount(); }

    private get historiesChangeBegun() { return this._historiesChangeBegun; }

    finalise() {
        if (this._histories.length > 0) {
            throw new AssertInternalError('HSF10049387834');
        } else {
            this.clear();
            this.cancelAllHistoriesUsableTimer();
        }
    }

    beginChange() {
        if (this._changeBeginCount++ === 0) {
            this._changeBegun = true;
            this.notifyChangeBegun();
        }
    }

    endChange() {
        if (--this._changeBeginCount === 0) {
            this._changeBegun = false;
            this.notifyChangeEnded();
        }
    }

    beginHistoriesChange() {
        this.beginChange();
        if (this._historiesChangeBeginCount++ === 0) {
            this.processHistoriesChangeBegun();
        }
    }

    endHistoriesChange() {
        if (--this._historiesChangeBeginCount === 0) {
            this.processHistoriesChangeEnded();
        }
        this.endChange();
    }

    registerHistory(history: SequenceHistory) {
        this.beginHistoriesChange();
        try {
            this._begunRegisterCount++;
            this._histories.push(history);
            history.becameUsableEvent = () => this.handleHistoryBecameUsableEvent();
            history.allSeriesLoadedChangedEvent = () => this.handleHistoryAllSeriesLoadedChangedEvent();
        } finally {
            this.endHistoriesChange();
        }
    }

    deregisterHistory(history: SequenceHistory) {
        this.beginHistoriesChange();
        try {
            const idx = this._histories.indexOf(history);
            if (idx < 0) {
                throw new AssertInternalError('HSDH15594833');
            } else {
                this._begunDeregisterCount++;
                history.becameUsableEvent = undefined;
                history.allSeriesLoadedChangedEvent = undefined;
                this._histories.splice(idx, 1);
            }
        } finally {
            this.endHistoriesChange();
        }
    }

    protected notifyEmptyPointsInsert(index: Integer, pointStartArray: Date[]) {
        const handlers = this._emptyPointsInsertMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            handler(index, pointStartArray);
        }
    }

    private handleHistoryBecameUsableEvent() {
        this.beginHistoriesChange();
        this.endHistoriesChange();
    }

    private handleHistoryAllSeriesLoadedChangedEvent() {
        this.processHistoryAllSeriesLoadedChanged();
    }

    private handleAllHistoriesUsableTimeout(transactionId: Integer) {
        if (transactionId === this._allHistoriesUsableTransactionId++) {
            this.processAllHistoriesUsableTimeout();
        }
    }

    private notifyChangeBegun() {
        if (this.changeBegunEvent !== undefined) {
            this.changeBegunEvent();
        }
    }

    private notifyChangeEnded() {
        if (this.changeEndedEvent !== undefined) {
            this.changeEndedEvent();
        }
    }

    private notifySequencerLoaded() {
        if (this.sequencerLoadedEvent !== undefined) {
            this.sequencerLoadedEvent();
        }
    }

    private notifyAllEngineSeriesLoaded() {
        if (this.allEngineSeriesLoadedEvent !== undefined) {
            this.allEngineSeriesLoadedEvent();
        }
    }

    private calculateUnusableHistoriesCount() {
        return this._histories.reduce((total, history) => total += !history.usable ? 1 : 0, 0);
    }

    private calculateLoadableHistoriesCount() {
        return this._histories.reduce((total, history) => total += history.allSeriesLoadable ? 1 : 0, 0);
    }

    private startAllHistoriesUsableTimer() {
        this._allHistoriesUsableTimerActive = true;
        const allHistoriesUsableTransactionId = ++this._allHistoriesUsableTransactionId;
        setTimeout(() => this.handleAllHistoriesUsableTimeout(allHistoriesUsableTransactionId),
            HistorySequencer.AllHistoriesUsableTimeout);
    }

    private cancelAllHistoriesUsableTimer() {
        this._allHistoriesUsableTransactionId++; // will prevent call back from having any effect
        this._allHistoriesUsableTimerActive = false;
        this._moreHistoriesRegisteredWhileAllHistoriesUsableTimerActive = false;
    }

    private processHistoryAllSeriesLoadedChanged() {
        // ensure this change is processed
        this.beginHistoriesChange();
        this.endHistoriesChange();
    }

    private processAllHistoriesUsableTimeout() {
        if (!this._allHistoriesUsableTimerActive) {
            throw new AssertInternalError('HSPIHIT1339544588');
        } else {
            this._allHistoriesUsableTimerActive = false;
            const unusableCount = this.calculateUnusableHistoriesCount();
            const loadableCount = this.calculateLoadableHistoriesCount();

            if (unusableCount > 1 && this._moreHistoriesRegisteredWhileAllHistoriesUsableTimerActive) {
                if (loadableCount > 0) {
                    // do not want any further delay if nothing loadable so far
                    this.startAllHistoriesUsableTimer();
                }
            }

            this._moreHistoriesRegisteredWhileAllHistoriesUsableTimerActive = false;

            if (loadableCount > 0) {
                this.loadAllSeries();
            }
        }
    }

    private processHistoriesChangeBegun() {
        this._begunRegisterCount = 0;
        this._begunDeregisterCount = 0;
        this._historiesChangeBegun = true;
    }

    private processHistoriesChangeEnded() {
        let loadRequired = this._begunDeregisterCount > 0;

        const unusableCount = this.calculateUnusableHistoriesCount();
        const loadableCount = this.calculateLoadableHistoriesCount();

        if (this._allHistoriesUsableTimerActive) {
            if (unusableCount > 0) {
                if (this._begunRegisterCount > 0) {
                    this._moreHistoriesRegisteredWhileAllHistoriesUsableTimerActive = true;
                }
            } else {
                this.cancelAllHistoriesUsableTimer();
                if (loadableCount > 0) {
                    loadRequired = true;
                }
            }
        } else {
            if (loadableCount > 0) {
                loadRequired = true;
            }

            switch (unusableCount) {
                case 0:
                    // do nothing
                    break;
                case 1:
                    // do nothing as will be processed when usable
                    break;
                default:
                    this.startAllHistoriesUsableTimer();
            }
        }

        this._begunRegisterCount = 0;
        this._begunDeregisterCount = 0;
        this._historiesChangeBegun = false;

        if (loadRequired) {
            this.loadAllSeries();
        }
    }

    private loadAllSeries() {
        this.beginChange();
        try {
            this._allSeriesLoading = true;
            try {
                for (const history of this._histories) {
                    history.clearAllSeries();
                }

                this.clear();

                for (const history of this._histories) {
                    if (history.allSeriesLoadable) {
                        history.loadAllTickDateTimes();
                    }
                }

                this.notifySequencerLoaded();

                for (const history of this._histories) {
                    if (history.allSeriesLoadable) {
                        history.loadAllEngineSeries();
                    }
                }

                this.notifyAllEngineSeriesLoaded();

            } finally {
                this._allSeriesLoading = false;
            }

        } finally {
            this.endChange();
        }
    }

    abstract addDateTime(dateTime: SourceTzOffsetDateTime, tickDateTimeRepeatCount: Integer): boolean;
    abstract addTick(tickDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatCount: Integer): void;

    abstract clear(): void;

    abstract getLastSourceTimezoneOffset(): Integer | undefined;

    protected abstract getPointCount(): Integer;
}

export namespace HistorySequencer {
    export const enum TypeId {
        Interval,
        RepeatableExact,
    }

    export type Point = SourceTzOffsetDateTime;

    export const AllHistoriesUsableTimeout = 1500; // 1.5 seconds

    export type EmptyPointsInsertEventHandler = (this: void, index: Integer, intervalStartArray: Date[]) => void;
    export type ChangeBegunEventHandler = (this: void) => void;
    export type ChangeEndedEventHandler = (this: void) => void;
    export type SequencerLoadedEvent= (this: void) => void;
    export type AllEngineSeriesLoadedEventHandler = (this: void) => void;

    export namespace Type {
        export type Id = TypeId;

        export const enum JsonValue {
            Interval = 'interval',
            RepeatableExact = 'repeatableExact',
        }

        interface Info {
            readonly id: TypeId;
            readonly jsonValue: JsonValue;
        }

        type InfosObject = { [id in keyof typeof JsonValue]: Info };

        const infosObject: InfosObject = {
            Interval: {
                id: TypeId.Interval,
                jsonValue: JsonValue.Interval,
            },
            RepeatableExact: {
                id: TypeId.RepeatableExact,
                jsonValue: JsonValue.RepeatableExact,
            },
        };

        const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info, id) => info.id !== id);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('HistorySequencer.TypeId', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function idToJsonValue(id: Id) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: JsonValue) {
            const info = infos.find((infoElement) => infoElement.jsonValue === value);
            return info?.id;
        }
    }
}

export namespace HistorySequencerModule {
    export function initialiseStatic() {
        HistorySequencer.Type.initialise();
    }
}
