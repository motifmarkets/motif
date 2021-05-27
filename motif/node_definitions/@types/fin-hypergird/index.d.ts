/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

declare module "fin-hypergrid"
{
	import Base from "extend-me";
    import { Scrollbar } from "finbars";
    import { Point, Rectangle } from 'rectangular';

	export default Hypergrid;

	export class Hypergrid extends Base
	{
		constructor(options?: GridOptions);
		constructor(container: string | Element, options?: GridOptions);

		static registerTheme(theme?: HypergridThemeObject): void;
		static registerTheme(name: string, theme?: HypergridThemeObject): void;

		static registerThemes(themeCollection: object): void;

		static applyTheme: object;
		static defaults: GridProperties;
		static grids: Hypergrid[];
		static localization: LocalisationOptions;
		static plugins: object;

		abortEditing(): boolean;
		addEventListener(eventName: string,
			listener: DataModelListener | SelectionDetailGettersListener | GridListener): void;
		addProperties(moreProperties: GridProperties): void;
		/**
			* Add to the state object.
			* @param state The state to add
			*/
		addState(state: object): void;
		allowEvents(allow: boolean): void;
		autosizeColumn(column: Column | number): void;
		beCursor(cursorName: string | string[]): void;
		behaviorChanged(): void;
		behaviorShapeChanged(): void;
		behaviorStateChanged(): void;
		cancelEditing(): boolean;
		cellClicked(event: CellEvent): any;
		checkClipboardCopy(event: Event): void;
		checkColumnAutosizing(): void;
		clearSelections(): void;
		clearState(): void;
		getColumnCount(): number;
		getHScrollValue(): number;
		getRowCount(): number;
		getValue(x: number, y: number, dataModel?: DataModel): any;
		/** Note that "viewable columns" includes any partially viewable columns.
			* @return The number of viewable columns. */
		getVisibleColumns(): number;
		/** Gets the number of columns that were just rendered */
		getVisibleColumnsCount(): number;
		/** Note that "viewable rows" includes any partially viewable rows.
			* @return The number of viewable rows. */
		getVisibleRows(): number;
		/** Gets the number of rows that were just rendered */
		getVisibleRowsCount(): number;
		getVScrollValue(): number;
		/** Check whether we have focus */
		hasFocus(): boolean;
		hasSelections(): boolean;
		initScrollbars(): void;
		isDraggingColumn(): boolean;
		isGridRow(rowIndex: number): boolean;
		isScrollingNow(): boolean;
		isSelected(x: number, y: number): boolean;
		pageDown(): number;
		pageUp(): number;
		removeAllEventListeners(): void;
		removeEventListener(eventName: string, listener: DataModelListener): void;
		repaint(): void;
		repaintCell(x: number, y: number): void;
		/**
			*  Clear out all state settings, data (rows), and schema (columns) of a grid instance.
			* @param options The new options to apply
			*/
		reset(options?: GridOptions): void;
		resizeScrollbars(): void;
		scrollBy(offsetX: number, offsetY: number): void;
		scrollHBy(offsetX: number): void;
		scrollVBy(offsetY: number): void;
		scrollToMakeVisible(column: number, row: number): void;
		setBehavior(options?: BehaviorConstructOptions): void;
		setData(dataRows: object[] | DataRowFunction, options?: DataRowOptions): void;
		setFocusable(canReceiveFocus: boolean): void;
		setRowHeight(rowIndex: number, rowHeight: number): void
		setHScrollbarValues(max: number): void;
		setHScrollValue(y: number): void;
		/**
			* Set the state object to return to the given user configuration.
			* @param state The state object
			*/
		setState(state: object): void;
		setVScrollbarValues(max: number): void;
		setVScrollValue(y: number): void;
		stopEditing(): boolean;
		takeFocus(): void;
		/** Be a responsible citizen and call this function on instance disposal! */
		terminate(): void;
		toggleHiDPI(): void;
		updateCursor(): void;
		updateSize(): void;
		/** To intercept link clicks, override this method (either on the prototype to apply to all grid instances or on an instance to apply to a specific grid instance). */
		windowOpen(): void;

