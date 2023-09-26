/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export interface FactoryComponent {
    factoryComponentRef: FactoryComponent.ComponentRef;
    readonly rootHtmlElement: HTMLElement;
    destroy(): void;
}

export namespace FactoryComponent {
    export interface ComponentRef {
        readonly rootHtmlElement: HTMLElement;
    }
}
