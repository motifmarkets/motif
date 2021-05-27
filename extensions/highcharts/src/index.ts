/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionRegistrar, ExtensionSvc } from 'motif';
import * as npmPackage from '../package.json';
import { HighchartsExtension } from './highcharts-extension';

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
        name: 'Highcharts',
        version,
        apiVersion: '1',
        loadCallback: (extensionSvc) => loadCallback(extensionSvc)
    };
    window.motifExtensionRegistrar.register(request);
}

export function loadCallback(extensionSvc: ExtensionSvc) {
    const extension = new HighchartsExtension(extensionSvc);
    extension.initialise();
    return extension;
}

addExtensionLoadRequest();
