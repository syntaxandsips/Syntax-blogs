"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-md border-4 border-black bg-white p-3 shadow-[6px_6px_0_0_rgba(108,99,255,0.35)] dark:bg-slate-900",
        className,
      )}
      classNames={{
        months: cn("flex flex-col gap-6 sm:flex-row sm:space-x-6", classNames?.months),
        month: cn("space-y-4", classNames?.month),
        caption: cn("flex items-center justify-between px-1", classNames?.caption),
        caption_label: cn(
          "text-sm font-bold uppercase tracking-wide",
          classNames?.caption_label,
        ),
        nav: cn("flex items-center gap-1", classNames?.nav),
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-8 w-8 border-2 border-black bg-white p-0 text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] dark:bg-slate-800 dark:text-slate-100",
          classNames?.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-8 w-8 border-2 border-black bg-white p-0 text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] dark:bg-slate-800 dark:text-slate-100",
          classNames?.button_next,
        ),
        table: cn("w-full border-collapse space-y-1", classNames?.table),
        head_row: cn("grid grid-cols-7", classNames?.head_row),
        head_cell: cn(
          "h-8 w-8 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300",
          classNames?.head_cell,
        ),
        row: cn("grid grid-cols-7", classNames?.row),
        cell: cn("relative p-0 text-center", classNames?.cell),
        day: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "mx-auto h-9 w-9 rounded-md border border-transparent p-0 font-semibold text-slate-900 transition hover:-translate-y-[1px] hover:border-black hover:bg-[#F8F7FF] hover:text-black focus-visible:border-black focus-visible:outline-none aria-selected:border-black dark:text-slate-100 dark:hover:bg-slate-800",
          classNames?.day,
        ),
        day_disabled: cn("pointer-events-none opacity-40", classNames?.day_disabled),
        day_outside: cn("text-slate-400 opacity-50", classNames?.day_outside),
        day_today: cn("border-black text-black dark:text-white", classNames?.day_today),
        day_selected: cn(
          "border-2 border-black bg-[#6C63FF] text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:bg-[#5b53e0] hover:text-white focus-visible:bg-[#5b53e0] dark:bg-[#6C63FF]",
          classNames?.day_selected,
        ),
        day_range_middle: cn(
          "rounded-none border-y-2 border-black bg-[#e5e0ff] text-black dark:bg-slate-800",
          classNames?.day_range_middle,
        ),
        day_range_start: cn(
          "border-2 border-black bg-[#6C63FF] text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:bg-[#5b53e0] hover:text-white focus-visible:bg-[#5b53e0]",
          classNames?.day_range_start,
        ),
        day_range_end: cn(
          "border-2 border-black bg-[#6C63FF] text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:bg-[#5b53e0] hover:text-white focus-visible:bg-[#5b53e0]",
          classNames?.day_range_end,
        ),
      }}
      components={{
        Chevron: ({ orientation = "right", className, size, disabled, ...iconProps }) => {
          const IconComponent =
            orientation === "left"
              ? ChevronLeft
              : orientation === "up"
                ? ChevronUp
                : orientation === "down"
                  ? ChevronDown
                  : ChevronRight

          return (
            <IconComponent
              className={cn("h-4 w-4", disabled ? "opacity-40" : undefined, className)}
              size={size}
              aria-hidden="true"
              {...iconProps}
            />
          )
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
