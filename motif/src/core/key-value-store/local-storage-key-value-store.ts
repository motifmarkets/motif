/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyValueStore } from './key-value-store';

export class LocalStorageKeyValueStore implements KeyValueStore {

    constructor() { }

    public async getItem(key: string): Promise<string|undefined> {
        const item = window.localStorage.getItem(key);
        const value = (item === null)
            ? undefined
            : item;
        return Promise.resolve(value);
    }

    public async setItem(key: string, value: string): Promise<void> {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
    }

    public async removeItem(key: string): Promise<void> {
        window.localStorage.removeItem(key);
        return Promise.resolve();
    }
}
