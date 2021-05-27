/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    Injectable,
    Injector,
    Type
} from '@angular/core';
import { ContentComponentBaseNgDirective, DelayedBadnessNgComponent } from 'src/content/ng-api';
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
        private readonly _componentFactoryResolver: ComponentFactoryResolver
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
        const injector = Injector.create({
            providers: [],
        });
        const componentFactoryRef = this._componentFactoryResolver.resolveComponentFactory<T>(componentType);
        const componentRef = componentFactoryRef.create(injector);

        this.appRef.attachView(componentRef.hostView);

        return componentRef;
    }
}

export namespace ApiContentComponentFactoryNgService {

    export class GenericFactoryComponentRefImplementation<T extends ContentComponentBaseNgDirective>
        extends ApiComponentFactoryServiceBaseNgDirective.FactoryComponentRefImplementation {

        get componentRef() { return this._componentRef; }
        get instance() { return this._componentRef.instance; }

        constructor(private readonly _componentRef: ComponentRef<T>) {
            super();
        }
    }
}
