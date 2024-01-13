/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import {
    AssertInternalError,
    ButtonUiAction,
    ColorScheme,
    CommandRegisterService,
    InternalCommand,
    MultiEvent,
    SettingsService,
    StringId,
    delay1Tick
} from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { SignOutService } from 'component-services-internal-api';
import {
    AdiNgService,
    AppStorageNgService,
    BrandingNgService,
    CapabilitiesNgService,
    CommandRegisterNgService,
    HideUnloadSaveNgService,
    IdleNgService,
    KeyboardNgService,
    SettingsNgService,
    SignOutNgService,
    SymbolDetailCacheNgService,
    UserAlertNgService
} from 'component-services-ng-api';
import { ExtensionsAccessNgService } from 'content-ng-api';
import { ButtonInputNgComponent, CommandBarNgComponent, MenuBarNgService, MenuBarRootMenuNgComponent } from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective, DesktopAccessNgService } from 'ditem-ng-api';
import { ComponentItem } from 'golden-layout';
import { GoldenLayoutHostNgComponent } from '../../golden-layout-host/ng-api';
import { DesktopFrame } from '../desktop-frame';

@Component({
    selector: 'app-desktop',
    templateUrl: './desktop-ng.component.html',
    styleUrls: ['./desktop-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopNgComponent extends ComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('menuBarRootMenu', { static: true }) private _menuBarRootMenuComponent: MenuBarRootMenuNgComponent;
    @ViewChild('aboutAdvertisingButton') private _aboutAdvertisingButtonComponent: ButtonInputNgComponent | undefined;
    @ViewChild('commandBar', { static: true }) private _commandBarComponent: CommandBarNgComponent;
    @ViewChild('signOutButton', { static: true }) private _signOutButtonComponent: ButtonInputNgComponent;
    @ViewChild('layoutHost', { static: true }) private _layoutHostComponent: GoldenLayoutHostNgComponent;

    public readonly advertisingEnabled: boolean;
    public readonly barLeftImageExists: boolean;
    public readonly barLeftImageUrl: SafeResourceUrl;
    public barBkgdColor: string;
    public barForeColor: string;

    private readonly _commandRegisterService: CommandRegisterService;
    private readonly _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _desktopFrame: DesktopFrame;

    private readonly _aboutAdvertisingUiAction: ButtonUiAction | undefined;
    private readonly _signOutUiAction: ButtonUiAction;
    // private _commandBarUiAction: CommandBarUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        // configNgService: ConfigNgService,
        idleNgService: IdleNgService,
        appStorageNgService: AppStorageNgService,
        settingsNgService: SettingsNgService,
        userAlertNgService: UserAlertNgService,
        capabilitiesNgService: CapabilitiesNgService,
        extensionsAccessNgService: ExtensionsAccessNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolDetailCacheNgService: SymbolDetailCacheNgService,
        adiNgService: AdiNgService,
        signOutNgService: SignOutNgService,
        menuBarNgService: MenuBarNgService,
        commandRegisterNgService: CommandRegisterNgService,
        keyboardNgService: KeyboardNgService,
        hideUnloadSaveNgService: HideUnloadSaveNgService,
        @Inject(BrandingNgService.injectionToken) brandingService: BrandingNgService,
    ) {
        super(elRef, ++DesktopNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;
        this._settingsService = settingsNgService.service;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        const signOutService = signOutNgService.service;

        const barLeftImageUrl = brandingService.desktopBarLeftImageUrl;
        if (barLeftImageUrl === undefined) {
            this.barLeftImageExists = false;
            this.barLeftImageUrl = '';
        } else {
            this.barLeftImageExists = true;
            this.barLeftImageUrl = barLeftImageUrl;
        }

        const capabilitiesService = capabilitiesNgService.service;
        this.advertisingEnabled = capabilitiesService.advertisingEnabled;

        this._desktopFrame = new DesktopFrame(
            this.rootHtmlElement,
            idleNgService.service,
            appStorageNgService.service,
            this._settingsService,
            userAlertNgService.service,
            capabilitiesService,
            extensionsAccessNgService.service,
            symbolDetailCacheNgService.service,
            adiNgService.service,
            signOutService,
            menuBarNgService.service,
            this._commandRegisterService,
            keyboardNgService.service,
            hideUnloadSaveNgService.service,
            brandingService.startupSplashWebPageSafeResourceUrl !== undefined,
            (component) => this.getBuiltinDitemFrameFromGoldenLayoutComponent(component),
        );

        desktopAccessNgService.setService(this._desktopFrame);

        if (this.advertisingEnabled) {
            this._aboutAdvertisingUiAction = this.createAboutAdvertisingUiAction();
        }
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
        if (this._aboutAdvertisingButtonComponent !== undefined && this._aboutAdvertisingUiAction !== undefined) {
            this._aboutAdvertisingButtonComponent.initialise(this._aboutAdvertisingUiAction);
        }
        this._signOutButtonComponent.initialise(this._signOutUiAction);
    }

    private finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        if (this._aboutAdvertisingUiAction !== undefined) {
            this._aboutAdvertisingUiAction.finalise();
        }
        this._signOutUiAction.finalise();
        this._desktopFrame.finalise();

    }

    private applyColors() {
        this.barBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.DesktopBar);
        this.barForeColor = this._settingsService.color.getFore(ColorScheme.ItemId.DesktopBar);
    }

    private createAboutAdvertisingUiAction() {
        const commandName = InternalCommand.Id.ShowAboutAdvertising;
        const displayId = StringId.Desktop_AboutAdvertisingCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        // action.signalEvent = () => signOutService.signOut();
        return action;
    }

    private createSignOutUiAction(signOutService: SignOutService) {
        const commandName = InternalCommand.Id.SignOut;
        const displayId = StringId.Desktop_SignOutCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = () => signOutService.signOut();
        return action;
    }

    private getBuiltinDitemFrameFromGoldenLayoutComponent(component: ComponentItem.Component) {
        if (typeof component !== 'object' || !(component instanceof BuiltinDitemNgComponentBaseNgDirective)) {
            throw new AssertInternalError('DCGBDFFGLC45559248');
        } else {
            return component.ditemFrame;
        }
    }
}
