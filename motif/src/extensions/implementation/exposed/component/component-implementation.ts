/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Component as ComponentApi } from '../../../api/extension-api';
import { FactoryComponent } from './factory-component';

export abstract class ComponentImplementation implements ComponentApi, FactoryComponent {
    abstract get factoryComponentRef(): FactoryComponent.ComponentRef;
    abstract get rootHtmlElement(): HTMLElement;
    abstract destroy(): void;
}
