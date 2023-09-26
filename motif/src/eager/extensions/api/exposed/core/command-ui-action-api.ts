/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Command } from '../core/command-api';
import { BooleanUiAction } from './boolean-ui-action-api';

/** @public */
export interface CommandUiAction extends BooleanUiAction {
    readonly command: Command;
    readonly accessKey: string;
    readonly accessibleCaption: CommandUiAction.AccessibleCaption;

    pushAccessKey(accessKey: string): void;
}

/** @public */
export namespace CommandUiAction {
    export interface AccessibleCaption {
        readonly preAccessKey: string;
        readonly accessKey: string;
        readonly postAccessKey: string;
    }
}
