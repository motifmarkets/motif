/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, MultiEvent } from 'src/sys/internal-api';
import { AdiService } from './adi-service';
import { DataDefinition } from './common/internal-api';
import { DataItem } from './data-item';

export class DataItemIncubator<T extends DataItem> {
    private _dataItem: T | undefined;
    private _correctnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _resolveFtn: DataItemIncubator.ResolveFtn<T> | undefined;
    private _rejectFtn: DataItemIncubator.RejectFtn | undefined;

    constructor(private _adi: AdiService) { }

    get incubating() { return this._dataItem !== undefined; }

    finalise() {
        this.checkResolve(undefined);
        this.checkUnsubscribeDataItem();
    }

    initiateSubscribeIncubation(definition: DataDefinition) {
        this.checkResolve(undefined);
        this.checkUnsubscribeDataItem();

        const dataItem = this._adi.subscribe(definition) as T;
        this._dataItem = dataItem;
        return dataItem;
    }

    getInitiatedDataItemSubscriptionOrPromise() {
        if (this._dataItem === undefined) {
            return undefined;
        } else {
            return this.getDefinitelyInitiatedDataItemSubscriptionOrPromise(this._dataItem);
        }
    }

    incubateSubcribe(definition: DataDefinition) {
        const dataItem = this.initiateSubscribeIncubation(definition);
        return this.getDefinitelyInitiatedDataItemSubscriptionOrPromise(dataItem);
    }

    cancel() {
        this.checkUnsubscribeDataItem();
        this.checkResolve(undefined);
    }

    isDataItem(dataItemOrPromise: T | Promise<T | undefined>): dataItemOrPromise is T {
        return dataItemOrPromise instanceof DataItem;
    }

    private handleDataCorrectnessChangeEvent() {
        if (this._dataItem === undefined) {
            throw new AssertInternalError('DIIHSCE5598');
        } else {
            if (this._dataItem.incubated) {
                this.checkUnsubscribeDataCorrectnessChangeEvent(this._dataItem);
                if (this.checkResolve(this._dataItem)) {
                    this._dataItem = undefined;
                } else {
                    // subscription was not returned - discard
                    this.checkUnsubscribeDataItem();
                }
            }
        }
    }

    private subscribeDataCorrectnessChangeEvent(dataItem: DataItem) {
        this._correctnessChangeSubscriptionId = dataItem.subscribeCorrectnessChangeEvent(
            () => this.handleDataCorrectnessChangeEvent()
        );
    }

    private checkUnsubscribeDataCorrectnessChangeEvent(dataItem: DataItem) {
        if (this._correctnessChangeSubscriptionId !== undefined) {
            dataItem.unsubscribeCorrectnessChangeEvent(this._correctnessChangeSubscriptionId);
            this._correctnessChangeSubscriptionId = undefined;
        }
    }

    private getDefinitelyInitiatedDataItemSubscriptionOrPromise(dataItem: T) {
        if (dataItem.incubated) {
            this.checkUnsubscribeDataCorrectnessChangeEvent(dataItem);
            const result = dataItem;
            this._dataItem = undefined;
            return result;
        } else {
            this.subscribeDataCorrectnessChangeEvent(dataItem);
            return new Promise<T | undefined>(
                (resolve, reject) => this.assignThenFunctions(resolve, reject)
            );
        }
    }

    private checkUnsubscribeDataItem() {
        if (this._dataItem !== undefined) {
            this.checkUnsubscribeDataCorrectnessChangeEvent(this._dataItem);
            this._adi.unsubscribe(this._dataItem);
            this._dataItem = undefined;
        }
    }

    private assignThenFunctions(resolveFtn: ((this: void, value: T | undefined) => void),
                                rejectFtn: ((this: void, reason: string) => void)) {
        if (this._dataItem === undefined) {
            resolveFtn(undefined); // been cancelled
        } else {
            if (this._dataItem.incubated) {
                this.checkUnsubscribeDataCorrectnessChangeEvent(this._dataItem);
                resolveFtn(this._dataItem); // fulfill immediately
                this._dataItem = undefined;
            } else {
                if (this._resolveFtn !== undefined) {
                    // cancel previous
                    this._resolveFtn(undefined);
                }
                this._resolveFtn = resolveFtn;
                this._rejectFtn = rejectFtn;
            }
        }
    }

    private checkResolve(value: T | undefined) {
        if (this._resolveFtn === undefined) {
            return false;
        } else {
            this._resolveFtn(value);
            this._resolveFtn = undefined;
            this._rejectFtn = undefined;
            return true;
        }
    }
}

export namespace DataItemIncubator {
    export type ResolveFtn<T> = (this: void, value: T | undefined) => void;
    export type RejectFtn = (this: void, reason: string) => void;
}
