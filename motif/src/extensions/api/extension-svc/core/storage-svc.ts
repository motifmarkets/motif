/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export interface StorageSvc {
    getItem(key: string): Promise<string | undefined>;
    getSubNamedItem(key: string, subName: string): Promise<string | undefined>;
    setItem(key: string, value: string): Promise<void>;
    setSubNamedItem(key: string, subName: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    removeSubNamedItem(key: string, subName: string): Promise<void>;
}
