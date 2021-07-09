/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, NotImplementedError } from './internal-error';
import { Integer } from './types';
import { CompareFtn, rangedEarliestBinarySearch, rangedQuickSort } from './utils-search';

export class ComparableList<T> {
    capacityIncSize: Integer | undefined;

    private _items: T[] = [];
    private _count: Integer = 0;
    private _compareItemsFtn: CompareFtn<T>;

    get items() { return this._items; }
    get capacity(): Integer { return this.getCapacity(); }
    set capacity(value: Integer) { this.setCapacity(value); }
    get count(): Integer { return this._count; }
    set count(value: Integer) { this.setCount(value); }
    get lastIndex() { return this._count - 1; }

    constructor(compareItemsFtn?: CompareFtn<T>) {
        if (compareItemsFtn !== undefined) {
            this._compareItemsFtn = compareItemsFtn;
        }
    }

    getItem(index: Integer): T {
        this.checkItemRangeInline(index);
        return this._items[index];
    }

    setItem(index: Integer, value: T) {
        this.checkItemRangeInline(index);
        this._items[index] = value;
    }

    toArray() {
        const result = new Array<T>(this.count);
        for (let i = 0; i < this.count; i++) {
            result[i] = this._items[i];
        }
        return result;
    }

    add(value: T) {
        const idx = this._count;
        this.growCheck(idx + 1);
        this._items[idx] = value;
        return this._count++;
    }

    addRange(values: T[]) {
        const capacity = this._items.length;
        if (this.count === capacity) {
            this._items = this._items.concat(values);
            this._count += values.length;
        } else {
            const newCount = this._count + values.length;
            let replaceCount: Integer;
            if (newCount < capacity) {
                replaceCount = newCount;
            } else {
                replaceCount = capacity - this.count;
                this._items = this._items.concat(values.slice(replaceCount));
            }

            if (replaceCount > 0) {
                let idx = this.count;
                for (let i = 0; i < replaceCount; i++) {
                    this._items[idx++] = values[i];
                }
            }

            this._count = newCount;
        }
    }

    addItemsRange(values: T[], subRangeStartIndex: Integer, subRangeCount: Integer) {
        let idx = this.count;
        const capacity = this._items.length;
        const newCount = this._count + subRangeCount;
        if (newCount < capacity) {
            this._items.length = newCount;
        }
        const subRangeEndPlus1Index = subRangeStartIndex + subRangeCount;
        for (let i = subRangeStartIndex; i < subRangeEndPlus1Index; i++) {
            this._items[idx++] = values[i];
        }

        this._count = newCount;
    }

    replace(index: Integer, value: T) {
        this.checkItemRangeInline(index);
        this._items[index] = value;
    }

    insert(index: Integer, value: T) {
        this.checkInsertRange(index);
        this._items.splice(index, 0, value);
        this._count++;
    }

    insertRange(index: Integer, values: T[]) {
        if (index === this.count) {
            this.addRange(values);
        } else {
            if (index === 0) {
                this._items = values.concat(this._items);
            } else {
                this._items.splice(index, 0, ...values);
            }
            this._count += values.length;
        }
    }

    pack(unusedValue: T, beforeDeleteRangeCallBackFtn?: ComparableList.BeforeDeleteRangeCallBackFtn) {
        throw new NotImplementedError('CLP9923566712');
        this._items = this._items.filter((value: T, index: Integer, array: T[]) => unusedValue === value);
    }

    remove(value: T) {
        const index = this.indexOf(value);
        if (index === -1) {
            throw new Error('Item not found');
        } else {
            this.removeAtIndex(index);
        }
    }

    removeAtIndex(index: Integer) {
        this.checkItemRangeInline(index);
        this._items.splice(index, 1);
        this._count--;
    }

    removeRange(index: Integer, deleteCount: Integer) {
        this.checkDeleteRange(index, deleteCount);
        this._items.splice(index, deleteCount);
        this._count -= deleteCount;
    }

