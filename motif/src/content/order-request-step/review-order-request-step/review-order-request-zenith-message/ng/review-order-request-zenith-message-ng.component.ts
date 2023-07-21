/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { ColorScheme, ColorSettings, MultiEvent, SettingsService } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-review-order-zenith-message-definition',
    templateUrl: './review-order-request-zenith-message-ng.component.html',
    styleUrls: ['./review-order-request-zenith-message-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewOrderRequestZenithMessageNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @Input() zenithMessageTitle = '';
    @Input() zenithMessageText = '';

    public bkgdColor: string;
    public foreColor: string;

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(elRef: ElementRef<HTMLElement>, settingsNgService: SettingsNgService) {
        super(elRef, ++ReviewOrderRequestZenithMessageNgComponent.typeInstanceCreateCount);

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.updateColors());
        this.updateColors();
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
    }

    private updateColors() {
        this.bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Text_ReadonlyMultiline);
        this.foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Text_ReadonlyMultiline);
    }
}
