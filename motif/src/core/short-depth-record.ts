/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BidAskSideId, DepthLevelsDataItem } from 'src/adi/internal-api';
import {
    compareBoolean,
    compareInteger,
    comparePriceOrRemainder,
    Integer,
    PriceOrRemainder,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { DepthRecord } from './depth-record';
import {
    IntegerRenderValue,
    MarketIdRenderValue,
    PriceOrRemainderAndHasUndisclosedRenderValue,
    PriceOrRemainderRenderValue,
    PriceRenderValue,
    RenderValue
} from './render-value';
import { ShortDepthSideField, ShortDepthSideFieldId } from './short-depth-side-field';

export class ShortDepthRecord extends DepthRecord {

    protected renderRecord = new Array<RenderValue | undefined>(ShortDepthSideField.idCount);

    constructor(
        index: Integer,
        private _level: DepthLevelsDataItem.Level,
        quantityAhead: Integer | undefined,
        auctionQuantity: Integer | undefined,
    ) {
        super(DepthRecord.TypeId.PriceLevel, index, quantityAhead, auctionQuantity);
    }

    getVolume() { return this._level.volume === undefined ? 0 : this._level.volume; } // virtual override
    getRenderVolume() { return this._level.volume; } // virtual override
    acceptedByFilter(filterXrefs: string[]) { // virtual override
        return true; // not supported in short depth so accept everything
    }

    get level() { return this._level; }
    get quantityAhead() { return super.quantityAhead; }
    set quantityAhead(value: Integer | undefined) {
        if (value !== super.quantityAhead) {
            super.quantityAhead = value;
            this.renderRecord[ShortDepthSideFieldId.VolumeAhead] = undefined;
        }
    }
    get price(): PriceOrRemainder { return this._level.price; }
    get orderCount() { return this._level.orderCount; }
    get hasUndisclosed() { return this._level.hasUndisclosed; }

    processChange(changedFieldIds: DepthLevelsDataItem.Level.FieldId[]) {
        for (const id of changedFieldIds) {
            switch (id) {
                case DepthLevelsDataItem.Level.FieldId.Id:
                    // no Record Field
                    break;
                case DepthLevelsDataItem.Level.FieldId.SideId:
                    // no Record Field
                    break;
                case DepthLevelsDataItem.Level.FieldId.Price:
                    this.renderRecord[ShortDepthSideFieldId.Price] = undefined;
                    this.renderRecord[ShortDepthSideFieldId.PriceAndHasUndisclosed] = undefined;
                    break;
                case DepthLevelsDataItem.Level.FieldId.OrderCount:
                    this.renderRecord[ShortDepthSideFieldId.OrderCount] = undefined;
                    break;
                case DepthLevelsDataItem.Level.FieldId.Volume:
                    this.renderRecord[ShortDepthSideFieldId.Volume] = undefined;
                    break;
                case DepthLevelsDataItem.Level.FieldId.HasUndisclosed:
                    this.renderRecord[ShortDepthSideFieldId.PriceAndHasUndisclosed] = undefined;
                    break;
                case DepthLevelsDataItem.Level.FieldId.MarketId:
                    this.renderRecord[ShortDepthSideFieldId.MarketId] = undefined;
                    break;
                default:
                    throw new UnreachableCaseError('SDROFDRPOC44487', id);
            }
        }
    }

    getRenderValue(id: ShortDepthSideFieldId, sideId: BidAskSideId, dataCorrectnessAttribute: RenderValue.Attribute | undefined) {
        const { renderValue, extraAttribute } = this.createRenderValue(id);

        // Create attributes array.  First figure out how many elements
        let attributeCount = 1;
        if (dataCorrectnessAttribute !== undefined) {
            attributeCount++;
        }
        if (extraAttribute !== undefined) {
            attributeCount++;
        }

        // Create array
        const attributes = new Array<RenderValue.Attribute>(attributeCount);

        // Add required elements - must be in correct order
        let attributeIdx = 0;
        if (dataCorrectnessAttribute !== undefined) {
            attributes[attributeIdx++] = dataCorrectnessAttribute;
        }
        if (extraAttribute !== undefined) {
            attributes[attributeIdx++] = extraAttribute;
        }
        const recordAttribute: RenderValue.DepthRecordAttribute = {
            id: RenderValue.AttributeId.DepthRecord,
            bidAskSideId: sideId,
            depthRecordTypeId: DepthRecord.TypeId.PriceLevel,
            ownOrder: false,
        };
        attributes[attributeIdx] = recordAttribute;

        renderValue.setAttributes(attributes);
        return renderValue;
    }

    private createPriceAndHasUndisclosedRenderValue(): DepthRecord.CreateRenderValueResult  {
        const data: PriceOrRemainderAndHasUndisclosedRenderValue.DataType = {
            price: this._level.price === null ? null : new PriceRenderValue.decimalConstructor(this._level.price),
            hasUndisclosed: this._level.hasUndisclosed,
        };
        const renderValue = new PriceOrRemainderAndHasUndisclosedRenderValue(data);
        return { renderValue };
    }
    private createMarketIdRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new MarketIdRenderValue(this._level.marketId);
        return { renderValue };
    }
    private createPriceRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new PriceOrRemainderRenderValue(this._level.price);
        return { renderValue };
    }
    private createOrderCountRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new IntegerRenderValue(this._level.orderCount);
        return { renderValue };
    }

    private createRenderValue(id: ShortDepthSideFieldId): DepthRecord.CreateRenderValueResult {
        switch (id) {
            case ShortDepthSideFieldId.PriceAndHasUndisclosed: return this.createPriceAndHasUndisclosedRenderValue();
            case ShortDepthSideFieldId.Volume: return this.createVolumeRenderValue();
            case ShortDepthSideFieldId.OrderCount: return this.createOrderCountRenderValue();
            case ShortDepthSideFieldId.MarketId: return this.createMarketIdRenderValue();
            case ShortDepthSideFieldId.VolumeAhead: return this.createVolumeAheadRenderValue();
            case ShortDepthSideFieldId.Price: return this.createPriceRenderValue();
            default: throw new UnreachableCaseError('SDROFDRCRV23232887', id);
        }
    }
}

