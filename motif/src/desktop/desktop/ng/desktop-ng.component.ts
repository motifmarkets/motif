/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { SignOutService } from 'component-services-internal-api';
import {
    AdiNgService,
    AppStorageNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SignOutNgService,
    SymbolsNgService,
    UserAlertNgService
} from 'component-services-ng-api';
import { ExtensionsAccessNgService } from 'content-ng-api';
import { ButtonInputNgComponent, CommandBarNgComponent, MenuBarNgService, MenuBarRootMenuComponent } from 'controls-ng-api';
import { ButtonUiAction, ColorScheme, CommandRegisterService, InternalCommand, SettingsService } from 'core-internal-api';
import { BuiltinDitemNgComponentBaseDirective, DesktopAccessNgService } from 'ditem-ng-api';
import { ComponentItem } from 'golden-layout';
import { StringId } from 'res-internal-api';
import { ComponentBaseNgDirective } from 'src/component/ng-api';
import { ConfigNgService } from 'src/root/ng/config-ng.service';
import { AssertInternalError, delay1Tick, MultiEvent } from 'sys-internal-api';
import { GoldenLayoutHostNgComponent } from '../../golden-layout-host/ng-api';
import { DesktopFrame } from '../desktop-frame';

@Component({
    selector: 'app-desktop',
    templateUrl: './desktop-ng.component.html',
    styleUrls: ['./desktop-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopNgComponent extends ComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('menuBarRootMenu', { static: true }) private _menuBarRootMenuComponent: MenuBarRootMenuComponent;
    @ViewChild('commandBar', { static: true }) private _commandBarComponent: CommandBarNgComponent;
    @ViewChild('signOutButton', { static: true }) private _signOutButtonComponent: ButtonInputNgComponent;
    @ViewChild('layoutHost', { static: true }) private _layoutHostComponent: GoldenLayoutHostNgComponent;

    public barBkgdColor: string;
    public barForeColor: string;
    public readonly barLeftImageExists: boolean;
    public readonly barLeftImageUrl: string;

    private readonly _commandRegisterService: CommandRegisterService;
    private readonly _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _desktopFrame: DesktopFrame;
    private readonly _signOutUiAction: ButtonUiAction;
    // private _commandBarUiAction: CommandBarUiAction;

    constructor(
        configNgService: ConfigNgService,
        settingsNgService: SettingsNgService,
        appStorageNgService: AppStorageNgService,
        userAlertNgService: UserAlertNgService,
        extensionsAccessNgService: ExtensionsAccessNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        signOutNgService: SignOutNgService,
        menuBarNgService: MenuBarNgService,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super();

        this._commandRegisterService = commandRegisterNgService.service;
        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        const signOutService = signOutNgService.service;

        const config = configNgService.config;
        const configBranding = config.branding;
        const barLeftImageUrl = configBranding.desktopBarLeftImageUrl;
        if (barLeftImageUrl === undefined) {
            this.barLeftImageExists = false;
            this.barLeftImageUrl = '';
        } else {
            this.barLeftImageExists = true;
            this.barLeftImageUrl = barLeftImageUrl;
        }

        this._desktopFrame = new DesktopFrame(this._settingsService,
            appStorageNgService.appStorage,
            userAlertNgService.service,
            extensionsAccessNgService.service,
            symbolsNgService.symbolsManager,
            adiNgService.adiService,
            signOutService,
            menuBarNgService.service,
            this._commandRegisterService,
            configBranding.startupSplashWebPageUrl,
            (component) => this.getBuiltinDitemFrameFromGoldenLayoutComponent(component),
        );

        desktopAccessNgService.setService(this._desktopFrame);

        this._signOutUiAction = this.createSignOutUiAction(signOutService);
        this.applyColors();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    private handleSettingsChangedEvent() {
        this.applyColors();
    }

    private initialise() {
        const layoutHostFrame = this._layoutHostComponent.frame;
        this._desktopFrame.initialise(layoutHostFrame);
        this._signOutButtonComponent.initialise(this._signOutUiAction);
    }

    private finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this._signOutUiAction.finalise();
        this._desktopFrame.finalise();

    }

    private applyColors() {
        this.barBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.DesktopBar);
        this.barForeColor = this._settingsService.color.getFore(ColorScheme.ItemId.DesktopBar);
    }

    private createSignOutUiAction(signOutService: SignOutService) {
        const commandName = InternalCommand.Name.SignOut;
        const displayId = StringId.Desktop_SignOutCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = () => signOutService.signOut();
        return action;
    }

    private getBuiltinDitemFrameFromGoldenLayoutComponent(component: ComponentItem.Component) {
        if (typeof component !== 'object' || !(component instanceof BuiltinDitemNgComponentBaseDirective)) {
            throw new AssertInternalError('DCGBDFFGLC45559248');
        } else {
            return component.ditemFrame;
        }
    }
}
