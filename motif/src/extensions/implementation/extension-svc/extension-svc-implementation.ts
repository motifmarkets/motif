/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, AppStorageService, CommandRegisterService, SymbolsService } from '@motifmarkets/motif-core';
import { RegisteredExtension } from 'content-internal-api';
import { MenuBarService } from 'controls-internal-api';
import { WorkspaceService } from 'src/workspace/internal-api';
import { ExtensionSvc } from '../../api/extension-api';
import {
    BrokerageAccountGroupSvcImplementation,
    DataEnvironmentIdSvcImplementation,
    ExchangeIdSvcImplementation,
    FeedClassSvcImplementation,
    FeedIdSvcImplementation,
    IvemIdSvcImplementation,
    LitIvemIdSvcImplementation,
    MarketIdSvcImplementation, OrderExtendedSideSvcImplementation, OrderRouteSvcImplementation, OrderTimeInForceSvcImplementation,
    OrderTypeSvcImplementation,
    RoutedIvemIdSvcImplementation
} from './adi/internal-api';
import { TradingEnvironmentIdSvcImplementation } from './adi/trading-environment-id-svc-implementation';
import {
    CommandSvcImplementation,
    HistorySequencerSvcImplementation,
    IntervalHistorySequencerSvcImplementation,
    StorageSvcImplementation,
    SymbolSvcImplementation
} from './core/internal-api';
import { ResourcesSvcImplementation } from './resources/internal-api';
import { SelfInfoSvcImplementation } from './self-info/internal-api';
import {
    ApiErrorSvcImplementation,
    BadnessSvcImplementation,
    CommaTextSvcImplementation,
    CorrectnessSvcImplementation,
    DecimalSvcImplementation,
    JsonSvcImplementation,
    SourceTzOffsetDateTimeSvcImplementation
} from './sys/internal-api';
import { WorkspaceSvcImplementation } from './workspace/internal-api';

export class ExtensionSvcImplementation implements ExtensionSvc {
    private readonly _selfInfoSvc: SelfInfoSvcImplementation;
    private readonly _resourcesSvc: ResourcesSvcImplementation;
    private readonly _apiErrorSvc: ApiErrorSvcImplementation;
    private readonly _decimalSvc: DecimalSvcImplementation;
    private readonly _commaTextSvc: CommaTextSvcImplementation;
    private readonly _correctnessSvc: CorrectnessSvcImplementation;
    private readonly _jsonSvc: JsonSvcImplementation;
    private readonly _sourceTzOffsetDateTimeSvc: SourceTzOffsetDateTimeSvcImplementation;
    private readonly _badnessSvc: BadnessSvcImplementation;
    private readonly _brokerageAccountGroupSvcImplementation: BrokerageAccountGroupSvcImplementation;
    private readonly _marketIdSvcImplementation: MarketIdSvcImplementation;
    private readonly _exchangeIdSvcImplementation: ExchangeIdSvcImplementation;
    private readonly _dataEnvironmentIdSvcImplementation: DataEnvironmentIdSvcImplementation;
    private readonly _tradingEnvironmentIdSvcImplementation: TradingEnvironmentIdSvcImplementation;
    private readonly _feedIdSvcImplementation: FeedIdSvcImplementation;
    private readonly _feedClassSvcImplementation: FeedClassSvcImplementation;
    private readonly _ivemIdSvcImplementation: IvemIdSvcImplementation;
    private readonly _litIvemIdSvcImplementation: LitIvemIdSvcImplementation;
    private readonly _orderTypeSvcImplementation: OrderTypeSvcImplementation;
    private readonly _orderExtendedSideSvcImplementation: OrderExtendedSideSvcImplementation;
    private readonly _orderTimeInForceSvcImplementation: OrderTimeInForceSvcImplementation;
    private readonly _orderRouteSvcImplementation: OrderRouteSvcImplementation;
    private readonly _routedIvemIdSvcImplementation: RoutedIvemIdSvcImplementation;
    private readonly _commandSvc: CommandSvcImplementation;
    private readonly _historySequencerSvc: HistorySequencerSvcImplementation;
    private readonly _intervalHistorySequencerSvc: IntervalHistorySequencerSvcImplementation;
    private readonly _storageSvc: StorageSvcImplementation;
    private readonly _symbolSvc: SymbolSvcImplementation;
    private readonly _workspaceSvc: WorkspaceSvcImplementation;

