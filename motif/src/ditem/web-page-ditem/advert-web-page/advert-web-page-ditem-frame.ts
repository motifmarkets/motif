/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CommandRegisterService, SymbolsService } from '@motifmarkets/motif-core';
import { BuiltinDitemFrame } from '../../builtin-ditem-frame';
import { DesktopAccessService } from '../../desktop-access-service';
import { DitemFrame } from '../../ditem-frame';

export class AdvertWebPageDitemFrame extends BuiltinDitemFrame {
    constructor(
        private readonly _componentAccess: AdvertWebPageDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage,
            _componentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage; }
    get initialised() { return true; }

    loadPage(url: string) {
        this._componentAccess.loadPage(url);
    }
}

export namespace AdvertWebPageDitemFrame {
    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        loadPage(url: string): void;
    }
}
