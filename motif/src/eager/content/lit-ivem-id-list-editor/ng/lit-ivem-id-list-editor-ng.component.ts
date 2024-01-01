import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, Optional } from '@angular/core';
import { BadnessComparableList, LitIvemId, LockOpenListItem } from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { LitIvemIdListEditorNgDirective } from './lit-ivem-id-list-editor-ng.directive';

@Component({
    selector: 'app-lit-ivem-id-list-editor',
    templateUrl: './lit-ivem-id-list-editor-ng.component.html',
    styleUrls: ['./lit-ivem-id-list-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LitIvemIdListEditorNgComponent extends LitIvemIdListEditorNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) opener: LockOpenListItem.Opener,
        @Optional() @Inject(LitIvemIdListEditorNgDirective.listInjectionToken) list: BadnessComparableList<LitIvemId> | null,
    ) {
        super(elRef, cdr, commandRegisterNgService, ++LitIvemIdListEditorNgComponent.typeInstanceCreateCount, opener, list);
    }

}
