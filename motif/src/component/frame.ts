/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export abstract class Frame {

    // private _name: string;
    // private _layoutConfigLoading = false;
    // private _layoutConfigLoaded = false;

    // private _isFinalised = false;

    // private _focused = false;

    // constructor() { }

    // get focused(): boolean { return this._focused; }

    // setName(value: string) {
    //     this._name = value;
    // }


    // get isFinalised(): boolean { return this._isFinalised; }

    // get layoutConfigLoading(): boolean { return this._layoutConfigLoading; }
    // get layoutConfigLoaded(): boolean { return this._layoutConfigLoaded; }
    // Virtual: Descendents can override this method.
    // public finalise() {
    //     this._isFinalised = true;
    //     // Descendants can release any resources in this method.
    // }

    // Sealed: Descendents must not override this method.
    // public loadFrameLayoutConfig(element: JsonElement | undefined) {
    //     this._layoutConfigLoading = true;
    //     try {
    //         // this.loadLayoutConfig(element);
    //     } finally {
    //         this._layoutConfigLoading = false;
    //         this.afterLayoutLoaded();
    //         this._layoutConfigLoaded = true;
    //         this.notifyFrameParamsChanged();
    //     }
    // }

    // Sealed: Descendents must not override this method.
    // public saveFrameLayoutConfig(element: JsonElement) {
    //     // this.saveLayoutConfig(element);
    // }

    // // Virtual: Descendents can override this method.
    // protected loadLayoutConfig(element: JsonElement | undefined): void { }

    // // Virtual: Descendents can override this method.
    // protected saveLayoutConfig(element: JsonElement) { }

    // Virtual: Descendents can override this method.
    // protected afterLayoutLoaded(): void { }

    // Virtual: Descendents can override this method.
    // protected notifyFrameParamsChanged(): void { }

}

export namespace Frame {
    export namespace FrameConfigItemName {
        export const component = 'component';
    }

    export const enum TMixedMarketFrameContext {
        mmfcSingleOnly,     // The frame is in a "single markets only" context. Do not allow mixed market usage.
        // Order destination will be Best Price Guarantee when opening an order pad.
        mmfcSingleOnlyWithMarketLink, // The frame is in a "single markets only" context. The order destination
        // will be the default for the focused market. (IE. ASXT for ASX markets).
        mmfcMixedOnly,      // The frame is in a "mixed markets only" context. Do not allow single market usage.
        mmfcSingleAndMixed  // The frame is in a dual context. It can handle both single and mixed market symbols.

    }

}
