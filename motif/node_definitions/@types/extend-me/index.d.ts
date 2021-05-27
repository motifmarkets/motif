/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

declare module "extend-me"
{
	export default Base;

	export abstract class Base
	{
		static extend<T extends object>(name: string, impl: any): Constructor<T>;

		getClassName(): string;

		/** Access a member of the super class. */
		// readonly super: any;

		// 'constructor': typeof Base;
	}

	export type Constructor<T extends object> = new (...args: any[]) => T;
}
