/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayout } from '@motifmarkets/revgrid';
import { defined, JsonElement } from 'src/sys/internal-api';

export namespace GridLayoutIO {

    export function saveLayout(columns: GridLayout.SerialisedColumn[], element: JsonElement) {
        const columnElements = columns.map(column => gridLayoutSerialisedColumnToJsonElement(column));
        element.setElementArray(JsonTag.columns, columnElements);
    }

    export function loadLayout(element: JsonElement | undefined): GridLayout.SerialisedColumn[] | undefined {
        if (element !== undefined) {
            const columnElements = element.tryGetElementArray(JsonTag.columns, 'GridLayoutIO.loadLayout');
            if (columnElements) {
                const serialisedColumns = columnElements
                    .map(columnElement => jsonElementToGridLayoutSerialisedColumn(columnElement))
                    .filter(serialisedColumn => defined(serialisedColumn)) as GridLayout.SerialisedColumn[];
                return serialisedColumns;
            }
        }
        return undefined;
    }

    namespace JsonTag {
        export const columns = 'columns';

        export namespace SerialisedColumn {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            export const name = 'name';
            export const show = 'show';
            export const width = 'width';
            export const priority = 'priority';
            export const ascending = 'ascending';
        }
    }


    function gridLayoutSerialisedColumnToJsonElement(column: GridLayout.SerialisedColumn) {
        const result = new JsonElement();

        result.setString(JsonTag.SerialisedColumn.name, column.Name);
        if (column.Show !== undefined) {
            result.setBoolean(JsonTag.SerialisedColumn.show, column.Show);
        }
        if (column.Width !== undefined) {
            result.setInteger(JsonTag.SerialisedColumn.width, column.Width);
        }
        if (column.Priority !== undefined) {
            result.setInteger(JsonTag.SerialisedColumn.priority, column.Priority);
        }
        if (column.Ascending !== undefined) {
            result.setBoolean(JsonTag.SerialisedColumn.ascending, column.Ascending);
        }

        return result;
    }

    function jsonElementToGridLayoutSerialisedColumn(element: JsonElement) {
        const baseContext = 'jsonToGridLayoutSerialisedColumn: ';
        const name = element.tryGetString(JsonTag.SerialisedColumn.name, baseContext + 'name');
        if (name === undefined || name.length === 0) {
            return undefined;
        } else {
            const result: GridLayout.SerialisedColumn = {
                Name: name,
                Show: element.tryGetBoolean(JsonTag.SerialisedColumn.show, baseContext + 'show'),
                Width: element.tryGetInteger(JsonTag.SerialisedColumn.width, baseContext + 'width'),
                Priority: element.tryGetInteger(JsonTag.SerialisedColumn.priority, baseContext + 'priority'),
                Ascending: element.tryGetBoolean(JsonTag.SerialisedColumn.ascending, baseContext + 'ascending')
            };

            return result;
        }
    }
}
