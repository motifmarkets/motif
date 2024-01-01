import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { AssertInternalError, BadnessComparableList, GridLayoutOrReferenceDefinition, GridSourceOrReference, JsonElement, LitIvemId, LockOpenListItem } from '@motifmarkets/motif-core';
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

    private _list: BadnessComparableList<LitIvemId> | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        contentNgService: ContentNgService,
    ) {
        const frame = contentNgService.createLitIvemIdListFrame();
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
        frameElement: JsonElement | undefined,
        keepPreviousLayoutIfPossible: boolean,
        list: BadnessComparableList<LitIvemId> | undefined,
    ): Promise<GridSourceOrReference | undefined> {
        this._list = list;
        return this.frame.initialiseGrid(opener, frameElement, keepPreviousLayoutIfPossible);
    }

    openList(list: BadnessComparableList<LitIvemId>) {
        this._list = list;
        const promise = this.frame.tryOpenWithDefaultLayout(list, true);
        AssertInternalError.throwErrorIfPromiseRejected(promise, 'LIILNCOL40408');
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
