/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement, OrderPad, OrderRequestDataDefinition, OrderRequestTypeId, UnreachableCaseError } from '@motifmarkets/motif-core';
import { OrderRequestStepFrame } from '../order-request-step-frame';

export class ReviewOrderRequestStepFrame extends OrderRequestStepFrame {

    constructor(private readonly _componentAccess: ReviewOrderRequestStepFrame.ComponentAccess) {
        super(OrderRequestStepFrame.StepId.Review);
    }

    loadLayoutConfig(element: JsonElement | undefined) {
    }

    saveLayoutConfig(element: JsonElement) {
    }

    setOrderPad(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        switch (orderPad.requestTypeId) {
            case OrderRequestTypeId.Place: {
                this._componentAccess.reviewPlace(orderPad, definition, zenithMessageActive);
                break;
            }
            case OrderRequestTypeId.Amend: {
                this._componentAccess.reviewAmend(orderPad, definition, zenithMessageActive);
                break;
            }
            case OrderRequestTypeId.Move: {
                this._componentAccess.reviewMove(orderPad, definition, zenithMessageActive);
                break;
            }
            case OrderRequestTypeId.Cancel: {
                this._componentAccess.reviewCancel(orderPad, definition, zenithMessageActive);
                break;
            }
            default:
                throw new UnreachableCaseError('RORSFSOP688337421', orderPad.requestTypeId);
        }
    }

    setZenithMessageActive(value: boolean) {
        this._componentAccess.setZenithMessageActive(value);
    }
}

export namespace ReviewOrderRequestStepFrame {
    export interface ComponentAccess {
        reviewPlace(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean): void;
        reviewAmend(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean): void;
        reviewCancel(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean): void;
        reviewMove(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean): void;
        setZenithMessageActive(value: boolean): void;
    }
}
