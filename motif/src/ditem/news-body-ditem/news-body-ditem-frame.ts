/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'src/adi/internal-api';
import { CommandRegisterService, SymbolsService } from 'src/core/internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class NewsBodyDitemFrame extends BuiltinDitemFrame {
    get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.NewsBody; }
    get initialised() { return true; }

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.NewsBody,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }
}

export namespace NewsBodyDitemFrame {
}
