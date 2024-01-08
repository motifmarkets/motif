/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DelayedBadnessComponentImplementation } from '../exposed/internal-api';
import { ApiComponentFactory } from './api-component-factory';

export interface ApiContentComponentFactory extends ApiComponentFactory {
    createDelayedBadnessComponent(): DelayedBadnessComponentImplementation;
}
