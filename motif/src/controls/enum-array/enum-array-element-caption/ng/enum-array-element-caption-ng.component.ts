/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { EnumArrayElementComponentBaseNgDirective } from '../../ng/enum-array-element-component-base-ng.directive';

@Component({
    selector: 'app-enum-array-element-caption',
    templateUrl: './enum-array-element-caption-ng.component.html',
    styleUrls: ['./enum-array-element-caption-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnumArrayElementCaptionNgComponent extends EnumArrayElementComponentBaseNgDirective implements OnDestroy {

    @Input() for: string;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.service, ControlComponentBaseNgDirective.labelStateColorItemIdArray);
    }

    override ngOnDestroy() {
        this.finalise();
    }
}
