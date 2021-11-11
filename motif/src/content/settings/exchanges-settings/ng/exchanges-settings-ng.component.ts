/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { ExchangeSettings, ExchangesSettings } from 'src/core/internal-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-exchanges-settings',
    templateUrl: './exchanges-settings-ng.component.html',
    styleUrls: ['./exchanges-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangesSettingsNgComponent extends SettingsComponentBaseNgDirective {
    private _exchangesSettings: ExchangesSettings;
    public exchanges: ExchangeSettings[];

    constructor(
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
    ) {
        super(cdr, settingsNgService.settingsService);

        this._exchangesSettings = this.settingsService.exchanges;
        this.exchanges = this._exchangesSettings.exchanges;
    }

    protected processSettingsChanged() {
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
