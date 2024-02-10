/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ScanEditor } from '@motifmarkets/motif-core';
import { ZenithScanFormulaViewNgDirective } from '../../ng/zenith-scan-formula-view-ng.directive';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { IdentifiableComponent } from 'component-internal-api';

@Component({
    selector: 'app-rank-zenith-scan-formula-view',
    templateUrl: './rank-zenith-scan-formula-view-ng.component.html',
    styleUrls: ['./rank-zenith-scan-formula-view-ng.component.scss'],
    providers: [ { provide: ComponentBaseNgDirective.typeInstanceCreateIdInjectionToken, useValue: ++RankZenithScanFormulaViewNgComponent.typeInstanceCreateCount}],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankZenithScanFormulaViewNgComponent extends ZenithScanFormulaViewNgDirective implements OnDestroy, AfterViewInit {
    protected getFormulaAsZenithText(editor: ScanEditor<IdentifiableComponent>) {
        return editor.rankAsZenithText;
    }

    protected override setFormulaAsZenithText(editor: ScanEditor<IdentifiableComponent>, text: string, modifier: IdentifiableComponent) {
        return editor.setRankAsZenithText(text, modifier);
    }

    protected getFormulaAsZenithTextIfChanged(editor: ScanEditor<IdentifiableComponent>, changedFieldIds: readonly ScanEditor.FieldId[]): string | undefined {
        for (const fieldId of changedFieldIds) {
            if (fieldId === ScanEditor.FieldId.RankAsZenithText || fieldId === ScanEditor.FieldId.Rank) {
                return editor.rankAsZenithText;
            }
        }
        return undefined;
    }
}

export namespace RankZenithScanFormulaViewNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
}
