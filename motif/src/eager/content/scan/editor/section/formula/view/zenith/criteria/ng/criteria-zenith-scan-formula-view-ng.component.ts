/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy } from '@angular/core';
import { ScanEditor } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { IdleNgService } from 'component-services-ng-api';
import { ZenithScanFormulaViewNgDirective } from '../../ng/zenith-scan-formula-view-ng.directive';

@Component({
    selector: 'app-criteria-zenith-scan-formula-view',
    templateUrl: './criteria-zenith-scan-formula-view-ng.component.html',
    styleUrls: ['./criteria-zenith-scan-formula-view-ng.component.scss'],
    providers: [ { provide: ComponentBaseNgDirective.typeInstanceCreateIdInjectionToken, useValue: ++CriteriaZenithScanFormulaViewNgComponent.typeInstanceCreateCount}],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriteriaZenithScanFormulaViewNgComponent extends ZenithScanFormulaViewNgDirective implements OnDestroy, AfterViewInit {
    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        injector: Injector,
        idleNgService: IdleNgService,
    ) {
        super(elRef, cdr, injector, idleNgService, ++CriteriaZenithScanFormulaViewNgComponent.typeInstanceCreateCount);
    }

    protected getFormulaAsZenithText(editor: ScanEditor) {
        return editor.criteriaAsZenithText;
    }

    protected override setFormulaAsZenithText(editor: ScanEditor, text: string, fieldChanger: ScanEditor.Modifier) {
        return editor.setCriteriaAsZenithText(text, fieldChanger);
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
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
}
