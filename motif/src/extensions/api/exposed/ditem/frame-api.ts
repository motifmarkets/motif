/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export interface Frame {
    readonly rootHtmlElement: HTMLElement;
    readonly svc: Frame.SvcProxy;
}

export namespace Frame {
    export interface SvcProxy {
        frameTypeName: string;
        ditemFrame: unknown;
        destroy(): void;
    }
}
