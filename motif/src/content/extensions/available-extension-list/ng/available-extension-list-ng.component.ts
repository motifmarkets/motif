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
import {
    ColorScheme,
    ExtensionInfo,
    Integer,
    ListChangeTypeId,
    MultiEvent,
    SettingsService,
    StringId,
    Strings
} from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ExtensionsAccessService } from '../../extensions-access-service';
import { ExtensionsAccessNgService } from '../../ng/extensions-access-ng.service';

@Component({
    selector: 'app-available-extension-list',
    templateUrl: './available-extension-list-ng.component.html',
    styleUrls: ['./available-extension-list-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class AvailableExtensionListNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;
    @HostBinding('style.border-color') borderColor: string;
    @HostBinding('style.--item-hover-background-color') itemHoverBackgroundColor: string;

    @Output() focusEmitter = new EventEmitter();
    @Output() infoListTransitionStartEmitter = new EventEmitter();
    @Output() infoListTransitionFinishEmitter = new EventEmitter();

    public headingCaption = Strings[StringId.Extensions_AvailableExtensionsHeadingCaption];
    private readonly _settingsService: SettingsService;
    private readonly _extensionsAccessService: ExtensionsAccessService;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _uninstalledBundledListChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        extensionsAccessNgService: ExtensionsAccessNgService,
        settingsNgService: SettingsNgService
    ) {
        super();

        this._extensionsAccessService = extensionsAccessNgService.service;
        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );

        this._uninstalledBundledListChangedSubscriptionId = this._extensionsAccessService.subscribeUninstalledBundledListChangedEvent(
            (listChangeTypeId, idx, info, listTransitioning) =>
                this.handleUninstalledBundledListChangedEvent(
                    listChangeTypeId,
                    idx,
                    info,
                    listTransitioning
                )
        );

        this.applySettings();
    }

    public get infos() {
        return this._extensionsAccessService.uninstalledBundledArray;
    }

    ngOnDestroy() {
        this._extensionsAccessService.unsubscribeUninstalledBundledListChangedEvent(
            this._uninstalledBundledListChangedSubscriptionId
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

    private handleUninstalledBundledListChangedEvent(
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
        this.gridBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_Base);
        this.gridAltBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);

        this.borderColor = this._settingsService.color.getFore(
            ColorScheme.ItemId.Panel_Divider
        );
        this.itemHoverBackgroundColor = this._settingsService.color.getBkgd(
            ColorScheme.ItemId.Panel_ItemHover
        );
    }
}
