/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { isPartialIntlFormattedInteger, parseIntStrict, StringId, Strings } from '@motifmarkets/motif-core';
import { NumberUiActionComponentBaseNgDirective } from '../../ng/number-ui-action-component-base-ng.directive';

@Directive()
export abstract class IntegerUiActionComponentBaseNgDirective extends NumberUiActionComponentBaseNgDirective {
    protected isTextOk(value: string) {
        return isPartialIntlFormattedInteger(value, this.numberFormatCharParts);
    }

    protected override parseString(value: string): NumberUiActionComponentBaseNgDirective.ParseStringResult {
        const numberGroupCharRemoveRegex = this.numberGroupCharRemoveRegex;
        if (numberGroupCharRemoveRegex !== undefined) {
            value = value.replace(numberGroupCharRemoveRegex, '');
        }
        const parsedNumber = parseIntStrict(value);
        if (parsedNumber === undefined) {
            return { errorText: Strings[StringId.InvalidIntegerString] };
        } else {
            return { parsedNumber };
        }
    }
}
