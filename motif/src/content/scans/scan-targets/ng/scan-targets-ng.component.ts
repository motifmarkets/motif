import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    AllowedMarketsEnumArrayUiAction,
    AllowedMarketsEnumUiAction,
    EditableScan,
    EnumInfoOutOfOrderError,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    Integer,
    LitIvemIdUiAction,
    MarketId,
    StringId,
    Strings,
    SymbolsService
} from '@motifmarkets/motif-core';
import { SymbolsNgService } from 'component-services-ng-api';
import { CaptionedRadioNgComponent, EnumArrayInputNgComponent, EnumInputNgComponent, LitIvemIdSelectNgComponent } from 'controls-ng-api';
import { UnreachableCaseError } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-scan-targets',
    templateUrl: './scan-targets-ng.component.html',
    styleUrls: ['./scan-targets-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanTargetsNgComponent extends ContentComponentBaseNgDirective implements  OnInit, OnDestroy, AfterViewInit {
    @ViewChild('singleSymbolTargetSubTypeControl', { static: true })
        private _singleSymbolTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('multiSymbolTargetSubTypeControl', { static: true })
        private _multiSymbolTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('singleMarketTargetSubTypeControl', { static: true })
        private _singleMarketTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('multiMarketTargetSubTypeControl', { static: true })
        private _multiMarketTargetSubTypeControlComponent: CaptionedRadioNgComponent;

    @ViewChild('singleSymbolControl', { static: true }) private _singleSymbolControlComponent: LitIvemIdSelectNgComponent;
    @ViewChild('singleMarketControl', { static: true }) private _singleMarketControlComponent: EnumInputNgComponent;
    @ViewChild('multiMarketControl', { static: true }) private _multiMarketControlComponent: EnumArrayInputNgComponent;

    public targetsHeading = Strings[StringId.Targets];
    public readonly targetSubTypeRadioName: string;

    private readonly _symbolsService: SymbolsService;

    private readonly _targetSubTypeUiAction: ExplicitElementsEnumUiAction;
    private readonly _singleSymbolUiAction: LitIvemIdUiAction;
    private readonly _singleMarketUiAction: AllowedMarketsEnumUiAction;
    private readonly _multiMarketUiAction: AllowedMarketsEnumArrayUiAction;

    private _scan: EditableScan | undefined;
    private _targetSubTypeId: ScanTargetsNgComponent.TargetSubTypeId;

    constructor(private readonly _cdr: ChangeDetectorRef, symbolsNgService: SymbolsNgService) {
        super();

        this.targetSubTypeRadioName = this.generateInstancedRadioName('targetSubType');

        this._symbolsService = symbolsNgService.symbolsManager;

        this._targetSubTypeUiAction = this.createTargetSubTypeUiAction();
        this._singleSymbolUiAction = this.createSingleSymbolUiAction();
        this._singleMarketUiAction = this.createSingleMarketUiAction();
        this._multiMarketUiAction = this.createMultiMarketUiAction();

        this._targetSubTypeId = ScanTargetsNgComponent.TargetSubTypeId.SingleSymbol;
    }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    public isSingleSymbolSubTargetType() {
        return this._targetSubTypeId === ScanTargetsNgComponent.TargetSubTypeId.SingleSymbol;
    }

    public isMultiSymbolSubTargetType() {
        return this._targetSubTypeId === ScanTargetsNgComponent.TargetSubTypeId.MultiSymbol;
    }

    public isSingleMarketSubTargetType() {
        return this._targetSubTypeId === ScanTargetsNgComponent.TargetSubTypeId.SingleMarket;
    }

    public isMultiMarketSubTargetType() {
        return this._targetSubTypeId === ScanTargetsNgComponent.TargetSubTypeId.MultiMarket;
    }

    setScan(value: EditableScan) {
        this._scan = value;
        this.pushValues();
    }

    protected finalise() {
        this._targetSubTypeUiAction.finalise();
        this._singleSymbolUiAction.finalise();
        this._singleMarketUiAction.finalise();
        this._multiMarketUiAction.finalise();
    }

    private initialiseComponents() {
        this._singleSymbolTargetSubTypeControlComponent.initialiseEnum(
            this._targetSubTypeUiAction, ScanTargetsNgComponent.TargetSubTypeId.SingleSymbol
        );
        this._multiSymbolTargetSubTypeControlComponent.initialiseEnum(
            this._targetSubTypeUiAction, ScanTargetsNgComponent.TargetSubTypeId.MultiSymbol
        );
        this._singleMarketTargetSubTypeControlComponent.initialiseEnum(
            this._targetSubTypeUiAction, ScanTargetsNgComponent.TargetSubTypeId.SingleMarket
        );
        this._multiMarketTargetSubTypeControlComponent.initialiseEnum(
            this._targetSubTypeUiAction, ScanTargetsNgComponent.TargetSubTypeId.MultiMarket
        );
        this._singleSymbolControlComponent.initialise(this._singleSymbolUiAction);
        this._singleMarketControlComponent.initialise(this._singleMarketUiAction);
        this._multiMarketControlComponent.initialise(this._multiMarketUiAction);
    }

    private createTargetSubTypeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ScanTargetsCaption_TargetType]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_TargetType]);
        const ids = ScanTargetsNgComponent.TargetSubType.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanTargetsNgComponent.TargetSubType.idToDisplay(id),
                    title: ScanTargetsNgComponent.TargetSubType.idToDescription(id),
                })
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this._targetSubTypeId = this._targetSubTypeUiAction.definedValue;
            this._cdr.markForCheck();
        };
        return action;
    }

    private createSingleSymbolUiAction() {
        const action = new LitIvemIdUiAction();
        action.pushCaption(Strings[StringId.ScanTargetsCaption_SingleSymbol]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_SingleSymbol]);
        action.commitEvent = () => {
            if (this._scan !== undefined) {
                const litItemId = this._singleSymbolUiAction.definedValue;
                this._scan.targetLitIvemIds = [litItemId];
            }
        };
        return action;
    }

    private createSingleMarketUiAction() {
        const action = new AllowedMarketsEnumUiAction(this._symbolsService);
        action.pushCaption(Strings[StringId.ScanTargetsCaption_SingleMarket]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_SingleMarket]);
        action.commitEvent = () => {
            if (this._scan !== undefined) {
                const id = this._singleMarketUiAction.definedValue as MarketId;
                this._scan.targetMarketIds = [id];
            }
        };
        return action;
    }

    private createMultiMarketUiAction() {
        const action = new AllowedMarketsEnumArrayUiAction(this._symbolsService);
        action.pushCaption(Strings[StringId.ScanTargetsCaption_MultiMarket]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_MultiMarket]);
        action.commitEvent = () => {
            if (this._scan !== undefined) {
                const ids = this._multiMarketUiAction.definedValue as readonly MarketId[];
                this._scan.targetMarketIds = ids;
            }
        };
        return action;
    }

    private pushValues() {
        if (this._scan === undefined) {
            this._targetSubTypeUiAction.pushValue(ScanTargetsNgComponent.TargetSubTypeId.SingleSymbol);
            this._singleSymbolUiAction.pushValue(undefined);
            this._singleMarketUiAction.pushValue(undefined);
            this._multiMarketUiAction.pushValue([]);
        } else {
            const litIvemIds = this._scan.targetLitIvemIds;
            let symbolTargetSubTypeId: ScanTargetsNgComponent.TargetSubTypeId;
            if (litIvemIds === undefined || litIvemIds.length === 0) {
                symbolTargetSubTypeId = ScanTargetsNgComponent.TargetSubTypeId.SingleSymbol;
                this._singleSymbolUiAction.pushValue(undefined);
            } else {
                if (litIvemIds.length === 1) {
                    symbolTargetSubTypeId = ScanTargetsNgComponent.TargetSubTypeId.SingleSymbol;
                    this._singleSymbolUiAction.pushValue(litIvemIds[0]);
                } else {
                    symbolTargetSubTypeId = ScanTargetsNgComponent.TargetSubTypeId.MultiSymbol;
                    this._singleSymbolUiAction.pushValue(litIvemIds[0]);
                }
            }

            const marketIds = this._scan.targetMarketIds;
            let marketTargetSubTypeId: ScanTargetsNgComponent.TargetSubTypeId;
            if (marketIds === undefined || marketIds.length === 0) {
                marketTargetSubTypeId = ScanTargetsNgComponent.TargetSubTypeId.SingleMarket;
                this._singleMarketUiAction.pushValue(undefined);
                this._multiMarketUiAction.pushValue([]);
            } else {
                if (marketIds.length === 1) {
                    marketTargetSubTypeId = ScanTargetsNgComponent.TargetSubTypeId.SingleMarket;
                    this._singleMarketUiAction.pushValue(marketIds[0]);
                    this._multiMarketUiAction.pushValue(marketIds);
                } else {
                    marketTargetSubTypeId = ScanTargetsNgComponent.TargetSubTypeId.MultiMarket;
                    this._singleMarketUiAction.pushValue(marketIds[0]);
                    this._multiMarketUiAction.pushValue(marketIds);
                }
            }

            switch (this._scan.targetTypeId) {
                case EditableScan.TargetTypeId.Symbols: {
                    this._targetSubTypeUiAction.pushValue(symbolTargetSubTypeId);
                    break;
                }
                case EditableScan.TargetTypeId.Markets: {
                    this._targetSubTypeUiAction.pushValue(marketTargetSubTypeId);
                    break;
                }
                default:
                    throw new UnreachableCaseError('STNCPV33017', this._scan.targetTypeId);
            }
            this._cdr.markForCheck();
        }
    }
}