    extract(value: T): T {
        const idx = this.indexOf(value);
        if (idx < 0) {
            throw new AssertInternalError('CLE909043382', `${value}`);
        } else {
            const result = this._items[idx];
            this._items.splice(idx, 1);
            this._count--;
            return result;
        }
    }

    exchange(index1: Integer, index2: Integer) {
        const temp = this._items[index1];
        this._items[index1] = this._items[index2];
        this._items[index2] = temp;
    }

    move(curIndex: Integer, newIndex: Integer) {
        if (curIndex !== newIndex) {
            this.checkItemRangeInline(newIndex);
            const temp = this._items[curIndex];
            this._items.splice(curIndex, 1);
            this._items.splice(newIndex, 0, temp);
        }
    }

    first(): T {
        return this.getItem(0);
    }

    last(): T {
        return this.getItem(this._count - 1);
    }

    clear() {
        this.setCapacity(0);
    }

    expand() {
        if (this._count === this._items.length) {
            this.growCheck(this._count + 1);
        }
        return this;
    }

    contains(value: T) {
        return this.indexOf(value) >= 0;
    }

    indexOf(value: T) {
        for (let idx = 0; idx < this._count; idx++) {
            if (this._items[idx] === value) {
                return idx;
            }
        }
        return -1;
    }

    compareItems(left: T, right: T) {
        return this._compareItemsFtn(left, right);
    }

    sort(compareItemsFtn?: CompareFtn<T>) {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }
        rangedQuickSort(this._items, compareItemsFtn, 0, this._count);
    }

    binarySearch(item: T, compareItemsFtn?: CompareFtn<T>) {
        if (compareItemsFtn === undefined) {
            compareItemsFtn = this._compareItemsFtn;
        }

        return rangedEarliestBinarySearch(this._items, item, compareItemsFtn, 0, this._count);
    }

    trimExcess() {
        this.setCapacity(this._count);
    }

    setMinimumCapacity(value: Integer) {
        if (this.capacity < value) {
            this.setCapacity(value);
        }
    }

    private getCapacity(): Integer {
        return this._items.length;
    }
    private setCapacity(value: Integer) {
        this._items.length = value;
        if (value < this._count) {
            this._count = value;
        }
    }

    private setCount(value: Integer) {
        if (value < 0) {
            throw new AssertInternalError('CLSC9034121833', `${value}`);
        } else {
            if (value > this.capacity) {
                this.setCapacity(value);
            }
            this._count = value;
        }
    }

    private checkItemRangeInline(index: Integer) {
        if ((index < 0) || (index >= this._count)) {
            throw new AssertInternalError('CLCIRIL12263498277', `${index}, ${this._count}`);
        }
    }

    private checkInsertRange(index: Integer) {
        if ((index < 0) || (index > this._count)) {
            throw new AssertInternalError('CLCIR988899441', `${index}, ${this._count}`);
        }
    }

    private checkDeleteRange(index: Integer, count: Integer) {
        if ((index < 0) || (count < 0) || (index + count > this._count)) {
            throw new AssertInternalError('CLCDR1225535829', `${index}, ${this._count}, ${count}`);
        }
    }

    private grow(count: Integer) {
        let newCount = this._items.length;
        if (newCount === 0) {
            newCount = count;
        } else {
            do {
                if (this.capacityIncSize !== undefined) {
                    newCount += this.capacityIncSize;
                } else {
                    newCount *= 2;
                }
                if (newCount <= 0) {
                    throw new AssertInternalError('CLCIR988899441', `${count}, ${this._count}, ${newCount}`);
                }
            } while (newCount <= count);
        }
        this.setCapacity(newCount);
    }

    private growCheck(newCount: Integer) {
        if (newCount > this._items.length) {
            this.grow(newCount);
        } else {
            if (newCount < 0) {
                throw new AssertInternalError('CLCIR988899441', `${this._count}, ${newCount}`);
            }
        }
    }
}

export namespace ComparableList {
    export type BeforeDeleteRangeCallBackFtn = (this: void, index: Integer, count: Integer) => void;
}
