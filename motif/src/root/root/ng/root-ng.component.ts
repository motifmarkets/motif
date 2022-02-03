/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
    ColorScheme,
    CommandContext,
    CoreSettings, delay1Tick,
    KeyboardService,
    MultiEvent,
    SessionStateId,
    SettingsService,
    StringId,
    UserAlertService
} from '@motifmarkets/motif-core';
import { SettingsNgService, UserAlertNgService } from 'component-services-ng-api';
import { AppFeature } from 'src/app.feature';
import { KeyboardNgService } from 'src/component-services/ng/keyboard-ng-service';
import { ComponentBaseNgDirective } from 'src/component/ng-api';
import { ExtensionsService } from 'src/extensions/internal-api';
import { ExtensionsNgService } from 'src/extensions/ng-api';
import { OverlayOriginNgComponent } from 'src/overlay/ng-api';
import { SessionNgService } from '../../ng/session-ng.service';
import { SessionService } from '../../session-service';
import { UserAlertNgComponent } from '../../user-alert/ng-api';

@Component({
    selector: 'app-root',
    templateUrl: './root-ng.component.html',
    styleUrls: ['./root-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RootNgComponent extends ComponentBaseNgDirective implements OnInit, OnDestroy {

    @ViewChild('userAlert', { static: true }) private _userAlertComponent: UserAlertNgComponent;
    @ViewChild('overlayOrigin', { static: true }) private _overlayOriginComponent: OverlayOriginNgComponent;

    public starting = true;
    public advertisingEnabled = AppFeature.advertising;

    private _keyboardService: KeyboardService;
    private _commandContext: CommandContext;

    private _userAlertService: UserAlertService;

    private _session: SessionService;
    private _sessionStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _settingsService: SettingsService;
    private _coreSettings: CoreSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _measureFontFamily: string;
    private _measureFontSize: string;

    constructor(
        private readonly _router: Router,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _elRef: ElementRef<HTMLElement>,
        private readonly _titleService: Title,
        private readonly _sessionService: SessionNgService,
        settingsNgService: SettingsNgService,
        extensionsNgService: ExtensionsNgService,
        keyboardNgService: KeyboardNgService,
        userAlertNgService: UserAlertNgService,
    ) {
        super();

        this._session = this._sessionService.session;
        this._sessionStateChangeSubscriptionId =
            this._session.subscribeStateChangeEvent((stateId) => this.handleSessionStateChangeEvent(stateId));

        this._settingsService = settingsNgService.settingsService;
        this._coreSettings = this._settingsService.core;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        this._titleService.setTitle('Motif'); // need to improve this

        this._keyboardService = keyboardNgService.service;
        this._commandContext = this.createCommandContext(this._elRef.nativeElement, extensionsNgService.service);
        this._keyboardService.registerCommandContext(this._commandContext, true);
        this._userAlertService = userAlertNgService.service;
    }

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
        this._elRef.nativeElement.style.setProperty('font-family', this._settingsService.core.fontFamily);
        this._elRef.nativeElement.style.setProperty('font-size', this._settingsService.core.fontSize);

        const panelItemId = ColorScheme.ItemId.Panel;
        const bkgdPanelColor = this._settingsService.color.getBkgd(panelItemId);
        this._elRef.nativeElement.style.setProperty('background-color', bkgdPanelColor);

        const color = this._settingsService.color.getFore(panelItemId);
        this._elRef.nativeElement.style.setProperty('color', color);

        const borderItemId = ColorScheme.ItemId.Text_ControlBorder;

        this._cdr.markForCheck();

        if (this._coreSettings.fontFamily !== this._measureFontFamily || this._coreSettings.fontSize !== this._measureFontSize) {
            this._measureFontFamily = this._coreSettings.fontFamily;
            this._measureFontSize = this._coreSettings.fontSize;

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
