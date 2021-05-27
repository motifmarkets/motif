/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Json, JsonElement, JsonValue } from '../../exposed/extension-api';

/** @public */
export interface JsonSvc {
    isJson(value: JsonValue): value is Json;
    // eslint-disable-next-line @typescript-eslint/ban-types
    isJsonObject(value: JsonValue): value is Json | object;
    createJsonElement(json?: Json): JsonElement;
    tryCreateJsonElementFromJsonValue(jsonValue: JsonValue | undefined): JsonElement | undefined;
}
