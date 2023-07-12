import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridSourceNgComponent } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { OrderAuthoriseFrame } from '../order-authorise-frame';

@Component({
    selector: 'app-order-authorise',
    templateUrl: '../../grid-source/ng/grid-source-ng.component.html',
    styleUrls: ['../../grid-source/ng/grid-source-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderAuthoriseNgComponent extends GridSourceNgComponent {
    declare frame: OrderAuthoriseFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createOrdersFrame(this, hostElement);
    }
}
