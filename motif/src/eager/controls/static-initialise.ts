/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MenuBarMenuItemComponentDirectiveModule } from './menu-bar/ng/menu-bar-menu-item-component-ng.directive';

export namespace StaticInitialise {
    export function initialise() {
        MenuBarMenuItemComponentDirectiveModule.initialiseStatic();
    }
}
