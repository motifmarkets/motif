/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    BaseNumericScanFieldCondition,
    BaseTextScanFieldCondition,
    ChangeSubscribableComparableList,
    ComparableList,
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
    UsableListChangeTypeId,
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
    private readonly _changedMultiEvent = new MultiEvent<ScanFieldEditorFrame.ChangedEventHandler>();
    private _valid: boolean;
    private _conditionsOperationId = ScanField.BooleanOperationId.And;

    private _conditionListChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        readonly typeId: ScanField.TypeId,
        readonly fieldId: ScanFormula.FieldId,
        readonly subFieldId: Integer | undefined,
        readonly name: string,
        readonly conditions: ChangeSubscribableComparableList<ScanFieldConditionEditorFrame>,
        readonly conditionTypeId: ScanFieldCondition.TypeId,
        private readonly _removeMeEventer: ScanFieldEditorFrame.RemoveMeEventHandler,
        private readonly _changedEventer: ScanFieldEditorFrame.ChangedEventHandler,
    ) {
        this._conditionListChangeSubscriptionId = this.conditions.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleConditionListChangeEvent(listChangeTypeId, idx, count)
        );
    }

    get valid() { return this._valid; }
    get conditionsOperationId() { return this._conditionsOperationId; }
    set conditionsOperationId(value: ScanField.BooleanOperationId) {
        if (value !== this._conditionsOperationId) {
            this._conditionsOperationId = value;
            this.notifyChanged();
        }
    }

    destroy() {
        this.conditions.unsubscribeListChangeEvent(this._conditionListChangeSubscriptionId);
        this._conditionListChangeSubscriptionId = undefined;
    }

    remove() {
        this._removeMeEventer(this);
    }

    processConditionChanged(valid: boolean) {
        if (valid !== this._valid) {
            if (!valid) {
                this._valid = false;
                this.notifyChanged();
            } else {
                valid = this.calculateAllConditionsValid();
                if (valid) {
                    this._valid = true;
                    this.notifyChanged();
                }
            }
        }
    }

    subscribeChangedEvent(handler: ScanFieldEditorFrame.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleConditionListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
            case UsableListChangeTypeId.PreUsableAdd:
            case UsableListChangeTypeId.PreUsableClear:
            case UsableListChangeTypeId.Usable:
            case UsableListChangeTypeId.Insert:
            case UsableListChangeTypeId.BeforeReplace:
            case UsableListChangeTypeId.AfterReplace:
            case UsableListChangeTypeId.BeforeMove:
            case UsableListChangeTypeId.AfterMove:
            case UsableListChangeTypeId.Remove:
            case UsableListChangeTypeId.Clear:
                break;
            default:
                throw new UnreachableCaseError('SFEFHFLCE33971', listChangeTypeId);
        }
    }

    private calculateAllConditionsValid() {
        const conditions = this.conditions;
        const count = conditions.count;
        for (let i = 0; i < count; i++) {
            const condition = conditions.getAt(i);
            if (!condition.valid) {
                return false;
            }
        }
        return true;
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

    export interface Definition extends ScanField.Definition {
        readonly name: string;
    }

    export const altCodeSubFieldNamePrefix = 'altcode/'
    export const attributeSubFieldNamePrefix = 'attr/'

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

    export function calculateAllDefinitions(): readonly Definition[] {
        const definitionList = new ComparableList<Definition>();
        const approxDefinitionCount =
            ScanFormula.Field.idCount +
            ScanFormula.PriceSubField.idCount +
            ScanFormula.DateSubField.idCount +
            ScanFormula.AltCodeSubField.idCount +
            ScanFormula.AttributeSubField.idCount;
        definitionList.capacity = approxDefinitionCount;

        for (let i = 0; i < ScanFormula.Field.idCount; i++) {
            const fieldId = i as ScanFormula.FieldId;

            const subbed = ScanFormula.Field.idIsSubbed(fieldId);
            if (subbed) {
                const subbedDefinitions = createSubbedDefinitions(fieldId);
                definitionList.addRange(subbedDefinitions);
            } else {
                const notSubbedDefinition = createNotSubbedDefinition(fieldId);
                definitionList.add(notSubbedDefinition);
            }
        }

        return definitionList.toArray();
    }

    function createNotSubbedDefinition(fieldId: ScanFormula.FieldId) {
        const styleId = ScanFormula.Field.idToStyleId(fieldId);
        switch (styleId) {
            case ScanFormula.Field.StyleId.InRange: return createInRangeDefinition(fieldId);
            case ScanFormula.Field.StyleId.Overlaps: return createOverlapsDefinition(fieldId);
            case ScanFormula.Field.StyleId.Equals: return createEqualsDefinition(fieldId);
            case ScanFormula.Field.StyleId.HasValueEquals: return createHasValueEqualsDefinition(fieldId);
            case ScanFormula.Field.StyleId.Contains:  return createContainsDefinition(fieldId);
            default:
                throw new UnreachableCaseError('SFEFCSDD59136', styleId);
        }
    }

    function createInRangeDefinition(fieldId: ScanFormula.FieldId): Definition {
        const name = ScanFormula.Field.idToName(fieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        switch (dataTypeId) {
            case ScanFormula.Field.DataTypeId.Numeric:
                return { typeId: ScanField.TypeId.NumericInRange, fieldId, subFieldId: undefined, name };
            case ScanFormula.Field.DataTypeId.Date:
                return { typeId: ScanField.TypeId.DateInRange, fieldId, subFieldId: undefined, name };
            case ScanFormula.Field.DataTypeId.Text:
            case ScanFormula.Field.DataTypeId.Boolean:
                throw new AssertInternalError('SFEFCIRDTB35199', dataTypeId.toString());
            default:
                throw new UnreachableCaseError('SFEFCIRDD35199', dataTypeId);
        }
    }

    function createOverlapsDefinition(fieldId: ScanFormula.FieldId): Definition {
        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCOD55598');
        } else {
            const name = ScanFormula.Field.idToName(fieldId);
            const textFieldId = fieldId as ScanFormula.TextOverlapFieldId;
            switch (textFieldId) {
                case ScanFormula.FieldId.Category:
                    return { typeId: ScanField.TypeId.StringOverlaps, fieldId, subFieldId: undefined, name };
                case ScanFormula.FieldId.Currency:
                    return { typeId: ScanField.TypeId.CurrencyOverlaps, fieldId, subFieldId: undefined, name };
                case ScanFormula.FieldId.Exchange:
                    return { typeId: ScanField.TypeId.ExchangeOverlaps, fieldId, subFieldId: undefined, name };
                case ScanFormula.FieldId.Market:
                    return { typeId: ScanField.TypeId.MarketOverlaps, fieldId, subFieldId: undefined, name };
                case ScanFormula.FieldId.MarketBoard:
                    return { typeId: ScanField.TypeId.MarketBoardOverlaps, fieldId, subFieldId: undefined, name };
                case ScanFormula.FieldId.QuotationBasis:
                    return { typeId: ScanField.TypeId.StringOverlaps, fieldId, subFieldId: undefined, name };
                case ScanFormula.FieldId.TradingStateName:
                    return { typeId: ScanField.TypeId.StringOverlaps, fieldId, subFieldId: undefined, name };
                case ScanFormula.FieldId.StatusNote:
                    return { typeId: ScanField.TypeId.StringOverlaps, fieldId, subFieldId: undefined, name };
                case ScanFormula.FieldId.TradingMarket:
                    return { typeId: ScanField.TypeId.MarketOverlaps, fieldId, subFieldId: undefined, name };
                default:
                    throw new UnreachableCaseError('SFEFCOD45456', textFieldId);
            }
        }

    }

    function createEqualsDefinition(fieldId: ScanFormula.FieldId): Definition {
        const name = ScanFormula.Field.idToName(fieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCED55598');
        } else {
            return { typeId: ScanField.TypeId.TextEquals, fieldId, subFieldId: undefined, name };
        }
    }

    function createHasValueEqualsDefinition(fieldId: ScanFormula.FieldId): Definition {
        const name = ScanFormula.Field.idToName(fieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCHVED55598');
        } else {
            return { typeId: ScanField.TypeId.TextHasValueEquals, fieldId, subFieldId: undefined, name };
        }
    }

    function createContainsDefinition(fieldId: ScanFormula.FieldId): Definition {
        const name = ScanFormula.Field.idToName(fieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCCD55598');
        } else {
            return { typeId: ScanField.TypeId.TextContains, fieldId, subFieldId: undefined, name };
        }
    }


    function createSubbedDefinitions(fieldId: ScanFormula.SubbedFieldId) {
        switch (fieldId) {
            case ScanFormula.FieldId.AltCodeSubbed:
                return createAltCodeSubbedDefinitions()
            case ScanFormula.FieldId.AttributeSubbed:
                return createAttributeSubbedDefinitions()
            case ScanFormula.FieldId.DateSubbed:
                return createDateSubbedDefinitions()
            case ScanFormula.FieldId.PriceSubbed:
                return createPriceSubbedDefinitions()
            default:
                throw new UnreachableCaseError('SFEFCN39997', fieldId);
        }
    }

    function createAltCodeSubbedDefinitions() {
        const count = ScanFormula.AltCodeSubField.idCount;
        const definitions = new Array<Definition>(count);
        for (let i = 0; i < count; i++) {
            const subFieldId = i as ScanFormula.AltCodeSubFieldId;
            const definition: Definition = {
                typeId: ScanField.TypeId.AltCodeSubbed,
                fieldId: ScanFormula.FieldId.AltCodeSubbed,
                subFieldId,
                name: altCodeSubFieldNamePrefix + ScanFormula.AltCodeSubField.idToName(subFieldId),
            };
            definitions[i] = definition;
        }
        return definitions;
    }

    function createAttributeSubbedDefinitions() {
        const count = ScanFormula.AttributeSubField.idCount;
        const definitions = new Array<Definition>(count);
        for (let i = 0; i < count; i++) {
            const subFieldId = i as ScanFormula.AttributeSubFieldId;
            const definition: Definition = {
                typeId: ScanField.TypeId.AttributeSubbed,
                fieldId: ScanFormula.FieldId.AttributeSubbed,
                subFieldId,
                name: attributeSubFieldNamePrefix + ScanFormula.AttributeSubField.idToName(subFieldId),
            };
            definitions[i] = definition;
        }
        return definitions;
    }

    function createPriceSubbedDefinitions() {
        const count = ScanFormula.PriceSubField.idCount;
        const definitions = new Array<Definition>(count);
        for (let i = 0; i < count; i++) {
            const subFieldId = i as ScanFormula.PriceSubFieldId;
            const definition: Definition = {
                typeId: ScanField.TypeId.PriceSubbed,
                fieldId: ScanFormula.FieldId.PriceSubbed,
                subFieldId,
                name: ScanFormula.PriceSubField.idToName(subFieldId),
            };
            definitions[i] = definition;
        }
        return definitions;
    }

    function createDateSubbedDefinitions() {
        const count = ScanFormula.DateSubField.idCount;
        const definitions = new Array<Definition>(count);
        for (let i = 0; i < count; i++) {
            const subFieldId = i as ScanFormula.DateSubFieldId;
            const definition: Definition = {
                typeId: ScanField.TypeId.DateSubbed,
                fieldId: ScanFormula.FieldId.DateSubbed,
                subFieldId,
                name: ScanFormula.DateSubField.idToName(subFieldId),
            };
            definitions[i] = definition;
        }
        return definitions;
    }
}
