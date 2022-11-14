/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    EnumInfoOutOfOrderError,
    Err,
    ErrorCode,
    ExtensionId,
    JsonElement,
    Ok,
    Result
} from '@motifmarkets/motif-core';
import { Component } from 'component-internal-api';

// This represents the Golden Layout Component Object

export interface DitemComponent extends Component {

}

export namespace DitemComponent {
    export interface Definition {
        readonly extensionId: ExtensionId;
        readonly constructionMethodId: ConstructionMethodId;
        readonly componentTypeName: string;
    }

    export namespace Definition {
        export namespace JsonName {
            export const extensionId = 'extensionId';
            export const constructionMethodId = 'constructionMethodId';
            export const componentTypeName = 'componentTypeName';
        }

        export const invalid: Definition = {
            extensionId: ExtensionId.invalid,
            constructionMethodId: ConstructionMethodId.Invalid,
            componentTypeName: '',
        };

        export function tryCreateFromJson(value: JsonElement): Result<Definition> {
            const getExtensionIdElementResult = value.tryGetElementType(JsonName.extensionId);
            if (getExtensionIdElementResult.isErr()) {
                return getExtensionIdElementResult.createOuter(ErrorCode.DitemComponent_ExtensionIdIsNotSpecified);
            } else {

                const extensionIdCreateResult = ExtensionId.tryCreateFromJson(getExtensionIdElementResult.value);
                if (extensionIdCreateResult.isErr()) {
                    return extensionIdCreateResult.createOuter(ErrorCode.DitemComponent_ExtensionIdIsInvalid);
                } else {
                    const extensionId = extensionIdCreateResult.value;

                    const componentTypeNameResult = value.tryGetStringType(JsonName.componentTypeName);
                    if (componentTypeNameResult.isErr()) {
                        const errorCode = ErrorCode.DitemComponent_ComponentTypeNameIsNotSpecifiedOrInvalid;
                        return componentTypeNameResult.createOuter(errorCode);
                    } else {
                        const constructionMethodNameResult = value.tryGetStringType(JsonName.constructionMethodId);
                        if (constructionMethodNameResult.isErr()) {
                            const errorCode = ErrorCode.DitemComponent_ConstructionMethodNameIsNotSpecifiedOrInvalid;
                            return constructionMethodNameResult.createOuter(errorCode);
                        } else {
                            const constructionMethodName = constructionMethodNameResult.value;
                            const constructionMethodId = DitemComponent.ConstructionMethod.tryJsonValueToId(constructionMethodName);
                            if (constructionMethodId === undefined) {
                                return new Err(ErrorCode.DitemComponent_ConstructionMethodNameIsUnknown);
                            } else {
                                const definition: Definition = {
                                    extensionId,
                                    constructionMethodId,
                                    componentTypeName: componentTypeNameResult.value,
                                };
                                return new Ok(definition);
                            }
                        }
                    }
                }
            }
        }

        export function saveToJson(value: Definition, element: JsonElement) {
            const extensionIdElement = element.newElement(JsonName.extensionId);
            ExtensionId.saveToJson(value.extensionId, extensionIdElement);
            element.setString(JsonName.constructionMethodId, ConstructionMethod.idToJsonValue(value.constructionMethodId));
            element.setString(JsonName.componentTypeName, value.componentTypeName);
        }
    }

    export const enum ConstructionMethodId {
        Invalid,
        Builtin1,
        Extension1,
    }

    export namespace ConstructionMethod {
        interface Info {
            readonly id: ConstructionMethodId;
            readonly jsonValue: string;
        }

        type InfosObject = { [id in keyof typeof ConstructionMethodId]: Info };

        const infosObject: InfosObject = {
            Invalid: {
                id: ConstructionMethodId.Invalid,
                jsonValue: 'Invalid',
            },
            Builtin1: {
                id: ConstructionMethodId.Builtin1,
                jsonValue: 'Builtin1',
            },
            Extension1: {
                id: ConstructionMethodId.Extension1,
                jsonValue: 'Extension1',
            },
        } as const;

        const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== i) {
                    throw new EnumInfoOutOfOrderError('DitemComponent.ConstructionMethodId', i, info.jsonValue);
                }
            }
        }

        export function idToJsonValue(id: DitemComponent.ConstructionMethodId) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: string) {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.jsonValue === value) {
                    return i;
                }
            }
            return undefined;
        }

        export function idToName(id: DitemComponent.ConstructionMethodId) {
            return idToJsonValue(id);
        }

        export function tryNameToId(value: string) {
            return tryJsonValueToId(value);
        }
    }
}

export namespace DitemComponentModule {
    export function initialiseStatic() {
        DitemComponent.ConstructionMethod.initialise();
    }
}
