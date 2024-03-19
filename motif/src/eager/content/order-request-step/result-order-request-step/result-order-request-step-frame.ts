/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    Badness,
    Decimal,
    EnumInfoOutOfOrderError,
    Integer,
    MultiEvent,
    Order,
    OrderPad,
    OrderRequestDataDefinition,
    OrderRequestDataItem,
    OrderRequestError,
    OrderRequestErrorCode,
    OrderRequestErrorCodeId,
    OrderRequestResultId,
    OrderRequestTypeId,
    OrdersDataMessage,
    StringId,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { OrderRequestStepFrame } from '../order-request-step-frame';

export class ResultOrderRequestStepFrame extends OrderRequestStepFrame {
    orderBecameAvailableEvent: ResultOrderRequestStepFrame.OrderBecameAvailableEvent;

    private _orderPad: OrderPad;
    private _requestTypeId: OrderRequestTypeId;
    private _statusId: ResultOrderRequestStepFrame.StatusId;

    private _dataItem: OrderRequestDataItem | undefined;
    private _incubationError: string | undefined;
    private _order: OrdersDataMessage.AddUpdateChange | undefined;
    private _errors: OrderRequestError[] | undefined;
    private _estimatedBrokerage: Decimal | undefined;
    private _estimatedTax: Decimal | undefined;
    private _estimatedValue: Decimal | undefined;

    private _dataItemBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _dataItemCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _componentAccess: ResultOrderRequestStepFrame.ComponentAccess, private readonly _adi: AdiService) {
        super(OrderRequestStepFrame.StepId.Result);
    }

    get order() { return this._order; }

    override finalise() {
        this.checkUnsubscribeDataItem();
        super.finalise();
    }

    send(orderPad: OrderPad, definition: OrderRequestDataDefinition) {
        if (orderPad.sent) {
            const name = orderPad.routedIvemId === undefined ? '' : orderPad.routedIvemId.name;
            throw new AssertInternalError('RORSFS3885309', name);
        } else {
            this._incubationError = undefined;
            this._order = undefined;
            this._errors = undefined;
            this._estimatedBrokerage = undefined;
            this._estimatedTax = undefined;
            this._estimatedValue = undefined;

            this._orderPad = orderPad;
            this._requestTypeId = orderPad.requestTypeId;
            this._statusId = ResultOrderRequestStepFrame.StatusId.Waiting;

            this.checkUnsubscribeDataItem();

            this._orderPad.setSent();

            this.pushAll();

            this._dataItem = this._adi.subscribe(definition) as OrderRequestDataItem;
            this._dataItemBadnessChangeSubscriptionId = this._dataItem.subscribeBadnessChangedEvent(
                () => this.handleDataItemBadnessChangeEvent()
            );
            this._dataItemCorrectnessChangeSubscriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
                () => this.handleDataItemCorrectnessChangeEvent()
            );

            this._componentAccess.hideBadnessWithVisibleDelay(this._dataItem.badness);
        }
    }

    private handleDataItemBadnessChangeEvent() {
        if (this._dataItem === undefined) {
            throw new AssertInternalError('RORSFHDIBCE4482334');
        } else {
            this._componentAccess.setBadness(this._dataItem.badness);
        }
    }

    private handleDataItemCorrectnessChangeEvent() {
        if (this._dataItem === undefined) {
            throw new AssertInternalError('RORSFHDICCE145578');
        } else {
            if (this._dataItem.incubated) {
                this._componentAccess.setBadness(this._dataItem.badness); // in case the correctness event comes first
                this.processIncubatedDataItem(this._dataItem);
            }
        }
    }

    private checkUnsubscribeDataItem() {
        if (this._dataItem !== undefined) {
            this._dataItem.unsubscribeBadnessChangedEvent(this._dataItemBadnessChangeSubscriptionId);
            this._dataItemBadnessChangeSubscriptionId = undefined;
            this._dataItem.unsubscribeCorrectnessChangedEvent(this._dataItemCorrectnessChangeSubscriptionId);
            this._dataItemCorrectnessChangeSubscriptionId = undefined;
            this._adi.unsubscribe(this._dataItem);
            this._dataItem = undefined;
        }
    }

    private calculateStatusId(resultId: OrderRequestResultId) {
        switch (resultId) {
            case OrderRequestResultId.Success: return ResultOrderRequestStepFrame.StatusId.Success;
            case OrderRequestResultId.Error: return ResultOrderRequestStepFrame.StatusId.Error;
            case OrderRequestResultId.Incomplete: return ResultOrderRequestStepFrame.StatusId.Incomplete;
            case OrderRequestResultId.Invalid: return ResultOrderRequestStepFrame.StatusId.Invalid;
            case OrderRequestResultId.Rejected: return ResultOrderRequestStepFrame.StatusId.Rejected;
            default: throw new UnreachableCaseError('RORSFCSI8744451', resultId);
        }
    }

    private processIncubatedDataItem(dataItem: OrderRequestDataItem) {
        if (dataItem.requestTypeId !== this._requestTypeId) {
            throw new AssertInternalError('RORSFPIDI299821', dataItem.requestTypeId.toString(10));
        } else {
            if (dataItem.error) {
                this._incubationError = dataItem.errorText;
                this._statusId = ResultOrderRequestStepFrame.StatusId.CommunicateError;
            } else {
                this._incubationError = undefined;
                this._statusId = this.calculateStatusId(dataItem.result);
                this._order = dataItem.order;
                this._errors = dataItem.errors;
                this._estimatedBrokerage = dataItem.estimatedBrokerage;
                this._estimatedTax = dataItem.estimatedTax;
                this._estimatedValue = dataItem.estimatedValue;
            }

            this.checkUnsubscribeDataItem();

            this.pushAll();

            if (this._order !== undefined) {
                this.orderBecameAvailableEvent(new Order.Key(this._order.id, this._order.accountId));
            }
        }
    }

    private pushStatus() {
        const success = this._statusId === ResultOrderRequestStepFrame.StatusId.Success;
        const statusText = ResultOrderRequestStepFrame.Status.idToDisplay(this._statusId);
        this._componentAccess.pushStatus(success, statusText);
    }

    private pushOrderId() {
        const orderIdText = this._order === undefined ? '' : this._order.id;
        this._componentAccess.pushOrderId(orderIdText);
    }

    private pushErrors() {
        let count = this._incubationError === undefined ? 0 : 1;
        if (this._errors !== undefined) {
            count += this._errors.length;
        }

        const errorTitles = new Array<string>(count);
        const errorTexts = new Array<string>(count * 2);
        let textIdx = 0;
        let titleIdx = 0;

        if (this._incubationError !== undefined) {
            errorTexts[textIdx++] = this._incubationError;
            errorTitles[titleIdx++] = this._incubationError;
        }

        if (this._errors !== undefined) {
            for (const error of this._errors) {
                const codeId = error.codeId;
                let codeDisplay: string;
                if (codeId === OrderRequestErrorCodeId.Unknown) {
                    codeDisplay = error.code;
                } else {
                    codeDisplay = OrderRequestErrorCode.idToDisplay(error.codeId);
                }
                errorTexts[textIdx++] = '> ' + codeDisplay;

                const value = error.value;
                if (value === undefined) {
                    errorTitles[titleIdx++] = codeDisplay;
                } else {
                    errorTexts[textIdx++] = '  ' + value;
                    errorTitles[titleIdx++] = codeDisplay + ': ' + value;
                }
            }
        }

        errorTexts.length = textIdx;
        const fullErrorText = errorTexts.join('\n');
        errorTitles.length = titleIdx;
        const fullErrorTitle = errorTitles.join('\n');

        this._componentAccess.pushErrors(fullErrorText, fullErrorTitle);
    }

    private pushAll() {
        this.pushStatus();
        this.pushOrderId();
        this.pushErrors();
    }
}

