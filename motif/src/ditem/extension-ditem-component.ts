/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DitemComponent } from './ditem-component';

export interface ExtensionDitemComponent extends DitemComponent {
    readonly rootHtmlElement: HTMLElement;
}

export namespace ExtensionDitemComponent {
    export interface GetResult {
        component: ExtensionDitemComponent | undefined;
        errorText: string | undefined;
    }
}
