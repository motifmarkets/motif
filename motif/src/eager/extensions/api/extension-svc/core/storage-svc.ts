/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Result } from '../../exposed/extension-api';

/** @public */
export interface StorageSvc {
    getItem(key: string): Promise<Result<string | undefined>>;
    getSubNamedItem(key: string, subName: string): Promise<Result<string | undefined>>;
    setItem(key: string, value: string): Promise<Result<void>>;
    setSubNamedItem(key: string, subName: string, value: string): Promise<Result<void>>;
    removeItem(key: string): Promise<Result<void>>;
    removeSubNamedItem(key: string, subName: string): Promise<Result<void>>;
}
