import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridSourceNgComponent } from '../../../grid-source/ng-api';
import { ContentNgService } from '../../../ng/content-ng.service';
import { ScanListFrame } from '../scan-list-frame';

@Component({
    selector: 'app-scan-list',
    templateUrl: '../../../grid-source/ng/grid-source-ng.component.html',
    styleUrls: ['../../../grid-source/ng/grid-source-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanListNgComponent extends GridSourceNgComponent {
    declare frame: ScanListFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createScanListFrame(this, hostElement);
    }
}
