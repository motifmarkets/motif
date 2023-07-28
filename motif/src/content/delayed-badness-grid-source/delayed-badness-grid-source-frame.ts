/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from '@motifmarkets/motif-core';
import { GridSourceFrame } from '../grid-source/internal-api';

export abstract class DelayedBadnessGridSourceFrame extends GridSourceFrame {
    protected declare readonly _componentAccess: DelayedBadnessGridSourceFrame.ComponentAccess

    protected override setBadness(value: Badness) {
        this._componentAccess.setBadness(value);
    }

    protected override hideBadnessWithVisibleDelay(badness: Badness) {
        this._componentAccess.hideBadnessWithVisibleDelay(badness);
    }
}

export namespace DelayedBadnessGridSourceFrame {
    export interface ComponentAccess extends GridSourceFrame.ComponentAccess {
        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
