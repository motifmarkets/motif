import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridSourceNgComponent } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { OrdersFrame } from '../orders-frame';

@Component({
    selector: 'app-orders',
    templateUrl: '../../grid-source/ng/grid-source-ng.component.html',
    styleUrls: ['../../grid-source/ng/grid-source-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersNgComponent extends GridSourceNgComponent {
    declare frame: OrdersFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createOrdersFrame(this, hostElement);
    }
}
