/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FeedId, FeedIdHandle } from '../../exposed/extension-api';

/** @public */
export interface FeedIdSvc {
    toName(id: FeedId): string;
    fromName(name: string): FeedId | undefined;
    toDisplay(id: FeedId): string;

    toHandle(id: FeedId): FeedIdHandle;
    fromHandle(handle: FeedIdHandle): FeedId | undefined;

    handleToName(handle: FeedIdHandle): string;
    handleFromName(name: string): FeedIdHandle | undefined;
    handleToDisplay(handle: FeedIdHandle): string;
}
