/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BrokerageAccountGroupSvc,
    ExchangeEnvironmentIdSvc,
    ExchangeIdSvc,
    FeedClassSvc,
    FeedIdSvc,
    IvemIdSvc,
    LitIvemIdSvc,
    MarketIdSvc,
    OrderRouteSvc,
    OrderExtendedSideSvc,
    OrderTimeInForceSvc,
    OrderTypeSvc,
    RoutedIvemIdSvc
} from './adi/extension-api';
import { CommandSvc, HistorySequencerSvc, IntervalHistorySequencerSvc, StorageSvc, SymbolSvc } from './core/extension-api';
import { ResourcesSvc } from './resources/extension-api';
import { SelfInfoSvc } from './self-info/extension-api';
import {
    ApiErrorSvc,
    BadnessSvc,
    CommaTextSvc,
    CorrectnessSvc,
    DecimalSvc,
    JsonSvc,
    SourceTzOffsetDateTimeSvc
} from './sys/extension-api';
import { WorkspaceSvc } from './workspace/extension-api';

/** @public */
export interface ExtensionSvc {
    // SelfInfo
    readonly selfInfoSvc: SelfInfoSvc;

    // Resources
    readonly resourcesSvc: ResourcesSvc;

    // Sys
    readonly apiErrorSvc: ApiErrorSvc;
    readonly badnessSvc: BadnessSvc;
    readonly commaTextSvc: CommaTextSvc;
    readonly correctnessSvc: CorrectnessSvc;
    readonly decimalSvc: DecimalSvc;
    readonly jsonSvc: JsonSvc;
    readonly sourceTzOffsetDateTimeSvc: SourceTzOffsetDateTimeSvc;

    // Adi
    readonly brokerageAccountGroupSvc: BrokerageAccountGroupSvc;
    readonly exchangeEnvironmentIdSvc: ExchangeEnvironmentIdSvc;
    readonly exchangeIdSvc: ExchangeIdSvc;
    readonly feedClassSvc: FeedClassSvc;
    readonly feedIdSvc: FeedIdSvc;
    readonly ivemIdSvc: IvemIdSvc;
    readonly litIvemIdSvc: LitIvemIdSvc;
    readonly marketIdSvc: MarketIdSvc;
    readonly orderTypeSvc: OrderTypeSvc;
    readonly orderExtendedSideSvc: OrderExtendedSideSvc;
    readonly orderRouteSvc: OrderRouteSvc;
    readonly orderTimeInForceSvc: OrderTimeInForceSvc;
    readonly routedIvemIdSvc: RoutedIvemIdSvc;

    // Core
    readonly commandSvc: CommandSvc;
    readonly historySequencerSvc: HistorySequencerSvc;
    readonly intervalHistorySequencerSvc: IntervalHistorySequencerSvc;
    readonly storageSvc: StorageSvc;
    readonly symbolSvc: SymbolSvc;

    // Workspace
    readonly workspaceSvc: WorkspaceSvc;
}
