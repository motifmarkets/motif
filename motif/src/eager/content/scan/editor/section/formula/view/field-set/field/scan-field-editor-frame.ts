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
    ComparisonResult,
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
    ModifierComparableList,
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
    UnreachableCaseError,
    UsableListChangeTypeId,
    ValueRecentChangeTypeId,
    compareString
} from '@motifmarkets/motif-core';
import { ComponentInstanceId, RootAndNodeComponentInstanceIdPair } from 'component-internal-api';
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
    deleteMeEventer: ScanFieldEditorFrame.DeleteMeEventHandler | undefined;
    meOrMyConditionsChangedEventer: ScanFieldEditorFrame.MeOrMyConditionsChangedEventer | undefined;

    private readonly _fieldValuesChangedMultiEvent = new MultiEvent<ScanFieldEditorFrame.FieldValuesChangedHandler>();
    private _conditionsOperationId = ScanField.BooleanOperationId.And;

    private _conditionCount = 0;
    private _allConditionsValid = false;
    private _xorValid = false;
    private _valid = false;
    private _errorText = '';

    private _changesBeginCount = 0;
    private _changesModifier: ScanFieldEditorFrame.Modifier | undefined;
    private _conditionChanged = false;
    private readonly _fieldValueChanges = new ComparableList<ScanFieldEditorFrame.Field.ValueChange>();

    private _conditionsListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _conditionsAfterListChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        readonly typeId: ScanField.TypeId,
        readonly fieldId: ScanFormula.FieldId,
        readonly subFieldId: Integer | undefined,
        readonly name: string,
        readonly conditions: ScanFieldConditionEditorFrame.List<ScanFieldConditionEditorFrame>,
        readonly conditionTypeId: ScanFieldCondition.TypeId,
    ) {
        this._conditionsListChangeSubscriptionId = this.conditions.subscribeListChangeEvent(
            (usableListChangeTypeId, idx, count, modifier) => this.handleConditionListChangeEvent(
                usableListChangeTypeId, idx, count, modifier
            )
        );
        this._conditionsAfterListChangedSubscriptionId = this.conditions.subscribeAfterListChangedEvent(
            (modifier) => this.handleAfterConditionListChangedEvent(modifier)
        );
    }

    get valid() { return this._valid; }
    get errorText() { return this._errorText; }
    get conditionsOperationId() { return this._conditionsOperationId; }
    abstract get supportedOperatorIds(): readonly ScanFieldCondition.OperatorId[];

    destroy() {
        this.conditions.unsubscribeListChangeEvent(this._conditionsListChangeSubscriptionId);
        this._conditionsListChangeSubscriptionId = undefined;
        this.conditions.unsubscribeAfterListChangedEvent(this._conditionsAfterListChangedSubscriptionId);
        this._conditionsAfterListChangedSubscriptionId = undefined;

        if (this.conditions.count > 0) {
            this.conditions.clear();
        }
    }

    deleteMe(modifier: ScanFieldEditorFrame.Modifier) {
        if (this.deleteMeEventer === undefined) {
            throw new AssertInternalError('SFEFDM66873');
        } else {
            this.deleteMeEventer(modifier);
        }
    }

    setConditionsOperationId(value: ScanField.BooleanOperationId, modifier: ScanFieldEditorFrame.Modifier) {
        if (value !== this._conditionsOperationId) {
            this.beginChanges(modifier);
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
            this.endChanges();
        }
    }

    subscribeFieldValuesChangedEvent(handler: ScanFieldEditorFrame.FieldValuesChangedHandler) {
        return this._fieldValuesChangedMultiEvent.subscribe(handler);
    }

    unsubscribeFieldValuesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldValuesChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private beginChanges(modifier: ScanFieldEditorFrame.Modifier | undefined) {
        if (this._changesBeginCount++ === 0) {
            this._changesModifier = modifier;
        } else {
            if (modifier !== undefined && modifier !== this._changesModifier) {
                throw new AssertInternalError('SFEFBVC34445');
            }
        }
    }

    private endChanges() {
        if (--this._changesBeginCount === 0) {
            if (this._fieldValueChanges.count > 0 || this._conditionChanged) {
                let valueChanges: ScanFieldEditorFrame.Field.ValueChange[];
                if (this._fieldValueChanges.count === 0) {
                    valueChanges = [];
                } else {
                    valueChanges = this._fieldValueChanges.toArray();
                    this._fieldValueChanges.count = 0;
                }
                const conditionChanged = this._conditionChanged;
                this._conditionChanged = false;
                const changesModifier  = this._changesModifier;
                this._changesModifier = undefined;
                this.notifyChanges(valueChanges, conditionChanged, changesModifier);
            }
        }
    }

    private handleConditionListChangeEvent(
        listChangeTypeId: UsableListChangeTypeId,
        idx: Integer,
        count: Integer,
        _ignoredModifier: ScanFieldConditionEditorFrame.Modifier | undefined,
    ) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
            case UsableListChangeTypeId.PreUsableAdd:
            case UsableListChangeTypeId.PreUsableClear:
            case UsableListChangeTypeId.Usable:
                throw new AssertInternalError('SFEFHCLCE44553', listChangeTypeId.toString());
            case UsableListChangeTypeId.Insert: {
                this.processAfterConditionsInserted(idx, count);
                break;
            }
            case UsableListChangeTypeId.BeforeReplace:
            case UsableListChangeTypeId.AfterReplace:
            case UsableListChangeTypeId.BeforeMove:
            case UsableListChangeTypeId.AfterMove:
                break;
            case UsableListChangeTypeId.Remove: {
                this.processBeforeConditionsDelete(idx, count);
                break;
            }
            case UsableListChangeTypeId.Clear: {
                this.processBeforeConditionsDelete(0, this.conditions.count);
                break;
            }
            default:
                throw new UnreachableCaseError('SFEFHCLCE60153', listChangeTypeId);
        }
    }

    private processAfterConditionsInserted(idx: Integer, count: Integer) {
        for (let i = idx + count - 1; i >= idx; i--) {
            const conditionEditorFrame = this.conditions.getAt(i);
            conditionEditorFrame.deleteMeEventer = (modifier) => this.deleteCondition(conditionEditorFrame, modifier);
            conditionEditorFrame.changedEventer = (valid, modifier) => this.processConditionChanged(valid, modifier);
        }
    }

    private processBeforeConditionsDelete(idx: Integer, count: Integer) {
        for (let i = idx + count - 1; i >= idx; i--) {
            const conditionEditorFrame = this.conditions.getAt(i);
            conditionEditorFrame.deleteMeEventer = undefined;
            conditionEditorFrame.changedEventer = undefined;
        }
    }

    private handleAfterConditionListChangedEvent(modifier: ScanFieldConditionEditorFrame.Modifier | undefined) {
        const newConditionCount = this.conditions.count;
        this.beginChanges(modifier);
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

            let validAndErrorTextNeedUpdating = false;
            const allConditionsValid = this.calculateAllConditionsValid();
            if (allConditionsValid !== this._allConditionsValid) {
                this._allConditionsValid = allConditionsValid;
                validAndErrorTextNeedUpdating = true;
            }

            const xorValid = this._conditionsOperationId !== ScanField.BooleanOperationId.Xor || newConditionCount === 2;
            if (xorValid !== this._xorValid) {
                this._xorValid = xorValid;
                validAndErrorTextNeedUpdating = true;
                this.updateValidAndErrorText();
            }

            if (validAndErrorTextNeedUpdating) {
                this.updateValidAndErrorText();
            }
        }
        this.endChanges();
    }

    private deleteCondition(frame: ScanFieldConditionEditorFrame, modifier: ScanFieldConditionEditorFrame.Modifier) {
        this.conditions.remove(frame, modifier);
    }

    private processConditionChanged(conditionValid: boolean, modifier: ScanFieldConditionEditorFrame.Modifier) {
        this.beginChanges(modifier);
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
        this._conditionChanged = true;
        this.endChanges();
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
                    this.beginChanges(undefined);
                    this._errorText = errorText;
                    this.addFieldValueChange(ScanFieldEditorFrame.FieldId.ErrorText, ValueRecentChangeTypeId.Update);
                    this.endChanges();
                }
            }
        } else {
            this.beginChanges(undefined);
            this._valid = newValid;
            this.addFieldValueChange(ScanFieldEditorFrame.FieldId.Valid, ValueRecentChangeTypeId.Update);
            if (!newValid) {
                const errorText = this.calculateErrorText();
                if (errorText !== this._errorText) {
                    this._errorText = errorText;
                    this.addFieldValueChange(ScanFieldEditorFrame.FieldId.ErrorText, ValueRecentChangeTypeId.Update);
                }
            }
            this.endChanges();
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

    private notifyChanges(
        valueChanges: ScanFieldEditorFrame.Field.ValueChange[],
        conditionChanged: boolean,
        changesModifier: ScanFieldEditorFrame.Modifier | undefined
    ) {
        let modifierRoot: ComponentInstanceId | undefined;
        let modifierNode: ComponentInstanceId | undefined;
        if (changesModifier === undefined) {
            modifierRoot = undefined;
            modifierNode = undefined;
        } else {
            modifierRoot = changesModifier.root;
            modifierNode = changesModifier.node;
        }

        const gotValueChanges = valueChanges.length > 0;

        if ((gotValueChanges || conditionChanged) && this.meOrMyConditionsChangedEventer !== undefined) {
            this.meOrMyConditionsChangedEventer(this._valid, modifierRoot);
        }

        if (gotValueChanges) {
            const handlers = this._fieldValuesChangedMultiEvent.copyHandlers();
            for (const handler of handlers) {
                handler(this, valueChanges, modifierNode);
            }
        }
    }

    abstract addCondition(operatorId: ScanFieldCondition.OperatorId, modifier: ScanFieldEditorFrame.Modifier): void;
}

