/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from './internal-error';
import { ComparisonResult, Integer } from './types';

export interface BinarySearchResult {
    found: boolean;
    index: Integer;
}

export type CompareFtn<T> = (this: void, left: T, right: T) => ComparisonResult;

/** Finds any matching index.  Use if index values are unique */
export function anyBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>
) {
    return rangedAnyBinarySearch(values, item, compare, 0, values.length);
}

/** Finds any matching index in range.  Use if index values are unique */
export function rangedAnyBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>,
    index: Integer,
    count: Integer
): BinarySearchResult {

    if (index < 0 || (index >= values.length && count > 0) || index + count - 1 >= values.length || count < 0) {
        throw new AssertInternalError('USRBS25632988827', `${index} ${values.length} ${count}`);
    } else {
        if (count === 0) {
            return {
                found: false,
                index
            };
        } else {
            let found = false;
            let l = index;
            let h = index + count - 1;
            while (l <= h) {
                /* eslint-disable no-bitwise */
                const mid = l + ((h - l) >> 1);
                /* eslint-enable no-bitwise */
                const cmp = compare(values[mid], item);
                if (cmp < 0) {
                    l = mid + 1;
                } else {
                    h = mid - 1;
                    if (cmp === 0) {
                        found = true;
                        break;
                    }
                }
            }
            return {
                found,
                index: l
            };
        }
    }
}

/** Finds earliest matching index.  Use if index values are not unique */

export function earliestBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>
) {
    return rangedEarliestBinarySearch(values, item, compare, 0, values.length);
}

/** Finds earliest matching index in range.  Use if index values are not unique */
export function rangedEarliestBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>,
    index: Integer,
    count: Integer
): BinarySearchResult {

    if (index < 0 || (index >= values.length && count > 0) || index + count - 1 >= values.length || count < 0) {
        throw new AssertInternalError('USRBS25632988827', `${index} ${values.length} ${count}`);
    } else {
        if (count === 0) {
            return {
                found: false,
                index
            };
        } else {
            let found = false;
            let l = index;
            let h = index + count - 1;
            while (l <= h) {
                /* eslint-disable no-bitwise */
                const mid = l + ((h - l) >> 1);
                /* eslint-enable no-bitwise */
                const cmp = compare(values[mid], item);
                if (cmp < 0) {
                    l = mid + 1;
                } else {
                    h = mid - 1;
                    if (cmp === 0) {
                        found = true;
                    }
                }
            }
            return {
                found,
                index: l
            };
        }
    }
}

/** Finds earliest matching index.  Use if index values are not unique */
export function latestBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>
) {
    return rangedLatestBinarySearch(values, item, compare, 0, values.length);
}

/** Finds latest matching index.  Use if index values are not unique */
export function rangedLatestBinarySearch<T>(
    values: T[],
    item: T,
    compare: CompareFtn<T>,
    index: Integer,
    count: Integer
): BinarySearchResult {

    if (index < 0 || (index >= values.length && count > 0) || index + count - 1 >= values.length || count < 0) {
        throw new AssertInternalError('USRBS25632988827', `${index} ${values.length} ${count}`);
    } else {
        if (count === 0) {
            return {
                found: false,
                index
            };
        } else {
            let found = false;
            let l = index;
            let h = index + count - 1;
            while (l <= h) {
                /* eslint-disable no-bitwise */
                const mid = l + ((h - l) >> 1);
                /* eslint-enable no-bitwise */
                const cmp = compare(values[mid], item);
                if (cmp > 0) {
                    h = mid - 1;
                } else {
                    l = mid + 1;
                    if (cmp === 0) {
                        found = true;
                    }
                }
            }
            return {
                found,
                index: l
            };
        }
    }
}

export function quickSort<T>(values: T[], compareFtn: CompareFtn<T>) {
    firstLastRangedQuickSort(values, compareFtn, 0, values.length - 1);
}

export function rangedQuickSort<T>(values: T[], compareFtn: CompareFtn<T>, index: Integer, count: Integer) {
    firstLastRangedQuickSort(values, compareFtn, index, index + count - 1);
}

export function firstLastRangedQuickSort<T>(values: T[], compareFtn: CompareFtn<T>, firstIdx: Integer, lastIdx: Integer) {
    if (values.length > 0 && (lastIdx - firstIdx) > 0) {
        let i = firstIdx;
        let j = lastIdx;
        /* eslint-disable no-bitwise */
        const pivot = values[firstIdx + ((lastIdx - firstIdx) >> 1)];
        /* eslint-enable no-bitwise */
        do {
            while (compareFtn(values[i], pivot) < 0) {
                i++;
            }
            while (compareFtn(values[j], pivot) > 0) {
                j--;
            }

            if (i <= j) {
                if (i !== j) {
                    const temp = values[i];
                    values[i] = values[j];
                    values[j] = temp;
                }

                i++;
                j--;
            }
        } while (i <= j);
    }
}
