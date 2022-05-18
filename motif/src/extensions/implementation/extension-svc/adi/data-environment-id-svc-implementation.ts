/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataEnvironment } from '@motifmarkets/motif-core';
import {
    DataEnvironmentId as DataEnvironmentIdApi, DataEnvironmentIdHandle as DataEnvironmentIdHandleApi, DataEnvironmentIdSvc
} from '../../../api/extension-api';
import { DataEnvironmentIdImplementation } from '../../exposed/internal-api';

export class DataEnvironmentIdSvcImplementation implements DataEnvironmentIdSvc {
    toName(id: DataEnvironmentIdApi) {
        const environmentId = DataEnvironmentIdImplementation.fromApi(id);
        return DataEnvironment.idToName(environmentId);
    }

    fromName(name: string) {
        const environmentId = DataEnvironment.tryNameToId(name);
        if (environmentId === undefined) {
            return undefined;
        } else {
            return DataEnvironmentIdImplementation.toApi(environmentId);
        }
    }

    toJsonValue(id: DataEnvironmentIdApi): string {
        const environmentId = DataEnvironmentIdImplementation.fromApi(id);
        return DataEnvironment.idToJsonValue(environmentId);
    }

    fromJsonValue(jsonValue: string): DataEnvironmentIdApi | undefined {
        const environmentId = DataEnvironment.tryJsonToId(jsonValue);
        if (environmentId === undefined) {
            return undefined;
        } else {
            return DataEnvironmentIdImplementation.toApi(environmentId);
        }
    }

    toDisplay(id: DataEnvironmentIdApi) {
        const environmentId = DataEnvironmentIdImplementation.fromApi(id);
        return DataEnvironment.idToDisplay(environmentId);
    }

    toHandle(id: DataEnvironmentIdApi) {
        return DataEnvironmentIdImplementation.fromApi(id);
    }

    fromHandle(handle: DataEnvironmentIdHandleApi) {
        return DataEnvironmentIdImplementation.toApi(handle);
    }

    handleToName(handle: DataEnvironmentIdHandleApi) {
        return DataEnvironment.idToName(handle);
    }

    handleFromName(name: string) {
        return DataEnvironment.tryNameToId(name);
    }

    handleToDisplay(handle: DataEnvironmentIdHandleApi) {
        return DataEnvironment.idToDisplay(handle);
    }
}
