/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive } from '@angular/core';
import { Integer } from 'sys-internal-api';
import { ArrayComponentBaseNgDirective } from './array-component-base-ng.directive';

@Directive()
export abstract class EnumArrayComponentBaseNgDirective extends ArrayComponentBaseNgDirective<Integer> {
}
