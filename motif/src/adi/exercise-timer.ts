/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// TODO:LOW The original Delphi Pulse would dynamically adjust the exercise
// interval according to the load. Something similar may need to be implemented here
// also.

export class ExerciseTimer {
    private readonly defaultInterval = 100;

    private _interval: number;

    private _callback: ExerciseTimer.Callback;
    private _setIntervalHandle: ReturnType<typeof setInterval> | undefined;

    private _exercising = false;

    run(callback: ExerciseTimer.Callback) {
        this._callback = callback;
        this._setIntervalHandle = setInterval(() => this.exercise());
        this._interval = this.defaultInterval;
        this.exercise();
    }

    stop() {
        if (this._setIntervalHandle !== undefined) {
            clearInterval(this._setIntervalHandle);
            this._setIntervalHandle = undefined;
        }
    }

    private exercise() {
        if (this._setIntervalHandle !== undefined) {
            if (!this._exercising) {
                this._exercising = true;
                try {
                    this._callback();
                } finally {
                    this._exercising = false;
                }
            }
        }
    }
}

export namespace ExerciseTimer {
    export type Callback = (this: void) => void;
}
