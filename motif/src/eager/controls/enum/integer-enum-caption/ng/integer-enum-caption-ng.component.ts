/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy } from '@angular/core';
import { EnumUiAction, Integer } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { EnumCaptionNgComponent } from '../../ng/ng-api';

@Component({
    selector: 'app-integer-enum-caption',
    templateUrl: './integer-enum-caption-ng.component.html',
    styleUrls: ['./integer-enum-caption-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegerEnumCaptionNgComponent extends EnumCaptionNgComponent<Integer> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++IntegerEnumCaptionNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            EnumUiAction.integerUndefinedValue,
        );
    }
}
