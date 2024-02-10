/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AltCodeSubbedScanField,
    AssertInternalError,
    AttributeSubbedScanField,
    BadnessComparableList,
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
    UsableListChangeTypeId
} from '@motifmarkets/motif-core';
import { IdentifiableComponent } from '../../../../../../../component/internal-api';
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

export class ScanFieldSetEditorFrame implements ScanFieldSet<IdentifiableComponent> {
    readonly fieldFactory: ScanFieldSetEditorFrame.FieldFactory;
    readonly conditionFactory: ScanFieldEditorFrame.ConditionFactory;
    readonly fields: BadnessComparableList<ScanFieldEditorFrame>;

    private readonly _changedMultiEvent = new MultiEvent<ScanFieldSetEditorFrame.ChangedEventHandler>();

    private _valid = false;
    private _loadError: ScanFieldSetLoadError | undefined;
    private _loading = false;

    private readonly _allFieldDefinitions: readonly ScanFieldEditorFrame.Definition[];

    private _fieldListChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor() {
        this.fieldFactory = new ScanFieldSetEditorFrame.FieldFactory(this);
        this.conditionFactory = new ScanFieldEditorFrame.ConditionFactory();
        this.fields = new BadnessComparableList<ScanFieldEditorFrame>();

        this._fieldListChangeSubscriptionId = this.fields.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleFieldListChangeEvent(listChangeTypeId, idx, count)
        );
    }

    get valid() { return this._valid; }
    get loadError() { return this._loadError; }
    set loadError(value: ScanFieldSetLoadError | undefined) {
        if (ScanFieldSetLoadError.isUndefinableEqual(value, this._loadError)) {
            this._loadError = value;
        }
    }
    get allDefinitions() { return this._allFieldDefinitions; }

    destroy() {
        this.fields.unsubscribeListChangeEvent(this._fieldListChangeSubscriptionId);
        this._fieldListChangeSubscriptionId = undefined;
    }

    addField(definitionId: number) {
        const fieldEditorFrame = this.fieldFactory.createFromDefinitionId(definitionId);
        this.fields.add(fieldEditorFrame);
    }

    deleteField(frame: ScanFieldEditorFrame) {
        this.fields.remove(frame);
    }

    processFieldChanged(_fieldEditorFrame: ScanFieldEditorFrame, valid: boolean, modifierRoot: IdentifiableComponent | undefined) {
        if (!this._loading) {
            let framePropertiesChanged: boolean;
            if (valid === this._valid) {
                framePropertiesChanged = false;
            } else {
                if (!valid) {
                    this._valid = false;
                    framePropertiesChanged = true;
                } else {
                    valid = this.calculateAllFieldsValid();
                    if (!valid) {
                        framePropertiesChanged = false;
                    } else {
                        this._valid = true;
                        framePropertiesChanged = true;
                    }
                }
            }
            this.notifyChanged(framePropertiesChanged, modifierRoot);
        }
    }

    beginLoad() {
        this._loading = true;
        this._loadError = undefined;
    }

    endLoad(loadError: ScanFieldSetLoadError | undefined) {
        this._loading = false;
        let framePropertiesChanged = false;
        if (ScanFieldSetLoadError.isUndefinableEqual(loadError, this._loadError)) {
            this._loadError = loadError;
            framePropertiesChanged = true;
        }

        const valid = loadError === undefined;
        if (valid !== this._valid) {
            this._valid = valid;
            framePropertiesChanged = true;
        }

        if (framePropertiesChanged) {
            // We only want to notify if ScanFieldSetEditorFrame properties have changed
            this.notifyChanged(true, undefined);
        }
    }

    subscribeChangedEvent(handler: ScanFieldSetEditorFrame.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
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

    private notifyChanged(framePropertiesChanged: boolean, modifierRoot: IdentifiableComponent | undefined) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(framePropertiesChanged, modifierRoot);
        }
    }
}

export namespace ScanFieldSetEditorFrame {
    export type ChangedEventHandler = (this: void, framePropertiesChanged: boolean, modifierRoot: IdentifiableComponent | undefined) => void;

