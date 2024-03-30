/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorHandler, Injectable } from '@angular/core';
import { UserAlertService, getErrorMessage } from '@motifmarkets/motif-core';
import { UserAlertNgService } from 'component-services-ng-api';
import { TelemetryService } from '../telemetry-service';
import { TelemetryNgService } from './telemetry-ng.service';

// ErrorHandlerService is created before other services so other services cannot depend upon it

@Injectable()
export class ErrorHandlerNgService implements ErrorHandler {
    private _telemetry: TelemetryService;
    private _userAlertService: UserAlertService;

    constructor(telemetryService: TelemetryNgService, userAlertNgService: UserAlertNgService) {
        this._telemetry = telemetryService.service;
        this._userAlertService = userAlertNgService.service;
    }

    handleError(err: unknown): void {
        console.error(err);

        this._telemetry.error(err);

        this._userAlertService.queueAlert(UserAlertService.Alert.Type.Id.Exception, getErrorMessage(err));
    }
}

// export namespace ErrorHandlerService {
//     export type ErrorEventHandler = (this: void, err: any) => void;
// }
