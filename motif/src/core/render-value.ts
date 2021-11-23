/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import {
    BidAskSideId, DayTradesDataItem, HigherLowerId, IvemId, LitIvemId, MarketId,

    MovementId, OrderStatus, RoutedIvemId, SideId,
    TradeAffectsId,
    TradeFlagId
} from 'src/adi/internal-api';
import {
    CorrectnessId,
    Integer,
    newUndefinableDecimal,
    PriceOrRemainder,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime
} from 'src/sys/internal-api';
import { DepthRecord } from './depth-record';
import { ColorSettings } from './settings/color-settings';

export abstract class RenderValue {
    formattedText: string;

    private _attributes: RenderValue.Attribute[] = [];

    constructor(private _typeId: RenderValue.TypeId) { }

    get typeId() { return this._typeId; }
    get attributes() { return this._attributes; }

    addAttribute(value: RenderValue.Attribute) { this._attributes.push(value); }
    setAttributes(value: RenderValue.Attribute[]) { this._attributes = value; }

    protected assign(other: RenderValue) {
        this._attributes = other._attributes;
        this.formattedText = other.formattedText;
    }

    abstract isUndefined(): boolean;
}

export namespace RenderValue {
    export const enum TypeId {
        // eslint-disable-next-line id-blacklist
        String,
        // eslint-disable-next-line id-blacklist
        Number,
        Percentage,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Integer,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Decimal,
        Price,
        Date,
        DateTime,
        Time,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        SourceTzOffsetDateTime,
        SourceTzOffsetDateTimeDate,
        SourceTzOffsetDateTimeTime,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        SourceTzOffsetDate,
        Color,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        IvemId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        LitIvemId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        RoutedIvemId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        PriceOrRemainder,
        // Boolean
        IsIndex,
        Undisclosed,
        IsReadable,
        PhysicalDelivery,
        // Enum
        TradingStateReasonId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        MarketId,
        TrendId,
        ColorSettingsItemStateId,
        TradeAffectsIdArray,
        ExchangeId,
        CallOrPutId,
        ExerciseTypeId,
        MarketBoardId,
        FeedStatusId,
        FeedClassId,
        CurrencyId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        SideId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        BidAskSideId,
        EquityOrderTypeId,
        TimeInForceId,
        OrderPriceUnitTypeId,
        OrderRouteAlgorithmId,
        OrderTriggerTypeId,
        GridOrderTriggerTypeId,
        TrailingStopLossOrderConditionTypeId,
        ExchangeEnvironmentId,
        IvemClassId,
        DepthDirectionId,
        MarketClassificationIdMyxLitIvemAttribute,
        DeliveryBasisIdMyxLitIvemAttribute,
        DayTradesDataItemRecordTypeId,

        // Array
        StringArray,
        IntegerArray,
        MarketBoardIdArray,
        ZenithSubscriptionDataIdArray,
        TradeFlagIdArray,
        TradingStateAllowIdArray,
        MarketIdArray,
        OrderStatusAllowIdArray,
        OrderStatusReasonIdArray,
        ShortSellTypeIdArrayMyxLitIvemAttribute,

        // Composite
        PriceAndHasUndisclosed,
        PriceOrRemainderAndHasUndisclosed,
        CountAndXrefs,
    }

    export const enum AttributeId {
        Correctness,
        HigherLower,
        BackgroundColor,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        DepthRecord,
        DepthCountXRefField,
        DepthRecordInAuction,
        GreyedOut,
        Cancelled,
        Canceller,
        OwnOrder,
    }

    export interface Attribute {
        readonly id: AttributeId;
    }

    export namespace Attribute {

    }

    export interface CorrectnessAttribute extends Attribute {
        readonly id: AttributeId.Correctness;
        correctnessId: CorrectnessId;
    }

    export namespace DataCorrectnessAttribute {
        export const suspect: CorrectnessAttribute = {
            id: AttributeId.Correctness,
            correctnessId: CorrectnessId.Suspect
        };

        export const error: CorrectnessAttribute = {
            id: AttributeId.Correctness,
            correctnessId: CorrectnessId.Suspect
        };
    }

    export interface HigherLowerAttribute extends Attribute {
        readonly id: AttributeId.HigherLower;
        higherLowerId: HigherLowerId;
    }

    export namespace HigherLowerAttribute {
        export const higher: HigherLowerAttribute = {
            id: AttributeId.HigherLower,
            higherLowerId: HigherLowerId.Higher
        };

        export const lower: HigherLowerAttribute = {
            id: AttributeId.HigherLower,
            higherLowerId: HigherLowerId.Lower
        };
    }

    export const backgroundColorAttribute: Attribute = {
        id: AttributeId.BackgroundColor
    };

    export interface DepthRecordAttribute extends Attribute {
        readonly id: AttributeId.DepthRecord;
        bidAskSideId: BidAskSideId;
        depthRecordTypeId: DepthRecord.TypeId;
        ownOrder: boolean;
    }

    export interface DepthCountXRefFieldAttribute extends Attribute {
        readonly id: AttributeId.DepthCountXRefField;
        isCountAndXrefs: boolean;
    }

