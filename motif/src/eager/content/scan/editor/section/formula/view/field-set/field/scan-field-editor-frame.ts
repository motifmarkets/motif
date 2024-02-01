/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BaseNumericScanFieldCondition,
    BaseTextScanFieldCondition,
    ChangeSubscribableComparableList,
    CurrencyId,
    CurrencyOverlapsScanFieldCondition,
    DateScanFieldCondition,
    ExchangeId,
    ExchangeOverlapsScanFieldCondition,
    Integer,
    IsScanFieldCondition,
    MarketBoardId,
    MarketBoardOverlapsScanFieldCondition,
    MarketId,
    MarketOverlapsScanFieldCondition,
    MultiEvent,
    NumericComparisonScanFieldCondition,
    NumericScanFieldCondition,
    Ok,
    OverlapsScanFieldCondition,
    Result,
    ScanField,
    ScanFieldCondition,
    ScanFormula,
    SourceTzOffsetDateTime,
    StringOverlapsScanFieldCondition,
    TextContainsScanFieldCondition,
    TextEqualsScanFieldCondition,
    TextHasValueContainsScanFieldCondition,
    TextHasValueEqualsScanFieldCondition,
    UnreachableCaseError,
} from '@motifmarkets/motif-core';
import {
    ContainsTextHasValueContainsScanFieldConditionEditorFrame,
    CurrencyOverlapsScanFieldConditionEditorFrame,
    ExchangeOverlapsScanFieldConditionEditorFrame,
    HasValueDateScanFieldConditionEditorFrame,
    HasValueNumericComparisonScanFieldConditionEditorFrame,
    HasValueNumericScanFieldConditionEditorFrame,
    HasValueTextHasValueContainsScanFieldConditionEditorFrame,
    HasValueTextHasValueEqualsScanFieldConditionEditorFrame,
    IsScanFieldConditionEditorFrame,
    MarketBoardOverlapsScanFieldConditionEditorFrame,
    MarketOverlapsScanFieldConditionEditorFrame,
    RangeDateScanFieldConditionEditorFrame,
    RangeNumericComparisonScanFieldConditionEditorFrame,
    RangeNumericScanFieldConditionEditorFrame,
    ScanFieldConditionEditorFrame,
    StringOverlapsScanFieldConditionEditorFrame,
    TextContainsScanFieldConditionEditorFrame,
    TextEqualsScanFieldConditionEditorFrame,
    ValueDateScanFieldConditionEditorFrame,
    ValueNumericComparisonScanFieldConditionEditorFrame,
    ValueNumericScanFieldConditionEditorFrame,
    ValueTextHasValueEqualsScanFieldConditionEditorFrame,
} from './condition/internal-api';

export abstract class ScanFieldEditorFrame implements ScanField {
    readonly name: string;

    private readonly _changedMultiEvent = new MultiEvent<ScanFieldEditorFrame.ChangedEventHandler>();
    private _valid: boolean;
    private _conditionsOperationId = ScanField.BooleanOperationId.And;

    abstract readonly conditions: ChangeSubscribableComparableList<ScanFieldConditionEditorFrame>;

    constructor(
        readonly typeId: ScanField.TypeId,
        readonly fieldId: ScanFormula.FieldId,
        readonly subFieldId: Integer | undefined,
        readonly conditionTypeId: ScanFieldCondition.TypeId,
        private readonly _removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        private readonly _changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        this.name = ScanFieldEditorFrame.calculateName(fieldId, subFieldId);
    }

    get valid() { return this._valid; }
    get conditionsOperationId() { return this._conditionsOperationId; }
    set conditionsOperationId(value: ScanField.BooleanOperationId) {
        if (value !== this._conditionsOperationId) {
            this._conditionsOperationId = value;
            this.notifyChanged();
        }
    }

    remove() {
        this._removeMeEventer(this);
    }

    processConditionChanged(valid: boolean) {
        if (valid !== this._valid) {
            this._valid = valid;
            this.notifyChanged();
        }
    }

    subscribeChangedEvent(handler: ScanFieldEditorFrame.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged() {
        this._changedEventer(this, this._valid);

        const handlers = this._changedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(this, this._valid);
        }
    }
}

export namespace ScanFieldEditorFrame {
    export type RemoveMeEventHandler = (this: void, frame: ScanFieldEditorFrame) => void;
    export type ChangedEventHandler = (this: void, frame: ScanFieldEditorFrame, valid: boolean) => void;

    export const altCodeSubFieldNamePrefix = 'altcode/'
    export const attributeSubFieldNamePrefix = 'attr/'

