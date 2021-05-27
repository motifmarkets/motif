/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ContentComponent } from 'src/content/internal-api';
import { Badness, TimeSpan } from 'src/sys/internal-api';

export interface DelayedBadnessComponent extends ContentComponent {
    delayTimeSpan: TimeSpan;
    setBadness(value: Badness): void;
    hideWithVisibleDelay(badness: Badness): void;
}