    export namespace DepthCountXRefFieldAttribute {
        export const countAndXrefs: DepthCountXRefFieldAttribute = {
            id: AttributeId.DepthCountXRefField,
            isCountAndXrefs: true,
        };

        export const xref: DepthCountXRefFieldAttribute = {
            id: AttributeId.DepthCountXRefField,
            isCountAndXrefs: false,
        };
    }

    export interface DepthRecordInAuctionAttribute extends Attribute {
        readonly id: AttributeId.DepthRecordInAuction;
        partialAuctionProportion: number | undefined;
    }

    export interface GreyedOutAttribute extends Attribute {
        readonly id: AttributeId.GreyedOut;
    }

    export interface CancelledAttribute extends Attribute {
        readonly id: AttributeId.Cancelled;
    }

    export const cancelledAttribute: CancelledAttribute = {
        id: AttributeId.Cancelled
    };

    export interface CancellerAttribute extends Attribute {
        readonly id: AttributeId.Canceller;
    }

    export const cancellerAttribute: CancellerAttribute = {
        id: AttributeId.Canceller
    };

    export interface OwnOrderAttribute extends Attribute {
        readonly id: AttributeId.OwnOrder;
    }

    export const ownOrderAttribute: OwnOrderAttribute = {
        id: AttributeId.OwnOrder
    };
}

abstract class GenericRenderValue<T> extends RenderValue {
    private readonly _data: T;
    constructor(data: T | undefined, typeId: RenderValue.TypeId) {
        super(typeId);
        if (data !== undefined) {
            this._data = data;
        }
    }

    get definedData() { return this._data; }

    isUndefined() {
        return this._data === undefined;
    }

    // get data() { return this._data; }
    // set data(value: T | undefined) {
    //     this._data = value;
    //     if (value !== undefined) {
    //         this._definedData = value;
    //     }
    // }
}

export class StringRenderValue extends GenericRenderValue<string> {
    constructor(data: string | undefined) {
        super(data, RenderValue.TypeId.String);
    }
}

export class NumberRenderValue extends GenericRenderValue<number> {
    constructor(data: number | undefined) {
        super(data, RenderValue.TypeId.Number);
    }
}

export class PercentageRenderValue extends GenericRenderValue<number> {
    constructor(data: number | undefined) {
        super(data, RenderValue.TypeId.Percentage);
    }
}

export class IntegerRenderValue extends GenericRenderValue<Integer> {
    constructor(data: Integer | undefined) {
        super(data, RenderValue.TypeId.Integer);
    }
}

export class DateRenderValue extends GenericRenderValue<Date> {
    constructor(data: Date | undefined) {
        super(data, RenderValue.TypeId.Date);
    }
}

export class DateTimeRenderValue extends GenericRenderValue<Date> {
    constructor(data: Date | undefined) {
        super(data, RenderValue.TypeId.Time);
    }
}

export class TimeRenderValue extends GenericRenderValue<Date> {
    constructor(data: Date | undefined) {
        super(data, RenderValue.TypeId.Time);
    }
}

export class SourceTzOffsetDateTimeRenderValue extends GenericRenderValue<SourceTzOffsetDateTime> {
    constructor(data: SourceTzOffsetDateTime | undefined) {
        super(data, RenderValue.TypeId.SourceTzOffsetDateTime);
    }
}

export class SourceTzOffsetDateTimeDateRenderValue extends GenericRenderValue<SourceTzOffsetDateTime> {
    constructor(data: SourceTzOffsetDateTime | undefined) {
        super(data, RenderValue.TypeId.SourceTzOffsetDateTimeDate);
    }
}

export class SourceTzOffsetDateTimeTimeRenderValue extends GenericRenderValue<SourceTzOffsetDateTime> {
    constructor(data: SourceTzOffsetDateTime | undefined) {
        super(data, RenderValue.TypeId.SourceTzOffsetDateTimeTime);
    }
}

export class SourceTzOffsetDateRenderValue extends GenericRenderValue<SourceTzOffsetDate> {
    constructor(data: SourceTzOffsetDate | undefined) {
        super(data, RenderValue.TypeId.SourceTzOffsetDate);
    }
}

export class DecimalRenderValue extends GenericRenderValue<Decimal> {
    constructor(data: Decimal | undefined) {
        super(newUndefinableDecimal(data), RenderValue.TypeId.Decimal);
    }
}

export class PriceRenderValue extends GenericRenderValue<Decimal> {
    constructor(data: Decimal | undefined) {
        super(data === undefined ? undefined : new PriceRenderValue.decimalConstructor(data), RenderValue.TypeId.Price);
    }
}

export namespace PriceRenderValue {
    export const decimalConstructor = Decimal.clone({
        precision: 20,
        rounding: Decimal.ROUND_HALF_UP,
        toExpNeg: -15,
        toExpPos: 30,
    });
}

export class PriceOrRemainderRenderValue extends GenericRenderValue<PriceOrRemainder> {
    constructor(data: PriceOrRemainder | undefined) {
        super(data === undefined ? undefined :
            data === null ? null : new PriceRenderValue.decimalConstructor(data), RenderValue.TypeId.PriceOrRemainder);
    }
}