		applyTheme: object;
		behavior: Behaviour;
		canvas: HTMLCanvasElement;
		/** The instance of the currently active cell editor. */
		cellEditor: CellEditor;
		cellEditors: CellEditors;
		cellRenderers: CellRenderers;
		/** The extent from the mousedown point during a drag operation. */
		dragExtent: Point
		/** The pixel location of the current hovered cell. */
		hoverCell: Point;
		hScrollValue: number;
		/** Cached result of webkit test. */
		isWebkit: boolean;
		modules: object;
		/** The pixel location of an initial mousedown click, either for editing a cell or for dragging a selection. */
		mouseDown: Point;
		plugins: object;
		properties: GridProperties;
		readonly renderer: Renderer;
		renderOverridesCache: object;
		sbHScroller: Scrollbar;
		sbPrevHScrollValue: number;
		sbPrevVScrollValue: number;
		sbVScroller: Scrollbar;
		/** The instance of the grid's selection model. */
		selectionModel: SelectionModel;
		vScrollValue: number;
	}

	export abstract class Behaviour
	{
		constructor(grid: Hypergrid, options?: BehaviorOptions);

		addCellProperties<T extends object>(x: number, y: number, properties: T, dataModel?: DataModel): void;
		addCellProperties<T extends object>(event: CellEvent, properties: T, dataModel?: DataModel): void;
		addCellProperties(x: number, y: number, properties: GridProperties, dataModel?: DataModel): void;
		addCellProperties(event: CellEvent, properties: GridProperties, dataModel?: DataModel): void;
		addColumn(options: ColumnSchema): Column;
		addRowProperties<T extends object>(y: number, properties?: T, dataModel?: DataModel): void;
		addRowProperties<T extends object>(event: CellEvent, properties?: T, dataModel?: DataModel): void;
		addRowProperties(y: number, properties?: GridProperties, dataModel?: DataModel): void;
		addRowProperties(event: CellEvent, properties?: GridProperties, dataModel?: DataModel): void;
		autosizeAllColumns(): void;
		changed(): void;
		clearAllCellProperties(x?: number): void;
		clearColumns(): void;
		clearState(): void;
		createColumns(): void;
		createSubgrid(spec: SubGridSpec): DataModel;
		endDragColumnNotification(): void;
		getActiveColumnCount(): number;
		getActiveColumnIndex(column: number | Column | string): number | undefined;
		getActiveColumns(): Column[];
		getCellEditorAt(editPoint: CellEvent): CellEditor;
		getCellOwnProperties<T extends object>(x: number, y: number, dataModel?: DataModel): undefined | T;
		getCellOwnProperties<T extends object>(event: CellEvent, dataModel?: DataModel): undefined | T;
		getCellOwnProperties(x: number, y: number, dataModel?: DataModel): undefined | GridProperties;
		getCellOwnProperties(event: CellEvent, dataModel?: DataModel): undefined | GridProperties;
		getCellProperties<T extends object>(x: number, y: number, dataModel?: DataModel): undefined | T;
		getCellProperties<T extends object>(event: CellEvent, dataModel?: DataModel): undefined | T;
		getCellProperties(x: number, y: number, dataModel?: DataModel): undefined | GridProperties;
		getCellProperties(event: CellEvent, dataModel?: DataModel): undefined | GridProperties;
		getCellProperty(x: number, y: number, key: string, dataModel?: DataModel): any;
		getCellProperty(event: CellEvent, key: string, dataModel?: DataModel): any;
		getColumn(x: number): Column;
		getColumnProperties<T extends object>(x: number): GridProperties | T;
		getColumnProperties(x: number): GridProperties;
		getColumns(): Column[];
		getColumnWidth(x: number): number;
		getCursorAt(x: number, y: number): any; // TODO: Cursor?
		getData(): DataRowObject[];
		getFixedColumnCount(): number;
		getFixedColumnsMaxWidth(): number;
		getFixedRowCount(): number;
		getFixedRowsHeight(): number;
		getHiddenColumnDescriptors(): string[];
		getRow(y: number): DataRowObject;
		getRowCount(): number;
		getRowHeight(y: number, dataModel?: DataModel): number;
		getRowHeight(event: CellEvent, dataModel?: DataModel): number;
		getRowProperties<T extends object>(y: number, prototype: boolean | null, dataModel?: DataModel): undefined | T | false;
		getRowProperties<T extends object>(event: CellEvent, prototype: boolean | null, dataModel?: DataModel): undefined | T | false;
		getRowProperties(y: number, prototype: boolean | null, dataModel?: DataModel): undefined | GridProperties | false;
		getRowProperties(event: CellEvent, prototype: boolean | null, dataModel?: DataModel): undefined | GridProperties | false;
		getValue(x: number, y: number, dataModel: DataModel): any;
		handleMouseDown(grid: Hypergrid, event: object): void;
		handleMouseExit(grid: Hypergrid, event: object): void;
		hideColumns(columnIndexes: number | number[]): void;
		hideColumns(isActiveColumnIndexes: boolean, columnIndexes: number | number[]): void;
		reindex(): void;
		reset(options?: BehaviorOptions): void;
		setCellProperties<T extends object>(x: number, y: number, properties: T, dataModel?: DataModel): T;
		setCellProperties(x: number, y: number, properties: GridProperties, dataModel?: DataModel): GridProperties;
		setColumnProperties<T extends object>(x: number): T;
		setColumnProperties(x: number): GridProperties;
		setColumnWidth(column: number | Column, width: number): void;
		setData(dataRows?: object[], options?: BehaviorOptions): void;
		setFixedColumnCount(count: number): void;
		setFixedRowCount(count: number): void;
		setScrollPositionX(x: number): void;
		setScrollPositionY(y: number): void;
		setState(properties: object): void;
		setValue(x: number, y: number, value: any, dataModel?: DataModel): void;
		showColumns(columnIndexes: number | number[], referenceIndex?: number, allowDuplicateColumns?: boolean): void
		showColumns(isActiveColumnIndexes: boolean, columnIndexes: number | number[], allowDuplicateColumns?: boolean): void
		showColumns(isActiveColumnIndexes: boolean, columnIndexes: number | number[], referenceIndex: number, allowDuplicateColumns?: boolean): void
		swapColumns(sourceIndex: number, targetIndex: number): void;

