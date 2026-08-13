"use client";

import { useMemo, useState, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3 } from "lucide-react";
import { cn } from "@/shared/utils";
import { DropdownMenu, DropdownMenuLabel, DropdownMenuSeparator } from "./dropdown-menu";
import { Checkbox } from "./checkbox";
import { Skeleton } from "./skeleton";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  accessor: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "center" | "right";
  hideable?: boolean;
  defaultVisible?: boolean;
  className?: string;
}

export interface DataTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
  maxHeight?: string;
}

interface SortState {
  key: string;
  dir: "asc" | "desc";
}

export function DataTable<T>({
  className = "",
  data,
  columns,
  rowKey,
  loading = false,
  skeletonRows = 6,
  emptyState,
  onRowClick,
  toolbar,
  initialSort,
  maxHeight,
  ref,
  ...props
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null);
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultVisible === false).map((c) => c.key)),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hidden.has(c.key)),
    [columns, hidden],
  );

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return data;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [data, columns, sort]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [data.length]);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.dir === "asc" ? { key, dir: "desc" } : null;
      }
      return { key, dir: "asc" };
    });
  }

  function toggleColumn(key: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const alignClass = (align?: "left" | "center" | "right") =>
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  return (
    <div ref={ref} className={cn("flex w-full flex-col", className)} {...props}>
      {toolbar && <div className="mb-3">{toolbar}</div>}

      <div className="relative">
        <div
          ref={scrollRef}
          className={cn(
            "border-border relative w-full overflow-x-auto rounded-lg border",
            maxHeight && "overflow-y-auto",
          )}
          style={maxHeight ? { maxHeight } : undefined}
        >
          <table className="w-full caption-bottom text-sm">
            <thead
              className={cn(
                "border-border sticky top-0 z-10 bg-white backdrop-blur-md",
                canScrollLeft && "scroll-edge-left",
                canScrollRight && "scroll-edge-right",
              )}
            >
              <tr className="border-b">
                {visibleColumns.map((col) => {
                  const isSorted = sort?.key === col.key;
                  const canSort = Boolean(col.sortValue);
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={
                        isSorted ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"
                      }
                      className={cn(
                        "text-muted-foreground density-px-sm density-py-sm font-mono text-xs font-semibold tracking-wider whitespace-nowrap uppercase",
                        alignClass(col.align),
                        col.className,
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            "hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none",
                            alignClass(col.align),
                          )}
                          aria-label={`Sort by ${typeof col.header === "string" ? col.header : col.key}`}
                        >
                          {col.header}
                          {isSorted ? (
                            sort!.dir === "asc" ? (
                              <ArrowUp className="size-3" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="size-3" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-border divide-y">
              {loading ? (
                Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} aria-hidden="true">
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("density-px-sm density-py-sm", alignClass(col.align))}
                      >
                        <Skeleton className="h-4 w-full max-w-[140px]" shimmer />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="p-0">
                    {emptyState ?? (
                      <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
                        No records to display.
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-border hover:bg-surface-hover transition-colors",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "density-px-sm density-py-sm align-middle text-[var(--density-font)]",
                          alignClass(col.align),
                          col.className,
                        )}
                      >
                        {col.accessor(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {visibleColumns.length < columns.length && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-t-lg bg-gradient-to-b from-black/5 to-transparent dark:from-black/20" />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-muted-foreground text-xs">
          {loading
            ? "Loading..."
            : `${sortedData.length} ${sortedData.length === 1 ? "record" : "records"}`}
        </div>
        {columns.some((c) => c.hideable !== false) && (
          <DropdownMenu
            align="end"
            trigger={
              <button
                type="button"
                className="border-border bg-background text-muted-foreground hover:text-foreground hover:bg-surface-hover focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Toggle column visibility"
              >
                <Columns3 className="size-3.5" aria-hidden="true" />
                Columns
              </button>
            }
          >
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns
              .filter((c) => c.hideable !== false)
              .map((col) => (
                <label
                  key={col.key}
                  className="hover:bg-surface-hover flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
                >
                  <Checkbox
                    checked={!hidden.has(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    aria-label={`Show ${typeof col.header === "string" ? col.header : col.key} column`}
                  />
                  {col.header}
                </label>
              ))}
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
