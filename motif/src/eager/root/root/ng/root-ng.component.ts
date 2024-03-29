/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
    CapabilitiesService,
    ColorScheme,
    CommandContext,
    KeyboardService,
    MultiEvent,
    ScalarSettings,
    SessionStateId,
    SettingsService,
    StringId,
    UserAlertService,
    delay1Tick
} from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { BrandingNgService, CapabilitiesNgService, KeyboardNgService, SettingsNgService, UserAlertNgService } from 'component-services-ng-api';
import { ExtensionsService } from 'extensions-internal-api';
import { ExtensionsNgService } from 'extensions-ng-api';
import { OverlayOriginNgComponent } from 'overlay-ng-api';
import { BottomAdvertStripNgComponent } from '../../bottom-advert-strip/ng/bottom-advert-strip-ng.component';
import { ConfigNgService } from '../../ng/config-ng.service';
import { SessionNgService } from '../../ng/session-ng.service';
import { SessionService } from '../../session-service';
import { UserAlertNgComponent } from '../../user-alert/ng-api';

@Component({
    selector: 'app-root',
    templateUrl: './root-ng.component.html',
    styleUrls: ['./root-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,

    providers: [
        {
            provide: BrandingNgService.injectionToken,
            useFactory: (configNgService: ConfigNgService) => {
                const config = configNgService.config;
                const branding = config.branding;
                return new BrandingNgService(branding.desktopBarLeftImageUrl, branding.startupSplashWebPageSafeResourceUrl);
            },
            deps: [ConfigNgService]
        }
    ]
})
export class RootNgComponent extends ComponentBaseNgDirective implements OnInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('userAlert', { static: true }) private _userAlertComponent: UserAlertNgComponent;
    @ViewChild('overlayOrigin', { static: true }) private _overlayOriginComponent: OverlayOriginNgComponent;
    @ViewChild('bottomAdvertStrip') private _bottomAdvertStripComponent: BottomAdvertStripNgComponent;

    public starting = true;

    private _capabilitiesService: CapabilitiesService;
    private _keyboardService: KeyboardService;
    private _commandContext: CommandContext;

    private _userAlertService: UserAlertService;

    private _session: SessionService;
    private _sessionStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _settingsService: SettingsService;
    private _scalarSettings: ScalarSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _measureFontFamily: string;
    private _measureFontSize: string;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _router: Router,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _titleService: Title,
        private readonly _sessionNgService: SessionNgService,
        settingsNgService: SettingsNgService,
        capabilitiesNgService: CapabilitiesNgService,
        extensionsNgService: ExtensionsNgService,
        keyboardNgService: KeyboardNgService,
        userAlertNgService: UserAlertNgService,
    ) {
        super(elRef, ++RootNgComponent.typeInstanceCreateCount);

        this._session = this._sessionNgService.session;
        this._sessionStateChangeSubscriptionId =
            this._session.subscribeStateChangeEvent((stateId) => this.handleSessionStateChangeEvent(stateId));

        this._settingsService = settingsNgService.service;
        this._scalarSettings = this._settingsService.scalar;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        this._titleService.setTitle('Motif'); // need to improve this

        this._capabilitiesService = capabilitiesNgService.service;
        this._keyboardService = keyboardNgService.service;
        this._commandContext = this.createCommandContext(this.rootHtmlElement, extensionsNgService.service);
        this._keyboardService.registerCommandContext(this._commandContext, true);
        this._userAlertService = userAlertNgService.service;
    }

    public get advertisingActive() { return this._capabilitiesService.advertisingEnabled && !this.starting; }

    ngOnInit() {
        this._userAlertService.alertQueueChangedEvent = () => this.handleUserAlertServiceAlertQueueChangedEvent();
        const alerts = this._userAlertService.getVisibleAlerts();
        if (alerts.length > 0) {
            this._userAlertComponent.pushAlerts(alerts);
        }
    }

    ngOnDestroy() {
        this.finalise();
    }

    private handleUserAlertServiceAlertQueueChangedEvent() {
        const alerts = this._userAlertService.getVisibleAlerts();
        this._userAlertComponent.pushAlerts(alerts);
    }

    private handleSessionStateChangeEvent(stateId: SessionStateId) {
        if (stateId === SessionStateId.Online) {
            this.starting = false;
            // not interested in this event anymore
            this._session.unsubscribeStateChangeEvent(this._sessionStateChangeSubscriptionId);
            this._sessionStateChangeSubscriptionId = undefined;
            this._cdr.markForCheck();
        }
    }

    private handleSettingsChangedEvent() {
        this.applySettings();
    }

    private applySettings() {
        this.rootHtmlElement.style.setProperty('font-family', this._settingsService.scalar.fontFamily);
        this.rootHtmlElement.style.setProperty('font-size', this._settingsService.scalar.fontSize);

        const panelItemId = ColorScheme.ItemId.Panel;
        const bkgdPanelColor = this._settingsService.color.getBkgd(panelItemId);
        this.rootHtmlElement.style.setProperty('background-color', bkgdPanelColor);

        const color = this._settingsService.color.getFore(panelItemId);
        this.rootHtmlElement.style.setProperty('color', color);

        // const borderItemId = ColorScheme.ItemId.Text_ControlBorder;

        this._cdr.markForCheck();

        if (this._scalarSettings.fontFamily !== this._measureFontFamily || this._scalarSettings.fontSize !== this._measureFontSize) {
            this._measureFontFamily = this._scalarSettings.fontFamily;
            this._measureFontSize = this._scalarSettings.fontSize;

            delay1Tick(() => this._overlayOriginComponent.updateMeasure(this._measureFontFamily, this._measureFontSize));
        }
    }

    private finalise() {
        this._keyboardService.deregisterCommandContext(this._commandContext);

        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        }

        if (this._sessionStateChangeSubscriptionId !== undefined) {
            this._session.unsubscribeStateChangeEvent(this._sessionStateChangeSubscriptionId);
            this._sessionStateChangeSubscriptionId = undefined;
        }
    }

    private createCommandContext(htmlElement: HTMLElement, extensionsService: ExtensionsService) {
        const id: CommandContext.Id = {
            name: 'Root',
            extensionHandle: extensionsService.internalHandle,
        };

        return new CommandContext(id, StringId.CommandContextDisplay_Root, htmlElement, () => undefined);
    }
}
