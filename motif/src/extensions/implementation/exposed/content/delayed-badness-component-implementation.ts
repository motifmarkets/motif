/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DelayedBadnessComponent } from 'src/content/internal-api';
import {
    Badness as BadnessApi,
    DelayedBadnessComponent as DelayedBadnessComponentApi,
    TimeSpan as TimeSpanApi
} from '../../../api/extension-api';
import { FactoryComponentRef } from '../component/internal-api';
import { BadnessImplementation } from '../sys/internal-api';
import { ContentComponentImplementation } from './content-component-implementation';

export class DelayedBadnessComponentImplementation extends ContentComponentImplementation implements DelayedBadnessComponentApi {
    get delayTimeSpan() { return this._actual.delayTimeSpan as TimeSpanApi; }
    set delayTimeSpan(value: TimeSpanApi) { this._actual.delayTimeSpan = value; }

    constructor(componentRef: FactoryComponentRef, private readonly _actual: DelayedBadnessComponent) {
        super(componentRef);
    }

    public setBadness(value: BadnessApi) {
        const actualBadness = BadnessImplementation.fromApi(value);
        this._actual.setBadness(actualBadness);
    }

    public hideWithVisibleDelay(badness: BadnessApi) {
        const actualBadness = BadnessImplementation.fromApi(badness);
        this._actual.hideWithVisibleDelay(actualBadness);
    }
}
