/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AppStorageService, KeyValueStore, RegisteredExtension, Result } from '@motifmarkets/motif-core';
import { StorageSvc } from '../../../api/extension-api';

export class StorageSvcImplementation implements StorageSvc {
    private _keyPrefix: string;

    constructor(private readonly _registeredExtension: RegisteredExtension, private readonly _storageService: AppStorageService) {
        this._keyPrefix = KeyValueStore.Key.Extensions + ':' + this._registeredExtension.persistKey + ':';
    }

    getItem(key: string): Promise<Result<string | undefined>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.getItem(actualKey);
    }

    getSubNamedItem(key: string, subName: string): Promise<Result<string | undefined>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.getSubNamedItem(actualKey, subName);
    }

    setItem(key: string, value: string): Promise<Result<void>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.setItem(actualKey, value);
    }

    setSubNamedItem(key: string, subName: string, value: string): Promise<Result<void>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.setSubNamedItem(actualKey, subName, value);
    }

    removeItem(key: string): Promise<Result<void>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.removeItem(actualKey);
    }

    removeSubNamedItem(key: string, subName: string): Promise<Result<void>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.removeSubNamedItem(actualKey, subName);
    }

    private generateActualKey(key: string) {
        return this._keyPrefix + key;
    }
}
