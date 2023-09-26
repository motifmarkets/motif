/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Directive,
    ViewChild
} from '@angular/core';
import { DelayedBadnessNgComponent } from '../../delayed-badness/ng-api';
import { GridSourceNgDirective } from '../../grid-source/ng-api';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source-frame';

@Directive()
export abstract class DelayedBadnessGridSourceNgDirective extends GridSourceNgDirective {
    @ViewChild('delayedBadness', { static: true }) private _delayedBadnessComponent: DelayedBadnessNgComponent;

    declare readonly frame: DelayedBadnessGridSourceFrame;

    protected override processAfterViewInit() {
        super.processAfterViewInit();
        this.frame.setBadnessEventer = (value) => this._delayedBadnessComponent.setBadness(value);
        this.frame.hideBadnessWithVisibleDelayEventer = (badness) => this._delayedBadnessComponent.hideWithVisibleDelay(badness);
    }
}
