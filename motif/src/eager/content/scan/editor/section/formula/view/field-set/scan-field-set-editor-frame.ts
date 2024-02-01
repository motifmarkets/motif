/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AltCodeSubbedScanField, AttributeSubbedScanField, CurrencyOverlapsScanField, DateInRangeScanField, DateSubbedScanField, ExchangeOverlapsScanField, IsScanField, MarketBoardOverlapsScanField, MarketOverlapsScanField, NumericInRangeScanField, Ok, PriceSubbedScanField, Result, ScanField, ScanFieldSet, ScanFieldSetLoadError, ScanFormula, StringOverlapsScanField, TextContainsScanField, TextEqualsScanField, TextHasValueEqualsScanField } from '@motifmarkets/motif-core';
import { AltCodeSubbedScanFieldEditorFrame, AttributeSubbedScanFieldEditorFrame, CurrencyOverlapsScanFieldEditorFrame, DateInRangeScanFieldEditorFrame, DateSubbedScanFieldEditorFrame, ExchangeOverlapsScanFieldEditorFrame, IsScanFieldEditorFrame, MarketBoardOverlapsScanFieldEditorFrame, MarketOverlapsScanFieldEditorFrame, NumericInRangeScanFieldEditorFrame, PriceSubbedScanFieldEditorFrame, StringOverlapsScanFieldEditorFrame, TextContainsScanFieldEditorFrame, TextEqualsScanFieldEditorFrame, TextHasValueEqualsScanFieldEditorFrame } from './field/internal-api';
import { ScanFieldEditorFrame } from './field/scan-field-editor-frame';

export class ScanFieldSetEditorFrame implements ScanFieldSet {
    fieldFactory: ScanFieldSet.FieldFactory;
    conditionFactory: ScanField.ConditionFactory;
    fields: ScanFieldSet.Fields;
    loadError: ScanFieldSetLoadError | undefined;

    constructor() {
        const removeFieldEditorFrameClosure: ScanFieldEditorFrame.RemoveMeEventHandler = (frame) => this.removeFieldEditorFrame(frame);
        const processFieldEditorFrameChangedClosure: ScanFieldEditorFrame.ChangedEventHandler = (frame, valid) => this.processFieldEditorFrameChanged(frame, valid);
        this.fieldFactory = new ScanFieldSetEditorFrame.FieldFactory(removeFieldEditorFrameClosure, processFieldEditorFrameChangedClosure);
        this.conditionFactory = new ScanFieldEditorFrame.ConditionFactory();
    }

    removeFieldEditorFrame(frame: ScanFieldEditorFrame) {
        this.fields.remove(frame);
    }

    processFieldEditorFrameChanged(frame: ScanFieldEditorFrame, valid: boolean) {

    }
}

export namespace ScanFieldSetEditorFrame {
    export namespace FieldName {

    }
    export class FieldFactory implements ScanFieldSet.FieldFactory {
        constructor(
            private readonly _removeFieldEditorFrameClosure: ScanFieldEditorFrame.RemoveMeEventHandler,
            private readonly _processFieldEditorFrameChangedClosure: ScanFieldEditorFrame.ChangedEventHandler,
        ) {

        }

        createNumericInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.NumericRangeFieldId): Result<NumericInRangeScanField> {
            return new Ok(new NumericInRangeScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createPriceSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.PriceSubFieldId): Result<PriceSubbedScanField> {
            return new Ok(new PriceSubbedScanFieldEditorFrame(subFieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createDateInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.ExpiryDate): Result<DateInRangeScanField> {
            return new Ok(new DateInRangeScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createDateSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.DateSubFieldId): Result<DateSubbedScanField> {
            return new Ok(new DateSubbedScanFieldEditorFrame(subFieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createTextContains(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextContainsFieldId): Result<TextContainsScanField> {
            return new Ok(new TextContainsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createAltCodeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AltCodeSubFieldId): Result<AltCodeSubbedScanField> {
            return new Ok(new AltCodeSubbedScanFieldEditorFrame(subFieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createAttributeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AttributeSubFieldId): Result<AttributeSubbedScanField> {
            return new Ok(new AttributeSubbedScanFieldEditorFrame(subFieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createTextEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextEqualsFieldId): Result<TextEqualsScanField> {
            return new Ok(new TextEqualsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createTextHasValueEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextHasValueEqualsFieldId): Result<TextHasValueEqualsScanField> {
            return new Ok(new TextHasValueEqualsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createStringOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.StringOverlapsFieldId): Result<StringOverlapsScanField> {
            return new Ok(new StringOverlapsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createMarketBoardOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.MarketBoard): Result<MarketBoardOverlapsScanField> {
            return new Ok(new MarketBoardOverlapsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createCurrencyOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Currency): Result<CurrencyOverlapsScanField> {
            return new Ok(new CurrencyOverlapsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createExchangeOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Exchange): Result<ExchangeOverlapsScanField> {
            return new Ok(new ExchangeOverlapsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createMarketOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.MarketOverlapsFieldId): Result<MarketOverlapsScanField> {
            return new Ok(new MarketOverlapsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
        createIs(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Is): Result<IsScanField> {
            return new Ok(new IsScanFieldEditorFrame(fieldId, this._removeFieldEditorFrameClosure, this._processFieldEditorFrameChangedClosure));
        }
    }
}
