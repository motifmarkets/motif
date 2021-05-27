/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FactoryComponent } from '../exposed/internal-api';

export interface ApiComponentFactory {
    destroyComponent(component: FactoryComponent): void;
}
