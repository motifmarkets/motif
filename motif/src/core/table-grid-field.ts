/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordField } from 'revgrid';
import { IvemId, LitIvemId } from 'src/adi/internal-api';
import {
    compareArray,
    compareDate,
    compareDecimal,
    compareString,
    compareValue,
    Integer,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime
} from 'src/sys/internal-api';
import { RenderValue } from './render-value';
import {
    BaseSourceTzOffsetDateTimeCorrectnessTableGridValue,
    CorrectnessTableGridValue,
    DateCorrectnessTableGridValue,
    DateTableGridValue,
    DecimalCorrectnessTableGridValue,
    DecimalTableGridValue,
    GenericCorrectnessTableGridValue,
    GenericTableGridValue,
    IntegerArrayCorrectnessTableGridValue,
    IntegerArrayTableGridValue,
    IntegerCorrectnessTableGridValue,
    IntegerTableGridValue,
    IvemIdCorrectnessTableGridValue,
    IvemIdTableGridValue,
    LitIvemIdCorrectnessTableGridValue,
    LitIvemIdTableGridValue,
    NumberCorrectnessTableGridValue,
    NumberTableGridValue,
    SourceTzOffsetDateCorrectnessTableGridValue,
    StringArrayCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    StringTableGridValue,
    TableGridValue
} from './table-grid-value';
import { TableRecord } from './table-record';
import { textFormatter } from './text-formatter';

export abstract class TableGridField implements RevRecordField {
    private _valueTypeId: RenderValue.TypeId;

    constructor(public readonly name: string, public index: Integer) {

    }

    get valueTypeId() { return this._valueTypeId; }

    compareField(left: TableRecord, right: TableRecord): number {
        const leftValue = left.values[this.index];
        const rightValue = right.values[this.index];
        if (leftValue === rightValue) {
            return 0;
        } else {
            if (leftValue.isUndefined()) {
                if (rightValue.isUndefined()) {
                    return 0;
                } else {
                    return this.compareUndefinedToDefinedField(rightValue);
                }
            } else {
                if (rightValue.isUndefined()) {
                    return -this.compareUndefinedToDefinedField(leftValue);
                } else {
                    return this.compareDefined(leftValue, rightValue);
                }
            }
        }
    }

    compareFieldDesc(left: TableRecord, right: TableRecord): number {
        const leftValue = left.values[this.index];
        const rightValue = right.values[this.index];
        if (leftValue === rightValue) {
            return 0;
        } else {
            if (leftValue.isUndefined()) {
                if (rightValue.isUndefined()) {
                    return 0;
                } else {
                    return -this.compareUndefinedToDefinedField(rightValue);
                }
            } else {
                if (rightValue.isUndefined()) {
                    return this.compareUndefinedToDefinedField(leftValue);
                } else {
                    return this.compareDefined(rightValue, leftValue);
                }
            }
        }
    }

    getFieldValue(record: TableRecord): RenderValue {
        const tableGridValue = record.values[this.index];
        return tableGridValue.renderValue;
    }

    protected setValueTypeId(value: RenderValue.TypeId) {
        this._valueTypeId = value;
    }

    protected compareUndefinedToDefinedField(definedValue: TableGridValue) {
        // left is undefined, right is defined (parameter)
        return -1;
    }

    protected abstract compareDefined(left: TableGridValue, right: TableGridValue): number;
}

export namespace TableGridField {
    export type Constructor = new(name: string, index: Integer) => TableGridField;
}

// eslint-disable-next-line max-len
export class GenericTableGridField<DataType extends number | string, ValueClass extends GenericTableGridValue<DataType>> extends TableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        return compareValue<DataType>((left as ValueClass).definedData, (right as ValueClass).definedData);
    }
}

export class StringTableGridField extends GenericTableGridField<string, StringTableGridValue> { }
export class IntegerTableGridField extends GenericTableGridField<Integer, IntegerTableGridValue> { }
export class NumberTableGridField extends GenericTableGridField<number, NumberTableGridValue> { }

