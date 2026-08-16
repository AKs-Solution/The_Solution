"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export type TableProps = HTMLAttributes<HTMLTableElement>;

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
      </div>
    );
  },
);

Table.displayName = "Table";

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          "sticky top-0 z-10 border-b border-slate-200 bg-slate-50 [&_tr]:border-b-0",
          className,
        )}
        {...props}
      />
    );
  },
);

TableHeader.displayName = "TableHeader";

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = "", ...props }, ref) => {
    return <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
  },
);

TableBody.displayName = "TableBody";

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          "border-b border-slate-100 text-sm text-slate-800 transition-colors hover:bg-slate-50/80",
          className,
        )}
        {...props}
      />
    );
  },
);

TableRow.displayName = "TableRow";

export type TableHeadProps = HTMLAttributes<HTMLTableCellElement>;

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          "border-b border-slate-200 p-3.5 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase",
          className,
        )}
        {...props}
      />
    );
  },
);

TableHead.displayName = "TableHead";

export type TableCellProps = HTMLAttributes<HTMLTableCellElement>;

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn("p-3.5 align-middle text-sm text-slate-800", className)}
        {...props}
      />
    );
  },
);

TableCell.displayName = "TableCell";