    constructor(
        registeredExtension: RegisteredExtension,
        adiService: AdiService,
        commandRegisterService: CommandRegisterService,
        storageService: AppStorageService,
        symbolsService: SymbolsService,
        menuBarService: MenuBarService,
        workspaceService: WorkspaceService,
    ) {
        const handle = registeredExtension.handle;
        this._selfInfoSvc = new SelfInfoSvcImplementation(registeredExtension);
        this._resourcesSvc = new ResourcesSvcImplementation(handle);
        this._apiErrorSvc = new ApiErrorSvcImplementation();
        this._decimalSvc = new DecimalSvcImplementation();
        this._commaTextSvc = new CommaTextSvcImplementation();
        this._correctnessSvc = new CorrectnessSvcImplementation();
        this._jsonSvc = new JsonSvcImplementation();
        this._sourceTzOffsetDateTimeSvc = new SourceTzOffsetDateTimeSvcImplementation();
        this._badnessSvc = new BadnessSvcImplementation();
        this._brokerageAccountGroupSvcImplementation = new BrokerageAccountGroupSvcImplementation();
        this._marketIdSvcImplementation = new MarketIdSvcImplementation();
        this._exchangeIdSvcImplementation = new ExchangeIdSvcImplementation();
        this._dataEnvironmentIdSvcImplementation = new DataEnvironmentIdSvcImplementation();
        this._tradingEnvironmentIdSvcImplementation = new TradingEnvironmentIdSvcImplementation();
        this._feedIdSvcImplementation = new FeedIdSvcImplementation();
        this._feedClassSvcImplementation = new FeedClassSvcImplementation();
        this._ivemIdSvcImplementation = new IvemIdSvcImplementation();
        this._litIvemIdSvcImplementation = new LitIvemIdSvcImplementation();
        this._orderTypeSvcImplementation = new OrderTypeSvcImplementation();
        this._orderExtendedSideSvcImplementation = new OrderExtendedSideSvcImplementation();
        this._orderTimeInForceSvcImplementation = new OrderTimeInForceSvcImplementation();
        this._orderRouteSvcImplementation = new OrderRouteSvcImplementation();
        this._routedIvemIdSvcImplementation = new RoutedIvemIdSvcImplementation();
        this._commandSvc = new CommandSvcImplementation(handle, commandRegisterService);
        this._historySequencerSvc = new HistorySequencerSvcImplementation(adiService, symbolsService);
        this._intervalHistorySequencerSvc = new IntervalHistorySequencerSvcImplementation();
        this._storageSvc = new StorageSvcImplementation(registeredExtension, storageService);
        this._symbolSvc = new SymbolSvcImplementation(symbolsService);
        this._workspaceSvc = new WorkspaceSvcImplementation(registeredExtension, workspaceService, commandRegisterService);
    }

    get selfInfoSvc() { return this._selfInfoSvc; }
    get resourcesSvc() { return this._resourcesSvc; }
    get apiErrorSvc() { return this._apiErrorSvc; }
    get decimalSvc() { return this._decimalSvc; }
    get commaTextSvc() { return this._commaTextSvc; }
    get correctnessSvc() { return this._correctnessSvc; }
    get jsonSvc() { return this._jsonSvc; }
    get sourceTzOffsetDateTimeSvc() { return this._sourceTzOffsetDateTimeSvc; }
    get badnessSvc() { return this._badnessSvc; }
    get brokerageAccountGroupSvc() { return this._brokerageAccountGroupSvcImplementation; }
    get marketIdSvc() { return this._marketIdSvcImplementation; }
    get exchangeIdSvc() { return this._exchangeIdSvcImplementation; }
    get dataEnvironmentIdSvc() { return this._dataEnvironmentIdSvcImplementation; }
    get tradingEnvironmentIdSvc() { return this._tradingEnvironmentIdSvcImplementation; }
    get feedIdSvc() { return this._feedIdSvcImplementation; }
    get feedClassSvc() { return this._feedClassSvcImplementation; }
    get ivemIdSvc() { return this._ivemIdSvcImplementation; }
    get litIvemIdSvc() { return this._litIvemIdSvcImplementation; }
    get orderTypeSvc() { return this._orderTypeSvcImplementation; }
    get orderExtendedSideSvc() { return this._orderExtendedSideSvcImplementation; }
    get orderTimeInForceSvc() { return this._orderTimeInForceSvcImplementation; }
    get orderRouteSvc() { return this._orderRouteSvcImplementation; }
    get routedIvemIdSvc() { return this._routedIvemIdSvcImplementation; }
    get commandSvc() { return this._commandSvc; }
    get historySequencerSvc() { return this._historySequencerSvc; }
    get intervalHistorySequencerSvc() { return this._intervalHistorySequencerSvc; }
    get storageSvc() { return this._storageSvc; }
    get symbolSvc() { return this._symbolSvc; }
    get workspaceSvc() { return this._workspaceSvc; }

    destroy() {
        this._selfInfoSvc.destroy();
        this._brokerageAccountGroupSvcImplementation.destroy();
        this._symbolSvc.destroy();
        this._workspaceSvc.destroy();
    }
}
