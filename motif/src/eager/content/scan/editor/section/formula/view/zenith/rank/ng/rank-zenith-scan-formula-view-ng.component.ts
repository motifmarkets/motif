/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ScanEditor } from '@motifmarkets/motif-core';
import { ZenithScanFormulaViewNgDirective } from '../../ng/zenith-scan-formula-view-ng.directive';

@Component({
    selector: 'app-rank-zenith-scan-formula-view',
    templateUrl: './rank-zenith-scan-formula-view-ng.component.html',
    styleUrls: ['./rank-zenith-scan-formula-view-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankZenithScanFormulaViewNgComponent extends ZenithScanFormulaViewNgDirective implements OnDestroy, AfterViewInit {
    protected getFormulaAsZenithText(editor: ScanEditor) {
        return editor.rankAsZenithText;
    }

    protected override setFormulaAsZenithText(editor: ScanEditor, text: string, fieldChanger: ScanEditor.FieldChanger) {
        return editor.setRankAsZenithText(text, fieldChanger);
    }

    protected getFormulaAsZenithTextIfChanged(editor: ScanEditor, changedFieldIds: readonly ScanEditor.FieldId[]): string | undefined {
        for (const fieldId of changedFieldIds) {
            if (fieldId === ScanEditor.FieldId.RankAsZenithText || fieldId === ScanEditor.FieldId.Rank) {
                return editor.criteriaAsZenithText;
            }
        }
        return undefined;
    }
}
