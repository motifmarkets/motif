/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import packageJson from '../../package.json';
import { BuildInfo } from './build-info';

export namespace Version {
    export const app = packageJson.version;
    export const commit = BuildInfo.ChangesetHash;
}
