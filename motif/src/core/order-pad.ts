/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';
import {
    Account,
    AdiService,
    AmendOrderRequestDataDefinition,
    BidAskSide,
    BidAskSideId,
    BrokerageAccountId,
    BrokerageAccountIncubator,
    BrokerageAccountsDataDefinition,
    BrokerageAccountsDataItem,
    CancelOrderRequestDataDefinition,
    DataItemIncubator,
    ExchangeInfo,
    FeedStatusId,
    Holding,
    ImmediateOrderTrigger,
    IvemClassId,
    IvemId,
    MarketOrderDetails,
    MarketOrderRoute,
    MovementId,
    MoveOrderRequestDataDefinition,
    Order,
    OrderId,
    OrderRequestDataDefinition,
    OrderRequestType,
    OrderRequestTypeId,
    OrderRoute,
    OrderTrigger,
    OrderTriggerType,
    OrderTriggerTypeId,
    OrderType,
    OrderTypeId,
    PlaceOrderRequestDataDefinition,
    PriceOrderTrigger,
    RoutedIvemId,
    Side,
    SideId,
    TimeInForce,
    TimeInForceId
} from 'src/adi/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError, concatenateArrayUniquely, EnumInfoOutOfOrderError,
    Integer, isArrayEqualUniquely,

    isUndefinableArrayEqualUniquely, isUndefinableDecimalEqual, Json,
    JsonElement,
    Logger,
    MultiEvent, newUndefinableDate,
    newUndefinableDecimal, NotImplementedError,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { SymbolsService } from './internal-api';
import { PriceStepperIncubator } from './price-stepper-incubator';
import { SecurityPriceStepper } from './security-price-stepper';
import { CoreSettings } from './settings/core-settings';
import { SymbolDetailCache, symbolDetailCache } from './symbol-detail-cache';

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
export class OrderPad {
    private _fields = new Array<OrderPad.Field>(OrderPad.Field.idCount);

    private _readonly: boolean;
    private _snapshot: boolean;
    private _sent: boolean;

    private _brokerageAccountsDataItemIncubator: DataItemIncubator<BrokerageAccountsDataItem>; // used to check for single brokerage account

    private _requestTypeId: OrderRequestTypeId;

    private _accountId: BrokerageAccountId | undefined;
    private _brokerageAccountIncubator: BrokerageAccountIncubator;
    private _account: Account | undefined;
    private _accountChangeSubscriptionId: MultiEvent.SubscriptionId;

    // private _accountDefaultBrokerageCode: string;
    // private _brokerageCodeListReady: boolean;
    // private _brokerage: Decimal;
    private _loadedExpiryDate: Date | undefined;
    private _expiryDate: Date | undefined;
    // private _instructionTime: Date;
    private _loadedRoutedIvemId: RoutedIvemId;
    private _routedIvemId: RoutedIvemId | undefined;
    private _allowedRoutes: readonly OrderRoute[] = [];
    private _ivemIdSymbolDetail: SymbolDetailCache.IvemIdDetail | undefined;
    private _litSymbolDetails: readonly SymbolDetailCache.LitIvemIdDetail[] | undefined;
    private _bestLitSymbolDetail: SymbolDetailCache.LitIvemIdDetail | undefined;

    // private _symbolName: string | undefined;
    // private _securityClassId: IvemClassId;
    // private _boardLotSize: boolean;
    // private _srn: string;
    // private _locateRequired: boolean;
    // private _algoId: TOrderAlgoId;
    // private _visibleQuantity: Integer;
    // private _minimumQuantity: Integer;
    // private _notes: string;
    private _loadedOrderTypeId: OrderTypeId;
    private _orderTypeId: OrderTypeId | undefined;
    private _allowedOrderTypeIds: readonly OrderTypeId[] = OrderPad.defaultAllowedOrderTypeIds;

    private _loadedTriggerTypeId: OrderTriggerTypeId;
    private _triggerTypeId: OrderTriggerTypeId | undefined;
    private _allowedTriggerTypeIds: readonly OrderTriggerTypeId[] = OrderPad.defaultAllowedTriggerTypeIds;
    private _triggerValue: Decimal | undefined;
    private _triggerFieldId: PriceOrderTrigger.FieldId | undefined;
    private _triggerMovementId: MovementId | undefined;
    // private _previewed: boolean;
    private _loadedTotalQuantity: Integer;
    private _totalQuantity: Integer | undefined;
    // private _origRequestId: string;
    // private _orderGivenBy: string;
    // private _orderGiversDataItemReady: boolean;
    // private _orderTakenBy: string;
    private _loadedLimitValue: Decimal | undefined;
    private _limitValue: Decimal | undefined;
    private _limitUnitId: OrderPad.PriceUnitId | undefined;
    private _priceStepperRetrieveError: string | undefined;
    private _priceStepper: SecurityPriceStepper | undefined;
    private _priceStepperIncubator: PriceStepperIncubator;

    private _loadedSideId: SideId;
    private _sideId: SideId | undefined;
    private _allowedSideIds: readonly SideId[] = OrderPad.defaultAllowedSideIds;
    // private _roaNoAdvice: boolean;
    // private _roaNotes: string;
    // private _soaRequired: boolean;
    // private _roaMethod: TCommsMethodId;
    // private _roaJustification: string;
    // private _roaDeclarations: Integer;
    // private _roaDeclarationDefinitionsDataItemReady: boolean;
    // private _tax: Decimal;
    private _loadedTimeInForceId: TimeInForceId;
    private _userTimeInForceId: TimeInForceId | undefined;
    private _timeInForceId: TimeInForceId | undefined;
    private _allowedTimeInForceIds: readonly TimeInForceId[] | undefined;

    // private _omsServiceOnline: boolean;

    // private _brokerageCodeList: OrderPad.BrokerageCodeEntry[];
    // private _brokerageCodeListAccountDefaultBrokerageCode: string;
    // private _manualBrokerageCodeAllowed: boolean;
    // private _manualBrokerageCode: string;

    // private _currentOmsOrderId: string;
    // private _loadedLeavesQuantity: Integer;

    // private _autoSetAccountDefaultBrokerageCode: boolean;
    // private _autoSetAccountDefaultOrderGivenBy: boolean;
    // private _workOrderNeedsNotes: boolean;
    // private _orderGivenByRequired: boolean;

    // symbol is supported when
    // private _limitValueValidity: OrderPad.ValidityId;
    // private _limitValueNotValidReasonId: OrderPad.Field.StatusReasonId;
    // private _triggerValueValidity: OrderPad.ValidityId;
    // private _triggerValueNotValidReasonId: OrderPad.Field.StatusReasonId;

    // private _symbolIsAsxIndexEto: boolean;
    // private _symbolAllowedOrderDestinationIds: OrderDestinationId[];
    // private _limitValueSupportedId: OrderPad.ValidityId;
    // private _limitValueNotSupportedReasonId: OrderPad.Field.StatusReasonId;
    // private _triggerValueSupportedId: OrderPad.ValidityId;
    // private _triggerValueNotSupportedReasonId: OrderPad.Field.StatusReasonId;

     // for amends, cancels and moves
    private _existingOrderId: OrderId | undefined;
    private _existingOrder: Order | undefined;

    // for moves
    private _destinationAccountId: BrokerageAccountId | undefined;
    private _destinationBrokerageAccountIncubator: BrokerageAccountIncubator;
    private _destinationAccount: Account | undefined;
    private _destinationAccountChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _beginChangesCount: Integer = 0;
    private _changedFieldIds: OrderPad.FieldId[] = [];
    private _updateStatusRequired = false;
    private _changesNotifying = false;
    private _statusUpdating: boolean;

    private _fieldsChangedMultiEvent = new MultiEvent<OrderPad.FieldsChangedEventHandler>();

    constructor(private _symbolsService: SymbolsService, private _adi: AdiService) {
        for (let i = 0; i < this._fields.length; i++) {
            this._fields[i] = new OrderPad.Field();
        }

        this._brokerageAccountsDataItemIncubator = new DataItemIncubator<BrokerageAccountsDataItem>(this._adi);
        const brokerageAccountsDefinition = new BrokerageAccountsDataDefinition();
        this._brokerageAccountsDataItemIncubator.initiateSubscribeIncubation(brokerageAccountsDefinition);

        this._brokerageAccountIncubator = new BrokerageAccountIncubator(this._adi);
        this._brokerageAccountIncubator.initialise();

        this._destinationBrokerageAccountIncubator = new BrokerageAccountIncubator(this._adi);
        this._destinationBrokerageAccountIncubator.initialise();

        this._priceStepperIncubator = new PriceStepperIncubator(this._adi);
        this._priceStepperIncubator.initialise();
    }

    get readonly() { return this._readonly; }
    get sent() { return this._sent; }

    get requestTypeId() { return this._requestTypeId; }

