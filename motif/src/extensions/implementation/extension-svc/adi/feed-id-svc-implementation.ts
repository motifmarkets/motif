/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FeedInfo } from '@motifmarkets/motif-core';
import {
    FeedId as FeedIdApi,
    FeedIdHandle as FeedIdHandleApi,
    FeedIdSvc
} from '../../../api/extension-api';
import { FeedIdImplementation } from '../../exposed/internal-api';

export class FeedIdSvcImplementation implements FeedIdSvc {
    toName(id: FeedIdApi) {
        const feedId = FeedIdImplementation.fromApi(id);
        return FeedInfo.idToName(feedId);
    }

    fromName(name: string) {
        const feedId = FeedInfo.tryNameToId(name);
        if (feedId === undefined) {
            return undefined;
        } else {
            return FeedIdImplementation.toApi(feedId);
        }
    }

    toDisplay(id: FeedIdApi) {
        const feedId = FeedIdImplementation.fromApi(id);
        return FeedInfo.idToDisplay(feedId);
    }

    toHandle(id: FeedIdApi) {
        return FeedIdImplementation.fromApi(id);
    }

    fromHandle(handle: FeedIdHandleApi) {
        return FeedIdImplementation.toApi(handle);
    }

    handleToName(handle: FeedIdHandleApi) {
        return FeedInfo.idToName(handle);
    }

    handleFromName(name: string) {
        return FeedInfo.tryNameToId(name);
    }

    handleToDisplay(handle: FeedIdHandleApi) {
        return FeedInfo.idToDisplay(handle);
    }
}
