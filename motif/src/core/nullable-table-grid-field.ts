/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// We are trying not to use null - only undefined.  If it does become necessary to use null table grid fields, then
// the classes below can be used.  However try to avoid this

import { compareArray, compareDate, compareDecimal, compareString, compareValue, Integer } from 'sys-internal-api';
import {
    GenericNullableCorrectnessTableGridValue,
    NullableCorrectnessTableGridValue,
    NullableDateCorrectnessTableGridValue,
    NullableDecimalCorrectnessTableGridValue,
    NullableIntegerArrayCorrectnessTableGridValue,
    NullableIntegerCorrectnessTableGridValue,
    NullableNumberCorrectnessTableGridValue,
    NullableStringCorrectnessTableGridValue
} from './nullable-table-grid-value';
import { CorrectnessTableGridField } from './table-grid-field';
import { TableGridValue } from './table-grid-value';
import { textFormatter } from './text-formatter';

export abstract class NullableDataItemTableGridField extends CorrectnessTableGridField {
    protected compareNullToNonNullField(notNullValue: NullableCorrectnessTableGridValue) {
        // left is null, right is notNull (parameter)
        return -1;
    }

    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        const nullableLeft = left as NullableCorrectnessTableGridValue;
        const nullableRight = right as NullableCorrectnessTableGridValue;
        if (nullableLeft.isNull()) {
            if (nullableRight.isNull()) {
                return 0;
            } else {
                return this.compareNullToNonNullField(nullableRight);
            }
        } else {
            if (nullableRight.isNull()) {
                return -this.compareNullToNonNullField(nullableLeft);
            } else {
                return this.compareNonNull(nullableLeft, nullableRight);
            }
        }
    }

    protected abstract compareNonNull(left: NullableCorrectnessTableGridValue, right: NullableCorrectnessTableGridValue): number;
}

// eslint-disable-next-line max-len
export class GenericNullableDataItemTableGridField<DataType extends number | string, ValueClass extends GenericNullableCorrectnessTableGridValue<DataType>> extends NullableDataItemTableGridField {
    protected compareNonNull(left: NullableCorrectnessTableGridValue, right: NullableCorrectnessTableGridValue): number {
        return compareValue<DataType>((left as ValueClass).nonNullData, (right as ValueClass).nonNullData);
    }
}

/* eslint-disable max-len */
export class NullableStringDataItemTableGridField extends GenericNullableDataItemTableGridField<string, NullableStringCorrectnessTableGridValue> { }
export class NullableIntegerDataItemTableGridField extends GenericNullableDataItemTableGridField<Integer, NullableIntegerCorrectnessTableGridValue> { }
export class NullableNumberDataItemTableGridField extends GenericNullableDataItemTableGridField<number, NullableNumberCorrectnessTableGridValue> { }

export class NullableDecimalDataItemTableGridField extends NullableDataItemTableGridField {
    protected compareNonNull(left: NullableCorrectnessTableGridValue, right: NullableCorrectnessTableGridValue): number {
        return compareDecimal((left as NullableDecimalCorrectnessTableGridValue).nonNullData,
            (right as NullableDecimalCorrectnessTableGridValue).nonNullData);
    }
}

export class NullableDateDataItemTableGridField extends NullableDataItemTableGridField {
    protected compareNonNull(left: NullableCorrectnessTableGridValue, right: NullableCorrectnessTableGridValue): number {
        return compareDate((left as NullableDateCorrectnessTableGridValue).nonNullData,
            (right as NullableDateCorrectnessTableGridValue).nonNullData);
    }
}

export abstract class NullableBooleanDataItemTableGridField extends NullableDataItemTableGridField {
    protected compareNonNull(left: NullableCorrectnessTableGridValue, right: NullableCorrectnessTableGridValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = textFormatter.formatRenderValue(leftRenderValue);
        const rightFormattedText = textFormatter.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}
/* eslint-enable max-len */
export abstract class NullableEnumDataItemTableGridField extends NullableDataItemTableGridField {
    protected compareNonNull(left: NullableCorrectnessTableGridValue, right: NullableCorrectnessTableGridValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = textFormatter.formatRenderValue(leftRenderValue);
        const rightFormattedText = textFormatter.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}

export abstract class NullableIntegerArrayDataItemTableGridField extends NullableDataItemTableGridField {
    protected compareNonNull(left: NullableCorrectnessTableGridValue, right: NullableCorrectnessTableGridValue): number {
        return compareArray<Integer>((left as NullableIntegerArrayCorrectnessTableGridValue).nonNullData,
            (right as NullableIntegerArrayCorrectnessTableGridValue).nonNullData);
    }
}