export class DecimalTableGridField extends TableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        return compareDecimal((left as DecimalTableGridValue).definedData, (right as DecimalTableGridValue).definedData);
    }
}
export class DateTableGridField extends TableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        return compareDate((left as DateTableGridValue).definedData, (right as DateTableGridValue).definedData);
    }
}
export class IvemIdTableGridField extends TableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        const leftIvemId = (left as IvemIdTableGridValue).definedData;
        const rightIvemId = (right as IvemIdTableGridValue).definedData;
        return IvemId.compare(leftIvemId, rightIvemId);
    }
}
export class LitIvemIdTableGridField extends TableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        const leftLitIvemId = (left as LitIvemIdTableGridValue).definedData;
        const rightLitIvemId = (right as LitIvemIdTableGridValue).definedData;
        return LitIvemId.compare(leftLitIvemId, rightLitIvemId);
    }
}
export class BooleanTableGridField extends TableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = textFormatter.formatRenderValue(leftRenderValue);
        const rightFormattedText = textFormatter.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}
export class EnumTableGridField extends TableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = textFormatter.formatRenderValue(leftRenderValue);
        const rightFormattedText = textFormatter.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}

export abstract class IntegerArrayTableGridField extends TableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        return compareArray<Integer>((left as IntegerArrayTableGridValue).definedData,
            (right as IntegerArrayTableGridValue).definedData);
    }
}

export abstract class CorrectnessTableGridField extends TableGridField {
}

export namespace CorrectnessTableGridField {
    export type Constructor = new(name: string, index: Integer) => CorrectnessTableGridField;
}

// eslint-disable-next-line max-len
export class GenericDataItemTableGridField<DataType extends number | string, ValueClass extends GenericCorrectnessTableGridValue<DataType>> extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        return compareValue<DataType>((left as ValueClass).definedData, (right as ValueClass).definedData);
    }
}

export class StringDataItemTableGridField extends GenericDataItemTableGridField<string, StringCorrectnessTableGridValue> { }
export class IntegerDataItemTableGridField extends GenericDataItemTableGridField<Integer, IntegerCorrectnessTableGridValue> { }
export class NumberDataItemTableGridField extends GenericDataItemTableGridField<number, NumberCorrectnessTableGridValue> { }

export class DecimalDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        return compareDecimal((left as DecimalCorrectnessTableGridValue).definedData,
            (right as DecimalCorrectnessTableGridValue).definedData);
    }
}
export class DateDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        return compareDate((left as DateCorrectnessTableGridValue).definedData,
            (right as DateCorrectnessTableGridValue).definedData);
    }
}
export class SourceTzOffsetDateTimeDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        return SourceTzOffsetDateTime.compare((left as BaseSourceTzOffsetDateTimeCorrectnessTableGridValue).definedData,
            (right as BaseSourceTzOffsetDateTimeCorrectnessTableGridValue).definedData);
    }
}
export class SourceTzOffsetDateDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        return SourceTzOffsetDate.compare((left as SourceTzOffsetDateCorrectnessTableGridValue).definedData,
            (right as SourceTzOffsetDateCorrectnessTableGridValue).definedData);
    }
}
export class IvemIdDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        const leftIvemId = (left as IvemIdCorrectnessTableGridValue).definedData;
        const rightIvemId = (right as IvemIdCorrectnessTableGridValue).definedData;
        return IvemId.compare(leftIvemId, rightIvemId);
    }
}
export class LitIvemIdDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        const leftLitIvemId = (left as LitIvemIdCorrectnessTableGridValue).definedData;
        const rightLitIvemId = (right as LitIvemIdCorrectnessTableGridValue).definedData;
        return LitIvemId.compare(leftLitIvemId, rightLitIvemId);
    }
}
export class BooleanDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = textFormatter.formatRenderValue(leftRenderValue);
        const rightFormattedText = textFormatter.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}
export class EnumDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: CorrectnessTableGridValue, right: CorrectnessTableGridValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = textFormatter.formatRenderValue(leftRenderValue);
        const rightFormattedText = textFormatter.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}

export class StringArrayDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        return compareArray<string>((left as StringArrayCorrectnessTableGridValue).definedData,
            (right as StringArrayCorrectnessTableGridValue).definedData);
    }
}

export class IntegerArrayDataItemTableGridField extends CorrectnessTableGridField {
    protected compareDefined(left: TableGridValue, right: TableGridValue): number {
        return compareArray<Integer>((left as IntegerArrayCorrectnessTableGridValue).definedData,
            (right as IntegerArrayCorrectnessTableGridValue).definedData);
    }
}