    get accountId() { return this._accountId; }
    set accountId(value: BrokerageAccountId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSAI28895243');
        } else {
            if (this._fields[OrderPad.FieldId.Account].isReadOnly()) {
                throw new AssertInternalError('OPSAI8723420');
            } else {
                this.beginChanges();
                try {
                    this.internalSetAccountId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get account() {
        return this._account;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get sideId() { return this._sideId; }
    set sideId(value: SideId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSSIR834711');
        } else {
            if (this._fields[OrderPad.FieldId.Side].isReadOnly()) {
                throw new AssertInternalError('OPSSIF299820');
            } else {
                this.beginChanges();
                try {
                    this.internalSetSideId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get allowedSideIds() { return this._allowedSideIds; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get routedIvemId() { return this._routedIvemId; }
    set routedIvemId(value: RoutedIvemId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSRIIR285998');
        } else {
            if (this._fields[OrderPad.FieldId.Symbol].isReadOnly()) {
                throw new AssertInternalError('OPSRIIF4886730');
            } else {
                this.beginChanges();
                try {
                    this.internalSetRoutedIvemId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get allowedRoutes() { return this._allowedRoutes; }
    set route(value: OrderRoute) {
        if (this.routedIvemId === undefined) {
            throw new AssertInternalError('OPSR288459987');
        } else {
            const routedIvemId = this.routedIvemId.createCopy();
            routedIvemId.route = value;
            this.routedIvemId = routedIvemId;
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get expiryDate() { return this._expiryDate; }
    set expiryDate(value: Date | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSEDR115398');
        } else {
            if (this._fields[OrderPad.FieldId.ExpiryDate].isReadOnly()) {
                throw new AssertInternalError('OPSEDF999837');
            } else {
                this.beginChanges();
                try {
                    this.internalSetExpiryDate(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get orderTypeId() { return this._orderTypeId; }
    set orderTypeId(value: OrderTypeId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSOTIR3338279');
        } else {
            if (this._fields[OrderPad.FieldId.OrderType].isReadOnly()) {
                throw new AssertInternalError('OPSOTIF199948');
            } else {
                this.beginChanges();
                try {
                    this.internalSetOrderTypeId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get allowedOrderTypeIds() { return this._allowedOrderTypeIds; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get triggerTypeId() { return this._triggerTypeId; }
    set triggerTypeId(value: OrderTriggerTypeId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSTTIR775498');
        } else {
            if (this._fields[OrderPad.FieldId.TriggerType].isReadOnly()) {
                throw new AssertInternalError('OPSTTIF9953887');
            } else {
                this.beginChanges();
                try {
                    this.internalSetTriggerTypeId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get allowedTriggerTypeIds() { return this._allowedTriggerTypeIds; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get triggerValue() { return this._triggerValue; }
    set triggerValue(value: Decimal | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSTVR775498');
        } else {
            if (this._fields[OrderPad.FieldId.TriggerValue].isReadOnly()) {
                throw new AssertInternalError('OPSTVF9953887');
            } else {
                this.beginChanges();
                try {
                    this.internalSetTriggerValue(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get triggerFieldId() { return this._triggerFieldId; }
    set triggerFieldId(value: PriceOrderTrigger.FieldId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSTFIR775498');
        } else {
            if (this._fields[OrderPad.FieldId.TriggerField].isReadOnly()) {
                throw new AssertInternalError('OPSTFIF9953887');
            } else {
                this.beginChanges();
                try {
                    this.internalSetTriggerFieldId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get triggerMovementId() { return this._triggerMovementId; }
    set triggerMovementId(value: MovementId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSTMR775498');
        } else {
            if (this._fields[OrderPad.FieldId.TriggerMovement].isReadOnly()) {
                throw new AssertInternalError('OPSTMF9953887');
            } else {
                this.beginChanges();
                try {
                    this.internalSetTriggerMovementId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get totalQuantity() { return this._totalQuantity; }
    set totalQuantity(value: Integer | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSTQR1212098');
        } else {
            if (this._fields[OrderPad.FieldId.TotalQuantity].isReadOnly()) {
                throw new AssertInternalError('OPSTQF5558372');
            } else {
                this.beginChanges();
                try {
                    this.internalSetTotalQuantity(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get limitValue() { return this._limitValue; }
    set limitValue(value: Decimal | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSLVR5888372');
        } else {
            if (this._fields[OrderPad.FieldId.LimitValue].isReadOnly()) {
                throw new AssertInternalError('OPSLVF885992');
            } else {
                this.beginChanges();
                try {
                    this.internalSetLimitValue(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get limitUnitId() { return this._limitUnitId; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get timeInForceId() { return this._timeInForceId; }
    set timeInForceId(value: TimeInForceId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSTIFIR333985');
        } else {
            if (this._fields[OrderPad.FieldId.TimeInForce].isReadOnly()) {
                throw new AssertInternalError('OPSTIFIF2088659');
            } else {
                this.beginChanges();
                try {
                    this.internalSetTimeInForceId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get allowedTimeInForceIds() { return this._allowedTimeInForceIds === undefined ? TimeInForce.all : this._allowedTimeInForceIds; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get existingOrderId() { return this._existingOrderId; }
    set existingOrderId(value: OrderId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSEOIR11885732');
        } else {
            if (this._fields[OrderPad.FieldId.ExistingOrder].isReadOnly()) {
                throw new AssertInternalError('OPSEOIF12000817');
            } else {
                this.beginChanges();
                try {
                    this.internalSetExistingOrderId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get existingOrder() { return this._existingOrder; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get destinationAccountId() { return this._destinationAccountId; }
    set destinationAccountId(value: BrokerageAccountId | undefined) {
        if (this._readonly) {
            throw new AssertInternalError('OPSAI28895243');
        } else {
            if (this._fields[OrderPad.FieldId.DestinationAccount].isReadOnly()) {
                throw new AssertInternalError('OPSAI8723420');
            } else {
                this.beginChanges();
                try {
                    this.internalSetDestinationAccountId(value);
                } finally {
                    this.endChanges();
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get destinationAccount() {
        return this._destinationAccount;
    }

    finalise() {
        this._destinationBrokerageAccountIncubator.finalise();
        this._brokerageAccountIncubator.finalise();
        this._brokerageAccountsDataItemIncubator.finalise();
        this._priceStepperIncubator.finalise();
    }

    setReadonly() {
        this._readonly = true;
    }

    setWritable() {
        this._readonly = false;
    }

    setSent() {
        this._sent = true;
    }

    beginChanges() {
        this._beginChangesCount++;
    }

    endChanges() {
        if (--this._beginChangesCount === 0) {
            if (this._updateStatusRequired) {
                this.updateStatus();
            }

            if (!this._changesNotifying) {
                while (this._changedFieldIds.length > 0) {
                    this._changesNotifying = true;
                    try {
                        const changedFieldIds = this._changedFieldIds; // move to local variable changed by event handlers
                        this._changedFieldIds = [];
                        this.notifyFieldsChanged(changedFieldIds);
                    } finally {
                        this._changesNotifying = false;
                    }
                }
            }
        }
    }

    getFieldStatusId(fieldId: OrderPad.FieldId) {
        return this._fields[fieldId].statusId;
    }

    getFieldStatusReasonId(fieldId: OrderPad.FieldId) {
        return this._fields[fieldId].statusReasonId;
    }

    isFieldEmpty(fieldId: OrderPad.FieldId) {
        switch (fieldId) {
            case OrderPad.FieldId.Account: return this._accountId === undefined;
            // case OrderPad.FieldId.BrokerageCode: return true;
            // case OrderPad.FieldId.BrokerageScheduleDataItemReady: return true;
            // case OrderPad.FieldId.AccountDefaultBrokerageCode: return true;
            // case OrderPad.FieldId.BrokerageCodeListReady: return true;
            // case OrderPad.FieldId.LinkId: return true;
            // case OrderPad.FieldId.Brokerage: return true;
            case OrderPad.FieldId.ExpiryDate: return this._expiryDate === undefined;
            // case OrderPad.FieldId.InstructionTime: return true;
            case OrderPad.FieldId.Symbol: return this._routedIvemId === undefined;
            // case OrderPad.FieldId.SymbolPriceStepSegmentsDataItemReady: return true;
            // case OrderPad.FieldId.Srn: return true;
            // case OrderPad.FieldId.LocateReqd: return true;
            // case OrderPad.FieldId.Algo: return true;
            // case OrderPad.FieldId.VisibleQuantity: return true;
            // case OrderPad.FieldId.MinimumQuantity: return true;
            // case OrderPad.FieldId.Notes: return true;
            case OrderPad.FieldId.OrderType: return this._orderTypeId === undefined;
            case OrderPad.FieldId.TriggerType: return this._triggerTypeId === undefined;
            case OrderPad.FieldId.TriggerValue: return this._triggerValue === undefined;
            // case OrderPad.FieldId.TriggerUnit: return true;
            case OrderPad.FieldId.TriggerField: return this._triggerFieldId === undefined;
            case OrderPad.FieldId.TriggerMovement: return this._triggerMovementId === undefined;
            // case OrderPad.FieldId.Previewed: return true;
            case OrderPad.FieldId.TotalQuantity: return this._totalQuantity === undefined;
            // case OrderPad.FieldId.OrigRequestId: return true;
            // case OrderPad.FieldId.OrderGivenBy: return true;
            // case OrderPad.FieldId.OrderGiversDataItemReady: return true;
            // case OrderPad.FieldId.OrderTakenBy: return true;
            case OrderPad.FieldId.LimitValue: return this._limitValue === undefined;
            case OrderPad.FieldId.Side: return this._sideId === undefined;
            // case OrderPad.FieldId.RoaNoAdvice: return true;
            // case OrderPad.FieldId.RoaNotes: return true;
            // case OrderPad.FieldId.SoaRequired: return true;
            // case OrderPad.FieldId.RoaMethod: return true;
            // case OrderPad.FieldId.RoaJustification: return true;
            // case OrderPad.FieldId.RoaDeclarations: return true;
            // case OrderPad.FieldId.RoaDeclarationDefinitionsDataItemReady: return true;
            // case OrderPad.FieldId.Tax: return true;
            case OrderPad.FieldId.TimeInForce: return this._timeInForceId === undefined;
            // case OrderPad.FieldId.CurrentOmsOrderId: return true;
            // case OrderPad.FieldId.WorkOmsOrderId: return true;
            // case OrderPad.FieldId.LoadedLeavesQuantity: return true;
            // case OrderPad.FieldId.AccountTradePermissions: return true;
            case OrderPad.FieldId.ExistingOrder: return this._existingOrderId === undefined;
            case OrderPad.FieldId.DestinationAccount: return this._destinationAccountId === undefined;
            default: throw new UnreachableCaseError('OPIFE73309', fieldId);
        }
    }

    isFieldValid(fieldId: OrderPad.FieldId) {
        return this._fields[fieldId].isValid();
    }

    isFieldOk(fieldId: OrderPad.FieldId) {
        return this._fields[fieldId].isOk();
    }

    isFieldModifiedAndOk(fieldId: OrderPad.FieldId) {
        return this._fields[fieldId].isModifiedAndOk();
    }

    isFieldModified(fieldId: OrderPad.FieldId) {
        return this._fields[fieldId].modified;
    }

    isFieldDisabled(fieldId: OrderPad.FieldId) {
        return this._fields[fieldId].isDisabled();
    }

    isNew() {
        return this._requestTypeId === OrderRequestTypeId.Place;
    }

    isAmend() {
        return this._requestTypeId === OrderRequestTypeId.Amend;
    }

    isCancel() {
        return this._requestTypeId === OrderRequestTypeId.Cancel;
    }

    getAccountIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.Account)) {
            return this._accountId;
        } else {
            return undefined;
        }
    }

    getSideIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.Side)) {
            return this._sideId;
        } else {
            return undefined;
        }
    }

    getRoutedIvemIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.Symbol)) {
            return this._routedIvemId;
        } else {
            return undefined;
        }
    }

    getSymbolDetailIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.Symbol)) {
            return this._bestLitSymbolDetail;
        } else {
            return undefined;
        }
    }

    getExpiryDateIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.ExpiryDate)) {
            return this._expiryDate;
        } else {
            return undefined;
        }
    }

    getOrderTypeIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.OrderType)) {
            return this._orderTypeId;
        } else {
            return undefined;
        }
    }

    getTriggerTypeIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.TriggerType)) {
            return this._triggerTypeId;
        } else {
            return undefined;
        }
    }

    getTriggerValueIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.TriggerValue)) {
            return this._triggerValue;
        } else {
            return undefined;
        }
    }

    getTriggerFieldIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.TriggerField)) {
            return this._triggerFieldId;
        } else {
            return undefined;
        }
    }

    getTriggerMovementIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.TriggerMovement)) {
            return this._triggerMovementId;
        } else {
            return undefined;
        }
    }

    getTotalQuantityIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.TotalQuantity)) {
            return this._totalQuantity;
        } else {
            return undefined;
        }
    }

    getLimitValueIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.LimitValue)) {
            return this._limitValue;
        } else {
            return undefined;
        }
    }

    // getLimitUnitIdIfOk() {
    //     if (this.isFieldOk(OrderPad.FieldId.LimitUnit)) {
    //         return this._limitUnitId;
    //     } else {
    //         return undefined;
    //     }
    // }

    getTimeInForceIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.TimeInForce)) {
            return this._timeInForceId;
        } else {
            return undefined;
        }
    }

    getExistingOrderIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.ExistingOrder)) {
            return this._existingOrderId;
        } else {
            return undefined;
        }
    }

    getDestinationAccountIdIfOk() {
        if (this.isFieldOk(OrderPad.FieldId.DestinationAccount)) {
            return this._destinationAccountId;
        } else {
            return undefined;
        }
    }

    loadFromJson(orderPadJson: Json) {
        const element = new JsonElement(orderPadJson);
        if (this._readonly) {
            throw new AssertInternalError('OPLFJ4488569');
        } else {
            this.beginChanges();
            try {
                const requestTypeIdJsonValue = element.tryGetString(OrderPad.JsonName.RequestTypeId);
                if (requestTypeIdJsonValue !== undefined) {
                    const requestTypeId = OrderRequestType.tryJsonValueToId(requestTypeIdJsonValue);
                    if (requestTypeId !== undefined) {
                        this._requestTypeId = requestTypeId;
                    }
                }

                const orderIdJsonValue = element.tryGetString(OrderPad.JsonName.OrderId);
                if (orderIdJsonValue !== undefined) {
                    this._existingOrderId = orderIdJsonValue;
                }

                const accountId = element.tryGetString(OrderPad.JsonName.AccountId);
                this.internalSetAccountId(accountId);

                const loadedExpiryDateJsonValue = element.tryGetDate(OrderPad.JsonName.LoadedExpiryDate);
                if (loadedExpiryDateJsonValue !== undefined) {
                    this._loadedExpiryDate = loadedExpiryDateJsonValue;
                }

                const expiryDate = element.tryGetDate(OrderPad.JsonName.ExpiryDate);
                this.internalSetExpiryDate(expiryDate);

                const loadedRoutedIvemIdJson = element.tryGetJsonObject(OrderPad.JsonName.LoadedRoutedIvemId);
                if (loadedRoutedIvemIdJson !== undefined) {
                    const loadedRoutedIvemId = RoutedIvemId.tryCreateFromJson(loadedRoutedIvemIdJson as RoutedIvemId.PersistJson);
                    if (loadedRoutedIvemId !== undefined) {
                        this._loadedRoutedIvemId = loadedRoutedIvemId;
                    }
                }

                let routedIvemId: RoutedIvemId | undefined;
                const routedIvemIdJson = element.tryGetJsonObject(OrderPad.JsonName.RoutedIvemId);
                if (routedIvemIdJson === undefined) {
                    routedIvemId = undefined;
                } else {
                    routedIvemId = RoutedIvemId.tryCreateFromJson(routedIvemIdJson as RoutedIvemId.PersistJson);
                }
                this.internalSetRoutedIvemId(routedIvemId);

                const loadedOrderTypeIdJsonValue = element.tryGetString(OrderPad.JsonName.LoadedOrderTypeId);
                if (loadedOrderTypeIdJsonValue !== undefined) {
                    const loadedOrderTypeId = OrderType.tryJsonValueToId(loadedOrderTypeIdJsonValue);
                    if (loadedOrderTypeId !== undefined) {
                        this._loadedOrderTypeId = loadedOrderTypeId;
                    }
                }

                let orderTypeId: OrderTypeId | undefined;
                const orderTypeIdJsonValue = element.tryGetString(OrderPad.JsonName.OrderTypeId);
                if (orderTypeIdJsonValue === undefined) {
                    orderTypeId = undefined;
                } else {
                    orderTypeId = OrderType.tryJsonValueToId(orderTypeIdJsonValue);
                }
                this.internalSetOrderTypeId(orderTypeId);

                const loadedTriggerTypeIdJsonValue = element.tryGetString(OrderPad.JsonName.LoadedTriggerTypeId);
                if (loadedTriggerTypeIdJsonValue !== undefined) {
                    const loadedTriggerTypeId = OrderTriggerType.tryJsonValueToId(loadedTriggerTypeIdJsonValue);
                    if (loadedTriggerTypeId !== undefined) {
                        this._loadedTriggerTypeId = loadedTriggerTypeId;
                    }
                }

                let triggerTypeId: OrderTriggerTypeId | undefined;
                const triggerTypeIdJsonValue = element.tryGetString(OrderPad.JsonName.TriggerTypeId);
                if (triggerTypeIdJsonValue === undefined) {
                    triggerTypeId = undefined;
                } else {
                    triggerTypeId = OrderTriggerType.tryJsonValueToId(triggerTypeIdJsonValue);
                }
                this.internalSetTriggerTypeId(triggerTypeId);

                const loadedTotalQuantity = element.tryGetInteger(OrderPad.JsonName.LoadedTotalQuantity);
                if (loadedTotalQuantity !== undefined) {
                    this._loadedTotalQuantity = loadedTotalQuantity;
                }

                const totalQuantity = element.tryGetInteger(OrderPad.JsonName.TotalQuantity);
                this.internalSetTotalQuantity(totalQuantity);

                const loadedLimitValue = element.tryGetDecimal(OrderPad.JsonName.LoadedLimitValue);
                if (loadedLimitValue !== undefined) {
                    this._loadedLimitValue = loadedLimitValue;
                }

                const limitValue = element.tryGetDecimal(OrderPad.JsonName.LimitValue);
                this.internalSetLimitValue(limitValue);

                const loadedSideIdJsonValue = element.tryGetString(OrderPad.JsonName.LoadedSideId);
                if (loadedSideIdJsonValue !== undefined) {
                    const loadedSideId = Side.tryJsonValueToId(loadedSideIdJsonValue);
                    if (loadedSideId !== undefined) {
                        this._loadedSideId = loadedSideId;
                    }
                }

                let sideId: SideId | undefined;
                const sideIdJsonValue = element.tryGetString(OrderPad.JsonName.SideId);
                if (sideIdJsonValue === undefined) {
                    sideId = undefined;
                } else {
                    sideId = Side.tryJsonValueToId(sideIdJsonValue);
                }
                this.internalSetSideId(sideId);

                const loadedTimeInForceIdJsonValue = element.tryGetString(OrderPad.JsonName.LoadedTimeInForceId);
                if (loadedTimeInForceIdJsonValue !== undefined) {
                    const loadedTimeInForceId = TimeInForce.tryJsonValueToId(loadedTimeInForceIdJsonValue);
                    if (loadedTimeInForceId !== undefined) {
                        this._loadedTimeInForceId = loadedTimeInForceId;
                    }
                }

                let userTimeInForceId: TimeInForceId | undefined;
                const userTimeInForceIdJsonValue = element.tryGetString(OrderPad.JsonName.UserTimeInForceId);
                if (userTimeInForceIdJsonValue === undefined) {
                    userTimeInForceId = undefined;
                } else {
                    userTimeInForceId = TimeInForce.tryJsonValueToId(userTimeInForceIdJsonValue);
                }
                this.internalSetTimeInForceId(userTimeInForceId);
            } finally {
                this.endChanges();
            }
        }
    }

    toJson() {
        const element = new JsonElement();
        element.setString(OrderPad.JsonName.RequestTypeId, OrderRequestType.idToJsonValue(this._requestTypeId));
        element.setString(OrderPad.JsonName.OrderId, this._existingOrderId);
        element.setString(OrderPad.JsonName.AccountId, this._accountId);
        element.setDate(OrderPad.JsonName.LoadedExpiryDate, this._loadedExpiryDate);
        element.setDate(OrderPad.JsonName.ExpiryDate, this._expiryDate);
        if (this._loadedRoutedIvemId !== undefined) {
            element.setJson(OrderPad.JsonName.LoadedRoutedIvemId, this._loadedRoutedIvemId.toJson());
        }
        if (this._routedIvemId !== undefined) {
            element.setJson(OrderPad.JsonName.RoutedIvemId, this._routedIvemId.toJson());
        }
        if (this._loadedOrderTypeId !== undefined) {
            element.setString(OrderPad.JsonName.LoadedOrderTypeId, OrderType.idToJsonValue(this._loadedOrderTypeId));
        }
        if (this._orderTypeId !== undefined) {
            element.setString(OrderPad.JsonName.OrderTypeId, OrderType.idToJsonValue(this._orderTypeId));
        }
        if (this._loadedTriggerTypeId !== undefined) {
            element.setString(OrderPad.JsonName.LoadedTriggerTypeId, OrderTriggerType.idToJsonValue(this._loadedTriggerTypeId));
        }
        if (this._triggerTypeId !== undefined) {
            element.setString(OrderPad.JsonName.TriggerTypeId, OrderTriggerType.idToJsonValue(this._triggerTypeId));
        }
        element.setInteger(OrderPad.JsonName.LoadedTotalQuantity, this._loadedTotalQuantity);
        element.setInteger(OrderPad.JsonName.TotalQuantity, this._totalQuantity);
        element.setDecimal(OrderPad.JsonName.LoadedLimitValue, this._loadedLimitValue);
        element.setDecimal(OrderPad.JsonName.LimitValue, this._limitValue);
        if (this._loadedSideId !== undefined) {
            element.setString(OrderPad.JsonName.LoadedSideId, Side.idToJsonValue(this._loadedSideId));
        }
        if (this._sideId !== undefined) {
            element.setString(OrderPad.JsonName.SideId, Side.idToJsonValue(this._sideId));
        }
        if (this._loadedTimeInForceId !== undefined) {
            element.setString(OrderPad.JsonName.LoadedTimeInForceId, TimeInForce.idToJsonValue(this._loadedTimeInForceId));
        }
        if (this._userTimeInForceId !== undefined) {
            element.setString(OrderPad.JsonName.UserTimeInForceId, TimeInForce.idToJsonValue(this._userTimeInForceId));
        }

        return element.json;
    }

    applySettingsDefaults(coreSettings: CoreSettings) {
        this.beginChanges();
        try {
            if (coreSettings.orderPad_DefaultOrderTypeId !== undefined) {
                this.orderTypeId = coreSettings.orderPad_DefaultOrderTypeId;
            }
            if (coreSettings.orderPad_DefaultTimeInForceId !== undefined) {
                this.timeInForceId = coreSettings.orderPad_DefaultTimeInForceId;
            }
        } finally {
            this.endChanges();
        }
    }

    getInvalidFieldIds(): readonly OrderPad.FieldId[] {
        const fieldIds = new Array<OrderPad.FieldId>(OrderPad.Field.idCount);

        let idx = 0;
        for (let id = 0; id < OrderPad.Field.idCount; id++) {
            const field = this._fields[id];
            if (!field.isValid()) {
                fieldIds[idx++] = id;
            }
        }
        fieldIds.length = idx;

        return fieldIds;
    }

    loadPlace(accountId?: BrokerageAccountId) {
        if (this._readonly) {
            throw new AssertInternalError('OPLP9983345');
        } else {
            this.beginChanges();
            try {
                this._requestTypeId = OrderRequestTypeId.Place;

                this.internalSetTriggerTypeId(OrderTriggerTypeId.Immediate);

                if (accountId !== undefined) {
                    this.internalSetAccountId(accountId);
                } else {
                    // see if only one account exists - if so, set that
                    const dataItemOrPromise = this._brokerageAccountsDataItemIncubator.getInitiatedDataItemSubscriptionOrPromise();
                    if (dataItemOrPromise !== undefined) {
                        if (this._brokerageAccountsDataItemIncubator.isDataItem(dataItemOrPromise)) {
                            if (dataItemOrPromise.count === 1) {
                                this.internalSetAccountId(dataItemOrPromise.records[0].id);
                            }
                        } else {
                            dataItemOrPromise.then(
                                (dataItem) => {
                                    if (dataItem !== undefined && dataItem.count === 1) {
                                        if (this._accountId === undefined) {
                                            this.internalSetAccountId(dataItem.records[0].id);
                                        }
                                    }
                                }
                            );
                        }
                    }
                }
            } finally {
                this.endChanges();
            }
        }
    }

    loadBuy(accountId?: BrokerageAccountId) {
        this.beginChanges();
        try {
            this.loadPlace(accountId);
            this.internalSetSideId(SideId.Buy);
        } finally {
            this.endChanges();
        }
    }

    loadSell(accountId?: BrokerageAccountId) {
        this.beginChanges();
        try {
            this.loadPlace(accountId);
            this.internalSetSideId(SideId.Sell);
        } finally {
            this.endChanges();
        }
    }

    loadSellShort(accountId?: BrokerageAccountId) {
        this.beginChanges();
        try {
            this.loadPlace(accountId);
            this.internalSetSideId(SideId.SellShort);
        } finally {
            this.endChanges();
        }
    }

    loadPlaceFromOrder(order: Order, sideId: SideId) {
        if (this._readonly) {
            throw new AssertInternalError('OPLPFO454823');
        } else {
            this.beginChanges();
            try {
                this._requestTypeId = OrderRequestTypeId.Place;
                this._existingOrderId = order.id;

                this.internalSetTriggerTypeId(OrderTriggerTypeId.Immediate);
                this.internalSetAccountId(order.accountId);

                const routedIvemId = this.createRoutedIvemIdFromOrder(order);
                this.internalSetRoutedIvemId(routedIvemId);

                if (sideId === SideId.Sell) {
                    this.internalSetTotalQuantity(order.quantity);
                }

                this.internalSetSideId(sideId);
            } finally {
                this.endChanges();
            }
        }
    }

    loadBuyFromOrder(order: Order) {
        this.loadPlaceFromOrder(order, SideId.Buy);
    }

    loadSellFromOrder(order: Order) {
        this.loadPlaceFromOrder(order, SideId.Sell);
    }

    loadAmendFromOrder(order: Order) {
        if (this._readonly) {
            throw new AssertInternalError('OPLAMO7455543');
        } else {
            this.beginChanges();
            try {
                this._requestTypeId = OrderRequestTypeId.Amend;

                this.loadAmendCancelMoveCommonFromOrder(order);

                if (order.sideId === BidAskSideId.Ask) {
                    this.internalSetTotalQuantity(order.quantity);
                }
            } finally {
                this.endChanges();
            }
        }
    }

    loadCancelFromOrder(order: Order) {
        if (this._readonly) {
            throw new AssertInternalError('OPLCFO232399845');
        } else {
            this.beginChanges();
            try {
                this._requestTypeId = OrderRequestTypeId.Cancel;
                this.loadAmendCancelMoveCommonFromOrder(order);
            } finally {
                this.endChanges();
            }
        }
    }

    loadMoveFromOrder(order: Order) {
        if (this._readonly) {
            throw new AssertInternalError('OPLMFO11109388');
        } else {
            this.beginChanges();
            try {
                this._requestTypeId = OrderRequestTypeId.Move;
                this.loadAmendCancelMoveCommonFromOrder(order);
            } finally {
                this.endChanges();
            }
        }
    }

    loadFromHolding(holding: Holding, sideId?: SideId) {
        if (this._readonly) {
            throw new AssertInternalError('OPLFH342834');
        } else {
            this.beginChanges();
            try {
                this._requestTypeId = OrderRequestTypeId.Place;

                this.internalSetTriggerTypeId(OrderTriggerTypeId.Immediate);
                this.internalSetAccountId(holding.accountId);

                const routedIvemId = this.createRoutedIvemIdFromHolding(holding);
                this.internalSetRoutedIvemId(routedIvemId);

                if (sideId === SideId.Sell) {
                    this.internalSetTotalQuantity(holding.totalAvailableQuantity);
                }

                this.internalSetSideId(sideId);
            } finally {
                this.endChanges();
            }
        }
    }

    loadBuyFromHolding(holding: Holding) {
        this.loadFromHolding(holding, SideId.Buy);
    }

    loadSellFromHolding(holding: Holding) {
        this.loadFromHolding(holding, SideId.Sell);
    }

    resetModified() {
        if (this._readonly) {
            throw new AssertInternalError('OPRM2998424');
        } else {
            this.beginChanges();
            try {
                this.internalResetModified();
            } finally {
                this.endChanges();
            }
        }
    }

    createOrderRequestDataDefinition(): OrderRequestDataDefinition {
        switch (this._requestTypeId) {
            case OrderRequestTypeId.Place: return this.createPlaceOrderRequestDataDefinition();
            case OrderRequestTypeId.Amend: return this.createAmendOrderRequestDataDefinition();
            case OrderRequestTypeId.Cancel: return this.createCancelOrderRequestDataDefinition();
            case OrderRequestTypeId.Move: return this.createMoveOrderRequestDataDefinition();
            default: throw new UnreachableCaseError('OPCORDD588374', this._requestTypeId);
        }
    }

    createOrderTrigger(): OrderTrigger {
        const triggerTypeId = this._triggerTypeId;
        if (triggerTypeId === undefined) {
            throw new AssertInternalError('OPCOTU6988847');
        } else {
            switch (triggerTypeId) {
                case OrderTriggerTypeId.Immediate:
                    return new ImmediateOrderTrigger();
                case OrderTriggerTypeId.Price: {
                    const triggerValue = this._triggerValue;
                    if (triggerValue === undefined) {
                        throw new AssertInternalError('OPCOTV6988847');
                    } else {
                        const triggerFieldId = this._triggerFieldId;
                        if (triggerFieldId === undefined) {
                            throw new AssertInternalError('OPCOTF6988847');
                        } else {
                            const triggerMovementId = this._triggerMovementId;
                            if (triggerMovementId === undefined) {
                                throw new AssertInternalError('OPCOTM6988847');
                            } else {
                                return new PriceOrderTrigger(triggerValue, triggerFieldId, triggerMovementId);
                            }
                        }
                    }
                }
                case OrderTriggerTypeId.TrailingPrice:
                    throw new NotImplementedError('OPCOT44320002993');
                case OrderTriggerTypeId.PercentageTrailingPrice:
                    throw new NotImplementedError('OPCOTP44320002993');
                case OrderTriggerTypeId.Overnight:
                    throw new NotImplementedError('OPCOTO44320002993');
                default:
                    throw new UnreachableCaseError('OPCOTU44320002993', triggerTypeId);
            }
        }
    }

    subscribeFieldsChangedEvent(handler: OrderPad.FieldsChangedEventHandler) {
        return this._fieldsChangedMultiEvent.subscribe(handler);
    }

    unsubscribeFieldsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldsChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleAccountTradingFeedStatusChangeEvent() {
        this.beginChanges();
        try {
            if (this._account === undefined) {
                throw new AssertInternalError('OPHACE8787554');
            } else {
                this.processAccountFeedStatusChange(this._account.tradingFeed.statusId);
                this.flagFieldChanged(OrderPad.FieldId.Account);
            }
        } finally {
            this.endChanges();
        }
    }

    private handleDestinationAccountTradingFeedStatusChangeEvent() {
        this.beginChanges();
        try {
            if (this._destinationAccount === undefined) {
                throw new AssertInternalError('OPHDACE38666996');
            } else {
                this.processDestinationAccountFeedStatusChange(this._destinationAccount.tradingFeed.statusId);
                this.flagFieldChanged(OrderPad.FieldId.DestinationAccount);
            }
        } finally {
            this.endChanges();
        }
    }

    private notifyFieldsChanged(changedFieldIds: OrderPad.FieldId[]) {
        const handlers = this._fieldsChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(changedFieldIds);
        }
    }

    private flagFieldChanged(fieldId: OrderPad.FieldId) {
        if (!this._changedFieldIds.includes(fieldId)) {
            this._changedFieldIds.push(fieldId);
            this._updateStatusRequired = true;
        }
    }

    private checkClearAccount() {
        if (this._account !== undefined) {
            this._account.unsubscribeChangeEvent(this._accountChangeSubscriptionId);
            this._accountChangeSubscriptionId = undefined;
            this._account = undefined;
        }
    }

    private setAccount(account: Account | undefined) {
        if (account !== this._account) {
            this.beginChanges();
            try {
                this.checkClearAccount();
                this._account = account;
                this.flagFieldChanged(OrderPad.FieldId.Account);
                if (this._account !== undefined) {
                    this._accountChangeSubscriptionId = this._account.tradingFeed.subscribeStatusChangedEvent(
                        () => this.handleAccountTradingFeedStatusChangeEvent()
                    );
                    this.processAccountFeedStatusChange(this._account.tradingFeed.statusId);
                }
            } finally {
                this.endChanges();
            }
        }
    }

    private processAccountFeedStatusChange(feedStatusId: FeedStatusId | undefined) {
        if (feedStatusId === FeedStatusId.Active) {
            this.processAccountIdFieldBecameOk();
        }
    }

    private processAccountIdFieldBecameOk() {
        // AccountDefaultBrokerageCode
        // BrokerageCode
        // OrderGivers
        // OrderTakenBy
        // AccountTradePermissions
    }

    private checkClearDestinationAccount() {
        if (this._destinationAccount !== undefined) {
            this._destinationAccount.unsubscribeChangeEvent(this._destinationAccountChangeSubscriptionId);
            this._destinationAccountChangeSubscriptionId = undefined;
            this._destinationAccount = undefined;
        }
    }

    private setDestinationAccount(account: Account | undefined) {
        if (account !== this._destinationAccount) {
            this.beginChanges();
            try {
                this.checkClearDestinationAccount();
                this._destinationAccount = account;
                this.flagFieldChanged(OrderPad.FieldId.DestinationAccount);
                if (this._destinationAccount !== undefined) {
                    this._destinationAccountChangeSubscriptionId = this._destinationAccount.tradingFeed.subscribeStatusChangedEvent(
                        () => this.handleDestinationAccountTradingFeedStatusChangeEvent()
                    );
                    this.processDestinationAccountFeedStatusChange(this._destinationAccount.tradingFeed.statusId);
                }
            } finally {
                this.endChanges();
            }
        }
    }

    private processDestinationAccountFeedStatusChange(feedStatusId: FeedStatusId | undefined) {
        if (feedStatusId === FeedStatusId.Active) {
            this.processDestinationAccountIdFieldBecameOk();
        }
    }

    private processDestinationAccountIdFieldBecameOk() {
        // process dependencies in the future
    }

    private calculateAllowedRoutes(details: readonly SymbolDetailCache.LitIvemIdDetail[]): readonly OrderRoute[] {
        if (details.length === 0) {
            return [];
        } else {
            let marketIds = details[0].tradingMarketIds;
            for (let i = 1; i < details.length; i++) {
                const detail = details[i];
                marketIds = concatenateArrayUniquely(marketIds, detail.tradingMarketIds);
            }

            const result = new Array<OrderRoute>(marketIds.length);
            let count = 0;
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const route = new MarketOrderRoute(marketId);
                const allowedOrderTypeIds = route.getAllowedOrderTypeIds();
                if (allowedOrderTypeIds.length > 0) {
                    result[count++] = route;
                }
            }

            result.length = count;

            return result;
        }
    }

    private findBestSymbolDetail(routedIvemId: RoutedIvemId, details: readonly SymbolDetailCache.LitIvemIdDetail[]) {
        const route = routedIvemId.route;
        if (!OrderRoute.isMarketRoute(route)) {
            throw new NotImplementedError('OPFBSD2855998');
        } else {
            const marketId = route.marketId;
            for (const detail of details) {
                if (detail.litIvemId.litId === marketId) {
                    return detail;
                }
            }
            Logger.logWarning(`OrderPad.findBestSymbolDetail did not find a match: ${routedIvemId.name}`);
            return details[0];
        }
    }

    private checkAccountDefaultBrokerageCode() {

    }
    private checkBrokerageCodeList() {

    }
    //    procedure ClearBrokerageCodeList;
    private loadBrokerageCodeList() {

    }
    private checkAutoSetAccountDefaultOrderGivenBy() {

    }
    private checkLimitAndTriggerUnit() {

    }

    private emptyField(fieldId: OrderPad.FieldId) {
        switch (fieldId) {
            case OrderPad.FieldId.Account:
                this.internalSetAccountId(undefined);
                break;
            // case OrderPad.FieldId.BrokerageCode: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.BrokerageScheduleDataItemReady:
            // throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.AccountDefaultBrokerageCode: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.BrokerageCodeListReady: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.LinkId: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.Brokerage: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            case OrderPad.FieldId.ExpiryDate:
                this.internalSetExpiryDate(undefined);
                break;
            // case OrderPad.FieldId.InstructionTime: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            case OrderPad.FieldId.Symbol:
                this.internalSetRoutedIvemId(undefined);
                break;
            // case OrderPad.FieldId.SymbolPriceStepSegmentsDataItemReady:
            // case OrderPad.FieldId.Srn: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.LocateReqd: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.Algo: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.VisibleQuantity: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.MinimumQuantity: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.Notes: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            case OrderPad.FieldId.OrderType:
                this.internalSetOrderTypeId(undefined);
                break;
            case OrderPad.FieldId.TriggerType:
                this.internalSetTriggerTypeId(undefined);
                break;
            case OrderPad.FieldId.TriggerValue:
                this.internalSetTriggerValue(undefined);
                break;
            // case OrderPad.FieldId.TriggerUnit: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            case OrderPad.FieldId.TriggerField:
                this.internalSetTriggerFieldId(undefined);
                break;
            case OrderPad.FieldId.TriggerMovement:
                this.internalSetTriggerMovementId(undefined);
                break;
                // case OrderPad.FieldId.Previewed: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            case OrderPad.FieldId.TotalQuantity:
                this.internalSetTotalQuantity(undefined);
                break;
            // case OrderPad.FieldId.OrigRequestId: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.OrderGivenBy: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.OrderGiversDataItemReady: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.OrderTakenBy: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            case OrderPad.FieldId.LimitValue:
                this.internalSetLimitValue(undefined);
                break;
            case OrderPad.FieldId.Side:
                this.internalSetSideId(undefined);
                break;
            // case OrderPad.FieldId.RoaNoAdvice: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.RoaNotes: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.SoaRequired: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.RoaMethod: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.RoaJustification: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.RoaDeclarations: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.RoaDeclarationDefinitionsDataItemReady:
            // throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.Tax: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            case OrderPad.FieldId.TimeInForce:
                this.internalSetTimeInForceId(undefined);
                break;
            // case OrderPad.FieldId.CurrentOmsOrderId: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.WorkOmsOrderId: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.LoadedLeavesQuantity: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            // case OrderPad.FieldId.AccountTradePermissions: throw new NotImplementedError(`OrderPad.emptyField: ${fieldId}`); break;
            case OrderPad.FieldId.ExistingOrder:
                this.internalSetExistingOrderId(undefined);
                break;
            case OrderPad.FieldId.DestinationAccount:
                this.internalSetDestinationAccountId(undefined);
                break;
            default: throw new UnreachableCaseError('OPEF199853', fieldId);
        }
    }

    private internalClearField(fieldId: OrderPad.FieldId) {
        const field = this._fields[fieldId];
        const empty = this.isFieldEmpty(fieldId);
        if (!empty || !field.isDisabled()) {
            this.beginChanges();
            try {
                if (!empty) {
                    this.emptyField(fieldId);
                }
                field.modified = false;
                field.statusId = OrderPad.Field.StatusId.Disabled;
                field.statusReasonId = OrderPad.Field.StatusReasonId.Unknown;
            } finally {
                this.endChanges();
            }
        }

    }

    private setFieldStatus(fieldId: OrderPad.FieldId, statusId: OrderPad.Field.StatusId, reasonId: OrderPad.Field.StatusReasonId) {
        const field = this._fields[fieldId];
        if (field.statusId !== statusId || field.statusReasonId !== reasonId) {
            if (!this._statusUpdating) {
                // check to see that this is only called during update status
                throw new AssertInternalError('OPSFS668547', OrderPad.Field.idToName(fieldId));
            } else {
                field.statusId = statusId;
                field.statusReasonId = reasonId;
                this.flagFieldChanged(fieldId);
            }
        }
    }

    private setDisabledFieldStatus(fieldId: OrderPad.FieldId, reasonId: OrderPad.Field.StatusReasonId) {
        this.setFieldStatus(fieldId, OrderPad.Field.StatusId.Disabled, reasonId);
    }

    private setErrorFieldStatus(fieldId: OrderPad.FieldId, reasonId: OrderPad.Field.StatusReasonId) {
        this.setFieldStatus(fieldId, OrderPad.Field.StatusId.Error, reasonId);
    }

    private setPrerequisitieFieldNotValidFieldStatus(fieldId: OrderPad.FieldId, reasonId: OrderPad.Field.StatusReasonId) {
        this.setFieldStatus(fieldId, OrderPad.Field.StatusId.PrerequisiteFieldNotValid, reasonId);
    }

    private setWaitingFieldStatus(fieldId: OrderPad.FieldId, reasonId: OrderPad.Field.StatusReasonId) {
        this.setFieldStatus(fieldId, OrderPad.Field.StatusId.Waiting, reasonId);
    }

    private setReadOnlyFieldStatus(fieldId: OrderPad.FieldId, reasonId: OrderPad.Field.StatusReasonId) {
        this.setFieldStatus(fieldId, OrderPad.Field.StatusId.ReadOnlyOk, reasonId);
    }

    private setValueOkFieldStatus(fieldId: OrderPad.FieldId,
        reasonId: OrderPad.Field.StatusReasonId = OrderPad.Field.StatusReasonId.Unknown
    ) {
        this.setFieldStatus(fieldId, OrderPad.Field.StatusId.ValueOk, reasonId);
    }

    private updateStatus() {
        if (!this._snapshot) {
            this._statusUpdating = true;
            try {
                this.updateFieldStatus_AccountId(); // depends on nothing
                // this.UpdateFieldStatus_Algo(); // used by IsWork, which is used by IsLinked
                // this.UpdateFieldStatus_LinkId(); // used by IsLinked
                this.updateFieldStatus_Symbol(); // depends on SymbolSupported
                this.updateFieldStatus_OrderType(); // depends on DestIvemId, used by IsLimitOrderType

                // this.UpdateFieldStatus_BrokerageScheduleDataItemReady();
                // this.UpdateFieldStatus_AccountDefaultBrokerageCode(); // depends on AccountId
                // this.UpdateFieldStatus_BrokerageCodeListReady();
                // this.UpdateFieldStatus_BrokerageCode(); // depends on AccountDefaultBrokerageCode & BrokerageScheduleDataItemReady
                // used by IsManualBrokerageCode
                // this.UpdateFieldStatus_RoaNoAdvice();

                // this.UpdateFieldStatus_OrderGiversDataItemReady(); // depends on AccountId
                // this.UpdateFieldStatus_Brokerage(); // depends on BrokerScheduleCode
                // this.UpdateFieldStatus_InstructionTime();
                this.updateFieldStatus_TimeInForce(); // depends on DestTypeId, OrderType
                this.updateFieldStatus_ExpiryDate(); // depend on TimeInForce
                this.UpdateFieldStatus_TotalQuantity();
                // this.UpdateFieldStatus_Srn();
                // this.UpdateFieldStatus_LocateReqd();
                // this.UpdateFieldStatus_Previewed();
                // this.UpdateFieldStatus_OrderGivenBy(); // depends on AccountId
                // this.UpdateFieldStatus_OrderTakenBy(); // depends on AccountId
                // this.UpdateFieldStatus_SymbolPriceStepSegmentsDataItemReady(); // depends on Symbol
                this.updateFieldStatus_TriggerType(); // depends on RequestType, OrderType
                this.updateFieldStatus_TriggerValueFieldMovement(); // depends depends on TriggerType
                // this.updateFieldStatus_TriggerUnit();
                this.updateFieldStatus_LimitValue(); // depends on OrderType, TriggerTypeId, IvemId, SymbolPriceStepSegmentsDataItemReady
                // this.UpdateFieldStatus_LimitUnit();
                // this.UpdateFieldStatus_Notes(); // depends on Algo
                /*this.UpdateFieldStatus_VisibleQuantity(); // depends on Algo
                this.UpdateFieldStatus_MinimumQuantity(); // depends on Algo*/
                this.updateFieldStatus_Side(); // depends on OrderType
                // this.UpdateFieldStatus_Tax();

                /*this.UpdateFieldStatus_AccountTradePermissions(); // depends on AccountId, Side.*/

                // this.UpdateFieldStatus_SoaRequired(); // depends on RoaNoAdvice
                // this.UpdateFieldStatus_RoaMethod(); // depends on RoaNoAdvice
                // this.UpdateFieldStatus_RoaJustification(); // depends on RoaNoAdvice
                // this.UpdateFieldStatus_RoaNotes(); // depends on RoaNoAdvice
                // this.UpdateFieldStatus_RoaDeclarationDefinitionsDataItemReady();
                // this.UpdateFieldStatus_RoaDeclarations(); // depends on RoaNoAdvice and RoaDeclarationDefinitionsDataItemReady

                /*this.UpdateFieldStatus_OrderId();

                this.UpdateFieldStatus_LoadedLeavesQuantity();

                this.UpdateFieldStatus_OmsServiceOnline();*/

                this.updateFieldStatus_Order(); // depends on nothing
                this.updateFieldStatus_DestinationAccount(); // depends on Account and Order

                this._updateStatusRequired = false;

            } finally {
                this._statusUpdating = false;
            }
        }
    }

    private updateFieldStatus_AccountId() {
        const fieldId = OrderPad.FieldId.Account;
        if (this._accountId === undefined) {
            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
        } else {
            if (this._brokerageAccountIncubator.incubating) {
                this.setWaitingFieldStatus(fieldId, OrderPad.Field.StatusReasonId.RetrievingAccount);
            } else {
                if (this._account === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountIdNotValid);
                } else {
                    const feedStatusId = this._account.tradingFeed.statusId;
                    if (feedStatusId === undefined) {
                        this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountNoLongerAvailable);
                    } else {
                        switch (feedStatusId) {
                            case FeedStatusId.Initialising:
                                this.setWaitingFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Initialising);
                                break;
                            case FeedStatusId.Active:
                                switch (this._requestTypeId) {
                                    case OrderRequestTypeId.Place:
                                        this.setValueOkFieldStatus(fieldId);
                                        break;
                                    case OrderRequestTypeId.Amend:
                                        this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Amend);
                                        break;
                                    case OrderRequestTypeId.Cancel:
                                        this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                                        break;
                                    case OrderRequestTypeId.Move:
                                        this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                                        break;
                                    default:
                                        throw new UnreachableCaseError('OPUFSAI93667', this._requestTypeId);
                                }
                                break;
                            case FeedStatusId.Closed:
                                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Closed);
                                break;
                            case FeedStatusId.Inactive:
                                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Inactive);
                                break;
                            case FeedStatusId.Impaired:
                                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Impaired);
                                break;
                            case FeedStatusId.Expired:
                                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Expired);
                                break;
                            default:
                                throw new UnreachableCaseError('OPUFSAI75560', feedStatusId);
                        }
                    }
                }
            }
        }
    }

    private updateFieldStatus_ExpiryDate() {
        const fieldId = OrderPad.FieldId.ExpiryDate;
        switch (this._requestTypeId) {
            case OrderRequestTypeId.Amend:
                if (this._timeInForceId !== undefined && this._timeInForceId !== TimeInForceId.GoodTillDate) {
                    this.setDisabledFieldStatus(fieldId, OrderPad.Field.StatusReasonId.TimeInForceDoesNotRequireDate);
                } else {
                    this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Amend);
                }
                break;
            case OrderRequestTypeId.Cancel:
                if (this._timeInForceId !== undefined && this._timeInForceId !== TimeInForceId.GoodTillDate) {
                    this.setDisabledFieldStatus(fieldId, OrderPad.Field.StatusReasonId.TimeInForceDoesNotRequireDate);
                } else {
                    this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                }
                break;
            case OrderRequestTypeId.Move:
                if (this._timeInForceId !== undefined && this._timeInForceId !== TimeInForceId.GoodTillDate) {
                    this.setDisabledFieldStatus(fieldId, OrderPad.Field.StatusReasonId.TimeInForceDoesNotRequireDate);
                } else {
                    this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                }
                break;
            case OrderRequestTypeId.Place:
                if (this._timeInForceId === undefined) {
                    this.setPrerequisitieFieldNotValidFieldStatus(fieldId, OrderPad.Field.StatusReasonId.OrderTypeNotSpecified);
                } else {
                    if (this._timeInForceId === TimeInForceId.GoodTillDate) {
                        if (this._expiryDate === undefined) {
                            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                        } else {
                            const todayDate = new Date();
                            todayDate.setHours(0, 0, 0, 0);
                            if (this._expiryDate.getTime() < todayDate.getTime()) {
                                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.TodayOrFutureDateRequired);
                            } else {
                                this.setValueOkFieldStatus(fieldId);
                            }
                        }
                    } else {
                        this.setDisabledFieldStatus(fieldId, OrderPad.Field.StatusReasonId.TimeInForceDoesNotRequireDate);
                    }
                }
                break;
            default:
                throw new UnreachableCaseError('OPUFSEDD6668490', this._requestTypeId);
        }
    }

    private updateFieldStatus_Symbol() {
        const fieldId = OrderPad.FieldId.Symbol;
        if (this._routedIvemId === undefined) {
            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
        } else {
            if (this._ivemIdSymbolDetail === undefined) {
                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.RetrieveSymbolDetailError);
            } else {
                if (!this._ivemIdSymbolDetail.valid) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.RetrieveSymbolDetailError);
                } else {
                    if (!this._ivemIdSymbolDetail.exists) {
                        this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.IvemNotFound);
                    } else {
                        if (this._litSymbolDetails === undefined) {
                            this.setWaitingFieldStatus(fieldId, OrderPad.Field.StatusReasonId.RetrievingSymbolDetail);
                        } else {
                            if (this._litSymbolDetails === []) {
                                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.SymbolHasNoRoutes);
                            } else {
                                if (this._allowedRoutes === []) {
                                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.SymbolHasNoRoutes);
                                } else {
                                    if (this._bestLitSymbolDetail === undefined) {
                                        this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.RouteNotAvailableForSymbol);
                                    } else {
                                        switch (this._requestTypeId) {
                                            case OrderRequestTypeId.Amend:
                                                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Amend);
                                                break;
                                            case OrderRequestTypeId.Cancel:
                                                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                                                break;
                                            case OrderRequestTypeId.Move:
                                                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                                                break;
                                            case OrderRequestTypeId.Place:
                                                this.setValueOkFieldStatus(fieldId);
                                                break;
                                            default:
                                                throw new UnreachableCaseError('OPUFSDII48667', this._requestTypeId);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private updateFieldStatus_OrderType() {
        const fieldId = OrderPad.FieldId.OrderType;
        switch (this._requestTypeId) {
            case OrderRequestTypeId.Amend:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Amend);
                break;
            case OrderRequestTypeId.Cancel:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                break;
            case OrderRequestTypeId.Move:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                break;
            case OrderRequestTypeId.Place:
                if (this._orderTypeId === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                } else {
                    if (!this.isFieldOk(OrderPad.FieldId.Symbol)) {
                        this.setPrerequisitieFieldNotValidFieldStatus(fieldId,
                            OrderPad.Field.StatusReasonId.SymbolNotOk);
                    } else {
                        if (!this._allowedOrderTypeIds.includes(this._orderTypeId)) {
                            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.NotSupportedBySymbol);
                        } else {
                            this.setValueOkFieldStatus(fieldId);
                        }
                    }
                }
                break;
            default:
                throw new UnreachableCaseError('OPUFSOT75543', this._requestTypeId);
        }
    }

    private updateFieldStatus_Side() {
        const fieldId = OrderPad.FieldId.Side;
        switch (this._requestTypeId) {
            case OrderRequestTypeId.Amend:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Amend);
                break;
            case OrderRequestTypeId.Cancel:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                break;
            case OrderRequestTypeId.Move:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                break;
            case OrderRequestTypeId.Place:
                if (this._sideId === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                } else {
                    if (!this.isFieldOk(OrderPad.FieldId.Symbol)) {
                        this.setPrerequisitieFieldNotValidFieldStatus(fieldId,
                            OrderPad.Field.StatusReasonId.SymbolNotOk);
                    } else {
                        if (!this._allowedSideIds.includes(this._sideId)) {
                            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.NotSupportedBySymbol);
                        } else {
                            this.setValueOkFieldStatus(fieldId);
                        }
                    }
                }
                break;
            default:
                throw new UnreachableCaseError('OPUFSOT75543', this._requestTypeId);
        }
    }

