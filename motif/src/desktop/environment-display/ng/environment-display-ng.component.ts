/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy
} from '@angular/core';
import { ExchangeEnvironment, ExchangeEnvironmentId, ExchangeInfo } from 'adi-internal-api';
import { SessionInfoService } from 'component-services-internal-api';
import { SessionInfoNgService, SettingsNgService } from 'component-services-ng-api';
import { ColorScheme, ColorSettings, SessionState, SessionStateId } from 'core-internal-api';
import { StringId, Strings } from 'res-internal-api';
import { ComponentBaseNgDirective } from 'src/component/ng-api';
import { MultiEvent, UnexpectedCaseError, UnreachableCaseError } from 'sys-internal-api';

@Component({
    selector: 'app-environment-display',
    templateUrl: './environment-display-ng.component.html',
    styleUrls: ['./environment-display-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentDisplayNgComponent extends ComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    public showEnvironmentText = true;
    public environmentText = '?';
    public environmentBkgdColor = 'yellow';
    public environmentForeColor = 'black';

    private _sessionInfoService: SessionInfoService;
    private _colorSettings: ColorSettings;
    private _sessionStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _sessionKickedOffEventSubscriptionId: MultiEvent.SubscriptionId;
    private _kickedOff = false;

    constructor(
        private _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        sessionInfoNgService: SessionInfoNgService
    ) {
        super();

        this._colorSettings = settingsNgService.settingsService.color;

        this._sessionInfoService = sessionInfoNgService.service;
        this._sessionKickedOffEventSubscriptionId = this._sessionInfoService.subscribeKickedOffChangedEvent(
            () => this.handleSessionKickedOffEvent()
        );
        this._sessionStateChangeSubscriptionId = this._sessionInfoService.subscribeStateChangedEvent(
            () => this.handleSessionStateChangeEvent()
        );
    }

    ngOnDestroy() {
        this._sessionInfoService.unsubscribeKickedOffChangedEvent(
            this._sessionKickedOffEventSubscriptionId
        );
        this._sessionKickedOffEventSubscriptionId = undefined;
        this._sessionInfoService.unsubscribeStateChangedEvent(
            this._sessionStateChangeSubscriptionId
        );
        this._sessionStateChangeSubscriptionId = undefined;
    }

    ngAfterViewInit() {
        this.updateEnvironmentDisplay();
    }

    private handleSessionKickedOffEvent() {
        this._kickedOff = true;
        this.updateEnvironmentDisplay();
    }

    private handleSessionStateChangeEvent() {
        this.updateEnvironmentDisplay();
    }

    private updateEnvironmentDisplay() {
        const stateId = this._sessionInfoService.stateId;
        let colorItemId: ColorScheme.ItemId;
        const stateText = SessionState.idToDisplay(stateId);
        switch (stateId) {
            case SessionStateId.NotStarted:
            case SessionStateId.Starting: {
                this.showEnvironmentText = true;
                this.environmentText = stateText;
                colorItemId = ColorScheme.ItemId.Environment_StartFinal;
                break;
            }
            case SessionStateId.Offline: {
                const upperStateText = stateText.toUpperCase();
                const bannerEnvironmentId = this.calculateBannerExchangeEnvironmentIdIfDefined();
                this.showEnvironmentText = true;
                if (bannerEnvironmentId === undefined) {
                    this.environmentText = upperStateText;
                    colorItemId = ColorScheme.ItemId.Caution_Error;
                } else {
                    this.environmentText =
                        ExchangeEnvironment.idToDisplay(bannerEnvironmentId) +
                        ' ' +
                        upperStateText +
                        ' !!!!';

                    switch (bannerEnvironmentId) {
                        case ExchangeEnvironmentId.Production:
                            colorItemId = ColorScheme.ItemId.Environment_Production_Offline;
                            break;

                        case ExchangeEnvironmentId.DelayedProduction:
                            colorItemId = ColorScheme.ItemId.Environment_DelayedProduction_Offline;
                            break;

                        case ExchangeEnvironmentId.Demo:
                            colorItemId = ColorScheme.ItemId.Environment_Demo_Offline;
                            break;

                        default:
                            throw new UnreachableCaseError('DCHSMOCEO39863', bannerEnvironmentId);
                    }
                }
                break;
            }
            case SessionStateId.Online: {
                const bannerEnvironmentId = this.calculateBannerExchangeEnvironmentId();
                this.environmentText = ExchangeEnvironment.idToDisplay(bannerEnvironmentId);

                switch (bannerEnvironmentId) {
                    case ExchangeEnvironmentId.Production:
                        this.showEnvironmentText = true;
                        colorItemId = ColorScheme.ItemId.Environment_Production;
                        break;

                    case ExchangeEnvironmentId.DelayedProduction:
                        this.showEnvironmentText = true;
                        colorItemId =
                            ColorScheme.ItemId.Environment_DelayedProduction;
                        break;

                    case ExchangeEnvironmentId.Demo:
                        this.showEnvironmentText = true;
                        colorItemId = ColorScheme.ItemId.Environment_Demo;
                        break;

                    default:
                        throw new UnreachableCaseError('DCHSMOCE39863', bannerEnvironmentId);
                }
                break;
            }
            case SessionStateId.Finalising:
            case SessionStateId.Finalised: {
                this.showEnvironmentText = true;
                if (this._kickedOff) {
                    this.environmentText = `${stateText} (${
                        Strings[StringId.KickedOff]
                    })`;
                    colorItemId =
                        ColorScheme.ItemId.Environment_StartFinal_KickedOff;
                } else {
                    this.environmentText = stateText;
                    colorItemId = ColorScheme.ItemId.Environment_StartFinal;
                }
                break;
            }
            default: {
                throw new UnexpectedCaseError('DCUEDD299855', stateId);
            }
        }
        this.environmentBkgdColor = this._colorSettings.getBkgd(colorItemId);
        this.environmentForeColor = this._colorSettings.getFore(colorItemId);
        this._cdr.markForCheck();
    }

    private calculateBannerExchangeEnvironmentIdIfDefined() {
        if (this._sessionInfoService.bannerOverrideExchangeEnvironmentId !== undefined) {
            return this._sessionInfoService.bannerOverrideExchangeEnvironmentId;
        } else {
            if (ExchangeInfo.getDefaultEnvironmentIdDefined()) {
                return ExchangeInfo.getDefaultEnvironmentId();
            } else {
                return undefined;
            }
        }
    }

    private calculateBannerExchangeEnvironmentId() {
        if (this._sessionInfoService.bannerOverrideExchangeEnvironmentId !== undefined) {
            return this._sessionInfoService.bannerOverrideExchangeEnvironmentId;
        } else {
            return ExchangeInfo.getDefaultEnvironmentId();
        }
    }
}
