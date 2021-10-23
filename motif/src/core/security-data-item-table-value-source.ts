/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { AdiService, HigherLowerId, LitIvemId, SecurityDataDefinition, SecurityDataItem } from 'src/adi/internal-api';
import { Integer, InternalError, MultiEvent, SourceTzOffsetDate, UnexpectedCaseError, UnreachableCaseError } from 'src/sys/internal-api';
import { PrefixableSecurityDataItemTableFieldDefinitionSource } from './prefixable-security-data-item-table-field-definition-source';
import { RenderValue } from './render-value';
import {
    BooleanCorrectnessTableGridValue,
    CorrectnessTableGridValue,
    EnumCorrectnessTableGridValue,
    IntegerArrayCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    LitIvemIdCorrectnessTableGridValue,
    NumberCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,
    SourceTzOffsetDateCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TableGridValue
} from './table-grid-value';
import { TableValueSource } from './table-value-source';

export class SecurityDataItemTableValueSource extends TableValueSource {
    private dataItem: SecurityDataItem;
    private dataItemDefined = false;
    private dataCorrectnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private fieldValuesChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private lastLastHigherLower: HigherLowerId = HigherLowerId.Invalid;

    private _lastOldValue: Decimal | undefined;
    private _bestAskOldValue: Decimal | undefined;
    private _bestBidOldValue: Decimal | undefined;
    private _auctionPriceOldValue: Decimal | undefined;
    private _vwapOldValue: Decimal | undefined;
    private _valueTradedOldValue: number | undefined;

    constructor(firstFieldIndexOffset: Integer, private _litIvemId: LitIvemId, private _adi: AdiService) {
        super(firstFieldIndexOffset);
    }

    activate(): TableGridValue[] {
        const dataDefinition = new SecurityDataDefinition();
        // TODO:MED Task:25127100522 Bug:25127100522
        // Steps to reproduce:
        // 1) Add new Paridepth tab to layout.
        // 2) "Internal URC Error: ZCMFI54009: 4" message will be shown in the console.
        //
        // `this.recordDefinition.litIvemId.litId` is set to AsxBookBuild, which isn't supported by Zenith.

        dataDefinition.litIvemId = this._litIvemId;
        const baseDataItem = this._adi.subscribe(dataDefinition);
        if (!(baseDataItem instanceof SecurityDataItem)) {
            const description = baseDataItem.definition.description;
            this._adi.unsubscribe(baseDataItem);
            throw new InternalError('LIISWGVA438', `${description}`);
        } else {
            this.dataItem = baseDataItem;
            this.dataItemDefined = true;
            this.dataCorrectnessChangeEventSubscriptionId =
                this.dataItem.subscribeCorrectnessChangeEvent(() => this.handleDataCorrectnessChangeEvent());
            // eslint-disable-next-line max-len
            this.fieldValuesChangeEventSubscriptionId = this.dataItem.subscribeFieldValuesChangedEvent(
                (changedFieldIds) => this.handleFieldValuesChangedEvent(changedFieldIds)
            );

            this.initialiseBeenUsable(this.dataItem.usable);

            return this.getAllValues();
        }
    }

