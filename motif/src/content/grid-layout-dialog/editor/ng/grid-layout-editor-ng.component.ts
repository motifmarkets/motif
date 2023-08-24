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
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AssertInternalError,
    EditableGridLayoutDefinitionColumnList,
    GridLayoutDefinition,
    Integer
} from '@motifmarkets/motif-core';
import { AngularSplitTypes } from '../../../../controls/internal-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { definitionColumnListInjectionToken } from '../../ng/grid-layout-dialog-ng-injection-tokens';
import { GridLayoutEditorAllowedFieldsNgComponent } from '../allowed-fields/ng-api';
import { GridLayoutEditorColumnsNgComponent } from '../columns/ng-api';
import { GridLayoutEditorFieldControlsNgComponent } from '../field-controls/ng-api';

@Component({
    selector: 'app-grid-layout-editor',
    templateUrl: './grid-layout-editor-ng.component.html',
    styleUrls: ['./grid-layout-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('allowedFields', { static: true }) private _allowedFieldsComponent: GridLayoutEditorAllowedFieldsNgComponent;
    @ViewChild('fieldControlsAndColumns', { static: true }) private _fieldControlsAndColumnsElRef: ElementRef<HTMLDivElement>;
    @ViewChild('fieldControls', { static: true }) private _fieldControlsComponent: GridLayoutEditorFieldControlsNgComponent;
    @ViewChild('columns', { static: true }) private _columnsComponent: GridLayoutEditorColumnsNgComponent;

    public allowedFieldsWidth: AngularSplitTypes.AreaSize.Html;
    public allowedFieldsMinWidth: AngularSplitTypes.AreaSize.Html;
    public splitterGutterSize = 3;

    private _fieldControlsAndColumnsHtmlElement: HTMLDivElement;

    private _resizeObserver: ResizeObserver;
    private _splitterDragged = false;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        @Inject(definitionColumnListInjectionToken) private readonly _columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super(elRef, ++GridLayoutEditorNgComponent.typeInstanceCreateCount);
    }

    public handleSplitterDragEnd() {
        this._splitterDragged = true;
    }

    getGridLayoutDefinition(): GridLayoutDefinition {
        return this._columnList.createGridLayoutDefinition();
    }

    ngAfterViewInit() {
        this._fieldControlsAndColumnsHtmlElement = this._fieldControlsAndColumnsElRef.nativeElement;

        this._fieldControlsComponent.initialise(this._allowedFieldsComponent.frame, this._columnsComponent.frame)

        this._resizeObserver = new ResizeObserver(() => this.updateWidths());
        this._resizeObserver.observe(this.rootHtmlElement);
        this._allowedFieldsComponent.waitLastServerNotificationRendered().then(
            (success) => {
                if (success) {
                    this.updateWidths();
                }
            },
            (error) => { throw AssertInternalError.createIfNotError(error, 'GLENCNAFI20718'); }
        );

        this._allowedFieldsComponent.columnsViewWithsChangedEventer = () => this.updateWidths();
    }

    ngOnDestroy() {
        this._resizeObserver.disconnect();
    }

    private updateWidths() {
        const allowedFieldsMinWidth = this._allowedFieldsComponent.calculateFixedColumnsWidth() + GridLayoutEditorNgComponent.fixedColumnsMinExtraEmWidth * this._allowedFieldsComponent.emWidth;
        this.allowedFieldsMinWidth = allowedFieldsMinWidth;

        if (!this._splitterDragged) {
            const totalWidth = this.rootHtmlElement.offsetWidth;
            const availableTotalWidth = totalWidth - this.splitterGutterSize;
            const fieldControlsAndColumnsWidth = this._fieldControlsAndColumnsHtmlElement.offsetWidth;
            const allowedFieldsActiveColumnsWidth = this._allowedFieldsComponent.calculateActiveColumnsWidth();
            let calculatedAllowedFieldsWidth: Integer;
            if (availableTotalWidth >= (fieldControlsAndColumnsWidth + allowedFieldsActiveColumnsWidth)) {
                calculatedAllowedFieldsWidth = allowedFieldsActiveColumnsWidth;
            } else {
                if (availableTotalWidth > (fieldControlsAndColumnsWidth + allowedFieldsMinWidth)) {
                    calculatedAllowedFieldsWidth = availableTotalWidth - fieldControlsAndColumnsWidth;
                } else {
                    calculatedAllowedFieldsWidth = allowedFieldsMinWidth;
                }
            }

            this.allowedFieldsWidth = calculatedAllowedFieldsWidth;
            this._cdr.markForCheck();
        }
    }
}

export namespace GridLayoutEditorNgComponent {
    export const fixedColumnsMinExtraEmWidth = 2;

    export function create(container: ViewContainerRef) {
        container.clear();
        container.createComponent(GridLayoutEditorNgComponent);
    }
}
