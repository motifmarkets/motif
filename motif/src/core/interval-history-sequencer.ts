/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { WeekDay } from '@angular/common';
import {
    addDays, AssertInternalError,
    BinarySearchResult,
    ComparableList, compareDate, ComparisonResult, DayOfWeek,
    EnumInfoOutOfOrderError,
    Integer, isDateEqual, mSecsPerDay, mSecsPerHour, mSecsPerMin, mSecsPerSec, MultiEvent, newDate, newNullDate, SourceTzOffsetDateTime,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { HistorySequencer } from './history-sequencer';

export class IntervalHistorySequencer extends HistorySequencer {
    private _unitId = IntervalHistorySequencer.UnitId.Millisecond;
    private _unitCount = 60000;
    private _emptyPeriodsSkipped = false;
    private _weekendsSkipped = true;

    private _pointList = new IntervalHistorySequencer.PointList();
    private _activeIntervalIdx = 0;

    private _paddingActive: boolean;

    private _pointInsertedMultiEvent = new MultiEvent<IntervalHistorySequencer.PointInsertedEventHandler>();
    private _pointUpdatedMultiEvent = new MultiEvent<IntervalHistorySequencer.PointUpdatedEventHandler>();
    private _emptyIntervalsInsertedMultiEvent = new MultiEvent<IntervalHistorySequencer.EmptyIntervalsInsertedEventHandler>();

    constructor() {
        super(HistorySequencer.TypeId.Interval);
        this._pointList.capacityIncSize = 1000;
    }

    get unitId() { return this._unitId; }
    get unitCount() { return this._unitCount; }
    get emptyPeriodsSkipped() { return this._emptyPeriodsSkipped; }
    get weekendsSkipped() { return this._weekendsSkipped; }

    get paddingActive() { return this._paddingActive; }

    get pointList() { return this._pointList; }

    setParameters(unitId: IntervalHistorySequencer.UnitId,
        unitCount: Integer,
        emptyPeriodsSkipped: boolean,
        weekendsSkipped: boolean,
    ) {
        this.clear();

        this._unitId = unitId;
        this._unitCount = unitCount;
        this._emptyPeriodsSkipped = emptyPeriodsSkipped;
        this._weekendsSkipped = weekendsSkipped;

        if (this._unitId === IntervalHistorySequencer.UnitId.Millisecond) {
            this._paddingActive = !emptyPeriodsSkipped;
        } else {
            this._paddingActive = !emptyPeriodsSkipped || !weekendsSkipped;
        }
    }

    clear() {
        this._pointList.clear();
        this._activeIntervalIdx = 0;
    }

    addDateTime(tickDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatIndex: Integer) {
        this.beginChange();
        try {
            const intervalStart = this.calculateIntervalStart(tickDateTime.utcDate, 0);
            if (intervalStart === undefined) { // if undefined then date cannot be added (eg. Weekend when weekends not allowed)
                return false;
            } else {
                const findPointResult = this._pointList.findPoint(intervalStart, this._activeIntervalIdx);
                let index = findPointResult.index;
                if (findPointResult.found) {
                    this._activeIntervalIdx = index;
                } else {
                    const offset = tickDateTime.offset;

                    if (this._paddingActive) {
                        index = this.checkInsertEmptyIntervals(intervalStart, offset, index);
                    }

                    const point: IntervalHistorySequencer.Point = {
                        offset,
                        utcDate: intervalStart,
                    };

                    this._pointList.insert(index, point);
                }
                return true;
            }
        } finally {
            this.endChange();
        }
    }

    addTick(sourceTzOffsetDateTime: SourceTzOffsetDateTime, tickDateTimeRepeatIndex: Integer) {
        this.beginChange();
        try {
            const offset = sourceTzOffsetDateTime.offset;
            const tickDateTime = sourceTzOffsetDateTime.utcDate;
            let addTickCheckNextResult = this.addTickAndCheckNext(tickDateTime, offset);
            const resultIndex = addTickCheckNextResult.index;
            if (resultIndex >= 0) {
                this._activeIntervalIdx = resultIndex;

                while (addTickCheckNextResult.nextRequired) {
                    const nextIntervalStart = this.calculateIntervalStart(addTickCheckNextResult.intervalStart, 1);
                    if (nextIntervalStart === undefined) {
                        const errorText = `${IntervalHistorySequencer.Unit.idToName(this._unitId)} ${addTickCheckNextResult.intervalStart}`;
                        throw new AssertInternalError('IHSAT13138854', errorText);
                    } else {
                        addTickCheckNextResult = this.addTickAndCheckNext(nextIntervalStart, offset);
                    }
                }
            }
        } finally {
            this.endChange();
        }
    }

    getLastSourceTimezoneOffset() {
        if (this.pointCount === 0) {
            return undefined;
        } else {
            return this.pointList.getItem(this.pointCount - 1).offset;
        }
    }

    subscribePointInsertedEvent(handler: IntervalHistorySequencer.PointInsertedEventHandler) {
        return this._pointInsertedMultiEvent.subscribe(handler);
    }

    unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId) {
         this._pointInsertedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribePointUpdatedEvent(handler: IntervalHistorySequencer.PointUpdatedEventHandler) {
        return this._pointUpdatedMultiEvent.subscribe(handler);
    }

    unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId) {
         this._pointUpdatedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeEmptyIntervalsInsertedEvent(handler: IntervalHistorySequencer.EmptyIntervalsInsertedEventHandler) {
        return this._emptyIntervalsInsertedMultiEvent.subscribe(handler);
    }

    unsubscribeEmptyIntervalsInsertedEvent(subscriptionId: MultiEvent.SubscriptionId) {
         this._emptyIntervalsInsertedMultiEvent.unsubscribe(subscriptionId);
    }

    protected getPointCount() {
        return this._pointList.count;
    }

    private notifyPointInserted(index: Integer) {
        const handlers = this._pointInsertedMultiEvent.copyHandlers();
        let insertOrUpdateNextRequired = false;
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            if (handler(index)) {
                insertOrUpdateNextRequired = true;
            }
        }
        return insertOrUpdateNextRequired;
    }

    private notifyPointUpdated(index: Integer) {
        const handlers = this._pointUpdatedMultiEvent.copyHandlers();
        let insertOrUpdateNextRequired = false;
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            if (handler(index)) {
                insertOrUpdateNextRequired = true;
            }
        }
        return insertOrUpdateNextRequired;
    }

    private notifyEmptyIntervalsInserted(index: Integer, count: Integer) {
        const handlers = this._emptyIntervalsInsertedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            handler(index, count);
        }
    }

    private checkInsertEmptyIntervals(untilIntervalStart: Date, offset: Integer, origUntilIndex: Integer) {
        if (origUntilIndex <= 0) {
            return origUntilIndex;
        } else {
            const prevIndex = origUntilIndex - 1;
            const prevIntervalStart = this._pointList.getItem(prevIndex).utcDate;
            let intervalStart = this.calculateIntervalStart(prevIntervalStart, 1);
            if (intervalStart === undefined) {
                throw new AssertInternalError('IHSCAEI343488353');
            } else {

                if (compareDate(intervalStart, untilIntervalStart) !== ComparisonResult.LeftLessThanRight) {
                    return origUntilIndex;
                } else {
                    const intervalStartArray = new Array<Date>(100);
                    let count = 0;

                    do {
                        if (count >= intervalStartArray.length) {
                            intervalStartArray.length *= 2;
                        }
                        intervalStartArray[count++] = intervalStart;

                        const calculatedIntervalStart = this.calculateIntervalStart(intervalStart, 1);
                        if (calculatedIntervalStart === undefined) {
                            throw new AssertInternalError('IHSCAEI99923234845', intervalStart.toString());  // used to be warning
                        } else {
                            intervalStart = calculatedIntervalStart;
                        }
                    } while (compareDate(intervalStart, untilIntervalStart) === ComparisonResult.LeftLessThanRight);

                    const emptyPoints = new Array<IntervalHistorySequencer.Point>(count);
                    for (let i = 0; i < count; i++) {
                        const point: IntervalHistorySequencer.Point = {
                            utcDate: intervalStartArray[i],
                            offset,
                        };
                        emptyPoints[i] = point;
                    }
                    this._pointList.insertRange(origUntilIndex, emptyPoints);

                    this.notifyEmptyIntervalsInserted(origUntilIndex, count);

                    return origUntilIndex + count;
                }
            }
        }
    }

    private calculateIntervalStart(dateTime: Date, offset: Integer) {
        switch (this._unitId) {
            case IntervalHistorySequencer.UnitId.Millisecond:
                return this.calculateMillisecondStart(dateTime, this._unitCount, offset);

            case IntervalHistorySequencer.UnitId.Day:
                return this.calculateDayIntervalStart(dateTime, offset);

            case IntervalHistorySequencer.UnitId.Week:
                return this.calculateWeekIntervalStart(dateTime, offset);

            case IntervalHistorySequencer.UnitId.Month:
                return this.calculateMonthIntervalStart(dateTime, offset);

            case IntervalHistorySequencer.UnitId.Year:
                return this.calculateYearIntervalStart(dateTime, offset);

            default:
                throw new UnreachableCaseError('CHICISD1002955537', this._unitId);
        }
    }

    private calculateMillisecondStart(dateTime: Date, intervalCount: Integer, offset: Integer): Date {
        const hours = dateTime.getUTCHours();
        const minutes = dateTime.getUTCMinutes();
        const seconds = dateTime.getUTCSeconds();
        const milliseconds = dateTime.getUTCMilliseconds();

        const dayMilliseconds = hours * mSecsPerHour + minutes * mSecsPerMin + seconds * mSecsPerSec + milliseconds;
        const nrIntervals = Math.trunc(dayMilliseconds / intervalCount);
        const intervalDayMilliseconds = (nrIntervals + offset) * intervalCount;

        const intervalHours = Math.trunc(intervalDayMilliseconds / mSecsPerHour);
        const hourMilliseconds = intervalDayMilliseconds - intervalHours * mSecsPerHour;
        const intervalMinutes = Math.trunc(hourMilliseconds / mSecsPerMin);
        const minuteMilliseconds = hourMilliseconds - intervalMinutes * mSecsPerMin;
        const intervalSeconds = Math.trunc(minuteMilliseconds / mSecsPerSec);
        const intervalMilliseconds = minuteMilliseconds - intervalSeconds * mSecsPerSec;

        const intervalDate = new Date(dateTime.getTime());
        intervalDate.setUTCHours(intervalHours, intervalMinutes, intervalSeconds, intervalMilliseconds);

        return intervalDate;
    }

    private calculateDayIntervalStart(dateTime: Date, offset: Integer) {
        const date = newDate(dateTime);
        date.setHours(0, 0, 0, 0);
        if (this._pointList.count === 0) {
            return addDays(date, offset * this._unitCount);
        } else {
            const firstDate = newDate(this._pointList.getItem(0).utcDate);
            firstDate.setHours(0, 0, 0, 0);
            if (date.getTime() < firstDate.getTime()) {
                return addDays(date, offset * this._unitCount);
            } else {
                if (!this._weekendsSkipped) {
                    if (this._unitCount === 1) {
                        return addDays(date, offset);
                    } else {
                        const nrIntervals = (date.getTime() - firstDate.getTime()) / (this._unitCount * mSecsPerDay);
                        const wholeNrIntervals = Math.trunc(nrIntervals);
                        return addDays(firstDate, (wholeNrIntervals + offset) * this._unitCount);
                    }
                } else {
                    const weekDay = date.getDay();
                    switch (weekDay) {
                        case DayOfWeek.Saturday:
                        case DayOfWeek.Sunday:
                            return undefined;
                        default:
                            let intervalStart: Date;
                            if (this._unitCount === 1) {
                                if (offset === 0) {
                                    intervalStart = date;
                                } else {
                                    intervalStart = addDays(date, offset);
                                }
                            } else {
                                const nrDays = Math.round((date.getTime() - firstDate.getTime()) / mSecsPerDay);
                                const nrWeeks = Math.trunc((date.getTime() - firstDate.getTime()) / (mSecsPerDay * 7));
                                const firstDateWeekDay = firstDate.getDay();
                                const nrWeekEnds = (firstDateWeekDay > weekDay) ? nrWeeks + 1 : nrWeeks;

                                const nrPeriodDays = nrDays - 2 * nrWeekEnds;
                                const nrIntervals = Math.trunc(nrPeriodDays / this._unitCount);

                                const intervalStartNrPeriodDays = this._unitCount * (nrIntervals + offset);
                                const intervalStartNrWeeks = Math.trunc(intervalStartNrPeriodDays / 5);
                                const intervalStartNrDays = (intervalStartNrWeeks * 7) + (intervalStartNrPeriodDays % 5);
                                intervalStart = addDays(firstDate, intervalStartNrDays);
                            }

                            switch (intervalStart.getDay()) {
                                case DayOfWeek.Saturday:
                                case DayOfWeek.Sunday:
                                    return addDays(intervalStart, 2);
                                default:
                                    return intervalStart;
                            }
                    }
                }
            }
        }
    }

    private calculateWeekIntervalStart(dateTime: Date, offset: Integer) {
        const weekStart = this.calculateWeekStart(dateTime);
        if (this._pointList.count === 0) {
            return addDays(weekStart, offset * 7);
        } else {
            const firstDate = this._pointList.getItem(0).utcDate;
            if (dateTime.getTime() < firstDate.getTime()) {
                return addDays(weekStart, offset * 7);
            } else {
                const firstWeekStart = this.calculateWeekStart(firstDate);
                const divisor = 7 * this._unitCount * mSecsPerDay;
                const nrIntervals = (weekStart.getTime() - firstWeekStart.getTime()) / divisor;
                const wholeNrIntervals = Math.trunc(nrIntervals);
                return addDays(firstWeekStart, (wholeNrIntervals + offset) * divisor);
            }
        }
    }

    private calculateWeekStart(dateTime: Date): Date {
        let adjust = dateTime.getDay();
        if (adjust === WeekDay.Sunday) {
            adjust = 7;
        }

        const timeMillseconds = dateTime.getTime() - (adjust - 1) * mSecsPerDay;
        return new Date(timeMillseconds);
    }

    private calculateMonthIntervalStart(dateTime: Date, offset: Integer) {
        let year = dateTime.getUTCFullYear();
        const month = dateTime.getUTCMonth();
        const nrIntervalsFromStartOfYear = Math.trunc((month - 1) / this._unitCount);
        let intervalStartMonth = (nrIntervalsFromStartOfYear + offset) * this._unitCount;
        const overflowYears = Math.trunc(intervalStartMonth / 12);
        if (overflowYears > 0) {
            intervalStartMonth -= (overflowYears * 12);
            year += overflowYears;
        }
        const timeMilliseconds = Date.UTC(year, intervalStartMonth, 1, 0, 0, 0, 0);
        return new Date(timeMilliseconds);
    }

    private calculateYearIntervalStart(dateTime: Date, offset: Integer) {
        let year = dateTime.getUTCFullYear();
        const nrIntervals = Math.trunc(year / this._unitCount);
        year = (nrIntervals + offset) * this._unitCount;
        const timeMilliseconds = Date.UTC(year, 0, 1, 0, 0, 0, 0);
        return new Date(timeMilliseconds);
    }

    private addTickAndCheckNext(tickDateTime: Date, offset: Integer): IntervalHistorySequencer.AddTickCheckNextResult {
        const intervalStart = this.calculateIntervalStart(tickDateTime, 0);
        if (intervalStart === undefined) { // if undefined then date cannot be added (eg. Weekend when weekends not allowed)
            return {
                index: -1,
                intervalStart: newNullDate(),
                nextRequired: false,
            };
        } else {
            const findPointResult = this._pointList.findPoint(intervalStart, this._activeIntervalIdx);
            let index = findPointResult.index;
            let nextRequired: boolean;

            if (findPointResult.found) {
                nextRequired = this.notifyPointUpdated(index);
                this._activeIntervalIdx = index;
            } else {
                if (this._paddingActive) {
                    index = this.checkInsertEmptyIntervals(intervalStart, offset, index);
                }

                const point: IntervalHistorySequencer.Point = {
                    offset,
                    utcDate: intervalStart,
                };

                this._pointList.insert(index, point);

                nextRequired = this.notifyPointInserted(index);
            }

            return {
                index,
                intervalStart,
                nextRequired,
            };
        }
    }
}

