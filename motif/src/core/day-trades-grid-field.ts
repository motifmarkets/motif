/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordField } from 'revgrid';
import { DayTradesDataItem, MovementId, TradeFlagId } from 'src/adi/internal-api';
import { MotifGrid } from 'src/content/internal-api';
import { StringId } from 'src/res/internal-api';
import {
    compareArray,
    compareNumber,
    compareUndefinableDecimal,
    compareUndefinableEnum,
    compareUndefinableInteger,
    compareUndefinableString, ComparisonResult, CorrectnessId, Integer, SourceTzOffsetDateTime, UnreachableCaseError
} from 'src/sys/internal-api';
import {
    BidAskSideIdRenderValue,
    DayTradesDataItemRecordTypeIdRenderValue,
    IntegerRenderValue,
    MarketIdRenderValue,
    PriceRenderValue,
    RenderValue,
    SourceTzOffsetDateTimeTimeRenderValue,
    StringArrayRenderValue,
    StringRenderValue,
    TradeAffectsIdArrayRenderValue,
    TradeFlagIdArrayRenderValue,
    TrendIdRenderValue
} from './render-value';

export abstract class DayTradesGridField implements RevRecordField {
    readonly name: string;

    constructor(
        private _id: DayTradesDataItem.Field.Id,
        private _fieldStateDefinition: DayTradesGridField.FieldStateDefinition,
        private _defaultVisible: boolean,
        private _getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler,
    ) {
        this.name = DayTradesDataItem.Field.idToName(_id);
    }

    get fieldStateDefinition() { return this._fieldStateDefinition; }
    get defaultVisible() { return this._defaultVisible; }
    get isBrokerPrivateData() { return DayTradesDataItem.Field.idToIsBrokerPrivateData(this._id); }

    getFieldValue(record: DayTradesDataItem.Record): RenderValue {
        const { renderValue, cellAttribute } = this.createRenderValue(record);

        // add attributes in correct priority order.  1st will be applied last (highest priority)
        const correctnessId = this._getDataItemCorrectnessIdEvent();
        switch (correctnessId) {
            case CorrectnessId.Suspect:
                renderValue.addAttribute(RenderValue.DataCorrectnessAttribute.suspect);
                break;
            case CorrectnessId.Error:
                renderValue.addAttribute(RenderValue.DataCorrectnessAttribute.error);
                break;
            case CorrectnessId.Usable:
            case CorrectnessId.Good:
                // can do other attributes if usable
                if (cellAttribute !== undefined) {
                    renderValue.addAttribute(cellAttribute);
                }

                switch (record.typeId) {
                    case DayTradesDataItem.Record.TypeId.Cancelled:
                        renderValue.addAttribute(RenderValue.cancelledAttribute);
                        break;
                    case DayTradesDataItem.Record.TypeId.Canceller:
                        renderValue.addAttribute(RenderValue.cancellerAttribute);
                        break;
                }

                const tradeRecord = record.tradeRecord;

                if (tradeRecord.buyCrossRef !== undefined || tradeRecord.sellCrossRef !== undefined) {
                    renderValue.addAttribute(RenderValue.ownOrderAttribute);
                } else {
                    // const buyOrderId = tradeRecord.buyDepthOrderId;
                    // const sellOrderId = tradeRecord.sellDepthOrderId;
                    // const sideId = tradeRecord.bidAskSideId;

                    // if (sideId !== undefined) {
                    //     if (buyOrderId !== undefined || sellOrderId !== undefined) {
                    //         renderValue.addAttribute(RenderValue.ownOrderAttribute);
                    //     }
                    // }
                }

                break;

            default:
                throw new UnreachableCaseError('TGFGFV229988', correctnessId);
        }


        return renderValue;
    }

    compareField(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record) {
        return this.compareFieldValue(left, right, true);
    }

    compareFieldDesc(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record) {
        return this.compareFieldValue(right, left, false);
    }

    protected addRenderAttributes(renderValue: RenderValue, record: DayTradesDataItem.Record, cellAttribute: RenderValue.Attribute) {

    }

    protected abstract createRenderValue(record: DayTradesDataItem.Record): DayTradesGridField.CreateRenderValueResult;
    protected abstract compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean): number;
}

