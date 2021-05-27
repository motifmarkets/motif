/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FeedClass, Integer } from '../../exposed/extension-api';

/** @public */
export interface FeedClassSvc {
    toName(id: FeedClass): string;
    toDisplay(id: FeedClass): string;

    toHandle(id: FeedClass): FeedClassHandle;
    fromHandle(handle: FeedClassHandle): FeedClass | undefined;

    handleToName(handle: FeedClassHandle): string;
    handleToDisplay(handle: FeedClassHandle): string;
}

/** @public */
export type FeedClassHandle = Integer;
