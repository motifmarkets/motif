/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ApiError as ApiErrorApi, ApiErrorSvc } from '../../../api/extension-api';
import { ApiErrorImplementation } from '../../exposed/internal-api';

export class ApiErrorSvcImplementation implements ApiErrorSvc {
    createError(code: ApiErrorApi.Code, message?: string) {
        return new ApiErrorImplementation(code, message);
    }
}
