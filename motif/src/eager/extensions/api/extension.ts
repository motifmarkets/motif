/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export interface Extension {
    unloadEventer: Extension.UnloadEventHandler;
}

/** @public */
export namespace Extension {
    export type UnloadEventHandler = (this: void) => void;
}

