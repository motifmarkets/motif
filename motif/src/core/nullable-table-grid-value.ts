/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// We are trying not to use null - only undefined.  If it does become necessary to use null table grid values, then
// the classes below can be used.  However try to avoid this

import Decimal from 'decimal.js-light';
import { Integer, newUndefinableDate, newUndefinableDecimal } from 'src/sys/internal-api';
import {
    BooleanRenderValue, DateRenderValue, DecimalRenderValue,
    EnumRenderValue, IntegerArrayRenderValue, IntegerRenderValue, NumberRenderValue,

    PriceRenderValue, RenderValue, StringRenderValue
} from './render-value';
import { CorrectnessTableGridValue } from './table-grid-value';

export abstract class NullableCorrectnessTableGridValue extends CorrectnessTableGridValue {
    abstract isNull(): boolean;
}

export abstract class GenericNullableCorrectnessTableGridValue<T> extends NullableCorrectnessTableGridValue {
    private _data: T | null | undefined;
    private _nonNullData: T;

    isUndefined() {
        return this.data === undefined;
    }

    clear() {
        this._data = undefined;
    }

    isNull() {
        return this.data === null;
    }

    get data(): T | null | undefined {
        return this._data;
    }

    set data(value: T | null | undefined) {
        this._data = value;
        if ((value !== undefined) && (value !== null)) {
            this._nonNullData = value;
        }
    }

    get nonNullData() { return this._nonNullData; }
}

export class NullableStringCorrectnessTableGridValue extends GenericNullableCorrectnessTableGridValue<string> {
    protected createRenderValue() {
        return new StringRenderValue(this.data === null ? undefined : this.data);
    }
}
export class NullableNumberCorrectnessTableGridValue extends GenericNullableCorrectnessTableGridValue<number> {
    protected createRenderValue() {
        return new NumberRenderValue(this.data === null ? undefined : this.data);
    }
}
export class NullableIntegerCorrectnessTableGridValue extends GenericNullableCorrectnessTableGridValue<Integer> {
    protected createRenderValue() {
        return new IntegerRenderValue(this.data === null ? undefined : this.data);
    }
}
export class NullableDateCorrectnessTableGridValue extends GenericNullableCorrectnessTableGridValue<Date> {
    protected createRenderValue() {
        return new DateRenderValue(this.data === null ? undefined : this.data);
    }

    get data() { return super.data; }

    set data(value: Date | null | undefined) {
        super.data = value === null ? null : newUndefinableDate(value);
    }
}

export abstract class BaseNullableDecimalCorrectnessTableGridValue extends GenericNullableCorrectnessTableGridValue<Decimal> {
    get data() { return super.data; }

    set data(value: Decimal | null | undefined) {
        super.data = value === null ? null : newUndefinableDecimal(value);
    }
}
export class NullableDecimalCorrectnessTableGridValue extends BaseNullableDecimalCorrectnessTableGridValue {
    protected createRenderValue() {
        return new DecimalRenderValue(this.data === null ? undefined : this.data);
    }
}
export class NullablePriceCorrectnessTableGridValue extends BaseNullableDecimalCorrectnessTableGridValue {
    protected createRenderValue() {
        return new PriceRenderValue(this.data === null ? undefined : this.data);
    }
}

export abstract class NullableBooleanCorrectnessTableGridValue extends GenericNullableCorrectnessTableGridValue<boolean> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new BooleanRenderValue(this.data === null ? undefined : this.data, this.renderValueTypeId);
    }
}
export abstract class NullableEnumCorrectnessTableGridValue extends GenericNullableCorrectnessTableGridValue<Integer> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new EnumRenderValue(this.data === null ? undefined : this.data, this.renderValueTypeId);
    }
}

export abstract class BaseNullableIntegerCorrectnessArrayTableGridValue extends GenericNullableCorrectnessTableGridValue<Integer[]> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new IntegerArrayRenderValue(this.data === null ? undefined : this.data, this.renderValueTypeId);
    }
}

export class NullableIntegerArrayCorrectnessTableGridValue extends BaseNullableIntegerCorrectnessArrayTableGridValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IntegerArray;
    }
}
