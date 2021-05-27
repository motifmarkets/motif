/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SourceTzOffsetDateTime, UnreachableCaseError } from 'src/sys/internal-api';
import { ApiError as ApiErrorApi, SourceTzOffsetDateTime as SourceTzOffsetDateTimeApi } from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from './api-error-api-implementation';

export namespace SourceTzOffsetDateTimeImplementation {
    export namespace TimezoneModeId {
        export function toApi(value: SourceTzOffsetDateTime.TimezoneModeId): SourceTzOffsetDateTimeApi.TimezoneMode {
            switch (value) {
                case SourceTzOffsetDateTime.TimezoneModeId.Utc: return SourceTzOffsetDateTimeApi.TimezoneModeEnum.Utc;
                case SourceTzOffsetDateTime.TimezoneModeId.Local: return SourceTzOffsetDateTimeApi.TimezoneModeEnum.Local;
                case SourceTzOffsetDateTime.TimezoneModeId.Source: return SourceTzOffsetDateTimeApi.TimezoneModeEnum.Source;
                default: throw new UnreachableCaseError('STODTITMITA09992338', value);
            }
        }

        export function fromApi(value: SourceTzOffsetDateTimeApi.TimezoneMode): SourceTzOffsetDateTime.TimezoneModeId {
            const enumValue = value as SourceTzOffsetDateTimeApi.TimezoneModeEnum;
            switch (enumValue) {
                case SourceTzOffsetDateTimeApi.TimezoneModeEnum.Utc: return SourceTzOffsetDateTime.TimezoneModeId.Utc;
                case SourceTzOffsetDateTimeApi.TimezoneModeEnum.Local: return SourceTzOffsetDateTime.TimezoneModeId.Local;
                case SourceTzOffsetDateTimeApi.TimezoneModeEnum.Source: return SourceTzOffsetDateTime.TimezoneModeId.Source;
                default:
                    const code = ApiErrorApi.CodeEnum.InvalidSourceTzOffsetDateTimeApiTimezoneMode;
                    throw new UnreachableCaseApiErrorImplementation(code, enumValue);
            }
        }
    }
}
