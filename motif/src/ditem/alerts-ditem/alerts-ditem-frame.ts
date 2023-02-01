/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CommandRegisterService, SymbolsService } from '@motifmarkets/motif-core';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class AlertsDitemFrame extends BuiltinDitemFrame {
    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Alerts,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Alerts; }
    get initialised() { return true; }
}

export namespace AlertsDitemFrame {
}
