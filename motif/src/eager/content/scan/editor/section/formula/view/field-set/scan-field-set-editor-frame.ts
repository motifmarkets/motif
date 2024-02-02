/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AltCodeSubbedScanField,
    AssertInternalError,
    AttributeSubbedScanField,
    ChangeSubscribableComparableList,
    CurrencyOverlapsScanField,
    DateInRangeScanField,
    DateSubbedScanField,
    ExchangeOverlapsScanField,
    Integer,
    IsScanField,
    MarketBoardOverlapsScanField,
    MarketOverlapsScanField,
    MultiEvent,
    NumericInRangeScanField,
    Ok,
    PriceSubbedScanField,
    Result,
    ScanField,
    ScanFieldSet,
    ScanFieldSetLoadError,
    ScanFormula,
    StringOverlapsScanField,
    TextContainsScanField,
    TextEqualsScanField,
    TextHasValueEqualsScanField,
    UnreachableCaseError,
    UsableListChangeTypeId,
} from '@motifmarkets/motif-core';
import {
    AltCodeSubbedScanFieldEditorFrame,
    AttributeSubbedScanFieldEditorFrame,
    CurrencyOverlapsScanFieldEditorFrame,
    DateInRangeScanFieldEditorFrame,
    DateSubbedScanFieldEditorFrame,
    ExchangeOverlapsScanFieldEditorFrame,
    IsScanFieldEditorFrame,
    MarketBoardOverlapsScanFieldEditorFrame,
    MarketOverlapsScanFieldEditorFrame,
    NumericInRangeScanFieldEditorFrame,
    PriceSubbedScanFieldEditorFrame,
    ScanFieldEditorFrame,
    StringOverlapsScanFieldEditorFrame,
    TextContainsScanFieldEditorFrame,
    TextEqualsScanFieldEditorFrame,
    TextHasValueEqualsScanFieldEditorFrame,
} from './field/internal-api';

export class ScanFieldSetEditorFrame implements ScanFieldSet {
    readonly fieldFactory: ScanFieldSetEditorFrame.FieldFactory;
    readonly conditionFactory: ScanFieldEditorFrame.ConditionFactory;
    readonly fields: ChangeSubscribableComparableList<ScanFieldEditorFrame>;
    readonly definitionByNameMap: ScanFieldSetEditorFrame.DefinitionByNameMap;
    readonly definitionByIdsMap: ScanFieldSetEditorFrame.DefinitionByIdsMap;

    loadError: ScanFieldSetLoadError | undefined;

    private readonly _allDefinitions: readonly ScanFieldEditorFrame.Definition[];

    private _valid = false;
    private _fieldListChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _validChangedEventer: ScanFieldSetEditorFrame.ValidChangedEventer,
    ) {
        this.fieldFactory = new ScanFieldSetEditorFrame.FieldFactory(this);
        this.conditionFactory = new ScanFieldEditorFrame.ConditionFactory();
        this.fields = new ChangeSubscribableComparableList<ScanFieldEditorFrame>();

        const allDefinitions = ScanFieldEditorFrame.calculateAllDefinitions();
        this._allDefinitions = allDefinitions;
        this.definitionByNameMap = new ScanFieldSetEditorFrame.DefinitionByNameMap(allDefinitions);
        this.definitionByIdsMap = new ScanFieldSetEditorFrame.DefinitionByIdsMap(allDefinitions);

        this._fieldListChangeSubscriptionId = this.fields.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleFieldListChangeEvent(listChangeTypeId, idx, count)
        );
    }

    get allDefinitions() { return this._allDefinitions; }

    destroy() {
        this.fields.unsubscribeListChangeEvent(this._fieldListChangeSubscriptionId);
        this._fieldListChangeSubscriptionId = undefined;
    }

    addField(fieldName: string) {
        const fieldEditorFrame = this.fieldFactory.createFromFieldName(fieldName);
        this.fields.add(fieldEditorFrame);
    }

    removeField(frame: ScanFieldEditorFrame) {
        this.fields.remove(frame);
    }

    processFieldChanged(frame: ScanFieldEditorFrame, valid: boolean) {
        if (valid !== this._valid) {
            if (!valid) {
                this._valid = false;
                this._validChangedEventer(valid);
            } else {
                valid = this.calculateAllFieldsValid();
                if (valid) {
                    this._valid = true;
                    this._validChangedEventer(valid);
                }
            }
        }
    }

    private handleFieldListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
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
                throw new UnreachableCaseError('SFSEFHFLCE33971', listChangeTypeId);
        }
    }

    private calculateAllFieldsValid() {
        const fields = this.fields;
        const count = fields.count;
        for (let i = 0; i < count; i++) {
            const field = fields.getAt(i);
            if (!field.valid) {
                return false;
            }
        }
        return true;
    }
}

