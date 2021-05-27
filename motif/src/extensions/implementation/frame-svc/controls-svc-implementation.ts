/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';
import {
    ApiError as ApiErrorApi,
    BrokerageAccountGroupSelect as BrokerageAccountGroupSelectApi,
    BuiltinIconButton as BuiltinIconButtonApi,
    Button as ButtonApi,
    CaptionedCheckbox as CaptionedCheckboxApi,
    Checkbox as CheckboxApi,
    Command as CommandApi,
    ControlComponent as ControlComponentApi,
    ControlsSvc,
    DateInput as DateInputApi,
    DecimalInput as DecimalInputApi,
    IntegerInput as IntegerInputApi,
    LitIvemIdSelect as LitIvemIdSelectApi,
    NumberInput as NumberInputApi,
    OrderRouteSelect as OrderRouteSelectApi,
    RoutedIvemIdSelect as RoutedIvemIdSelectApi,
    UiAction as UiActionApi
} from '../../api/extension-api';
import {
    ApiErrorImplementation,
    CommandImplementation,
    FactoryComponent
} from '../exposed/internal-api';
import { ApiControlComponentFactory } from './api-control-component-factory';

export class ControlsSvcImplementation implements ControlsSvc {
    private _controls: ControlComponentApi[] = [];
    private _uiActions: UiActionApi[] = [];

    get controls() { return this._controls; }
    get uiActions() { return this._uiActions; }

    constructor(private readonly _componentFactory: ApiControlComponentFactory) { }

    public destroyAllControls() {
        const count = this._controls.length;

        for (let i = count - 1; i >= 0; i--) {
            this.destroyControlAtIndex(i);
        }
    }

    public destroyControl(control: UiActionApi | ControlComponentApi) {
        const uiAction = control as UiActionApi;
        const idx = this._uiActions.indexOf(uiAction);
        if (idx < 0) {
            throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.UnknownControl, `Caption: ${uiAction.caption}`);
        } else {
            this.destroyControlAtIndex(idx);
        }
    }

    public createButton(command: CommandApi): Promise<ButtonApi> {
        const actualCommand = CommandImplementation.fromApi(command);
        const controlPromise = this._componentFactory.createButton(actualCommand);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICB377273727: ' + ${reason}`)
        );
    }

    public createBuiltinIconButton(command: CommandApi): Promise<BuiltinIconButtonApi> {
        const actualCommand = CommandImplementation.fromApi(command);
        const controlPromise = this._componentFactory.createBuiltinIconButton(actualCommand);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICBIIB377273727: ' + ${reason}`)
        );
    }

    public createCaptionedCheckbox(valueRequired?: boolean): Promise<CaptionedCheckboxApi> {
        const controlPromise = this._componentFactory.createCaptionedCheckbox(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICCC377273727: ' + ${reason}`)
        );
    }

    public createCheckbox(valueRequired?: boolean): Promise<CheckboxApi> {
        const controlPromise = this._componentFactory.createCheckbox(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICC377273727: ' + ${reason}`)
        );
    }

    public createIntegerInput(valueRequired?: boolean): Promise<IntegerInputApi> {
        const controlPromise = this._componentFactory.createIntegerInput(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICII377273727: ' + ${reason}`)
        );
    }

    public createNumberInput(valueRequired?: boolean): Promise<NumberInputApi> {
        const controlPromise = this._componentFactory.createNumberInput(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICNI377273727: ' + ${reason}`)
        );
    }

    public createDecimalInput(valueRequired?: boolean): Promise<DecimalInputApi> {
        const controlPromise = this._componentFactory.createDecimalInput(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICDEI377273727: ' + ${reason}`)
        );
    }

    public createDateInput(valueRequired?: boolean): Promise<DateInputApi> {
        const controlPromise = this._componentFactory.createDateInput(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICDAI377273727: ' + ${reason}`)
        );
    }

    public createBrokerageAccountGroupSelect(valueRequired?: boolean): Promise<BrokerageAccountGroupSelectApi> {
        const controlPromise = this._componentFactory.createBrokerageAccountGroupSelect(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICBAGS377273727: ' + ${reason}`)
        );
    }

    public createLitIvemIdSelect(valueRequired?: boolean): Promise<LitIvemIdSelectApi> {
        const controlPromise = this._componentFactory.createLitIvemIdSelect(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICLIIS377273727: ' + ${reason}`)
        );
    }

    public createRoutedIvemIdSelect(valueRequired?: boolean): Promise<RoutedIvemIdSelectApi> {
        const controlPromise = this._componentFactory.createRoutedIvemIdSelect(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICRIIS377273727: ' + ${reason}`)
        );
    }

    public createOrderRouteSelect(valueRequired?: boolean): Promise<OrderRouteSelectApi> {
        const controlPromise = this._componentFactory.createOrderRouteSelect(valueRequired);
        return controlPromise.then(
            (controlApi) => {
                this.pushControl(controlApi as ControlComponentApi, controlApi as UiActionApi);
                return Promise.resolve(controlApi);
            },
            (reason) => Promise.reject(`CSICORS377273727: ' + ${reason}`)
        );
    }

    private pushControl(control: ControlComponentApi, uiAction: UiActionApi) {
        this._controls.push(control);
        this._uiActions.push(uiAction);
    }

    private destroyControlAtIndex(idx: Integer) {
        const control = this._controls[idx];
        this._controls.splice(idx, 1);
        this._uiActions.splice(idx, 1);
        this._componentFactory.destroyComponent(control as FactoryComponent);
    }
}
