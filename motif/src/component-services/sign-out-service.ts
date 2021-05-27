/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from 'src/sys/internal-api';

export class SignOutService {
    signOutEvent: SignOutService.SignOutEvent;

    signOut() {
        if (!this.signOutEvent === undefined) {
            throw new AssertInternalError('SOSSO3386200');
        } else {
            this.signOutEvent();
        }
    }
}

export namespace SignOutService {
    export type SignOutEvent = (this: void) => void;
}
