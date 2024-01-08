/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataEnvironmentId, Integer } from '../../exposed/extension-api';

/** @public */
export interface DataEnvironmentIdSvc {
    toName(id: DataEnvironmentId): string;
    fromName(name: string): DataEnvironmentId | undefined;
    toJsonValue(id: DataEnvironmentId): string;
    fromJsonValue(jsonValue: string): DataEnvironmentId | undefined;
    toDisplay(id: DataEnvironmentId): string;

    toHandle(id: DataEnvironmentId): DataEnvironmentIdHandle;
    fromHandle(handle: DataEnvironmentIdHandle): DataEnvironmentId | undefined;

    handleToName(handle: DataEnvironmentIdHandle): string;
    handleFromName(name: string): DataEnvironmentIdHandle | undefined;
    handleToDisplay(handle: DataEnvironmentIdHandle): string;
}

/** @public */
export type DataEnvironmentIdHandle = Integer;
