/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, OnDestroy, Output } from '@angular/core';
import { ColorScheme, ColorSettings, ExtensionInfo, MultiEvent, SettingsService } from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-extensions-sidebar',
    templateUrl: './extensions-sidebar-ng.component.html',
    styleUrls: ['./extensions-sidebar-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionsSidebarNgComponent extends ContentComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.background-color') bkgdColor: string;

    @Output() infoFocusEmitter = new EventEmitter<ExtensionInfo>();
    @Output() listTransitionStartEmitter = new EventEmitter<ExtensionInfo>();
    @Output() listTransitionFinishEmitter = new EventEmitter<ExtensionInfo>();

    public splitterGutterSize = 3;

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(elRef: ElementRef<HTMLElement>, settingsNgService: SettingsNgService) {
        super(elRef, ++ExtensionsSidebarNgComponent.typeInstanceCreateCount);

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());
        this.applySettings();
    }

    get width() {
        const domRect = (this.rootHtmlElement).getBoundingClientRect();
        return Math.round(domRect.width);
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
    }

    public handleAvailableInfoFocus(info: ExtensionInfo) {
        this.infoFocusEmitter.emit(info);
    }

    public handleAvailableInfoListTransitionStart(info: ExtensionInfo) {
        this.listTransitionStartEmitter.emit(info);
    }

    public handleAvailableInfoListTransitionFinish(info: ExtensionInfo) {
        this.listTransitionFinishEmitter.emit(info);
    }

    public handleInstalledInfoFocus(info: ExtensionInfo) {
        this.infoFocusEmitter.emit(info);
    }

    public handleInstalledInfoListTransitionStart(info: ExtensionInfo) {
        this.listTransitionStartEmitter.emit(info);
    }

    public handleInstalledInfoListTransitionFinish(info: ExtensionInfo) {
        this.listTransitionFinishEmitter.emit(info);
    }

    private applySettings() {
        this.bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Panel_Hoisted);
    }
}
