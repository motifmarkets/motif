/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CommandRegisterService, SettingsService, SymbolsService } from '@motifmarkets/motif-core';
import { BuiltinDitemFrame } from '../../builtin-ditem-frame';
import { DitemFrame } from '../../ditem-frame';

export class AdvertWebPageDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    constructor(
        private readonly _componentAccess: AdvertWebPageDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage,
            _componentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage; }

    loadPage(url: string) {
        this._componentAccess.loadPage(url);
    }
}

export namespace AdvertWebPageDitemFrame {
    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        loadPage(url: string): void;
    }
}