export namespace ScanFieldEditorFrame {
    export type Modifier = RootAndNodeComponentInstanceIdPair;

    export class List<T extends ScanFieldEditorFrame> extends ModifierComparableList<T, Modifier | undefined> {
        constructor() {
            super(undefined);
        }
    }
    export type DeleteMeEventHandler = (this: void, modfier: ScanFieldEditorFrame.Modifier) => void;
    export type MeOrMyConditionsChangedEventer = (this: void, valid: boolean, modifierRoot: ComponentInstanceId | undefined) => void;
    export type FieldValuesChangedHandler = (this: void, frame: ScanFieldEditorFrame, valueChanges: Field.ValueChange[], modifierNode: ComponentInstanceId | undefined) => void;

    export interface Definition {
        readonly id: number;
        readonly scanFieldTypeId: ScanField.TypeId;
        readonly scanFormulaFieldId: ScanFormula.FieldId;
        readonly scanFormulaSubFieldId: Integer | undefined;
        readonly name: string;
    }

    export namespace Definition {
        export function compareByName(left: Definition, right: Definition) {
            if (left.scanFormulaSubFieldId === undefined) {
                if (right.scanFormulaSubFieldId === undefined) {
                    return compareString(left.name, right.name);
                } else {
                    return ComparisonResult.LeftLessThanRight;
                }
            } else {
                if (right.scanFormulaSubFieldId === undefined) {
                    return ComparisonResult.LeftGreaterThanRight;
                } else {
                    if (left.scanFieldTypeId === right.scanFieldTypeId) {
                        return compareString(left.name, right.name);
                    } else {
                        return left.scanFieldTypeId - right.scanFieldTypeId;
                    }
                }
            }
        }
    }

