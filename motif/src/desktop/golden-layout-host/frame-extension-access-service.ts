/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComponentContainer } from 'golden-layout';
import { ExtensionId, ExtensionsAccessService } from 'src/content/internal-api';
import { ExtensionDitemComponent } from 'src/ditem/internal-api';

export interface FrameExtensionsAccessService extends ExtensionsAccessService {
    getFrame(container: ComponentContainer, extensionId: ExtensionId, frameTypeName: string): ExtensionDitemComponent.GetResult;
    releaseFrame(component: ExtensionDitemComponent): void;
}
