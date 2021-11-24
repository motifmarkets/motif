/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ContentComponent } from 'content-internal-api';
import { Badness, TimeSpan } from 'sys-internal-api';

export interface DelayedBadnessComponent extends ContentComponent {
    delayTimeSpan: TimeSpan;
    setBadness(value: Badness): void;
    hideWithVisibleDelay(badness: Badness): void;
}
