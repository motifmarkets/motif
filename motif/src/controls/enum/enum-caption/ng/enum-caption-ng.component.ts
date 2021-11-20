/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { Integer } from 'src/sys/internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { EnumComponentBaseNgDirective } from '../../ng/enum-component-base-ng.directive';

@Component({
    selector: 'app-enum-caption',
    templateUrl: './enum-caption-ng.component.html',
    styleUrls: ['./enum-caption-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnumCaptionNgComponent extends EnumComponentBaseNgDirective implements OnDestroy {

    @Input() for: string;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.labelStateColorItemIdArray);
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected applyValue(value: Integer | undefined) {
        this.markForCheck();
    }
}
