/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { IvemId, LitIvemId } from 'src/adi/internal-api';
import {
    CorrectnessId,
    Integer,
    newUndefinableDate,
    newUndefinableDecimal,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime
} from 'src/sys/internal-api';
import {
    BooleanRenderValue,
    DateRenderValue,
    DecimalRenderValue,
    EnumRenderValue,
    IntegerArrayRenderValue,
    IntegerRenderValue,
    IvemIdRenderValue,
    LitIvemIdRenderValue,
    NumberRenderValue,
    PercentageRenderValue,
    PriceRenderValue,
    RenderValue,
    SourceTzOffsetDateRenderValue,
    SourceTzOffsetDateTimeDateRenderValue,
    StringArrayRenderValue,
    StringRenderValue
} from './render-value';

export abstract class TableGridValue {
    private _renderValue: RenderValue | undefined;
    private _renderAttributes: RenderValue.Attribute[] = [];

    get renderValue() {
        if (this._renderValue === undefined) {
            this._renderValue = this.createRenderValue();
            this._renderValue.setAttributes(this._renderAttributes);
        }
        return this._renderValue;
    }

    addRenderAttribute(value: RenderValue.Attribute) {
        this._renderAttributes.push(value);
    }

    clearRendering() {
        this._renderValue = undefined;
    }

    abstract isUndefined(): boolean;

    protected abstract createRenderValue(): RenderValue;
}

export namespace TableGridValue {
    export type Constructor = new() => TableGridValue;
}

export abstract class GenericTableGridValue<T> extends TableGridValue {
    private _data: T | undefined;
    private _definedData: T;

    isUndefined() {
        return this._data === undefined;
    }

    clear() {
        this._data = undefined;
    }

    get data() { return this._data; }
    set data(value: T | undefined) {
        this._data = value;
        if (value !== undefined) {
            this._definedData = value;
        }
    }

    get definedData() { return this._definedData; }
}

export class StringTableGridValue extends GenericTableGridValue<string> {
    protected createRenderValue() {
        return new StringRenderValue(this.data);
    }
}
export abstract class BaseNumberTableGridValue extends GenericTableGridValue<number> {
}
export class NumberTableGridValue extends BaseNumberTableGridValue {
    protected createRenderValue() {
        return new NumberRenderValue(this.data);
    }
}
export class PercentageTableGridValue extends BaseNumberTableGridValue {
    protected createRenderValue() {
        return new PercentageRenderValue(this.data);
    }
}
export class IntegerTableGridValue extends GenericTableGridValue<Integer> {
    protected createRenderValue() {
        return new IntegerRenderValue(this.data);
    }
}
export class DateTableGridValue extends GenericTableGridValue<Date> {
    protected createRenderValue() {
        return new DateRenderValue(this.data);
    }

    override get data() { return super.data; }

    override set data(value: Date | undefined) {
        super.data = newUndefinableDate(value);
    }
}
export class IvemIdTableGridValue extends GenericTableGridValue<IvemId> {
    protected createRenderValue() {
        return new IvemIdRenderValue(this.data);
    }

    override get data() { return super.data; }
    override set data(value: IvemId | undefined) {
        super.data = value?.createCopy();
    }
}
export class LitIvemIdTableGridValue extends GenericTableGridValue<LitIvemId> {
    protected createRenderValue() {
        return new LitIvemIdRenderValue(this.data);
    }

    override get data() { return super.data; }
    override set data(value: LitIvemId | undefined) {
        super.data = value?.createCopy();
    }
}

export abstract class BaseDecimalTableGridValue extends GenericTableGridValue<Decimal> {
    // protected createRenderValue() {
    //     return new DecimalRenderValue(this.data);
    // }

    override get data() { return super.data; }

    override set data(value: Decimal | undefined) {
        super.data = newUndefinableDecimal(value);
    }
}
export class DecimalTableGridValue extends BaseDecimalTableGridValue {
    protected createRenderValue() {
        return new DecimalRenderValue(this.data);
    }
}
export class PriceTableGridValue extends BaseDecimalTableGridValue {
    protected createRenderValue() {
        return new PriceRenderValue(this.data);
    }
}

export abstract class BooleanTableGridValue extends GenericTableGridValue<boolean> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new BooleanRenderValue(this.data, this.renderValueTypeId);
    }
}
export class IsIndexTableGridValue extends BooleanTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IsIndex;
    }
}

