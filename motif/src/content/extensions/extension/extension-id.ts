/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/i18n-strings';
import { EnumInfoOutOfOrderError } from 'sys-internal-api';

export interface ExtensionId {
    readonly publisherTypeId: ExtensionId.PublisherTypeId;
    readonly publisherName: string;
    readonly name: string;
}

export interface PersistableExtensionId {
    readonly publisherType: string;
    readonly publisherName: string;
    readonly name: string;
}

export namespace ExtensionId {
    export const enum PublisherTypeId {
        Invalid,
        Builtin,
        User,
        Organisation,
    }

    export namespace PublisherType {
        interface Info {
            readonly id: PublisherTypeId;
            readonly jsonValue: string;
            readonly displayId: StringId;
            readonly abbreviatedDisplayId: StringId;
        }

        type InfosObject = { [id in keyof typeof PublisherTypeId]: Info };

        const infosObject: InfosObject = {
            Invalid: {
                id: PublisherTypeId.Invalid,
                jsonValue: 'Invalid',
                displayId: StringId.ExtensionPublisherTypeId_Display_Invalid,
                abbreviatedDisplayId: StringId.ExtensionPublisherTypeId_Abbreviation_Invalid,
            },
            Builtin: {
                id: PublisherTypeId.Builtin,
                jsonValue: 'Builtin',
                displayId: StringId.ExtensionPublisherTypeId_Display_Builtin,
                abbreviatedDisplayId: StringId.ExtensionPublisherTypeId_Abbreviation_Builtin,
            },
            User: {
                id: PublisherTypeId.User,
                jsonValue: 'User',
                displayId: StringId.ExtensionPublisherTypeId_Display_User,
                abbreviatedDisplayId: StringId.ExtensionPublisherTypeId_Abbreviation_User,
            },
            Organisation: {
                id: PublisherTypeId.Organisation,
                jsonValue: 'Organisation',
                displayId: StringId.ExtensionPublisherTypeId_Display_Organisation,
                abbreviatedDisplayId: StringId.ExtensionPublisherTypeId_Abbreviation_Organisation,
            },
        } as const;

        const infos = Object.values(infosObject);
        const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== i) {
                    throw new EnumInfoOutOfOrderError('ExtensionInfo.PublisherTypeId', i, Strings[info.displayId]);
                }
            }
        }

        export function idToJsonValue(id: PublisherTypeId) {
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

        export function idToName(id: PublisherTypeId) {
            return idToJsonValue(id);
        }

        export function tryNameToId(value: string) {
            return tryJsonValueToId(value);
        }

        export function idToPersistKey(id: PublisherTypeId) {
            return idToJsonValue(id);
        }

        export function idToDisplayId(id: PublisherTypeId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: PublisherTypeId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToAbbreviatedDisplayId(id: PublisherTypeId) {
            return infos[id].abbreviatedDisplayId;
        }

        export function idToAbbreviatedDisplay(id: PublisherTypeId) {
            return Strings[idToAbbreviatedDisplayId(id)];
        }
    }

    export function isEqual(left: ExtensionId, right: ExtensionId) {
        return left.name === right.name && left.publisherName === right.publisherName && left.publisherTypeId === right.publisherTypeId;
    }

    export interface FromPersistableResult {
        extensionId: ExtensionId;
        errorText: string | undefined;
    }

    export function fromPersistable(value: PersistableExtensionId | undefined): FromPersistableResult {
        let errorText: string | undefined;

        let publisherTypeId = ExtensionId.PublisherTypeId.Invalid;
        let publisherName: string;
        let name: string;

        if (value === undefined) {
            publisherName = '';
            name = '';
            errorText = Strings[StringId.ExtensionId_PersistableIsNotSpecified];
        } else {
            const publisherTypeName = value.publisherType;
            if (publisherTypeName === undefined) {
                errorText = Strings[StringId.ExtensionId_PublisherTypeIsNotSpecified];
            } else {
                if (typeof publisherTypeName !== 'string') {
                    errorText = extendErrorText(errorText,
                        `${Strings[StringId.ExtensionId_PublisherTypeIsInvalid]}: "${publisherTypeName}"`
                    );
                } else {
                    const possiblePublisherTypeId = ExtensionId.PublisherType.tryNameToId(publisherTypeName);
                    if (possiblePublisherTypeId === undefined) {
                        errorText = extendErrorText(errorText,
                            `${Strings[StringId.ExtensionId_PublisherTypeIsInvalid]}: "${publisherTypeName}"`
                        );
                    } else {
                        publisherTypeId = possiblePublisherTypeId;
                    }
                }
            }

            publisherName = value.publisherName;
            if (publisherName === undefined) {
                extendErrorText(errorText, errorText = Strings[StringId.ExtensionId_PublisherIsNotSpecified]);
                publisherName = '';
            } else {
                if (typeof publisherName !== 'string' || publisherName === '') {
                    errorText = extendErrorText(errorText, `${Strings[StringId.ExtensionId_PublisherIsInvalid]}: "${publisherName}"`);
                    publisherName = '';
                }
            }

            name = value.name;
            if (name === undefined) {
                const notSpecifiedText = Strings[StringId.ExtensionId_ExtensionNameIsNotSpecified];
                errorText = extendErrorText(errorText, `${errorText}, ${notSpecifiedText}`);
                name = '';
            } else {
                if (typeof name !== 'string' || name === '') {
                    errorText = extendErrorText(errorText, `${Strings[StringId.ExtensionId_ExtensionNameIsInvalid]}: "${name}"`);
                    name = '';
                }
            }
        }

        const extensionId: ExtensionId = {
            publisherTypeId,
            publisherName,
            name,
        };
        return { extensionId, errorText };
    }

    export function toPersistable(value: ExtensionId): PersistableExtensionId {
        return {
            publisherType: ExtensionId.PublisherType.idToJsonValue(value.publisherTypeId),
            publisherName: value.publisherName,
            name: value.name,
        } as const;
    }

    function extendErrorText(existingErrorText: string | undefined, extraErrorText: string) {
        return existingErrorText === undefined ? extraErrorText : `${existingErrorText}; ${extraErrorText}`;
    }
}

export namespace ExtensionIdModule {
    export function initialiseStatic() {
        ExtensionId.PublisherType.initialise();
    }
}
