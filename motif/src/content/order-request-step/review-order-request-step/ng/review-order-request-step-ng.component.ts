/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    Injector,
    StaticProvider,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { OrderRequestDataDefinition } from 'src/adi/internal-api';
import { OrderPad } from 'src/core/internal-api';
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

    get frame() { return this._frame; }

    constructor(cdr: ChangeDetectorRef,
        private _resolver: ComponentFactoryResolver,
        private _contentService: ContentNgService
    ) {
        super(cdr);
        this._frame = this._contentService.createReviewOrderRequestStepFrame(this);
    }

    setZenithMessageActive(value: boolean) {
        this._requestTypeComponent.setZenithMessageActive(value);
    }

    public reviewPlace(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        const factory = this._resolver.resolveComponentFactory<ReviewPlaceOrderRequestNgComponent>(ReviewPlaceOrderRequestNgComponent);
        this.review(orderPad, definition, factory, zenithMessageActive);
    }

    public reviewAmend(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        const factory = this._resolver.resolveComponentFactory<ReviewAmendOrderRequestNgComponent>(ReviewAmendOrderRequestNgComponent);
        this.review(orderPad, definition, factory, zenithMessageActive);
    }

    public reviewMove(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        const factory = this._resolver.resolveComponentFactory<ReviewMoveOrderRequestNgComponent>(ReviewMoveOrderRequestNgComponent);
        this.review(orderPad, definition, factory, zenithMessageActive);
    }

    public reviewCancel(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        const factory = this._resolver.resolveComponentFactory<ReviewCancelOrderRequestNgComponent>(ReviewCancelOrderRequestNgComponent);
        this.review(orderPad, definition, factory, zenithMessageActive);
    }

    private review(orderPad: OrderPad, definition: OrderRequestDataDefinition,
        factory: ComponentFactory<ReviewOrderRequestComponentNgDirective>,
        zenithMessageActive: boolean,
    ) {
        this._reviewContainer.clear();

        const orderPadProvider: StaticProvider = {
            provide: ReviewOrderRequestComponentNgDirective.OrderPadInjectionToken,
            useValue: orderPad,
        };
        const definitionProvider: StaticProvider = {
            provide: ReviewOrderRequestComponentNgDirective.DefinitionInjectionToken,
            useValue: definition,
        };
        const injector = Injector.create({
            providers: [orderPadProvider, definitionProvider],
        });
        const componentRef = this._reviewContainer.createComponent(factory, undefined, injector);
        this._requestTypeComponent = componentRef.instance;

        this._requestTypeComponent.setZenithMessageActive(zenithMessageActive);

        this.markForCheck();
    }
}
