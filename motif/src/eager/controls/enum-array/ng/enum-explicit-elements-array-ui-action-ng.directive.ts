/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { Integer } from '@motifmarkets/motif-core';
import { TypedExplicitElementsArrayUiActionNgDirective } from './typed-explicit-elements-array-ui-action-ng.directive';

@Directive()
export abstract class EnumExplicitElementsArrayUiActionNgDirective extends TypedExplicitElementsArrayUiActionNgDirective<Integer> {
}
