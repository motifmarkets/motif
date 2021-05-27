/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BaseNgService } from '../base-ng.service';
import { RegistrationNgService } from '../registration-ng.service';

export abstract class RegisterableNgService extends BaseNgService {
    constructor(id: BaseNgService.Id, registrationNgService: RegistrationNgService) {
        super(id);
        registrationNgService.registerService(this);
    }
}
