/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TradingEnvironment } from '@motifmarkets/motif-core';
import {
    TradingEnvironmentId as TradingEnvironmentIdApi, TradingEnvironmentIdHandle as TradingEnvironmentIdHandleApi, TradingEnvironmentIdSvc
} from '../../../api/extension-api';
import { TradingEnvironmentIdImplementation } from '../../exposed/internal-api';

export class TradingEnvironmentIdSvcImplementation implements TradingEnvironmentIdSvc {
    toName(id: TradingEnvironmentIdApi) {
        const environmentId = TradingEnvironmentIdImplementation.fromApi(id);
        return TradingEnvironment.idToName(environmentId);
    }

    fromName(name: string) {
        const environmentId = TradingEnvironment.tryNameToId(name);
        if (environmentId === undefined) {
            return undefined;
        } else {
            return TradingEnvironmentIdImplementation.toApi(environmentId);
        }
    }

    toJsonValue(id: TradingEnvironmentIdApi): string {
        const environmentId = TradingEnvironmentIdImplementation.fromApi(id);
        return TradingEnvironment.idToJsonValue(environmentId);
    }

    fromJsonValue(jsonValue: string): TradingEnvironmentIdApi | undefined {
        const environmentId = TradingEnvironment.tryJsonToId(jsonValue);
        if (environmentId === undefined) {
            return undefined;
        } else {
            return TradingEnvironmentIdImplementation.toApi(environmentId);
        }
    }

    toDisplay(id: TradingEnvironmentIdApi) {
        const environmentId = TradingEnvironmentIdImplementation.fromApi(id);
        return TradingEnvironment.idToDisplay(environmentId);
    }

    toHandle(id: TradingEnvironmentIdApi) {
        return TradingEnvironmentIdImplementation.fromApi(id);
    }

    fromHandle(handle: TradingEnvironmentIdHandleApi) {
        return TradingEnvironmentIdImplementation.toApi(handle);
    }

    handleToName(handle: TradingEnvironmentIdHandleApi) {
        return TradingEnvironment.idToName(handle);
    }

    handleFromName(name: string) {
        return TradingEnvironment.tryNameToId(name);
    }

    handleToDisplay(handle: TradingEnvironmentIdHandleApi) {
        return TradingEnvironment.idToDisplay(handle);
    }
}
