/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AppStorageService,
    AssertInternalError,
    getErrorMessage,
    KeyValueStore,
    Logger,
    mSecsPerSec,
    MultiEvent,
    SettingsService,
    SysTick,
} from '@motifmarkets/motif-core';
import { DesktopFrame } from 'desktop-internal-api';
import { WorkspaceService } from 'workspace-internal-api';

export class IdleProcessor {
    private readonly _requestIdleCallbackAvailable: boolean;

    private _callbackOrTimeoutHandle: number | ReturnType<typeof setTimeout> | undefined;
    private _settingsSaveNotAllowedUntilTime: SysTick.Time = 0;
    private _lastSettingsSaveFailed = false;
    private _localDesktopLayoutSaveNotAllowedUntilTime: SysTick.Time = 0;
    private _lastLocalDesktopLayoutSaveFailed = false;

    private _settingsServiceSaveRequiredSubscriptionId: MultiEvent.SubscriptionId;
    private _workspaceServiceLocalDesktopFrameLoadedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _appStorageService: AppStorageService,
        private readonly _workspaceService: WorkspaceService
    ) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this._requestIdleCallbackAvailable = globalThis.requestIdleCallback !== undefined;
        this._settingsServiceSaveRequiredSubscriptionId = this._settingsService.subscribeSaveRequiredEvent(() => this.ensureIdleCallbackRequested());
        const desktopFrame = this._workspaceService.localDesktopFrame;
        if (desktopFrame !== undefined) {
            desktopFrame.layoutSaveRequiredEventer = () => this.ensureIdleCallbackRequested();
        } else {
            this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId = this._workspaceService.subscribeLocalDesktopFrameLoadedEvent((loadedDesktopFrame) => {
                loadedDesktopFrame.layoutSaveRequiredEventer = () => this.ensureIdleCallbackRequested();
                this.checkUnsubscribeLocalDesktopFrameLoadedEvent();
            })
        }
    }

    destroy() {
        this.checkUnsubscribeLocalDesktopFrameLoadedEvent();
        const localDesktopFrame = this._workspaceService.localDesktopFrame;
        if (localDesktopFrame !== undefined) {
            localDesktopFrame.layoutSaveRequiredEventer = undefined;
        }
        if (this._settingsServiceSaveRequiredSubscriptionId !== undefined) {
            this._settingsService.unsubscribeSaveRequiredEvent(this._settingsServiceSaveRequiredSubscriptionId);
            this._settingsServiceSaveRequiredSubscriptionId = undefined;
        }
        if (this._callbackOrTimeoutHandle !== undefined) {
            if (this._requestIdleCallbackAvailable) {
                cancelIdleCallback(this._callbackOrTimeoutHandle as number);
            } else {
                // Safari does not support requestIdleCallback at this point in time.  Use setTimeout instead
                clearTimeout(this._callbackOrTimeoutHandle);
            }
            this._callbackOrTimeoutHandle = undefined;
        }
    }

    private checkUnsubscribeLocalDesktopFrameLoadedEvent() {
        if (this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId !== undefined) {
            this._workspaceService.unsubscribeLocalDesktopFrameLoadedEvent(this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId);
            this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId = undefined;
        }
    }

    private ensureIdleCallbackRequested() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._callbackOrTimeoutHandle === undefined) {
            if (this._requestIdleCallbackAvailable) {
                const options: IdleRequestOptions = {
                    timeout: IdleProcessor.idleCallbackTimeout,
                };
                this._callbackOrTimeoutHandle = requestIdleCallback((deadline) => this.idleCallback(deadline), options);
            } else {
                // Safari does not support requestIdleCallback at this point in time.  Use setTimeout instead
                const deadline: IdleDeadline = {
                    didTimeout: true,
                    timeRemaining: () => 50,
                }
                this._callbackOrTimeoutHandle = setTimeout(() => { this.idleCallback(deadline) }, IdleProcessor.idleCallbackTimeout);
            }
        }
    }

    private idleCallback(deadline: IdleDeadline) {
        this._callbackOrTimeoutHandle = undefined;

        let settingSaveInitiated = false;
        let nowTime: number | undefined;
        if (this._settingsService.saveRequired) {
            nowTime = SysTick.now();
            if (nowTime < this._settingsSaveNotAllowedUntilTime) {
                this.ensureIdleCallbackRequested(); // Initiate another one to try again later
            } else {
                const promise = this.saveSettings();
                AssertInternalError.throwErrorIfVoidPromiseRejected(promise, 'IPICS10987');
                settingSaveInitiated = true;
                this.ensureIdleCallbackRequested(); // Initiate another one in case desktop save also required
            }
        }

        if (!settingSaveInitiated) {
            const localDesktopFrame = this._workspaceService.localDesktopFrame;
            if (localDesktopFrame !== undefined) {
                if (localDesktopFrame.layoutSaveRequired) {
                    if (nowTime === undefined) {
                        nowTime = SysTick.now();
                    }
                    if (nowTime < this._localDesktopLayoutSaveNotAllowedUntilTime) {
                        this.ensureIdleCallbackRequested(); // Initiate another one to try again later
                    } else {
                        const promise = this.saveLocalDesktopLayout(localDesktopFrame);
                        AssertInternalError.throwErrorIfVoidPromiseRejected(promise, 'IPICLDL10987');
                    }
                }
            }
        }
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
    export const idleCallbackTimeout = 10 * mSecsPerSec;
    export const minimumSettingsSaveRepeatSpan = 5 * mSecsPerSec;
    export const minimumLocalDesktopLayoutSaveRepeatSpan = 5 * mSecsPerSec;
}
