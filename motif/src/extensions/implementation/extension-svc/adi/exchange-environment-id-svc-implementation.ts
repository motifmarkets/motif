/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeEnvironment } from '@motifmarkets/motif-core';
import {
    ExchangeEnvironmentId as ExchangeEnvironmentIdApi,
    ExchangeEnvironmentIdHandle as ExchangeEnvironmentIdHandleApi,
    ExchangeEnvironmentIdSvc
} from '../../../api/extension-api';
import { ExchangeEnvironmentIdImplementation } from '../../exposed/internal-api';

export class ExchangeEnvironmentIdSvcImplementation implements ExchangeEnvironmentIdSvc {
    toName(id: ExchangeEnvironmentIdApi) {
        const environmentId = ExchangeEnvironmentIdImplementation.fromApi(id);
        return ExchangeEnvironment.idToName(environmentId);
    }

    fromName(name: string) {
        const environmentId = ExchangeEnvironment.tryNameToId(name);
        if (environmentId === undefined) {
            return undefined;
        } else {
            return ExchangeEnvironmentIdImplementation.toApi(environmentId);
        }
    }

    toJsonValue(id: ExchangeEnvironmentIdApi): string {
        const environmentId = ExchangeEnvironmentIdImplementation.fromApi(id);
        return ExchangeEnvironment.idToJsonValue(environmentId);
    }

    fromJsonValue(jsonValue: string): ExchangeEnvironmentIdApi | undefined {
        const environmentId = ExchangeEnvironment.tryJsonToId(jsonValue);
        if (environmentId === undefined) {
            return undefined;
        } else {
            return ExchangeEnvironmentIdImplementation.toApi(environmentId);
        }
    }

    toDisplay(id: ExchangeEnvironmentIdApi) {
        const environmentId = ExchangeEnvironmentIdImplementation.fromApi(id);
        return ExchangeEnvironment.idToDisplay(environmentId);
    }

    toHandle(id: ExchangeEnvironmentIdApi) {
        return ExchangeEnvironmentIdImplementation.fromApi(id);
    }

    fromHandle(handle: ExchangeEnvironmentIdHandleApi) {
        return ExchangeEnvironmentIdImplementation.toApi(handle);
    }

    handleToName(handle: ExchangeEnvironmentIdHandleApi) {
        return ExchangeEnvironment.idToName(handle);
    }

    handleFromName(name: string) {
        return ExchangeEnvironment.tryNameToId(name);
    }

    handleToDisplay(handle: ExchangeEnvironmentIdHandleApi) {
        return ExchangeEnvironment.idToDisplay(handle);
    }
}
