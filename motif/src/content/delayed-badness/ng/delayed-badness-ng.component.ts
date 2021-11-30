/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import {
    Badness, ColorScheme, ColorSettings, Correctness,
    CorrectnessId,
    HtmlTypes,
    Integer,
    mSecsPerSec,
    MultiEvent, SettingsService, TimeSpan,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { DelayedBadnessComponent } from '../delayed-badness-component';

@Component({
    selector: 'app-delayed-badness',
    templateUrl: './delayed-badness-ng.component.html',
    styleUrls: ['./delayed-badness-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DelayedBadnessNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, DelayedBadnessComponent {
    delayTimeSpan: TimeSpan = DelayedBadnessNgComponent.defaultDelayTimeSpan;

    public bkgdColor = 'inherit';
    public foreColor = 'inherit';
    public display = HtmlTypes.Display.None;
    public displayText = '';

    private _settingsService: SettingsService;
    private _colorSettings: ColorSettings;
    private _settingsChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _badness: Badness | undefined = Badness.notBad;
    private _text: string | undefined;
    private _correctnessId: CorrectnessId | undefined;
    private _visible = false;
    private _visibleDelayActive = false;
    private _visibleDelayTransactionId = 0;

    constructor(private _cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super();
        this._settingsService = settingsNgService.settingsService;
        this._colorSettings = this._settingsService.color;

        this._settingsChangeSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.handleSettingsChangeEvent()
        );
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangeSubscriptionId);
    }

    setBadness(badness: Badness | string | undefined, correctnessId?: CorrectnessId) {
        this.internalSetBadnessCorrectness(badness, correctnessId);
        const resolvedCorrectnessId = this.resolveCorrectnessId();
        this.processSetBadness(resolvedCorrectnessId);
    }

    hideWithVisibleDelay(badness: Badness | string | undefined, correctnessId?: CorrectnessId) {
        this.internalSetBadnessCorrectness(badness, correctnessId);
        const resolvedCorrectnessId = this.resolveCorrectnessId();

        if (resolvedCorrectnessId === CorrectnessId.Error) {
            this.processSetBadness(resolvedCorrectnessId);
        } else {
            this.checkPushNotVisible();

            this._visibleDelayActive = true;
            const transactionId = ++this._visibleDelayTransactionId;
            setTimeout(() => this.processVisibleDelayExpired(transactionId), this.delayTimeSpan);
        }
    }

    private handleSettingsChangeEvent() {
        this.updateColor();
    }

    private internalSetBadnessCorrectness(value: string | Badness | undefined, correctnessId: CorrectnessId | undefined) {
        if (typeof value === 'string') {
            this._text = value;
            this._badness = undefined;
        } else {
            this._badness = value;
            this._text = undefined;
        }
        this._correctnessId = correctnessId;
    }

    private processSetBadness(resolvedCorrectnessId: CorrectnessId) {
        const displayText = this.generateDisplayText();
        this.updateColor();
        if (Correctness.idIsUsable(resolvedCorrectnessId)) {
            this.displayText = displayText;
            this.checkPushNotVisible();
        } else {
            if (this._visible) {
                this.checkPushDisplayText(displayText);
            } else {
                if (this._visibleDelayActive && resolvedCorrectnessId !== CorrectnessId.Error) {
                    this.displayText = displayText;
                } else {
                    this.checkPushDisplayText(displayText);
                    this.pushVisible();
                }
            }
        }
    }

    private checkPushColor(bkgdColor: string, foreColor: string) {
        if (foreColor !== this.foreColor || bkgdColor !== this.bkgdColor) {
            this.bkgdColor = bkgdColor;
            this.foreColor = foreColor;
            this._cdr.markForCheck();
        }
    }

    private checkPushDisplayText(text: string) {
        if (text !== this.displayText) {
            this.displayText = text;
            this._cdr.markForCheck();
        }
    }

    private checkPushNotVisible() {
        if (this._visible) {
            this.display = HtmlTypes.Display.None;
            this._cdr.markForCheck();
            this._visible = false;
        }
    }

    private pushVisible() {
        this.display = HtmlTypes.Display.Block;
        this._cdr.markForCheck();
        this._visible = true;
    }

    private checkPushVisible() {
        if (!this._visible) {
            this.pushVisible();
        }
    }

    private updateColor() {
        let foreColor: string;
        let bkgdColor: string;
        const resolvedCorrectnessId = this.resolveCorrectnessId();
        switch (resolvedCorrectnessId) {
            case CorrectnessId.Good:
                foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Panel);
                bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Panel);
                break;
            case CorrectnessId.Usable:
                foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Caution_UsableButNotGood);
                bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Caution_UsableButNotGood);
                break;
            case CorrectnessId.Suspect:
                foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Caution_Suspect);
                bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Caution_Suspect);
                break;
            case CorrectnessId.Error:
                foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Caution_Error);
                bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Caution_Error);
                break;
            default:
                throw new UnreachableCaseError('DBCUCD10094446', resolvedCorrectnessId);
        }

        if (!this._visible) {
            this.bkgdColor = bkgdColor;
            this.foreColor = foreColor;
        } else {
            this.checkPushColor(bkgdColor, foreColor);
        }
    }

    private processVisibleDelayExpired(transactionId: Integer) {
        if (transactionId === this._visibleDelayTransactionId) {
            const resolvedCorrectnessId = this.resolveCorrectnessId();
            if (Correctness.idIsUsable(resolvedCorrectnessId)) {
                this.checkPushNotVisible();
            } else {
                const text = this.generateDisplayText();
                this.checkPushDisplayText(text);
                this.checkPushVisible();
            }
            this._visibleDelayActive = false;
        }
    }

    private resolveCorrectnessId() {
        let correctnessId: CorrectnessId;
        if (this._badness !== undefined) {
            correctnessId = Badness.getCorrectnessId(this._badness);
        } else {
            if (this._text !== undefined) {
                if (this._correctnessId !== undefined) {
                    correctnessId = this._correctnessId;
                } else {
                    correctnessId = CorrectnessId.Error;
                }
            } else {
                correctnessId = CorrectnessId.Good;
            }
        }
        return correctnessId;
    }

    private generateDisplayText() {
        if (this._badness !== undefined) {
            return Badness.generateText(this._badness);
        } else {
            if (this._text !== undefined) {
                return this._text;
            } else {
                return Badness.generateText(Badness.notBad);
            }
        }
    }
}

export namespace DelayedBadnessNgComponent {
    export const defaultDelayTimeSpan: TimeSpan = 5 * mSecsPerSec;
}
