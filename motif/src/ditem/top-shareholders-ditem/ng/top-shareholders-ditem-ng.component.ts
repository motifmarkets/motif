/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    ViewChild
} from '@angular/core';
import {
    DateUiAction,
    EnumInfoOutOfOrderError,
    ExchangeId,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    IvemId,
    IvemIdUiAction,
    JsonElement,
    LitIvemId,
    Logger,
    MarketId,
    StringId,
    Strings,
    UiAction,
    UnexpectedCaseError,
    UnreachableCaseError,
    assert,
    assigned,
    delay1Tick
} from '@motifmarkets/motif-core';
import {
    AdiNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SymbolsNgService,
    TableRecordSourceDefinitionFactoryNgService
} from 'component-services-ng-api';
import { GridSourceNgComponent } from 'content-ng-api';
import { DateInputNgComponent, IvemIdInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { TopShareholdersDitemFrame } from '../top-shareholders-ditem-frame';

@Component({
    selector: 'app-top-shareholders-ditem',
    templateUrl: './top-shareholders-ditem-ng.component.html',
    styleUrls: ['./top-shareholders-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopShareholdersDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective
    implements OnDestroy, AfterViewInit, TopShareholdersDitemFrame.ComponentAccess {

    @ViewChild('todayModeButton', { static: true }) private _todayModeButtonInputComponent: SvgButtonNgComponent;
    @ViewChild('historicalModeButton', { static: true }) private _historicalModeButtonInputComponent: SvgButtonNgComponent;
    @ViewChild('compareModeButton', { static: true }) private _compareModeButtonInputComponent: SvgButtonNgComponent;
    @ViewChild('detailsModeButton', { static: true }) private _detailsModeButtonInputComponent: SvgButtonNgComponent;
    @ViewChild('historyCompareButton', { static: true }) private _historyCompareButtonInputComponent: SvgButtonNgComponent;
    @ViewChild('topShareholdersTableContent', { static: true }) private _contentComponent: GridSourceNgComponent;
    @ViewChild('symbolInput', { static: true }) private _symbolEditComponent: IvemIdInputNgComponent;
    @ViewChild('historicalDateInput', { static: true }) private _historicalDateInputComponent: DateInputNgComponent;
    @ViewChild('compareDateInput', { static: true }) private _compareDateInputComponent: DateInputNgComponent;
    @ViewChild('symbolLinkButton', { static: true }) private _symbolLinkButtonComponent: SvgButtonNgComponent;

    public caption = '';
    public details: TopShareholdersDitemNgComponent.Details = {
        symbolText: '',
        name: '',
        class: '',
    };
    public statusText: string | undefined;
    public detailsModeActive = false;
    public historicalOrCompareModeActive = false;
    public compareModeActive = false;

    private _tableUiAccepted = true;

    private _toggleSymbolLinkingButtonUiAction: IconButtonUiAction;
    private _todayModeUiAction: IconButtonUiAction;
    private _historicalModeUiAction: IconButtonUiAction;
    private _compareModeUiAction: IconButtonUiAction;
    private _detailsModeUiAction: IconButtonUiAction;
    private _historyCompareUiAction: IconButtonUiAction;
    private _symbolUiAction: IvemIdUiAction;
    private _historicalDateUiAction: DateUiAction;
    private _compareDateUiAction: DateUiAction;

    private _forceNextSymbolCommit = false;

    private _modeId: TopShareholdersDitemNgComponent.ModeId;
    private _frame: TopShareholdersDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef<HTMLElement>,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        private readonly _symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        tableRecordSourceDefinitionFactoryNgService: TableRecordSourceDefinitionFactoryNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.service, commandRegisterNgService.service);

        this._frame = new TopShareholdersDitemFrame(
            this,
            this.settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            this._symbolsNgService.service,
            adiNgService.service,
            tableRecordSourceDefinitionFactoryNgService.service,
        );

        this._toggleSymbolLinkingButtonUiAction = this.createToggleSymbolLinkingButtonUiAction();
        this._todayModeUiAction = this.createTodayModeUiAction();
        this._historicalModeUiAction = this.createHistoricalModeUiAction();
        this._compareModeUiAction = this.createCompareModeUiAction();
        this._detailsModeUiAction = this.createDetailsModeUiAction();
        this._historyCompareUiAction = this.createHistoryCompareUiAction();
        this._symbolUiAction = this.createSymbolUiAction();
        this._historicalDateUiAction = this.createHistoricalDateUiAction();
        this._compareDateUiAction = this.createCompareDateUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbol();
        if (this._symbolUiAction.value !== undefined) {
            this._forceNextSymbolCommit = true;
        }
        this.pushSymbolLinkButtonState();
        this.pushHistoryCompareButtonTitle();
        this.pushHistoryCompareButtonState();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return TopShareholdersDitemNgComponent.stateSchemaVersion; }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this.finalise();
    }

    // Component Access methods

    public getGuiParams() {
        const result = new TopShareholdersDitemFrame.GuiParams();
        if (!this._symbolUiAction.isValueOk() ||
            this._symbolUiAction.value !== undefined && this._symbolUiAction.value.exchangeId !== ExchangeId.Nzx ) {
            result.valid = false;
        } else {
            if (this._modeId === TopShareholdersDitemNgComponent.ModeId.Today) {
                result.valid = true;
            } else {
                if (!this._historicalDateUiAction.isValueOk()) {
                    result.valid = false;
                } else {
                    result.historicalDate = this._historicalDateUiAction.value;
                    if (this._modeId === TopShareholdersDitemNgComponent.ModeId.Historical) {
                        result.valid = true;
                    } else {
                        if (!this._compareDateUiAction.isValueOk()) {
                            result.valid = false;
                        } else {
                            result.compareDate = this._compareDateUiAction.value;
                            if (this._modeId === TopShareholdersDitemNgComponent.ModeId.Compare) {
                                result.valid = true;
                            } else {
                                result.valid = false;
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    public notifyNewTable(params: TopShareholdersDitemFrame.TableParams) {
        this._symbolUiAction.pushAccepted();
        this._historicalDateUiAction.pushAccepted();
        this._compareDateUiAction.pushAccepted();

        this.caption = this.calculateCaption(params.litIvemId, params.historicalDate, params.compareDate);

        this.details.symbolText = this._symbolsNgService.litIvemIdToDisplay(params.litIvemId);
    }

    public canNewTableOnLitIvemIdApply() {
        return this._modeId === TopShareholdersDitemNgComponent.ModeId.Today;
    }

    public createLayoutConfig() {
        const element = new JsonElement();
        const jsonValue = TopShareholdersDitemNgComponent.Mode.idToJsonValue(this._modeId);
        element.setString(TopShareholdersDitemNgComponent.JsonName.modeId, jsonValue);
        /*if (this._symbolInputElement.isValid()) {
            element.setString(TopShareholdersInputComponent.jsonTag_Symbol, this._symbolInputElement.committedValu);
        }
        if (this._historicalDateInputElement.isValid()) {
            element.setDate(TopShareholdersInputComponent.jsonTag_HistoricalDate, this._historicalDateInputElement.committedValu);
        }
        if (this._compareDateInputElement.isValid()) {
            element.setDate(TopShareholdersInputComponent.jsonTag_CompareDate, this._compareDateInputElement.committedValu);
        }*/
        return element;
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    protected override initialise() {
        assert(assigned(this._contentComponent), 'TSICAFI34429');

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._contentComponent.frame, frameElement);

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._toggleSymbolLinkingButtonUiAction.finalise();
        this._todayModeUiAction.finalise();
        this._historicalModeUiAction.finalise();
        this._compareModeUiAction.finalise();
        this._detailsModeUiAction.finalise();
        this._historyCompareUiAction.finalise();
        this._symbolUiAction.finalise();
        this._historicalDateUiAction.finalise();
        this._compareDateUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);

        if (element === undefined) {
            this.setModeId(TopShareholdersDitemNgComponent.defaultModeId);
        } else {
            let loadedModeId: TopShareholdersDitemNgComponent.ModeId;
            const modeIdJsonValueResult = element.tryGetString(TopShareholdersDitemNgComponent.JsonName.modeId);
            if (modeIdJsonValueResult.isErr()) {
                loadedModeId = TopShareholdersDitemNgComponent.defaultModeId;
            } else {
                const typedModeId = TopShareholdersDitemNgComponent.Mode.tryJsonValueToId(modeIdJsonValueResult.value);
                if (typedModeId === undefined) {
                    loadedModeId = TopShareholdersDitemNgComponent.defaultModeId;
                } else {
                    loadedModeId = typedModeId;
                }
            }
            this.setModeId(loadedModeId);

            /*const historicalJsonDateResult = element.tryGetDateType(TopShareholdersInputComponent.jsonTag_HistoricalDate);
            if (historicalJsonDate !== undefined) {
                this._historicalDateInputElement.setValue(historicalJsonDate);
            }

            const compareJsonDateResult = element.tryGetDateType(TopShareholdersInputComponent.jsonTag_CompareDate);
            if (compareJsonDate !== undefined) {
                this._historicalDateInputElement.setValue(compareJsonDate);
            }*/
        }
    }

    protected save(element: JsonElement) {
        const jsonValue = TopShareholdersDitemNgComponent.Mode.idToJsonValue(this._modeId);
        element.setString(TopShareholdersDitemNgComponent.JsonName.modeId, jsonValue);

        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleSymbolCommitEvent() {
        const ivemId = this._symbolUiAction.definedValue;
        if (ivemId.exchangeId !== ExchangeId.Nzx) {
            this._symbolUiAction.pushInvalid(Strings[StringId.TopShareholdersOnlySupportNzx]);
        } else {
            this._symbolUiAction.pushValid();
            const litIvemId = new LitIvemId(ivemId.code, MarketId.Nzx); // need to create LitIvemId to pass into DitemFrame
            this._frame.setLitIvemIdFromDitem(litIvemId, this._forceNextSymbolCommit);
            this._forceNextSymbolCommit = false;
        }
    }

    private handleSymbolInputEvent() {
        this.pushHistoryCompareButtonState();
        this.pushHistoryCompareButtonTitle();
    }

    private handleHistoricalDateCommitEvent() {
        this._historicalDateUiAction.pushValid();
    }

    private handleHistoricalDateInputEvent() {
        this.pushHistoryCompareButtonState();
        this.pushHistoryCompareButtonTitle();
    }

    private handleCompareDateCommitEvent() {
        this._compareDateUiAction.pushValid();
    }

    private handleCompareDateInputEvent() {
        this.pushHistoryCompareButtonState();
        this.pushHistoryCompareButtonTitle();
    }

    private handleTodayModeSignalEvent() {
        this.setModeId(TopShareholdersDitemNgComponent.ModeId.Today);
    }

    private handleHistoricalModeSignalEvent() {
        this.setModeId(TopShareholdersDitemNgComponent.ModeId.Historical);
    }

    private handleSymbolLinkButtonClickEvent() {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private createToggleSymbolLinkingButtonUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkButtonClickEvent();
        return action;
    }

    private createTodayModeUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_TodayMode;
        const displayId = StringId.TopShareholdersTodayModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.TopShareholdersTodayModeTitle]);
        action.pushIcon(IconButtonUiAction.IconId.NotHistorical);
        action.pushUnselected();
        action.signalEvent = () => this.handleTodayModeSignalEvent();
        return action;
    }

    private createHistoricalModeUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_HistoricalMode;
        const displayId = StringId.TopShareholdersHistoricalModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.TopShareholdersHistoricalModeTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Historical);
        action.pushUnselected();
        action.signalEvent = () => this.handleHistoricalModeSignalEvent();
        return action;
    }

    private createCompareModeUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_CompareMode;
        const displayId = StringId.TopShareholdersCompareModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.TopShareholdersCompareModeTitle]);
        action.pushIcon(IconButtonUiAction.IconId.HistoricalCompare);
        action.pushUnselected();
        action.signalEvent = () => this.compareModeSignal();
        return action;
    }

    private createDetailsModeUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_DetailsMode;
        const displayId = StringId.TopShareholdersDetailsModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.TopShareholdersDetailsModeTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Details);
        action.pushUnselected();
        action.signalEvent = () => this.detailsModeClick();
        return action;
    }

    private createHistoryCompareUiAction() {
        const commandName = InternalCommand.Id.TopShareholders_Compare;
        const displayId = StringId.TopShareholdersCompareModeCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        action.signalEvent = () => this.historyCompareClick();
        return action;
    }

    private createSymbolUiAction() {
        const action = new IvemIdUiAction();
        action.pushTitle(Strings[StringId.TopShareholdersSymbolTitle]);
        action.commitEvent = () => this.handleSymbolCommitEvent();
        action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createHistoricalDateUiAction() {
        const action = new DateUiAction();
        action.commitEvent = () => this.handleHistoricalDateCommitEvent();
        action.inputEvent = () => this.handleHistoricalDateInputEvent();
        return action;
    }

    private createCompareDateUiAction() {
        const action = new DateUiAction();
        action.commitEvent = () => this.handleCompareDateCommitEvent();
        action.inputEvent = () => this.handleCompareDateInputEvent();
        action.pushTitle(Strings[StringId.TopShareholdersCompareToDate]);
        return action;
    }

    private compareModeSignal() {
        this.setModeId(TopShareholdersDitemNgComponent.ModeId.Compare);
    }

    private detailsModeClick() {
        this.setModeId(TopShareholdersDitemNgComponent.ModeId.Details);
    }

    private isHistoryValid() {
        return this._symbolUiAction.isValueOk() && this._historicalDateUiAction.isValueOk();
    }

    private isCompareValid() {
        return this._symbolUiAction.isValueOk() && this._historicalDateUiAction.isValueOk() && this._compareDateUiAction.isValueOk();
    }

    private isHistoryCompareValid() {
        switch (this._modeId) {
            case TopShareholdersDitemNgComponent.ModeId.Historical:
                return this.isHistoryValid();
            case TopShareholdersDitemNgComponent.ModeId.Compare:
                return this.isCompareValid();
            default: return false;
        }
    }

    private historyCompareClick() {
        switch (this._modeId) {
            case TopShareholdersDitemNgComponent.ModeId.Historical:
                if (!this.isHistoryValid()) {
                    Logger.logWarning('TopShareholders history clicked when not all history controls valid');
                } else {
                    this.tryOpenGridSource();
                }
                break;
            case TopShareholdersDitemNgComponent.ModeId.Compare:
                if (!this.isCompareValid()) {
                    Logger.logWarning('TopShareholders compare clicked when not all compare controls valid');
                } else {
                    this.tryOpenGridSource();
                }
                break;
            default: throw new UnexpectedCaseError('TSICHCCU239984', this._modeId.toString(10));
        }
    }

    private acceptUi() {
        this._todayModeUiAction.pushAccepted();
        this._historicalModeUiAction.pushAccepted();
        this._compareModeUiAction.pushAccepted();
        this._detailsModeUiAction.pushAccepted();
        this._historyCompareUiAction.pushAccepted();
        this._symbolUiAction.pushAccepted();
        this._historicalDateUiAction.pushAccepted();
        this._compareDateUiAction.pushAccepted();
    }

    private tryOpenGridSource() {
        this.acceptUi();
        this._frame.tryOpenGridSource();
    }

    private initialiseComponents() {
        this._symbolEditComponent.initialise(this._symbolUiAction);
        this._todayModeButtonInputComponent.initialise(this._todayModeUiAction);
        this._historicalModeButtonInputComponent.initialise(this._historicalModeUiAction);
        this._compareModeButtonInputComponent.initialise(this._compareModeUiAction);
        this._detailsModeButtonInputComponent.initialise(this._detailsModeUiAction);
        this._historyCompareButtonInputComponent.initialise(this._historyCompareUiAction);
        this._symbolEditComponent.initialise(this._symbolUiAction);
        this._historicalDateInputComponent.initialise(this._historicalDateUiAction);
        this._compareDateInputComponent.initialise(this._compareDateUiAction);
    }

    private calculateHistoryCompareButtonTitle() {
        switch (this._modeId) {
            case TopShareholdersDitemNgComponent.ModeId.Historical:
                if (this.isHistoryValid()) {
                    return Strings[StringId.TopShareholdersHistory];
                } else {
                    return Strings[StringId.TopShareholdersInvalidHistory];
                }
            case TopShareholdersDitemNgComponent.ModeId.Compare:
                if (this.isCompareValid()) {
                    return Strings[StringId.TopShareholdersCompare];
                } else {
                    return Strings[StringId.TopShareholdersInvalidCompare];
                }
            default: return Strings[StringId.QuestionMark];
        }
    }

    private pushHistoryCompareButtonTitle() {
        const title = this.calculateHistoryCompareButtonTitle();
        this._historyCompareUiAction.pushTitle(title);
    }

    private calculateHistoryCompareButtonState() {
        if (this.isHistoryCompareValid()) {
            return UiAction.StateId.Accepted;
        } else {
            return UiAction.StateId.Disabled;
        }
    }

    private pushHistoryCompareButtonState() {
        const state = this.calculateHistoryCompareButtonState();
        this._historyCompareUiAction.pushState(state);
    }

    private pushSymbol() {
        let ivemId: IvemId | undefined;
        const litIvemId = this._frame.litIvemId;
        if (litIvemId === undefined) {
            ivemId = undefined;
        } else {
            ivemId = new IvemId(litIvemId.code, ExchangeId.Nzx);
        }
        this._symbolUiAction.pushValue(ivemId);
    }

    private pushSymbolLinkButtonState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingButtonUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingButtonUiAction.pushUnselected();
        }
    }

    private setModeId(value: TopShareholdersDitemNgComponent.ModeId) {
        if (value !== this._modeId) {
            this._modeId = value;
            switch (this._modeId) {
                case TopShareholdersDitemNgComponent.ModeId.Today:
                    this._todayModeUiAction.pushSelected();
                    this._historicalModeUiAction.pushUnselected();
                    this._compareModeUiAction.pushUnselected();
                    this._detailsModeUiAction.pushUnselected();
                    this.detailsModeActive = false;
                    this.compareModeActive = false;
                    this.historicalOrCompareModeActive = false;
                    break;
                case TopShareholdersDitemNgComponent.ModeId.Historical:
                    this._todayModeUiAction.pushUnselected();
                    this._historicalModeUiAction.pushSelected();
                    this._compareModeUiAction.pushUnselected();
                    this._detailsModeUiAction.pushUnselected();
                    this._historicalDateUiAction.pushTitle(Strings[StringId.TopShareholdersHistoricalDate]);
                    this.detailsModeActive = false;
                    this.compareModeActive = false;
                    this.historicalOrCompareModeActive = true;
                    break;
                case TopShareholdersDitemNgComponent.ModeId.Compare:
                    this._todayModeUiAction.pushUnselected();
                    this._historicalModeUiAction.pushUnselected();
                    this._compareModeUiAction.pushSelected();
                    this._detailsModeUiAction.pushUnselected();
                    this._compareDateUiAction.pushTitle(Strings[StringId.TopShareholdersCompareFromDate]);
                    this.detailsModeActive = false;
                    this.compareModeActive = true;
                    this.historicalOrCompareModeActive = true;
                    break;
                case TopShareholdersDitemNgComponent.ModeId.Details:
                    this._todayModeUiAction.pushUnselected();
                    this._historicalModeUiAction.pushUnselected();
                    this._compareModeUiAction.pushUnselected();
                    this._detailsModeUiAction.pushSelected();
                    this.detailsModeActive = true;
                    this.compareModeActive = false;
                    this.historicalOrCompareModeActive = false;
                    break;
                default:
                    throw new UnreachableCaseError('TSICSMI397866', this._modeId);
            }

            this.markForCheck();
        }
    }

    private calculateCaption(symbol: LitIvemId, historicalDate: Date | undefined, compareDate: Date | undefined): string {
        const symbolText = this._symbolsNgService.litIvemIdToDisplay(symbol);
        const top100ShareholdersText = Strings[StringId.Top100Shareholders];
        const forText = Strings[StringId.For];

        if (historicalDate === undefined) {
            return `${top100ShareholdersText} ${forText} ${symbolText}`;
        } else {
            const historicalDateAsStr = historicalDate.toLocaleDateString();
            if (compareDate === undefined) {
                const onText = Strings[StringId.On];
                return `${top100ShareholdersText} ${forText} ${symbolText} ${onText} ${historicalDateAsStr}`;
            } else {
                const fromText = Strings[StringId.From];
                const toText = Strings[StringId.To];
                const compareDateAsStr = compareDate.toLocaleDateString();
                return `${top100ShareholdersText} ${forText} ${symbolText} ${fromText} ${historicalDateAsStr}
                    ${toText} ${compareDateAsStr}`;
            }
        }
    }
}

