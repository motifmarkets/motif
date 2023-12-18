import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { CommandRegisterService, HtmlTypes, IconButtonUiAction, Integer, InternalCommand, LitIvemId, LitIvemIdExecuteScanDataDefinition, MarketId, MultiEvent, RankedLitIvemIdList, ScanTargetTypeId, StringId, Strings, UnreachableCaseError, UsableListChangeTypeId, ZenithEncodedScanFormula, delay1Tick } from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from '../../../../controls/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ScanTestMatchesFrame } from '../internal-api';
import { ScanTestMatchesNgComponent } from '../matches/ng-api';

@Component({
    selector: 'app-scan-test',
    templateUrl: './scan-test-ng.component.html',
    styleUrls: ['./scan-test-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanTestNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.display') hostDisplay: HtmlTypes.Display = HtmlTypes.Display.None;

    @ViewChild('closeButton', { static: true }) private _closeButtonComponent: SvgButtonNgComponent;
    @ViewChild('matches', { static: true }) private _matchesComponent: ScanTestMatchesNgComponent;

    displayedChangedEventer: ScanTestNgComponent.DisplayedChangedEventer | undefined;

    public title = Strings[StringId.Test];
    public matchCount = '';

    private _matchesFrame: ScanTestMatchesFrame;
    private _rankedLitIvemIdList: RankedLitIvemIdList | undefined;
    private _rankedLitIvemIdListListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _closeUiAction: IconButtonUiAction;

    private _usable = false;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super(elRef, ++ScanTestNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;
        this._closeUiAction = this.createCloseUiAction(commandRegisterService);
    }

    get displayed() { return this.hostDisplay === HtmlTypes.Display.Flex; }
    get emWidth() { return this._matchesComponent.emWidth; }
    get approximateWidth() { return this.rootHtmlElement.offsetWidth; }

    ngAfterViewInit() {
        delay1Tick(() => {
            this._closeButtonComponent.initialise(this._closeUiAction);
            this._matchesFrame = this._matchesComponent.frame;
            this._matchesFrame.gridSourceOpenedEventer = () => { this.initialiseMatchesInfo() }
        });
    }

    ngOnDestroy() {
        this._closeUiAction.finalise();
        this._matchesFrame.gridSourceOpenedEventer = undefined;
        this.finaliseMatchesInfo();
    }

    execute(
        name: string,
        description: string,
        targetTypeId: ScanTargetTypeId,
        targets: readonly MarketId[] | readonly LitIvemId[],
        zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode,
        zenithRank: ZenithEncodedScanFormula.NumericTupleNode,
    ) {
        this.finaliseMatchesInfo();

        const definition = new LitIvemIdExecuteScanDataDefinition();
        definition.targetTypeId = targetTypeId;
        definition.targets = targets;
        definition.zenithCriteria = zenithCriteria;
        definition.zenithRank = zenithRank;

        this._matchesFrame.executeTest(name, description, 'ExecuteScan', definition);

        this.setDisplayed(true);
        this._cdr.markForCheck();
    }

    private handleCloseSignal() {
        this.finaliseMatchesInfo();
        this._matchesFrame.closeGridSource(true);
        this.setDisplayed(false);
        this._cdr.markForCheck();
    }

    private createCloseUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanTest_Close;
        const displayId = StringId.Close;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = () => this.handleCloseSignal();
        return action;
    }

    private initialiseMatchesInfo() {
        this.finaliseMatchesInfo();
        this._rankedLitIvemIdList = this._matchesFrame.rankedLitIvemIdList;
        this._rankedLitIvemIdListListChangeSubscriptionId = this._rankedLitIvemIdList.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => { this.processMatchesInfoChange(listChangeTypeId, idx, count) }
        );

        this._usable = this._rankedLitIvemIdList.usable;
        this.updateMatchCount();
    }

    private finaliseMatchesInfo() {
        if (this._rankedLitIvemIdList !== undefined) {
            this._rankedLitIvemIdList.unsubscribeListChangeEvent(this._rankedLitIvemIdListListChangeSubscriptionId);
            this._rankedLitIvemIdListListChangeSubscriptionId = undefined;

            this._rankedLitIvemIdList = undefined;
        }
    }

    private processMatchesInfoChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this._usable = false;
                break;
            case UsableListChangeTypeId.Usable:
                this._usable = true;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
            case UsableListChangeTypeId.PreUsableClear:
            case UsableListChangeTypeId.Insert:
            case UsableListChangeTypeId.BeforeReplace:
            case UsableListChangeTypeId.AfterReplace:
            case UsableListChangeTypeId.BeforeMove:
            case UsableListChangeTypeId.AfterMove:
            case UsableListChangeTypeId.Remove:
            case UsableListChangeTypeId.Clear:
                break;
            default:
                throw new UnreachableCaseError('STNCPMIC84184', listChangeTypeId);
        }
        this.updateMatchCount();
    }

    private updateMatchCount() {
        let newMatchCount: string;
        if (this._rankedLitIvemIdList === undefined) {
            newMatchCount = '';
        } else {
            if (this._usable) {
                newMatchCount = this._rankedLitIvemIdList.count.toString();
            } else {
                newMatchCount = '?';
            }
        }

        if (newMatchCount !== this.matchCount) {
            this.matchCount = newMatchCount;
            this._cdr.markForCheck();
        }
    }

    private setDisplayed(value: boolean) {
        const hostDisplay = value ? HtmlTypes.Display.Flex : HtmlTypes.Display.None;
        if (hostDisplay !== this.hostDisplay) {
            this.hostDisplay = hostDisplay;
            this._cdr.markForCheck();

            if (this.displayedChangedEventer !== undefined) {
                this.displayedChangedEventer();
            }
        }
    }
}

export namespace ScanTestNgComponent {
    export type DisplayedChangedEventer = (this: void) => void;
}
