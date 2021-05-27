/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/extension-api';

/** @public */
export interface LitIvemIdParseDetails {
    readonly success: boolean;
    readonly litIvemId: LitIvemId | undefined;
    readonly sourceIdExplicit: boolean;
    readonly marketIdExplicit: boolean;
    readonly errorText: string;
    readonly parseText: string;
}

