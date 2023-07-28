import { InjectionToken } from '@angular/core';
import { EditableGridLayoutDefinitionColumnList, GridField, GridLayoutDefinition } from '@motifmarkets/motif-core';

const allowedFieldsTokenName = 'allowedFields';
export const allowedFieldsInjectionToken = new InjectionToken<GridField[]>(allowedFieldsTokenName);
const oldLayoutDefinitionTokenName = 'oldLayoutDefinition';
export const oldLayoutDefinitionInjectionToken = new InjectionToken<GridLayoutDefinition>(oldLayoutDefinitionTokenName);
const definitionColumnListTokenName = 'definitionColumnList';
export const definitionColumnListInjectionToken = new InjectionToken<EditableGridLayoutDefinitionColumnList>(definitionColumnListTokenName);