    deactivate() {
        if (this.fieldValuesChangeEventSubscriptionId !== undefined) {
            this.dataItem.unsubscribeFieldValuesChangedEvent(this.fieldValuesChangeEventSubscriptionId);
            this.fieldValuesChangeEventSubscriptionId = undefined;
        }
        if (this.dataCorrectnessChangeEventSubscriptionId !== undefined) {
            this.dataItem.unsubscribeCorrectnessChangeEvent(this.dataCorrectnessChangeEventSubscriptionId);
            this.dataCorrectnessChangeEventSubscriptionId = undefined;
        }
        if (this.dataItemDefined) {
            this._adi.unsubscribe(this.dataItem);
            this.dataItemDefined = false;
        }
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = PrefixableSecurityDataItemTableFieldDefinitionSource.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value, false);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return PrefixableSecurityDataItemTableFieldDefinitionSource.Field.count;
    }

    private handleDataCorrectnessChangeEvent() {
        const allValues = new Array<TableGridValue>(PrefixableSecurityDataItemTableFieldDefinitionSource.Field.count);
        for (let fieldIdx = 0; fieldIdx < PrefixableSecurityDataItemTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
            const fieldId = PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getId(fieldIdx);
            this.loadValue(fieldId, value, false);
            allValues[fieldIdx] = value;
        }

        this.processDataCorrectnessChange(allValues, this.dataItem.usable);
    }

    private handleFieldValuesChangedEvent(securityValueChanges: SecurityDataItem.ValueChange[]) {
        // let lastProcessingPossiblyRequired = false;
        // let lastProcessed = false;

        const securityValueChangeCount = securityValueChanges.length;
        const maxValueChangesCount = securityValueChangeCount + 1; // allow extra for Last Higher/Lower
        const valueChanges = new Array<TableValueSource.ValueChange>(maxValueChangesCount);
        let foundCount = 0;
        for (let i = 0; i < securityValueChanges.length; i++) {
            const { fieldId, recentChangeTypeId } = securityValueChanges[i];
            const fieldIdx = PrefixableSecurityDataItemTableFieldDefinitionSource.Field.indexOfId(fieldId);
            if (fieldIdx >= 0) {
                const newValue = this.createTableGridValue(fieldIdx);
                this.loadValue(fieldId, newValue, true);
                valueChanges[foundCount++] = {
                    fieldIndex: fieldIdx,
                    newValue,
                    recentChangeTypeId,
                };
                // switch (fieldId) {
                //     case SecurityDataItem.FieldId.Open:
                //     case SecurityDataItem.FieldId.Close:
                //         lastProcessingPossiblyRequired = true;
                //         break;
                //     case SecurityDataItem.FieldId.Last:
                //         lastProcessed = true;
                //         break;
                // }
            }
        }

        // if (lastProcessingPossiblyRequired && !lastProcessed) {
        //     const lastHigherLower = this.calculateLastHigherLowerId(this.dataItem.last);
        //     if (lastHigherLower !== this.lastLastHigherLower) {
        //         const fieldIdx = LitIvemIdSecurityTableValueSource.Field.indexOfId(SecurityDataItem.FieldId.Last);
        //         const newValue = this.createTableGridValue(fieldIdx) as NullableDecimalCorrectnessTableGridValue;
        //         newValue.data = this.dataItem.last;
        //         this.loadHigherLower(newValue, lastHigherLower);
        //         changedValues[foundCount++] = { fieldIdx: fieldIdx, newValue: newValue };
        //     }
        // }

        if (foundCount < maxValueChangesCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private calculateHigherLowerId<T>(newValue: T | undefined, oldValue: T | undefined) {
        if (newValue === undefined || oldValue === undefined) {
            return HigherLowerId.Invalid;
        } else {
            if (newValue < oldValue) {
                return HigherLowerId.Lower;
            } else {
                if (newValue > oldValue) {
                    return HigherLowerId.Higher;
                } else {
                    return HigherLowerId.Same;
                }
            }
        }
    }

    // private calculateChangeHigherLowerId(newValue: Decimal | null | undefined): HigherLowerId {
    //     // If open is available, compare last to that.  If not try and compare last to close.
    //     let compareAgainst: Decimal;
    //     if (this.dataItem.open !== undefined && this.dataItem.open !== null) {
    //         compareAgainst = this.dataItem.open;
    //     } else {
    //         if (this.dataItem.close !== undefined && this.dataItem.close !== null) {
    //             compareAgainst = this.dataItem.close;
    //         } else {
    //             return HigherLowerId.Invalid;
    //         }
    //     }

    //     // Either open or close have non null values.  Compare last against one of these
    //     let higherLower: HigherLowerId;
    //     if (newValue === undefined || newValue === null) {
    //         higherLower = HigherLowerId.Invalid;
    //     } else {
    //         if (newValue > compareAgainst) {
    //             higherLower = HigherLowerId.Higher;
    //         } else {
    //             if (newValue < compareAgainst) {
    //                 higherLower = HigherLowerId.Lower;
    //             } else {
    //                 higherLower = HigherLowerId.Same;
    //             }
    //         }
    //     }

    //     return higherLower;
    // }

    private calculateLastHigherLowerId(newValue: Decimal | undefined): HigherLowerId {
        const result = this.calculateHigherLowerId(newValue, this._lastOldValue);
        this._lastOldValue = newValue;
        return result;
    }

    private calculateBestAskHigherLowerId(newValue: Decimal | undefined) {
        const result = this.calculateHigherLowerId(newValue, this._bestAskOldValue);
        this._bestAskOldValue = newValue;
        return result;
    }

    private calculateBestBidHigherLowerId(newValue: Decimal | undefined) {
        const result = this.calculateHigherLowerId(newValue, this._bestBidOldValue);
        this._bestBidOldValue = newValue;
        return result;
    }

    private calculateAuctionPriceHigherLowerId(newValue: Decimal | undefined) {
        const result = this.calculateHigherLowerId(newValue, this._auctionPriceOldValue);
        this._auctionPriceOldValue = newValue;
        return result;
    }

    private calculateVwapHigherLowerId(newValue: Decimal | undefined) {
        const result = this.calculateHigherLowerId(newValue, this._vwapOldValue);
        this._vwapOldValue = newValue;
        return result;
    }

    private calculateValueTradedHigherLowerId(newValue: number | undefined) {
        const result = this.calculateHigherLowerId(newValue, this._valueTradedOldValue);
        this._valueTradedOldValue = newValue;
        return result;
    }

    private loadValue(id: SecurityDataItem.FieldId, value: CorrectnessTableGridValue, changed: boolean) {
        value.dataCorrectnessId = this.dataItem.correctnessId;

        switch (id) {
            case SecurityDataItem.FieldId.LitIvemId:
                (value as LitIvemIdCorrectnessTableGridValue).data = this.dataItem.definition.litIvemId;
                break;
            case SecurityDataItem.FieldId.Code:
                (value as StringCorrectnessTableGridValue).data = this.dataItem.code;
                break;
            case SecurityDataItem.FieldId.Name:
                (value as StringCorrectnessTableGridValue).data = this.dataItem.name;
                break;
            case SecurityDataItem.FieldId.TradingState:
                (value as StringCorrectnessTableGridValue).data = this.dataItem.tradingState;
                break;
            case SecurityDataItem.FieldId.TradingStateAllows:
                (value as IntegerArrayCorrectnessTableGridValue).data = this.dataItem.tradingStateAllowIds;
                break;
            case SecurityDataItem.FieldId.TradingStateReason:
                (value as EnumCorrectnessTableGridValue).data = this.dataItem.tradingStateReasonId;
                break;
            case SecurityDataItem.FieldId.QuotationBasis:
                (value as StringCorrectnessTableGridValue).data = this.dataItem.quotationBasis;
                break;
            case SecurityDataItem.FieldId.StatusNote:
                (value as StringCorrectnessTableGridValue).data = this.dataItem.statusNote;
                break;
            case SecurityDataItem.FieldId.AskCount:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.askCount;
                break;
            case SecurityDataItem.FieldId.AskQuantity:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.askQuantity;
                break;
            case SecurityDataItem.FieldId.BidCount:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.bidCount;
                break;
            case SecurityDataItem.FieldId.BidQuantity:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.bidQuantity;
                break;
            case SecurityDataItem.FieldId.NumberOfTrades:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.numberOfTrades;
                break;
            case SecurityDataItem.FieldId.ContractSize:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.contractSize;
                break;
            case SecurityDataItem.FieldId.OpenInterest:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.openInterest;
                break;
            case SecurityDataItem.FieldId.AuctionQuantity:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.auctionQuantity;
                break;
            case SecurityDataItem.FieldId.AuctionRemainder:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.auctionRemainder;
                break;
            case SecurityDataItem.FieldId.Volume:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.volume;
                break;
            case SecurityDataItem.FieldId.ShareIssue:
                (value as IntegerCorrectnessTableGridValue).data = this.dataItem.shareIssue;
                break;
            case SecurityDataItem.FieldId.Market:
                (value as EnumCorrectnessTableGridValue).data = this.dataItem.marketId;
                break;
            case SecurityDataItem.FieldId.Exchange:
                (value as EnumCorrectnessTableGridValue).data = this.dataItem.exchange;
                break;
            case SecurityDataItem.FieldId.Class:
                (value as EnumCorrectnessTableGridValue).data = this.dataItem.class;
                break;
            case SecurityDataItem.FieldId.Cfi:
                (value as StringCorrectnessTableGridValue).data = this.dataItem.cfi;
                break;
            case SecurityDataItem.FieldId.CallOrPut:
                (value as EnumCorrectnessTableGridValue).data = this.dataItem.callOrPut;
                break;
            case SecurityDataItem.FieldId.TradingMarkets:
                (value as IntegerArrayCorrectnessTableGridValue).data = this.dataItem.tradingMarkets;
                break;
            case SecurityDataItem.FieldId.IsIndex:
                (value as BooleanCorrectnessTableGridValue).data = this.dataItem.isIndex;
                break;
            case SecurityDataItem.FieldId.AskUndisclosed:
                (value as BooleanCorrectnessTableGridValue).data = this.dataItem.askUndisclosed;
                break;
            case SecurityDataItem.FieldId.BidUndisclosed:
                (value as BooleanCorrectnessTableGridValue).data = this.dataItem.bidUndisclosed;
                break;
            case SecurityDataItem.FieldId.Open:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.open;
                break;
            case SecurityDataItem.FieldId.High:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.high;
                break;
            case SecurityDataItem.FieldId.Low:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.low;
                break;
            case SecurityDataItem.FieldId.Close:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.close;
                break;
            case SecurityDataItem.FieldId.Settlement:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.settlement;
                break;
            case SecurityDataItem.FieldId.Last:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.last;
                if (changed) {
                    const lastHigherLowerId = this.calculateLastHigherLowerId(this.dataItem.last);
                    this.loadHigherLower(value, lastHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.BestAsk:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.bestAsk;
                if (changed) {
                    const bestAskHigherLower = this.calculateBestAskHigherLowerId(this.dataItem.bestAsk);
                    this.loadHigherLower(value, bestAskHigherLower);
                }
                break;
            case SecurityDataItem.FieldId.BestBid:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.bestBid;
                if (changed) {
                    const bestBidHigherLowerId = this.calculateBestBidHigherLowerId(this.dataItem.bestBid);
                    this.loadHigherLower(value, bestBidHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.AuctionPrice:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.auctionPrice;
                if (changed) {
                    const auctionPriceHigherLowerId = this.calculateAuctionPriceHigherLowerId(this.dataItem.auctionPrice);
                    this.loadHigherLower(value, auctionPriceHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.VWAP:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.vWAP;
                if (changed) {
                    const vwapHigherLowerId = this.calculateVwapHigherLowerId(this.dataItem.vWAP);
                    this.loadHigherLower(value, vwapHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.StrikePrice:
                (value as PriceCorrectnessTableGridValue).data = this.dataItem.strikePrice;
                break;
            case SecurityDataItem.FieldId.ValueTraded:
                (value as NumberCorrectnessTableGridValue).data = this.dataItem.valueTraded;
                if (changed) {
                    const valueTradedHigherLowerId = this.calculateValueTradedHigherLowerId(this.dataItem.valueTraded);
                    this.loadHigherLower(value, valueTradedHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.ExpiryDate:
                (value as SourceTzOffsetDateCorrectnessTableGridValue).data = SourceTzOffsetDate.newUndefinable(this.dataItem.expiryDate);
                break;
            case SecurityDataItem.FieldId.SubscriptionData:
            case SecurityDataItem.FieldId.Trend:
                throw new UnexpectedCaseError('LITSWVSLVC21212');
            default:
                throw new UnreachableCaseError('LITSWVSLV9473', id);
        }
    }

    private loadHigherLower(value: TableGridValue, higherLowerId: HigherLowerId) {
        switch (higherLowerId) {
            case HigherLowerId.Higher:
                value.addRenderAttribute(RenderValue.HigherLowerAttribute.higher);
                break;
            case HigherLowerId.Lower:
                value.addRenderAttribute(RenderValue.HigherLowerAttribute.lower);
                break;
        }
    }
}
