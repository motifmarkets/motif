/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { StringId, Strings } from 'src/res/internal-api';
import { isIntegerRegex, parseIntStrict } from 'src/sys/internal-api';
import { NumberUiActionComponentBaseNgDirective } from '../../ng/number-ui-action-component-base-ng.directive';

@Directive()
export abstract class IntegerUiActionComponentBaseNgDirective extends NumberUiActionComponentBaseNgDirective {
    protected isTextOk(value: string) {
        return isIntegerRegex.test(value);
    }

    protected parseString(value: string): NumberUiActionComponentBaseNgDirective.ParseStringResult {
        const parsedNumber = parseIntStrict(value);
        if (parsedNumber === undefined) {
            return { errorText: Strings[StringId.InvalidIntegerString] };
        } else {
            return { parsedNumber };
        }
    }
}
