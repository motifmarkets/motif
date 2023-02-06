/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    ViewContainerRef
} from '@angular/core';
import { ExchangeId, ExchangeSettings, ExchangesSettings, MultiEvent, SymbolsService } from '@motifmarkets/motif-core';
import { SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-exchanges-settings',
    templateUrl: './exchanges-settings-ng.component.html',
    styleUrls: ['./exchanges-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangesSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnDestroy {
    public exchanges: ExchangeSettings[];

    private _exchangesSettings: ExchangesSettings;
    private _symbolsService: SymbolsService;
    private _allowedExchangeIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService,
    ) {
        super(cdr, settingsNgService.settingsService);

        this._exchangesSettings = this.settingsService.exchanges;
        this.exchanges = this._exchangesSettings.exchanges;

        this._symbolsService = symbolsNgService.service;
        this._allowedExchangeIdsChangedSubscriptionId = this._symbolsService.subscribeAllowedExchangeIdsChangedEvent(
            () => this.handleAllowedExchangeIdsChangedEvent()
        );

        this.processSettingsChanged();
    }

    ngOnDestroy() {
        this._symbolsService.unsubscribeAllowedExchangeIdsChangedEvent(this._allowedExchangeIdsChangedSubscriptionId);
    }

    public isExchangeAllowed(exchangeId: ExchangeId) {
        return this._symbolsService.allowedExchangeIds.includes(exchangeId);
    }

    protected processSettingsChanged() {
        this.markForCheck();
    }

    private handleAllowedExchangeIdsChangedEvent() {
        this.markForCheck();
    }
}

export namespace ExchangesSettingsNgComponent {
    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(ExchangesSettingsNgComponent);
        return componentRef.instance;
    }
}