    export function calculateName(fieldId: ScanFormula.FieldId, subFieldId: Integer | undefined) {
        const subbed = ScanFormula.Field.idIsSubbed(fieldId);
        if (!subbed) {
            return ScanFormula.Field.idToName(fieldId);
        } else {
            switch (fieldId) {
                case ScanFormula.FieldId.AltCodeSubbed:
                    return altCodeSubFieldNamePrefix + ScanFormula.AltCodeSubField.idToName(subFieldId as ScanFormula.AltCodeSubFieldId);
                case ScanFormula.FieldId.AttributeSubbed:
                    return attributeSubFieldNamePrefix + ScanFormula.AttributeSubField.idToName(subFieldId as ScanFormula.AttributeSubFieldId);
                case ScanFormula.FieldId.DateSubbed:
                    return ScanFormula.DateSubField.idToName(subFieldId as ScanFormula.DateSubFieldId);
                case ScanFormula.FieldId.PriceSubbed:
                    return ScanFormula.DateSubField.idToName(subFieldId as ScanFormula.DateSubFieldId);
                default:
                    throw new UnreachableCaseError('SFEFCN39997', fieldId);
            }
        }
    }

    export class ConditionFactory implements ScanField.ConditionFactory {
        createNumericComparisonWithHasValue(field: ScanField, operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId): Result<NumericComparisonScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new HasValueNumericComparisonScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createNumericComparisonWithValue(field: ScanField, operatorId: BaseNumericScanFieldCondition.ValueOperands.OperatorId, value: number): Result<NumericComparisonScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new ValueNumericComparisonScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createNumericComparisonWithRange(field: ScanField, operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId, min: number | undefined, max: number | undefined): Result<NumericComparisonScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new RangeNumericComparisonScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createNumericWithHasValue(field: ScanField, operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId): Result<NumericScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new HasValueNumericScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createNumericWithValue(field: ScanField, operatorId: NumericScanFieldCondition.ValueOperands.OperatorId, value: number): Result<NumericScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new ValueNumericScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createNumericWithRange(field: ScanField, operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId, min: number | undefined, max: number | undefined): Result<NumericScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new RangeNumericScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createDateWithHasValue(field: ScanField, operatorId: DateScanFieldCondition.HasValueOperands.OperatorId): Result<DateScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new HasValueDateScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createDateWithEquals(field: ScanField, operatorId: DateScanFieldCondition.ValueOperands.OperatorId, value: SourceTzOffsetDateTime): Result<DateScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new ValueDateScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createDateWithRange(field: ScanField, operatorId: DateScanFieldCondition.RangeOperands.OperatorId, min: SourceTzOffsetDateTime | undefined, max: SourceTzOffsetDateTime | undefined): Result<DateScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new RangeDateScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createTextEquals(field: ScanField, operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId, value: string): Result<TextEqualsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new TextEqualsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createTextContains(field: ScanField, operatorId: BaseTextScanFieldCondition.ContainsOperands.OperatorId, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<TextContainsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new TextContainsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createTextHasValueEqualsWithHasValue(field: ScanField, operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId): Result<TextHasValueEqualsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new HasValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createTextHasValueEqualsWithValue(field: ScanField, operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId, value: string): Result<TextHasValueEqualsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new ValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createTextHasValueContainsWithHasValue(field: ScanField, operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId): Result<TextHasValueContainsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new HasValueTextHasValueContainsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createTextHasValueContainsWithContains(field: ScanField, operatorId: BaseTextScanFieldCondition.ContainsOperands.OperatorId, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<TextHasValueContainsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new ContainsTextHasValueContainsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createStringOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly string[]): Result<StringOverlapsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new StringOverlapsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createCurrencyOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly CurrencyId[]): Result<CurrencyOverlapsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new CurrencyOverlapsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createExchangeOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly ExchangeId[]): Result<ExchangeOverlapsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new ExchangeOverlapsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createMarketOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly MarketId[]): Result<MarketOverlapsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new MarketOverlapsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createMarketBoardOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly MarketBoardId[]): Result<MarketBoardOverlapsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new MarketBoardOverlapsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
        createIs(field: ScanField, operatorId: IsScanFieldCondition.Operands.OperatorId, categoryId: ScanFormula.IsNode.CategoryId): Result<IsScanFieldCondition> {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return new Ok(new IsScanFieldConditionEditorFrame(operatorId, (valid) => fieldEditorFrame.processConditionChanged(valid)));
        }
    }
}
