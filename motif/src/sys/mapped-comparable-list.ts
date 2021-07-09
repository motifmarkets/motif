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

    override setItem(index: Integer, value: T) {
        const existingValue = this.items[index];
        this._map.delete(existingValue.mapKey);
        super.setItem(index, value);
        this._map.set(value.mapKey, value);
    }

    override add(value: T) {
        this._map.set(value.mapKey, value);
        return super.add(value);
    }

    override addRange(values: T[]) {
        for (const value of values) {
            this._map.set(value.mapKey, value);
        }
        super.addRange(values);
    }

    override addItemsRange(values: T[], rangeStartIndex: Integer, rangeCount: Integer) {
        const nextSubRangeIdx = rangeStartIndex + rangeCount;
        for (let i = rangeStartIndex; i < nextSubRangeIdx; i++) {
            const value = values[i];
            this._map.set(value.mapKey, value);
        }
        super.addItemsRange(values, rangeStartIndex, rangeCount);
    }

    override replace(index: Integer, value: T) {
        const existingValue = this.items[index];
        this._map.delete(existingValue.mapKey);
        super.replace(index, value);
        this._map.set(value.mapKey, value);
    }

    override insert(index: Integer, value: T) {
        this._map.set(value.mapKey, value);
        return super.insert(index, value);
    }

    override insertRange(index: Integer, values: T[]) {
        for (const value of values) {
            this._map.set(value.mapKey, value);
        }
        super.insertRange(index, values);
    }

    override remove(value: T) {
        super.remove(value);
        this._map.delete(value.mapKey);
    }

    override removeAtIndex(index: Integer) {
        const existingValue = this.items[index];
        this._map.delete(existingValue.mapKey);
        super.removeAtIndex(index);
    }

    override removeRange(index: Integer, deleteCount: Integer) {
        const nextRangeIdx = index + deleteCount;
        for (let i = index; i < nextRangeIdx; i++) {
            const existingValue = this.items[i];
            this._map.delete(existingValue.mapKey);
        }
        super.removeRange(index, deleteCount);
    }

    override extract(value: T): T {
        this._map.delete(value.mapKey);
        return super.extract(value);
    }

    override clear() {
        this._map.clear();
        super.clear();
    }

    override contains(value: T) {
        return this._map.has(value.mapKey);
    }
}