export namespace ScanFieldSetEditorFrame {
    export type ValidChangedEventer = (this: void, valid: boolean) => void;

    export class DefinitionByNameMap extends Map<string, ScanFieldEditorFrame.Definition> {
        constructor(definitions: readonly ScanFieldEditorFrame.Definition[]) {
            for (const definition of definitions) {
                super();
                this.set(definition.name, definition);
            }
        }
    }

    export class DefinitionByIdsMap extends Map<Integer, ScanFieldEditorFrame.Definition> {
        constructor(definitions: readonly ScanFieldEditorFrame.Definition[]) {
            for (const definition of definitions) {
                super();
                this.setById(definition.fieldId, definition.subFieldId, definition);
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
    export class FieldFactory implements ScanFieldSet.FieldFactory {
        private readonly _definitionByIdsMap: DefinitionByIdsMap;
        private readonly _definitionByNameMap: DefinitionByNameMap;
        private readonly _removeFieldEditorFrameClosure: ScanFieldEditorFrame.RemoveMeEventHandler;
        private readonly _processFieldEditorFrameChangedClosure: ScanFieldEditorFrame.ChangedEventHandler;

        constructor(private readonly _frame: ScanFieldSetEditorFrame) {
            this._definitionByIdsMap = _frame.definitionByIdsMap;
            this._definitionByNameMap = _frame.definitionByNameMap;
            this._removeFieldEditorFrameClosure = (frame) => this._frame.removeField(frame);
            this._processFieldEditorFrameChangedClosure = (frame, valid) => this._frame.processFieldChanged(frame, valid);
        }

        createNumericInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.NumericRangeFieldId): Result<NumericInRangeScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createNumericInRangeScanFieldEditorFrame(fieldId, name));
        }
        createPriceSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.PriceSubFieldId): Result<PriceSubbedScanField> {
            const name = this._definitionByIdsMap.getName(ScanFormula.FieldId.PriceSubbed, subFieldId);
            return new Ok(this.createPriceSubbedScanFieldEditorFrame(subFieldId, name));
        }
        createDateInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.DateRangeFieldId): Result<DateInRangeScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createDateInRangeScanFieldEditorFrame(fieldId, name));
        }
        createDateSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.DateSubFieldId): Result<DateSubbedScanField> {
            const name = this._definitionByIdsMap.getName(ScanFormula.FieldId.DateSubbed, subFieldId);
            return new Ok(this.createDateSubbedScanFieldEditorFrame(subFieldId, name));
        }
        createTextContains(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextContainsFieldId): Result<TextContainsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createTextContainsScanFieldEditorFrame(fieldId, name));
        }
        createAltCodeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AltCodeSubFieldId): Result<AltCodeSubbedScanField> {
            const name = this._definitionByIdsMap.getName(ScanFormula.FieldId.AltCodeSubbed, subFieldId);
            return new Ok(this.createAltCodeSubbedScanFieldEditorFrame(subFieldId, name));
        }
        createAttributeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AttributeSubFieldId): Result<AttributeSubbedScanField> {
            const name = this._definitionByIdsMap.getName(ScanFormula.FieldId.AttributeSubbed, subFieldId);
            return new Ok(this.createAttributeSubbedScanFieldEditorFrame(subFieldId, name));
        }
        createTextEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextEqualsFieldId): Result<TextEqualsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createTextEqualsScanFieldEditorFrame(fieldId, name));
        }
        createTextHasValueEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextHasValueEqualsFieldId): Result<TextHasValueEqualsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createTextHasValueEqualsScanFieldEditorFrame(fieldId, name));
        }
        createStringOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.StringOverlapsFieldId): Result<StringOverlapsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createStringOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createMarketBoardOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.MarketBoard): Result<MarketBoardOverlapsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createMarketBoardOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createCurrencyOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Currency): Result<CurrencyOverlapsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createCurrencyOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createExchangeOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Exchange): Result<ExchangeOverlapsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createExchangeOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createMarketOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.MarketOverlapsFieldId): Result<MarketOverlapsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createMarketOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createIs(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Is): Result<IsScanField> {
            const name = this._definitionByIdsMap.getName(fieldId, undefined);
            return new Ok(this.createIsScanFieldEditorFrame(fieldId, name));
        }

        createFromFieldName(fieldName: string): ScanFieldEditorFrame {
            const definition = this._definitionByNameMap.get(fieldName);
            if (definition === undefined) {
                throw new AssertInternalError('SFSEFCSFEF32200', fieldName);
            } else {
                const typeId = definition.typeId;
                const fieldId = definition.fieldId;
                const subFieldId = definition.subFieldId;
                switch (typeId) {
                    case ScanField.TypeId.NumericInRange:
                        return this.createNumericInRangeScanFieldEditorFrame(fieldId as ScanFormula.NumericRangeFieldId, fieldName);
                    case ScanField.TypeId.PriceSubbed:
                        return this.createPriceSubbedScanFieldEditorFrame(subFieldId as ScanFormula.PriceSubFieldId, fieldName);
                    case ScanField.TypeId.DateInRange:
                        return this.createDateInRangeScanFieldEditorFrame(fieldId as ScanFormula.DateRangeFieldId, fieldName);
                    case ScanField.TypeId.DateSubbed:
                        return this.createDateSubbedScanFieldEditorFrame(subFieldId as ScanFormula.DateSubFieldId, fieldName);
                    case ScanField.TypeId.TextContains:
                        return this.createTextContainsScanFieldEditorFrame(fieldId as ScanFormula.TextContainsFieldId, fieldName);
                    case ScanField.TypeId.AltCodeSubbed:
                        return this.createAltCodeSubbedScanFieldEditorFrame(subFieldId as ScanFormula.AltCodeSubFieldId, fieldName);
                    case ScanField.TypeId.AttributeSubbed:
                        return this.createAttributeSubbedScanFieldEditorFrame(subFieldId as ScanFormula.AttributeSubFieldId, fieldName);
                    case ScanField.TypeId.TextEquals:
                        return this.createTextEqualsScanFieldEditorFrame(fieldId as ScanFormula.TextEqualsFieldId, fieldName);
                    case ScanField.TypeId.TextHasValueEquals:
                        return this.createTextHasValueEqualsScanFieldEditorFrame(fieldId as ScanFormula.TextHasValueEqualsFieldId, fieldName);
                    case ScanField.TypeId.StringOverlaps:
                        return this.createStringOverlapsScanFieldEditorFrame(fieldId as ScanFormula.StringOverlapsFieldId, fieldName);
                    case ScanField.TypeId.CurrencyOverlaps:
                        return this.createCurrencyOverlapsScanFieldEditorFrame(fieldId as ScanFormula.FieldId.Currency, fieldName);
                    case ScanField.TypeId.ExchangeOverlaps:
                        return this.createExchangeOverlapsScanFieldEditorFrame(fieldId as ScanFormula.FieldId.Exchange, fieldName);
                    case ScanField.TypeId.MarketOverlaps:
                        return this.createMarketOverlapsScanFieldEditorFrame(fieldId as ScanFormula.MarketOverlapsFieldId, fieldName);
                    case ScanField.TypeId.MarketBoardOverlaps:
                        return this.createMarketBoardOverlapsScanFieldEditorFrame(fieldId as ScanFormula.FieldId.MarketBoard, fieldName);
                    case ScanField.TypeId.Is:
                        return this.createIsScanFieldEditorFrame(fieldId as ScanFormula.FieldId.Is, fieldName);
                    default:
                        throw new UnreachableCaseError('SFSEFFFCSFEF11224', typeId);
                }
            }
        }

        private createNumericInRangeScanFieldEditorFrame(fieldId: ScanFormula.NumericRangeFieldId, name: string): NumericInRangeScanFieldEditorFrame {
            return new NumericInRangeScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createPriceSubbedScanFieldEditorFrame(subFieldId: ScanFormula.PriceSubFieldId, name: string): PriceSubbedScanFieldEditorFrame {
            return new PriceSubbedScanFieldEditorFrame(subFieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createDateInRangeScanFieldEditorFrame(fieldId: ScanFormula.DateRangeFieldId, name: string): DateInRangeScanFieldEditorFrame {
            return new DateInRangeScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createDateSubbedScanFieldEditorFrame(subFieldId: ScanFormula.DateSubFieldId, name: string): DateSubbedScanFieldEditorFrame {
            return new DateSubbedScanFieldEditorFrame(subFieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createTextContainsScanFieldEditorFrame(fieldId: ScanFormula.TextContainsFieldId, name: string): TextContainsScanFieldEditorFrame {
            return new TextContainsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createAltCodeSubbedScanFieldEditorFrame(subFieldId: ScanFormula.AltCodeSubFieldId, name: string): AltCodeSubbedScanFieldEditorFrame {
            return new AltCodeSubbedScanFieldEditorFrame(subFieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createAttributeSubbedScanFieldEditorFrame(subFieldId: ScanFormula.AttributeSubFieldId, name: string): AttributeSubbedScanFieldEditorFrame {
            return new AttributeSubbedScanFieldEditorFrame(subFieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createTextEqualsScanFieldEditorFrame(fieldId: ScanFormula.TextEqualsFieldId, name: string): TextEqualsScanFieldEditorFrame {
            return new TextEqualsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createTextHasValueEqualsScanFieldEditorFrame(fieldId: ScanFormula.TextHasValueEqualsFieldId, name: string): TextHasValueEqualsScanFieldEditorFrame {
            return new TextHasValueEqualsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createStringOverlapsScanFieldEditorFrame(fieldId: ScanFormula.StringOverlapsFieldId, name: string): StringOverlapsScanFieldEditorFrame {
            return new StringOverlapsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createMarketBoardOverlapsScanFieldEditorFrame(fieldId: ScanFormula.FieldId.MarketBoard, name: string): MarketBoardOverlapsScanFieldEditorFrame {
            return new MarketBoardOverlapsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createCurrencyOverlapsScanFieldEditorFrame(fieldId: ScanFormula.FieldId.Currency, name: string): CurrencyOverlapsScanFieldEditorFrame {
            return new CurrencyOverlapsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createExchangeOverlapsScanFieldEditorFrame(fieldId: ScanFormula.FieldId.Exchange, name: string): ExchangeOverlapsScanFieldEditorFrame {
            return new ExchangeOverlapsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createMarketOverlapsScanFieldEditorFrame(fieldId: ScanFormula.MarketOverlapsFieldId, name: string): MarketOverlapsScanFieldEditorFrame {
            return new MarketOverlapsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
        private createIsScanFieldEditorFrame(fieldId: ScanFormula.FieldId.Is, name: string): IsScanFieldEditorFrame {
            return new IsScanFieldEditorFrame(fieldId, name, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure);
        }
    }
}
