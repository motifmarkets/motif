/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { EnumUiAction, Integer } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { EnumInputNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-integer-enum-input', // should be xxx-enum-select
    templateUrl: './integer-enum-input-ng.component.html',
    styleUrls: ['./integer-enum-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class IntegerEnumInputNgComponent extends EnumInputNgDirective<Integer> {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        ngSelectOverlayNgService: NgSelectOverlayNgService,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
    ) {
        super(
            elRef,
            ++IntegerEnumInputNgComponent.typeInstanceCreateCount,
            ngSelectOverlayNgService,
            cdr,
            settingsNgService.service,
            EnumUiAction.integerUndefinedValue,
        );
    }
}
