import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, Optional } from '@angular/core';
import { LitIvemId, LockOpenListItem, UiComparableList } from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import { TableFieldSourceDefinitionCachingFactoryNgService } from '../../ng/table-field-source-definition-caching-factory-ng.service';
import { LitIvemIdListEditorNgDirective } from './lit-ivem-id-list-editor-ng.directive';

@Component({
    selector: 'app-lit-ivem-id-list-editor',
    templateUrl: './lit-ivem-id-list-editor-ng.component.html',
    styleUrls: ['./lit-ivem-id-list-editor-ng.component.scss'],
    providers: [LitIvemIdListEditorNgDirective.initialCustomGridSettingsProvider],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LitIvemIdListEditorNgComponent extends LitIvemIdListEditorNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        fieldSourceDefinitionCachedFactoryNgService: TableFieldSourceDefinitionCachingFactoryNgService,
        toastNgService: ToastNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) opener: LockOpenListItem.Opener,
        @Optional() @Inject(LitIvemIdListEditorNgDirective.listInjectionToken) list: UiComparableList<LitIvemId> | null,
    ) {
        super(
            elRef,
            cdr,
            commandRegisterNgService,
            fieldSourceDefinitionCachedFactoryNgService,
            toastNgService,
            ++LitIvemIdListEditorNgComponent.typeInstanceCreateCount,
            opener,
            list
        );
    }
}