export namespace DayTradesGridField {
    export type Id = DayTradesDataItem.Field.Id;
    export const idCount = DayTradesDataItem.Field.idCount;
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;

    export interface FieldStateDefinition extends MotifGrid.FieldState {
        headerId: StringId;
        alignment: 'right' | 'left' | 'center';
    }

    export interface CreateRenderValueResult {
        renderValue: RenderValue;
        cellAttribute: RenderValue.Attribute | undefined;
    }

    export function createField(id: Id,
        getDataItemCorrectnessIdEventHandler: GetDataItemCorrectnessIdEventHandler): DayTradesGridField {
        switch (id) {
            case DayTradesDataItem.Field.Id.Id:
                return new IdDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.Price:
                return new PriceDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.Quantity:
                return new QuantityDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.Time:
                return new TimeDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.FlagIds:
                return new FlagIdsDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.TrendId:
                return new TrendIdDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.BidAskSideId:
                return new BidAskSideIdDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.AffectsIds:
                return new AffectsIdsDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.ConditionCodes:
                return new ConditionCodesDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.BuyDepthOrderId:
                return new BuyDepthOrderIdDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.BuyBroker:
                return new BuyBrokerDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.BuyCrossRef:
                return new BuyCrossRefDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.SellDepthOrderId:
                return new SellDepthOrderIdDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.SellBroker:
                return new SellBrokerDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.SellCrossRef:
                return new SellCrossRefDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.MarketId:
                return new MarketIdDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.RelatedId:
                return new RelatedIdDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.Attributes:
                return new AttributesDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            case DayTradesDataItem.Field.Id.RecordTypeId:
                return new RecordTypeDayTradesGridField(getDataItemCorrectnessIdEventHandler);
            default:
                throw new UnreachableCaseError('DTGFCF12934883446', id);
        }
    }
}

export class IdDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_Id,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.Id,
            IdDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new IntegerRenderValue(record.tradeRecord.id),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record): ComparisonResult {
        return compareNumber(left.tradeRecord.id, right.tradeRecord.id);
    }
}

export class PriceDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_Price,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.Price,
            PriceDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        let cellAttribute: RenderValue.HigherLowerAttribute | undefined;
        switch (record.tradeRecord.trendId) {
            case MovementId.Up:
                cellAttribute = RenderValue.HigherLowerAttribute.higher;
                break;
            case MovementId.Down:
                cellAttribute = RenderValue.HigherLowerAttribute.lower;
                break;

            default:
                cellAttribute = undefined;
        }

        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new PriceRenderValue(record.tradeRecord.price),
            cellAttribute,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableDecimal(left.tradeRecord.price, right.tradeRecord.price, !ascending);
    }
}

export class QuantityDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_Quantity,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.Quantity,
            QuantityDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        let quantity: Integer | undefined;
        if (record.relatedRecord !== undefined && record.tradeRecord.flagIds.includes(TradeFlagId.Cancel)) {
            const tradeQuantity = record.relatedRecord.tradeRecord.quantity;
            if (tradeQuantity === undefined) {
                quantity = undefined;
            } else {
                quantity = -tradeQuantity;
            }
        } else {
            quantity = record.tradeRecord.quantity;
        }

        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new IntegerRenderValue(quantity),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableInteger(left.tradeRecord.quantity, right.tradeRecord.quantity, !ascending);
    }
}

export class TimeDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_Time,
        alignment: 'left',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.Time,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new SourceTzOffsetDateTimeTimeRenderValue(record.tradeRecord.time),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return SourceTzOffsetDateTime.compareUndefinable(left.tradeRecord.time, right.tradeRecord.time, !ascending);
    }
}

export class FlagIdsDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_FlagIds,
        alignment: 'left',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.FlagIds,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new TradeFlagIdArrayRenderValue(record.tradeRecord.flagIds),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareArray(left.tradeRecord.flagIds, right.tradeRecord.flagIds);
    }
}

export class TrendIdDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_TrendId,
        alignment: 'left',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.TrendId,
            TimeDayTradesGridField.fieldStateDefinition,
            false,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new TrendIdRenderValue(record.tradeRecord.trendId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableInteger(left.tradeRecord.trendId, right.tradeRecord.trendId, !ascending);
    }
}

