import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, InjectionToken, Optional, ValueProvider } from '@angular/core';
import { AdaptedRevgridGridSettings, GridLayoutOrReferenceDefinition, JsonElement, LitIvemId, LockOpenListItem, UiComparableList } from '@motifmarkets/motif-core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { LitIvemIdListFrame } from '../lit-ivem-id-list-frame';

@Component({
    selector: 'app-lit-ivem-id-list',
    templateUrl: './lit-ivem-id-list-ng.component.html',
    styleUrls: ['./lit-ivem-id-list-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LitIvemIdListNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: LitIvemIdListFrame;

    selectionChangedEventer: LitIvemIdListFrame.SelectionChangedEventer | undefined;

    private _list: UiComparableList<LitIvemId> | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
        @Optional() @Inject(LitIvemIdListNgComponent.initialCustomGridSettingsInjectionToken) initialCustomGridSettings: Partial<AdaptedRevgridGridSettings> | null,
    ) {
        const frame = contentNgService.createLitIvemIdListFrame(initialCustomGridSettings === null ? undefined : initialCustomGridSettings);
        frame.getListEventer = () => this._list;
        frame.selectionChangedEventer = () => {
            if (this.selectionChangedEventer !== undefined) {
                this.selectionChangedEventer();
            }
        }
        super(elRef, ++LitIvemIdListNgComponent.typeInstanceCreateCount, cdr, frame);
    }

    get mainRowCount() { return this.frame.mainRowCount; }
    get filterActive() { return this.frame.filterActive; }
    get filterText() { return this.frame.filterText; }
    set filterText(value: string) { this.frame.filterText = value; }

    initialise(
        opener: LockOpenListItem.Opener,
        layoutDefinition: GridLayoutOrReferenceDefinition | undefined,
        frameElement: JsonElement | undefined,
        keepPreviousLayoutIfPossible: boolean,
    ) {
        if (layoutDefinition === undefined) {
            const layoutDefinitionResult = this.frame.tryCreateLayoutDefinitionFromJson(frameElement);
            if (layoutDefinitionResult.isErr()) {
                // toast in future
            } else {
                layoutDefinition = layoutDefinitionResult.value;
            }
        }

        this.frame.initialiseGrid(opener, layoutDefinition, keepPreviousLayoutIfPossible);
    }

    tryOpenList(list: UiComparableList<LitIvemId>, keepView: boolean) {
        this._list = list;
        return this.frame.tryOpenList(list, keepView);
    }

    selectAllRows() {
        this.frame.selectAllRows();
    }

    getSelectedRecordIndices() {
        return this.frame.getSelectedRecordIndices();
    }

    createAllowedFieldsGridLayoutDefinition() {
        return this.frame.createAllowedFieldsGridLayoutDefinition();
    }

    openGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition: GridLayoutOrReferenceDefinition) {
        this.frame.openGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition)
    }

    areRowsSelected(includeAllAuto: boolean) {
        return this.frame.areRowsSelected(includeAllAuto);
    }

    protected override processOnDestroy() {
        this.frame.selectionChangedEventer = undefined;
        super.processOnDestroy();
    }
}

export namespace LitIvemIdListNgComponent {
    export const initialCustomGridSettingsInjectionToken = new InjectionToken<Partial<AdaptedRevgridGridSettings>>('LitIvemIdListNgComponent.initialCustomGridSettingsInjectionToken');

    export interface InitialCustomGridSettingsProvider extends ValueProvider {
        provide: typeof LitIvemIdListNgComponent.initialCustomGridSettingsInjectionToken;
        useValue: Partial<AdaptedRevgridGridSettings>;
    }
}
