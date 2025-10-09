"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full items-center justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  ),
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("list-none", className)} {...props} />
  ),
)
PaginationItem.displayName = "PaginationItem"

interface PaginationLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  isActive?: boolean
}

const baseLinkClasses =
  "inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border-2 border-black px-3 text-xs font-black uppercase tracking-[0.2em] transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        baseLinkClasses,
        isActive
          ? "bg-[#6C63FF] text-white shadow-[4px_4px_0_rgba(0,0,0,0.25)]"
          : "bg-white text-black shadow-[3px_3px_0_rgba(0,0,0,0.15)] hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  ),
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(
  ({ className, children = "Previous", ...props }, ref) => (
    <PaginationLink ref={ref} className={cn("gap-2", className)} {...props}>
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{children}</span>
    </PaginationLink>
  ),
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(
  ({ className, children = "Next", ...props }, ref) => (
    <PaginationLink ref={ref} className={cn("gap-2", className)} {...props}>
      <span className="hidden sm:inline">{children}</span>
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </PaginationLink>
  ),
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span className={cn("text-sm font-bold text-black/50", className)} {...props}>
    …
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
