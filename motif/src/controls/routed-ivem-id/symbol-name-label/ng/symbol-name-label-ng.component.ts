/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { AssertInternalError, RoutedIvemId, SymbolDetailCacheService } from '@motifmarkets/motif-core';
import { SettingsNgService, SymbolDetailCacheNgService, SymbolsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { RoutedIvemIdComponentBaseNgDirective } from '../../ng/routed-ivem-id-component-base-ng.directive';

@Component({
    selector: 'app-symbol-name-label',
    templateUrl: './symbol-name-label-ng.component.html',
    styleUrls: ['./symbol-name-label-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymbolNameLabelNgComponent extends RoutedIvemIdComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @Input() for: string;

    private readonly _symbolDetailCacheService: SymbolDetailCacheService;
    private activePromiseId = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService,
        symbolDetailCacheNgService: SymbolDetailCacheNgService,
    ) {
        super(
            elRef,
            ++SymbolNameLabelNgComponent.typeInstanceCreateCount,
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray,
            symbolsNgService
        );

        this._symbolDetailCacheService = symbolDetailCacheNgService.service;
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(value: RoutedIvemId | undefined, edited: boolean, selectAll: boolean) {
        super.applyValue(value, edited, selectAll);

        if (value === undefined) {
            this.checkApplyCaption('');
        } else {
            const promise = this.applyRoutedIvemId(value);
            promise.then(
                () => {/**/},
                (error) => { throw AssertInternalError.createIfNotError(error, 'SNLNCAVA43344'); }
            );
        }
    }

    private checkApplyCaption(value: string) {
        if (value !== this.caption) {
            this.applyCaption(value);
        }
    }

    private async applyRoutedIvemId(value: RoutedIvemId) {
        this.checkApplyCaption('');
        const litIvemId = this.symbolsService.getBestLitIvemIdFromRoutedIvemId(value);
        const promiseId = ++this.activePromiseId;
        const detail = await this._symbolDetailCacheService.getLitIvemId(litIvemId);
        if (detail !== undefined && promiseId === this.activePromiseId) {
            const caption = detail.valid && detail.exists ? detail.name : '';
            this.checkApplyCaption(caption);
        }
    }
}
