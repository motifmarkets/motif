/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { AssertInternalError, MultiEvent } from 'sys-internal-api';
import { BaseNgService } from './base-ng.service';

@Injectable({
    providedIn: 'root',
})
export class RegistrationNgService extends BaseNgService {
    private _registeredServices = new Array<BaseNgService>(
        BaseNgService.idCount
    );

    private _serviceRegisteredEvent = new MultiEvent<RegistrationNgService.ServiceRegisteredEventHandler>();

    constructor() {
        super(BaseNgService.Id.Register);
        this._registeredServices[BaseNgService.Id.Register] = this;
    }

    registerService(service: BaseNgService) {
        const id = service.id;
        if (this._registeredServices[id] !== undefined) {
            throw new AssertInternalError('RNSRS13399640');
        } else {
            this._registeredServices[id] = service;
            this.notifyServiceRegistered(id);
        }
    }

    subscribeServiceRegisteredEvent(handler: RegistrationNgService.ServiceRegisteredEventHandler) {
        return this._serviceRegisteredEvent.subscribe(handler);
    }

    unsubscribeServiceRegisteredEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._serviceRegisteredEvent.unsubscribe(subscriptionId);
    }

    private notifyServiceRegistered(id: BaseNgService.Id) {
        const handlers = this._serviceRegisteredEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            handler(id);
        }
    }
}

export namespace RegistrationNgService {
    export type ServiceRegisteredEventHandler = (this: void, id: BaseNgService.Id) => void;
}
