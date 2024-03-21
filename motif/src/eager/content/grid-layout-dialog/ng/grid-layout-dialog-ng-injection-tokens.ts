/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { InjectionToken } from '@angular/core';
import { AllowedFieldsGridLayoutDefinition, AllowedGridField, BidAskGridLayoutDefinitions, BidAskPair, EditableGridLayoutDefinitionColumnList } from '@motifmarkets/motif-core';


export type BidAskAllowedGridFields = BidAskPair<readonly AllowedGridField[]>;

const allowedFieldsTokenName = 'allowedFields';
export const allowedFieldsInjectionToken = new InjectionToken<AllowedGridField[]>(allowedFieldsTokenName);
const oldLayoutDefinitionTokenName = 'oldLayoutDefinition';
export const oldLayoutDefinitionInjectionToken = new InjectionToken<AllowedFieldsGridLayoutDefinition>(oldLayoutDefinitionTokenName);
const definitionColumnListTokenName = 'definitionColumnList';
export const definitionColumnListInjectionToken = new InjectionToken<EditableGridLayoutDefinitionColumnList>(definitionColumnListTokenName);
const bidAskAllowedFieldsTokenName = 'bidAskAllowedFields';
export const bidAskAllowedFieldsInjectionToken = new InjectionToken<BidAskAllowedGridFields>(bidAskAllowedFieldsTokenName);
const oldBidAskLayoutDefinitionTokenName = 'bidAskOldLayoutDefinition';
export const oldBidAskLayoutDefinitionInjectionToken = new InjectionToken<BidAskGridLayoutDefinitions>(oldBidAskLayoutDefinitionTokenName);
