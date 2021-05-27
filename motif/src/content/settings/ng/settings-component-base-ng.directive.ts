/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectorRef, Directive } from '@angular/core';
import { CoreSettings, SettingsService } from 'src/core/internal-api';
import { MultiEvent } from 'src/sys/internal-api';

@Directive()
export abstract class SettingsComponentBaseNgDirective {
    private _coreSettings: CoreSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    protected get settingsService() { return this._settingsService; }
    protected get coreSettings() { return this._coreSettings; }

    constructor(
        private _cdr: ChangeDetectorRef,
        private _settingsService: SettingsService,
    ) {
        this._coreSettings = this._settingsService.core;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());
    }

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