export namespace IntervalHistorySequencer {
    export const enum UnitId {
        Millisecond,
        Day,
        Week,
        Month,
        Year,
    }

    export interface AddTickCheckNextResult {
        index: Integer;
        intervalStart: Date;
        nextRequired: boolean;
    }

    export interface IntervalSeries {
    }

    export type PointInsertedEventHandler = (this: void, index: Integer) => boolean;
    export type PointUpdatedEventHandler = (this: void, index: Integer) => boolean;
    export type EmptyIntervalsInsertedEventHandler = (this: void, index: Integer, count: Integer) => void;

    export interface Point extends HistorySequencer.Point {
    }

    export class PointList extends ComparableList<Point> {
        private _searchPoint: PointList.SearchPoint = {
            utcDate: new Date(0),
            offset: -1,
        };

        constructor() {
            super(PointList.comparePointByUtcDate);
        }

        findPoint(dateTime: Date, suggestedIndex: Integer): BinarySearchResult {
            const count = this.count;
            if (count === 0) {
                // empty - need to check this first
                return {
                    found: false,
                    index: 0,
                };
            } else {
                if (this.isDateTimeEqual(suggestedIndex, dateTime)) {
                    // current interval being added to
                    return {
                        found: true,
                        index: suggestedIndex,
                    };
                } else {
                    const lastIdx = count - 1;
                    if (this.compareDateTime(lastIdx, dateTime) === ComparisonResult.LeftLessThanRight) {
                        // new interval at end
                        return {
                            found: false,
                            index: count,
                        };
                    } else {
                        if (count > 1) {
                            const secondLastIdx = count - 2;
                            if (this.isDateTimeEqual(secondLastIdx, dateTime)) {
                                return {
                                    found: true,
                                    index: secondLastIdx,
                                };
                            }
                        }
                        this._searchPoint.utcDate = dateTime;
                        return super.binarySearch(this._searchPoint);
                    }
                }
            }
        }