export namespace ResultOrderRequestStepFrame {
    export type OrderBecameAvailableEvent = (this: void, order: Order.Key) => void;

    export const enum StatusId {
        Waiting,
        CommunicateError,
        Success,
        Error,
        Incomplete,
        Invalid,
        Rejected,
    }

    export namespace Status {
        export type Id = StatusId;

        interface Info {
            id: Id;
            displayId: StringId;
        }
        type InfosObject = { [id in keyof typeof StatusId]: Info };

        const infosObject: InfosObject = {
            Waiting: {
                id: StatusId.Waiting,
                displayId: StringId.OrderRequestResultStatusDisplay_Waiting,
            },
            CommunicateError: {
                id: StatusId.CommunicateError,
                displayId: StringId.OrderRequestResultStatusDisplay_CommunicateError,
            },
            Success: {
                id: StatusId.Success,
                displayId: StringId.OrderRequestResultStatusDisplay_Success,
            },
            Error: {
                id: StatusId.Error,
                displayId: StringId.OrderRequestResultStatusDisplay_Error,
            },
            Incomplete: {
                id: StatusId.Incomplete,
                displayId: StringId.OrderRequestResultStatusDisplay_Incomplete,
            },
            Invalid: {
                id: StatusId.Invalid,
                displayId: StringId.OrderRequestResultStatusDisplay_Invalid,
            },
            Rejected: {
                id: StatusId.Rejected,
                displayId: StringId.OrderRequestResultStatusDisplay_Rejected,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialiseStatus() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as StatusId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('OrderRequestErrorCode', outOfOrderIdx, idToDisplay(infos[outOfOrderIdx].id));
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }

    export interface ComponentAccess {
        pushStatus(success: boolean, value: string): void;
        pushErrors(text: string, title: string): void;
        pushOrderId(value: string): void;

        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }

    export function initialise() {
        Status.initialiseStatus();
    }
}

export namespace ResultOrderRequestStepFrameModule {
    export function initialiseStatic() {
        ResultOrderRequestStepFrame.initialise();
    }
}
