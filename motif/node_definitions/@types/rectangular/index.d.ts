/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

declare module "rectangular"
{
	export class Point
	{
		constructor(x: number, y: number);

		distance(point: Point): number;
		equals(point: Point): boolean;
		greaterThan(point: Point): boolean;
		GreaterThanOrEqualTo(point: Point): boolean;
		lessThan(point: Point): boolean;
		lessThanOrEqualTo(point: Point): boolean;
		max(point: Point): Point;
		min(point: Point): Point;
		plus(offset: Point): Point;
		plusXY(offsetX?: number, offsetY?: number): Point;
		within(rect: Rectangle): boolean;

		x: number;
		y: number;
	}

	export class Rectangle
	{
		constructor(x?: number, y?: number, width?: number, height?: number);

		contains(point: Point): boolean;
		contains(rect: Rectangle): boolean;
		flattenXAt(x: number): Rectangle;
		flattenYAt(y: number): Rectangle;
		forEach(callback: (this: Rectangle, x: number, y: number) => void): void;
		forEach<T>(callback: (this: T, x: number, y: number) => void, context: T): void;
		growBy(padding: number): Rectangle;
		intersect<T>(rect: Rectangle, ifNoneAction: (this: Rectangle, rect: Rectangle) => T): Rectangle | T;
		intersect<TIn, TOut>(rect: Rectangle, ifNoneAction: (this: TIn, rect: Rectangle) => TOut, context: TIn): Rectangle | TOut;
		intersects(rect: Rectangle): boolean;
		shrinkBy(padding: number): Rectangle;
		union(rect: Rectangle): Rectangle;
		within(rect: Rectangle): boolean;

		area: number;
		bottom: number;
		center: Point;
		corner: Point;
		extent: Point;
		height: number;
		left: number;
		origin: Point;
		right: number;
		top: number;
		width: number;
	}
}
