/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommandUiAction } from './command/command-ui-action';

export class ButtonUiAction extends CommandUiAction {

    pushUnselected() {
        this.pushValue(false);
    }

    pushSelected() {
        this.pushValue(true);
    }
}