    export class DefinitionByIdMap extends Map<number, ScanFieldEditorFrame.Definition> {
        constructor(definitions: readonly ScanFieldEditorFrame.Definition[]) {
            super();
            for (const definition of definitions) {
                this.set(definition.id, definition);
            }
        }
    }

    export class DefinitionByFieldIdsMap extends Map<Integer, ScanFieldEditorFrame.Definition> {
        constructor(definitions: readonly ScanFieldEditorFrame.Definition[]) {
            super();
            for (const definition of definitions) {
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

    export class ConditionFactory implements ScanField.ConditionFactory {
        createNumericComparisonWithHasValue(field: ScanField, operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId): Result<NumericComparisonScanFieldCondition> {
            return new Ok(new HasValueNumericComparisonScanFieldConditionEditorFrame(operatorId));
        }
        createNumericComparisonWithValue(field: ScanField, operatorId: NumericComparisonScanFieldCondition.ValueOperands.OperatorId, value: number): Result<NumericComparisonScanFieldCondition> {
            return new Ok(new ValueNumericComparisonScanFieldConditionEditorFrame(operatorId, value));
        }
        createNumericComparisonWithRange(field: ScanField, operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId, min: number | undefined, max: number | undefined): Result<NumericComparisonScanFieldCondition> {
            return new Ok(new RangeNumericComparisonScanFieldConditionEditorFrame(operatorId, min, max));
        }
        createNumericWithHasValue(field: ScanField, operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId): Result<NumericScanFieldCondition> {
            return new Ok(new HasValueNumericScanFieldConditionEditorFrame(operatorId));
        }
        createNumericWithValue(field: ScanField, operatorId: NumericScanFieldCondition.ValueOperands.OperatorId, value: number): Result<NumericScanFieldCondition> {
            return new Ok(new ValueNumericScanFieldConditionEditorFrame(operatorId, value));
        }
        createNumericWithRange(field: ScanField, operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId, min: number | undefined, max: number | undefined): Result<NumericScanFieldCondition> {
            return new Ok(new RangeNumericScanFieldConditionEditorFrame(operatorId, min, max));
        }
        createDateWithHasValue(field: ScanField, operatorId: DateScanFieldCondition.HasValueOperands.OperatorId): Result<DateScanFieldCondition> {
            return new Ok(new HasValueDateScanFieldConditionEditorFrame(operatorId));
        }
        createDateWithEquals(field: ScanField, operatorId: DateScanFieldCondition.ValueOperands.OperatorId, value: SourceTzOffsetDateTime): Result<DateScanFieldCondition> {
            return new Ok(new ValueDateScanFieldConditionEditorFrame(operatorId, value));
        }
        createDateWithRange(field: ScanField, operatorId: DateScanFieldCondition.RangeOperands.OperatorId, min: SourceTzOffsetDateTime | undefined, max: SourceTzOffsetDateTime | undefined): Result<DateScanFieldCondition> {
            return new Ok(new RangeDateScanFieldConditionEditorFrame(operatorId, min, max));
        }
        createTextEquals(field: ScanField, operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId, value: string): Result<TextEqualsScanFieldCondition> {
            return new Ok(new TextEqualsScanFieldConditionEditorFrame(operatorId, value));
        }
        createTextContains(field: ScanField, operatorId: BaseTextScanFieldCondition.ContainsOperands.OperatorId, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<TextContainsScanFieldCondition> {
            return new Ok(new TextContainsScanFieldConditionEditorFrame(operatorId, value, asId, ignoreCase));
        }
        createTextHasValueEqualsWithHasValue(field: ScanField, operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId): Result<TextHasValueEqualsScanFieldCondition> {
            return new Ok(new HasValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId));
        }
        createTextHasValueEqualsWithValue(field: ScanField, operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId, value: string): Result<TextHasValueEqualsScanFieldCondition> {
            return new Ok(new ValueTextHasValueEqualsScanFieldConditionEditorFrame(operatorId, value));
        }
        createTextHasValueContainsWithHasValue(field: ScanField, operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId): Result<TextHasValueContainsScanFieldCondition> {
            return new Ok(new HasValueTextHasValueContainsScanFieldConditionEditorFrame(operatorId));
        }
        createTextHasValueContainsWithContains(field: ScanField, operatorId: BaseTextScanFieldCondition.ContainsOperands.OperatorId, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<TextHasValueContainsScanFieldCondition> {
            return new Ok(new ContainsTextHasValueContainsScanFieldConditionEditorFrame(operatorId, value, asId, ignoreCase));
        }
        createStringOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly string[]): Result<StringOverlapsScanFieldCondition> {
            return new Ok(new StringOverlapsScanFieldConditionEditorFrame(operatorId, values));
        }
        createCurrencyOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly CurrencyId[]): Result<CurrencyOverlapsScanFieldCondition> {
            return new Ok(new CurrencyOverlapsScanFieldConditionEditorFrame(operatorId, values));
        }
        createExchangeOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly ExchangeId[]): Result<ExchangeOverlapsScanFieldCondition> {
            return new Ok(new ExchangeOverlapsScanFieldConditionEditorFrame(operatorId, values));
        }
        createMarketOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly MarketId[]): Result<MarketOverlapsScanFieldCondition> {
            return new Ok(new MarketOverlapsScanFieldConditionEditorFrame(operatorId, values));
        }
        createMarketBoardOverlaps(field: ScanField, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly MarketBoardId[]): Result<MarketBoardOverlapsScanFieldCondition> {
            return new Ok(new MarketBoardOverlapsScanFieldConditionEditorFrame(operatorId, values));
        }
        createIs(field: ScanField, operatorId: IsScanFieldCondition.Operands.OperatorId, categoryId: ScanFormula.IsNode.CategoryId): Result<IsScanFieldCondition> {
            return new Ok(new IsScanFieldConditionEditorFrame(operatorId, categoryId));
        }
    }

