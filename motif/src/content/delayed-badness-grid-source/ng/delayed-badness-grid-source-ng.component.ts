/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Directive,
    ViewChild
} from '@angular/core';
import { Badness } from '@motifmarkets/motif-core';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { GridSourceNgDirective } from '../../grid-source/ng-api';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source-frame';

@Directive()
export abstract class DelayedBadnessGridSourceNgDirective extends GridSourceNgDirective implements DelayedBadnessGridSourceFrame.ComponentAccess {

    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;

    declare readonly frame: DelayedBadnessGridSourceFrame;

    setBadness(value: Badness) {
        this._delayedBadnessComponent.setBadness(value);
    }

    hideBadnessWithVisibleDelay(badness: Badness) {
        this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}
