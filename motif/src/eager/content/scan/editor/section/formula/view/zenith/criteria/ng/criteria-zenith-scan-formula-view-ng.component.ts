/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ScanEditor } from '@motifmarkets/motif-core';
import { ZenithScanFormulaViewNgDirective } from '../../ng/zenith-scan-formula-view-ng.directive';

@Component({
    selector: 'app-criteria-zenith-scan-formula-view',
    templateUrl: './criteria-zenith-scan-formula-view-ng.component.html',
    styleUrls: ['./criteria-zenith-scan-formula-view-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriteriaZenithScanFormulaViewNgComponent extends ZenithScanFormulaViewNgDirective implements OnDestroy, AfterViewInit {
    protected getFormulaAsZenithText(editor: ScanEditor) {
        return editor.criteriaAsZenithText;
    }

    protected override setFormulaAsZenithText(editor: ScanEditor, text: string) {
        return editor.setCriteriaAsZenithText(text);
    }

    protected getFormulaAsZenithTextIfChanged(editor: ScanEditor, changedFieldIds: readonly ScanEditor.FieldId[]): string | undefined {
        for (const fieldId of changedFieldIds) {
            if (fieldId === ScanEditor.FieldId.CriteriaAsZenithText || fieldId === ScanEditor.FieldId.Criteria) {
                return editor.criteriaAsZenithText;
            }
        }
        return undefined
    }
}

export namespace CriteriaZenithScanFormulaViewNgComponent {
}
