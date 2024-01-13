/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, MultiEvent, Result, SaveManagement, StringId, Strings, UserAlertService } from '@motifmarkets/motif-core';

export class HideUnloadSaveService {
    private readonly _registrations = new Array<HideUnloadSaveService.Registration>();

    private _documentVisibilityChangeListening = false;
    private _canLeaveAlert: UserAlertService.Alert | undefined;

    constructor(private readonly _userAlertService: UserAlertService) {
        document.addEventListener('visibilitychange', this._documentVisibilityChangeListener);
        this._documentVisibilityChangeListening = true;
    }

    finalise() {
        if (this._documentVisibilityChangeListening) {
            document.removeEventListener('visibilitychange', this._documentVisibilityChangeListener);
            this._documentVisibilityChangeListening = false;
        }
    }

    registerSaveManagement(saveManagement: SaveManagement) {
        const registration: HideUnloadSaveService.Registration = {
            saveManagement,
            beginSaveWaitingSubscriptionId: undefined,
            endSaveWaitingSubscriptionId: undefined,
        };

        registration.beginSaveWaitingSubscriptionId = saveManagement.subscribeBeginSaveWaitingEvent(() => this.handleBeginSaveWaitingEvent(registration));
        registration.endSaveWaitingSubscriptionId = saveManagement.subscribeEndSaveWaitingEvent(() => this.handleEndSaveWaitingEvent(registration));

        this._registrations.push((registration));
    }

    deregisterSaveManagement(saveManagment: SaveManagement) {
        const index = this._registrations.findIndex((registration) => registration.saveManagement === saveManagment);
        if (index < 0) {
            throw new AssertInternalError('HUSSDSM44456');
        } else {
            const registration = this._registrations[index];
            saveManagment.unsubscribeBeginSaveWaitingEvent(registration.beginSaveWaitingSubscriptionId);
            saveManagment.unsubscribeEndSaveWaitingEvent(registration.endSaveWaitingSubscriptionId);

            this._registrations.splice(index, 1);
        }
    }

    private _documentVisibilityChangeListener = () => { this.handleDocumentVisibilityChange(); };
    private _globalBeforeUnloadListener = (event: BeforeUnloadEvent) => { this.handleGlobalBeforeUnload(event); };

    private handleDocumentVisibilityChange() {
        const documentHidden = document.hidden;
        if (documentHidden) {
            for (const registration of this._registrations) {
                const saveManagement = registration.saveManagement;
                const saveRequired = saveManagement.checkCancelSaveRequest();
                if (saveRequired) {
                    // do save immediately (may be shutting down)
                    const promise = saveManagement.save();
                    promise.then(
                        (result) => {
                            saveManagement.processSaveResult(result, SaveManagement.InitiateReasonId.Hide);
                        },
                        (reason) => {
                            throw AssertInternalError.createIfNotError(reason, 'SSHDVC40498');
                        }
                    );
                }
            }
        }
    }

    private handleGlobalBeforeUnload(event: BeforeUnloadEvent) {
        const registrations = this._registrations;
        const registrationCount = registrations.length;
        const needSavingSaveManagements = new Array<SaveManagement>(registrationCount);
        let needSavingCount = 0;
        for (let i = 0; i < registrationCount; i++) {
            const registration = registrations[i];
            const saveManagement = registration.saveManagement;
            if (saveManagement.checkCancelSaveRequest()) {
                needSavingSaveManagements[needSavingCount++] = saveManagement;
            }
        }
        needSavingSaveManagements.length = needSavingCount;
        if (needSavingCount > 0) {
            // do save immediately (shutting down)
            event.preventDefault(); // show leave confirmation dialog
            event.returnValue = true;

            this._userAlertService.enabled = true;
            const alert = this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.DataSavingBeforeLeave, Strings[StringId.UserAlert_PleaseWaitSavingChanges]);
            const promises = new Array<Promise<Result<void>>>(needSavingCount);

            for (let i = 0; i < needSavingCount; i++) {
                const saveManagement = needSavingSaveManagements[i];
                promises[i] = saveManagement.save();
            }

            Promise.all(promises).then(
                (results) => {
                    for (let i = 0; i < needSavingCount; i++) {
                        const saveManagement = needSavingSaveManagements[i];
                        saveManagement.processSaveResult(results[i], SaveManagement.InitiateReasonId.Unload);
                    }
                    if (alert === undefined) {
                        throw new AssertInternalError('HUSSHGBUU45091');
                    } else {
                        this._userAlertService.clearAlert(alert);
                        this._canLeaveAlert = this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.CanLeave, Strings[StringId.UserAlert_ChangesSavedOkToLeaveOrRestorePage]);
                    }
                },
                (reason) => {
                    throw AssertInternalError.createIfNotError(reason, 'HUSSHGBUR40498');
                }
            );
        }
    }

    private handleBeginSaveWaitingEvent(registration: HideUnloadSaveService.Registration) {
        if (this._canLeaveAlert !== undefined) {
            this._userAlertService.clearAlert(this._canLeaveAlert);
            this._canLeaveAlert = undefined;
        }
        globalThis.addEventListener('beforeunload', this._globalBeforeUnloadListener);
    }

    private handleEndSaveWaitingEvent(registration: HideUnloadSaveService.Registration) {
        globalThis.removeEventListener('beforeunload', this._globalBeforeUnloadListener);
    }
}

export namespace HideUnloadSaveService {
    export interface Registration {
        readonly saveManagement: SaveManagement;
        beginSaveWaitingSubscriptionId: MultiEvent.SubscriptionId;
        endSaveWaitingSubscriptionId: MultiEvent.SubscriptionId;
    }
}

