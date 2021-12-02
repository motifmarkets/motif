/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement, JsonValue } from '@motifmarkets/motif-core';
import { Json as JsonApi, JsonElement as JsonElementApi, JsonSvc, JsonValue as JsonValueApi } from '../../../api/extension-api';
import { JsonElementImplementation } from '../../exposed/internal-api';

export class JsonSvcImplementation implements JsonSvc {
    isJson(value: JsonValueApi): value is JsonApi {
        return JsonValue.isJson(value);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    isJsonObject(value: JsonValueApi): value is JsonApi | object {
        return JsonValue.isJsonObject(value);
    }

    createJsonElement(json?: JsonApi): JsonElementApi {
        const element = new JsonElement(json, false);
        return JsonElementImplementation.toApi(element);
    }

    tryCreateJsonElementFromJsonValue(jsonValue: JsonValueApi | undefined): JsonElementApi | undefined {
        let json: JsonApi | undefined;
        if (jsonValue === undefined) {
            return undefined;
        } else {
            if (!JsonValue.isJson(jsonValue)) {
                return undefined;
            } else {
                json = jsonValue;
                return this.createJsonElement(json);
            }
        }
    }
}
