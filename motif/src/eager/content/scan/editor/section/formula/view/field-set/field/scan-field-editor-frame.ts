/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    BaseNumericScanFieldCondition,
    BaseTextScanFieldCondition,
    ComparableList,
    CurrencyId,
    CurrencyOverlapsScanFieldCondition,
    DateScanFieldCondition,
    EnumInfoOutOfOrderError,
    ExchangeId,
    ExchangeOverlapsScanFieldCondition,
    FieldDataTypeId,
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
    StringId,
    StringOverlapsScanFieldCondition,
    Strings,
    TextContainsScanFieldCondition,
    TextEqualsScanFieldCondition,
    TextHasValueContainsScanFieldCondition,
    TextHasValueEqualsScanFieldCondition,
    UiBadnessComparableList,
    UnreachableCaseError,
    ValueRecentChangeTypeId
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
    private readonly _fieldValuesChangedMultiEvent = new MultiEvent<ScanFieldEditorFrame.FieldValuesChangedHandler>();
    private _conditionsOperationId = ScanField.BooleanOperationId.And;

    private _conditionCount = 0;
    private _allConditionsValid = false;
    private _xorValid = false;
    private _valid = false;
    private _errorText = '';

    private _valueChangesBeginCount = 0;
    private readonly _fieldValueChanges = new ComparableList<ScanFieldEditorFrame.Field.ValueChange>();
    private _conditionsListChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        readonly typeId: ScanField.TypeId,
        readonly fieldId: ScanFormula.FieldId,
        readonly subFieldId: Integer | undefined,
        readonly name: string,
        readonly conditions: UiBadnessComparableList<ScanFieldConditionEditorFrame>,
        readonly conditionTypeId: ScanFieldCondition.TypeId,
        private readonly _deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler,
        private readonly _validChangedEventer: ScanFieldEditorFrame.ValidChangedEventHandler,
    ) {
        this._conditionsListChangeSubscriptionId = this.conditions.subscribeAfterListChangedEvent(
            () => this.handleConditionListChangeEvent()
        );
    }

    get valid() { return this._valid; }
    get errorText() { return this._errorText; }
    get conditionsOperationId() { return this._conditionsOperationId; }
    set conditionsOperationId(value: ScanField.BooleanOperationId) {
        if (value !== this._conditionsOperationId) {
            this.beginValueChanges();
            if (this._conditionsOperationId === ScanField.BooleanOperationId.Xor) {
                this._xorValid = true;
                this.updateValidAndErrorText();
            } else {
                if (value === ScanField.BooleanOperationId.Xor) {
                    this._xorValid = this.conditions.count === 2;
                    this.updateValidAndErrorText();
                }
            }
            this._conditionsOperationId = value;
            this.addFieldValueChange(ScanFieldEditorFrame.FieldId.ConditionsOperationId, ValueRecentChangeTypeId.Update);
            this.endValueChanges();
        }
    }
    abstract get supportedOperatorIds(): readonly ScanFieldCondition.OperatorId[];

    destroy() {
        this.conditions.unsubscribeListChangeEvent(this._conditionsListChangeSubscriptionId);
        this._conditionsListChangeSubscriptionId = undefined;

        if (this.conditions.count > 0) {
            this.conditions.clear();
        }
    }

    deleteMe() {
        this._deleteMeEventer(this);
    }

    removeCondition(frame: ScanFieldConditionEditorFrame) {
        this.conditions.remove(frame);
    }

    processConditionChanged(conditionValid: boolean) {
        if (conditionValid !== this._allConditionsValid) {
            if (!conditionValid) {
                this._allConditionsValid = false;
                this.updateValidAndErrorText();
            } else {
                const allConditionsValid = this.calculateAllConditionsValid();
                if (allConditionsValid) {
                    this._allConditionsValid = true;
                    this.updateValidAndErrorText();
                }
            }
        }
    }

    createConditionEditorFrameEventers(): ScanFieldEditorFrame.ConditionEditorFrameEventers {
        return {
            deleteMeEventer: (conditionEditorFrame) => this.removeCondition(conditionEditorFrame),
            changedEventer: (valid) => this.processConditionChanged(valid),
        }
    }

    subscribeFieldValuesChangedEvent(handler: ScanFieldEditorFrame.FieldValuesChangedHandler) {
        return this._fieldValuesChangedMultiEvent.subscribe(handler);
    }

    unsubscribeFieldValuesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldValuesChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private beginValueChanges() {
        this._valueChangesBeginCount++;
    }

    private endValueChanges() {
        if (--this._valueChangesBeginCount === 0) {
            if (this._fieldValueChanges.count > 0) {
                const valueChanges = this._fieldValueChanges.toArray();
                this._fieldValueChanges.count = 0;
                this.notifyValueChanges(valueChanges);
            }
        }
    }

    private handleConditionListChangeEvent() {
        const newConditionCount = this.conditions.count;
        this.beginValueChanges();
        if (newConditionCount !== this._conditionCount) {
            if (newConditionCount > this._conditionCount) {
                this._conditionCount = newConditionCount;
                this.addFieldValueChange(ScanFieldEditorFrame.FieldId.ConditionCount, ValueRecentChangeTypeId.Increase);
            } else {
                if (newConditionCount > this._conditionCount) {
                    this._conditionCount = newConditionCount;
                    this.addFieldValueChange(ScanFieldEditorFrame.FieldId.ConditionCount, ValueRecentChangeTypeId.Decrease);
                }
            }
            this.checkXorValid(this.conditions.count);
        }
    }

    private checkXorValid(conditionCount: Integer) {
        const xorValid = this._conditionsOperationId !== ScanField.BooleanOperationId.Xor || conditionCount === 2;
        if (xorValid !== this._xorValid) {
            this._xorValid = xorValid;
            this.updateValidAndErrorText();
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

    private updateValidAndErrorText() {
        const newValid = this._allConditionsValid && this._xorValid;
        if (newValid === this._valid) {
            if (!newValid) {
                const errorText = this.calculateErrorText();
                if (errorText !== this._errorText) {
                    this.beginValueChanges();
                    this._errorText = errorText;
                    this.addFieldValueChange(ScanFieldEditorFrame.FieldId.ErrorText, ValueRecentChangeTypeId.Update);
                    this.endValueChanges();
                }
            }
        } else {
            this.beginValueChanges();
            this.addFieldValueChange(ScanFieldEditorFrame.FieldId.Valid, ValueRecentChangeTypeId.Update);
            if (!newValid) {
                const errorText = this.calculateErrorText();
                if (errorText !== this._errorText) {
                    this._errorText = errorText;
                    this.addFieldValueChange(ScanFieldEditorFrame.FieldId.ErrorText, ValueRecentChangeTypeId.Update);
                }
            }
            this.endValueChanges();
        }
    }

    private calculateErrorText(): string {
        if (this._allConditionsValid) {
            if (this._xorValid) {
                return '';
            } else {
                return Strings[StringId.ScanFieldEditor_XorRequiresExactly2Conditions];
            }
        } else {
            if (this._xorValid) {
                return Strings[StringId.ScanFieldEditor_OneOrMoreConditionsInvalid];
            } else {
                return `${Strings[StringId.ScanFieldEditor_OneOrMoreConditionsInvalid]} | ${Strings[StringId.ScanFieldEditor_XorRequiresExactly2Conditions]}`;
            }
        }
    }

    private addFieldValueChange(fieldId: ScanFieldEditorFrame.FieldId, recentChangeTypeId: ValueRecentChangeTypeId) {
        const fieldValueChanges = this._fieldValueChanges;
        const count = fieldValueChanges.count;
        for (let i = 0; i < count; i++) {
            const valueChange = fieldValueChanges.getAt(i);
            if (valueChange.fieldId === fieldId) {
                valueChange.recentChangeTypeId = recentChangeTypeId;
                return;
            }
        }
        fieldValueChanges.add({fieldId, recentChangeTypeId});
    }

    private notifyValueChanges(valueChanges: ScanFieldEditorFrame.Field.ValueChange[]) {
        if (this.isValidChanged(valueChanges)) {
            this._validChangedEventer(this, this._valid);
        }

        const handlers = this._fieldValuesChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(this, valueChanges);
        }
    }

    private isValidChanged(valueChanges: readonly ScanFieldEditorFrame.Field.ValueChange[]) {
        const count = valueChanges.length;
        for (let i = 0; i < count; i++) {
            const valueChange = valueChanges[i];
            if (valueChange.fieldId === ScanFieldEditorFrame.FieldId.Name) {
                return true;
            }
        }
        return false;
    }

    abstract addCondition(operatorId: ScanFieldCondition.OperatorId): void;
}

