/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { parseNumberStrict } from 'sys-internal-api';

export namespace AngularSplitTypes {
    export const enum Unit {
        percent = 'percent',
        pixel = 'pixel',
    }

    export namespace AreaSize {
        export type IOutput = number | '*';
        export type Html = number | null;

        export function iOutputToJsonValue(value: IOutput) {
            if (value === '*') {
                return '*';
            } else {
                return value.toString(10);
            }
        }

        export function jsonValueToIOutput(value: string) {
            if (value === '*') {
                return '*';
            } else {
                return parseNumberStrict(value);
            }
        }

        export function iOutputToHtml(value: IOutput) {
            if (value === '*') {
                return null;
            } else {
                return value;
            }
        }
    }
}
