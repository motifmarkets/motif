/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ModalNgService {

    constructor() { }

    // private modals: any[] = [];

    // add(modal: any) {
    //     // add modal to array of active modals
    //     this.modals.push(modal);
    // }

    // remove(id: string) {
    //     // remove modal from array of active modals
    //     this.modals = this.modals.filter(x => x.id !== id);
    // }

    // open(id: string) {
    //     // open modal specified by id
    //     const modal: any = this.modals.find((x: any) => x.id === id);
    //     if (modal === undefined) {
    //         Logger.logInternalError('MSOP495721', id.toString());
    //     } else {
    //         modal.open();
    //     }
    // }

    // close(id: string) {
    //     // close modal specified by id
    //     const modal: any = this.modals.find((x: any) => x.id === id);
    //     if (modal === undefined) {
    //         Logger.logInternalError('MSCL49968', id.toString());
    //     } else {
    //         modal.close();
    //     }
    // }
}
