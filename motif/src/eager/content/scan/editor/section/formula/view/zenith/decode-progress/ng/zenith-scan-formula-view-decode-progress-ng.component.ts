/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { CommandRegisterService, HtmlTypes, IconButtonUiAction, IntegerUiAction, InternalCommand, ScanFormulaZenithEncoding, StringId, Strings, delay1Tick } from '@motifmarkets/motif-core';
import { CellPainterFactoryNgService, CommandRegisterNgService, SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, IntegerTextInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { RowDataArrayGridNgComponent } from '../../../../../../../../adapted-revgrid/ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../ng/content-component-base-ng.directive';
import { ZenithScanFormulaViewDecodeProgressFrame } from '../zenith-scan-formula-view-decode-progress-frame';

@Component({
    selector: 'app-zenith-scan-formula-view-decode-progress',
    templateUrl: './zenith-scan-formula-view-decode-progress-ng.component.html',
    styleUrls: ['./zenith-scan-formula-view-decode-progress-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZenithScanFormulaViewDecodeProgressNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.display') private _hostDisplay = HtmlTypes.Display.None;

    @ViewChild('closeButton', { static: true }) private _closeButtonComponent: SvgButtonNgComponent;
    @ViewChild('countLabel', { static: true }) private _countLabelComponent: CaptionLabelNgComponent;
    @ViewChild('countControl', { static: true }) private _countControlComponent: IntegerTextInputNgComponent;
    @ViewChild('depthLabel', { static: true }) private _depthLabelComponent: CaptionLabelNgComponent;
    @ViewChild('depthControl', { static: true }) private _depthControlComponent: IntegerTextInputNgComponent;
    @ViewChild('nodesGrid', { static: true }) private _nodesGridComponent: RowDataArrayGridNgComponent;

    public title = Strings[StringId.ZenithScanFormulaViewDecodeProgress_Title];

    private readonly _frame: ZenithScanFormulaViewDecodeProgressFrame;
    private readonly _closeUiAction: IconButtonUiAction;
    private readonly _countUiAction: IntegerUiAction;
    private readonly _depthUiAction: IntegerUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        cellPainterFactoryNgService: CellPainterFactoryNgService,
    ) {
        super(elRef, ++ZenithScanFormulaViewDecodeProgressNgComponent.typeInstanceCreateCount);

        this._frame = new ZenithScanFormulaViewDecodeProgressFrame(settingsNgService.service, cellPainterFactoryNgService.service, elRef.nativeElement);

        const commandRegisterService = commandRegisterNgService.service;
        this._closeUiAction = this.createCloseUiAction(commandRegisterService);
        this._countUiAction = this.createCountUiAction();
        this._depthUiAction = this.createDepthUiAction();
    }

    ngOnDestroy(): void {
        this._closeUiAction.finalise();
        this._countUiAction.finalise();
        this._depthUiAction.finalise();
        this._frame.finalise();
    }

    ngAfterViewInit() {
        delay1Tick(() => {
            this._closeButtonComponent.initialise(this._closeUiAction);
            this._countLabelComponent.initialise(this._countUiAction);
            this._countControlComponent.initialise(this._countUiAction);
            this._depthLabelComponent.initialise(this._depthUiAction);
            this._depthControlComponent.initialise(this._depthUiAction);
        });
    }

    setDecodeProgress(progress: ScanFormulaZenithEncoding.DecodeProgress | undefined) {
        if (progress === undefined) {
            this._countUiAction.pushValue(undefined);
            this._countUiAction.pushDisabled();
            this._depthUiAction.pushValue(undefined);
            this._depthUiAction.pushDisabled();
            this._frame.setData(undefined);
        } else {
            this._hostDisplay = HtmlTypes.Display.Block;
            this._countUiAction.pushValue(progress.tupleNodeCount);
            this._countUiAction.pushReadonly();
            this._depthUiAction.pushValue(progress.tupleNodeDepth);
            this._countUiAction.pushReadonly();
            this._frame.setData(progress.decodedNodes);
        }
    }

    private createCloseUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ZenithScanFormulaViewDecodeProgress_Close;
        const displayId = StringId.Close;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = () => this.handleCloseSignal();
        return action;
    }

    private createCountUiAction() {
        const action = new IntegerUiAction(false);
        action.pushDisabled();
        action.pushCaption(Strings[StringId.ZenithScanFormulaViewDecodeProgress_CountCaption]);
        action.pushTitle(Strings[StringId.ZenithScanFormulaViewDecodeProgress_CountTitle]);
        return action;
    }

    private createDepthUiAction() {
        const action = new IntegerUiAction(false);
        action.pushDisabled();
        action.pushCaption(Strings[StringId.ZenithScanFormulaViewDecodeProgress_DepthCaption]);
        action.pushTitle(Strings[StringId.ZenithScanFormulaViewDecodeProgress_DepthTitle]);
        return action;
    }

    private handleCloseSignal() {
        this._hostDisplay = HtmlTypes.Display.None;
        this._cdr.markForCheck();
    }
}