export namespace ScanFieldEditorFrame {
    export type DeleteMeEventHandler = (this: void, frame: ScanFieldEditorFrame) => void;
    export type FieldValuesChangedHandler = (this: void, frame: ScanFieldEditorFrame, valueChanges: Field.ValueChange[]) => void;
    export type ValidChangedEventHandler = (this: void, frame: ScanFieldEditorFrame, valid: boolean) => void;

    export interface Definition {
        readonly typeId: number;
        readonly scanFieldTypeId: ScanField.TypeId;
        readonly scanFormulaFieldId: ScanFormula.FieldId;
        readonly scanFormulaSubFieldId: Integer | undefined;
        readonly name: string;
    }

    export class DefinitionByTypeIdMap extends Map<number, ScanFieldEditorFrame.Definition> {
        constructor(definitions: readonly ScanFieldEditorFrame.Definition[]) {
            for (const definition of definitions) {
                super();
                this.set(definition.typeId, definition);
            }
        }
    }

    export class DefinitionByFieldIdsMap extends Map<Integer, ScanFieldEditorFrame.Definition> {
        constructor(definitions: readonly ScanFieldEditorFrame.Definition[]) {
            for (const definition of definitions) {
                super();
                this.setById(definition.scanFormulaFieldId, definition.scanFormulaSubFieldId, definition);
            }
        }

