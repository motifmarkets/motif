/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId } from './data-types';

export abstract class LitIvemAttributes {
    private _unrecognisedAttributes: LitIvemAttributes.UnrecognisedAttributes = [];

    constructor(private _exchangeId: ExchangeId) { }

    get exchangeId() { return this._exchangeId; }

    get unrecognisedAttributes() { return this._unrecognisedAttributes; }
    get unrecognisedCount() { return this._unrecognisedAttributes.length; }

    addUnrecognised(key: string, value: string) {
        const attribute: LitIvemAttributes.UnrecognisedAttribute = {
            key,
            value,
        };
        this._unrecognisedAttributes.push(attribute);
    }

    abstract isEqualTo(other: LitIvemAttributes): boolean;
}

export namespace LitIvemAttributes {
    export interface UnrecognisedAttribute {
        key: string;
        value: string;
    }

    export type UnrecognisedAttributes = UnrecognisedAttribute[];

    export function isEqual(left: LitIvemAttributes, right: LitIvemAttributes) {
        if (left.exchangeId !== right.exchangeId) {
            return false;
        } else {
            return left.isEqualTo(right);
        }
    }

    export function isUndefinableEqual(left: LitIvemAttributes | undefined, right: LitIvemAttributes | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return isEqual(left, right);
            }
        }
    }
}
