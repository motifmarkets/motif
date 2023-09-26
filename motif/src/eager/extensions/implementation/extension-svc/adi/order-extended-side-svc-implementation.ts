/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderExtendedSide } from '@motifmarkets/motif-core';
import {
    OrderExtendedSide as OrderExtendedSideApi,
    OrderExtendedSideHandle as OrderExtendedSideHandleApi,
    OrderExtendedSideSvc
} from '../../../api/extension-api';
import { OrderExtendedSideImplementation } from '../../exposed/internal-api';

export class OrderExtendedSideSvcImplementation implements OrderExtendedSideSvc {
    toName(id: OrderExtendedSideApi) {
        const sideId = OrderExtendedSideImplementation.fromApi(id);
        return OrderExtendedSide.idToName(sideId);
    }

    fromName(name: string) {
        const sideId = OrderExtendedSide.tryNameToId(name);
        if (sideId === undefined) {
            return undefined;
        } else {
            return OrderExtendedSideImplementation.toApi(sideId);
        }
    }

    toDisplay(id: OrderExtendedSideApi) {
        const sideId = OrderExtendedSideImplementation.fromApi(id);
        return OrderExtendedSide.idToDisplay(sideId);
    }

    toHandle(id: OrderExtendedSideApi) {
        return OrderExtendedSideImplementation.fromApi(id);
    }

    fromHandle(handle: OrderExtendedSideHandleApi) {
        return OrderExtendedSideImplementation.toApi(handle);
    }

    handleToName(handle: OrderExtendedSideHandleApi) {
        return OrderExtendedSide.idToName(handle);
    }

    handleFromName(name: string) {
        return OrderExtendedSide.tryNameToId(name);
    }

    handleToDisplay(handle: OrderExtendedSideHandleApi) {
        return OrderExtendedSide.idToDisplay(handle);
    }
}