		subgrids: DataModel[];
	}

	export class Button extends CellRenderer
	{

	}

	export class CellClick extends Feature
	{

	}

	export class CellEditing extends Feature
	{

	}

	export class CellEditor
	{
		constructor(grid: Hypergrid, options: object);
	}

	export class CellEditors extends Registry<CellEditor>
	{
		readonly BaseClass: typeof CellRenderer;
	}

	export class CellEvent
	{

	}

	export class CellRenderer extends Base
	{
		paint(gc: CanvasRenderingContext2DEx, config: CellRenderConfig): number | undefined;

		roundRect(gc: CanvasRenderingContext2DEx, x: number, y: number, width: number, height: number, radius: number, fill: number, stroke: number): void;
	}

	export type CellRenderPaintFunction = (gc: CanvasRenderingContext2DEx, config: CellRenderConfig) => number | undefined;
	export type CellRenderRoundRectFunction = (gc: CanvasRenderingContext2DEx, x: number, y: number, width: number, height: number, radius: number, fill: number, stroke: number) => void;
	// export namespace CellRenderer {
	// 	export type Constructor = new(...args: any[]) => CellRenderer;
	// }

	export class CellRenderers extends Registry<CellRenderer>
	{
		readonly BaseClass: typeof CellRenderer;
	}

	export class CellSelection extends Feature
	{

	}

	export class Color extends CellEditor
	{

	}

	export class Column
	{
		constructor(behavior: Behaviour, schema: ColumnSchema);

		addCellProperties(rowIndex: number, properties: GridProperties | undefined, dataModel?: DataModel): GridProperties;
		addProperties(properties: GridProperties | undefined, settingState?: boolean): void;
		checkColumnAutosizing(force: boolean): boolean;
		clearAllCellProperties(): void;
		createColumnProperties(): object;
		deleteCellOwnProperties(rowIndex: number, dataModel?: DataModel): void;
		getCellEditorAt(event: CellEvent): undefined | CellEditor;
		getCellOwnProperties(rowIndex: number, dataModel?: DataModel): null | GridProperties;
		getCellProperties(rowIndex: number, dataModel?: DataModel): null | GridProperties;
		getCellProperty(rowIndex: number, key: string, dataModel?: DataModel): any;
		getWidth(): number;
		setBackgroundColor(color: any): void;
		setCellProperties(rowIndex: number, properties: GridProperties | undefined, dataModel?: DataModel): GridProperties;
		setCellProperty(rowIndex: number, key: string, value: any, dataModel?: DataModel): GridProperties;
		setWidth(width: number): void;

		/** Get or set the computed column's calculator function. */
		calculator: string;
		/** Get or set the type of the column's header. */
		type: string;
		/** Get or set the text of the column's header. */
		header: string;
		properties: GridProperties;
		schema: ColumnSchema;
		index: number;
	}