        getName(fieldId: ScanFormula.FieldId, subFieldId: Integer | undefined) {
            const key = this.calculateKey(fieldId, subFieldId);
            const definition = this.get(key);
            if (definition === undefined) {
                throw new AssertInternalError('SFSEFDBIMGBI33321');
            } else {
                return definition.name;
            }
        }

        setById(fieldId: ScanFormula.FieldId, subFieldId: Integer | undefined, value: ScanFieldEditorFrame.Definition) {
            const key = this.calculateKey(fieldId, subFieldId);
            this.set(key, value)
        }

        private calculateKey(fieldId: ScanFormula.FieldId, subFieldId: Integer | undefined): Integer {
            let key = fieldId * ScanFormula.maxSubFieldIdCount;
            if (subFieldId !== undefined) {
                key += subFieldId + 1;
            }
            return key;
        }
    }

    export const allDefinitions = calculateAllDefinitions();
    export const definitionByTypeIdMap = new DefinitionByTypeIdMap(allDefinitions);
    export const definitionByFieldIdsMap = new DefinitionByFieldIdsMap(allDefinitions);

    export interface ConditionEditorFrameEventers {
        readonly deleteMeEventer: ScanFieldConditionEditorFrame.DeleteMeEventer;
        readonly changedEventer: ScanFieldConditionEditorFrame.ChangedEventer;
    }

    export const altCodeSubFieldNamePrefix = 'altcode/'
    export const attributeSubFieldNamePrefix = 'attr/'

