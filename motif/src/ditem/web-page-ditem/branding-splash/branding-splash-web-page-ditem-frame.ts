/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'src/adi/internal-api';
import { CommandRegisterService, SymbolsService } from 'src/core/internal-api';
import { BuiltinDitemFrame } from '../../builtin-ditem-frame';
import { DesktopAccessService } from '../../desktop-access-service';
import { DitemFrame } from '../../ditem-frame';

export class BrandingSplashWebPageDitemFrame extends BuiltinDitemFrame {
    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage; }
    get initialised() { return true; }

    constructor(
        private readonly _componentAccess: BrandingSplashWebPageDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage,
            _componentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    loadPage(url: string) {
        this._componentAccess.loadPage(url);
    }
}

export namespace BrandingSplashWebPageDitemFrame {
    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        loadPage(url: string): void;
    }
}
