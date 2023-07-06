/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    Type,
    ValueProvider,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { OrderPad, OrderRequestDataDefinition } from '@motifmarkets/motif-core';
import { ContentNgService } from '../../../ng/content-ng.service';
import { OrderRequestStepComponentNgDirective } from '../../ng/order-request-step-component-ng.directive';
import { ReviewAmendOrderRequestNgComponent } from '../review-amend-order-request/ng/review-amend-order-request-ng.component';
import { ReviewCancelOrderRequestNgComponent } from '../review-cancel-order-request/ng/review-cancel-order-request-ng.component';
import { ReviewMoveOrderRequestNgComponent } from '../review-move-order-request/ng/review-move-order-request-ng.component';
import { ReviewOrderRequestStepFrame } from '../review-order-request-step-frame';
import { ReviewPlaceOrderRequestNgComponent } from '../review-place-order-request/ng/review-place-order-request-ng.component';
import { ReviewOrderRequestComponentNgDirective } from './review-order-request-component-ng.directive';

@Component({
    selector: 'app-review-order-request-step',
    templateUrl: './review-order-request-step-ng.component.html',
    styleUrls: ['./review-order-request-step-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewOrderRequestStepNgComponent extends OrderRequestStepComponentNgDirective
    implements ReviewOrderRequestStepFrame.ComponentAccess {

    @ViewChild('reviewContainer', { read: ViewContainerRef }) private _reviewContainer: ViewContainerRef;

    private readonly _frame: ReviewOrderRequestStepFrame;

    private _requestTypeComponent: ReviewOrderRequestComponentNgDirective;

    constructor(cdr: ChangeDetectorRef, private readonly _contentService: ContentNgService) {
        super(cdr);
        this._frame = this._contentService.createReviewOrderRequestStepFrame(this);
    }

    get frame() { return this._frame; }

    setZenithMessageActive(value: boolean) {
        this._requestTypeComponent.setZenithMessageActive(value);
    }

    public reviewPlace(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        this.review(orderPad, definition, ReviewPlaceOrderRequestNgComponent, zenithMessageActive);
    }

    public reviewAmend(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        this.review(orderPad, definition, ReviewAmendOrderRequestNgComponent, zenithMessageActive);
    }

    public reviewMove(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        this.review(orderPad, definition, ReviewMoveOrderRequestNgComponent, zenithMessageActive);
    }

    public reviewCancel(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        this.review(orderPad, definition, ReviewCancelOrderRequestNgComponent, zenithMessageActive);
    }

    private review<T extends ReviewOrderRequestComponentNgDirective>(
        orderPad: OrderPad,
        definition: OrderRequestDataDefinition,
        componentType: Type<T>,
        zenithMessageActive: boolean,
    ) {
        this._reviewContainer.clear();

        const orderPadProvider: ValueProvider = {
            provide: ReviewOrderRequestComponentNgDirective.orderPadInjectionToken,
            useValue: orderPad,
        };
        const definitionProvider: ValueProvider = {
            provide: ReviewOrderRequestComponentNgDirective.definitionInjectionToken,
            useValue: definition,
        };
        const injector = Injector.create({
            providers: [orderPadProvider, definitionProvider],
        });
        const componentRef = this._reviewContainer.createComponent(componentType, { injector });
        this._requestTypeComponent = componentRef.instance;

        this._requestTypeComponent.setZenithMessageActive(zenithMessageActive);

        this.markForCheck();
    }
}
