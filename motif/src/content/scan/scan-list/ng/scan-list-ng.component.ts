import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    declare frame: ScanListFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createScanListFrame(this, hostElement);
    }
}
