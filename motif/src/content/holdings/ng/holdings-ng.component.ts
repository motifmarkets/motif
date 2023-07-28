import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { HoldingsFrame } from '../holdings-frame';

@Component({
    selector: 'app-holdings',
    templateUrl: './holdings-ng.component.html',
    styleUrls: ['./holdings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingsNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: HoldingsFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        const frame = contentNgService.createHoldingsFrame();
        super(elRef, ++HoldingsNgComponent.typeInstanceCreateCount, cdr, frame);
    }
}
