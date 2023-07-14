import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridSourceNgDirective } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { OrdersFrame } from '../orders-frame';

@Component({
    selector: 'app-orders',
    templateUrl: './orders-ng.component.html',
    styleUrls: ['./orders-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersNgComponent extends GridSourceNgDirective {
    declare frame: OrdersFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createOrdersFrame(this, hostElement);
    }
}
