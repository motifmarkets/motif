/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';
import { EnumArrayUiAction } from './enum-array-ui-action';

export class ExplicitElementsEnumArrayUiAction extends EnumArrayUiAction {

    private _elementPropertiesMap = new Map<Integer, EnumArrayUiAction.ElementProperties>();

    get elementPropertiesMap() { return this._elementPropertiesMap; }

    getElementProperties(element: Integer) {
        return this._elementPropertiesMap.get(element);
    }

    getElementPropertiesArray() {
        const result = new Array<EnumArrayUiAction.ElementProperties>(this._elementPropertiesMap.size);
        let idx = 0;
        for (const value of this._elementPropertiesMap.values()) {
            result[idx++] = value;
        }
        return result;
    }

    pushElement(element: Integer, caption: string, title: string) {
        const elementProperties: EnumArrayUiAction.ElementProperties = {
            element,
            caption,
            title,
        };
        this._elementPropertiesMap.set(element, elementProperties);
        this.notifyElementPush(element, caption, title);
    }

    pushElements(elementPropertiesArray: EnumArrayUiAction.ElementProperties[],
        filter: Integer[] | undefined | null = null) {
        this._elementPropertiesMap.clear();
        for (const elementProperties of elementPropertiesArray) {
            this._elementPropertiesMap.set(elementProperties.element, elementProperties);
        }
        this.notifyElementsPush(filter);
    }
}
