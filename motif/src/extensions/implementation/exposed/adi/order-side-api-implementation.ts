/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SideId } from 'adi-internal-api';
import { AssertInternalError, UnreachableCaseError } from 'sys-internal-api';
import {
    ApiError as ApiErrorApi,
    OrderSide as OrderSideApi,
    OrderSideEnum as OrderSideEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace OrderSideImplementation {
    export function toApi(value: SideId): OrderSideApi {
        switch (value) {
            case SideId.Buy: return OrderSideEnumApi.Buy;
            case SideId.Sell: return OrderSideEnumApi.Sell;
            case SideId.BuyMinus: throw new AssertInternalError('OSAITABM2400091112');
            case SideId.SellPlus: throw new AssertInternalError('OSAITASP2400091112');
            case SideId.SellShort: throw new AssertInternalError('OSAITASS2400091112');
            case SideId.SellShortExempt: throw new AssertInternalError('OSAITASSE2400091112');
            case SideId.Undisclosed: throw new AssertInternalError('OSAITA24UD00091112');
            case SideId.Cross: throw new AssertInternalError('OSAITAC2400091112');
            case SideId.CrossShort: throw new AssertInternalError('OSAITA24CS00091112');
            case SideId.CrossShortExempt: throw new AssertInternalError('OSAITACSE2400091112');
            case SideId.AsDefined: throw new AssertInternalError('OSAITAAD2400091112');
            case SideId.Opposite: throw new AssertInternalError('OSAITAO2400091112');
            case SideId.Subscribe: throw new AssertInternalError('OSAITAS2400091112');
            case SideId.Redeem: throw new AssertInternalError('OSAITAR2400091112');
            case SideId.Lend: throw new AssertInternalError('OSAITAL2400091112');
            case SideId.Borrow: throw new AssertInternalError('OSAITAB2400091112');
            default: throw new UnreachableCaseError('OSAITAU2400091112', value);
        }
    }

    export function fromApi(value: OrderSideApi): SideId {
        const enumValue = value as OrderSideEnumApi;
        switch (enumValue) {
            case OrderSideEnumApi.Buy: return SideId.Buy;
            case OrderSideEnumApi.Sell: return SideId.Sell;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidOrderSide, enumValue);
        }
    }

    export function arrayToApi(value: readonly SideId[]): OrderSideApi[] {
        const count = value.length;
        const result = new Array<OrderSideApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly OrderSideApi[]): SideId[] {
        const count = value.length;
        const result = new Array<SideId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
