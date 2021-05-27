/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { CoreNgService, SettingsNgService } from 'src/component-services/ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { BrokerageAccountGroupComponentBaseNgDirective } from '../../ng/brokerage-account-group-component-base-ng.directive';

@Component({
    selector: 'app-brokerage-account-group-name-label',
    templateUrl: './brokerage-account-group-name-label-ng.component.html',
    styleUrls: ['./brokerage-account-group-name-label-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrokerageAccountGroupNameLabelNgComponent extends BrokerageAccountGroupComponentBaseNgDirective implements OnDestroy {
    @Input() for: string;

    public caption = '';

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService, pulseService: CoreNgService) {
        super(cdr, settingsNgService.settingsService, pulseService, ControlComponentBaseNgDirective.clickControlStateColorItemIdArray);
    }

    ngOnDestroy() {
        this.finalise();
    }

    protected applyValueAsNamedGroup(value: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined) {
        if (value === undefined) {
            this.caption = '';
        } else {
            this.caption = value.name;
        }

        this.markForCheck();
    }
}
