/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { extStrings } from 'src/res/internal-api';
import { MultiEvent } from 'src/sys/internal-api';
import { BooleanUiAction } from '../boolean-ui-action';
import { Command } from './command';

export class CommandUiAction extends BooleanUiAction {
    private _accessKey = '';

    private _accessibleCaption: CommandUiAction.AccessibleCaption;

    private _commandPushMultiEvent = new MultiEvent<CommandUiAction.PushEventHandlersInterface>();

    get command() { return this._command; }
    get accessKey() { return this._accessKey; }
    get accessibleCaption() { return this._accessibleCaption; }

    constructor(private _command: Command) {
        super(false);
        const caption = extStrings[this._command.extensionHandle][this._command.defaultDisplayIndex];
        this.pushCaption(caption);
    }

    override pushCaption(caption: string) {
        super.pushCaption(caption);
        const accesibleCaption = CommandUiAction.AccessibleCaption.create(this.caption, this._accessKey);
        if (this._accessibleCaption === undefined ||
            !CommandUiAction.AccessibleCaption.isEqual(accesibleCaption, this._accessibleCaption)
        ) {
            this._accessibleCaption = accesibleCaption;
            this.notifyAccessibleCaptionPush();
        }
    }

    pushAccessKey(accessKey: string) {
        if (accessKey !== this._accessKey && accessKey.length === 1) {
            this._accessKey = accessKey;
            const accesibleCaption = CommandUiAction.AccessibleCaption.create(this.caption, this._accessKey);
            if (!CommandUiAction.AccessibleCaption.isEqual(accesibleCaption, this._accessibleCaption)) {
                this._accessibleCaption = accesibleCaption;
                this.notifyAccessibleCaptionPush();
            }
        }
    }

    private notifyAccessibleCaptionPush() {
        const handlersInterfaces = this._commandPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.accessibleCaption !== undefined) {
                handlersInterface.accessibleCaption(this._accessibleCaption);
            }
        }
    }
}

export namespace CommandUiAction {
    export interface AccessibleCaption {
        readonly preAccessKey: string;
        readonly accessKey: string;
        readonly postAccessKey: string;
    }

    export interface UnaccessibleCaption extends AccessibleCaption {
        readonly preAccessKey: string;
        readonly accessKey: '';
        readonly postAccessKey: '';
    }

    export namespace AccessibleCaption {
        export function create(caption: string, accessKey: string): AccessibleCaption {
            if (accessKey.length !== 1) {
                const result: UnaccessibleCaption = {
                    preAccessKey: caption,
                    accessKey: '',
                    postAccessKey: '',
                };
                return result;
            } else {
                const keyIndex = caption.indexOf(accessKey);
                if (keyIndex < 0) {
                    const result: UnaccessibleCaption = {
                        preAccessKey: caption,
                        accessKey: '',
                        postAccessKey: '',
                    };
                    return result;
                } else {
                    return {
                        preAccessKey: caption.substr(0, keyIndex),
                        accessKey: caption[keyIndex],
                        postAccessKey: caption.substr(keyIndex + 1),
                    };
                }
            }
        }

        export function isEqual(left: AccessibleCaption, right: AccessibleCaption) {
            return left.preAccessKey === right.preAccessKey &&
                left.accessKey && right.accessKey &&
                left.postAccessKey === right.postAccessKey;
        }
    }

    export type AccessibleCaptionPushEventHander = (this: void, value: AccessibleCaption) => void;

    export interface PushEventHandlersInterface extends BooleanUiAction.PushEventHandlersInterface {
        accessibleCaption?: AccessibleCaptionPushEventHander;
    }
}
