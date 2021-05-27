/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FrameSvc } from '../../frame-svc/extension-api';

/** @public */
export interface Frame {
    readonly rootHtmlElement: HTMLElement;
    readonly svc: FrameSvc;
}
