/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionId, ExtensionsAccessService } from 'content-internal-api';
import { ExtensionDitemComponent } from 'ditem-internal-api';
import { ComponentContainer } from 'golden-layout';

export interface FrameExtensionsAccessService extends ExtensionsAccessService {
    getFrame(container: ComponentContainer, extensionId: ExtensionId, frameTypeName: string): ExtensionDitemComponent.GetResult;
    releaseFrame(component: ExtensionDitemComponent): void;
}
