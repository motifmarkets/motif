/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';
import { BidAskSideId } from './data-types';
import { IvemId } from './ivem-id';

export interface TmcLeg {
    bidAskSideId: BidAskSideId;
    ratio: Integer;
    ivemId: IvemId;
}

export namespace TmcLeg {
    export function isEqual(left: TmcLeg, right: TmcLeg) {
        return left.bidAskSideId === right.bidAskSideId && left.ratio === right.ratio && IvemId.isEqual(left.ivemId, right.ivemId);
    }
}

export type TmcLegs = readonly TmcLeg[];

export namespace TmcLegs {
    export function includes(legs: TmcLegs, leg: TmcLeg) {
        for (const elem of legs) {
            if (TmcLeg.isEqual(elem, leg)) {
                return true;
            }
        }
        return false;
    }

    export function isEqualUniquely(left: TmcLegs, right: TmcLegs) {
        const length = left.length;
        if (right.length !== length) {
            return false;
        } else {
            for (let i = 0; i < length; i++) {
                if (!TmcLegs.includes(left, right[i])) {
                    return false;
                }
            }
            return true;
        }
    }

    export function isUndefinableEqualUniquely(left: TmcLegs | undefined, right: TmcLegs | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return TmcLegs.isEqualUniquely(left, right);
            }
        }
    }
}
