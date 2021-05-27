/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SequenceHistory } from 'src/core/internal-api';
import { SequenceHistory as SequenceHistoryApi } from 'src/extensions/api/extension-api';
import { BadnessImplementation } from '../../sys/internal-api';

export abstract class SequenceHistoryImplementation implements SequenceHistoryApi {
    get actual() { return this._baseActual; }

    badnessChangeEventer: SequenceHistoryApi.BadnessChangeEventHandler | undefined;

    get badness() { return BadnessImplementation.toApi(this._baseActual.badness); }
    get good() { return this._baseActual.good; }
    get usable() { return this._baseActual.usable; }

    constructor(private readonly _baseActual: SequenceHistory) {
        this._baseActual.badnessChangeEvent = () => this.handleBadnessChangeEvent();
    }

    finalise() {
        this.badnessChangeEventer = undefined;
    }

    private handleBadnessChangeEvent() {
        if (this.badnessChangeEventer !== undefined) {
            this.badnessChangeEventer();
        }
    }
}
