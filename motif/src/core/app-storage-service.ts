/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UnreachableCaseError } from 'sys-internal-api';
import { KeyValueStore } from './key-value-store/key-value-store';
import { LocalStorageKeyValueStore } from './key-value-store/local-storage-key-value-store';
import { MotifServicesKeyValueStore } from './key-value-store/motif-services-key-value-store';
import { MotifServicesService } from './motif-services-service';

export class AppStorageService {
    private _keyValueStore: KeyValueStore;

    constructor(private _motifServicesService: MotifServicesService) { }

    initialise(storageTypeId: AppStorageService.TypeId) {
        switch (storageTypeId) {
            case AppStorageService.TypeId.Local:
                this._keyValueStore = new LocalStorageKeyValueStore();
                break;
            case AppStorageService.TypeId.MotifServices:
                this._keyValueStore = new MotifServicesKeyValueStore(this._motifServicesService);
                break;
            default:
                throw new UnreachableCaseError('ASSI444873', storageTypeId);
        }
    }

    async getItem(key: AppStorageService.Key | string): Promise<string|undefined> {
        return this._keyValueStore.getItem(key);
    }

    async getSubNamedItem(key: AppStorageService.Key | string, subName: string): Promise<string|undefined> {
        const stringKey = AppStorageService.makeSubNamedKey(key, subName);
        return this._keyValueStore.getItem(stringKey);
    }

    async setItem(key: AppStorageService.Key | string, value: string): Promise<void> {
        this._keyValueStore.setItem(key, value);
    }

    async setSubNamedItem(key: AppStorageService.Key | string, subName: string, value: string): Promise<void> {
        const stringKey = AppStorageService.makeSubNamedKey(key, subName);
        this._keyValueStore.setItem(stringKey, value);
    }

    async removeItem(key: AppStorageService.Key | string): Promise<void> {
        this._keyValueStore.removeItem(key);
    }

    async removeSubNamedItem(key: AppStorageService.Key | string, subName: string): Promise<void> {
        const stringKey = AppStorageService.makeSubNamedKey(key, subName);
        this._keyValueStore.removeItem(stringKey);
    }
}

export namespace AppStorageService {
    export const enum TypeId {
        Local,
        MotifServices,
    }

    export function makeSubNamedKey(key: Key | string, subName: string) {
        return key + ':#' + subName;
    }

    export const enum Key {
        MasterSettings = 'masterSettings', // from MotifServicesService
        Settings = 'settings',
        Extensions = 'extensions',
        Layout = 'layout',
        LoadedExtensions = 'loadedExtensions',
    }
}
