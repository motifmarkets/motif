/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    Component,
    ViewContainerRef
} from '@angular/core';
import { AssertInternalError } from '@motifmarkets/motif-core';
import { GridSourceNgComponent } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { FeedsFrame } from '../feeds-frame';

@Component({
    selector: 'app-feeds',
    templateUrl: '../../grid-source/ng/grid-source-ng.component.html',
    styleUrls: ['../../grid-source/ng/grid-source-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedsNgComponent extends GridSourceNgComponent {
    declare frame: FeedsFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createFeedsFrame(this, hostElement);
    }
}

export namespace FeedsNgComponent {
    export function create(container: ViewContainerRef) {
        container.clear();

        const componentRef = container.createComponent(FeedsNgComponent);

        const instance = componentRef.instance;
        if (!(instance instanceof FeedsNgComponent)) {
            throw new AssertInternalError('FCCI59923112141');
        } else {
            return instance;
        }
    }
}
