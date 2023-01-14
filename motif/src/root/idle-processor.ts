/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AppStorageService, JsonElement, Logger, mSecsPerSec, SettingsService, SysTick } from '@motifmarkets/motif-core';
import { WorkspaceService } from 'workspace-internal-api';
import { DesktopFrame } from '../desktop/internal-api';

export class IdleProcessor {
    private _requestIdleCallbackHandle: number | undefined;
    private _settingsSaveNotAllowedUntilTime: SysTick.Time = 0;
    private _lastSettingsSaveFailed = false;
    private _localDesktopLayoutSaveNotAllowedUntilTime: SysTick.Time = 0;
    private _lastLocalDesktopLayoutSaveFailed = false;

    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _appStorageService: AppStorageService,
        private readonly _workspaceService: WorkspaceService
    ) {
        this.initiateRequestIdleCallback();
    }

    destroy() {
        if (this._requestIdleCallbackHandle !== undefined) {
            window.cancelIdleCallback(this._requestIdleCallbackHandle);
            this._requestIdleCallbackHandle = undefined;
        }
    }

    private initiateRequestIdleCallback() {
        const options: IdleRequestOptions = {
            timeout: IdleProcessor.idleCallbackTimeout,
        };
        this._requestIdleCallbackHandle = window.requestIdleCallback((deadline) => this.idleCallback(deadline), options);
    }

    private async idleCallback(deadline: IdleDeadline) {
        let nowTime: number | undefined;
        if (this._settingsService.saveRequired) {
            nowTime = SysTick.now();
            if (nowTime > this._settingsSaveNotAllowedUntilTime) {
                await this.saveSettings();
            }
        }

        if (deadline.timeRemaining() > 0) {
            const localDesktopFrame = this._workspaceService.localDesktopFrame;
            if (localDesktopFrame !== undefined) {
                if (localDesktopFrame.layoutSaveRequired) {
                    if (nowTime === undefined) {
                        nowTime = SysTick.now();
                    }
                    if (nowTime > this._localDesktopLayoutSaveNotAllowedUntilTime) {
                        await this.saveLocalDesktopLayout(localDesktopFrame);
                    }
                }
            }
        }

        this.initiateRequestIdleCallback();
    }

    private async saveSettings() {
        const rootElement = new JsonElement();
        this._settingsService.save(rootElement);
        const settingsAsJsonString = rootElement.stringify();
        try {
            await this._appStorageService.setItem(AppStorageService.Key.Settings, settingsAsJsonString);
            this._settingsService.reportSaved();
            if (this._lastSettingsSaveFailed) {
                this.logWarning(`Save settings succeeded`);
                this._lastSettingsSaveFailed = false;
            }
            this._settingsSaveNotAllowedUntilTime = SysTick.now() + IdleProcessor.minimumSettingsSaveRepeatSpan;
        } catch (e) {
            this.logWarning(`Save settings error: ${e}`);
            this._lastSettingsSaveFailed = true;
            this._settingsSaveNotAllowedUntilTime = SysTick.now() + IdleProcessor.minimumSettingsSaveRepeatSpan;
        }
    }

    private async saveLocalDesktopLayout(localDesktopFrame: DesktopFrame) {
        try {
            await localDesktopFrame.saveLayout();
            if (this._lastLocalDesktopLayoutSaveFailed) {
                this.logWarning('Save local desktop layout succeeded (after error)');
                this._lastLocalDesktopLayoutSaveFailed = false;
            }
            this._localDesktopLayoutSaveNotAllowedUntilTime = SysTick.now() + IdleProcessor.minimumLocalDesktopLayoutSaveRepeatSpan;
        } catch (e) {
            this.logWarning(`Save local desktop layout error: ${e}`);
            this._lastLocalDesktopLayoutSaveFailed = true;
            this._localDesktopLayoutSaveNotAllowedUntilTime = SysTick.now() + IdleProcessor.minimumLocalDesktopLayoutSaveRepeatSpan;
        }
    }

    private logWarning(text: string) {
        this.log(Logger.LevelId.Warning, text);
    }

    private log(logLevelId: Logger.LevelId, text: string) {
        Logger.log(logLevelId, text);
    }
}

export namespace IdleProcessor {
    export const idleCallbackTimeout = 30 * mSecsPerSec;
    export const minimumSettingsSaveRepeatSpan = 15 * mSecsPerSec;
    export const minimumLocalDesktopLayoutSaveRepeatSpan = 30 * mSecsPerSec;
}
