import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
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
    private static typeInstanceCreateCount = 0;

    declare frame: OrdersFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        super(elRef, ++OrdersNgComponent.typeInstanceCreateCount, cdr, contentNgService);
    }

    protected override createGridSourceFrame(contentNgService: ContentNgService) {
        return contentNgService.createOrdersFrame(this);
    }
}
