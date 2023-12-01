import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { AdiService, AssertInternalError, ChangeSubscribableComparableList, DataItemIncubator, LitIvemId, LitIvemIdExecuteScanDataDefinition, LitIvemIdScanMatch, LitIvemIdScanMatchesDataItem, MarketId, ScanTargetTypeId, ZenithEncodedScanFormula } from '@motifmarkets/motif-core';
import { AdiNgService } from '../../../../component-services/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-scan-test',
    templateUrl: './scan-test-ng.component.html',
    styleUrls: ['./scan-test-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanTestNgComponent extends ContentComponentBaseNgDirective implements OnInit {
    private static typeInstanceCreateCount = 0;

    private readonly _adiService: AdiService;

    private _dataItem: LitIvemIdScanMatchesDataItem | undefined;
    private _dataItemIncubator: DataItemIncubator<LitIvemIdScanMatchesDataItem>;
    private _rankedMatches: ChangeSubscribableComparableList<LitIvemIdScanMatch>;

    constructor(
        elRef: ElementRef<HTMLElement>,
        adiNgService: AdiNgService,
    ) {
        super(elRef, ++ScanTestNgComponent.typeInstanceCreateCount);
        this._dataItemIncubator = new DataItemIncubator<LitIvemIdScanMatchesDataItem>(adiNgService.service);
    }

    ngOnInit(): void {}

    finalise() {

    }

    execute(
        targetTypeId: ScanTargetTypeId,
        targets: readonly MarketId[] | readonly LitIvemId[],
        zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode,
        zenithRank: ZenithEncodedScanFormula.NumericTupleNode,
    ) {
        this.checkUnsubscribeDataItem();

        const definition = new LitIvemIdExecuteScanDataDefinition();
        definition.targetTypeId = targetTypeId;
        definition.targets = targets;
        definition.zenithCriteria = zenithCriteria;
        definition.zenithRank = zenithRank;

        const dataItemOrPromise = this._dataItemIncubator.incubateSubcribe(definition);
        if (this._dataItemIncubator.isDataItem(dataItemOrPromise)) {
            throw new AssertInternalError('STNCED50156'); // is query so cannot already be incubated
        } else {
            dataItemOrPromise.then(
                (dataItem) => {
                    if (dataItem !== undefined) {
                        this.processDataItemIncubated(dataItem);
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'STNCER50156'); }
            );
        }
    }

    private processDataItemIncubated(dataItem: LitIvemIdScanMatchesDataItem) {
        if (dataItem.error) {

        } else {
            this._list
        }
    }
}
