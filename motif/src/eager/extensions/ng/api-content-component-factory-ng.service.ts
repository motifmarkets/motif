/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ApplicationRef, ComponentRef,
    createComponent,
    EnvironmentInjector,
    Injectable, Type
} from '@angular/core';
import { ContentComponentBaseNgDirective, DelayedBadnessNgComponent } from 'content-ng-api';
import {
    ApiContentComponentFactory,
    DelayedBadnessComponentImplementation
} from '../implementation/internal-api';
import { ApiComponentFactoryServiceBaseNgDirective } from './api-component-factory-service-base-ng.directive';

@Injectable({
    providedIn: 'root',
})
export class ApiContentComponentFactoryNgService extends ApiComponentFactoryServiceBaseNgDirective implements ApiContentComponentFactory {
    constructor(
        appRef: ApplicationRef,
        private readonly _environmentInjector: EnvironmentInjector,
    ) {
        super(appRef);
    }

    createDelayedBadnessComponent() {
        const factoryComponentRef = this.createFactoryComponentRef(DelayedBadnessNgComponent);
        return new DelayedBadnessComponentImplementation(factoryComponentRef, factoryComponentRef.instance);
    }

    private createFactoryComponentRef<T extends ContentComponentBaseNgDirective>(componentType: Type<T>) {
        const componentRef = this.createContentComponent(componentType);
        return new ApiContentComponentFactoryNgService.GenericFactoryComponentRefImplementation(componentRef);
    }

    private createContentComponent<T extends ContentComponentBaseNgDirective>(componentType: Type<T>) {
        const componentRef = createComponent(componentType, { environmentInjector: this._environmentInjector } );

        this.appRef.attachView(componentRef.hostView);

        return componentRef;
    }
}

export namespace ApiContentComponentFactoryNgService {

    export class GenericFactoryComponentRefImplementation<T extends ContentComponentBaseNgDirective>
        extends ApiComponentFactoryServiceBaseNgDirective.FactoryComponentRefImplementation {

        constructor(private readonly _componentRef: ComponentRef<T>) {
            super();
        }

        get componentRef() { return this._componentRef; }
        get instance() { return this._componentRef.instance; }
    }
}
