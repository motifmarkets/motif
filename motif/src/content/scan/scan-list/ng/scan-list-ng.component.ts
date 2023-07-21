import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { GridSourceNgDirective } from '../../../grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { ScanListFrame } from '../scan-list-frame';

@Component({
    selector: 'app-scan-list',
    templateUrl: './scan-list-ng.component.html',
    styleUrls: ['./scan-list-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanListNgComponent extends GridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: ScanListFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        super(elRef, ++ScanListNgComponent.typeInstanceCreateCount, cdr, contentNgService);
    }

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createScanListFrame(this, hostElement);
    }
}
