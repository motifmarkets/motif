/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RoutedIvemId, UiAction } from '@motifmarkets/motif-core';
import { SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { RoutedIvemIdComponentBaseNgDirective } from '../../ng/routed-ivem-id-component-base-ng.directive';

@Component({
    selector: 'app-routed-ivem-id-input',
    templateUrl: './routed-ivem-id-input-ng.component.html',
    styleUrls: ['./routed-ivem-id-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutedIvemIdInputNgComponent extends RoutedIvemIdComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    @Input() inputId: string;
    @Input() size = '12';

    @ViewChild('routedIvemIdInput', { static: true }) private symbolInput: ElementRef;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService
    ) {
        super(
            elRef,
            ++RoutedIvemIdInputNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
            symbolsNgService
        );
    }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    onInput(value: string): void {
        this.input(value);
    }

    onEnterKeyDown(text: string): void {
        this.tryCommitText(text, UiAction.CommitTypeId.Explicit);
    }

    onChange(text: string): void {
        this.tryCommitText(text, UiAction.CommitTypeId.Implicit);
    }

    protected override applyValue(value: RoutedIvemId | undefined, edited: boolean, selectAll = true) {
        if (!edited) {
            super.applyValue(value, edited, selectAll);
            if (selectAll) {
                // delay1Tick(() => this.selectAllText() );
            }
        }
    }

    private selectAllText() {
        (this.symbolInput.nativeElement as HTMLInputElement).select();
    }
}
