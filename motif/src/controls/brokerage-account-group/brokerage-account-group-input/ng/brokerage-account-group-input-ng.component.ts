/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MultiEvent, StringId, Strings, UiAction } from '@motifmarkets/motif-core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CoreNgService, SettingsNgService } from 'component-services-ng-api';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { BrokerageAccountGroupComponentBaseNgDirective } from '../../ng/brokerage-account-group-component-base-ng.directive';
// import styles from 'out-tsc/app/src/scss/partials/ng-select/_default_var.theme.scss';

@Component({
    selector: 'app-brokerage-account-group-input', // should be xxx-brokerage-account-group-select-control
    templateUrl: './brokerage-account-group-input-ng.component.html',
    styleUrls: ['./brokerage-account-group-input-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class BrokerageAccountGroupInputNgComponent extends BrokerageAccountGroupComponentBaseNgDirective implements OnInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('ngSelect', { static: true }) private _ngSelectComponent: NgSelectComponent;

    public selected: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined;

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _measureBoldCanvasContext: CanvasRenderingContext2D;
    private _ngSelectWidths: NgSelectWidths | undefined;

    constructor(elRef: ElementRef<HTMLElement>, private _renderer: Renderer2, cdr: ChangeDetectorRef,
        private _ngSelectOverlayNgService: NgSelectOverlayNgService,
        settingsNgService: SettingsNgService, pulseService: CoreNgService
    ) {
        super(
            elRef,
            ++BrokerageAccountGroupInputNgComponent.typeInstanceCreateCount,
            cdr, settingsNgService.service,
            pulseService,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray
        );
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureBoldCanvasContext = this._ngSelectOverlayNgService.measureBoldCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    ngOnInit() {
        this.setInitialiseReady();
    }

    public customSearchFtn(term: string, item: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup) {
        term = term.toUpperCase();
        return item.brokerageAccountGroup.upperId.includes(term) || item.upperName.includes(term);
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as ChangeEvent;
        if (changeEvent !== undefined && changeEvent !== null) {
            this.commitValue(changeEvent.brokerageAccountGroup, UiAction.CommitTypeId.Explicit);
        } else {
            if (!this.uiAction.valueRequired) {
                this.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            }
        }
    }

    public handleSelectSearchEvent(event: SearchEvent) {
        const text = event.term;
        let value: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined;
        let valid: boolean;
        let missing: boolean;
        let errorText: string | undefined;
        if (text === '') {
            value = undefined;
            missing = this.uiAction.valueRequired;
            if (missing) {
                valid = false;
                errorText = Strings[StringId.ValueRequired];
            } else {
                valid = true;
                errorText = undefined;
            }
        } else {
            missing = false;
            if (event.items.length === 1) {
                value = event.items[0];
                if (text.toUpperCase() === value.brokerageAccountGroup.upperId) {
                    valid = true;
                    errorText = undefined;
                } else {
                    valid = false;
                    errorText = Strings[StringId.BrokerageAccountNotMatched];
                }
            } else {
                value = undefined;
                valid = false;
                if (event.items.length === 0) {
                    errorText = Strings[StringId.BrokerageAccountNotFound];
                } else {
                    errorText = Strings[StringId.BrokerageAccountNotMatched];
                }
            }
        }

        this.input(text, valid, missing, errorText);

        if (valid && this.uiAction.commitOnAnyValidInput) {
            this.commitValue(value?.brokerageAccountGroup, UiAction.CommitTypeId.Input);
        }
    }

    public handleSelectOpenEvent() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        if (this._ngSelectWidths === undefined) {
            this._ngSelectWidths = this.calculateNgSelectWidths();
        }
        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(this._ngSelectWidths.dropDownPanel, false);
        this._ngSelectOverlayNgService.setFirstColumnWidth(this._ngSelectWidths.firstColumn, false);
    }

    protected override applyValueAsNamedGroup(
        value: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined,
        edited: boolean
    ) {
        if (!edited) {
            this._ngSelectComponent.searchTerm = '';
            this.selected = value;
            this.markForCheck();
        }
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    protected override processNamedGroupsChanged() {
        super.processNamedGroupsChanged();
        this._ngSelectWidths = undefined;
    }

    protected override finalise() {
        this._ngSelectOverlayNgService.unsubscribeMeasureCanvasContextsEvent(this._measureCanvasContextsEventSubscriptionId);
        super.finalise();
    }

    private handleMeasureCanvasContextsEvent() {
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureBoldCanvasContext = this._ngSelectOverlayNgService.measureBoldCanvasContext;
        this._ngSelectWidths = undefined; // force recalculation
    }

    private calculateNgSelectWidths() {
        let maxIdWidth = 0;
        let maxBoldIdWidth = 0;
        let maxNameWidth = 0;
        const count = this.namedGroups.length;
        for (let i = 0; i < count; i++) {
            const namedGroup = this.namedGroups[i];
            const id = namedGroup.id;
            const name = namedGroup.name;
            const idMetrics = this._measureCanvasContext.measureText(id);
            if (idMetrics.width > maxIdWidth) {
                maxIdWidth = idMetrics.width;
            }
            const boldIdMetrics = this._measureBoldCanvasContext.measureText(id);
            if (boldIdMetrics.width > maxBoldIdWidth) {
                maxBoldIdWidth = boldIdMetrics.width;
            }
            const nameMetrics = this._measureCanvasContext.measureText(name);
            if (nameMetrics.width > maxNameWidth) {
                maxNameWidth = nameMetrics.width;
            }
        }
        const spaceMetrics = this.  _measureCanvasContext.measureText(' ');
        const firstColumnRightPaddingWidth = 2 * spaceMetrics.width;
        const firstColumnWidth = firstColumnRightPaddingWidth + maxBoldIdWidth;

        let dropDownPanelWidth = firstColumnWidth + maxNameWidth + 2 * ngOptionLeftRightPadding;
        const componentWidth = this._ngSelectComponent.element.offsetWidth;
        if (dropDownPanelWidth < componentWidth) {
            dropDownPanelWidth = componentWidth;
        }
        const ngSelectWidths: NgSelectWidths = {
            firstColumn: firstColumnWidth,
            dropDownPanel: dropDownPanelWidth,
        };

        return ngSelectWidths;
    }
}

const ngOptionLeftRightPadding = 3; // should come from src/scss/partials/ng-select/_default_var.theme.scss

interface NgSelectWidths {
    dropDownPanel: number;
    firstColumn: number;
}

interface SearchEvent {
    term: string;
    items: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup[];
}

type ChangeEvent = BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined | null;
