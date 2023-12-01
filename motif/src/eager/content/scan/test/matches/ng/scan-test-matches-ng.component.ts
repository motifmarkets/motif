import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { ScanEditor } from '@motifmarkets/motif-core';
import { DelayedBadnessGridSourceNgDirective } from '../../../../delayed-badness-grid-source/ng-api';

@Component({
    selector: 'app-scan-test-matches',
    templateUrl: './scan-test-matches-ng.component.html',
    styleUrls: ['./scan-test-matches-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanTestMatchesNgComponent extends DelayedBadnessGridSourceNgDirective implements OnInit {
    private static typeInstanceCreateCount = 0;

    private _scanEditor: ScanEditor | undefined;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++ScanTestNgComponent.typeInstanceCreateCount);
    }

    ngOnInit(): void {}

    finalise() {

    }

    setEditor(value: ScanEditor | undefined) {
        this._scanEditor = value;
    }

    execute() {

    }
}