    class DefinitionIdGenerator {
        private _typeId = 0;

        generateTypeId() {
            return this._typeId++;
        }
    }

    export const altCodeSubFieldNamePrefix = 'altcode/'
    export const attributeSubFieldNamePrefix = 'attr/'

    export const allDefinitions = calculateAllDefinitions();
    export const definitionByIdMap = new DefinitionByIdMap(allDefinitions);
    export const definitionByFieldIdsMap = new DefinitionByFieldIdsMap(allDefinitions);

    function calculateAllDefinitions(): readonly Definition[] {
        const definitionList = new ComparableList<Definition>();
        const approxDefinitionCount =
            ScanFormula.Field.idCount +
            ScanFormula.PriceSubField.idCount +
            ScanFormula.DateSubField.idCount +
            ScanFormula.AltCodeSubField.idCount +
            ScanFormula.AttributeSubField.idCount;
        definitionList.capacity = approxDefinitionCount;

        const definitionIdGenerator = new DefinitionIdGenerator();

        for (let i = 0; i < ScanFormula.Field.idCount; i++) {
            const fieldId = i as ScanFormula.FieldId;

            const subbed = ScanFormula.Field.idIsSubbed(fieldId);
            if (subbed) {
                const subbedDefinitions = createSubbedDefinitions(fieldId, definitionIdGenerator);
                definitionList.addRange(subbedDefinitions);
            } else {
                const notSubbedDefinition = createNotSubbedDefinition(fieldId, definitionIdGenerator);
                definitionList.add(notSubbedDefinition);
            }
        }

        definitionList.sort((left, right) => Definition.compareByName(left, right));

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
                return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.NumericInRange, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
            case ScanFormula.Field.DataTypeId.Date:
                return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.DateInRange, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
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
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.StringOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.Currency:
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.CurrencyOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.Exchange:
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.ExchangeOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.Market:
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.MarketOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.MarketBoard:
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.MarketBoardOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.QuotationBasis:
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.StringOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.TradingStateName:
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.StringOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.StatusNote:
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.StringOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                case ScanFormula.FieldId.TradingMarket:
                    return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.MarketOverlaps, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
                default:
                    throw new UnreachableCaseError('SFEFCOD45456', textFieldId);
            }
        }

    }

    function createEqualsDefinition(scanFormulaFieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator): Definition {
        const name = ScanFormula.Field.idToName(scanFormulaFieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(scanFormulaFieldId);

        switch (dataTypeId) {
            case ScanFormula.Field.DataTypeId.Numeric:
                throw new AssertInternalError('SFEFCEDN35199', dataTypeId.toString());
            case ScanFormula.Field.DataTypeId.Date:
                throw new AssertInternalError('SFEFCEDD35199', dataTypeId.toString());
            case ScanFormula.Field.DataTypeId.Text:
                return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.TextEquals, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
            case ScanFormula.Field.DataTypeId.Boolean:
                return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.Is, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
            default:
                throw new UnreachableCaseError('SFEFCEDU35199', dataTypeId);
        }
    }

    function createHasValueEqualsDefinition(scanFormulaFieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator): Definition {
        const name = ScanFormula.Field.idToName(scanFormulaFieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(scanFormulaFieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCHVED55598');
        } else {
            return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.TextHasValueEquals, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
        }
    }

    function createContainsDefinition(scanFormulaFieldId: ScanFormula.FieldId, definitionIdGenerator: DefinitionIdGenerator): Definition {
        const name = ScanFormula.Field.idToName(scanFormulaFieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(scanFormulaFieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFEFCCD55598');
        } else {
            return { id: definitionIdGenerator.generateTypeId(), scanFieldTypeId: ScanField.TypeId.TextContains, scanFormulaFieldId, scanFormulaSubFieldId: undefined, name };
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
                id: definitionIdGenerator.generateTypeId(),
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
                id: definitionIdGenerator.generateTypeId(),
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
                id: definitionIdGenerator.generateTypeId(),
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
                id: definitionIdGenerator.generateTypeId(),
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
