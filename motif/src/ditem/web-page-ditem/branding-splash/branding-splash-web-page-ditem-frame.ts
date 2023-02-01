/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SafeResourceUrl } from '@angular/platform-browser';
import { AdiService, CommandRegisterService, SymbolsService } from '@motifmarkets/motif-core';
import { BuiltinDitemFrame } from '../../builtin-ditem-frame';
import { DitemFrame } from '../../ditem-frame';

export class BrandingSplashWebPageDitemFrame extends BuiltinDitemFrame {
    constructor(
        private readonly _componentAccess: BrandingSplashWebPageDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage,
            _componentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage; }
    get initialised() { return true; }

    loadPage(safeResourceUrl: SafeResourceUrl) {
        this._componentAccess.loadPage(safeResourceUrl);
    }
}

export namespace BrandingSplashWebPageDitemFrame {
    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        loadPage(safeResourceUrl: SafeResourceUrl): void;
    }
}
