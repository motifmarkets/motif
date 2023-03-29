import { InjectionToken } from '@angular/core';
import { GridField, GridLayoutDefinition } from '@motifmarkets/motif-core';

const allowedFieldsTokenName = 'allowedFields';
export const allowedFieldsInjectionToken = new InjectionToken<GridField[]>(allowedFieldsTokenName);
const oldLayoutDefinitionTokenName = 'oldLayoutDefinition';
export const oldLayoutDefinitionInjectionToken = new InjectionToken<GridLayoutDefinition>(oldLayoutDefinitionTokenName);
