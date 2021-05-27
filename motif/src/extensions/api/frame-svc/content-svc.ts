/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Component,
    ContentComponent,
    DelayedBadnessComponent
} from '../exposed/extension-api';

/** @public */
export interface ContentSvc {
    readonly components: readonly ContentComponent[];

    destroyAllComponents(): void;
    destroyComponent(component: Component): void;

    createDelayedBadnessComponent(): DelayedBadnessComponent;
}
