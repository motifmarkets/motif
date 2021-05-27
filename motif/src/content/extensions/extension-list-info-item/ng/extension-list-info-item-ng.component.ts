/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    Output
} from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { ColorScheme, SettingsService } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/i18n-strings';
import { AssertInternalError, MultiEvent } from 'src/sys/internal-api';
import { ExtensionInfo } from '../../extension/extension-info';
import { ExtensionId, RegisteredExtension } from '../../extension/internal-api';

@Component({
    selector: 'app-extension-list-info-item',
    templateUrl: './extension-list-info-item-ng.component.html',
    styleUrls: ['./extension-list-info-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionListInfoItemNgComponent implements OnDestroy {
    @Output() installSignalEmitter = new EventEmitter();
    @Output() focusEmitter = new EventEmitter();

    @HostBinding('style.color') color = '';

    @Input() set info(value: ExtensionInfo) {
        if (value !== this._info) {
            this.setInfo(value);
        }
    }

    public isInstallable = false;

    private readonly _settingsService: SettingsService;

    private _info: ExtensionInfo;
    private _installedExtension: RegisteredExtension | undefined;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _installedExtensionLoadedChangedSubscriptionId: MultiEvent.SubscriptionId;

    public get abbreviatedPublisherTypeDisplay() {
        return ExtensionId.PublisherType.idToAbbreviatedDisplay(
            this._info.publisherTypeId
        );
    }
    public get publisherName() {
        return this._info.publisherName;
    }
    public get name() {
        return this._info.name;
    }
    public get version() {
        return this._info.version;
    }
    public get description() {
        return this._info.shortDescription;
    }
    public get installCaption() {
        return Strings[StringId.Extensions_ExtensionInstallCaption];
    }

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService
    ) {
        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );

        this.applySettings();
    }

    @HostListener('click', []) handleHostClick() {
        this.focusEmitter.emit(this._info);
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(
            this._settingsChangedSubscriptionId
        );
        this.checkClearInstalledExtension();
    }

    public handleInstallClick() {
        this.installSignalEmitter.emit(this._info);
    }

    private handleInstalledExtensionLoadedChangedEvent() {
        if (this._installedExtension === undefined) {
            throw new AssertInternalError('ELIICHIELCE2228343');
        } else {
            this.updateEnabledDisabled(this._installedExtension.loaded);
            this._cdr.markForCheck();
        }
    }

    private setInfo(value: ExtensionInfo) {
        this._info = value;
        if (RegisteredExtension.isRegisteredExtension(value)) {
            this.setInstalledExtension(value);
            this.isInstallable = false;
        } else {
            this.checkClearInstalledExtension();
            this.isInstallable = true;
        }
        this._cdr.markForCheck();
    }

    private setInstalledExtension(value: RegisteredExtension) {
        this.checkClearInstalledExtension();

        this._installedExtension = value;
        this.updateEnabledDisabled(this._installedExtension.loaded);

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
            this._installedExtension.unsubscribeLoadedChangedEvent(
                this._installedExtensionLoadedChangedSubscriptionId
            );
            this._installedExtensionLoadedChangedSubscriptionId = undefined;
        }
    }

    private updateEnabledDisabled(loaded: boolean) {
        this.color = loaded
            ? ''
            : this._settingsService.color.getFore(
                  ColorScheme.ItemId.Text_GreyedOut
              );
    }

    private applySettings() {
        if (this._installedExtension !== undefined) {
            this.updateEnabledDisabled(this._installedExtension.loaded);
        }
        this._cdr.markForCheck();
    }
}