	export class ColumnMoving extends Feature
	{

	}

	export class ColumnResizing extends Feature
	{

	}

	export class ColumnSelection extends Feature
	{

	}

	export class ColumnSorting extends Feature
	{

	}

	export class Combo extends CellEditor
	{

	}

	export class DataError extends Error
	{

	}

	export class DataModels
	{

	}

	export class DateCellEditor extends CellEditor
	{

	}

	export class DateFormatter extends Formatter
	{

	}

	export class ErrorCell extends CellRenderer
	{

	}

	export class Feature
	{
		constructor();

		attachChain(): void;
		detachChain(): void;
		isFirstFixedColumn(grid: Hypergrid, event: object): boolean;
		isFirstFixedRow(grid: Hypergrid, event: object): boolean;

		currentHoverCell: Point;
		cursor: string;
		detached: Feature;
		next: Feature;
	}

	export class Features
	{
		constructor(privateRegistry?: boolean);
	}

	export class Filters
	{

	}

	export class Formatter
	{

	}

	export class HeaderSubgrid
	{

	}

	export class HypergridThemeObject
	{

	}

	export class KeyPaging
	{

	}

	export class LastSelection extends CellRenderer
	{

	}

	export class Local extends Behaviour
	{
		constructor(grid: Hypergrid, options?: BehaviorOptions);

		/** Calls the data model's `getSchema`/`setSchema` methods. */
		schema: ColumnSchema[];
	}

	export class Localization
	{

	}

	export class NumberFormatter extends Formatter
	{

	}

	export class NumberCellEditor extends TextField
	{

	}

	export class OnHover
	{

	}

	export class RangeSelectionModel
	{

	}

	export class Registry<T>
	{
		add(name: string, constructor: new (...args: any[]) => T): void;

		get(name: string): T;
	}

	export class Renderer
	{
		findCell(x: number, y: number, dataModel?: DataModel): CellEvent;

		resetAllCellPropertiesCaches(): void;
		resetCellPropertiesCache(x: number, y: number, dataModel?: DataModel): CellEvent;
	}

	export class RowResizing extends ColumnResizing
	{

	}

	export class RowSelection
	{

	}

	export class SelectionModel
	{
		clear(): void;
		clearMostRecentColumnSelection(): void;
		clearMostRecentRowSelection(): void;
		clearMostRecentSelection(): void;
		clearRowSelection(): void;
		deselectColumn(x1: number, x2: number): void;
		deselectRow(y1: number, y2: number): void;
		getFlattenedYs(): number[];
		getLastSelection(): any;
		getLastSelectionType(): any;
		getSelectedColumns(): number[];
		getSelectedRows(): number[];
		getSelections(): InclusiveRectangle[];
		hasColumnSelections(): boolean;
		hasRowSelections(): boolean;
		hasSelections(): boolean;
		isCellSelected(x: number, y: number): boolean;
		isCellSelectedInColumn(x: number): boolean;
		isCellSelectedInRow(y: number): boolean;
		isColumnOrRowSelected(): boolean;
		isColumnSelected(x: number): boolean;
		isInCurrentSelectionRectangle(x: number, y: number): boolean;
		isRectangleSelected(ox: number, oy: number, ex: number, ey: number): boolean;
		isRowSelected(y: number): boolean;
		isSelected(selections: Rectangle[], x: number, y: number): boolean;
		select(ox: number, oy: number, ex: number, ey: number, silent: boolean): void;
		selectAllRows(): void;
		selectColumn(x1: number, x2: number): void;
		//selectColumnsFromCells
		selectRow(y1: number, y2: number): void;
		//selectRowsFromCells
		setAllRowsSelected(): void;
		setLastSelectionType(type: SelectionType, reset?: boolean): void;
		toggleSelect(ox: number, oy: number, ex: number, ey: number, silent: boolean): void;

		allRowsSelected: boolean;
		columnSelectionModel: RangeSelectionModel;
		flattenedX: Rectangle[];
		flattenedY: Rectangle[];
		rowSelectionModel: RangeSelectionModel;
		selections: Rectangle[];
	}

	export class SimpleCell extends CellRenderer
	{
		renderMultiLineText(gc: CanvasRenderingContext2DEx, config: CellRenderConfig, value: any): void;
		renderSingleLineText(gc: CanvasRenderingContext2DEx, config: CellRenderConfig, value: any): void;
	}

	export class Slider extends CellRenderer
	{

	}

	export class SparkBar extends CellRenderer
	{

	}