export abstract class EnumTableGridValue extends GenericTableGridValue<Integer> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new EnumRenderValue(this.data, this.renderValueTypeId);
    }
}
export class MarketIdTableGridValue extends EnumTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketId;
    }
}
export class ExerciseTypeIdTableGridValue extends EnumTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ExerciseTypeId;
    }
}

export abstract class BaseIntegerArrayTableGridValue extends GenericTableGridValue<Integer[]> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new IntegerArrayRenderValue(this.data, this.renderValueTypeId);
    }
}

export class IntegerArrayTableGridValue extends BaseIntegerArrayTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IntegerArray;
    }
}

export abstract class CorrectnessTableGridValue extends TableGridValue {
    _correctnessId: CorrectnessId;

    get dataCorrectnessId() { return this._correctnessId; }
    set dataCorrectnessId(value: CorrectnessId) {
        this._correctnessId = value;
        switch (value) {
            case CorrectnessId.Suspect:
                this.addRenderAttribute(RenderValue.DataCorrectnessAttribute.suspect);
                break;
            case CorrectnessId.Error:
                this.addRenderAttribute(RenderValue.DataCorrectnessAttribute.error);
                break;
        }
    }
}

export namespace CorrectnessTableGridValue {

    export type Constructor = new() => CorrectnessTableGridValue;
}

export abstract class GenericCorrectnessTableGridValue<T> extends CorrectnessTableGridValue {
    private _data: T | undefined;
    private _definedData: T;

    isUndefined() {
        return this._data === undefined;
    }

    clear() {
        this._data = undefined;
    }

    get data() { return this._data; }
    set data(value: T | undefined) {
        this._data = value;
        if (value !== undefined) {
            this._definedData = value;
        }
    }

    get definedData() { return this._definedData; }
}

export class StringCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<string> {
    protected createRenderValue() {
        return new StringRenderValue(this.data);
    }
}
export abstract class BaseNumberCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<number> {
}
export class NumberCorrectnessTableGridValue extends BaseNumberCorrectnessTableGridValue {
    protected createRenderValue() {
        return new NumberRenderValue(this.data);
    }
}
export class PercentageCorrectnessTableGridValue extends BaseNumberCorrectnessTableGridValue {
    protected createRenderValue() {
        return new PercentageRenderValue(this.data);
    }
}
export class IntegerCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<Integer> {
    protected createRenderValue() {
        return new IntegerRenderValue(this.data);
    }
}

export class DateCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<Date> {
    protected createRenderValue() {
        return new DateRenderValue(this.data);
    }

    override get data() { return super.data; }
    override set data(value: Date | undefined) {
        super.data = newUndefinableDate(value);
    }
}
export abstract class BaseSourceTzOffsetDateTimeCorrectnessTableGridValue
        extends GenericCorrectnessTableGridValue<SourceTzOffsetDateTime> {

    override get data() { return super.data; }
    override set data(value: SourceTzOffsetDateTime | undefined) {
        super.data = SourceTzOffsetDateTime.newUndefinable(value);
    }
}
export class SourceTzOffsetDateTimeDateCorrectnessTableGridValue extends BaseSourceTzOffsetDateTimeCorrectnessTableGridValue {
    protected createRenderValue() {
        return new SourceTzOffsetDateTimeDateRenderValue(this.data);
    }
}
export class SourceTzOffsetDateCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<SourceTzOffsetDate> {
    protected createRenderValue() {
        return new SourceTzOffsetDateRenderValue(this.data);
    }

    override get data() { return super.data; }
    override set data(value: SourceTzOffsetDate | undefined) {
        super.data = SourceTzOffsetDate.newUndefinable(value);
    }
}
export class IvemIdCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<IvemId> {
    protected createRenderValue() {
        return new IvemIdRenderValue(this.data);
    }

    override get data() { return super.data; }
    override set data(value: IvemId | undefined) {
        super.data = value?.createCopy();
    }
}
export class LitIvemIdCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<LitIvemId> {
    protected createRenderValue() {
        return new LitIvemIdRenderValue(this.data);
    }

    override get data() { return super.data; }
    override set data(value: LitIvemId | undefined) {
        super.data = value?.createCopy();
    }
}

