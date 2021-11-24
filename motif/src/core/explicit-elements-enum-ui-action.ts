/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'sys-internal-api';
import { EnumUiAction } from './enum-ui-action';

export class ExplicitElementsEnumUiAction extends EnumUiAction {
    private _elementPropertiesMap = new Map<Integer, EnumUiAction.ElementProperties>();

    getElementProperties(element: Integer) {
        return this._elementPropertiesMap.get(element);
    }

    getElementPropertiesArray() {
        const result = new Array<EnumUiAction.ElementProperties>(this._elementPropertiesMap.size);
        let idx = 0;
        for (const value of this._elementPropertiesMap.values()) {
            result[idx++] = value;
        }
        return result;
    }

    pushElement(element: Integer, caption: string, title: string) {
        const elementProperties: EnumUiAction.ElementProperties = {
            element,
            caption,
            title,
        };
        this._elementPropertiesMap.set(element, elementProperties);
        this.notifyElementPush(element, caption, title);
    }

    pushElements(elementPropertiesArray: EnumUiAction.ElementProperties[],
        filter: Integer[] | undefined | null = null) {
        this._elementPropertiesMap.clear();
        for (const elementProperties of elementPropertiesArray) {
            this._elementPropertiesMap.set(elementProperties.element, elementProperties);
        }
        this.notifyElementsPush(filter);
    }
}