	export class SparkLine extends CellRenderer
	{

	}

	export class Spinner extends CellEditor
	{

	}

	export class Tag extends CellRenderer
	{

	}

	export class TextField extends CellEditor
	{

	}

	export class ThumbwheelScrolling
	{

	}

	export class TreeCell extends CellRenderer
	{

	}

	export class WritablePoint
	{

	}

	export interface BehaviorConstructOptions extends BehaviorOptions
	{
		Behavior?: BehaviorConstructor;
	}

	export interface BehaviorOptions
	{
		data?: DataRowObject[];
		dataModel?: DataModel;
		DataModel?: () => DataModel;
		metadata?: object;
		schema?: ColumnSchema[] | (() => ColumnSchema[]);
		subgrids?: SubGridSpec[];
		apply?: boolean;
	}

	export interface BoundingRect
	{
		x: number;
		y: number;
		width: number;
		height: number;
	}

	export interface CanvasRenderingContext2DCache
	{
		fillStyle: string | CanvasGradient | CanvasPattern;
		font: string;
		globalAlpha: number;
		globalCompositeOperation: string;
		imageSmoothingEnabled: boolean;
		lineCap: string;
		lineDashOffset: number;
		lineJoin: string;
		lineWidth: number;
		miterLimit: number;
		mozImageSmoothingEnabled: boolean;
		msFillRule: CanvasFillRule;
		oImageSmoothingEnabled: boolean;
		shadowBlur: number;
		shadowColor: string;
		shadowOffsetX: number;
		shadowOffsetY: number;
		strokeStyle: string | CanvasGradient | CanvasPattern;
		textAlign: string;
		textBaseline: string;

		save(): void;
		restore(): void;
	}

	export interface CanvasRenderingContext2DEx extends CanvasRenderingContext2D
	{
		alpha(cssColorSpec: CanvasGradient | CanvasPattern | string): number;
		cache: CanvasRenderingContext2DCache;
		clearFill(x: number, y: number, width: number, height: number, color: CanvasGradient | CanvasPattern | string): void;
		getTextWidth(text: string): number;
		getTextWidthTruncated(text: string, width: number, truncateTextWithEllipsis?: boolean | null, abort?: boolean): number;
		getTextHeight(font: string): { height: number, descent: number };
		simpleText(text: string, x: number, y: number, maxWidth?: number): void;
	}

	export interface CellRenderConfig extends GridProperties
	{
		allRowsSelected: boolean;
		bounds: BoundingRect;
		columnProperties: GeneralMetadata;
		columnName: string;
		// clickRect: object;
		dataCell: DataCellCoords;
		dataRow: DataRowObject;
		formatValue: (value: any, config: CellRenderConfig) => any;
		gridCell: GridCellCoords;
		isCellHovered: boolean;
		isCellSelected: boolean;
		isColumnHovered: boolean;
		isColumnSelected: boolean;
		isDataColumn: boolean;
		isDataRow: boolean;
		isFilterRow: boolean;
		isHandleColumn: boolean;
		isHeaderRow: boolean;
		isInCurrentSelectionRectangle: boolean;
		isRowHovered: boolean;
		isRowSelected: boolean;
		isSelected: boolean;
		isTreeColumn: boolean;
		isUserDataArea: boolean;
		minWidth: number;
		mouseDown: boolean;
		readonly name: string;
		prefillColor?: CanvasGradient | CanvasPattern | string;
		snapshot: any; // declare actual type in renderer
		value: any;
	}

/*	export interface CellRenderSnapshot
	{
		colors: (CanvasGradient | CanvasPattern | string)[];
		foundationColor: CanvasGradient | CanvasPattern | string;
		textFont: string;
		textColor: CanvasGradient | CanvasPattern | string;
		value: any;
	}*/

	export interface ColumnSchema
	{
		name: string;
		header?: string;
		index: number;
		type?: string | null;
		calculator?: string;
	}

	export interface DataCellCoords
	{
		x: number;
		y: number;
	}

