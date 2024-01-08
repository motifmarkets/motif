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
} from '../../../api/extension-api';
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

    getAt(index: IntegerApi): T {
        return this._baseActual.getAt(index);
    }

    setAt(index: IntegerApi, value: T): void {
        this._baseActual.setAt(index, value);
    }

    toArray(): readonly T[] {
        return this._baseActual.toArray();
    }

    add(value: T): IntegerApi {
        return this._baseActual.add(value);
    }

    addRange(values: readonly T[]): void {
        this._baseActual.addRange(values);
    }

    addSubRange(
        values: readonly T[],
        subRangeStartIndex: IntegerApi,
        subRangeCount: IntegerApi
    ): void {
        this._baseActual.addSubRange(values, subRangeStartIndex, subRangeCount);
    }

    insert(index: IntegerApi, value: T): void {
        this._baseActual.insert(index, value);
    }

    insertRange(index: IntegerApi, values: readonly T[]): void {
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

    removeItems(items: readonly T[], beforeRemoveRangeCallBack?: ComparableListApi.BeforeRemoveRangeCallBack): void {
        this._baseActual.removeItems(items, beforeRemoveRangeCallBack);
    }


    clear(): void {
        this._baseActual.clear();
    }

    extract(value: T): T {
        return this._baseActual.extract(value);
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

    setGrowthCapacity(growth: IntegerApi): void {
        this._baseActual.setGrowthCapacity(growth);
    }

    setMinimumCapacity(value: IntegerApi): void {
        this._baseActual.setMinimumCapacity(value);
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

    binarySearchEarliest(item: T, compareCallback?: ComparableListApi.CompareCallback<T>): ComparableListApi.BinarySearchResult {
        if (compareCallback === undefined) {
            return this._baseActual.binarySearchEarliest(item, undefined);
        } else {
            return this._baseActual.binarySearchEarliest(item, (left, right) => {
                const comparisonResult = compareCallback(left, right);
                return ComparisonResultImplementation.fromApi(comparisonResult);
            });
        }
    }

    binarySearchLatest(item: T, compareCallback?: ComparableListApi.CompareCallback<T>): ComparableListApi.BinarySearchResult {
        if (compareCallback === undefined) {
            return this._baseActual.binarySearchLatest(item, undefined);
        } else {
            return this._baseActual.binarySearchLatest(item, (left, right) => {
                const comparisonResult = compareCallback(left, right);
                return ComparisonResultImplementation.fromApi(comparisonResult);
            });
        }
    }

    binarySearchAny(item: T, compareCallback?: ComparableListApi.CompareCallback<T>): ComparableListApi.BinarySearchResult {
        if (compareCallback === undefined) {
            return this._baseActual.binarySearchAny(item, undefined);
        } else {
            return this._baseActual.binarySearchAny(item, (left, right) => {
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
