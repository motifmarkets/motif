import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    EditableScan
} from '@motifmarkets/motif-core';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-scan-properties',
    templateUrl: './scan-properties-ng.component.html',
    styleUrls: ['./scan-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanPropertiesNgComponent extends ContentComponentBaseNgDirective {
    private _scan: EditableScan | undefined;

    constructor() {
        super();
    }

    setScan(value: EditableScan | undefined) {
        this._scan = value;
    }
}
