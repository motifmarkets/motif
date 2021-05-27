/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList } from './comparable-list';
import { Integer, MapKey, Mappable } from './types';

export class MappedComparableList<T extends Mappable> extends ComparableList<T> {
    private _map = new Map<MapKey, T>();

    getItemByKey(key: MapKey) {
        return this._map.get(key);
    }

    setItem(index: Integer, value: T) {
        const existingValue = this.items[index];
        this._map.delete(existingValue.mapKey);
        super.setItem(index, value);
        this._map.set(value.mapKey, value);
    }

    add(value: T) {
        this._map.set(value.mapKey, value);
        return super.add(value);
    }

    addRange(values: T[]) {
        for (const value of values) {
            this._map.set(value.mapKey, value);
        }
        super.addRange(values);
    }

    addItemsRange(values: T[], rangeStartIndex: Integer, rangeCount: Integer) {
        const nextSubRangeIdx = rangeStartIndex + rangeCount;
        for (let i = rangeStartIndex; i < nextSubRangeIdx; i++) {
            const value = values[i];
            this._map.set(value.mapKey, value);
        }
        super.addItemsRange(values, rangeStartIndex, rangeCount);
    }

    replace(index: Integer, value: T) {
        const existingValue = this.items[index];
        this._map.delete(existingValue.mapKey);
        super.replace(index, value);
        this._map.set(value.mapKey, value);
    }

    insert(index: Integer, value: T) {
        this._map.set(value.mapKey, value);
        return super.insert(index, value);
    }

    insertRange(index: Integer, values: T[]) {
        for (const value of values) {
            this._map.set(value.mapKey, value);
        }
        super.insertRange(index, values);
    }

    remove(value: T) {
        super.remove(value);
        this._map.delete(value.mapKey);
    }

    removeAtIndex(index: Integer) {
        const existingValue = this.items[index];
        this._map.delete(existingValue.mapKey);
        super.removeAtIndex(index);
    }

    removeRange(index: Integer, deleteCount: Integer) {
        const nextRangeIdx = index + deleteCount;
        for (let i = index; i < nextRangeIdx; i++) {
            const existingValue = this.items[i];
            this._map.delete(existingValue.mapKey);
        }
        super.removeRange(index, deleteCount);
    }

    extract(value: T): T {
        this._map.delete(value.mapKey);
        return super.extract(value);
    }

    clear() {
        this._map.clear();
        super.clear();
    }

    contains(value: T) {
        return this._map.has(value.mapKey);
    }
}
