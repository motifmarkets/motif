/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComponentImplementation, FactoryComponentRef } from '../component/internal-api';

export class ContentComponentImplementation extends ComponentImplementation {
    constructor(private readonly _factoryComponentRef: FactoryComponentRef) {
        super();
    }

    get factoryComponentRef() { return this._factoryComponentRef; }
    get rootHtmlElement() { return this._factoryComponentRef.rootHtmlElement; }

    destroy() {
        // normally nothing to do
    }
}
