/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, StringId, Strings } from '@motifmarkets/motif-core';
import { Component } from 'component-internal-api';
import { ExtensionId, PersistableExtensionId } from 'content-internal-api';

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
        export interface FromPersistableResult {
            definition: Definition;
            errorText: string | undefined;
        }

        export function fromPersistable(value: PersistableDefinition | undefined): FromPersistableResult {
            let constructionMethodId = DitemComponent.ConstructionMethodId.Invalid;
            let componentTypeName: string;
            const fromExtensionIdPersistableResult = ExtensionId.fromPersistable(value?.extensionId);
            const extensionId = fromExtensionIdPersistableResult.extensionId;

            let errorText = fromExtensionIdPersistableResult.errorText;

            if (value === undefined || errorText !== undefined) {
                componentTypeName = '';
                if (errorText === undefined) {
                    errorText = Strings[StringId.DitemComponent_PersistableIsNotSpecified];
                }
            } else {
                constructionMethodId = DitemComponent.ConstructionMethodId.Invalid;
                componentTypeName = value.componentType;

                if (componentTypeName === undefined) {
                    componentTypeName = '';
                    const notSpecifiedText = Strings[StringId.DitemComponent_ComponentTypeIsNotSpecified];
                    errorText = errorText === undefined ? errorText : `${errorText}, ${notSpecifiedText}`;
                } else {
                    if (componentTypeName === '') {
                        const errorTypeText = Strings[StringId.DitemComponent_ComponentTypeIsInvalid];
                        errorText = `${errorTypeText}: "${componentTypeName}"`;
                    }
                }

                if (errorText === undefined) {
                    const constructionMethodName = value.constructionMethod;
                    if (constructionMethodName === undefined) {
                        errorText = Strings[StringId.DitemComponent_ConstructionMethodIsNotSpecified];
                    } else {
                        const possibleConstructionMethodId = DitemComponent.ConstructionMethod.tryJsonValueToId(
                            constructionMethodName
                        );
                        if (possibleConstructionMethodId === undefined) {
                            const errorTypeText = Strings[StringId.DitemComponent_ConstructionMethodIsInvalid];
                            errorText = `${errorTypeText}: "${constructionMethodName}"`;
                        } else {
                            constructionMethodId = possibleConstructionMethodId;
                        }
                    }
                }
            }

            const definition: DitemComponent.Definition = {
                extensionId,
                constructionMethodId,
                componentTypeName,
            };
            return { definition, errorText };
        }

        export function toPersistable(value: Definition): PersistableDefinition {
            return {
                extensionId: ExtensionId.toPersistable(value.extensionId),
                constructionMethod: ConstructionMethod.idToJsonValue(value.constructionMethodId),
                componentType: value.componentTypeName,
            } as const;
        }
    }

    export interface PersistableDefinition {
        readonly extensionId: PersistableExtensionId;
        readonly constructionMethod: string;
        readonly componentType: string;
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
