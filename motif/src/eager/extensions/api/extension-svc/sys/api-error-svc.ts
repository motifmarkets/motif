/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ApiError } from '../../exposed/extension-api';

/** @public */
export interface ApiErrorSvc {
    createError(code: ApiError.Code, message?: string): ApiError;
}
