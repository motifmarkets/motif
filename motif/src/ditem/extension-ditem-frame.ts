/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, BrokerageAccountGroup, LitIvemId } from 'src/adi/internal-api';
import { CommandRegisterService, SymbolsService } from 'src/core/internal-api';
import { JsonElement, JsonValue } from 'src/sys/internal-api';
import { DesktopAccessService } from './desktop-access-service';
import { DitemFrame } from './ditem-frame';

export class ExtensionDitemFrame extends DitemFrame {
    persistStateRequestEventer: ExtensionDitemFrame.PersistStateRequestEventHandler;

    get extensionHandle() { return this.ditemTypeId.extensionHandle; }
    get typeName() { return this.ditemTypeId.name; }

    get initialised() { return false; }

    constructor(
        ditemTypeId: DitemFrame.TypeId,
        private readonly _componentAccess: ExtensionDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService
    ) {
        super(ditemTypeId, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    getPersistState() {
        const jsonElement = new JsonElement();
        this.save(jsonElement);
        this._componentAccess.savePersistState(jsonElement);
        return jsonElement.json;
    }

    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean) {
        super.applyLitIvemId(litIvemId, selfInitiated);
        return this._componentAccess.applyLitIvemId(litIvemId, selfInitiated);
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean {
        super.applyBrokerageAccountGroup(group, selfInitiated);
        return this._componentAccess.applyBrokerageAccountGroup(group, selfInitiated);
    }
}

export namespace ExtensionDitemFrame {
    export type PersistStateRequestEventHandler = (this: void) => JsonValue | undefined;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        savePersistState(element: JsonElement): void;
        applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean;
        applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean;
    }
}
