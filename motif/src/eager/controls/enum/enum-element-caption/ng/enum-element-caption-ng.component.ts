/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { Integer } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { EnumElementComponentBaseNgDirective } from '../../ng/enum-element-component-base-ng.directive';

@Component({
    selector: 'app-enum-element-caption',
    templateUrl: './enum-element-caption-ng.component.html',
    styleUrls: ['./enum-element-caption-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnumElementCaptionNgComponent extends EnumElementComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @Input() for: string;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++EnumElementCaptionNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray
        );
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(_value: Integer | undefined, _edited: boolean) {
        this.markForCheck();
    }
}
