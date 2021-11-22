/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export abstract class BaseNgService {
    constructor(private _id: BaseNgService.Id) { }

    get id() { return this._id; }
}

export namespace BaseNgService {
    export const enum Id {
        Session,
        SessionInfo,
        DesktopAccess,
        Settings,
        Register, // this must be last entry
    }

    export const idCount = Id.Register + 1;
}