export class ColorRenderValue extends GenericRenderValue<string> {
    constructor(data: string | undefined) {
        super(data, RenderValue.TypeId.Color);
        this.addAttribute(RenderValue.backgroundColorAttribute);
    }
}

export class StringArrayRenderValue extends GenericRenderValue<readonly string[]> {
    constructor(data: readonly string[] | undefined) {
        super(data, RenderValue.TypeId.StringArray);
    }
}

export class IvemIdRenderValue extends GenericRenderValue<IvemId> {
    constructor(data: IvemId | undefined) {
        super(data, RenderValue.TypeId.IvemId);
    }
}

export class LitIvemIdRenderValue extends GenericRenderValue<LitIvemId> {
    constructor(data: LitIvemId | undefined) {
        super(data, RenderValue.TypeId.LitIvemId);
    }
}

export class RoutedIvemIdRenderValue extends GenericRenderValue<RoutedIvemId> {
    constructor(data: RoutedIvemId | undefined) {
        super(data, RenderValue.TypeId.RoutedIvemId);
    }
}

export class BooleanRenderValue extends GenericRenderValue<boolean> {
}

export class UndisclosedRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, RenderValue.TypeId.Undisclosed);
    }
}

export class IsReadableRenderValue extends BooleanRenderValue {
    constructor(data: boolean | undefined) {
        super(data, RenderValue.TypeId.IsReadable);
    }
}

export class EnumRenderValue extends GenericRenderValue<Integer> {
}

export class MarketIdRenderValue extends EnumRenderValue {
    constructor(data: MarketId | undefined) {
        super(data, RenderValue.TypeId.MarketId);
    }
}

export class SideIdRenderValue extends EnumRenderValue {
    constructor(data: SideId | undefined) {
        super(data, RenderValue.TypeId.SideId);
    }
}

export class BidAskSideIdRenderValue extends EnumRenderValue {
    constructor(data: BidAskSideId | undefined) {
        super(data, RenderValue.TypeId.BidAskSideId);
    }
}

export class TrendIdRenderValue extends EnumRenderValue {
    constructor(data: MovementId | undefined) {
        super(data, RenderValue.TypeId.TrendId);
    }
}

export class ColorSettingsItemStateIdRenderValue extends EnumRenderValue {
    constructor(data: ColorSettings.ItemStateId | undefined) {
        super(data, RenderValue.TypeId.ColorSettingsItemStateId);
    }
}

export class DayTradesDataItemRecordTypeIdRenderValue extends EnumRenderValue {
    constructor(data: DayTradesDataItem.Record.TypeId | undefined) {
        super(data, RenderValue.TypeId.DayTradesDataItemRecordTypeId);
    }
}

export class IntegerArrayRenderValue extends GenericRenderValue<readonly Integer[]> {
}

export class TradeAffectsIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly TradeAffectsId[] | undefined) {
        super(data, RenderValue.TypeId.TradeAffectsIdArray);
    }
}

export class TradeFlagIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly TradeFlagId[] | undefined) {
        super(data, RenderValue.TypeId.TradeFlagIdArray);
    }
}

export class MarketIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly MarketId[] | undefined) {
        super(data, RenderValue.TypeId.MarketIdArray);
    }
}

export class OrderStatusAllowIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly OrderStatus.AllowId[] | undefined) {
        super(data, RenderValue.TypeId.OrderStatusAllowIdArray);
    }
}

export class OrderStatusReasonIdArrayRenderValue extends IntegerArrayRenderValue {
    constructor(data: readonly OrderStatus.ReasonId[] | undefined) {
        super(data, RenderValue.TypeId.OrderStatusReasonIdArray);
    }
}

export class PriceAndHasUndisclosedRenderValue extends GenericRenderValue<PriceAndHasUndisclosedRenderValue.DataType> {
    constructor(data: PriceAndHasUndisclosedRenderValue.DataType | undefined) {
        super(data, RenderValue.TypeId.PriceAndHasUndisclosed);
    }
}

export namespace PriceAndHasUndisclosedRenderValue {
    export interface DataType {
        price: Decimal;
        hasUndisclosed: boolean;
    }
}

export class PriceOrRemainderAndHasUndisclosedRenderValue extends
    GenericRenderValue<PriceOrRemainderAndHasUndisclosedRenderValue.DataType> {
    constructor(data: PriceOrRemainderAndHasUndisclosedRenderValue.DataType | undefined) {
        super(data, RenderValue.TypeId.PriceOrRemainderAndHasUndisclosed);
    }
}

export namespace PriceOrRemainderAndHasUndisclosedRenderValue {
    export interface DataType {
        price: PriceOrRemainder;
        hasUndisclosed: boolean;
    }
}

export class CountAndXrefsRenderValue extends GenericRenderValue<CountAndXrefsRenderValue.DataType> {
    constructor(data: CountAndXrefsRenderValue.DataType | undefined) {
        super(data, RenderValue.TypeId.CountAndXrefs);
    }
}

export namespace CountAndXrefsRenderValue {
    export interface DataType {
        count: Integer;
        xrefs: string[];
    }
}
