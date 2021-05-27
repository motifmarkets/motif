/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Side } from 'src/adi/internal-api';
import {
    OrderSide as OrderSideApi,
    OrderSideHandle as OrderSideHandleApi,
    OrderSideSvc
} from '../../../api/extension-api';
import { OrderSideImplementation } from '../../exposed/internal-api';

export class OrderSideSvcImplementation implements OrderSideSvc {
    toName(id: OrderSideApi) {
        const sideId = OrderSideImplementation.fromApi(id);
        return Side.idToName(sideId);
    }

    fromName(name: string) {
        const sideId = Side.tryNameToId(name);
        if (sideId === undefined) {
            return undefined;
        } else {
            return OrderSideImplementation.toApi(sideId);
        }
    }

    toDisplay(id: OrderSideApi) {
        const sideId = OrderSideImplementation.fromApi(id);
        return Side.idToDisplay(sideId);
    }

    toHandle(id: OrderSideApi) {
        return OrderSideImplementation.fromApi(id);
    }

    fromHandle(handle: OrderSideHandleApi) {
        return OrderSideImplementation.toApi(handle);
    }

    handleToName(handle: OrderSideHandleApi) {
        return Side.idToName(handle);
    }

    handleFromName(name: string) {
        return Side.tryNameToId(name);
    }

    handleToDisplay(handle: OrderSideHandleApi) {
        return Side.idToDisplay(handle);
    }
}
