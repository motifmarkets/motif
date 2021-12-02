/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '@motifmarkets/motif-core';
import { ExtensionId, PersistableExtensionId } from './extension-id';

export interface ExtensionInfo extends ExtensionId {
    readonly version: string;
    readonly apiVersion: string;
    readonly shortDescription: string;
    readonly longDescription: string;
    readonly urlPath: string;
}

export namespace ExtensionInfo {
    export interface FromPersistableResult {
        info: ExtensionInfo;
        errorText: string | undefined;
    }

    export function fromPersistable(value: PersistableExtensionInfo): FromPersistableResult {
        const fromExtensionIdPersistableResult = ExtensionId.fromPersistable(value);
        const extensionId = fromExtensionIdPersistableResult.extensionId;
        let errorText = fromExtensionIdPersistableResult.errorText;

        let version = value.version;
        if (version === undefined) {
            errorText = extendErrorText(errorText, Strings[StringId.ExtensionInfo_VersionIsNotSpecified]);
            version = '';
        } else {
            if (typeof version !== 'string') {
                errorText = extendErrorText(errorText, `${Strings[StringId.ExtensionInfo_VersionIsInvalid]}: "${version}"`);
                version = '';
            }
        }

        let apiVersion = value.apiVersion;
        if (apiVersion === undefined) {
            extendErrorText(errorText, errorText = Strings[StringId.ExtensionInfo_ApiVersionIsNotSpecified]);
            apiVersion = '';
        } else {
            if (typeof apiVersion !== 'string' || apiVersion === '') {
                errorText = extendErrorText(errorText, `${Strings[StringId.ExtensionInfo_ApiVersionIsInvalid]}: "${apiVersion}"`);
                apiVersion = '';
            }
        }

        let shortDescription = value.shortDescription;
        if (shortDescription === undefined) {
            extendErrorText(errorText, errorText = Strings[StringId.ExtensionInfo_ShortDescriptionIsNotSpecified]);
            shortDescription = '';
        } else {
            if (typeof shortDescription !== 'string' || shortDescription === '') {
                errorText = extendErrorText(errorText,
                    `${Strings[StringId.ExtensionInfo_ShortDescriptionIsInvalid]}: "${shortDescription}"`
                );
                shortDescription = '';
            }
        }

        let longDescription = value.longDescription;
        if (longDescription === undefined) {
            extendErrorText(errorText, errorText = Strings[StringId.ExtensionInfo_LongDescriptionIsNotSpecified]);
            longDescription = '';
        } else {
            if (typeof longDescription !== 'string' || longDescription === '') {
                errorText = extendErrorText(errorText,
                    `${Strings[StringId.ExtensionInfo_LongDescriptionIsInvalid]}: "${longDescription}"`
                );
                longDescription = '';
            }
        }

        let urlPath = value.urlPath;
        if (urlPath === undefined) {
            extendErrorText(errorText, errorText = Strings[StringId.ExtensionInfo_UrlPathIsNotSpecified]);
            urlPath = '';
        } else {
            if (typeof urlPath !== 'string' || urlPath === '') {
                errorText = extendErrorText(errorText, `${Strings[StringId.ExtensionInfo_UrlPathIsInvalid]}: "${urlPath}"`);
                urlPath = '';
            }
        }

        const info: ExtensionInfo = {
            publisherTypeId: extensionId.publisherTypeId,
            publisherName: extensionId.publisherName,
            name: extensionId.name,
            version: value.version,
            apiVersion: value.apiVersion,
            shortDescription: value.shortDescription,
            longDescription: value.longDescription,
            urlPath: value.urlPath,
        };
        return { info, errorText };
    }

    function extendErrorText(existingErrorText: string | undefined, extraErrorText: string) {
        return existingErrorText === undefined ? extraErrorText : `${existingErrorText}; ${extraErrorText}`;
    }
}



export interface PersistableExtensionInfo extends PersistableExtensionId {
    readonly version: string;
    readonly apiVersion: string;
    readonly shortDescription: string;
    readonly longDescription: string;
    readonly urlPath: string;
}