export namespace ShortDepthRecord {

    function comparePriceAndHasUndisclosedField(left: ShortDepthRecord, right: ShortDepthRecord) {
        let result = comparePriceField(left, right, left.level.sideId);
        if (result === 0) {
            result = compareBoolean(left.hasUndisclosed, right.hasUndisclosed);
        }
        return result;
    }

    function compareQuantityField(left: ShortDepthRecord, right: ShortDepthRecord) {
        return compareInteger(left.getVolume(), right.getVolume());
    }

    function compareVolumeAheadField(left: ShortDepthRecord, right: ShortDepthRecord) {
        if (left.quantityAhead !== undefined) {
            if (right.quantityAhead !== undefined) {
                return compareInteger(left.quantityAhead, right.quantityAhead);
            } else {
                return -1;
            }
        } else {
            if (right.quantityAhead !== undefined) {
                return 1;
            } else {
                return comparePriceField(left, right, left.level.sideId);
            }
        }
    }

    function comparePriceField(left: ShortDepthRecord, right: ShortDepthRecord, sideId: BidAskSideId) {
        const remainderAtMax = sideId === BidAskSideId.Ask;
        return comparePriceOrRemainder(left.price, right.price, remainderAtMax);
    }

    function compareOrderCount(left: ShortDepthRecord, right: ShortDepthRecord) {
        const leftOrderCount = left.orderCount;
        const rightOrderCount = right.orderCount;
        if (leftOrderCount === undefined) {
            return rightOrderCount === undefined ? 0 : 1;
        } else {
            if (rightOrderCount === undefined) {
                return -1;
            } else {
                return compareInteger(leftOrderCount, rightOrderCount);
            }
        }
    }

    export function compareField(id: ShortDepthSideFieldId, left: ShortDepthRecord, right: ShortDepthRecord): number {
        switch (id) {
            case ShortDepthSideFieldId.PriceAndHasUndisclosed: return comparePriceAndHasUndisclosedField(left, right);
            case ShortDepthSideFieldId.Volume: return compareQuantityField(left, right);
            case ShortDepthSideFieldId.OrderCount: return compareOrderCount(left, right);
            case ShortDepthSideFieldId.MarketId: return 0;
            case ShortDepthSideFieldId.VolumeAhead: return compareVolumeAheadField(left, right);
            case ShortDepthSideFieldId.Price: return comparePriceField(left, right, left.level.sideId);
            default: throw new UnreachableCaseError('SDRCF22285', id);
        }
    }

    export function compareFieldDesc(id: ShortDepthSideFieldId, left: ShortDepthRecord, right: ShortDepthRecord): number {
        switch (id) {
            case ShortDepthSideFieldId.PriceAndHasUndisclosed: return comparePriceAndHasUndisclosedField(left, right) * -1;
            case ShortDepthSideFieldId.Volume: return compareQuantityField(left, right) * -1;
            case ShortDepthSideFieldId.OrderCount: return compareOrderCount(left, right) * -1;
            case ShortDepthSideFieldId.MarketId: return 0;
            case ShortDepthSideFieldId.VolumeAhead: return compareVolumeAheadField(left, right) * -1;
            case ShortDepthSideFieldId.Price: return comparePriceField(left, right, left.level.sideId) * -1;
            default: throw new UnreachableCaseError('SDRCFD22285', id);
        }
    }
}
