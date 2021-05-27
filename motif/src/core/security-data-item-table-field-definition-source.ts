/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PrefixableSecurityDataItemTableFieldDefinitionSource } from './prefixable-security-data-item-table-field-definition-source';
import { TableFieldCustomHeadings } from './table-field-custom-headings';
import { TableFieldDefinitionSource } from './table-field-definition-source';

export class SecurityDataItemTableFieldDefinitionSource extends PrefixableSecurityDataItemTableFieldDefinitionSource {
    constructor(customHeadings: TableFieldCustomHeadings) {
        super(TableFieldDefinitionSource.TypeId.SecurityDataItem, customHeadings,
            SecurityDataItemTableFieldSourceDefinition.fieldNameHeaderPrefix);
    }
}

export namespace SecurityDataItemTableFieldSourceDefinition {
    export const fieldNameHeaderPrefix = '';
}
