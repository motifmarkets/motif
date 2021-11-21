/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { ColorScheme, SettingsService } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/i18n-strings';
import { AssertInternalError, HtmlTypes, MultiEvent } from 'src/sys/internal-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ExtensionId, ExtensionInfo, RegisteredExtension } from '../../extension/internal-api';
import { ExtensionsAccessService } from '../../extensions-access-service';
import { ExtensionsAccessNgService } from '../../ng/extensions-access-ng.service';

@Component({
    selector: 'app-extension-detail',
    templateUrl: './extension-detail-ng.component.html',
    styleUrls: ['./extension-detail-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionDetailNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    @HostBinding('style.display') hostDisplay = HtmlTypes.Display.None;

    public isInstallable = false;
    public isDisabled = false;
    public isEnabled = false;
    public isInstalled = false;

    public installCaption: string;
    public enableCaption: string;
    public disableCaption: string;
    public uninstallCaption: string;

    public detailSectionBorderTypeColor: string;

    private readonly _settingsService: SettingsService;
    private readonly _extensionsAccessService: ExtensionsAccessService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _info: ExtensionInfo = ExtensionDetailNgComponent.invalidExtensionInfo;
    private _installedExtension: RegisteredExtension | undefined;

    private _installedExtensionLoadedChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        extensionsAccessNgService: ExtensionsAccessNgService
    ) {
        super();

        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        this._extensionsAccessService = extensionsAccessNgService.service;

        this.installCaption = Strings[StringId.Extensions_ExtensionInstallCaption];
        this.enableCaption = Strings[StringId.Extensions_ExtensionEnableCaption];
        this.disableCaption = Strings[StringId.Extensions_ExtensionDisableCaption];
        this.uninstallCaption = Strings[StringId.Extensions_ExtensionUninstallCaption];

        this.applySettings();
    }

    public get name() { return this._info.name; }
    public get publisherTypeDisplay() { return ExtensionId.PublisherType.idToDisplay(this._info.publisherTypeId); }
    public get publisherName() { return this._info.publisherName; }
    public get version() { return this._info.version; }
    public get shortDescription() { return this._info.shortDescription; }
    public get longDescription() { return this._info.longDescription; }

    @Input() set info(value: ExtensionInfo) {
        if (value !== this._info) {
            this.setInfo(value);
        }
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this.checkClearInstalledExtension();
    }

    public handleInstallClick() {
        this._extensionsAccessService.installExtension(this._info, true);
    }

    public handleEnableClick() {
        if (this._installedExtension === undefined) {
            throw new AssertInternalError('EDCHEC10555833');
        } else {
            this._installedExtension.load();
        }
    }

    public handleDisableClick() {
        if (this._installedExtension === undefined) {
            throw new AssertInternalError('EDCHDC10555833');
        } else {
            this._installedExtension.unload();
        }
    }

    public handleUninstallClick() {
        if (this._installedExtension === undefined) {
            throw new AssertInternalError('EDCHUC10555833');
        } else {
            this._extensionsAccessService.uninstallExtension(this._installedExtension.handle);
        }
    }

    private handleInstalledExtensionLoadedChangedEvent() {
        if (this._installedExtension === undefined) {
            throw new AssertInternalError('EDCHIELCE10688883');
        } else {
            this.updateIsEnabledDisabled(this._installedExtension.loaded);
            this._cdr.markForCheck();
        }
    }

    private setInfo(value: ExtensionInfo) {
        if (value === undefined) {
            this._info = ExtensionDetailNgComponent.invalidExtensionInfo;
            this.hostDisplay = HtmlTypes.Display.None;
        } else {
            this._info = value;
            if (RegisteredExtension.isRegisteredExtension(value)) {
                this.setInstalledExtension(value);
                this.isInstallable = false;
            } else {
                this.checkClearInstalledExtension();
                this.isInstallable = true;
            }
            this.hostDisplay = HtmlTypes.Display.Flex;
        }
        this._cdr.markForCheck();
    }

    private setInstalledExtension(value: RegisteredExtension) {
        this.checkClearInstalledExtension();

        this._installedExtension = value;
        this.isInstalled = true;
        this.updateIsEnabledDisabled(this._installedExtension.loaded);

        this._installedExtensionLoadedChangedSubscriptionId = this._installedExtension.subscribeLoadedChangedEvent(
            () => this.handleInstalledExtensionLoadedChangedEvent()
        );
    }

    private checkClearInstalledExtension() {
        if (this._installedExtension !== undefined) {
            this.clearInstalledExtension();
        }
    }

    private clearInstalledExtension() {
        if (this._installedExtension === undefined) {
            throw new AssertInternalError('EDCCIE566583333');
        } else {
            this._installedExtension.unsubscribeLoadedChangedEvent(this._installedExtensionLoadedChangedSubscriptionId);
            this._installedExtensionLoadedChangedSubscriptionId = undefined;
            this.isDisabled = false;
            this.isEnabled = false;
            this.isInstalled = false;
        }
    }

    private updateIsEnabledDisabled(loaded: boolean) {
        this.isDisabled = !loaded;
        this.isEnabled = loaded;
    }

    private applySettings() {
        this.detailSectionBorderTypeColor = this._settingsService.color.getFore(ColorScheme.ItemId.Panel_Divider);
        this._cdr.markForCheck();
    }
}

export namespace ExtensionDetailNgComponent {
    export const invalidExtensionInfo: ExtensionInfo = {
        publisherTypeId: ExtensionId.PublisherTypeId.Invalid,
        publisherName: '',
        name: '',
        version: '',
        apiVersion: '',
        shortDescription: '',
        longDescription: '',
        urlPath: '',
    } as const;
}
