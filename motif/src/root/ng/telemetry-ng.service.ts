/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TelemetryService } from '../telemetry-service';

@Injectable({
    providedIn: 'root'
})
export class TelemetryNgService {
    private _telemetry = new TelemetryService();

    get telemetry() { return this._telemetry; }
}
