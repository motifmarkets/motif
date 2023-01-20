/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { InjectionToken } from '@angular/core';
import { LockOpenListItem } from '@motifmarkets/motif-core';

export namespace CoreInjectionTokens {
    export const lockOpenListItemOpener = new InjectionToken<LockOpenListItem.Opener>('LockOpenListItem.Opener');
}
