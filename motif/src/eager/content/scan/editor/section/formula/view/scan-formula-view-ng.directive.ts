/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive, InjectionToken } from '@angular/core';
import { ScanEditor } from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../../../../ng/content-component-base-ng.directive';
import { IdentifiableComponent } from 'component-internal-api';

@Directive()
export abstract class ScanFormulaViewNgDirective extends ContentComponentBaseNgDirective {
    protected _scanEditor: ScanEditor<IdentifiableComponent> | undefined;

    get scanEditor() { return this._scanEditor; }

    setEditor(value: ScanEditor<IdentifiableComponent> | undefined) {
        this._scanEditor = value;
    }
}

export namespace ScanFormulaViewNgDirective {
    export const enum FieldId {
        Criteria,
        Rank,
    }

    export const fieldIdInjectionToken = new InjectionToken<FieldId>('ScanFormulaViewFieldId');
}
