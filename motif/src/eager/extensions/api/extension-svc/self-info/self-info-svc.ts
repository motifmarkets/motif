/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PublisherType } from '../../exposed/extension-api';

/** @public */
export interface SelfInfoSvc {
    readonly publisherType: PublisherType;
    readonly publisherName: string;
    readonly name: string;
    readonly version: string;
    readonly shortDescription: string;
    readonly longDescription: string;
}
