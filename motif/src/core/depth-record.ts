/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecord } from 'revgrid';
import { Integer } from 'src/sys/internal-api';
import { IntegerRenderValue, RenderValue } from './render-value';

export abstract class DepthRecord implements RevRecord {
    inAuction: boolean;
    partialAuctionQuantity: Integer | undefined;

    constructor(
        private _typeId: DepthRecord.TypeId,
        public index: Integer,
        private _volumeAhead: Integer | undefined,
        auctionQuantity: Integer | undefined,
    ) {
        if (this._volumeAhead === undefined || auctionQuantity === undefined) {
            this.inAuction = false;
        } else {
            this.inAuction = auctionQuantity > this._volumeAhead;
        }
    }

    get typeId() { return this._typeId; }
    get volumeAhead() { return this._volumeAhead; }
    // set volumeAhead(value: Integer | undefined) { this._volumeAhead = value; }
    get cumulativeQuantity() { return this.volumeAhead === undefined ? undefined : this.volumeAhead + this.getVolume(); }

    processAuctionAndVolumeAhead(
        volumeAhead: Integer | undefined, auctionVolume: Integer | undefined
    ): DepthRecord.ProcessVolumeAheadResult {
        let inAuction: boolean;
        let cumulativeVolume: Integer | undefined;
        let partialAuctionVolumeChanged = false;
        if (volumeAhead === undefined) {
            inAuction = false;
            cumulativeVolume = undefined;
        } else {
            // either less than quantity ahead records limit or in auction quantity range
            cumulativeVolume = volumeAhead + this.getVolume();
            if (auctionVolume === undefined) {
                inAuction = false;
            } else {
                if (auctionVolume <= volumeAhead) {
                    inAuction = false;
                } else {
                    inAuction = true;
                    let partialAuctionVolume: Integer | undefined;
                    if (auctionVolume < cumulativeVolume) {
                        partialAuctionVolume = auctionVolume - volumeAhead;
                    } else {
                        partialAuctionVolume = undefined;
                    }
                    if (partialAuctionVolume !== this.partialAuctionQuantity) {
                        this.partialAuctionQuantity = partialAuctionVolume;
                        partialAuctionVolumeChanged = true;
                    }
                }
            }
        }

        const inAuctionChanged = inAuction !== this.inAuction;
        if (inAuctionChanged) {
            this.inAuction = inAuction;
        }
        const volumeAheadChanged = volumeAhead !== this.volumeAhead;
        if (volumeAheadChanged) {
            this._volumeAhead = volumeAhead;
        }
        return {
            cumulativeVolume,
            inAuctionOrVolumeAheadOrPartialChanged: inAuctionChanged || volumeAheadChanged || partialAuctionVolumeChanged,
        };
    }

    protected createVolumeRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new IntegerRenderValue(this.getVolume());
        let extraAttribute: RenderValue.DepthRecordInAuctionAttribute | undefined;
        if (!this.inAuction) {
            extraAttribute = undefined;
        } else {
            let partialAuctionProportion: number | undefined;
            if (this.partialAuctionQuantity === undefined) {
                partialAuctionProportion = undefined;
            } else {
                partialAuctionProportion = this.partialAuctionQuantity / this.getVolume();
            }
            extraAttribute = {
                id: RenderValue.AttributeId.DepthRecordInAuction,
                partialAuctionProportion,
            };
        }
        return { renderValue, extraAttribute };
    }

    protected createVolumeAheadRenderValue(): DepthRecord.CreateRenderValueResult {
        const renderValue = new IntegerRenderValue(this.volumeAhead);
        return { renderValue };
    }

    abstract getVolume(): Integer;
    abstract getRenderVolume(): Integer | undefined;
    abstract acceptedByFilter(filterXrefs: string[]): boolean;
}

export namespace DepthRecord {
    export const enum TypeId {
        Order,
        PriceLevel,
    }

    export interface ProcessVolumeAheadResult {
        cumulativeVolume: Integer | undefined;
        inAuctionOrVolumeAheadOrPartialChanged: boolean;
    }

    export interface CreateRenderValueResult {
        renderValue: RenderValue;
        extraAttribute?: RenderValue.Attribute;
    }
}
