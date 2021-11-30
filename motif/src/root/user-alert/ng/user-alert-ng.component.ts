/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { HtmlTypes, StringId, Strings, UserAlertService } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'src/component/ng-api';

@Component({
    selector: 'app-user-alert',
    templateUrl: './user-alert-ng.component.html',
    styleUrls: ['./user-alert-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAlertNgComponent extends ComponentBaseNgDirective {
    public restartDisplay = HtmlTypes.Display.Flex;
    public restartCaption = Strings[StringId.Restart];
    public errorCountDisplay = HtmlTypes.Display.None;
    public errorCountText = '';
    public restartRequiredReason = '?';
    public alertTexts = '';
    public hideButtonDisplay = HtmlTypes.Display.None;
    public hideCaption = Strings[StringId.Hide];

    private _restartRequired = false;
    private _unstableCount = 0;
    private _errorCount = 0;

    constructor(private readonly _cdr: ChangeDetectorRef, private readonly _elRef: ElementRef<HTMLElement>) {
        super();
    }

    pushAlerts(alerts: readonly UserAlertService.Alert[]) {
        for (const alert of alerts) {
            if (UserAlertService.Alert.Type.idIsRestartRequired(alert.typeId)) {
                this._restartRequired = true;
            }
            if (UserAlertService.Alert.Type.idIsUnstable(alert.typeId)) {
                this._unstableCount++;
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

        if (!this._restartRequired) {
            this.restartDisplay = HtmlTypes.Display.None;
        } else {
            if (this._unstableCount > 0) {
                this.restartRequiredReason = Strings[StringId.UnstableRestartRequired];
                this.hideButtonDisplay = HtmlTypes.Display.None;
            } else {
                this.restartRequiredReason = Strings[StringId.StableRestartRequired];
                this.hideButtonDisplay = HtmlTypes.Display.Flex;
            }
            this.restartDisplay = HtmlTypes.Display.Flex;
        }

        if (this._errorCount > 0) {
            this.errorCountText = Strings[StringId.ErrorCount] + ': ' + this._errorCount.toString();
            this.errorCountDisplay = HtmlTypes.Display.Flex;
        }

        this.hideButtonDisplay = this._unstableCount > 0 ? HtmlTypes.Display.None : HtmlTypes.Display.Flex;

        this._elRef.nativeElement.style.setProperty(HtmlTypes.Tags.Display, HtmlTypes.Display.Flex);
        this._cdr.markForCheck();
    }

    public restart() {
        window.location.reload();
    }

    public hide() {
        this._elRef.nativeElement.style.setProperty(HtmlTypes.Tags.Display, HtmlTypes.Display.None);
    }
}
