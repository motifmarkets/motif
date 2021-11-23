/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// Scheduler allows you to create a timer which will provide a call back after a specified interval
// The timer can auto restart after the callback

// DO NOT USE unless suitable use case identified
// Currently excluded in tsconfig.app.json

import { compareNumber, SysTick } from './utils';
import { earliestBinarySearch } from './utils-search';

class FiredTimerStack {
    private list: Scheduler.TimerListEntry[];

    push(timer: Scheduler.Timer) {
        this.list.push(timer);
    }

    pop(): Scheduler.Timer | undefined {
        return this.list.pop();
    }

    undefineTimer(timer: Scheduler.Timer) {
        for (let i = 0; i < this.list.length; i++) {
            if (timer === this.list[i]) {
                this.list[i] = undefined;
                break;
            }
        }
    }
}

class Event {
    tickTime: SysTick.Time;
    timer: Scheduler.Timer;
}

export class Scheduler {
    private _eventList: Event[] = [];
    private _firedTimerStack = new FiredTimerStack();
    private _paused = false;

    get paused() {
        return this._paused;
    }

    createTimer(): Scheduler.Timer {
        return new Scheduler.Timer(this);
    }

    freeTimer(timer: Scheduler.Timer) {
        if (timer !== undefined) {
            this._firedTimerStack.undefineTimer(timer);
            timer.cancel();
        }
    }

    addEvent(timer: Scheduler.Timer, tickTime: SysTick.Time) {
        const event = new Event();
        event.timer = timer;
        event.tickTime = tickTime;
        const searchResult = earliestBinarySearch(this._eventList, event, (left, right) => compareNumber(left.tickTime, right.tickTime) );
        this._eventList.splice(searchResult.index, 0, event);
    }

    removeEvent(Timer: Scheduler.Timer) {
        for (let i = this._eventList.length - 1; i >= 0; i--) {
            if (this._eventList[i].timer === Timer) {
                this._eventList.splice(i, 1);
            }
        }
    }

    exercise() {
        if (this._eventList.length > 0 && !this._paused) {
            do {
                const currentTickTime = SysTick.now();
                const event = this._eventList[0];
                if (currentTickTime < event.tickTime) {
                    break;
                } else {
                    let timer: Scheduler.Timer | undefined;
                    timer = event.timer;
                    let restartFireTime: SysTick.Time | undefined;
                    if (!timer.active || !timer.autoRestart) {
                        restartFireTime = undefined;
                    } else {
                        restartFireTime = timer.calculateFireTime();
                    }

                    this._eventList.shift();

                    this._firedTimerStack.push(timer);
                    try {
                        timer.fire();
                    } finally {
                        timer = this._firedTimerStack.pop();
                    }

                    if (timer !== undefined) {
                        if (restartFireTime !== undefined) {
                            timer.resetFired();
                            this.addEvent(timer, restartFireTime);
                        } else {
                            timer.notifyCancelled();
                        }
                    }
                }
            } while (this._eventList.length !== 0);
        }
    }

    pause() {
        this._paused = true;
    }

    continue() {
        this._paused = false;
    }
}

export namespace Scheduler {
    export type FiredEvent = (timer: Timer) => void;

    export class Timer {
        private static sysTickCountOrigin: Date;

        interval: number; // millisecods.
        autoRestart: boolean;
        firedEvent: FiredEvent;

        private _active: boolean;
        private _fireTime: SysTick.Time;
        private _fired: boolean;

        constructor(readonly myScheduler: Scheduler) {}

        get active() {
            return this._active;
        }
        get fireTime() {
            return this._fireTime;
        }
        get fired() {
            return this._fired;
        }

        calculateFireTime(aInterval: number = -1): SysTick.Time {
            if (aInterval < 1) {
                aInterval = this.interval;
            }

            return SysTick.now() + aInterval;
        }

        start(aInterval: number = -1) { // AInterval is millisecods.
            if (aInterval < 1) {
                aInterval = this.interval;
            }

            const myFireTime = this.calculateFireTime(aInterval);

            this.cancel();

            this._fireTime = myFireTime;
            this.myScheduler.addEvent(this, this._fireTime);
            this._active = true;
        }

        cancel() {
            this.myScheduler.removeEvent(this);
            this._active = false;
            this._fired = false;
        }

        notifyCancelled() {
            this._active = false;
        }

        fire() {
            this._fired = true;
            if (this.firedEvent !== undefined) {
                this.firedEvent(this);
            }
        }

        resetFired() {
            this._fired = false;
        }
    }

    export type TimerListEntry = Timer | undefined;
}

export const scheduler = new Scheduler();
