/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { SettingsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../../ng/control-component-base-ng.directive';
import { IntegerUiActionComponentBaseNgDirective } from '../../ng/integer-ui-action-component-base-ng.directive';

@Component({
    selector: 'app-integer-label',
    templateUrl: './integer-label-ng.component.html',
    styleUrls: ['./integer-label-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegerLabelNgComponent extends IntegerUiActionComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    @Input() for: string;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(
            elRef,
            ++IntegerLabelNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray
        );
    }

    protected override applyValue(_value: number | undefined, _edited: boolean) {
        // not relevant
    }

    protected override testInputValue(_text?: string): boolean {
        // not relevant
        return true;
    }
}
