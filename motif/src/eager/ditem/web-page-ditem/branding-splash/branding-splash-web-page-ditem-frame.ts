/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CommandRegisterService, SettingsService, SymbolsService } from '@motifmarkets/motif-core';
import { BuiltinDitemFrame } from '../../builtin-ditem-frame';
import { DitemFrame } from '../../ditem-frame';

export class BrandingSplashWebPageDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    constructor(
        componentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage,
            componentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.BrandingSplashWebPage; }
}
