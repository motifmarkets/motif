/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList } from '@motifmarkets/motif-core';
import {
    ComparableList as ComparableListApi,
    ComparisonResult as ComparisonResultApi,
    Integer as IntegerApi
} from 'src/extensions/api/extension-api';
import { ComparisonResultImplementation } from './types-api-implementation';

export class ComparableListImplementation<T> implements ComparableListApi<T> {
    constructor(private readonly _baseActual: ComparableList<T>) {}

    get items() {
        return this._baseActual.items;
    }

    get actual() {
        return this._baseActual;
    }

    get lastIndex() {
        return this._baseActual.lastIndex;
    }

    get capacityIncSize() {
        return this._baseActual.capacityIncSize;
    }
    set capacityIncSize(value: IntegerApi | undefined) {
        this._baseActual.capacityIncSize = value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get capacity() {
        return this._baseActual.capacity;
    }
    set capacity(value: IntegerApi) {
        this._baseActual.capacity = value;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get count() {
        return this._baseActual.count;
    }
    set count(value: IntegerApi) {
        this._baseActual.count = value;
    }

    getItem(index: IntegerApi): T {
        return this._baseActual.getItem(index);
    }

    setItem(index: IntegerApi, value: T): void {
        this._baseActual.setItem(index, value);
    }

    toArray(): T[] {
        return this._baseActual.toArray();
    }

    add(value: T): IntegerApi {
        return this._baseActual.add(value);
    }

    addRange(values: T[]): void {
        this._baseActual.addRange(values);
    }

    addItemsRange(
        values: T[],
        subRangeStartIndex: IntegerApi,
        subRangeCount: IntegerApi
    ): void {
        this._baseActual.addItemsRange(values, subRangeStartIndex, subRangeCount);
    }

    insert(index: IntegerApi, value: T): void {
        this._baseActual.insert(index, value);
    }

    insertRange(index: IntegerApi, values: T[]): void {
        this._baseActual.insertRange(index, values);
    }

    remove(value: T): void {
        this._baseActual.remove(value);
    }

    removeAtIndex(index: IntegerApi): void {
        this._baseActual.removeAtIndex(index);
    }

    removeRange(index: IntegerApi, deleteCount: IntegerApi): void {
        this._baseActual.removeRange(index, deleteCount);
    }

    clear(): void {
        this._baseActual.clear();
    }

    replace(index: IntegerApi, value: T): void {
        this._baseActual.replace(index, value);
    }

    extract(value: T): T {
        return this._baseActual.extract(value);
    }

    pack(
        unusedValue: T,
        beforeDeleteRangeCallBackFtn?: ComparableListApi.BeforeDeleteRangeCallBack
    ): void {
        this._baseActual.pack(unusedValue, beforeDeleteRangeCallBackFtn);
    }

    exchange(left: IntegerApi, right: IntegerApi): void {
        this._baseActual.exchange(left, right);
    }

    move(curIndex: IntegerApi, newIndex: IntegerApi): void {
        this._baseActual.move(curIndex, newIndex);
    }

    first(): T {
        return this._baseActual.first();
    }

    last(): T {
        return this._baseActual.last();
    }

    setMinimumCapacity(value: IntegerApi): void {
        this._baseActual.setMinimumCapacity(value);
    }

    expand(): void {
        this._baseActual.expand();
    }

    trimExcess(): void {
        this._baseActual.trimExcess();
    }

    contains(value: T): boolean {
        return this._baseActual.contains(value);
    }

    indexOf(value: T): IntegerApi {
        return this._baseActual.indexOf(value);
    }

    compareItems(left: T, right: T): ComparisonResultApi {
        const result = this._baseActual.compareItems(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    sort(compareCallback?: ComparableListApi.CompareCallback<T>): void {
        if (compareCallback === undefined) {
            this._baseActual.sort(undefined);
        } else {
            this._baseActual.sort((left, right) => {
                const comparisonResult = compareCallback(left, right);
                return ComparisonResultImplementation.fromApi(comparisonResult);
            });
        }
    }

    binarySearch(
        item: T,
        compareCallback?: ComparableListApi.CompareCallback<T>
    ): ComparableListApi.BinarySearchResult {
        if (compareCallback === undefined) {
            return this._baseActual.binarySearch(item, undefined);
        } else {
            return this._baseActual.binarySearch(item, (left, right) => {
                const comparisonResult = compareCallback(left, right);
                return ComparisonResultImplementation.fromApi(comparisonResult);
            });
        }
    }
}

export namespace ComparableListImplementation {
    export function baseToApi<T>(value: ComparableList<T>): ComparableListApi<T> {
        return new ComparableListImplementation(value);
    }

    export function baseFromApi<T>(value: ComparableListApi<T>) {
        const implementation = value as ComparableListImplementation<T>;
        return implementation.actual;
    }
}
