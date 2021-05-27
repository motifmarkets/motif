/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { RoutedIvemId } from 'src/adi/internal-api';
import { SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import { UiAction } from 'src/core/internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { RoutedIvemIdComponentBaseNgDirective } from '../../ng/routed-ivem-id-component-base-ng.directive';

@Component({
    selector: 'app-routed-ivem-id-input',
    templateUrl: './routed-ivem-id-input-ng.component.html',
    styleUrls: ['./routed-ivem-id-input-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutedIvemIdInputNgComponent extends RoutedIvemIdComponentBaseNgDirective {
    @Input() inputId: string;
    @Input() size = '12';

    @ViewChild('routedIvemIdInput', { static: true }) private symbolInput: ElementRef;

    constructor(
        private _renderer: Renderer2,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsManagerService: SymbolsNgService
    ) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
            symbolsManagerService);
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

    protected applyValue(value: RoutedIvemId | undefined, selectAll: boolean = true) {
        if (!this.uiAction.edited) {
            super.applyValue(value, selectAll);
            if (selectAll) {
                // delay1Tick(() => this.selectAllText() );
            }
        }
    }

    private selectAllText() {
        (this.symbolInput.nativeElement as HTMLInputElement).select();
    }
}