	export interface DataModel
	{
		addListener?(handler: DataModelListener): void;
		apply?(): void;
		dispatchEvent?(eventName: string): void;
		dispatchEvent?(event: DataModelEvent): void;
		drillDownCharMap?(): DataRowObject[];
		fetchData?(rectangles: Rectangle[], callback: (failure: boolean) => void): void;
		getCell?(config: CellRenderConfig, rendererName: string): CellRenderer;
		getColumnCount?(): number;
		getData?(metadataFieldName?: string): DataRowObject[];
		getDataIndex?(rowIndex: number): number;
		getMetadataStore?(): any;
		getRow?(rowIndex: number): number | undefined;
		getRowCount(): number;
		getRowIndex?(rowIndex: number): number;
		getRowMetadata?(rowIndex: number, prototype?: () => RowMetadata): undefined | false | RowMetadata;
		getSchema(): ColumnSchema[];
		getValue(columnIndex: number, rowIndex: number): any;
		gotData?(rectangles: Rectangle[]): boolean;
		install?(api: any, options: any): void;
		isTree?(): boolean;
		isTreeCol?(columnIndex: number): boolean;
		removeAllListeners?(): void;
		removeListener?(handler: any): void;
		setData?(data: DataRowObject[] | RawColumnSchema[]): void;
		setMetadataStore?(metadataStore?: any): void;
		setRow?(rowIndex: number, dataRow?: any): void;
		setRowMetadata?(rowIndex: number, newMetadata?: RowMetadata): void;
		setSchema?(schema?: RawColumnSchema[]): void;
		setValue?(columnIndex: number, rowIndex: number, newValue: any): void;
		toggleRow?(rowIndex: number, columnIndex?: number, toggle?: boolean): boolean | undefined;
	}

	export interface DataModelEvent
	{
		type: string;
		detail: any;
	}

	export interface DataRowOptions
	{
		Behavior?: BehaviorConstructor;
		data?: DataRowObject[];
		dataModel?: DataModel;
		DataModel?: () => DataModel;
		metadata?: RowMetadata;
		schema?: ColumnSchema[] | (() => ColumnSchema[]);
	}

	export interface HoverColors
	{
		backgroundColor?: CanvasGradient | CanvasPattern | string;
		enabled: boolean;
	}

	export interface GridBounds
	{
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
		width?: string;
		height?: string;
		position?: string;
	}

	export interface GridCellCoords
	{
		x: number;
		y: number;
	}

	export interface GridMargins
	{
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	}

	export interface Canvas2DContextAttributes {
		alpha?: boolean;
		willReadFrequently?: boolean; // Geckon only
		storage?: string; // Blink only
	}

	export interface GridOptions
	{
		api?: object | string[];
		Behavior?: BehaviorOptions | BehaviorConstructor;
		boundingRect?: GridBounds;
		canvasContextAttributes?: Canvas2DContextAttributes;
		container?: string | Element;
		dataModel?: DataModel;
		DataModel?: () => DataModel;
		force?: boolean;
		inject?: boolean;
		localisation?: string | LocalisationOptions;
		margin?: GridMargins;
		metadata?: any;
		state?: any;
	}

	export interface GridProperties
	{
		/** Select cell's entire column. */
		autoSelectColumns?: boolean;
		/** Select cell's entire row. */
		autoSelectRows?: boolean;
		backgroundColor?: CanvasGradient | CanvasPattern | string;
		backgroundSelectionColor?: CanvasGradient | CanvasPattern | string;
		boxSizing?: string;
		cellPadding?: number;
		/** Clicking in a cell "selects" it; it is added to the select region and repainted with "cell selection" colors. */
		cellSelection?: boolean;
		checkboxOnlyRowSelections?: boolean;
		/** Collapse cell selection onto next row selection. */
		collapseCellSelections?: boolean;
		color?: CanvasGradient | CanvasPattern | string;
		/** Whether the column is auto-sized */
		columnAutosized?: boolean;
		/** Whether to automatically expand column width to accommodate widest rendered value. */
		columnAutosizing?: boolean;
		/** The widest the column will be auto-sized to. */
		columnAutosizingMax?: number;
		/** Set up a clipping region around each column before painting cells. */
		columnClip?: boolean | null;
		/** Column grab within this number of pixels from top of cell. */
		columnGrabMargin?: number;
		columnHeaderBackgroundColor?: CanvasGradient | CanvasPattern | string;
		columnHeaderBackgroundSelectionColor?: CanvasGradient | CanvasPattern | string;
		columnHeaderColor?: CanvasGradient | CanvasPattern | string;
		columnHeaderFont?: string;
		columnHeaderForegroundSelectionColor?: CanvasGradient | CanvasPattern | string;
		columnHeaderForegroundSelectionFont?: string;
		columnHeaderFormat?: string;
		columnHeaderHalign?: string;
		columnHeaderRenderer?: string;
		/** Clicking in a column header (top row) "selects" the column; the entire column is added to the select region and repainted with "column selection" colors. */
		columnSelection?: boolean;
		/** Allow user to move columns. */
		columnsReorderable?: boolean;
		centerIcon?: string;
		defaultRowHeight?: number;
		defaultColumnWidth?: number;
		editable?: boolean;
		/** Edit cell on double-click rather than single-click. */
		editOnDoubleClick?: boolean;
		editOnKeydown?: boolean;
		/** Open cell editor when cell selected via keyboard navigation. */
		editOnNextCell?: boolean;
		/** Name of a cell editor. */
		editor?: string;
		/** Re-render grid at maximum speed. */
		enableContinuousRepaint?: boolean;
		/** Validation failure feedback. */
		feedbackCount?: number;
		feedbackEffect?: string;
		filterable?: boolean;
		filterBackgroundColor?: CanvasGradient | CanvasPattern | string;
		filterBackgroundSelectionColor?: CanvasGradient | CanvasPattern | string;
		filterColor?: CanvasGradient | CanvasPattern | string;
		filterEditor?: string;
		filterFont?: string;
		filterForegroundSelectionColor?: CanvasGradient | CanvasPattern | string;
		filterHalign?: string;