        private isDateTimeEqual(index: Integer, dateTime: Date) {
            const item = this.getItem(index);
            const itemDateTime = item.utcDate;

            return isDateEqual(itemDateTime, dateTime);
        }

        private compareDateTime(index: Integer, dateTime: Date) {
            const item = this.getItem(index);
            const itemDateTime = item.utcDate;

            return compareDate(itemDateTime, dateTime);
        }
    }

    export namespace PointList {
        // SearchPoint has same shape as Point but utcDate is writeable
        export interface SearchPoint {
            utcDate: Date;
            readonly offset: Integer;
        }

        export function comparePointByUtcDate(left: Point, right: Point): Integer {
            return compareDate(left.utcDate, right.utcDate);
        }
    }

    export namespace Unit {
        export type Id = UnitId;

        export const enum JsonValue {
            Millisecond = 'millisecond',
            Day = 'day',
            Week = 'week',
            Month = 'month',
            Year = 'year',
        }

        interface Info {
            readonly id: Id;
            readonly jsonValue: JsonValue;
        }

        type InfosObject = { [id in keyof typeof UnitId]: Info };

        const infosObject: InfosObject = {
            Millisecond: {
                id: UnitId.Millisecond,
                jsonValue: JsonValue.Millisecond,
            },
            Day: {
                id: UnitId.Day,
                jsonValue: JsonValue.Day,
            },
            Week: {
                id: UnitId.Week,
                jsonValue: JsonValue.Week,
            },
            Month: {
                id: UnitId.Month,
                jsonValue: JsonValue.Month,
            },
            Year: {
                id: UnitId.Year,
                jsonValue: JsonValue.Year,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            for (let id = 0; id < idCount; id++ ) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('IntervalHistorySequencer.UnitId', id, infos[id].jsonValue);
                }
            }
        }

        export function idToName(id: Id) {
            return idToJsonValue(id);
        }

        export function idToJsonValue(id: Id) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(jsonValue: JsonValue) {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].jsonValue === jsonValue) {
                    return id;
                }
            }
            return undefined;
        }
    }
}

export namespace IntervalHistorySequencerModule {
    export function initialiseStatic() {
        IntervalHistorySequencer.Unit.initialise();
    }
}
