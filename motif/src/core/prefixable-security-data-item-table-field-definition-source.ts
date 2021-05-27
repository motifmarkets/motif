/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, SecurityDataItem } from 'src/adi/internal-api';
import { CommaText, Integer, UnexpectedCaseError, UnreachableCaseError } from 'src/sys/internal-api';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';
import {
    BooleanDataItemTableGridField,
    CorrectnessTableGridField,
    DecimalDataItemTableGridField,
    EnumDataItemTableGridField,
    IntegerArrayDataItemTableGridField,
    IntegerDataItemTableGridField,
    LitIvemIdDataItemTableGridField,
    NumberDataItemTableGridField,
    SourceTzOffsetDateDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CallOrPutCorrectnessTableGridValue,
    CorrectnessTableGridValue,
    ExchangeIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    IsIndexCorrectnessTableGridValue,
    IvemClassIdCorrectnessTableGridValue,
    LitIvemIdCorrectnessTableGridValue,
    MarketIdArrayCorrectnessTableGridValue,
    MarketIdCorrectnessTableGridValue,
    NumberCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,
    SourceTzOffsetDateCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TradingStateAllowIdArrayCorrectnessTableGridValue,
    TradingStateReasonIdCorrectnessTableGridValue,
    UndisclosedCorrectnessTableGridValue
} from './table-grid-value';

export abstract class PrefixableSecurityDataItemTableFieldDefinitionSource extends TableFieldDefinitionSource {

    constructor(typeId: TableFieldDefinitionSource.TypeId, customHeadings: TableFieldCustomHeadings,
        protected _prefix: string) {
        super(typeId, customHeadings);

        this.fieldInfos = new Array<TableFieldDefinitionSource.FieldInfo>(PrefixableSecurityDataItemTableFieldDefinitionSource.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < PrefixableSecurityDataItemTableFieldDefinitionSource.Field.count; fieldIdx++) {
            const sourcelessFieldName = this._prefix + PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getName(fieldIdx);
            const name = CommaText.from2Values(this.sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = this.tryGetCustomFieldHeading(sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = this._prefix + PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getHeading(fieldIdx);
            }

            const dataTypeId = PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getTableGridValueConstructor(fieldIdx);

            this.fieldInfos[idx++] = {
                sourcelessName: sourcelessFieldName,
                name,
                heading,
                textAlign,
                gridFieldConstructor: fieldConstructor,
                gridValueConstructor: valueConstructor,
            };
        }
    }

    isFieldSupported(id: SecurityDataItem.FieldId) {
        return PrefixableSecurityDataItemTableFieldDefinitionSource.Field.isIdSupported(id);
    }

    getFieldNameById(id: SecurityDataItem.FieldId) {
        const sourcelessFieldName = this._prefix + PrefixableSecurityDataItemTableFieldDefinitionSource.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }
}

export namespace PrefixableSecurityDataItemTableFieldDefinitionSource {
    export namespace Field {
        const unsupportedIds = [SecurityDataItem.FieldId.SubscriptionData, SecurityDataItem.FieldId.Trend];
        export const count = SecurityDataItem.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: SecurityDataItem.FieldId;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(SecurityDataItem.Field.idCount);

        function idToTableGridConstructors(id: SecurityDataItem.FieldId): TableFieldDefinitionSource.CorrectnessTableGridConstructors {
            switch (id) {
                case SecurityDataItem.FieldId.LitIvemId:
                    return [LitIvemIdDataItemTableGridField, LitIvemIdCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.Code:
                case SecurityDataItem.FieldId.Name:
                case SecurityDataItem.FieldId.TradingState:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.QuotationBasis:
                case SecurityDataItem.FieldId.StatusNote:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.AskCount:
                case SecurityDataItem.FieldId.AskQuantity:
                case SecurityDataItem.FieldId.BidCount:
                case SecurityDataItem.FieldId.BidQuantity:
                case SecurityDataItem.FieldId.NumberOfTrades:
                case SecurityDataItem.FieldId.ContractSize:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.OpenInterest:
                case SecurityDataItem.FieldId.AuctionQuantity:
                case SecurityDataItem.FieldId.AuctionRemainder:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.Volume:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.ShareIssue:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.Market:
                    return [EnumDataItemTableGridField, MarketIdCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.Exchange:
                    return [EnumDataItemTableGridField, ExchangeIdCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.Class:
                    return [EnumDataItemTableGridField, IvemClassIdCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.Cfi:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.TradingStateReason:
                    return [EnumDataItemTableGridField, TradingStateReasonIdCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.CallOrPut:
                    return [EnumDataItemTableGridField, CallOrPutCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.TradingStateAllows:
                    return [IntegerArrayDataItemTableGridField, TradingStateAllowIdArrayCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.TradingMarkets:
                    return [IntegerArrayDataItemTableGridField, MarketIdArrayCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.IsIndex:
                    return [BooleanDataItemTableGridField, IsIndexCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.AskUndisclosed:
                case SecurityDataItem.FieldId.BidUndisclosed:
                    return [BooleanDataItemTableGridField, UndisclosedCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.StrikePrice:
                case SecurityDataItem.FieldId.Open:
                case SecurityDataItem.FieldId.High:
                case SecurityDataItem.FieldId.Low:
                case SecurityDataItem.FieldId.Close:
                case SecurityDataItem.FieldId.Settlement:
                case SecurityDataItem.FieldId.BestAsk:
                case SecurityDataItem.FieldId.BestBid:
                case SecurityDataItem.FieldId.AuctionPrice:
                case SecurityDataItem.FieldId.VWAP:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.Last:
                    return [DecimalDataItemTableGridField, PriceCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.ValueTraded:
                    return [NumberDataItemTableGridField, NumberCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.ExpiryDate:
                    return [SourceTzOffsetDateDataItemTableGridField, SourceTzOffsetDateCorrectnessTableGridValue];
                case SecurityDataItem.FieldId.SubscriptionData:
                case SecurityDataItem.FieldId.Trend:
                    throw new UnexpectedCaseError('PSDITFDSFITTGCC349928');
                default:
                    throw new UnreachableCaseError('PSDITFDSFITTGCU2200191', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return SecurityDataItem.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: SecurityDataItem.FieldId) {
            return SecurityDataItem.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return SecurityDataItem.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return SecurityDataItem.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: SecurityDataItem.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: SecurityDataItem.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseLitIvemIdSecurityWatchValueSourceField() {
            let fieldIdx = 0;
            for (let id = 0; id < SecurityDataItem.Field.idCount; id++) {
                if (unsupportedIds.includes(id)) {
                    idFieldIndices[id] = -1;
                } else {
                    idFieldIndices[id] = fieldIdx;

                    const [fieldConstructor, valueConstructor] = idToTableGridConstructors(id);
                    infos[fieldIdx++] = {
                        id,
                        fieldConstructor,
                        valueConstructor,
                    };
                }
            }
        }
    }

    export function initialiseStatic() {
        Field.initialiseLitIvemIdSecurityWatchValueSourceField();
    }
}
