import React from 'react';
import {
  FilterableAdminDataTable,
  type FilterableAdminDataTableProps,
} from './FilterableAdminDataTable';
import { ExportButton } from './ExportButton';
import { type ExportColumn } from '@/utils/export';

interface ExportableAdminDataTableProps<T> extends FilterableAdminDataTableProps<T> {
  readonly exportColumns?: ReadonlyArray<ExportColumn<T>>;
  readonly exportFilename: string;
  readonly showExportButton?: boolean;
}

export function ExportableAdminDataTable<T extends Record<string, unknown>>({
  exportColumns,
  exportFilename,
  showExportButton = true,
  searchPlaceholder,
  ...props
}: ExportableAdminDataTableProps<T>) {
  // Use provided export columns or convert from table columns
  const columns =
    exportColumns ||
    props.columns.map((col) => ({
      key: col.key,
      label: col.label,
      getValue: col.render
        ? (item: T) => {
            const rendered = col.render!(item);
            // Extract text content from React elements
            if (React.isValidElement(rendered)) {
              // Try to extract text from props.children
              const extractText = (element: unknown): string => {
                if (typeof element === 'string') return element;
                if (typeof element === 'number') return String(element);
                if (!element) return '';
                if (React.isValidElement(element)) {
                  const props = element.props as any;
                  if (props?.children) {
                    return extractText(props.children);
                  }
                }

                return '';
              };

              return extractText(rendered);
            }

            return String(rendered);
          }
        : undefined,
    }));

  return (
    <FilterableAdminDataTable<T>
      {...props}
      searchPlaceholder={searchPlaceholder}
      extraActions={
        <>
          {showExportButton ? (
            <ExportButton data={props.data} columns={columns} filename={exportFilename} />
          ) : null}
          {props.extraActions}
        </>
      }
    />
  );
}