    export class ConditionFactory implements ScanField.ConditionFactory {
        createNumericComparisonWithHasValue(field: ScanField, operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId): Result<NumericComparisonScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new HasValueNumericComparisonScanFieldConditionEditorFrame(operatorId, deleteMeEventer, changedEventer));
        }
        createNumericComparisonWithValue(field: ScanField, operatorId: NumericComparisonScanFieldCondition.ValueOperands.OperatorId, value: number): Result<NumericComparisonScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new ValueNumericComparisonScanFieldConditionEditorFrame(operatorId, value, deleteMeEventer, changedEventer));
        }
        createNumericComparisonWithRange(field: ScanField, operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId, min: number | undefined, max: number | undefined): Result<NumericComparisonScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new RangeNumericComparisonScanFieldConditionEditorFrame(operatorId, min, max, deleteMeEventer, changedEventer));
        }
        createNumericWithHasValue(field: ScanField, operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId): Result<NumericScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new HasValueNumericScanFieldConditionEditorFrame(operatorId, deleteMeEventer, changedEventer));
        }
        createNumericWithValue(field: ScanField, operatorId: NumericScanFieldCondition.ValueOperands.OperatorId, value: number): Result<NumericScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new ValueNumericScanFieldConditionEditorFrame(operatorId, value, deleteMeEventer, changedEventer));
        }
        createNumericWithRange(field: ScanField, operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId, min: number | undefined, max: number | undefined): Result<NumericScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new RangeNumericScanFieldConditionEditorFrame(operatorId, min, max, deleteMeEventer, changedEventer));
        }
        createDateWithHasValue(field: ScanField, operatorId: DateScanFieldCondition.HasValueOperands.OperatorId): Result<DateScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new HasValueDateScanFieldConditionEditorFrame(operatorId, deleteMeEventer, changedEventer));
        }
        createDateWithEquals(field: ScanField, operatorId: DateScanFieldCondition.ValueOperands.OperatorId, value: SourceTzOffsetDateTime): Result<DateScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new ValueDateScanFieldConditionEditorFrame(operatorId, value, deleteMeEventer, changedEventer));
        }
        createDateWithRange(field: ScanField, operatorId: DateScanFieldCondition.RangeOperands.OperatorId, min: SourceTzOffsetDateTime | undefined, max: SourceTzOffsetDateTime | undefined): Result<DateScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new RangeDateScanFieldConditionEditorFrame(operatorId, min, max, deleteMeEventer, changedEventer));
        }
        createTextEquals(field: ScanField, operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId, value: string): Result<TextEqualsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new TextEqualsScanFieldConditionEditorFrame(operatorId, value, deleteMeEventer, changedEventer));
        }
        createTextContains(field: ScanField, operatorId: BaseTextScanFieldCondition.ContainsOperands.OperatorId, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<TextContainsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new TextContainsScanFieldConditionEditorFrame(operatorId, value, asId, ignoreCase, deleteMeEventer, changedEventer));
        }
        createTextHasValueEqualsWithHasValue(field: ScanField, operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId): Result<TextHasValueEqualsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new HasValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId, deleteMeEventer, changedEventer));
        }
        createTextHasValueEqualsWithValue(field: ScanField, operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId, value: string): Result<TextHasValueEqualsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new ValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId, value, deleteMeEventer, changedEventer));
        }
        createTextHasValueContainsWithHasValue(field: ScanField, operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId): Result<TextHasValueContainsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new HasValueTextHasValueContainsScanFieldConditionEditorFrame(operatorId, deleteMeEventer, changedEventer));
        }
        createTextHasValueContainsWithContains(field: ScanField, operatorId: BaseTextScanFieldCondition.ContainsOperands.OperatorId, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<TextHasValueContainsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new ContainsTextHasValueContainsScanFieldConditionEditorFrame(operatorId, value, asId, ignoreCase, deleteMeEventer, changedEventer));
        }
        createStringOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly string[]): Result<StringOverlapsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new StringOverlapsScanFieldConditionEditorFrame(operatorId, values, deleteMeEventer, changedEventer));
        }
        createCurrencyOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly CurrencyId[]): Result<CurrencyOverlapsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new CurrencyOverlapsScanFieldConditionEditorFrame(operatorId, values, deleteMeEventer, changedEventer));
        }
        createExchangeOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly ExchangeId[]): Result<ExchangeOverlapsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new ExchangeOverlapsScanFieldConditionEditorFrame(operatorId, values, deleteMeEventer, changedEventer));
        }
        createMarketOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly MarketId[]): Result<MarketOverlapsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new MarketOverlapsScanFieldConditionEditorFrame(operatorId, values, deleteMeEventer, changedEventer));
        }
        createMarketBoardOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly MarketBoardId[]): Result<MarketBoardOverlapsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new MarketBoardOverlapsScanFieldConditionEditorFrame(operatorId, values, deleteMeEventer, changedEventer));
        }
        createIs(field: ScanField, operatorId: IsScanFieldCondition.Operands.OperatorId, categoryId: ScanFormula.IsNode.CategoryId): Result<IsScanFieldCondition> {
            const { deleteMeEventer, changedEventer } = this.createFieldEventers(field);
            return new Ok(new IsScanFieldConditionEditorFrame(operatorId, categoryId, deleteMeEventer, changedEventer));
        }

        private createFieldEventers(field: ScanField) {
            const fieldEditorFrame = field as ScanFieldEditorFrame;
            return fieldEditorFrame.createConditionEditorFrameEventers();
        }
    }

    class DefinitionIdGenerator {
        private _id = 0;

        generateId() {
            return this._id++;
        }
    }

    function calculateAllDefinitions(): readonly Definition[] {
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
            const definitionIdGenerator = new DefinitionIdGenerator();

            const subbed = ScanFormula.Field.idIsSubbed(fieldId);
            if (subbed) {
                const subbedDefinitions = createSubbedDefinitions(fieldId, definitionIdGenerator);
                definitionList.addRange(subbedDefinitions);
            } else {
                const notSubbedDefinition = createNotSubbedDefinition(fieldId, definitionIdGenerator);
                definitionList.add(notSubbedDefinition);
            }
        }

        return definitionList.toArray();
    }

    function createNotSubbedDefinition(fieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator) {
        const styleId = ScanFormula.Field.idToStyleId(fieldId);
        switch (styleId) {
            case ScanFormula.Field.StyleId.InRange: return createInRangeDefinition(fieldId, definitionIdGenerator);
            case ScanFormula.Field.StyleId.Overlaps: return createOverlapsDefinition(fieldId, definitionIdGenerator);
            case ScanFormula.Field.StyleId.Equals: return createEqualsDefinition(fieldId, definitionIdGenerator);
            case ScanFormula.Field.StyleId.HasValueEquals: return createHasValueEqualsDefinition(fieldId, definitionIdGenerator);
            case ScanFormula.Field.StyleId.Contains:  return createContainsDefinition(fieldId, definitionIdGenerator);
            default:
                throw new UnreachableCaseError('SFEFCSDD59136', styleId);
        }
    }

    function createInRangeDefinition(scanFormulaFieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator): Definition {
        const name = ScanFormula.Field.idToName(scanFormulaFieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(scanFormulaFieldId);
        switch (dataTypeId) {
            case ScanFormula.Field.DataTypeId.Numeric:
                return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.NumericInRange, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
            case ScanFormula.Field.DataTypeId.Date:
                return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.DateInRange, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
            case ScanFormula.Field.DataTypeId.Text:
            case ScanFormula.Field.DataTypeId.Boolean:
                throw new AssertInternalError('SFEFCIRDTB35199', dataTypeId.toString());
            default:
                throw new UnreachableCaseError('SFEFCIRDD35199', dataTypeId);
        }
    }

    function createOverlapsDefinition(scanFormulaFieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator): Definition {
        const dataTypeId = ScanFormula.Field.idToDataTypeId(scanFormulaFieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCOD55598');
        } else {
            const name = ScanFormula.Field.idToName(scanFormulaFieldId);
            const textFieldId = scanFormulaFieldId as ScanFormula.TextOverlapFieldId;
            switch (textFieldId) {
                case ScanFormula.FieldId.Category:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.StringOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.Currency:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.CurrencyOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.Exchange:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.ExchangeOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.Market:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.MarketOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.MarketBoard:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.MarketBoardOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.QuotationBasis:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.StringOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.TradingStateName:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.StringOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.StatusNote:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.StringOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.TradingMarket:
                    return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.MarketOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                default:
                    throw new UnreachableCaseError('SFEFCOD45456', textFieldId);
            }
        }

    }

    function createEqualsDefinition(scanFormulaFieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator): Definition {
        const name = ScanFormula.Field.idToName(scanFormulaFieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(scanFormulaFieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCED55598');
        } else {
            return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.TextEquals, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
        }
    }

    function createHasValueEqualsDefinition(scanFormulaFieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator): Definition {
        const name = ScanFormula.Field.idToName(scanFormulaFieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(scanFormulaFieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCHVED55598');
        } else {
            return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.TextHasValueEquals, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
        }
    }

    function createContainsDefinition(scanFormulaFieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator): Definition {
        const name = ScanFormula.Field.idToName(scanFormulaFieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(scanFormulaFieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCCD55598');
        } else {
            return { typeId: definitionIdGenerator.generateId(), scanFieldTypeId: ScanField.TypeId.TextContains, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
        }
    }


    function createSubbedDefinitions(fieldId: ScanFormula.SubbedFieldId, definitionIdGenerator: DefinitionIdGenerator) {
        switch (fieldId) {
            case ScanFormula.FieldId.AltCodeSubbed:
                return createAltCodeSubbedDefinitions(definitionIdGenerator);
            case ScanFormula.FieldId.AttributeSubbed:
                return createAttributeSubbedDefinitions(definitionIdGenerator);
            case ScanFormula.FieldId.DateSubbed:
                return createDateSubbedDefinitions(definitionIdGenerator);
            case ScanFormula.FieldId.PriceSubbed:
                return createPriceSubbedDefinitions(definitionIdGenerator);
            default:
                throw new UnreachableCaseError('SFEFCN39997', fieldId);
        }
    }

    function createAltCodeSubbedDefinitions(definitionIdGenerator: DefinitionIdGenerator) {
        const count = ScanFormula.AltCodeSubField.idCount;
        const definitions = new Array<Definition>(count);
        for (let i = 0; i < count; i++) {
            const scanFormulaSubFieldId = i as ScanFormula.AltCodeSubFieldId;
            const definition: Definition = {
                typeId: definitionIdGenerator.generateId(),
                scanFieldTypeId: ScanField.TypeId.AltCodeSubbed,
                scanFormulaFieldId: ScanFormula.FieldId.AltCodeSubbed,
                scanFormulaSubFieldId,
                name: altCodeSubFieldNamePrefix + ScanFormula.AltCodeSubField.idToName(scanFormulaSubFieldId),
            };
            definitions[i] = definition;
        }
        return definitions;
    }

    function createAttributeSubbedDefinitions(definitionIdGenerator: DefinitionIdGenerator) {
        const count = ScanFormula.AttributeSubField.idCount;
        const definitions = new Array<Definition>(count);
        for (let i = 0; i < count; i++) {
            const scanFormulaSubFieldId = i as ScanFormula.AttributeSubFieldId;
            const definition: Definition = {
                typeId: definitionIdGenerator.generateId(),
                scanFieldTypeId: ScanField.TypeId.AttributeSubbed,
                scanFormulaFieldId: ScanFormula.FieldId.AttributeSubbed,
                scanFormulaSubFieldId,
                name: attributeSubFieldNamePrefix + ScanFormula.AttributeSubField.idToName(scanFormulaSubFieldId),
            };
            definitions[i] = definition;
        }
        return definitions;
    }

    function createPriceSubbedDefinitions(definitionIdGenerator: DefinitionIdGenerator) {
        const count = ScanFormula.PriceSubField.idCount;
        const definitions = new Array<Definition>(count);
        for (let i = 0; i < count; i++) {
            const scanFormulaSubFieldId = i as ScanFormula.PriceSubFieldId;
            const definition: Definition = {
                typeId: definitionIdGenerator.generateId(),
                scanFieldTypeId: ScanField.TypeId.PriceSubbed,
                scanFormulaFieldId: ScanFormula.FieldId.PriceSubbed,
                scanFormulaSubFieldId,
                name: ScanFormula.PriceSubField.idToName(scanFormulaSubFieldId),
            };
            definitions[i] = definition;
        }
        return definitions;
    }

    function createDateSubbedDefinitions(definitionIdGenerator: DefinitionIdGenerator) {
        const count = ScanFormula.DateSubField.idCount;
        const definitions = new Array<Definition>(count);
        for (let i = 0; i < count; i++) {
            const scanFormulaSubFieldId = i as ScanFormula.DateSubFieldId;
            const definition: Definition = {
                typeId: definitionIdGenerator.generateId(),
                scanFieldTypeId: ScanField.TypeId.DateSubbed,
                scanFormulaFieldId: ScanFormula.FieldId.DateSubbed,
                scanFormulaSubFieldId,
                name: ScanFormula.DateSubField.idToName(scanFormulaSubFieldId),
            };
            definitions[i] = definition;
        }
        return definitions;
    }

    export const enum FieldId {
        Name,
        Valid,
        ErrorText,
        ConditionsOperationId,
        ConditionCount,
    }

    export namespace Field {
        export type Id = FieldId;

        export interface ValueChange {
            fieldId: Id;
            recentChangeTypeId: ValueRecentChangeTypeId;
        }

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldEditorFrameFieldHeading_Name,
            },
            Valid: {
                id: FieldId.Valid,
                name: 'Valid',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.ScanFieldEditorFrameFieldHeading_Valid,
            },
            ErrorText: {
                id: FieldId.ErrorText,
                name: 'ErrorText',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldEditorFrameFieldHeading_ErrorText,
            },
            ConditionsOperationId: {
                id: FieldId.ConditionsOperationId,
                name: 'ConditionsOperationId',
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.ScanFieldEditorFrameFieldHeading_ConditionsOperationId,
            },
            ConditionCount: {
                id: FieldId.ConditionCount,
                name: 'ConditionCount',
                dataTypeId: FieldDataTypeId.Integer,
                headingId: StringId.ScanFieldEditorFrameFieldHeading_ConditionCount,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;
        export const allIds = calculateAllIds();

        function calculateAllIds(): readonly FieldId[] {
            const result = new Array<FieldId>(idCount);
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                const id = i as FieldId;
                if (info.id !== i as FieldId) {
                    throw new EnumInfoOutOfOrderError('ScanFieldEditorFrame.FieldId', i, `${idToName(id)}`);
                } else {
                    result[i] = info.id;
                }
            }
            return result;
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }
    }
}
