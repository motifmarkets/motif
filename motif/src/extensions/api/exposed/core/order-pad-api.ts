/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// import { Order, OrderTriggerTypeId, RoutedIvemId, SideId } from 'src/adi/internal-api';
// import { BrokerageAccountId, OrderRequestTypeId } from './data-types-api';

// export interface OrderPad {
//     readonly readonly: boolean;
//     readonly sent: boolean;

//     readonly requestTypeId: OrderRequestTypeId;

//     accountId: BrokerageAccountId | undefined;
//     readonly account: BrokerageAccount | undefined;

//     sideId: SideId | undefined;
//     readonly allowedSideIds: readonly SideId[];

//     routedIvemId: RoutedIvemId | undefined;
//     readonly allowedRoutes: readonly Routes[];
//     expiryDate: Date | undefined;
//     orderTypeId: OrderTypeId | undefined;
//     triggerTypeId: OrderTriggerTypeId | undefined;
//     readonly allowedTriggerTypeIds: readonly OrderTriggerTypeId[];
//     totalQuantity: Integer | undefined;
//     limitValue: Decimal | undefined;

//     timeInForceId: OrderTimeInForceId | undefined;
//     readonly allowedTimeInForceIds: readonly OrderTimeInForceId[];
//     existingOrderId: OrderId | undefined;
//     existingOrder: Order | undefined;
//     destinationAccountId: BrokerageAccountId | undefined;
//     destinationAccount: BrokerageAccount | undefined;

//     beginChanges(): void;
//     endChanges(): void;
//     setRoute(value: OrderRoute): void;

//     createOrderRequestDefinition(): OrderRequestDefinition;
// }


// export namespace OrderPad {
//     export const enum FieldId {
//         Account,
//         ExpiryDate,
//         Symbol,
//         OrderType,
//         TriggerType,
//         TotalQuantity,
//         LimitValue,
//         Side,
//         TimeInForce,
//         ExistingOrder,
//         DestinationAccount,
//     }

//     export namespace Field {
//         export const enum StatusId {
//             Disabled,
//             PrerequisiteFieldNotValid,
//             Waiting,
//             Error,
//             ReadOnlyOk,
//             ValueOk
//         }

//         export const enum StatusReasonId {
//             Unknown,
//             Initial,
//             ValueRequired,
//             ValueNotRequired,
//             OmsServiceNotOnline,
//             NegativeValueNotAllowed,
//             ZeroOrNegativeValueNotAllowed,
//             InvalidQuantityForDestination,
//             InvalidAccountId,
//             AccountNoLongerAvailable,
//             AccountFeedStatus_Initialising,
//             AccountFeedStatus_Closed,
//             AccountFeedStatus_Inactive,
//             AccountFeedStatus_Impaired,
//             AccountFeedStatus_Expired,
//             IvemNotFound,
//             WorkOrdersNotAllowed,
//             ViewWorkOrdersNotAllowed,
//             NotBackOfficeScreens,
//             NotCanSelectBrokerage,
//             Place,
//             Amend,
//             Cancel,
//             Move,
//             NotMove,
//             Work,
//             NotWork,
//             Linked,
//             NotIceberg,
//             AmendLinked,
//             AccountIdNotValid, //
//             AccountDoesNotHaveDefaultBrokerageCode, //
//             NotManualBrokerageCode,
//             RetrievingAccount,
//             BrokerageScheduleDataItemNotReady,
//             BrokerageCodeListNotReady, //
//             BrokerageCodeNotInSchedule,
//             ForceWorkOrder,
//             NotLimitOrderType,
//             NotStopTriggerType,
//             MarketAndStopOrderTypeAreAlwaysFillOrKill,
//             RoaDeclarationDefinitionsDataItemNotReady,
//             PriceNotOnStep,
//             NotRoaEnabled,
//             RoaNoAdvice,
//             IvemId,
//             TriggerType,
//             SymbolPriceStepSegmentsDataItemNotReady,
//             LeafSymbolSourceNotSupported,
//             RootSymbolSourceNotSupported,
//             SymbolsNotAvailable,
//             RetrievingSymbolDetail,
//             RetrieveSymbolDetailError,
//             SymbolNotOk,
//             RetrievePriceStepperError,
//             RetrievingPriceStepper,
//             PriceOrSegmentsNotAvailable,
//             TradingNotPermissioned,
//             AsxOrderAlgosNotPermissioned,
//             StopOrderRequestsNotPermissioned,
//             OrderTypeNotSpecified,
//             AlgoNotSpecified,
//             OnlySellStopAllowed,
//             NotSupportedByOrderType,
//             NotSupportedBySymbol,
//             TimeInForceNotSpecified,
//             TodayOrFutureDateRequired,
//             TimeInForceDoesNotRequireDate,
//             SymbolHasNoRoutes,
//             RouteNotAvailableForSymbol,
//             Snapshot,
//             ValueOutOfRange,
//             MyxSymbolIsMissingBoardLotSize,
//             SideNotValid,
//             BuyNotPermissioned,
//             SellNotPermissioned,
//             QuantityNotAMultiple,
//             OrderNotFound,
//             OrderCannotBeAmended,
//             OrderCannotBeCancelled,
//         }
//     }

//     export type FieldsChangedEvent = (this: void, fields: FieldId[]) => void;
// }
