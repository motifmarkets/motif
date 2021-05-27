/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError } from './internal-error';

export class UserAlertService {
    enabled = true;

    alertQueuedEvent: UserAlertService.AlertQueuedEvent;

    private _queuedAlerts: UserAlertService.Alert[] = [];

    getAndClearAlerts() {
        const existingAlerts: readonly UserAlertService.Alert[] = this._queuedAlerts.slice();
        this._queuedAlerts.length = 0;
        return existingAlerts;
    }

    queueAlert(typeId: UserAlertService.Alert.Type.Id, text: string) {
        if (this.enabled) {
            this._queuedAlerts.push({ typeId, text, time: new Date(Date.now()) } );
            if (this.alertQueuedEvent !== undefined) {
                this.alertQueuedEvent();
            }
        }
    }
}

export namespace UserAlertService {
    export type AlertQueuedEvent = (this: void) => void;

    export interface Alert {
        typeId: Alert.Type.Id;
        text: string;
        time: Date;
    }

    export namespace Alert {
        export namespace Type {
            export const enum Id {
                Exception,
                UnhandledError,
                SettingChanged,
                ResetLayout,
            }

            interface Info {
                readonly id: Id;
                readonly name: string;
                readonly restartRequired: boolean;
                readonly unstable: boolean;
                readonly error: boolean;
            }

            type InfosObject = { [id in keyof typeof Id]: Info };

            const infosObject: InfosObject = {
                Exception: {
                    id: Id.Exception,
                    name: 'Exception',
                    restartRequired: true,
                    unstable: true,
                    error: true,
                },
                UnhandledError: {
                    id: Id.UnhandledError,
                    name: 'UnhandledError',
                    restartRequired: true,
                    unstable: true,
                    error: true,
                },
                SettingChanged: {
                    id: Id.SettingChanged,
                    name: 'SettingChanged',
                    restartRequired: true,
                    unstable: false,
                    error: false,
                },
                ResetLayout: {
                    id: Id.ResetLayout,
                    name: 'ResetLayout',
                    restartRequired: true,
                    unstable: false,
                    error: false,
                },
            } as const;

            const idCount = Object.keys(infosObject).length;
            const infos = Object.values(infosObject);

            export function initialise() {
                for (let id = 0; id < idCount; id++) {
                    if (infos[id].id !== id) {
                        throw new EnumInfoOutOfOrderError('UserAlertService.Alert.Type.Id', id, infos[id].name);
                    }
                }
            }

            export function idIsRestartRequired(id: Id) {
                return infos[id].restartRequired;
            }

            export function idIsUnstable(id: Id) {
                return infos[id].unstable;
            }

            export function idIsError(id: Id) {
                return infos[id].error;
            }
        }
    }
}

export namespace UserAlertServiceModule {
    export function initialiseStatic() {
        UserAlertService.Alert.Type.initialise();
    }
}
