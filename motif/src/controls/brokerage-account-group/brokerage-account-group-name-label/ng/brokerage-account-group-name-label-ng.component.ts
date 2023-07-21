/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { CoreNgService, SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { BrokerageAccountGroupComponentBaseNgDirective } from '../../ng/brokerage-account-group-component-base-ng.directive';

@Component({
    selector: 'app-brokerage-account-group-name-label',
    templateUrl: './brokerage-account-group-name-label-ng.component.html',
    styleUrls: ['./brokerage-account-group-name-label-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrokerageAccountGroupNameLabelNgComponent extends BrokerageAccountGroupComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @Input() for: string;

    public override caption = '';

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService, pulseService: CoreNgService) {
        super(
            elRef,
            ++BrokerageAccountGroupNameLabelNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            pulseService,
            ControlComponentBaseNgDirective.clickControlStateColorItemIdArray
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValueAsNamedGroup(
        value: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined,
        _edited: boolean
    ) {
        if (value === undefined) {
            this.caption = '';
        } else {
            this.caption = value.name;
        }

        this.markForCheck();
    }
}
