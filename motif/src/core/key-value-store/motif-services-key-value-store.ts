/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MotifServicesService } from '../motif-services-service';
import { KeyValueStore } from './key-value-store';

export class MotifServicesKeyValueStore implements KeyValueStore {

    private _prefix: string;

    constructor(private _motifServicesService: MotifServicesService) {
    }

    public async getItem(key: string): Promise<string|undefined> {
        return this._motifServicesService.getUserSetting(key);
    }


    public async setItem(key: string, value: string): Promise<void> {
        return this._motifServicesService.setUserSetting(key, value);
    }

    public async removeItem(key: string): Promise<void> {
        return this._motifServicesService.deleteUserSetting(key);
    }
}