		fixedColumnCount?: number;
		fixedLinesHColor?: CanvasGradient | CanvasPattern | string;
		fixedLinesHEdge?: number;
		fixedLinesHWidth?: number;
		fixedLinesVColor?: CanvasGradient | CanvasPattern | string;
		fixedLinesVEdge?: number;
		fixedLinesVWidth?: number;
		fixedRowCount?: number;
		font?: string;
		foregroundSelectionColor?: CanvasGradient | CanvasPattern | string;
		foregroundSelectionFont?: string;
		/** Name of a formatter for cell text. */
		format?: string;
		gridBorder?: boolean | string;
		gridBorderBottom?: boolean | string;
		gridBorderLeft?: boolean | string;
		gridBorderRight?: boolean | string;
		gridBorderTop?: boolean | string;
		gridLinesColumnHeader?: boolean;
		gridLinesRowHeader?: boolean;
		gridLinesH?: boolean;
		gridLinesHColor?: CanvasGradient | CanvasPattern | string;
		gridLinesHWidth?: number;
		gridLinesUserDataArea?: boolean;
		gridLinesV?: boolean;
		gridLinesVColor?: CanvasGradient | CanvasPattern | string;
		gridLinesVWidth?: number;
		/** Name of grid renderer. */
		gridRenderer?: string;
		/** The cell's horizontal alignment, as interpreted by the cell renderer */
		halign?: ("left" | "right" | "center" | "start" | "end");
		headerify?: string;
		/** Whether text in header cells is wrapped. */
		headerTextWrapping?: boolean;
		/** On mouse hover, whether to repaint the cell background and how. */
		hoverCellHighlight?: HoverColors;
		/** On mouse hover, whether to repaint the column background and how. */
		hoverColumnHighlight?: HoverColors;
		/** On mouse hover, whether to repaint the row background and how. */
		hoverRowHighlight?: HoverColors;
		iconPadding?: number;
		leftIcon?: string;
		lineColor?: CanvasGradient | CanvasPattern | string;
		/** Display cell value as a link (with underline). */
		link?: boolean;
		/** Color for link. */
		linkColor?: CanvasGradient | CanvasPattern | string;
		/** Color link on hover only. */
		linkColorOnHover?: boolean;
		/** Underline link on hover only. */
		linkOnHover?: boolean;
		/** The window (or tab) in which to open the link. */
		linkTarget?: string;
		/** Color for visited link. */
		linkVisitedColor?: CanvasGradient | CanvasPattern | string;
		/** The maximum number of columns that may participate in a multi-column sort (via ctrl-click headers). */
		maxSortColumns?: number;
		minimumColumnWidth?: number;
		/** Allow multiple cell region selections. */
		multipleSelections?: boolean;
		/** Mappings for cell navigation keys. */
		navKeyMap?: Map<string, string>
		noDataMessage?: string;
		readOnly?: boolean;
		/** Name of cell renderer. */
		renderer?: string;
		/** Set to `true` to render `0` and `false`. Otherwise these value appear as blank cells. */
		renderFalsy?: boolean;
		repaintImmediately?: boolean;
		repaintIntervalRate?: number;
		rightIcon?: string;
		resizeColumnInPlace?: boolean;
		/** Restore column selections across data transformations (`reindex` calls). */
		restoreColumnSelections?: boolean;
		/** Restore row selections across data transformations (`reindex` calls). */
		restoreRowSelections?: boolean;
		rowHeaderBackgroundColor?: CanvasGradient | CanvasPattern | string;
		rowHeaderBackgroundSelectionColor?: CanvasGradient | CanvasPattern | string;
		rowHeaderCheckboxes?: boolean;
		rowHeaderColor?: CanvasGradient | CanvasPattern | string;
		rowHeaderFont?: string;
		rowHeaderForegroundSelectionColor?: CanvasGradient | CanvasPattern | string;
		/** Font style for selected rows' headers. */
		rowHeaderForegroundSelectionFont?: string;
		rowHeaderNumbers?: boolean;
		/** Whether to automatically expand row number column width to accommodate widest rendered row number */
		rowNumberAutosizing?: boolean;
		rowResize?: boolean;
		/** Clicking in a row header (leftmost column) "selects" the row; the entire row is added to the select region and repainted with "row selection" colors. */
		rowSelection?: boolean;
		/** Repeating pattern of property overrides for grid rows. */
		rowStripes?: GridProperties[];
		/** Stroke color for last selection overlay. */
		selectionRegionOutlineColor?: CanvasGradient | CanvasPattern | string;
		/** Fill color for last selection overlay. */
		selectionRegionOverlayColor?: CanvasGradient | CanvasPattern | string;
		singleRowSelectionMode?: boolean;
		showFilterRow?: boolean;
		showHeaderRow?: boolean;
		showTreeColumn?: boolean;
		/** Sort column on double-click rather than single-click. */
		sortOnDoubleClick?: boolean;
		/** Column(s) participating and subsequently hidden still affect sort. */
		sortOnHiddenColumns?: boolean;
		/** Display cell font with strike-through line drawn over it. */
		strikeThrough?: boolean;
		themeName?: string;
		/** Whether to automatically expand row number column width to accommodate widest rendered group label. */
		treeColumnAutosizing?: boolean;
		/** The widest the tree column will be auto-sized to. */
		treeColumnAutosizingMax?: number;
		treeRenderer?: string;
		/** How to truncate text. */
		truncateTextWithEllipsis?: boolean | null;
		unsortable?: boolean;
		useBitBlit?: boolean;
		useHiDPI?: boolean;
		voffset?: number;
		wheelHFactor?: number;
		wheelVFactor?: number;
		/** The current width of the column */
		width?: number;
	}

