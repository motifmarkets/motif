/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Badness, CorrectnessId } from 'src/sys/internal-api';

export abstract class SequenceHistory {
    badnessChangeEvent: SequenceHistory.BadnessChangeEvent;
    becameUsableEvent: SequenceHistory.BecameUsableEvent | undefined;
    allSeriesLoadedChangedEvent: SequenceHistory.AllSeriesLoadedChanged | undefined;

    private _correctnessId = CorrectnessId.Suspect;
    private _badness = Badness.createCopy(Badness.inactive);
    private _setGoodBadnessTransactionId = 0;
    private _good = false;
    private _usable = false;
    private _error = false;

    private _allSeriesLoaded = false;

    get badness() { return this._badness; }
    get good() { return this._good; }
    get usable() { return this._usable; }
    get error() { return this._error; }
    get allSeriesLoadable() { return this._usable && !this.allSeriesLoaded; }
    get allSeriesLoaded() { return this._allSeriesLoaded; }

    loadAllEngineSeries() {
        this._allSeriesLoaded = true;
    }

    protected processUsableChanged() {
        if (this._usable) {
            this.notifyBecameUsable();
        }
    }

    protected setUnusable(badness: Badness) {
        if (Badness.isUsable(badness)) {
            throw new AssertInternalError('CLH1010992327', badness.reasonId.toString()); // must always be bad
        } else {
            this.setBadness(badness);
        }
    }

    protected setBadness(badness: Badness) {
        if (Badness.isGood(badness)) {
            this.setGood();
        } else {
            const newReasonId = badness.reasonId;
            const newReasonExtra = badness.reasonExtra;
            if (newReasonId !== this._badness.reasonId || newReasonExtra !== this.badness.reasonExtra) {
                const oldUsable = this._usable;
                const oldCorrectnessId = this._correctnessId;
                this._correctnessId = Badness.Reason.idToCorrectnessId(newReasonId);
                this._good = false;
                this._usable = this._correctnessId === CorrectnessId.Usable; // Cannot be Good
                this._error = this._correctnessId === CorrectnessId.Error;
                this._badness = {
                    reasonId: newReasonId,
                    reasonExtra: newReasonExtra,
                } as const;
                const transactionId = ++this._setGoodBadnessTransactionId;
                this.setAllSeriesLoaded(false);
                if (transactionId === this._setGoodBadnessTransactionId) {
                    this.notifyBadnessChange();
                    if (transactionId === this._setGoodBadnessTransactionId && this.usable !== oldUsable) {
                        this.processUsableChanged();
                    }
                }
            }
        }
    }

    protected requireSeriesLoading() {
        this.setAllSeriesLoaded(false);
    }


    private notifyBadnessChange() {
        this.badnessChangeEvent();
    }

    private notifyBecameUsable() {
        if (this.becameUsableEvent !== undefined) {
            this.becameUsableEvent();
        }
    }

    private notifyAllSeriesLoadedChanged() {
        if (this.allSeriesLoadedChangedEvent !== undefined) {
            this.allSeriesLoadedChangedEvent();
        }
    }

    private setAllSeriesLoaded(value: boolean) {
        if (value !== this._allSeriesLoaded) {
            this._allSeriesLoaded = value;
            this.notifyAllSeriesLoadedChanged();
        }
    }

    // setBadness can also make a DataItem Good
    private setGood() {
        if (!this._good) {
            this._correctnessId = CorrectnessId.Good;
            const oldUsable = this._usable;
            this._good = true;
            this._usable = true;
            this._error = false;
            this._badness = {
                reasonId: Badness.ReasonId.NotBad,
                reasonExtra: '',
            } as const;
            const transactionId = ++this._setGoodBadnessTransactionId;
            this.setAllSeriesLoaded(false);
            if (transactionId === this._setGoodBadnessTransactionId) {
                this.notifyBadnessChange();
                if (transactionId === this._setGoodBadnessTransactionId) {
                    if (this._usable !== oldUsable) {
                        this.processUsableChanged();
                    }
                }
            }
        }
    }
    // protected abstract processGoodChange(): void;

    abstract clearAllSeries(): void;
    abstract loadAllTickDateTimes(): void;
}

export namespace SequenceHistory {
    export type BadnessChangeEvent = (this: void) => void;
    export type BecameUsableEvent = (this: void) => void;
    export type AllSeriesLoadedChanged = (this: void) => void;
}
