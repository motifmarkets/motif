/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparisonResult, Integer } from './types-api';

/** @public */
export interface ComparableList<T> {
    capacityIncSize: Integer | undefined;

    readonly items: readonly T[];
    capacity: Integer;
    count: Integer;
    readonly lastIndex: Integer;

    getItem(index: Integer): T;
    setItem(index: Integer, value: T): void;

    toArray(): T[];

    add(value: T): Integer;
    addRange(values: T[]): void;
    addItemsRange(values: T[], subRangeStartIndex: Integer, subRangeCount: Integer): void;
    insert(index: Integer, value: T): void;
    insertRange(index: Integer, values: T[]): void;
    remove(value: T): void;
    removeAtIndex(index: Integer): void;
    removeRange(index: Integer, deleteCount: Integer): void;
    clear(): void;

    replace(index: Integer, value: T): void;
    extract(value: T): T;

    pack(unusedValue: T, beforeDeleteRangeCallBackFtn?: ComparableList.BeforeDeleteRangeCallBack): void;
    exchange(index1: Integer, index2: Integer): void;
    move(curIndex: Integer, newIndex: Integer): void;

    first(): T;
    last(): T;

    setMinimumCapacity(value: Integer): void;
    expand(): void;
    trimExcess(): void;

    contains(value: T): boolean;
    indexOf(value: T): Integer;
    compareItems(left: T, right: T): ComparisonResult;

    sort(compareCallback?: ComparableList.CompareCallback<T>): void;
    binarySearchEarliest(item: T, compareCallback?: ComparableList.CompareCallback<T>): ComparableList.BinarySearchResult;
    binarySearchLatest(item: T, compareCallback?: ComparableList.CompareCallback<T>): ComparableList.BinarySearchResult;
    binarySearchAny(item: T, compareCallback?: ComparableList.CompareCallback<T>): ComparableList.BinarySearchResult;
}

/** @public */
export namespace ComparableList {
    export interface BinarySearchResult {
        found: boolean;
        index: Integer;
    }

    export type CompareCallback<T> = (this: void, left: T, right: T) => ComparisonResult;
    export type BeforeDeleteRangeCallBack = (this: void, index: Integer, count: Integer) => void;
}