	export interface LocalisationOptions
	{
		locale?: string | string[];
		numberOptions?: object;
		dateOptions?: object;
	}

	export interface localizerInterface
	{

	}

	export interface RenderConfig
	{
		allRowsSelected: boolean;
		bounds: BoundingRect;
		dataCell: DataCellCoords;
		dataRowObject: DataRowObject;
	}

	export interface GeneralMetadata
	{
		[key: string]: GridProperties | undefined;
	}

	export interface RowMetadata extends GeneralMetadata
	{
		__ROW?: GridProperties;
	}

	export interface SelectionDetailGetters {
		readonly rows: InclusiveRectangle[];
		readonly columns: InclusiveRectangle[];
		readonly selections: InclusiveRectangle[];
	}

	export interface SelectionDetailGettersCustomEvent extends CustomEvent<SelectionDetailGetters> {
	}

	export interface GridCustomEvent extends CustomEvent<Hypergrid> {

	}

	export type SubGridConstructor = (grid: Hypergrid, ...args: any[]) => DataModel;

	export type BehaviorConstructor = new (grid: Hypergrid, options?: BehaviorOptions) => Behaviour;

	export type SubGridSpec = object | 'data' | SubGridConstructor; // TODO: TypeScript 3 also allows: [SubGridConstructor, ...any[]];

	export type DataModelListener = (this: Hypergrid, event: DataModelEvent) => void;
	export type SelectionDetailGettersListener = (this: Hypergrid, event: SelectionDetailGettersCustomEvent) => void;
	export type GridListener = (this: Hypergrid, event: GridCustomEvent) => void;

	export type DataRowFunction = () => object[];

	export type DataRowObject = any;

	export type RawColumnSchema = ColumnSchema | string;

	export type SelectionType = 'cell' | 'row' | 'column';

	export type InclusiveRectangle = Rectangle; // includes boundaries instead of excluding
}
