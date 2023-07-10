import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridSourceNgComponent } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { HoldingsFrame } from '../holdings-frame';

@Component({
    selector: 'app-holdings',
    templateUrl: '../../grid-source/ng/grid-source-ng.component.html',
    styleUrls: ['../../grid-source/ng/grid-source-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingsNgComponent extends GridSourceNgComponent {
    declare frame: HoldingsFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createHoldingsFrame(this, hostElement);
    }
}
