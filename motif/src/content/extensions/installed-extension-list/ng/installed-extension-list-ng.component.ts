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
    OnDestroy,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { SettingsNgService } from 'src/component-services/ng-api';
import { ColorScheme, SettingsService } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/i18n-strings';
import { Integer, ListChangeTypeId } from 'src/sys/internal-api';
import { MultiEvent } from 'src/sys/multi-event';
import { ExtensionInfo } from '../../extension/internal-api';
import { ExtensionsAccessService } from '../../extensions-access-service';
import { ExtensionsAccessNgService } from '../../ng/extensions-access-ng.service';

@Component({
    selector: 'app-installed-extension-list',
    templateUrl: './installed-extension-list-ng.component.html',
    styleUrls: ['./installed-extension-list-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class InstalledExtensionListNgComponent implements OnDestroy {
    @Output() focusEmitter = new EventEmitter();
    @Output() infoListTransitionStartEmitter = new EventEmitter();
    @Output() infoListTransitionFinishEmitter = new EventEmitter();

    @HostBinding('style.border-color') borderColor: string;
    @HostBinding('style.--item-hover-background-color') itemHoverBackgroundColor: string;

    public headingCaption = Strings[StringId.Extensions_InstalledExtensionsHeadingCaption];
    public get installedExtensions() {
        return this._extensionsAccessService.installedArray;
    }

    private readonly _settingsService: SettingsService;
    private readonly _extensionsAccessService: ExtensionsAccessService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _installedListChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        extensionsAccessNgService: ExtensionsAccessNgService,
        settingsNgService: SettingsNgService
    ) {
        this._extensionsAccessService = extensionsAccessNgService.service;
        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );

        this._installedListChangedSubscriptionId = this._extensionsAccessService.subscribeInstalledListChangedEvent(
            (listChangeTypeId, idx, info, listTransitioning) =>
                this.handleInstalledListChangedEvent(
                    listChangeTypeId,
                    idx,
                    info,
                    listTransitioning
                )
        );

        this.applySettings();
    }

    ngOnDestroy() {
        this._extensionsAccessService.unsubscribeInstalledListChangedEvent(
            this._installedListChangedSubscriptionId
        );
        this._settingsService.unsubscribeSettingsChangedEvent(
            this._settingsChangedSubscriptionId
        );
    }

    public handleInstallSignal(info: ExtensionInfo) {
        this._extensionsAccessService.installExtension(info, true);
    }

    public handleFocus(info: ExtensionInfo) {
        this.focusEmitter.emit(info);
    }

    private handleInstalledListChangedEvent(
        listChangeTypeId: ListChangeTypeId,
        idx: Integer,
        info: ExtensionInfo,
        listTransitioning: boolean
    ) {
        if (listTransitioning) {
            switch (listChangeTypeId) {
                case ListChangeTypeId.Insert:
                    this.infoListTransitionFinishEmitter.emit(info);
                    break;
                case ListChangeTypeId.Remove:
                    this.infoListTransitionStartEmitter.emit(info);
                    break;
            }
        }
        this._cdr.markForCheck(); // probably will not work
    }

    private applySettings() {
        this.borderColor = this._settingsService.color.getFore(
            ColorScheme.ItemId.Panel_Divider
        );
        this.itemHoverBackgroundColor = this._settingsService.color.getBkgd(
            ColorScheme.ItemId.Panel_ItemHover
        );
    }
}
