/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandUiAction } from './command-ui-action-api';

/** @public */
export interface ButtonUiAction extends CommandUiAction {
    pushUnselected(): void;
    pushSelected(): void;
}
