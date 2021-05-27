/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ComponentFactoryResolver,
    Injectable,
    Injector,
    StaticProvider,
    Type
} from '@angular/core';
import { ComponentContainer } from 'golden-layout';
import { PlaceholderDitemNgComponent } from '../placeholder-ditem/ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from './builtin-ditem-ng-component-base.directive';

@Injectable({
    providedIn: 'root',
})
export class DitemComponentFactoryNgService {
    private readonly _componentTypeMapByName = new Map<string, Type<BuiltinDitemNgComponentBaseNgDirective>>();

    constructor(private readonly _componentFactoryResolver: ComponentFactoryResolver) {}

    registerDitemComponentType(name: string, componentType: Type<BuiltinDitemNgComponentBaseNgDirective>) {
        this._componentTypeMapByName.set(name, componentType);
    }

    getRegisteredComponentTypeNames(): string[] {
        const count = this._componentTypeMapByName.size;
        const result = new Array<string>(count);
        let idx = 0;
        for (const [key, value] of this._componentTypeMapByName) {
            result[idx++] = key;
        }
        return result;
    }

    createComponent(componentTypeName: string, container: ComponentContainer) {
        let componentType = this._componentTypeMapByName.get(componentTypeName);
        if (componentType === undefined) {
            componentType = PlaceholderDitemNgComponent;
        }
        const provider: StaticProvider = {
            provide: BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken,
            useValue: container,
        };
        const injector = Injector.create({
            providers: [provider],
        });
        const componentFactoryRef = this._componentFactoryResolver.resolveComponentFactory<BuiltinDitemNgComponentBaseNgDirective>(
            componentType
        );
        return componentFactoryRef.create(injector);
    }
}

export namespace DitemComponentFactoryNgService {
    export interface Entry {
        readonly extensionPublisher: string;
        readonly extensionName: string;
        readonly componentTypeName: string;
        readonly ditemComponentType: Type<BuiltinDitemNgComponentBaseNgDirective>;
    }
}