    private UpdateFieldStatus_TotalQuantity() {
        const fieldId = OrderPad.FieldId.TotalQuantity;
        switch (this._requestTypeId) {
            case OrderRequestTypeId.Cancel:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                break;
            case OrderRequestTypeId.Move:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                break;
            case OrderRequestTypeId.Place:
            case OrderRequestTypeId.Amend:
                if (this._totalQuantity === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                } else {
                    const routedIvemId = this.getRoutedIvemIdIfOk();
                    if (routedIvemId === undefined) {
                        this.setPrerequisitieFieldNotValidFieldStatus(fieldId, OrderPad.Field.StatusReasonId.SymbolNotOk);
                    } else {
                        const quantityAllowed = routedIvemId.isQuantityAllowed(this._totalQuantity);
                        if (!quantityAllowed) {
                            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.QuantityNotAMultiple);
                        } else {
                            this.setValueOkFieldStatus(fieldId);
                        }
                    }
                }
                break;
            default:
                throw new UnreachableCaseError('OPUFSTQ1222222', this._requestTypeId);
        }
    }

    private updateFieldStatus_LimitValue() {
        const fieldId = OrderPad.FieldId.LimitValue;

        switch (this._requestTypeId) {
            case OrderRequestTypeId.Cancel:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                break;
            case OrderRequestTypeId.Move:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                break;
            case OrderRequestTypeId.Place:
            case OrderRequestTypeId.Amend:
                const orderTypeId = this.getOrderTypeIdIfOk();
                if (orderTypeId === undefined) {
                    this.setPrerequisitieFieldNotValidFieldStatus(fieldId, OrderPad.Field.StatusReasonId.OrderTypeNotSpecified);
                } else {
                    const limitOrderType = OrderType.isLimit(orderTypeId);
                    if (this.isNew() && !limitOrderType) {
                        this.setDisabledFieldStatus(fieldId, OrderPad.Field.StatusReasonId.NotLimitOrderType);
                    } else {
                        if (this.isAmend() && !(limitOrderType || this._orderTypeId === OrderTypeId.Best)) {
                            this.setDisabledFieldStatus(fieldId, OrderPad.Field.StatusReasonId.NotLimitOrderType);
                        } else {
                            const limitValue = this._limitValue;
                            if (limitValue === undefined) {
                                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                            } else {
                                const triggerTypeId = this.getTriggerTypeIdIfOk();
                                if (triggerTypeId === undefined) {
                                    this.setPrerequisitieFieldNotValidFieldStatus(fieldId, OrderPad.Field.StatusReasonId.TriggerType);
                                } else {
                                    switch (triggerTypeId) {
                                        case OrderTriggerTypeId.Immediate:
                                        case OrderTriggerTypeId.Price:
                                        case OrderTriggerTypeId.Overnight:
                                            const symbolDetail = this.getSymbolDetailIfOk();
                                            if (symbolDetail === undefined) {
                                                this.setPrerequisitieFieldNotValidFieldStatus(fieldId,
                                                    OrderPad.Field.StatusReasonId.SymbolNotOk);
                                            } else {
                                                // const asxTmc = symbolDetail.litIvemId.litId === MarketId.AsxTradeMatch
                                                //     &&
                                                //     symbolDetail.ivemClassId === IvemClassId.Combination;
                                                // if (asxTmc && limitValue.isNegative()) {
                                                //     this.setErrorFieldStatus(fieldId,
                                                //         OrderPad.Field.StatusReasonId.ZeroOrNegativeValueNotAllowed);
                                                // } else {
                                                    if (this._priceStepperRetrieveError !== undefined) {
                                                        this.setErrorFieldStatus(fieldId,
                                                            OrderPad.Field.StatusReasonId.RetrievePriceStepperError);
                                                    } else {
                                                        // if (this._priceStepper === undefined) {
                                                        //     this.setWaitingFieldStatus(fieldId,
                                                        //         OrderPad.Field.StatusReasonId.RetrievingPriceStepper);
                                                        // } else {
                                                        //     if (!this._priceStepper.isOnStep(limitValue)) {
                                                        //         this.setErrorFieldStatus(fieldId,
                                                        //             OrderPad.Field.StatusReasonId.PriceNotOnStep);
                                                        //     } else {
                                                                this.setValueOkFieldStatus(fieldId);
                                                            // }
                                                        // }
                                                    }
                                                // }
                                            }
                                            break;
                                        case OrderTriggerTypeId.TrailingPrice:
                                        case OrderTriggerTypeId.PercentageTrailingPrice:
                                            this.setValueOkFieldStatus(fieldId);
                                            break;
                                        default:
                                            throw new UnreachableCaseError('OPUPSLVOD38898', triggerTypeId);
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            default:
                throw new UnreachableCaseError('OPUFSLV4299121212', this._requestTypeId);
        }
    }

    private updateFieldStatus_TriggerType() {
        const fieldId = OrderPad.FieldId.TriggerType;
        switch (this._requestTypeId) {
            case OrderRequestTypeId.Amend:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Amend);
                break;
            case OrderRequestTypeId.Cancel:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                break;
            case OrderRequestTypeId.Move:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                break;
            case OrderRequestTypeId.Place:
                if (this._triggerTypeId === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                } else {
                    if (!this.isFieldOk(OrderPad.FieldId.Symbol)) {
                        this.setPrerequisitieFieldNotValidFieldStatus(fieldId, OrderPad.Field.StatusReasonId.SymbolNotOk);
                    } else {
                        if (!this._allowedTriggerTypeIds.includes(this._triggerTypeId)) {
                            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.NotSupportedBySymbol);
                        } else {
                            this.setValueOkFieldStatus(fieldId);
                        }
                    }
                }
                break;
            default:
                throw new UnreachableCaseError('OPUFSTTI56291', this._requestTypeId);
        }
    }

    private updateFieldStatus_TriggerValueFieldMovement() {
        const valueFieldId = OrderPad.FieldId.TriggerValue;
        const fieldFieldId = OrderPad.FieldId.TriggerField;
        const movementFieldId = OrderPad.FieldId.TriggerMovement;
        if (this._triggerTypeId === undefined) {
            this.setPrerequisitieFieldNotValidFieldStatus(valueFieldId, OrderPad.Field.StatusReasonId.TriggerTypeNotDefined);
            this.setPrerequisitieFieldNotValidFieldStatus(fieldFieldId, OrderPad.Field.StatusReasonId.TriggerTypeNotDefined);
            this.setPrerequisitieFieldNotValidFieldStatus(movementFieldId, OrderPad.Field.StatusReasonId.TriggerTypeNotDefined);
        } else {
            switch (this.triggerTypeId) {
                case OrderTriggerTypeId.Immediate: {
                    this.setDisabledFieldStatus(valueFieldId, OrderPad.Field.StatusReasonId.ImmediateTriggerType);
                    this.setDisabledFieldStatus(fieldFieldId, OrderPad.Field.StatusReasonId.ImmediateTriggerType);
                    this.setDisabledFieldStatus(movementFieldId, OrderPad.Field.StatusReasonId.ImmediateTriggerType);
                    break;
                }
                case OrderTriggerTypeId.Price: {
                    if (this._triggerValue === undefined) {
                        this.setErrorFieldStatus(valueFieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                    } else {
                        this.setValueOkFieldStatus(valueFieldId);
                    }
                    if (this._triggerFieldId === undefined) {
                        this.setErrorFieldStatus(fieldFieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                    } else {
                        this.setValueOkFieldStatus(fieldFieldId);
                    }
                    if (this.triggerMovementId === undefined) {
                        this.setErrorFieldStatus(movementFieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                    } else {
                        this.setValueOkFieldStatus(movementFieldId);
                    }
                    break;
                }
                default: {
                    throw new NotImplementedError('OPUFSTVFM7888833');
                }
            }
        }
    }

    private updateFieldStatus_TimeInForce() {
        const fieldId = OrderPad.FieldId.TimeInForce;
        switch (this._requestTypeId) {
            case OrderRequestTypeId.Amend:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Amend);
                break;
            case OrderRequestTypeId.Cancel:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Cancel);
                break;
            case OrderRequestTypeId.Move:
                this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Move);
                break;
            case OrderRequestTypeId.Place:
                if (this._timeInForceId === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                } else {
                    const routedIvemId = this.getRoutedIvemIdIfOk();
                    if (routedIvemId === undefined) {
                        this.setPrerequisitieFieldNotValidFieldStatus(fieldId, OrderPad.Field.StatusReasonId.SymbolNotOk);
                    } else {
                        const orderTypeId = this.getOrderTypeIdIfOk();
                        if (orderTypeId === undefined || this._allowedTimeInForceIds === undefined) {
                            this.setPrerequisitieFieldNotValidFieldStatus(fieldId, OrderPad.Field.StatusReasonId.OrderTypeNotSpecified);
                        } else {
                            const allowed = this._allowedTimeInForceIds.includes(this._timeInForceId);
                            if (!allowed) {
                                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.NotSupportedByOrderType);
                            } else {
                                if (this._timeInForceId !== this._userTimeInForceId) {
                                    this.setReadOnlyFieldStatus(fieldId,
                                        OrderPad.Field.StatusReasonId.MarketAndStopOrderTypeAreAlwaysFillOrKill);
                                } else {
                                    this.setValueOkFieldStatus(fieldId);
                                }
                            }
                        }
                    }
                }
                break;
            default:
                throw new UnreachableCaseError('OPUFSTIF29395', this._requestTypeId);
        }
    }

    private updateFieldStatus_Order() {
        const fieldId = OrderPad.FieldId.ExistingOrder;
        switch (this._requestTypeId) {
            case OrderRequestTypeId.Amend:
                if (this._existingOrderId === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                } else {
                    if (this._existingOrder === undefined) {
                        this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.OrderNotFound);
                    } else {
                        if (!this._existingOrder.canAmend()) {
                            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.OrderCannotBeAmended);
                        } else {
                            this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Unknown);
                        }
                    }
                }
                break;
            case OrderRequestTypeId.Cancel:
                if (this._existingOrderId === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                } else {
                    if (this._existingOrder === undefined) {
                        this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.OrderNotFound);
                    } else {
                        if (!this._existingOrder.canCancel()) {
                            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.OrderCannotBeCancelled);
                        } else {
                            this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Unknown);
                        }
                    }
                }
                break;
            case OrderRequestTypeId.Move:
                if (this._existingOrderId === undefined) {
                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
                } else {
                    if (this._existingOrder === undefined) {
                        this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.OrderNotFound);
                    } else {
                        this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Unknown);
                    }
                }
                break;
            case OrderRequestTypeId.Place:
                this.setDisabledFieldStatus(fieldId, OrderPad.Field.StatusReasonId.Place);
                break;
            default:
                throw new UnreachableCaseError('OPUFSOT75543', this._requestTypeId);
        }
    }

    private updateFieldStatus_DestinationAccount() {
        const fieldId = OrderPad.FieldId.DestinationAccount;

        if (this._requestTypeId !== OrderRequestTypeId.Move) {
            this.setReadOnlyFieldStatus(fieldId, OrderPad.Field.StatusReasonId.NotMove);
        } else {
            if (this._destinationAccountId === undefined) {
                this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.ValueRequired);
            } else {
                if (this._destinationBrokerageAccountIncubator.incubating) {
                    this.setWaitingFieldStatus(fieldId, OrderPad.Field.StatusReasonId.RetrievingAccount);
                } else {
                    if (this._destinationAccount === undefined) {
                        this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountIdNotValid);
                    } else {
                        const feedStatusId = this._destinationAccount.tradingFeed.statusId;
                        if (feedStatusId === undefined) {
                            this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountNoLongerAvailable);
                        } else {
                            switch (feedStatusId) {
                                case FeedStatusId.Initialising:
                                    this.setWaitingFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Initialising);
                                    break;
                                case FeedStatusId.Active:
                                    this.setValueOkFieldStatus(fieldId);
                                    break;
                                case FeedStatusId.Closed:
                                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Closed);
                                    break;
                                case FeedStatusId.Inactive:
                                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Inactive);
                                    break;
                                case FeedStatusId.Impaired:
                                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Impaired);
                                    break;
                                case FeedStatusId.Expired:
                                    this.setErrorFieldStatus(fieldId, OrderPad.Field.StatusReasonId.AccountFeedStatus_Expired);
                                    break;
                                default:
                                    throw new UnreachableCaseError('OPUFSAI75560', feedStatusId);
                            }
                        }
                    }
                }
            }
        }
    }

    private internalReset() {
        this.beginChanges();
        try {
            for (let id = 0; id < OrderPad.Field.idCount; id++) {
                this.internalClearField(id);
            }

            this.internalResetDestIvemIdSupportVars();
            this.internalResetPriceValueSupportVars();

            this._sent = false;
            this._snapshot = false;

        } finally {
            this.endChanges();
        }
    }

    private internalResetLimitValueSupportVars() {
        // this._limitValueSupportedId = OrderPad.ValidityId.Unknown;
        // this._limitValueNotSupportedReasonId = OrderPad.Field.StatusReasonId.PriceOrSegmentsNotAvailable;
    }

    private internalResetModified() {
        this.beginChanges();
        try {
            for (let id = 0; id < OrderPad.Field.idCount; id++) {
                if (this._fields[id].modified) {
                    this._fields[id].modified = false;
                    this.flagFieldChanged(id);
                }
            }
        } finally {
            this.endChanges();
        }
    }

    private internalResetPriceValueSupportVars() {
        this.internalResetLimitValueSupportVars();
        this.internalResetTriggerValueSupportVars();
    }

    private internalResetTriggerValueSupportVars() {
        // this._triggerValueSupportedId = OrderPad.ValidityId.Unknown;
        // this._triggerValueNotSupportedReasonId = OrderPad.Field.StatusReasonId.PriceOrSegmentsNotAvailable;
    }

    private internalResetDestIvemIdSupportVars() {
        // this._symbolValidityId = OrderPad.ValidityId.Unknown;
        // this._symbolNotValidReasonId = OrderPad.Field.StatusReasonId.SymbolsNotAvailable;
        // this._symbolName = undefined;
        // this._symbolIsAsxIndexEto = false;
        // this._symbolAllowedOrderDestinationIds = [];
    }

    private internalSetAccountId(value: BrokerageAccountId | undefined) {
        if (value === undefined) {
            if (this._accountId !== undefined) {
                this.beginChanges();
                try {
                    this._brokerageAccountIncubator.cancel();
                    this.checkClearAccount();
                    this._fields[OrderPad.FieldId.Account].modified = true;
                    this.flagFieldChanged(OrderPad.FieldId.Account);
                } finally {
                    this.endChanges();
                }
            }
        } else {
            if (this._accountId === undefined || value !== this._accountId) {
                this.beginChanges();
                try {
                    this._accountId = value;
                    this.checkClearAccount();
                    this._fields[OrderPad.FieldId.Account].modified = true;
                    this.flagFieldChanged(OrderPad.FieldId.Account);

                    // this.checkUnsubscribeOrderGiversDataItem();
                    // this.internalClearField(OrderPad.FieldId.AccountDefaultBrokerageCode);

                    const promiseOrCancellableAccount = this._brokerageAccountIncubator.incubate(this._accountId);
                    if (BrokerageAccountIncubator.isCancellableAccount(promiseOrCancellableAccount)) {
                        this.setAccount(promiseOrCancellableAccount.account);
                    } else {
                        promiseOrCancellableAccount.then(
                            ({ cancelled, account }) => {
                                if (!cancelled) {
                                    this.setAccount(account);
                                }
                            },
                            (reason) => {
                                Logger.logError(`OrderPad.internalSetAccountId: Unexpected reject: ${reason}`);
                            }
                        );
                    }

                    // this.checkAccountDefaultBrokerageCode();

                    // this.checkSubscribeOrderGiversDataItem();
                    // this.checkUpdateStatus();
                    // this.checkAutoSetAccountDefaultOrderGivenBy();
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    // private internalSetAlgoId(value: TOrderAlgoId | undefined) {

    // }

    private internalSetSideId(value: SideId | undefined) {
        if (value !== this._sideId) {
            this.beginChanges();
            try {
                this._sideId = value;
                this._fields[OrderPad.FieldId.Side].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.Side);
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetRoutedIvemId(value: RoutedIvemId | undefined) {
        if (value === undefined) {
            if (this._routedIvemId !== undefined) {
                this._routedIvemId = undefined;
                this.updateAllowedOrderTypeIds(OrderPad.defaultAllowedOrderTypeIds);
                this.updateAllowedSideIds(OrderPad.defaultAllowedSideIds);
                this.updateAllowedTriggerTypeIds(OrderPad.defaultAllowedTriggerTypeIds);
                this._ivemIdSymbolDetail = undefined;
                this._litSymbolDetails = undefined;
                this._bestLitSymbolDetail = undefined;
                this.updateLimitUnit();
                this.updatePriceStepper();
                this._fields[OrderPad.FieldId.Symbol].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.Symbol);
            }
        } else {
            if (this._routedIvemId === undefined || !RoutedIvemId.isEqual(value, this._routedIvemId)) {
                this._routedIvemId = value;
                const allowedOrderTypeIds = this._routedIvemId.getAllowedOrderTypes();
                this.updateAllowedOrderTypeIds(allowedOrderTypeIds);
                if (this._orderTypeId !== undefined) {
                    const allowedTimeInForceIds = this._routedIvemId.getAllowedTimeInForcesForOrderType(this._orderTypeId);
                    this.updateAllowedTimeInForceIds(allowedTimeInForceIds);
                }
                const allowedSideIds = this._routedIvemId.getAllowedSideIds();
                this.updateAllowedSideIds(allowedSideIds);
                const allowedTriggerTypeIds = this._routedIvemId.getAllowedTriggerTypeIds();
                this.updateAllowedTriggerTypeIds(allowedTriggerTypeIds);
                this._ivemIdSymbolDetail = undefined;
                this._litSymbolDetails = undefined;
                this._bestLitSymbolDetail = undefined;
                this.updateLimitUnit();
                this.updatePriceStepper();
                const ivemIdSymbolDetail = symbolDetailCache.getIvemIdFromCache(value.ivemId);
                if (ivemIdSymbolDetail !== undefined) {
                    this.setRoutedIvemIdSymbolDetail(value, ivemIdSymbolDetail);
                } else {
                    // Create a temporary IvemIdSymbolDetail so that errors are suppressed while real IvemIdSymbolDetail is retrieved
                    this._ivemIdSymbolDetail = symbolDetailCache.createRoutedIvemIdDetail(value);
                    const promise = symbolDetailCache.getIvemId(value.ivemId, true);
                    promise.then(
                        (detail) => {
                            this._ivemIdSymbolDetail = undefined;
                            if (detail !== undefined) { // undefined means cancelled - ignore
                                this.setRoutedIvemIdSymbolDetail(value, detail);
                            }
                        },
                    );
                }

                this._fields[OrderPad.FieldId.Symbol].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.Symbol);
            }
        }
    }

    private internalSetExpiryDate(value: Date | undefined) {
        if (value !== this._expiryDate) {
            this.beginChanges();
            try {
                this._expiryDate = newUndefinableDate(value);
                this._fields[OrderPad.FieldId.ExpiryDate].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.ExpiryDate);
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetOrderTypeId(value: OrderTypeId | undefined) {
        if (value !== this._orderTypeId) {
            this.beginChanges();
            try {
                this._orderTypeId = value;
                this._fields[OrderPad.FieldId.OrderType].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.OrderType);

                if (this._orderTypeId === undefined) {
                    if (this.allowedTimeInForceIds !== undefined) {
                        this._allowedTimeInForceIds = undefined;
                        this.flagFieldChanged(OrderPad.FieldId.TimeInForce);
                        this.updateTimeInForceId();
                    }
                } else {
                    if (this.routedIvemId !== undefined) {
                        const allowedTimeInForceIds = this.routedIvemId.getAllowedTimeInForcesForOrderType(this._orderTypeId);
                        this.updateAllowedTimeInForceIds(allowedTimeInForceIds);
                    }
                }
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetTotalQuantity(value: Integer | undefined) {
        if (value !== this._totalQuantity) {
            this.beginChanges();
            try {
                this._totalQuantity = value;
                this._fields[OrderPad.FieldId.TotalQuantity].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.TotalQuantity);
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetLimitValue(value: Decimal | undefined) {
        if (value !== this._limitValue) {
            this.beginChanges();
            try {
                this._limitValue = value;
                this._fields[OrderPad.FieldId.LimitValue].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.LimitValue);
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetTimeInForceId(value: TimeInForceId | undefined) {
        if (value !== this._userTimeInForceId) {
            this.beginChanges();
            try {
                this._userTimeInForceId = value;
                this._fields[OrderPad.FieldId.TimeInForce].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.TimeInForce);
                this.updateTimeInForceId();
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetTrigger(trigger: OrderTrigger) {
        if (trigger === undefined) {
            this.internalClearField(OrderPad.FieldId.TriggerType);
            this.internalClearField(OrderPad.FieldId.TriggerValue);
            this.internalClearField(OrderPad.FieldId.TriggerField);
            this.internalClearField(OrderPad.FieldId.TriggerMovement);
        } else {
            const triggerTypeId = trigger.typeId;
            this.internalSetTriggerTypeId(triggerTypeId);
            switch (triggerTypeId) {
                case OrderTriggerTypeId.Immediate: {
                    this.internalClearField(OrderPad.FieldId.TriggerValue);
                    this.internalClearField(OrderPad.FieldId.TriggerField);
                    this.internalClearField(OrderPad.FieldId.TriggerMovement);
                    break;
                }
                case OrderTriggerTypeId.Price: {
                    const priceTrigger = trigger as PriceOrderTrigger;
                    this.internalSetTriggerValue(priceTrigger.value);
                    this.internalSetTriggerFieldId(priceTrigger.fieldId);
                    this.internalSetTriggerMovementId(priceTrigger.movementId);
                    break;
                }
                case OrderTriggerTypeId.TrailingPrice:
                    throw new NotImplementedError('OPISTT44320002993');
                case OrderTriggerTypeId.PercentageTrailingPrice:
                    throw new NotImplementedError('OPISTP44320002993');
                case OrderTriggerTypeId.Overnight:
                    throw new NotImplementedError('OPISTO44320002993');
                default:
                    throw new UnreachableCaseError('OPISTU44320002993', triggerTypeId);
            }
        }
    }

    private internalSetTriggerTypeId(value: OrderTriggerTypeId | undefined) {
        if (value !== this._triggerTypeId) {
            if (value !== OrderTriggerTypeId.Immediate && value !== OrderTriggerTypeId.Price) {
                // only immediate and price is supported currently and it is initialised on construction
                throw new NotImplementedError('OPISTTI5888609');
            } else {
                this.beginChanges();
                try {
                    this._triggerTypeId = value;
                    this._fields[OrderPad.FieldId.TriggerType].modified = true;
                    this.flagFieldChanged(OrderPad.FieldId.TriggerType);
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    private internalSetTriggerValue(value: Decimal | undefined) {
        if (!isUndefinableDecimalEqual(value, this._triggerValue)) {
            this.beginChanges();
            try {
                this._triggerValue = newUndefinableDecimal(value);
                this._fields[OrderPad.FieldId.TriggerValue].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.TriggerValue);
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetTriggerFieldId(value: PriceOrderTrigger.FieldId | undefined) {
        if (value !== this._triggerFieldId) {
            this.beginChanges();
            try {
                this._triggerFieldId = value;
                this._fields[OrderPad.FieldId.TriggerField].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.TriggerField);
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetTriggerMovementId(value: MovementId | undefined) {
        if (value !== this._triggerMovementId) {
            this.beginChanges();
            try {
                this._triggerMovementId = value;
                this._fields[OrderPad.FieldId.TriggerMovement].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.TriggerMovement);
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetExistingOrderId(value: OrderId | undefined) {
        if (value !== this._existingOrderId) {
            this.beginChanges();
            try {
                this._existingOrderId = value;
                this._fields[OrderPad.FieldId.ExistingOrder].modified = true;
                this.flagFieldChanged(OrderPad.FieldId.ExistingOrder);
            } finally {
                this.endChanges();
            }
        }
    }

    private internalSetDestinationAccountId(value: BrokerageAccountId | undefined) {
        if (value === undefined) {
            if (this._destinationAccountId !== undefined) {
                this.beginChanges();
                try {
                    this._destinationBrokerageAccountIncubator.cancel();
                    this.checkClearDestinationAccount();
                    this._fields[OrderPad.FieldId.DestinationAccount].modified = true;
                    this.flagFieldChanged(OrderPad.FieldId.DestinationAccount);
                } finally {
                    this.endChanges();
                }
            }
        } else {
            if (this._destinationAccountId === undefined || value !== this._destinationAccountId) {
                this.beginChanges();
                try {
                    this._destinationAccountId = value;
                    this.checkClearDestinationAccount();
                    this._fields[OrderPad.FieldId.DestinationAccount].modified = true;
                    this.flagFieldChanged(OrderPad.FieldId.DestinationAccount);

                    // this.checkUnsubscribeOrderGiversDataItem();
                    // this.internalClearField(OrderPad.FieldId.AccountDefaultBrokerageCode);

                    const promiseOrCancellableAccount = this._destinationBrokerageAccountIncubator.incubate(this._destinationAccountId);
                    if (BrokerageAccountIncubator.isCancellableAccount(promiseOrCancellableAccount)) {
                        this.setDestinationAccount(promiseOrCancellableAccount.account);
                    } else {
                        promiseOrCancellableAccount.then(
                            ({ cancelled, account }) => {
                                if (!cancelled) {
                                    this.setDestinationAccount(account);
                                }
                            },
                            (reason) => {
                                Logger.logError(`OrderPad.internalSetDestinationAccountId: Unexpected reject: ${reason}`);
                            }
                        );
                    }

                    // this.checkAccountDefaultBrokerageCode();

                    // this.checkSubscribeOrderGiversDataItem();
                    // this.checkUpdateStatus();
                    // this.checkAutoSetAccountDefaultOrderGivenBy();
                } finally {
                    this.endChanges();
                }
            }
        }
    }

    private setRoutedIvemIdSymbolDetail(routedIvemId: RoutedIvemId, detail: SymbolDetailCache.IvemIdDetail) {
        this.beginChanges();
        try {
            this._ivemIdSymbolDetail = detail;
            if (detail.valid && detail.exists) {
                this._litSymbolDetails = detail.litIvemIdDetails;
                this._allowedRoutes = this.calculateAllowedRoutes(detail.litIvemIdDetails);
                const routeOk = OrderRoute.arrayIncludes(this._allowedRoutes, routedIvemId.route);
                if (routeOk) {
                    this._bestLitSymbolDetail = this.findBestSymbolDetail(routedIvemId, detail.litIvemIdDetails);
                    this.updateLimitUnit();
                    this.updatePriceStepper();
                }
            }
            this.flagFieldChanged(OrderPad.FieldId.Symbol);
        } finally {
            this.endChanges();
        }
    }

    private updateLimitUnit() {
        let limitUnitId: OrderPad.PriceUnitId | undefined;
        if (this._bestLitSymbolDetail === undefined || this.triggerTypeId === undefined) {
            limitUnitId = undefined;
        } else {
            // enhance this further when ETO Options are supported and trigger types other than Immediate
            limitUnitId = OrderPad.PriceUnitId.Currency;
        }

        if (limitUnitId !== this._limitUnitId) {
            this._limitUnitId = limitUnitId;
            this.flagFieldChanged(OrderPad.FieldId.LimitValue);
        }
    }

    private updatePriceStepper() {
        if (this._bestLitSymbolDetail === undefined) {
            this._priceStepperRetrieveError = undefined;
            this._priceStepper = undefined;
            this.flagFieldChanged(OrderPad.FieldId.LimitValue);
        } else {
            const detail = this._bestLitSymbolDetail;
            this._priceStepperRetrieveError = undefined;
            this._priceStepper = undefined;
            this.flagFieldChanged(OrderPad.FieldId.LimitValue);
            const stepperOrPromise = this._priceStepperIncubator.incubate(this._bestLitSymbolDetail);
            if (PriceStepperIncubator.isStepper(stepperOrPromise)) {
                this._priceStepper = this._priceStepper;
            } else {
                stepperOrPromise.then(
                    (stepper) => {
                        if (stepper !== undefined) { // undefined means cancelled - ignore if undefined
                            this.beginChanges();
                            try {
                                this._priceStepper = this._priceStepper;
                                this.flagFieldChanged(OrderPad.FieldId.LimitValue);
                            } finally {
                                this.endChanges();
                            }
                        }
                    },
                    (reason) => {
                        this.beginChanges();
                        try {
                            Logger.logError(`OrderPad: Error retrieving price step for: ${detail.litIvemId.name} Error: ${reason}`);
                            this._priceStepperRetrieveError = reason;
                            this.flagFieldChanged(OrderPad.FieldId.LimitValue);
                        } finally {
                            this.endChanges();
                        }
                    }
                );
            }
        }
    }

    private updateAllowedOrderTypeIds(value: readonly OrderTypeId[]) {
        if (!isArrayEqualUniquely(value, this._allowedOrderTypeIds)) {
            this._allowedOrderTypeIds = value;
            this.flagFieldChanged(OrderPad.FieldId.OrderType);
        }
    }

    private updateAllowedTimeInForceIds(value: readonly TimeInForceId[]) {
        if (!isUndefinableArrayEqualUniquely(value, this._allowedTimeInForceIds)) {
            this._allowedTimeInForceIds = value;
            this.flagFieldChanged(OrderPad.FieldId.TimeInForce);

            this.updateTimeInForceId();
        }
    }

    private updateAllowedSideIds(value: readonly SideId[]) {
        if (!isArrayEqualUniquely(value, this._allowedSideIds)) {
            this._allowedSideIds = value;
            this.flagFieldChanged(OrderPad.FieldId.Side);
        }
    }

    private updateAllowedTriggerTypeIds(value: readonly OrderTriggerTypeId[]) {
        if (!isArrayEqualUniquely(value, this._allowedTriggerTypeIds)) {
            this._allowedTriggerTypeIds = value;
            this.flagFieldChanged(OrderPad.FieldId.TriggerType);
        }
    }

    private updateTimeInForceId() {
        if (this._allowedTimeInForceIds === undefined) {
            if (this._timeInForceId !== this._userTimeInForceId) {
                this._timeInForceId = this._userTimeInForceId;
                this.flagFieldChanged(OrderPad.FieldId.TimeInForce);
            }
        } else {
            let targetTimeInForceId: TimeInForceId | undefined;
            if (this._userTimeInForceId !== undefined && this._allowedTimeInForceIds.includes(this._userTimeInForceId)) {
                targetTimeInForceId = this._userTimeInForceId;
            } else {
                if (this._allowedTimeInForceIds.length === 1) {
                    targetTimeInForceId = this.allowedTimeInForceIds[0];
                } else {
                    targetTimeInForceId = this._timeInForceId;
                }
            }

            if (targetTimeInForceId !== this._timeInForceId) {
                this._timeInForceId = targetTimeInForceId;
                this.flagFieldChanged(OrderPad.FieldId.TimeInForce);
            }
        }
    }

    private createPlaceOrderRequestDataDefinition(): PlaceOrderRequestDataDefinition {
        const definition = new PlaceOrderRequestDataDefinition();
        this.initialiseOrderRequestDataDefinition(definition);
        definition.details = this.createPlaceOrderDetails();
        definition.route = this.createOrderRoute();
        definition.trigger = this.createOrderTrigger();
        return definition;
    }

    private createAmendOrderRequestDataDefinition(): AmendOrderRequestDataDefinition {
        const definition = new AmendOrderRequestDataDefinition();
        this.initialiseOrderRequestDataDefinition(definition);
        definition.details = this.createAmendOrderDetails();
        definition.route = undefined; // currently do not support changing route
        definition.trigger = undefined; // currently do not support changing trigger

        if (this._existingOrderId === undefined) {
            throw new AssertInternalError('OPCAORDDI2905778');
        } else {
            definition.orderId = this._existingOrderId;
        }

        return definition;
    }

    private createCancelOrderRequestDataDefinition(): CancelOrderRequestDataDefinition {
        const definition = new CancelOrderRequestDataDefinition();
        this.initialiseOrderRequestDataDefinition(definition);

        if (this._existingOrderId === undefined) {
            throw new AssertInternalError('OPCAORDDI2905778');
        } else {
            definition.orderId = this._existingOrderId;
        }
        return definition;
    }

    private createMoveOrderRequestDataDefinition(): MoveOrderRequestDataDefinition {
        const definition = new MoveOrderRequestDataDefinition();
        this.initialiseOrderRequestDataDefinition(definition);

        if (this._existingOrderId === undefined) {
            throw new AssertInternalError('OPCMORDDIE03928882');
        } else {
            definition.orderId = this._existingOrderId;
            if (this._destinationAccountId === undefined) {
                throw new AssertInternalError('OPCMORDDID232991777');
            } else {
                definition.destination = this._destinationAccountId;
            }
        }
        return definition;
    }

    private initialiseOrderRequestDataDefinition(definition: OrderRequestDataDefinition) {
        if (this._accountId === undefined || !this.isFieldOk(OrderPad.FieldId.Account)) {
            throw new AssertInternalError('OPIORDDA196773');
        } else {
            definition.accountId = this._accountId;
        }

        definition.flags = [];
    }

    private createPlaceOrderDetails() {
        if (this._bestLitSymbolDetail === undefined) {
            throw new AssertInternalError('OPCPOD222288');
        } else {
            switch (this._bestLitSymbolDetail.ivemClassId) {
                case IvemClassId.Market:
                    const marketOrderDetails = new MarketOrderDetails();
                    this.loadPlaceMarketOrderDetails(marketOrderDetails);
                    return marketOrderDetails;
                case IvemClassId.ManagedFund:
                case IvemClassId.Unknown:
                    throw new AssertInternalError('OPCPODN5688688');
                default:
                    throw new UnreachableCaseError('OPCPODD629981', this._bestLitSymbolDetail.ivemClassId);
            }
        }
    }

    private createAmendOrderDetails() {
        if (this._bestLitSymbolDetail === undefined) {
            throw new AssertInternalError('OPCPOD222288');
        } else {
            switch (this._bestLitSymbolDetail.ivemClassId) {
                case IvemClassId.Market:
                    const marketOrderDetails = new MarketOrderDetails();
                    this.loadAmendMarketOrderDetails(marketOrderDetails);
                    return marketOrderDetails;
                case IvemClassId.ManagedFund:
                case IvemClassId.Unknown:
                    throw new AssertInternalError('OPCPODN5688688');
                default:
                    throw new UnreachableCaseError('OPCPODD629981', this._bestLitSymbolDetail.ivemClassId);
            }
        }
    }

    private loadPlaceMarketOrderDetails(details: MarketOrderDetails) {
        if (this.routedIvemId === undefined || !this.isFieldOk(OrderPad.FieldId.Symbol)) {
            throw new AssertInternalError('OPLPMODR1445238');
        } else {
            details.exchangeId = this.routedIvemId.ivemId.exchangeId;
            details.code = this.routedIvemId.ivemId.code.slice();
        }

        if (this.sideId === undefined || !this.isFieldOk(OrderPad.FieldId.Side)) {
            throw new AssertInternalError('OPLPMODSU4545998');
        } else {
            const bidAskSideId = Side.tryIdToBidAskSideId(this.sideId);
            if (bidAskSideId === undefined) {
                throw new AssertInternalError('OPLPMODSB874448');
            } else {
                details.sideId = bidAskSideId;
            }
        }

        details.brokerageSchedule = undefined; // not supported currently
        details.instructions = undefined; // not supported currently

        if (this.orderTypeId === undefined || !this.isFieldOk(OrderPad.FieldId.OrderType)) {
            throw new AssertInternalError('OPLPMODT988445');
        } else {
            details.typeId = this.orderTypeId;
        }

        if (!this.isFieldOk(OrderPad.FieldId.LimitValue)) {
            details.limitPrice = undefined;
        } else {
            if (this.limitValue === undefined) {
                throw new AssertInternalError('OPLPMODL7743434');
            } else {
                details.limitPrice = newUndefinableDecimal(this.limitValue);
            }
        }

        if (this.totalQuantity === undefined || !this.isFieldOk(OrderPad.FieldId.TotalQuantity)) {
            throw new AssertInternalError('OPLPMODQ77783443');
        } else {
            details.quantity = this.totalQuantity;
        }

        details.hiddenQuantity = undefined; // not supported currently
        details.minimumQuantity = undefined; // not supported currently

        if (this.timeInForceId === undefined || !this.isFieldOk(OrderPad.FieldId.TimeInForce)) {
            throw new AssertInternalError('OPLPMODM1111456');
        } else {
            details.timeInForceId = this.timeInForceId;

            if (details.timeInForceId === TimeInForceId.GoodTillDate) {
                if (!this.isFieldOk(OrderPad.FieldId.ExpiryDate)) {
                    details.expiryDate = undefined;
                } else {
                    if (this.expiryDate === undefined) {
                        throw new AssertInternalError('OPLPMODE222277');
                    } else {
                        details.expiryDate = newUndefinableDate(this.expiryDate);
                    }
                }
            }
        }

        details.shortSellTypeId = undefined; // not supported currently
    }

    private loadAmendMarketOrderDetails(details: MarketOrderDetails) {
        // Currently uses same logic as Place. All possible values are defined and loaded values are ignored
        // The server may only want changed values passed up. In this cases compare values against loaded Values
        this.loadPlaceMarketOrderDetails(details);
    }

    private createOrderRoute() {
        if (this.routedIvemId === undefined) {
            throw new AssertInternalError('OPCOR588847');
        } else {
            return this.routedIvemId.route.createCopy();
        }
    }

    private loadAmendCancelMoveCommonFromOrder(order: Order) {
        this._existingOrder = order;

        this.internalSetExistingOrderId(order.id);
        this.internalSetAccountId(order.accountId);

        this.internalSetTrigger(order.trigger);
        this._loadedTriggerTypeId = order.triggerTypeId;

        this.internalSetTotalQuantity(order.quantity);
        this._loadedTotalQuantity = order.quantity;

        this.internalSetLimitValue(order.limitPrice);
        this._loadedLimitValue = order.limitPrice;

        this.internalSetTimeInForceId(order.timeInForceId);
        this._loadedTimeInForceId = order.timeInForceId;

        const expiryDate = order.expiryDate === undefined ? undefined : order.expiryDate.utcDate;
        this.internalSetExpiryDate(expiryDate);
        this._loadedExpiryDate = expiryDate;

        this.internalSetOrderTypeId(order.equityOrderTypeId);
        this._loadedOrderTypeId = order.equityOrderTypeId;

        const routedIvemId = this.createRoutedIvemIdFromOrder(order);
        this.internalSetRoutedIvemId(routedIvemId.createCopy());
        this._loadedRoutedIvemId = routedIvemId;

        const bidAskSideId = order.sideId;
        const sideId = BidAskSide.idToSideId(bidAskSideId);
        this.internalSetSideId(sideId);
        this._loadedSideId = sideId;
    }

    private createRoutedIvemIdFromOrder(order: Order) {
        const ivemId = new IvemId(order.code, order.exchangeId);
        return new RoutedIvemId(ivemId, order.route);
    }

    private createRoutedIvemIdFromHolding(holding: Holding) {
        const ivemId = new IvemId(holding.code, holding.exchangeId);
        const marketId = ExchangeInfo.idToDefaultMarketId(ivemId.exchangeId);
        const route = new MarketOrderRoute(marketId);

        return new RoutedIvemId(ivemId, route);
    }
}

/* eslint-disable @typescript-eslint/no-namespace */
export namespace OrderPad {
    export const enum FieldId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Account,
        // BrokerageCode,
        // BrokerageScheduleDataItemReady,
        // AccountDefaultBrokerageCode,
        // BrokerageCodeListReady,
        // LinkId,
        // Brokerage,
        ExpiryDate,
        // InstructionTime,
        Symbol,
        // SymbolPriceStepSegmentsDataItemReady,
        // Srn,
        // LocateReqd,
        // Algo,
        // VisibleQuantity,
        // MinimumQuantity,
        // Notes,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        OrderType,
        TriggerType,
        TriggerValue,
        // TriggerUnit,
        TriggerField,
        TriggerMovement,
        // Previewed,
        TotalQuantity,
        // OrigRequestId,
        // OrderGivenBy,
        // OrderGiversDataItemReady,
        // OrderTakenBy,
        LimitValue,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Side,
        // RoaNoAdvice,
        // RoaNotes,
        // SoaRequired,
        // RoaMethod,
        // RoaJustification,
        // RoaDeclarations,
        // RoaDeclarationDefinitionsDataItemReady,
        // Tax,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        TimeInForce,
        // CurrentOmsOrderId,
        // WorkOmsOrderId,
        // LoadedLeavesQuantity,
        // AccountTradePermissions,
        ExistingOrder,
        DestinationAccount,
    }

    export const enum PriceUnitId {
        Currency,
        CurrencyChange,
        Point,
        PointChange,
        Percent,
        PercentChange,
    }

    // export type TCalculatedBrokerageRequiredEvent = (valid: boolean, value: Decimal) => void;

    // export type TBeginChangesDelegate = () => void;
    // export type TEndChangesDelegate =  () => void;
    export type FieldsChangedEventHandler = (fields: FieldId[]) => void;

    export interface BrokerageCodeEntry {
        code: string;
        accountDefault: boolean;
        description: string;
    }

    export interface CancellableAccount {
        cancelled: boolean;
        account: Account | undefined;
    }

    // export function isCancellableAccount(value: CancellableAccount | Promise<CancellableAccount>): value is CancellableAccount {
    //     return value.hasOwnProperty('cancelled');
    // }

    export interface CancellableIvemSymbolDetails {
        cancelled: boolean;
        account: Account | undefined;
    }

    export type BrokerageCodeList = BrokerageCodeEntry[];

    export const minVisibleQuantity = 5000;
    export const minHiddenQuantity = 500000;
    export const myxNormalBaseQuantity = 100;
    export const defaultAllowedTriggerTypeIds = [OrderTriggerTypeId.Immediate];
    export const defaultAllowedSideIds = [SideId.Buy, SideId.Sell];
    export const defaultAllowedOrderTypeIds = OrderType.all;

    export const enum JsonName {
        RequestTypeId = 'requestTypeId',
        // eslint-disable-next-line @typescript-eslint/no-shadow
        OrderId = 'orderId',
        AccountId = 'accountId',
        LoadedExpiryDate = 'loadedExpiryDate',
        ExpiryDate = 'expiryDate',
        LoadedRoutedIvemId = 'loadedRoutedIvemId',
        // eslint-disable-next-line @typescript-eslint/no-shadow
        RoutedIvemId = 'routedIvemId',
        LoadedOrderTypeId = 'loadedOrderTypeId',
        // eslint-disable-next-line @typescript-eslint/no-shadow
        OrderTypeId = 'orderTypeId',
        LoadedTriggerTypeId = 'loadedTriggerTypeId',
        TriggerTypeId = 'triggerTypeId',
        LoadedTotalQuantity = 'loadedTotalQuantity',
        TotalQuantity = 'totalQuantity',
        LoadedLimitValue = 'loadedLimitValue',
        LimitValue = 'limitValue',
        LoadedSideId = 'loadedSideId',
        // eslint-disable-next-line @typescript-eslint/no-shadow
        SideId = 'sideId',
        LoadedTimeInForceId = 'loadedTimeInForceId',
        UserTimeInForceId = 'userTimeInForceId',
    }

    export function createFromJson(symbolsService: SymbolsService, adi: AdiService, orderPadJson: Json) {
        const result = new OrderPad(symbolsService, adi);
        result.loadFromJson(orderPadJson);
        return result;
    }

    export class Field {
        modified: boolean;
        statusId: Field.StatusId;
        statusReasonId: Field.StatusReasonId;

        constructor() {
            this.modified = false;
            this.statusId = Field.StatusId.Error;
            this.statusReasonId = Field.StatusReasonId.ValueRequired;
        }

        isDisabled() {
            return this.statusId === OrderPad.Field.StatusId.Disabled;
        }

        isValid() {
            switch (this.statusId) {
                case OrderPad.Field.StatusId.PrerequisiteFieldNotValid:
                case OrderPad.Field.StatusId.Waiting:
                case OrderPad.Field.StatusId.Error:
                    return false;
                case OrderPad.Field.StatusId.Disabled:
                case OrderPad.Field.StatusId.ReadOnlyOk:
                case OrderPad.Field.StatusId.ValueOk:
                    return true;
                default:
                    throw new UnreachableCaseError(`OPIV85564`, this.statusId);
            }
        }
        isOk() {
            switch (this.statusId) {
                case OrderPad.Field.StatusId.Disabled:
                case OrderPad.Field.StatusId.PrerequisiteFieldNotValid:
                case OrderPad.Field.StatusId.Waiting:
                case OrderPad.Field.StatusId.Error:
                    return false;
                case OrderPad.Field.StatusId.ReadOnlyOk:
                case OrderPad.Field.StatusId.ValueOk:
                    return true;
                default:
                    throw new UnreachableCaseError(`OPINEAO295376`, this.statusId);
            }
        }
        isModifiedAndOk() {
            switch (this.statusId) {
                case OrderPad.Field.StatusId.ReadOnlyOk:
                case OrderPad.Field.StatusId.Disabled:
                case OrderPad.Field.StatusId.PrerequisiteFieldNotValid:
                case OrderPad.Field.StatusId.Waiting:
                case OrderPad.Field.StatusId.Error:
                    return false;
                case OrderPad.Field.StatusId.ValueOk:
                    return this.modified;
                default:
                    throw new UnreachableCaseError(`OPIMAO588845`, this.statusId);
            }
        }
        isReadOnly() {
            return this.statusId === OrderPad.Field.StatusId.ReadOnlyOk;
        }
        isWriteable() {
            switch (this.statusId) {
                case OrderPad.Field.StatusId.ReadOnlyOk:
                case OrderPad.Field.StatusId.Disabled:
                    return false;
                default:
                    return true;
            }
        }
    }

    export namespace Field {
        export const enum StatusId {
            Disabled,
            PrerequisiteFieldNotValid,
            Waiting,
            Error,
            ReadOnlyOk,
            ValueOk
        }

        export const enum StatusReasonId {
            Unknown,
            Initial,
            ValueRequired,
            ValueNotRequired,
            OmsServiceNotOnline,
            NegativeValueNotAllowed,
            ZeroOrNegativeValueNotAllowed,
            InvalidQuantityForDestination,
            InvalidAccountId,
            AccountNoLongerAvailable,
            AccountFeedStatus_Initialising,
            AccountFeedStatus_Closed,
            AccountFeedStatus_Inactive,
            AccountFeedStatus_Impaired,
            AccountFeedStatus_Expired,
            IvemNotFound,
            WorkOrdersNotAllowed,
            ViewWorkOrdersNotAllowed,
            NotBackOfficeScreens,
            NotCanSelectBrokerage,
            Place,
            Amend,
            Cancel,
            Move,
            NotMove,
            Work,
            NotWork,
            Linked,
            NotIceberg,
            AmendLinked,
            AccountIdNotValid, //
            AccountDoesNotHaveDefaultBrokerageCode, //
            NotManualBrokerageCode,
            RetrievingAccount,
            BrokerageScheduleDataItemNotReady,
            BrokerageCodeListNotReady, //
            BrokerageCodeNotInSchedule,
            ForceWorkOrder,
            NotLimitOrderType,
            MarketAndStopOrderTypeAreAlwaysFillOrKill,
            RoaDeclarationDefinitionsDataItemNotReady,
            PriceNotOnStep,
            NotRoaEnabled,
            RoaNoAdvice,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            IvemId,
            TriggerType,
            TriggerTypeNotDefined,
            ImmediateTriggerType,
            SymbolPriceStepSegmentsDataItemNotReady,
            LeafSymbolSourceNotSupported,
            RootSymbolSourceNotSupported,
            SymbolsNotAvailable,
            RetrievingSymbolDetail,
            RetrieveSymbolDetailError,
            SymbolNotOk,
            RetrievePriceStepperError,
            RetrievingPriceStepper,
            PriceOrSegmentsNotAvailable,
            TradingNotPermissioned,
            AsxOrderAlgosNotPermissioned,
            StopOrderRequestsNotPermissioned,
            OrderTypeNotSpecified,
            AlgoNotSpecified,
            OnlySellStopAllowed,
            NotSupportedByOrderType,
            NotSupportedBySymbol,
            TimeInForceNotSpecified,
            TodayOrFutureDateRequired,
            TimeInForceDoesNotRequireDate,
            SymbolHasNoRoutes,
            RouteNotAvailableForSymbol,
            Snapshot,
            ValueOutOfRange,
            MyxSymbolIsMissingBoardLotSize,
            SideNotValid,
            BuyNotPermissioned,
            SellNotPermissioned,
            QuantityNotAMultiple,
            OrderNotFound,
            OrderCannotBeAmended,
            OrderCannotBeCancelled,
        }

        export type Id = FieldId;
        export const allIdArray = [
                FieldId.Account,
                // BrokerageCode,
                // BrokerageScheduleDataItemReady,
                // AccountDefaultBrokerageCode,
                // BrokerageCodeListReady,
                // LinkId,
                // Brokerage,
                FieldId.ExpiryDate,
                // InstructionTime,
                FieldId.Symbol,
                // SymbolPriceStepSegmentsDataItemReady,
                // Srn,
                // LocateReqd,
                // Algo,
                // VisibleQuantity,
                // MinimumQuantity,
                // Notes,
                FieldId.OrderType,
                FieldId.TriggerType,
                FieldId.TriggerValue,
                // TriggerUnit,
                FieldId.TriggerField,
                FieldId.TriggerMovement,
                // Previewed,
                FieldId.TotalQuantity,
                // OrigRequestId,
                // OrderGivenBy,
                // OrderGiversDataItemReady,
                // OrderTakenBy,
                FieldId.LimitValue,
                FieldId.Side,
                // RoaNoAdvice,
                // RoaNotes,
                // SoaRequired,
                // RoaMethod,
                // RoaJustification,
                // RoaDeclarations,
                // RoaDeclarationDefinitionsDataItemReady,
                // Tax,
                FieldId.TimeInForce,
                // CurrentOmsOrderId,
                // WorkOmsOrderId,
                // LoadedLeavesQuantity,
                // AccountTradePermissions,
                FieldId.ExistingOrder,
                FieldId.DestinationAccount,
            ];

        interface Info {
            id: Id;
            name: string;
            displayId: StringId;
            neverWriteable: boolean;
        }

        interface InitialiseInfo {
            id: Id;
            upperName: string;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            Account: {
                id: FieldId.Account,
                name: 'AccountId',
                displayId: StringId.OrderPadFieldDisplay_AccountId,
                neverWriteable: false,
            },
            // BrokerageCode: {
            //     id: FieldId.BrokerageCode,
            //     name: 'BrokerageCode',
            //     displayId: StringId.OrderPadFieldDisplay_BrokerageCode,
            //     neverWriteable: false,
            // },
            // BrokerageScheduleDataItemReady: {
            //     id: FieldId.BrokerageScheduleDataItemReady,
            //     name: 'BrokerageScheduleDataItemReady',
            //     displayId: StringId.OrderPadFieldDisplay_BrokerageScheduleDataItemReady,
            //     neverWriteable: true,
            // },
            // AccountDefaultBrokerageCode: {
            //     id: FieldId.AccountDefaultBrokerageCode,
            //     name: 'AccountDefaultBrokerageCode',
            //     displayId: StringId.OrderPadFieldDisplay_AccountDefaultBrokerageCode,
            //     neverWriteable: true,
            // },
            // BrokerageCodeListReady: {
            //     id: FieldId.BrokerageCodeListReady,
            //     name: 'BrokerageCodeListReady',
            //     displayId: StringId.OrderPadFieldDisplay_BrokerageCodeListReady,
            //     neverWriteable: true,
            // },
            // LinkId: {
            //     id: FieldId.LinkId,
            //     name: 'LinkId',
            //     displayId: StringId.OrderPadFieldDisplay_LinkId,
            //     neverWriteable: false,
            // },
            // Brokerage: {
            //     id: FieldId.Brokerage,
            //     name: 'Brokerage',
            //     displayId: StringId.OrderPadFieldDisplay_Brokerage,
            //     neverWriteable: false,
            // },
            ExpiryDate: {
                id: FieldId.ExpiryDate,
                name: 'ExpiryDate',
                displayId: StringId.OrderPadFieldDisplay_ExpiryDate,
                neverWriteable: true,
            },
            // InstructionTime: {
            //     id: FieldId.InstructionTime,
            //     name: 'InstructionTime',
            //     displayId: StringId.OrderPadFieldDisplay_InstructionTime,
            //     neverWriteable: true,
            // },
            Symbol: {
                id: FieldId.Symbol,
                name: 'Symbol',
                displayId: StringId.OrderPadFieldDisplay_SymbolAndSource,
                neverWriteable: false,
            },
            // SymbolPriceStepSegmentsDataItemReady: {
            //     id: FieldId.SymbolPriceStepSegmentsDataItemReady,
            //     name: 'SymbolPriceStepSegmentsDataItemReady',
            //     displayId: StringId.OrderPadFieldDisplay_SymbolPriceStepSegmentsDataItemReady,
            //     neverWriteable: true,
            // },
            // Srn: {
            //     id: FieldId.Srn,
            //     name: 'Srn',
            //     displayId: StringId.OrderPadFieldDisplay_Srn,
            //     neverWriteable: false,
            // },
            // LocateReqd: {
            //     id: FieldId.LocateReqd,
            //     name: 'LocateReqd',
            //     displayId: StringId.OrderPadFieldDisplay_LocateReqd,
            //     neverWriteable: true,
            // },
            // Algo: {
            //     id: FieldId.Algo,
            //     name: 'Algo',
            //     displayId: StringId.OrderPadFieldDisplay_Algo,
            //     neverWriteable: false,
            // },
            // VisibleQuantity: {
            //     id: FieldId.VisibleQuantity,
            //     name: 'VisibleQuantity',
            //     displayId: StringId.OrderPadFieldDisplay_VisibleQuantity,
            //     neverWriteable: false,
            // },
            // MinimumQuantity: {
            //     id: FieldId.MinimumQuantity,
            //     name: 'MinimumQuantity',
            //     displayId: StringId.OrderPadFieldDisplay_MinimumQuantity,
            //     neverWriteable: false,
            // },
            // Notes: {
            //     id: FieldId.Notes,
            //     name: 'ExecutionInstructions',
            //     displayId: StringId.OrderPadFieldDisplay_ExecutionInstructions,
            //     neverWriteable: false,
            // },
            OrderType: {
                id: FieldId.OrderType,
                name: 'OrderType',
                displayId: StringId.OrderPadFieldDisplay_OrderType,
                neverWriteable: false,
            },
            TriggerType: {
                id: FieldId.TriggerType,
                name: 'TriggerTypeId',
                displayId: StringId.OrderPadFieldDisplay_TriggerTypeId,
                neverWriteable: false,
            },
            TriggerValue: {
                id: FieldId.TriggerValue,
                name: 'TriggerValue',
                displayId: StringId.OrderPadFieldDisplay_TriggerValue,
                neverWriteable: false,
            },
            // TriggerUnit: {
            //     id: FieldId.TriggerUnit,
            //     name: 'TriggerUnit',
            //     displayId: StringId.OrderPadFieldDisplay_TriggerUnit,
            //     neverWriteable: false,
            // },
            TriggerField: {
                id: FieldId.TriggerField,
                name: 'TriggerField',
                displayId: StringId.OrderPadFieldDisplay_TriggerField,
                neverWriteable: false,
            },
            TriggerMovement: {
                id: FieldId.TriggerMovement,
                name: 'TriggerMovement',
                displayId: StringId.OrderPadFieldDisplay_TriggerMovement,
                neverWriteable: false,
            },
            // Previewed: {
            //     id: FieldId.Previewed,
            //     name: 'Previewed',
            //     displayId: StringId.OrderPadFieldDisplay_Previewed,
            //     neverWriteable: true,
            // },
            TotalQuantity: {
                id: FieldId.TotalQuantity,
                name: 'TotalQuantity',
                displayId: StringId.OrderPadFieldDisplay_TotalQuantity,
                neverWriteable: false,
            },
            // OrigRequestId: {
            //     id: FieldId.OrigRequestId,
            //     name: 'OrigRequestId',
            //     displayId: StringId.OrderPadFieldDisplay_OrigRequestId,
            //     neverWriteable: false,
            // },
            // OrderGivenBy: {
            //     id: FieldId.OrderGivenBy,
            //     name: 'OrderGivenBy',
            //     displayId: StringId.OrderPadFieldDisplay_OrderGivenBy,
            //     neverWriteable: false,
            // },
            // OrderGiversDataItemReady: {
            //     id: FieldId.OrderGiversDataItemReady,
            //     name: 'OrderGiversDataItemReady',
            //     displayId: StringId.OrderPadFieldDisplay_OrderGiversDataItemReady,
            //     neverWriteable: true,
            // },
            // OrderTakenBy: {
            //     id: FieldId.OrderTakenBy,
            //     name: 'OrderTakenBy',
            //     displayId: StringId.OrderPadFieldDisplay_OrderTakenBy,
            //     neverWriteable: false,
            // },
            LimitValue: {
                id: FieldId.LimitValue,
                name: 'LimitValue',
                displayId: StringId.OrderPadFieldDisplay_LimitValue,
                neverWriteable: false,
            },
            Side: {
                id: FieldId.Side,
                name: 'Side',
                displayId: StringId.OrderPadFieldDisplay_Side,
                neverWriteable: false,
            },
            // RoaNoAdvice: {
            //     id: FieldId.RoaNoAdvice,
            //     name: 'RoaNoAdvice',
            //     displayId: StringId.OrderPadFieldDisplay_RoaNoAdvice,
            //     neverWriteable: false,
            // },
            // RoaNotes: {
            //     id: FieldId.RoaNotes,
            //     name: 'RoaNotes',
            //     displayId: StringId.OrderPadFieldDisplay_RoaNotes,
            //     neverWriteable: false,
            // },
            // SoaRequired: {
            //     id: FieldId.SoaRequired,
            //     name: 'SoaRequired',
            //     displayId: StringId.OrderPadFieldDisplay_SoaRequired,
            //     neverWriteable: false,
            // },
            // RoaMethod: {
            //     id: FieldId.RoaMethod,
            //     name: 'RoaMethod',
            //     displayId: StringId.OrderPadFieldDisplay_RoaMethod,
            //     neverWriteable: false,
            // },
            // RoaJustification: {
            //     id: FieldId.RoaJustification,
            //     name: 'RoaJustification',
            //     displayId: StringId.OrderPadFieldDisplay_RoaJustification,
            //     neverWriteable: false,
            // },
            // RoaDeclarations: {
            //     id: FieldId.RoaDeclarations,
            //     name: 'RoaDeclarations',
            //     displayId: StringId.OrderPadFieldDisplay_RoaDeclarations,
            //     neverWriteable: false,
            // },
            // RoaDeclarationDefinitionsDataItemReady: {
            //     id: FieldId.RoaDeclarationDefinitionsDataItemReady,
            //     name: 'RoaDeclarationDefinitionsDataItemReady',
            //     displayId: StringId.OrderPadFieldDisplay_RoaDeclarationDefinitionsDataItemReady,
            //     neverWriteable: false,
            // },
            // Tax: {
            //     id: FieldId.Tax,
            //     name: 'Tax',
            //     displayId: StringId.OrderPadFieldDisplay_Tax,
            //     neverWriteable: true,
            // },
            TimeInForce: {
                id: FieldId.TimeInForce,
                name: 'TimeInForce',
                displayId: StringId.OrderPadFieldDisplay_TimeInForce,
                neverWriteable: false,
            },
            // CurrentOmsOrderId: {
            //     id: FieldId.CurrentOmsOrderId,
            //     name: 'CurrentOmsOrderId',
            //     displayId: StringId.OrderPadFieldDisplay_CurrentOmsOrderId,
            //     neverWriteable: true,
            // },
            // WorkOmsOrderId: {
            //     id: FieldId.WorkOmsOrderId,
            //     name: 'WorkOmsOrderId',
            //     displayId: StringId.OrderPadFieldDisplay_WorkOmsOrderId,
            //     neverWriteable: true,
            // },
            // LoadedLeavesQuantity: {
            //     id: FieldId.LoadedLeavesQuantity,
            //     name: 'LoadedLeavesQuantity',
            //     displayId: StringId.OrderPadFieldDisplay_LoadedLeavesQuantity,
            //     neverWriteable: true,
            // },
            // AccountTradePermissions: {
            //     id: FieldId.AccountTradePermissions,
            //     name: 'AccountTradePermissions',
            //     displayId: StringId.OrderPadFieldDisplay_AccountTradePermissions,
            //     neverWriteable: true,
            // },
            ExistingOrder: {
                id: FieldId.ExistingOrder,
                name: 'ExistingOrder',
                displayId: StringId.OrderPadFieldDisplay_ExistingOrderId,
                neverWriteable: true, // change to false when can check
            },
            DestinationAccount: {
                id: FieldId.DestinationAccount,
                name: 'DestinationAccount',
                displayId: StringId.OrderPadFieldDisplay_DestinationAccount,
                neverWriteable: false, // change to false when can check
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        const initialiseInfos = new Array<InitialiseInfo>(idCount);

        // eslint-disable-next-line @typescript-eslint/no-shadow

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function tryNameToId(name: string): Id | undefined {
            const upperName = name.toUpperCase();
            for (const info of initialiseInfos) {
                if (info.upperName === upperName) {
                    return info.id;
                }
            }
            return undefined;
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }

        export namespace StatusReason {
            export type SrId = StatusReasonId;

            interface SrInfo {
                id: SrId;
                descriptionId: StringId;
            }

            type SrInfosObject = { [id in keyof typeof StatusReasonId]: SrInfo };

            const srInfosObject: SrInfosObject = {
                Unknown: {
                    id: StatusReasonId.Unknown,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Unknown,
                },
                Initial: {
                    id: StatusReasonId.Initial,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Initial,
                },
                ValueRequired: {
                    id: StatusReasonId.ValueRequired,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_ValueRequired,
                },
                ValueNotRequired: {
                    id: StatusReasonId.ValueNotRequired,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_ValueNotRequired,
                },
                OmsServiceNotOnline: {
                    id: StatusReasonId.OmsServiceNotOnline,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_OmsServiceNotOnline,
                },
                NegativeValueNotAllowed: {
                    id: StatusReasonId.NegativeValueNotAllowed,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NegativeValueNotAllowed,
                },
                ZeroOrNegativeValueNotAllowed: {
                    id: StatusReasonId.ZeroOrNegativeValueNotAllowed,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_ZeroOrNegativeValueNotAllowed,
                },
                InvalidQuantityForDestination: {
                    id: StatusReasonId.InvalidQuantityForDestination,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_InvalidQuantityForDestination,
                },
                InvalidAccountId: {
                    id: StatusReasonId.InvalidAccountId,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_InvalidAccountId,
                },
                AccountNoLongerAvailable: {
                    id: StatusReasonId.AccountNoLongerAvailable,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AccountNoLongerAvailable,
                },
                AccountFeedStatus_Initialising: {
                    id: StatusReasonId.AccountFeedStatus_Initialising,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Initialising,
                },
                AccountFeedStatus_Closed: {
                    id: StatusReasonId.AccountFeedStatus_Closed,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Closed,
                },
                AccountFeedStatus_Inactive: {
                    id: StatusReasonId.AccountFeedStatus_Inactive,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Inactive,
                },
                AccountFeedStatus_Impaired: {
                    id: StatusReasonId.AccountFeedStatus_Impaired,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Impaired,
                },
                AccountFeedStatus_Expired: {
                    id: StatusReasonId.AccountFeedStatus_Expired,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Expired,
                },
                IvemNotFound: {
                    id: StatusReasonId.IvemNotFound,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_SymbolNotFound,
                },
                WorkOrdersNotAllowed: {
                    id: StatusReasonId.WorkOrdersNotAllowed,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_WorkOrdersNotAllowed,
                },
                ViewWorkOrdersNotAllowed: {
                    id: StatusReasonId.ViewWorkOrdersNotAllowed,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_ViewWorkOrdersNotAllowed,
                },
                NotBackOfficeScreens: {
                    id: StatusReasonId.NotBackOfficeScreens,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotBackOfficeScreens,
                },
                NotCanSelectBrokerage: {
                    id: StatusReasonId.NotCanSelectBrokerage,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotCanSelectBrokerage,
                },
                Place: {
                    id: StatusReasonId.Place,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Place,
                },
                Amend: {
                    id: StatusReasonId.Amend,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Amend,
                },
                Cancel: {
                    id: StatusReasonId.Cancel,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Cancel,
                },
                Move: {
                    id: StatusReasonId.Move,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Move,
                },
                NotMove: {
                    id: StatusReasonId.NotMove,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotMove,
                },
                Work: {
                    id: StatusReasonId.Work,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Work,
                },
                NotWork: {
                    id: StatusReasonId.NotWork,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotWork,
                },
                Linked: {
                    id: StatusReasonId.Linked,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Linked,
                },
                NotIceberg: {
                    id: StatusReasonId.NotIceberg,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotIceberg,
                },
                AmendLinked: {
                    id: StatusReasonId.AmendLinked,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AmendLinked,
                },
                AccountIdNotValid: {
                    id: StatusReasonId.AccountIdNotValid,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AccountIdNotValid,
                },
                AccountDoesNotHaveDefaultBrokerageCode: {
                    id: StatusReasonId.AccountDoesNotHaveDefaultBrokerageCode,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AccountDoesNotHaveDefaultBrokerageCode,
                },
                NotManualBrokerageCode: {
                    id: StatusReasonId.NotManualBrokerageCode,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotManualBrokerageCode,
                },
                RetrievingAccount: {
                    id: StatusReasonId.RetrievingAccount,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RetrievingAccount,
                },
                BrokerageScheduleDataItemNotReady: {
                    id: StatusReasonId.BrokerageScheduleDataItemNotReady,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_BrokerageScheduleDataItemNotReady,
                },
                BrokerageCodeListNotReady: {
                    id: StatusReasonId.BrokerageCodeListNotReady,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_BrokerageCodeListNotReady,
                },
                BrokerageCodeNotInSchedule: {
                    id: StatusReasonId.BrokerageCodeNotInSchedule,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_BrokerageCodeNotInSchedule,
                },
                ForceWorkOrder: {
                    id: StatusReasonId.ForceWorkOrder,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_ForceWorkOrder,
                },
                NotLimitOrderType: {
                    id: StatusReasonId.NotLimitOrderType,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotLimitOrderType,
                },
                MarketAndStopOrderTypeAreAlwaysFillOrKill: {
                    id: StatusReasonId.MarketAndStopOrderTypeAreAlwaysFillOrKill,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_MarketAndStopOrderTypeAreAlwaysFillOrKill,
                },
                RoaDeclarationDefinitionsDataItemNotReady: {
                    id: StatusReasonId.RoaDeclarationDefinitionsDataItemNotReady,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RoaDeclarationDefinitionsDataItemNotReady,
                },
                PriceNotOnStep: {
                    id: StatusReasonId.PriceNotOnStep,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_PriceNotOnStep,
                },
                NotRoaEnabled: {
                    id: StatusReasonId.NotRoaEnabled,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotRoaEnabled,
                },
                RoaNoAdvice: {
                    id: StatusReasonId.RoaNoAdvice,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RoaNoAdvice,
                },
                IvemId: {
                    id: StatusReasonId.IvemId,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_IvemId,
                },
                TriggerType: {
                    id: StatusReasonId.TriggerType,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_TriggerType,
                },
                TriggerTypeNotDefined: {
                    id: StatusReasonId.TriggerTypeNotDefined,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_TriggerTypeNotDefined,
                },
                ImmediateTriggerType: {
                    id: StatusReasonId.ImmediateTriggerType,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_ImmediateTriggerType,
                },
                SymbolPriceStepSegmentsDataItemNotReady: {
                    id: StatusReasonId.SymbolPriceStepSegmentsDataItemNotReady,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_SymbolPriceStepSegmentsDataItemNotReady,
                },
                LeafSymbolSourceNotSupported: {
                    id: StatusReasonId.LeafSymbolSourceNotSupported,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_LeafSymbolSourceNotSupported,
                },
                RootSymbolSourceNotSupported: {
                    id: StatusReasonId.RootSymbolSourceNotSupported,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RootSymbolSourceNotSupported,
                },
                SymbolsNotAvailable: {
                    id: StatusReasonId.SymbolsNotAvailable,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_SymbolsNotAvailable,
                },
                RetrievingSymbolDetail: {
                    id: StatusReasonId.RetrievingSymbolDetail,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RetrievingSymbolDetail,
                },
                RetrieveSymbolDetailError: {
                    id: StatusReasonId.RetrieveSymbolDetailError,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RetrievingSymbolDetail,
                },
                SymbolNotOk: {
                    id: StatusReasonId.SymbolNotOk,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_SymbolNotOk,
                },
                RetrievePriceStepperError: {
                    id: StatusReasonId.RetrievePriceStepperError,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RetrievePriceStepperError,
                },
                RetrievingPriceStepper: {
                    id: StatusReasonId.RetrievingPriceStepper,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RetrievingPriceStepper,
                },
                PriceOrSegmentsNotAvailable: {
                    id: StatusReasonId.PriceOrSegmentsNotAvailable,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_PriceOrSegmentsNotAvailable,
                },
                TradingNotPermissioned: {
                    id: StatusReasonId.TradingNotPermissioned,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_TradingNotPermissioned,
                },
                AsxOrderAlgosNotPermissioned: {
                    id: StatusReasonId.AsxOrderAlgosNotPermissioned,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AsxOrderAlgosNotPermissioned,
                },
                StopOrderRequestsNotPermissioned: {
                    id: StatusReasonId.StopOrderRequestsNotPermissioned,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_StopOrderRequestsNotPermissioned,
                },
                OrderTypeNotSpecified: {
                    id: StatusReasonId.OrderTypeNotSpecified,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_OrderTypeNotSpecified,
                },
                AlgoNotSpecified: {
                    id: StatusReasonId.AlgoNotSpecified,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_AlgoNotSpecified,
                },
                OnlySellStopAllowed: {
                    id: StatusReasonId.OnlySellStopAllowed,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_OnlySellStopAllowed,
                },
                NotSupportedByOrderType: {
                    id: StatusReasonId.NotSupportedByOrderType,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotSupportedByOrderType,
                },
                NotSupportedBySymbol: {
                    id: StatusReasonId.NotSupportedBySymbol,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_NotSupportedBySymbol,
                },
                TimeInForceNotSpecified: {
                    id: StatusReasonId.TimeInForceNotSpecified,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_TimeInForceNotSpecified,
                },
                TodayOrFutureDateRequired: {
                    id: StatusReasonId.TodayOrFutureDateRequired,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_TodayOrFutureDateRequired,
                },
                TimeInForceDoesNotRequireDate: {
                    id: StatusReasonId.TimeInForceDoesNotRequireDate,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_TimeInForceDoesNotRequireDate,
                },
                SymbolHasNoRoutes: {
                    id: StatusReasonId.SymbolHasNoRoutes,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_SymbolHasNoRoutes,
                },
                RouteNotAvailableForSymbol: {
                    id: StatusReasonId.RouteNotAvailableForSymbol,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_RouteNotAvailableForSymbol,
                },
                Snapshot: {
                    id: StatusReasonId.Snapshot,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_Snapshot,
                },
                ValueOutOfRange: {
                    id: StatusReasonId.ValueOutOfRange,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_ValueOutOfRange,
                },
                MyxSymbolIsMissingBoardLotSize: {
                    id: StatusReasonId.MyxSymbolIsMissingBoardLotSize,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_MyxSymbolIsMissingBoardLotSize,
                },
                SideNotValid: {
                    id: StatusReasonId.SideNotValid,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_SideNotValid,
                },
                BuyNotPermissioned: {
                    id: StatusReasonId.BuyNotPermissioned,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_BuyNotPermissioned,
                },
                SellNotPermissioned: {
                    id: StatusReasonId.SellNotPermissioned,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_SellNotPermissioned,
                },
                QuantityNotAMultiple: {
                    id: StatusReasonId.QuantityNotAMultiple,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_QuantityNotAMultiple,
                },
                OrderNotFound: {
                    id: StatusReasonId.OrderNotFound,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_OrderNotFound,
                },
                OrderCannotBeAmended: {
                    id: StatusReasonId.OrderCannotBeAmended,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_OrderCannotBeAmended,
                },
                OrderCannotBeCancelled: {
                    id: StatusReasonId.OrderCannotBeCancelled,
                    descriptionId: StringId.OrderPadFieldStatusReasonDescription_OrderCannotBeCancelled,
                },
            };

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export const idCount = Object.keys(srInfosObject).length;
            const srInfos = Object.values(srInfosObject);

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function initialise() {
                for (let id = 0; id < idCount; id++) {
                    const info = srInfos[id];
                    if (info.id !== id) {
                        throw new EnumInfoOutOfOrderError('OrderPad.Field', id, idToDescription(id));
                    }
                }
            }

            export function idToDescriptionId(id: SrId): StringId {
                return srInfos[id].descriptionId;
            }

            export function idToDescription(id: SrId): string {
                return Strings[idToDescriptionId(id)];
            }
        }

        export function initialiseField() {
            StatusReason.initialise();

            for (let id = 0; id < idCount; id++) {
                const info = infos[id];
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('OrderPad.Field', id, info.name);
                } else {
                    const initialiseInfo = {
                        id,
                        upperName: info.name.toUpperCase(),
                    };
                    initialiseInfos[id] = initialiseInfo;
                }
            }
        }
    }

    export namespace PriceUnit {
        export type Id = PriceUnitId;
        export const all = [
            PriceUnitId.Currency,
            PriceUnitId.CurrencyChange,
            PriceUnitId.Point,
            PriceUnitId.PointChange,
            PriceUnitId.Percent,
            PriceUnitId.PercentChange,
        ];
    }


    export function initialise() {
        Field.initialiseField();
    }
}

export namespace OrderPadModule {
    export function initialiseStatic() {
        OrderPad.initialise();
    }
}
