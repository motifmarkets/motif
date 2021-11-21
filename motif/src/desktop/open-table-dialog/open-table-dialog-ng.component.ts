/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ComponentBaseNgDirective } from 'src/component/ng-api';

@Component({
    selector: 'app-open-table-dialog',
    templateUrl: './open-table-dialog-ng.component.html',
    styleUrls: ['./open-table-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenTableDialogNgComponent extends ComponentBaseNgDirective implements OnInit {
    constructor() {
        super();
    }

    ngOnInit() {}
}
