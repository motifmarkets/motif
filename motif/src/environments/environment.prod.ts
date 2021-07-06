/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnvironmentSecrets } from './environment-secrets';

export interface Environment {
    prodMode: boolean;
    rollbarAccessToken: string;
}

export const environment: Environment = {
    prodMode: true,
    rollbarAccessToken: EnvironmentSecrets.rollbarAccessToken, // Roll Bar Production API key
};
