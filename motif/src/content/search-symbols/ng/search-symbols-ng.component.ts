/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    Component
} from '@angular/core';
import { GridSourceNgComponent } from '../../grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { SearchSymbolsFrame } from '../search-symbols-frame';

@Component({
    selector: 'app-search-symbols',
    templateUrl: '../../grid-source/ng/grid-source-ng.component.html',
    styleUrls: ['../../grid-source/ng/grid-source-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchSymbolsNgComponent extends GridSourceNgComponent {
    declare frame: SearchSymbolsFrame;

    protected override createGridSourceFrame(contentNgService: ContentNgService, hostElement: HTMLElement) {
        return contentNgService.createSearchSymbolsFrame(this, hostElement);
    }
}

// export namespace SearchSymbolsNgComponent {
//     export function create(container: ViewContainerRef) {
//         container.clear();

//         const componentRef = container.createComponent(SearchSymbolsNgComponent);

//         const instance = componentRef.instance;
//         if (!(instance instanceof SearchSymbolsNgComponent)) {
//             throw new AssertInternalError('FCCI59923112141');
//         } else {
//             return instance;
//         }
//     }
// }
