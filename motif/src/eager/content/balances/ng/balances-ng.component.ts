import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { BalancesFrame } from '../balances-frame';

@Component({
    selector: 'app-balances',
    templateUrl: './balances-ng.component.html',
    styleUrls: ['./balances-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalancesNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: BalancesNgComponent.Frame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        const frame: BalancesNgComponent.Frame = contentNgService.createBalancesFrame();
        super(elRef, ++BalancesNgComponent.typeInstanceCreateCount, cdr, frame);
    }
}

export namespace BalancesNgComponent {
    export type Frame = BalancesFrame;
}
