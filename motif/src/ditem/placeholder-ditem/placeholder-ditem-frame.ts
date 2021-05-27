/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'src/adi/internal-api';
import { ExtensionId } from 'src/content/internal-api';
import { CommandRegisterService, SymbolsService } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { Json, JsonElement } from 'src/sys/internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemComponent } from '../ditem-component';
import { DitemFrame } from '../ditem-frame';

export class PlaceholderDitemFrame extends BuiltinDitemFrame {
    private _placeheld: PlaceholderDitemFrame.Placeheld;
    private _invalidReason: string | undefined;

    get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Placeholder; }
    get initialised() { return true; }

    get placeheld() { return this._placeheld; }

    public get placeheldExtensionPublisherType() {
        return ExtensionId.PublisherType.idToDisplay(this._placeheld.definition.extensionId.publisherTypeId);
    }
    public get placeheldExtensionPublisher() { return this._placeheld.definition.extensionId.publisherName; }
    public get placeheldExtensionName() { return this._placeheld.definition.extensionId.name; }
    public get placeheldConstructionMethod() {
        return DitemComponent.ConstructionMethod.idToName(this._placeheld.definition.constructionMethodId);
    }
    public get placeheldComponentTypeName() { return this._placeheld.definition.componentTypeName; }
    public get placeheldComponentState() { return this._placeheld.state; }
    public get placeheldReason() { return this._placeheld.reason; }

    public get invalid() { return this._invalidReason !== undefined; }
    public get invalidReason() { return this._invalidReason; }

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Placeholder,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    setPlaceheld(value: PlaceholderDitemFrame.Placeheld) {
        this._placeheld = value;
    }

    constructLoad(element: JsonElement | undefined) {
        if (element === undefined) {
            this._placeheld = this.createInvalidPlacehold(Strings[StringId.PlaceholderDitem_ComponentStateNotSpecified]);
        } else {
            const json = element.json;
            // eslint-disable-next-line @typescript-eslint/ban-types
            const persistablePlaceheld = json as object as PlaceholderDitemFrame.PersistablePlaceheld;
            this._placeheld = PlaceholderDitemFrame.Placeheld.fromPersistable(persistablePlaceheld);
            // const persistablePlaceheldJson = element.tryGetJsonObject(PlaceholderDitemFrame.JsonName.placeheld);

            // if (persistablePlaceheldJson === undefined) {
            //     this._placeheld = this.createInvalidPlacehold(Strings[StringId.PlaceholderDitem_ComponentStateIsInvalid]);
            // } else {
            //     const persistablePlaceheld = persistablePlaceheldJson as Object as PlaceholderDitemFrame.PersistablePlaceheld;
            //     this._placeheld = PlaceholderDitemFrame.Placeheld.fromPersistable(persistablePlaceheld);
            // }
        }

        // do not call super.constructLoad() as no LitIvemId or BrokerageAccountGroup
    }

    save(element: JsonElement) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const persistablePlaceheld = PlaceholderDitemFrame.Placeheld.toPersistable(this._placeheld) as object;
        element.deepExtend(persistablePlaceheld as Json);
        // element.setJson(PlaceholderDitemFrame.JsonName.placeheld, persistablePlaceheld as Json);

        // do not call super.save() as no LitIvemId or BrokerageAccountGroup
    }

    private createInvalidPlacehold(invalidReason: string): PlaceholderDitemFrame.Placeheld {
        const definition: DitemComponent.Definition = {
            extensionId: {
                publisherTypeId: ExtensionId.PublisherTypeId.Invalid,
                publisherName: '',
                name: '',
            },
            constructionMethodId: DitemComponent.ConstructionMethodId.Invalid,
            componentTypeName: '',
        };

        return {
            definition,
            state: undefined,
            tabText: '',
            reason: '',
            invalidReason,
        };
    }
}

export namespace PlaceholderDitemFrame {
    export namespace JsonName {
        export const placeheld = 'placeheld';
    }

    export interface Placeheld {
        readonly definition: DitemComponent.Definition;
        readonly state: Json | undefined;
        readonly tabText: string;
        readonly reason: string;
        readonly invalidReason: string | undefined;
    }

    export namespace Placeheld {
        export function fromPersistable(value: PersistablePlaceheld) {
            const fromDefinitionPersistableResult = DitemComponent.Definition.fromPersistable(value.definition);
            const definition = fromDefinitionPersistableResult.definition;

            let tabText = value.tabText;
            if (tabText === undefined || typeof tabText !== 'string') {
                tabText = definition.componentTypeName;
            }
            let reason = value.reason;
            if (reason === undefined || typeof reason !== 'string') {
                reason = Strings[StringId.Unknown];
            }
            let invalidReason = value.invalidReason;
            if (invalidReason !== undefined && typeof invalidReason !== 'string') {
                invalidReason = Strings[StringId.Unknown];
            }
            const placeheld: Placeheld = {
                definition,
                state: value.state,
                tabText,
                reason,
                invalidReason,
            };

            return placeheld;
        }

        export function toPersistable(value: Placeheld): PersistablePlaceheld {
            return {
                definition: DitemComponent.Definition.toPersistable(value.definition),
                state: value.state,
                tabText: value.tabText,
                reason: value.reason,
                invalidReason: value.invalidReason,
            };
        }
    }

    export interface PersistablePlaceheld {
        readonly definition: DitemComponent.PersistableDefinition;
        readonly state: Json | undefined;
        readonly tabText: string;
        readonly reason: string;
        readonly invalidReason: string | undefined;
    }

    export function is(builtinDitemFrame: BuiltinDitemFrame): builtinDitemFrame is PlaceholderDitemFrame {
        return builtinDitemFrame.builtinDitemTypeId === BuiltinDitemFrame.BuiltinTypeId.Placeholder;
    }
}
