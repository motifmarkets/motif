/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy } from '@angular/core';
import { ColorScheme, ColorSettings, HtmlTypes, MultiEvent, SettingsService, StringId, Strings, UserAlertService } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { SettingsNgService } from 'component-services-ng-api';

@Component({
    selector: 'app-user-alert',
    templateUrl: './user-alert-ng.component.html',
    styleUrls: ['./user-alert-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAlertNgComponent extends ComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.background-color') bkgdColor: string;

    public restartable = true;
    public restartCaption = Strings[StringId.Restart];
    public restartReasonsText = '';
    public restartReasonCount = 0;
    public errorCountDisplay = HtmlTypes.Display.None;
    public errorCountText = '';
    public alertTexts = '';
    public hideButtonDisplay = HtmlTypes.Display.None;
    public hideCaption = Strings[StringId.Hide];

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;

    private _alerts: UserAlertService.Alert[] = [];
    private _notCancellableCount = 0;
    private _errorCount = 0;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        private readonly settingsNgService: SettingsNgService,
    ) {
        super(elRef, ++UserAlertNgComponent.typeInstanceCreateCount);

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());
        // this.applySettings();
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
    }

    pushAlerts(alerts: UserAlertService.Alert[]) {
        alerts.reverse(); // make latest alert the first in array

        this._alerts = alerts;
        this.alertTexts = '';

        this.restartable = true;
        this.restartReasonsText = '';
        this.restartReasonCount = 0;
        this._notCancellableCount = 0;
        this._errorCount = 0;

        const restartReasons: string[] = [];

        for (const alert of alerts) {
            if (!UserAlertService.Alert.Type.idIsRestartable(alert.typeId)) {
                this.restartable = false;
            }

            const restartReasonStringId = UserAlertService.Alert.Type.idToRestartReasonStringId(alert.typeId);
            if (restartReasonStringId !== undefined) {
                const restartReason = Strings[restartReasonStringId];
                if (!restartReasons.includes(restartReason)) {
                    restartReasons.push(restartReason);
                }
            }

            if (!UserAlertService.Alert.Type.idIsCancellable(alert.typeId)) {
                this._notCancellableCount++;
            }
            if (UserAlertService.Alert.Type.idIsError(alert.typeId)) {
                this._errorCount++;
            }

            const text = alert.text;
            if (text.length > 0) {
                if (this.alertTexts.length === 0) {
                    this.alertTexts = text;
                } else {
                    this.alertTexts = alert.text + '\n' + this.alertTexts;
                }
            }
        }

        this.restartReasonCount = restartReasons.length;
        if (this.restartReasonCount > 0) {
            this.restartReasonsText = restartReasons.join('\n');

            if (this._notCancellableCount > 0) {
                this.hideButtonDisplay = HtmlTypes.Display.None;
            } else {
                this.hideButtonDisplay = HtmlTypes.Display.Flex;
            }
        }

        if (this._errorCount > 0) {
            this.errorCountText = Strings[StringId.ErrorCount] + ': ' + this._errorCount.toString();
            this.errorCountDisplay = HtmlTypes.Display.Flex;
        }

        this.hideButtonDisplay = this._notCancellableCount > 0 ? HtmlTypes.Display.None : HtmlTypes.Display.Flex;

        this.rootHtmlElement.style.setProperty(HtmlTypes.Tags.Display, HtmlTypes.Display.Flex);
        this._cdr.markForCheck();
    }

    public restart() {
        window.location.reload();
    }

    public hide() {
        for (const alert of this._alerts) {
            alert.hide();
        }
        this.rootHtmlElement.style.setProperty(HtmlTypes.Tags.Display, HtmlTypes.Display.None);
    }

    private applySettings() {
        this.bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Panel_Alert);
    }
}
