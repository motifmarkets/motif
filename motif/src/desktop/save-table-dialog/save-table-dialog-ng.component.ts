/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ComponentBaseNgDirective } from 'src/component/ng-api';

@Component({
    selector: 'app-save-table-dialog',
    templateUrl: './save-table-dialog-ng.component.html',
    styleUrls: ['./save-table-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveTableDialogNgComponent extends ComponentBaseNgDirective implements OnInit {
    constructor() {
        super();
    }

    ngOnInit() {}
}
