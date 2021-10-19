import { ExtensionRegistrar, ExtensionSvc } from 'motif';
import * as npmPackage from '../package.json';
import { WebsiteEmbedExtension } from './website-embed-extension';

declare global {
    interface Window {
        motifExtensionRegistrar: ExtensionRegistrar;
    }
}

export function addExtensionLoadRequest() {
    const { version } = npmPackage;
    const request: ExtensionRegistrar.Request = {
        publisherType: 'Organisation',
        publisherName: 'Paritech',
        name: 'Website Embed',
        version,
        apiVersion: '1',
        loadCallback: (extensionSvc) => loadCallback(extensionSvc)
    };
    window.motifExtensionRegistrar.register(request);
}

export function loadCallback(extensionSvc: ExtensionSvc) {
    const extension = new WebsiteEmbedExtension(extensionSvc);
    extension.initialise();
    return extension;
}

addExtensionLoadRequest();