export class BidAskSideIdDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_BidAskSideId,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.BidAskSideId,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new BidAskSideIdRenderValue(record.tradeRecord.bidAskSideId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableInteger(left.tradeRecord.bidAskSideId, right.tradeRecord.bidAskSideId, !ascending);
    }
}

export class AffectsIdsDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_AffectsIds,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.AffectsIds,
            TimeDayTradesGridField.fieldStateDefinition,
            false,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new TradeAffectsIdArrayRenderValue(record.tradeRecord.affectsIds),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareArray(left.tradeRecord.affectsIds, right.tradeRecord.affectsIds);
    }
}

export class ConditionCodesDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_ConditionCodes,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.ConditionCodes,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.conditionCodes),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.conditionCodes, right.tradeRecord.conditionCodes, !ascending);
    }
}

export class BuyDepthOrderIdDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_BuyDepthOrderId,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.BuyDepthOrderId,
            TimeDayTradesGridField.fieldStateDefinition,
            false,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.buyDepthOrderId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.buyDepthOrderId, right.tradeRecord.buyDepthOrderId, !ascending);
    }
}

export class BuyBrokerDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_BuyBroker,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.BuyBroker,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.buyBroker),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.buyBroker, right.tradeRecord.buyBroker, !ascending);
    }
}

export class BuyCrossRefDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_BuyCrossRef,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.BuyCrossRef,
            TimeDayTradesGridField.fieldStateDefinition,
            false,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.buyCrossRef),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.buyCrossRef, right.tradeRecord.buyCrossRef, !ascending);
    }
}

export class SellDepthOrderIdDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_SellDepthOrderId,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.SellDepthOrderId,
            TimeDayTradesGridField.fieldStateDefinition,
            false,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.sellDepthOrderId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.sellDepthOrderId, right.tradeRecord.sellDepthOrderId, !ascending);
    }
}

export class SellBrokerDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_SellBroker,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.SellBroker,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.sellBroker),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.sellBroker, right.tradeRecord.sellBroker, !ascending);
    }
}

export class SellCrossRefDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_SellCrossRef,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.SellCrossRef,
            TimeDayTradesGridField.fieldStateDefinition,
            false,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringRenderValue(record.tradeRecord.sellCrossRef),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableString(left.tradeRecord.sellCrossRef, right.tradeRecord.sellCrossRef, !ascending);
    }
}

export class MarketIdDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_MarketId,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.MarketId,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new MarketIdRenderValue(record.tradeRecord.marketId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableEnum(left.tradeRecord.marketId, right.tradeRecord.marketId, !ascending);
    }
}

export class RelatedIdDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_RelatedId,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.RelatedId,
            TimeDayTradesGridField.fieldStateDefinition,
            false,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new IntegerRenderValue(record.tradeRecord.relatedId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record, ascending: boolean) {
        return compareUndefinableInteger(left.tradeRecord.relatedId, right.tradeRecord.relatedId, !ascending);
    }
}

export class AttributesDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_Attributes,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.Attributes,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new StringArrayRenderValue(record.tradeRecord.attributes),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record) {
        return compareArray(left.tradeRecord.attributes, right.tradeRecord.attributes);
    }
}

export class RecordTypeDayTradesGridField extends DayTradesGridField {
    static readonly fieldStateDefinition: DayTradesGridField.FieldStateDefinition = {
        headerId: StringId.DayTradesGridHeading_RecordType,
        alignment: 'right',
    };

    constructor(getDataItemCorrectnessIdEvent: DayTradesGridField.GetDataItemCorrectnessIdEventHandler) {
        super(DayTradesDataItem.Field.Id.RecordTypeId,
            TimeDayTradesGridField.fieldStateDefinition,
            true,
            getDataItemCorrectnessIdEvent);
    }

    protected createRenderValue(record: DayTradesDataItem.Record) {
        const result: DayTradesGridField.CreateRenderValueResult = {
            renderValue: new DayTradesDataItemRecordTypeIdRenderValue(record.typeId),
            cellAttribute: undefined,
        };
        return result;
    }

    protected compareFieldValue(left: DayTradesDataItem.Record, right: DayTradesDataItem.Record) {
        return DayTradesDataItem.Record.Type.sortCompareId(left.typeId, right.typeId);
    }
}
