/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { LabelComponentBaseNgDirective } from '../../ng/label-component-base-ng.directive';

@Component({
    selector: 'app-caption-label',
    templateUrl: './caption-label-ng.component.html',
    styleUrls: ['./caption-label-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaptionLabelNgComponent extends LabelComponentBaseNgDirective implements OnDestroy {

    @Input() for: string;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.labelStateColorItemIdArray);
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override finalise() {
        super.finalise();
    }
}
