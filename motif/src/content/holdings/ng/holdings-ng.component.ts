import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridSourceNgDirective } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { HoldingsFrame } from '../holdings-frame';

@Component({
    selector: 'app-holdings',
    templateUrl: './holdings-ng.component.html',
    styleUrls: ['./holdings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingsNgComponent extends GridSourceNgDirective {
    declare frame: HoldingsFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createHoldingsFrame(this, hostElement);
    }
}
