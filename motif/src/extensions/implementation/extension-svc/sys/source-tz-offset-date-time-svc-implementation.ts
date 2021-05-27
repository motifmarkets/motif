/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SourceTzOffsetDateTime } from 'src/sys/internal-api';
import {
    ComparisonResult as ComparisonResultApi,
    SourceTzOffsetDateTime as SourceTzOffsetDateTimeApi,
    SourceTzOffsetDateTimeSvc
} from '../../../api/extension-api';
import { ComparisonResultImplementation, SourceTzOffsetDateTimeImplementation } from '../../exposed/internal-api';

export class SourceTzOffsetDateTimeSvcImplementation implements SourceTzOffsetDateTimeSvc {
    getTimezonedDate(value: SourceTzOffsetDateTimeApi, adjustmentApi: SourceTzOffsetDateTimeApi.TimezoneMode): Date {
        const adjustment = SourceTzOffsetDateTimeImplementation.TimezoneModeId.fromApi(adjustmentApi);
        return SourceTzOffsetDateTime.getTimezonedDate(value, adjustment);
    }

    createCopy(value: SourceTzOffsetDateTimeApi): SourceTzOffsetDateTimeApi {
        return SourceTzOffsetDateTime.createCopy(value);
    }

    isEqual(left: SourceTzOffsetDateTimeApi, right: SourceTzOffsetDateTimeApi): boolean {
        return SourceTzOffsetDateTime.isEqual(left, right);
    }

    isUndefinableEqual(left: SourceTzOffsetDateTimeApi | undefined, right: SourceTzOffsetDateTimeApi | undefined): boolean {
        return SourceTzOffsetDateTime.isUndefinableEqual(left, right);
    }

    compare(left: SourceTzOffsetDateTimeApi, right: SourceTzOffsetDateTimeApi): ComparisonResultApi {
        const result = SourceTzOffsetDateTime.compare(left, right);
        return ComparisonResultImplementation.toApi(result);
    }

    compareUndefinable(
        left: SourceTzOffsetDateTimeApi | undefined,
        right: SourceTzOffsetDateTimeApi | undefined,
        undefinedIsLowest: boolean
    ): ComparisonResultApi {
        const result = SourceTzOffsetDateTime.compareUndefinable(left, right, undefinedIsLowest);
        return ComparisonResultImplementation.toApi(result);
    }
}
