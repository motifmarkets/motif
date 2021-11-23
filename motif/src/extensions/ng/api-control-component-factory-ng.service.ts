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
import {
    BrokerageAccountGroupInputNgComponent,
    ButtonInputNgComponent,
    CaptionedCheckboxNgComponent,
    CheckboxInputNgComponent,
    ControlComponentBaseNgDirective,
    DateInputNgComponent,
    DecimalInputNgComponent,
    IntegerTextInputNgComponent,
    LitIvemIdSelectNgComponent,
    NumberInputNgComponent,
    OrderRouteInputNgComponent,
    RoutedIvemIdSelectNgComponent,
    SvgButtonNgComponent
} from 'src/controls/ng-api';
import {
    BooleanUiAction,
    BrokerageAccountGroupUiAction,
    ButtonUiAction,
    Command,
    DateUiAction,
    DecimalUiAction,
    IconButtonUiAction,
    IntegerUiAction,
    LitIvemIdUiAction,
    NumberUiAction,
    OrderRouteUiAction,
    RoutedIvemIdUiAction
} from 'src/core/internal-api';
import {
    ApiControlComponentFactory, BrokerageAccountGroupSelectImplementation,
    BuiltinIconButtonImplementation,
    ButtonImplementation,
    CaptionedCheckboxImplementation,
    CheckboxImplementation,
    DateInputImplementation,
    DecimalInputImplementation,
    IntegerInputImplementation,
    LitIvemIdSelectImplementation,
    NumberInputImplementation,
    OrderRouteSelectImplementation,
    RoutedIvemIdSelectImplementation
} from '../implementation/internal-api';
import { ApiComponentFactoryServiceBaseNgDirective } from './api-component-factory-service-base-ng.directive';

@Injectable({
    providedIn: 'root',
})
export class ApiControlComponentFactoryNgService extends ApiComponentFactoryServiceBaseNgDirective implements ApiControlComponentFactory {
    constructor(appRef: ApplicationRef, private readonly _componentFactoryResolver: ComponentFactoryResolver) {
        super(appRef);
    }

    createButton(command: Command): Promise<ButtonImplementation> {
        const uiAction = new ButtonUiAction(command);
        const factoryComponentRef = this.createFactoryComponentRef(ButtonInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new ButtonImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createBuiltinIconButton(command: Command): Promise<BuiltinIconButtonImplementation> {
        const uiAction = new IconButtonUiAction(command);
        const factoryComponentRef = this.createFactoryComponentRef(SvgButtonNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new BuiltinIconButtonImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createCaptionedCheckbox(valueRequired: boolean | undefined): Promise<CaptionedCheckboxImplementation> {
        const uiAction = new BooleanUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(CaptionedCheckboxNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new CaptionedCheckboxImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createCheckbox(valueRequired: boolean | undefined): Promise<CheckboxImplementation> {
        const uiAction = new BooleanUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(CheckboxInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new CheckboxImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createIntegerInput(valueRequired: boolean | undefined): Promise<IntegerInputImplementation> {
        const uiAction = new IntegerUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(IntegerTextInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new IntegerInputImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createNumberInput(valueRequired: boolean | undefined): Promise<NumberInputImplementation> {
        const uiAction = new NumberUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(NumberInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new NumberInputImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createDecimalInput(valueRequired: boolean | undefined): Promise<DecimalInputImplementation> {
        const uiAction = new DecimalUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(DecimalInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new DecimalInputImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createDateInput(valueRequired: boolean | undefined): Promise<DateInputImplementation> {
        const uiAction = new DateUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(DateInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new DateInputImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createBrokerageAccountGroupSelect(valueRequired: boolean | undefined): Promise<BrokerageAccountGroupSelectImplementation> {
        const uiAction = new BrokerageAccountGroupUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(BrokerageAccountGroupInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new BrokerageAccountGroupSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createLitIvemIdSelect(valueRequired: boolean | undefined): Promise<LitIvemIdSelectImplementation> {
        const uiAction = new LitIvemIdUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(LitIvemIdSelectNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new LitIvemIdSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createRoutedIvemIdSelect(valueRequired: boolean | undefined): Promise<RoutedIvemIdSelectImplementation> {
        const uiAction = new RoutedIvemIdUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(RoutedIvemIdSelectNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new RoutedIvemIdSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    createOrderRouteSelect(valueRequired: boolean | undefined): Promise<OrderRouteSelectImplementation> {
        const uiAction = new OrderRouteUiAction(valueRequired);
        const factoryComponentRef = this.createFactoryComponentRef(OrderRouteInputNgComponent);
        const instance = factoryComponentRef.componentRef.instance;
        const implementation = new OrderRouteSelectImplementation(factoryComponentRef, uiAction);
        if (instance.initialiseReady) {
            instance.initialise(uiAction);
            return Promise.resolve(implementation);
        } else {
            return new Promise(
                (resolve) => {
                    instance.initialiseReadyEventer = () => {
                        factoryComponentRef.componentRef.instance.initialise(uiAction);
                        resolve(implementation);
                    };
                }
            );
        }
    }

    private createFactoryComponentRef<T extends ControlComponentBaseNgDirective>(componentType: Type<T>) {
        const componentRef = this.createControl(componentType);
        return new ApiControlComponentFactoryNgService.GenericFactoryComponentRefImplementation(componentRef);
    }

    private createControl<T extends ControlComponentBaseNgDirective>(componentType: Type<T>) {
        const injector = Injector.create({
            providers: [],
        });
        const componentFactoryRef = this._componentFactoryResolver.resolveComponentFactory<T>(
            componentType
        );
        const componentRef = componentFactoryRef.create(injector);

        this.appRef.attachView(componentRef.hostView);

        return componentRef;
    }
}

export namespace ApiControlComponentFactoryNgService {
    export class GenericFactoryComponentRefImplementation<T extends ControlComponentBaseNgDirective>
        extends ApiComponentFactoryServiceBaseNgDirective.FactoryComponentRefImplementation {

        constructor(private readonly _componentRef: ComponentRef<T>) {
            super();
        }

        get componentRef() { return this._componentRef; }
    }
}
