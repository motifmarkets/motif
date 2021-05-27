/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FeedClass } from 'src/adi/internal-api';
import {
    FeedClass as FeedClassApi,
    FeedClassHandle as FeedClassHandleApi,
    FeedClassSvc
} from '../../../api/extension-api';
import { FeedClassImplementation } from '../../exposed/internal-api';

export class FeedClassSvcImplementation implements FeedClassSvc {
    toName(id: FeedClassApi) {
        const feedClassId = FeedClassImplementation.fromApi(id);
        return FeedClass.idToName(feedClassId);
    }

    toDisplay(id: FeedClassApi) {
        const feedClassId = FeedClassImplementation.fromApi(id);
        return FeedClass.idToDisplay(feedClassId);
    }

    toHandle(id: FeedClassApi) {
        return FeedClassImplementation.fromApi(id);
    }

    fromHandle(handle: FeedClassHandleApi) {
        return FeedClassImplementation.toApi(handle);
    }

    handleToName(handle: FeedClassHandleApi) {
        return FeedClass.idToName(handle);
    }

    handleToDisplay(handle: FeedClassHandleApi) {
        return FeedClass.idToDisplay(handle);
    }
}
