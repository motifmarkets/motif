/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { RoutedIvemId } from 'src/adi/internal-api';
import { SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import { symbolDetailCache } from 'src/core/internal-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { RoutedIvemIdComponentBaseNgDirective } from '../../ng/routed-ivem-id-component-base-ng.directive';

@Component({
    selector: 'app-symbol-name-label',
    templateUrl: './symbol-name-label-ng.component.html',
    styleUrls: ['./symbol-name-label-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymbolNameLabelNgComponent extends RoutedIvemIdComponentBaseNgDirective implements OnDestroy {
    @Input() for: string;

    private activePromiseId = 0;

    constructor(
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsManagerService: SymbolsNgService
    ) {
        super(cdr, settingsNgService.settingsService, ControlComponentBaseNgDirective.labelStateColorItemIdArray, symbolsManagerService);
    }

    ngOnDestroy() {
        this.finalise();
    }

    protected applyValue(value: RoutedIvemId | undefined, selectAll: boolean) {
        super.applyValue(value, selectAll);

        if (value === undefined) {
            this.checkApplyCaption('');
        } else {
            this.applyRoutedIvemId(value);
        }
    }

    private checkApplyCaption(value: string) {
        if (value !== this.caption) {
            this.applyCaption(value);
        }
    }

    private async applyRoutedIvemId(value: RoutedIvemId) {
        this.checkApplyCaption('');
        const litIvemId = this.symbolsManager.getBestLitIvemIdFromRoutedIvemId(value);
        const promiseId = ++this.activePromiseId;
        const detail = await symbolDetailCache.getLitIvemId(litIvemId);
        if (detail !== undefined && promiseId === this.activePromiseId) {
            const caption = detail.valid && detail.exists ? detail.name : '';
            this.checkApplyCaption(caption);
        }
    }
}
