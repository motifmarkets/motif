/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PublisherType } from './exposed/extension-api';
import { Extension } from './extension';
import { ExtensionSvc } from './extension-svc/extension-svc';

/** @public */
export interface ExtensionRegistrar {
    register(request: ExtensionRegistrar.Request): void;
}

/** @public */
export namespace ExtensionRegistrar {
    export type ApiVersion = '1';

    export interface Request {
        publisherType: PublisherType;
        publisherName: string;
        name: string;
        version: string;
        apiVersion: ApiVersion;
        loadCallback: Request.LoadCallback;
    }

    export namespace Request {
        export type LoadCallback = (this: void, extension: ExtensionSvc) => Extension;
    }

    export const windowPropertyName = 'motifExtensionRegistrar';
}

