/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LocalDesktop } from '../../exposed/extension-api';

/** @public */
export interface WorkspaceSvc {
    readonly localDesktop: LocalDesktop;
    localDesktopLoadedEventer: WorkspaceSvc.LocalDesktopLoadedEventHandler | undefined;
    getLoadedLocalDesktop(): Promise<LocalDesktop | undefined>;
}

/** @public */
export namespace WorkspaceSvc {
    export type LocalDesktopLoadedEventHandler = (this: void) => void;
}