export namespace TopShareholdersDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Today,
        Historical,
        Compare,
        Details,
    }

    export namespace Mode {
        export type Id = ModeId;

        interface Info {
            readonly id: Id;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
            readonly jsonValue: string;
        }

        type InfosObject = { [id in keyof typeof ModeId]: Info };

        const infosObject: InfosObject = {
            Today: {
                id: ModeId.Today,
                displayId: StringId.TopShareholdersInputModeDisplay_Today,
                descriptionId: StringId.TopShareholdersInputModeDescription_Today,
                jsonValue: 'today',
            },
            Historical: {
                id: ModeId.Historical,
                displayId: StringId.TopShareholdersInputModeDisplay_Historical,
                descriptionId: StringId.TopShareholdersInputModeDescription_Historical,
                jsonValue: 'historical',
            },
            Compare: {
                id: ModeId.Compare,
                displayId: StringId.TopShareholdersInputModeDisplay_Compare,
                descriptionId: StringId.TopShareholdersInputModeDescription_Compare,
                jsonValue: 'compare',
            },
            Details: {
                id: ModeId.Details,
                displayId: StringId.TopShareholdersInputModeDisplay_Details,
                descriptionId: StringId.TopShareholdersInputModeDescription_Details,
                jsonValue: 'details',
            },
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialiseStatic() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TopShareholdersInputComponent.ModeId', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDescriptionId(id: Id): StringId {
            return infos[id].descriptionId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescription(id: Id): string {
            return Strings[idToDescriptionId(id)];
        }

        export function isToday(id: Id) {
            return id === ModeId.Today;
        }

        export function isHistorical(id: Id) {
            return id === ModeId.Historical;
        }

        export function isCompare(id: Id) {
            return id === ModeId.Compare;
        }

        export function isDetails(id: Id) {
            return id === ModeId.Details;
        }

        export function idToJsonValue(id: Id): string {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: string): Id | undefined {
            const upperValue = value.toUpperCase();
            const idx = infos.findIndex((info: Info) => info.jsonValue.toUpperCase() === upperValue);
            return idx >= 0 ? infos[idx].id : undefined;
        }
    }

    export interface Details {
        symbolText: string;
        name: string;
        class: string;
    }

    export namespace JsonName {
        export const content = 'content';
        export const modeId = 'modeId';
        // export const historicalDate = 'historicalDate';
        // export const compareDate = 'compareDate';
    }
    export const latestLayoutConfigJsonProtocol = '1';
    export const defaultModeId = ModeId.Today;
}

export namespace TopShareholdersDitemNgComponentModule {
    export function initialiseStatic() {
        TopShareholdersDitemNgComponent.Mode.initialiseStatic();
    }
}
