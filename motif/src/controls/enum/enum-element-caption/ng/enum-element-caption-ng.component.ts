/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { EnumElementComponentBaseNgDirective } from '../../ng/enum-element-component-base-ng.directive';

@Component({
    selector: 'app-enum-element-caption',
    templateUrl: './enum-element-caption-ng.component.html',
    styleUrls: ['./enum-element-caption-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnumElementCaptionNgComponent extends EnumElementComponentBaseNgDirective implements OnDestroy {

    @Input() for: string;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.labelStateColorItemIdArray);
    }

    ngOnDestroy() {
        this.finalise();
    }
}
