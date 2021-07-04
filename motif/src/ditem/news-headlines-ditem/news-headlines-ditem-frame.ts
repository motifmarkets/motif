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

export class NewsHeadlinesDitemFrame extends BuiltinDitemFrame {
    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.NewsHeadlines; }
    get initialised() { return true; }

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.NewsHeadlines,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }
}

export namespace NewsHeadlinesDitemFrame {
}
