import { Injectable } from '@angular/core';
import { UserAlertNgService } from 'component-services-ng-api';
import { OpenIdService } from '../open-id-service';

@Injectable({
    providedIn: 'root'
})
export class OpenIdNgService {
    private readonly _service: OpenIdService;

    constructor(userAlertNgService: UserAlertNgService) {
        this._service = new OpenIdService(userAlertNgService.service);
    }

    get service() { return this._service; }
}
