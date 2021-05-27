/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ApplicationRef, ComponentRef, Directive, EmbeddedViewRef } from '@angular/core';
import { ComponentBaseNgDirective } from 'src/component-services/ng-api';
import { ApiComponentFactory, ComponentImplementation, FactoryComponentRef } from '../implementation/internal-api';

@Directive()
export abstract class ApiComponentFactoryServiceBaseNgDirective implements ApiComponentFactory {
    get appRef() { return this._appRef; }

    constructor(
        private readonly _appRef: ApplicationRef,
    ) { }

    destroyComponent(component: ComponentImplementation) {
        component.destroy();

        const factorycomponentRef = component.factoryComponentRef;
        const implementation = factorycomponentRef as ApiComponentFactoryServiceBaseNgDirective.FactoryComponentRefImplementation;
        const componentRef = implementation.componentRef;

        this._appRef.detachView(componentRef.hostView);
        componentRef.destroy();
    }
}

export namespace ApiComponentFactoryServiceBaseNgDirective {
    export abstract class FactoryComponentRefImplementation implements FactoryComponentRef {
        abstract get componentRef(): ComponentRef<ComponentBaseNgDirective>;
        get rootHtmlElement() { return (this.componentRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement; }
    }
}
