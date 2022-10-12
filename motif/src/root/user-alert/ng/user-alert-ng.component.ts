/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { HtmlTypes, StringId, Strings, UserAlertService } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';

@Component({
    selector: 'app-user-alert',
    templateUrl: './user-alert-ng.component.html',
    styleUrls: ['./user-alert-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAlertNgComponent extends ComponentBaseNgDirective {
    public restartCaption = Strings[StringId.Restart];
    public restartReasonsText = '';
    public restartReasonCount = 0;
    public errorCountDisplay = HtmlTypes.Display.None;
    public errorCountText = '';
    public alertTexts = '';
    public hideButtonDisplay = HtmlTypes.Display.None;
    public hideCaption = Strings[StringId.Hide];

    private _alerts: UserAlertService.Alert[] = [];
    private _notCancellableCount = 0;
    private _errorCount = 0;

    constructor(private readonly _cdr: ChangeDetectorRef, private readonly _elRef: ElementRef<HTMLElement>) {
        super();
    }

    pushAlerts(alerts: UserAlertService.Alert[]) {
        alerts.reverse(); // make latest alert the first in array

        this._alerts = alerts;

        this.restartReasonsText = '';
        this.restartReasonCount = 0;
        this._notCancellableCount = 0;
        this._errorCount = 0;

        const restartReasons: string[] = [];

        for (const alert of alerts) {
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

        this._elRef.nativeElement.style.setProperty(HtmlTypes.Tags.Display, HtmlTypes.Display.Flex);
        this._cdr.markForCheck();
    }

    public restart() {
        window.location.reload();
    }

    public hide() {
        for (const alert of this._alerts) {
            alert.hide();
        }
        this._elRef.nativeElement.style.setProperty(HtmlTypes.Tags.Display, HtmlTypes.Display.None);
    }
}
