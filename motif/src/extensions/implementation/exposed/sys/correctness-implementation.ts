/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId, UnreachableCaseError } from 'src/sys/internal-api';
import {
    ApiError as ApiErrorApi,
    Correctness as CorrectnessApi,
    CorrectnessEnum as CorrectnessEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from './api-error-api-implementation';

export namespace CorrectnessImplementation {
    export function toApi(value: CorrectnessId): CorrectnessApi {
        switch (value) {
            case CorrectnessId.Good: return CorrectnessEnumApi.Good;
            case CorrectnessId.Usable: return CorrectnessEnumApi.Usable;
            case CorrectnessId.Suspect: return CorrectnessEnumApi.Suspect;
            case CorrectnessId.Error: return CorrectnessEnumApi.Error;
            default: throw new UnreachableCaseError('FCAITAU9000432338', value);
        }
    }

    export function fromApi(value: CorrectnessApi): CorrectnessId {
        const enumValue = value as CorrectnessEnumApi;
        switch (enumValue) {
            case CorrectnessEnumApi.Good: return CorrectnessId.Good;
            case CorrectnessEnumApi.Usable: return CorrectnessId.Usable;
            case CorrectnessEnumApi.Suspect: return CorrectnessId.Suspect;
            case CorrectnessEnumApi.Error: return CorrectnessId.Error;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidCorrectness, enumValue);
        }
    }
}
