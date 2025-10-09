"use client"

import * as React from "react"
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  Row,
  Table as ReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type DataTableColumnDef<TData> = ColumnDef<TData, unknown>

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  caption?: React.ReactNode
  filterColumnId?: string
  filterPlaceholder?: string
}

export function DataTable<TData>({
  columns,
  data,
  caption,
  filterColumnId = "email",
  filterPlaceholder = "Filter...",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const filterColumn = filterColumnId ? table.getColumn(filterColumnId) : null

  return (
    <div className="w-full rounded-3xl border-4 border-black bg-white shadow-[10px_10px_0_rgba(0,0,0,0.15)]">
      <div className="flex flex-col gap-4 border-b-4 border-black px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={filterPlaceholder}
          value={(filterColumn?.getFilterValue() as string) ?? ""}
          onChange={(event) => filterColumn?.setFilterValue(event.target.value)}
          className="w-full sm:max-w-xs"
          disabled={!filterColumn}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full border-2 border-black bg-white font-semibold uppercase tracking-[0.2em]">
              Columns <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl border-4 border-black">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden px-4 pb-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-[#F5F3FF]">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-black">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {caption ? <div className="border-t-4 border-dashed border-black/20 px-6 py-3 text-sm text-black/70">{caption}</div> : null}
      <div className="flex flex-col gap-4 border-t-4 border-black px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export function createSelectableColumn<TData>() {
  const SelectColumnHeader = ({ table }: { table: ReactTable<TData> }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  )

  const SelectColumnCell = ({ row }: { row: Row<TData> }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  )

  SelectColumnHeader.displayName = "SelectColumnHeader"
  SelectColumnCell.displayName = "SelectColumnCell"

  return {
    id: "select",
    header: SelectColumnHeader,
    cell: SelectColumnCell,
    enableSorting: false,
    enableHiding: false,
  } satisfies ColumnDef<TData>
}

export function createSortableHeader<TData>(title: string) {
  const SortableHeader = ({ column }: { column: Column<TData, unknown> }) => (
    <Button
      variant="ghost"
      className="-ml-3 inline-flex items-center gap-1 rounded-full border-2 border-transparent px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black hover:border-black hover:bg-[#FFEE88]"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
    </Button>
  )

  SortableHeader.displayName = `SortableHeader(${title})`

  return SortableHeader
}

export function createRowActions<TData>(options: {
  onCopyId?: (row: TData) => void
  onView?: (row: TData) => void
}) {
  const RowActions = ({ row }: { row: Row<TData> }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full border-2 border-black bg-white p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {options.onCopyId ? (
          <DropdownMenuItem onClick={() => options.onCopyId?.(row.original)}>
            Copy ID
          </DropdownMenuItem>
        ) : null}
        {options.onView ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => options.onView?.(row.original)}>View</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  RowActions.displayName = "RowActionsMenu"

  return RowActions
}

export const monetaryCell = (value: number) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)

  return <span className="font-semibold text-black">{formatted}</span>
}

export const badgeCell = (value: string) => (
  <span className={cn("inline-flex items-center gap-2 rounded-full border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-[0.2em]", value === "active" ? "bg-[#A0C4FF]" : "bg-[#FFADAD]")}>{value}</span>
)
