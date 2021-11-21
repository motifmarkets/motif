/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import { ColorSettings, CoreSettings, SettingsService } from 'src/core/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Directive()
export abstract class SettingsComponentBaseNgDirective extends ContentComponentBaseNgDirective {
    private _coreSettings: CoreSettings;
    private _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _settingsService: SettingsService,
    ) {
        super();

        this._coreSettings = this._settingsService.core;
        this._colorSettings = this._settingsService.color;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

    protected get settingsService() { return this._settingsService; }
    protected get coreSettings() { return this._coreSettings; }
    protected get colorSettings() { return this._colorSettings; }

    protected markForCheck() {
        this._cdr.markForCheck();
    }
    protected detectChanges() {
        this._cdr.detectChanges();
    }

    protected finalise() {
        if (this._settingsChangedSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
            this._settingsChangedSubscriptionId = undefined;
        }
    }

    private handleSettingsChangedEvent() {
        this.processSettingsChanged();
    }

    protected abstract processSettingsChanged(): void;
}
