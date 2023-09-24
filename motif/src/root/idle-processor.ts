/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AppStorageService, AssertInternalError, getErrorMessage,
    KeyValueStore, Logger,
    mSecsPerSec,
    SettingsService,
    SysTick
} from '@motifmarkets/motif-core';
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

    private idleCallback(deadline: IdleDeadline) {
        let settingSaveInitiated = false;
        let nowTime: number | undefined;
        if (this._settingsService.saveRequired) {
            nowTime = SysTick.now();
            if (nowTime > this._settingsSaveNotAllowedUntilTime) {
                const promise = this.saveSettings();
                AssertInternalError.throwErrorIfVoidPromiseRejected(promise, 'IPICS10987');
                settingSaveInitiated = true;
            }
        }

        if (!settingSaveInitiated) {
            const localDesktopFrame = this._workspaceService.localDesktopFrame;
            if (localDesktopFrame !== undefined) {
                if (localDesktopFrame.layoutSaveRequired) {
                    if (nowTime === undefined) {
                        nowTime = SysTick.now();
                    }
                    if (nowTime > this._localDesktopLayoutSaveNotAllowedUntilTime) {
                        const promise = this.saveLocalDesktopLayout(localDesktopFrame);
                        AssertInternalError.throwErrorIfVoidPromiseRejected(promise, 'IPICLDL10987');
                    }
                }
            }
        }

        this.initiateRequestIdleCallback();
    }

    private async saveSettings() {
        const { user: userElement, operator: operatorElement } = this._settingsService.save();
        try {
            if (userElement === undefined) {
                if (operatorElement === undefined) {
                    return;
                } else {
                    const operatorSettings = operatorElement.stringify()
                    await this._appStorageService.setItem(KeyValueStore.Key.Settings, operatorSettings, true);
                }
            } else {
                const userSettings = userElement.stringify()
                if (operatorElement === undefined) {
                    await this._appStorageService.setItem(KeyValueStore.Key.Settings, userSettings, false);
                } else {
                    const operatorSettings = operatorElement.stringify()
                    await Promise.all([
                        this._appStorageService.setItem(KeyValueStore.Key.Settings, userSettings, false),
                        this._appStorageService.setItem(KeyValueStore.Key.Settings, operatorSettings, true)
                    ]);
                }
            }
            this._settingsService.reportSaved();
            if (this._lastSettingsSaveFailed) {
                this.logWarning(`Save settings succeeded`);
                this._lastSettingsSaveFailed = false;
            }
            this._settingsSaveNotAllowedUntilTime = SysTick.now() + IdleProcessor.minimumSettingsSaveRepeatSpan;
        } catch (e) {
            this.logWarning(`Save settings error: ${getErrorMessage(e)}`);
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
            this.logWarning(`Save local desktop layout error: ${getErrorMessage(e)}`);
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