    export class FieldFactory implements ScanFieldSet.FieldFactory<IdentifiableComponent> {
        private readonly _deleteFieldEditorFrameClosure: ScanFieldEditorFrame.DeleteMeEventHandler;
        private readonly _processFieldEditorFrameChangedClosure: ScanFieldEditorFrame.MeOrMyConditionsChangedEventer;

        constructor(private readonly _setFrame: ScanFieldSetEditorFrame) {
            this._deleteFieldEditorFrameClosure = (frame) => this._setFrame.deleteField(frame);
            this._processFieldEditorFrameChangedClosure =
                (frame, valid, modifierNode) => this._setFrame.processFieldChanged(frame, valid, modifierNode);
        }

        createNumericInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.NumericRangeFieldId): Result<NumericInRangeScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createNumericInRangeScanFieldEditorFrame(fieldId, name));
        }
        createPriceSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.PriceSubFieldId): Result<PriceSubbedScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(ScanFormula.FieldId.PriceSubbed, subFieldId);
            return new Ok(this.createPriceSubbedScanFieldEditorFrame(subFieldId, name));
        }
        createDateInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.DateRangeFieldId): Result<DateInRangeScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createDateInRangeScanFieldEditorFrame(fieldId, name));
        }
        createDateSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.DateSubFieldId): Result<DateSubbedScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(ScanFormula.FieldId.DateSubbed, subFieldId);
            return new Ok(this.createDateSubbedScanFieldEditorFrame(subFieldId, name));
        }
        createTextContains(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextContainsFieldId): Result<TextContainsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createTextContainsScanFieldEditorFrame(fieldId, name));
        }
        createAltCodeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AltCodeSubFieldId): Result<AltCodeSubbedScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(ScanFormula.FieldId.AltCodeSubbed, subFieldId);
            return new Ok(this.createAltCodeSubbedScanFieldEditorFrame(subFieldId, name));
        }
        createAttributeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AttributeSubFieldId): Result<AttributeSubbedScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(ScanFormula.FieldId.AttributeSubbed, subFieldId);
            return new Ok(this.createAttributeSubbedScanFieldEditorFrame(subFieldId, name));
        }
        createTextEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextEqualsFieldId): Result<TextEqualsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createTextEqualsScanFieldEditorFrame(fieldId, name));
        }
        createTextHasValueEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextHasValueEqualsFieldId): Result<TextHasValueEqualsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createTextHasValueEqualsScanFieldEditorFrame(fieldId, name));
        }
        createStringOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.StringOverlapsFieldId): Result<StringOverlapsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createStringOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createMarketBoardOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.MarketBoard): Result<MarketBoardOverlapsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createMarketBoardOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createCurrencyOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Currency): Result<CurrencyOverlapsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createCurrencyOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createExchangeOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Exchange): Result<ExchangeOverlapsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createExchangeOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createMarketOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.MarketOverlapsFieldId): Result<MarketOverlapsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createMarketOverlapsScanFieldEditorFrame(fieldId, name));
        }
        createIs(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Is): Result<IsScanField> {
            const name = ScanFieldEditorFrame.definitionByFieldIdsMap.getName(fieldId, undefined);
            return new Ok(this.createIsScanFieldEditorFrame(fieldId, name));
        }

        createFromDefinitionId(definitionId: number): ScanFieldEditorFrame {
            const definition = ScanFieldEditorFrame.definitionByTypeIdMap.get(definitionId);
            if (definition === undefined) {
                throw new AssertInternalError('SFSEFCSFEF32200', definitionId.toString());
            } else {
                const scanFieldTypeId = definition.scanFieldTypeId;
                const fieldId = definition.scanFormulaFieldId;
                const subFieldId = definition.scanFormulaSubFieldId;
                const fieldName = definition.name;
                switch (scanFieldTypeId) {
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
                        throw new UnreachableCaseError('SFSEFFFCSFEF11224', scanFieldTypeId);
                }
            }
        }

        private createNumericInRangeScanFieldEditorFrame(fieldId: ScanFormula.NumericRangeFieldId, name: string): NumericInRangeScanFieldEditorFrame {
            return new NumericInRangeScanFieldEditorFrame(fieldId, name);
        }
        private createPriceSubbedScanFieldEditorFrame(subFieldId: ScanFormula.PriceSubFieldId, name: string): PriceSubbedScanFieldEditorFrame {
            return new PriceSubbedScanFieldEditorFrame(subFieldId, name);
        }
        private createDateInRangeScanFieldEditorFrame(fieldId: ScanFormula.DateRangeFieldId, name: string): DateInRangeScanFieldEditorFrame {
            return new DateInRangeScanFieldEditorFrame(fieldId, name);
        }
        private createDateSubbedScanFieldEditorFrame(subFieldId: ScanFormula.DateSubFieldId, name: string): DateSubbedScanFieldEditorFrame {
            return new DateSubbedScanFieldEditorFrame(subFieldId, name);
        }
        private createTextContainsScanFieldEditorFrame(fieldId: ScanFormula.TextContainsFieldId, name: string): TextContainsScanFieldEditorFrame {
            return new TextContainsScanFieldEditorFrame(fieldId, name);
        }
        private createAltCodeSubbedScanFieldEditorFrame(subFieldId: ScanFormula.AltCodeSubFieldId, name: string): AltCodeSubbedScanFieldEditorFrame {
            return new AltCodeSubbedScanFieldEditorFrame(subFieldId, name);
        }
        private createAttributeSubbedScanFieldEditorFrame(subFieldId: ScanFormula.AttributeSubFieldId, name: string): AttributeSubbedScanFieldEditorFrame {
            return new AttributeSubbedScanFieldEditorFrame(subFieldId, name);
        }
        private createTextEqualsScanFieldEditorFrame(fieldId: ScanFormula.TextEqualsFieldId, name: string): TextEqualsScanFieldEditorFrame {
            return new TextEqualsScanFieldEditorFrame(fieldId, name);
        }
        private createTextHasValueEqualsScanFieldEditorFrame(fieldId: ScanFormula.TextHasValueEqualsFieldId, name: string): TextHasValueEqualsScanFieldEditorFrame {
            return new TextHasValueEqualsScanFieldEditorFrame(fieldId, name);
        }
        private createStringOverlapsScanFieldEditorFrame(fieldId: ScanFormula.StringOverlapsFieldId, name: string): StringOverlapsScanFieldEditorFrame {
            return new StringOverlapsScanFieldEditorFrame(fieldId, name);
        }
        private createMarketBoardOverlapsScanFieldEditorFrame(fieldId: ScanFormula.FieldId.MarketBoard, name: string): MarketBoardOverlapsScanFieldEditorFrame {
            return new MarketBoardOverlapsScanFieldEditorFrame(fieldId, name);
        }
        private createCurrencyOverlapsScanFieldEditorFrame(fieldId: ScanFormula.FieldId.Currency, name: string): CurrencyOverlapsScanFieldEditorFrame {
            return new CurrencyOverlapsScanFieldEditorFrame(fieldId, name);
        }
        private createExchangeOverlapsScanFieldEditorFrame(fieldId: ScanFormula.FieldId.Exchange, name: string): ExchangeOverlapsScanFieldEditorFrame {
            return new ExchangeOverlapsScanFieldEditorFrame(fieldId, name);
        }
        private createMarketOverlapsScanFieldEditorFrame(fieldId: ScanFormula.MarketOverlapsFieldId, name: string): MarketOverlapsScanFieldEditorFrame {
            return new MarketOverlapsScanFieldEditorFrame(fieldId, name);
        }
        private createIsScanFieldEditorFrame(fieldId: ScanFormula.FieldId.Is, name: string): IsScanFieldEditorFrame {
            return new IsScanFieldEditorFrame(fieldId, name);
        }
    }
}
