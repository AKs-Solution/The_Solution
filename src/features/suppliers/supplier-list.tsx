"use client";

import Link from "next/link";
import { Building2, ChevronRight, Search, Loader2, MapPin, Star } from "lucide-react";
import {
  Badge,
  Input,
  Button,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { Panel, Stack } from "@/components/layout";
import { cn } from "@/shared/utils";
import { SUPPLIER_TYPE_LABELS, SUPPLIER_STATUS_LABELS } from "@/server/suppliers/constants";
import type { SupplierDTO } from "./types";

interface Props {
  suppliers: SupplierDTO[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  totalCount: number;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "success",
  APPROVED: "success",
  PENDING_REVIEW: "warning",
  INACTIVE: "secondary",
  DISQUALIFIED: "destructive",
};

function RatingStars({ rating }: { rating?: number | null }) {
  if (rating == null) return null;
  const color = rating >= 4 ? "text-success" : rating >= 3 ? "text-warning" : "text-destructive";
  return (
    <div className="flex items-center gap-1">
      <Star className={cn("size-3", color)} />
      <span className={cn("text-xs font-medium", color)}>{rating.toFixed(1)}</span>
    </div>
  );
}

export function SupplierList({
  suppliers,
  isLoading,
  searchQuery,
  onSearchChange,
  onSearch,
  totalCount,
}: Props) {
  return (
    <Stack gap={4}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search suppliers by name, code, or DUNS..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pl-9"
          />
        </div>
        <Button variant="secondary" onClick={onSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <Search className="mr-1.5 size-4" />
          )}
          Search
        </Button>
        <Link href="/suppliers/new">
          <Button>New Supplier</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-8" />}
          title={searchQuery ? "No suppliers match this search" : "No suppliers yet"}
          description={
            searchQuery
              ? "Try a different name, code, or identifier."
              : "This workspace has no suppliers. Start here by adding the first one."
          }
          action={
            searchQuery ? undefined : (
              <Link href="/suppliers/new">
                <Button>Add first supplier</Button>
              </Link>
            )
          }
        />
      ) : (
        <Panel padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Live Capacity</TableHead>
                <TableHead>Capability Tags</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <Link href={`/suppliers/${supplier.id}`} className="flex items-center gap-2">
                      <div className="bg-muted flex size-8 items-center justify-center rounded-md">
                        <Building2 className="text-muted-foreground size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-foreground text-sm font-medium">{supplier.name}</span>
                        {supplier.industrySectors && supplier.industrySectors.length > 0 && (
                          <span className="text-muted-foreground text-xs">
                            {supplier.industrySectors[0]}
                          </span>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                      {supplier.identifier}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" size="sm">
                      {SUPPLIER_TYPE_LABELS[supplier.supplierType] ?? supplier.supplierType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        (STATUS_BADGE[supplier.status] ?? "secondary") as
                          "success" | "warning" | "secondary" | "destructive"
                      }
                      size="sm"
                    >
                      {SUPPLIER_STATUS_LABELS[supplier.status] ?? supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {supplier.city || supplier.country ? (
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <MapPin className="size-3" />
                        {[supplier.city, supplier.country].filter(Boolean).join(", ")}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <RatingStars rating={supplier.rating ?? supplier.overallRating} />
                  </TableCell>
                  <TableCell>
                    {supplier.liveCapacityScore !== undefined ? (
                      <div className="flex w-24 flex-col gap-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.round(supplier.liveCapacityScore * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">
                          {Math.round(supplier.liveCapacityScore * 100)}% Available
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[150px] flex-wrap gap-1">
                      {supplier.capabilityTags &&
                      (supplier.capabilityTags as string[]).length > 0 ? (
                        (supplier.capabilityTags as string[]).slice(0, 2).map((t, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            size="sm"
                            className="origin-left scale-95 px-1 text-[9px]"
                          >
                            {t}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      )}

      {totalCount > 0 && (
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            {totalCount} supplier{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </Stack>
  );
}