export namespace ScanTargetsNgComponent {
    export const enum TargetSubTypeId {
        SingleSymbol,
        MultiSymbol,
        SingleMarket,
        MultiMarket,
    }

    export namespace TargetSubType {
        export type Id = TargetSubTypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof TargetSubTypeId]: Info };

        const infosObject: InfosObject = {
            SingleSymbol: {
                id: TargetSubTypeId.SingleSymbol,
                name: 'SingleSymbol',
                displayId: StringId.ScanTargetsTargetSubTypeIdDisplay_SingleSymbol,
                descriptionId: StringId.ScanTargetsTargetSubTypeIdDescription_SingleSymbol,
            },
            MultiSymbol: {
                id: TargetSubTypeId.MultiSymbol,
                name: 'MultiSymbol',
                displayId: StringId.ScanTargetsTargetSubTypeIdDisplay_MultiSymbol,
                descriptionId: StringId.ScanTargetsTargetSubTypeIdDescription_MultiSymbol,
            },
            SingleMarket: {
                id: TargetSubTypeId.SingleMarket,
                name: 'SingleMarket',
                displayId: StringId.ScanTargetsTargetSubTypeIdDisplay_SingleMarket,
                descriptionId: StringId.ScanTargetsTargetSubTypeIdDescription_SingleMarket,
            },
            MultiMarket: {
                id: TargetSubTypeId.MultiMarket,
                name: 'MultiMarket',
                displayId: StringId.ScanTargetsTargetSubTypeIdDisplay_MultiMarket,
                descriptionId: StringId.ScanTargetsTargetSubTypeIdDescription_MultiMarket,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ScanTargetNgComponent.TargetSubTypeId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function getAllIds() {
            return infos.map(info => info.id);
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id): StringId {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id): string {
            return Strings[idToDescriptionId(id)];
        }
    }
}


export namespace ScanTargetsNgComponentModule {
    export function initialiseStatic() {
        ScanTargetsNgComponent.TargetSubType.initialise();
    }
}