export abstract class BooleanCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<boolean> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new BooleanRenderValue(this.data, this.renderValueTypeId);
    }
}
export class IsIndexCorrectnessTableGridValue extends BooleanCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IsIndex;
    }
}
export class UndisclosedCorrectnessTableGridValue extends BooleanCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.Undisclosed;
    }
}
export class PhysicalDeliveryCorrectnessTableGridValue extends BooleanCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.PhysicalDelivery;
    }
}

export abstract class BaseDecimalCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<Decimal> {
    // protected createRenderValue() {
    //     return new DecimalRenderValue(this.data);
    // }

    override get data() { return super.data; }

    override set data(value: Decimal | undefined) {
        super.data = newUndefinableDecimal(value);
    }
}
export class DecimalCorrectnessTableGridValue extends BaseDecimalCorrectnessTableGridValue {
    protected createRenderValue() {
        return new DecimalRenderValue(this.data);
    }
}
export class PriceCorrectnessTableGridValue extends BaseDecimalCorrectnessTableGridValue {
    protected createRenderValue() {
        return new PriceRenderValue(this.data);
    }
}

export abstract class EnumCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<Integer> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new EnumRenderValue(this.data, this.renderValueTypeId);
    }
}
export class TradingStateReasonIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.TradingStateReasonId;
    }
}
export class MarketIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketId;
    }
}
export class ExchangeIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ExchangeId;
    }
}
export class CallOrPutCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.CallOrPutId;
    }
}
export class MarketBoardIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketBoardId;
    }
}
export class CurrencyIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.CurrencyId;
    }
}
export class SideIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.SideId;
    }
}
export class EquityOrderTypeIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.EquityOrderTypeId;
    }
}
export class TimeInForceIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.TimeInForceId;
    }
}
export class OrderPriceUnitTypeIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderPriceUnitTypeId;
    }
}
export class OrderRouteAlgorithmIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderRouteAlgorithmId;
    }
}
export class OrderTriggerTypeIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderTriggerTypeId;
    }
}
export class GridOrderTriggerTypeIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.GridOrderTriggerTypeId;
    }
}
export class TrailingStopLossOrderConditionTypeIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.TrailingStopLossOrderConditionTypeId;
    }
}
export class ExchangeEnvironmentIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ExchangeEnvironmentId;
    }
}
export class FeedStatusIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.FeedStatusId;
    }
}
export class FeedClassIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.FeedClassId;
    }
}
export class IvemClassIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IvemClassId;
    }
}
export class DepthDirectionIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.DepthDirectionId;
    }
}
export class ExerciseTypeIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ExerciseTypeId;
    }
}
export class CallOrPutIdCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.CallOrPutId;
    }
}
export class MarketClassificationIdMyxLitIvemAttributeCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketClassificationIdMyxLitIvemAttribute;
    }
}
export class DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableGridValue extends EnumCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.DeliveryBasisIdMyxLitIvemAttribute;
    }
}

export class StringArrayCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<string[]> {
    protected createRenderValue() {
        return new StringArrayRenderValue(this.data);
    }
}

export abstract class BaseIntegerArrayCorrectnessTableGridValue extends GenericCorrectnessTableGridValue<readonly Integer[]> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new IntegerArrayRenderValue(this.data, this.renderValueTypeId);
    }
}

export class IntegerArrayCorrectnessTableGridValue extends BaseIntegerArrayCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IntegerArray;
    }
}

export class TradingStateAllowIdArrayCorrectnessTableGridValue extends BaseIntegerArrayCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.TradingStateAllowIdArray;
    }
}

export class MarketIdArrayCorrectnessTableGridValue extends BaseIntegerArrayCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketIdArray;
    }
}

export class OrderStatusAllowIdArrayCorrectnessTableGridValue extends BaseIntegerArrayCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderStatusAllowIdArray;
    }
}

export class OrderStatusReasonIdArrayCorrectnessTableGridValue extends BaseIntegerArrayCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.OrderStatusReasonIdArray;
    }
}

export class MarketBoardIdArrayCorrectnessTableGridValue extends BaseIntegerArrayCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.MarketBoardIdArray;
    }
}

export class ZenithSubscriptionDataIdArrayCorrectnessTableGridValue extends BaseIntegerArrayCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ZenithSubscriptionDataIdArray;
    }
}

export class ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableGridValue extends BaseIntegerArrayCorrectnessTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.ShortSellTypeIdArrayMyxLitIvemAttribute;
    }
}
