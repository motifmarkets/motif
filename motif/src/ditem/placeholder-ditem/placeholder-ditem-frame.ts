/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService,
    ErrorCode,
    Json,
    JsonElement,
    Ok,
    PublisherId,
    Result,
    StringId,
    Strings,
    SymbolsService
} from '@motifmarkets/motif-core';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemComponent } from '../ditem-component';
import { DitemFrame } from '../ditem-frame';

export class PlaceholderDitemFrame extends BuiltinDitemFrame {
    private _placeheldDefinition: PlaceholderDitemFrame.Placeheld;
    private _invalidReason: string | undefined;

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

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Placeholder; }
    get initialised() { return true; }

    get placeheld() { return this._placeheldDefinition; }

    public get placeheldExtensionPublisherType() {
        return PublisherId.Type.idToDisplay(this._placeheldDefinition.definition.extensionId.publisherId.typeId);
    }
    public get placeheldExtensionPublisher() { return this._placeheldDefinition.definition.extensionId.publisherId.name; }
    public get placeheldExtensionName() { return this._placeheldDefinition.definition.extensionId.name; }
    public get placeheldConstructionMethod() {
        return DitemComponent.ConstructionMethod.idToName(this._placeheldDefinition.definition.constructionMethodId);
    }
    public get placeheldComponentTypeName() { return this._placeheldDefinition.definition.componentTypeName; }
    public get placeheldComponentState() { return this._placeheldDefinition.state; }
    public get placeheldReason() { return this._placeheldDefinition.reason; }

    public get invalid() { return this._invalidReason !== undefined; }
    public get invalidReason() { return this._invalidReason; }

    setPlaceheld(value: PlaceholderDitemFrame.Placeheld) {
        this._placeheldDefinition = value;
    }

    override constructLoad(element: JsonElement | undefined) {
        if (element === undefined) {
            this._placeheldDefinition = this.createInvalidPlacehold(Strings[StringId.PlaceholderDitem_ComponentStateNotSpecified]);
        } else {
            const createResult = PlaceholderDitemFrame.PlaceHeld.createFromJson(element);
            if (createResult.isErr()) {
                this._placeheldDefinition = this.createInvalidPlacehold(createResult.error);
            } else {
                this._placeheldDefinition = createResult.value;
            }
        }

        // do not call super.constructLoad() as no LitIvemId or BrokerageAccountGroup
    }

    override save(element: JsonElement) {
        // // eslint-disable-next-line @typescript-eslint/ban-types
        // const persistablePlaceheld = PlaceholderDitemFrame.Definition.toPersistable(this._placeheldDefinition) as object;
        // element.deepExtend(persistablePlaceheld as Json);
        PlaceholderDitemFrame.PlaceHeld.saveToJson(this._placeheldDefinition, element);

        // do not call super.save() as no LitIvemId or BrokerageAccountGroup
    }

    private createInvalidPlacehold(invalidReason: string): PlaceholderDitemFrame.Placeheld {
        const definition: DitemComponent.Definition = {
            extensionId: {
                publisherId: PublisherId.invalid,
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

    export namespace PlaceHeld {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export namespace JsonName {
            export const definition = 'definition';
            export const state = 'state';
            export const tabText = 'tabText';
            export const reason = 'reason';
            export const invalidReason = 'invalidReason';
        }

        export function createFromJson(value: JsonElement): Result<Placeheld> {
            const ditemComponentDefinitionElementResult = value.tryGetElementType(JsonName.definition);
            if (ditemComponentDefinitionElementResult.isErr()) {
                const errorCode = ErrorCode.PlaceholderDitemFrameDefinition_DitemComponentIsNotSpecified;
                return ditemComponentDefinitionElementResult.createOuter(errorCode);
            } else {
                const ditemComponentDefinitionElement = ditemComponentDefinitionElementResult.value;
                const tryCreateDitemComponentResult = DitemComponent.Definition.tryCreateFromJson(ditemComponentDefinitionElement);
                if (tryCreateDitemComponentResult.isErr()) {
                    const invalidErrorCode = ErrorCode.PlaceholderDitemFrameDefinition_DitemComponentIsInvalid;
                    return tryCreateDitemComponentResult.createOuter(invalidErrorCode);
                } else {
                    const ditemCode = tryCreateDitemComponentResult.value;

                    const state = value.tryGetJsonObject(JsonName.state, 'PDFDCFJS11190');

                    let tabText = value.tryGetString(JsonName.tabText, 'PDFDCFJTT11190');
                    if (tabText === undefined || typeof tabText !== 'string') {
                        tabText = ditemCode.componentTypeName;
                    }
                    let reason = value.tryGetString(JsonName.reason, 'PDFDCFJR11190');
                    if (reason === undefined || typeof reason !== 'string') {
                        reason = Strings[StringId.Unknown];
                    }
                    let invalidReason = value.tryGetString(JsonName.invalidReason, 'PDFDCFJIR11190');;
                    if (invalidReason !== undefined && typeof invalidReason !== 'string') {
                        invalidReason = Strings[StringId.Unknown];
                    }
                    const placeheld: Placeheld = {
                        definition: ditemCode,
                        state,
                        tabText,
                        reason,
                        invalidReason,
                    };

                    return new Ok(placeheld);
                }
            }
        }

        export function saveToJson(value: Placeheld, element: JsonElement) {
            const definitionElement = element.newElement(JsonName.definition);
            DitemComponent.Definition.saveToJson(value.definition, definitionElement);
            element.setJson(JsonName.state, value.state);
            element.setString(JsonName.tabText, value.tabText);
            element.setString(JsonName.reason, value.reason);
            element.setString(JsonName.invalidReason, value.invalidReason);
        }
    }

    export function is(builtinDitemFrame: BuiltinDitemFrame): builtinDitemFrame is PlaceholderDitemFrame {
        return builtinDitemFrame.builtinDitemTypeId === BuiltinDitemFrame.BuiltinTypeId.Placeholder;
    }
}
