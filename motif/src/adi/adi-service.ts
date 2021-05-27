/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SysTick } from 'src/sys/internal-api';
import { DataDefinition } from './common/internal-api';
import { DataItem } from './data-item';
import { DataMgr } from './data-mgr';
import { ExerciseTimer } from './exercise-timer';

export class AdiService {
    private _dataMgr: DataMgr;
    private _exerciseTimer: ExerciseTimer;

    constructor() {
        this._dataMgr = new DataMgr();

        // Finally...
        this._exerciseTimer = new ExerciseTimer();
    }

    get dataMgr() { return this._dataMgr; }

    start() {
        this._exerciseTimer.run(() => this.exercise());
    }

    stop() {
        this._exerciseTimer.stop();
    }

    pause() {
        // not supported on current exerciseTimer
    }

    continue() {
        // not supported on current exerciseTimer
    }

    subscribe(dataDefinition: DataDefinition): DataItem {
        return this._dataMgr.subscribe(dataDefinition);
    }

    unsubscribe(dataItem: DataItem): void {
        this._dataMgr.unsubscribe(dataItem);
    }

    private exercise(): void {
        const NowRec = SysTick.now();

        this._dataMgr.process(NowRec);
    }
}
