/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, OnDestroy, ViewContainerRef } from '@angular/core';
import { ExchangeId } from 'src/adi/internal-api';
import { SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import { ExchangeSettings, ExchangesSettings, SymbolsService } from 'src/core/internal-api';
import { MultiEvent } from 'src/sys/multi-event';
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

        this._symbolsService = symbolsNgService.symbolsManager;
        this._allowedExchangeIdsChangedSubscriptionId = this._symbolsService.subscribeAllowedExchangeIdsChangedEvent(
            () => this.handleAllowedExchangeIdsChangedEvent()
        );
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
    export function create(container: ViewContainerRef, resolver: ComponentFactoryResolver) {
        container.clear();
        const factory = resolver.resolveComponentFactory(ExchangesSettingsNgComponent);
        const componentRef = container.createComponent(factory);
        return componentRef.instance as ExchangesSettingsNgComponent;
    }
}
