"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type SidebarContextValue = {
  isOpen: boolean
  isMobile: boolean
  toggle: () => void
  setOpen: (next: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)")
    const handler = () => setIsMobile(media.matches)
    handler()
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])

  return isMobile
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(!isMobile)

  React.useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      isOpen,
      isMobile,
      toggle: () => setIsOpen((previous) => !previous),
      setOpen: (next) => setIsOpen(next),
    }),
    [isOpen, isMobile],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const Sidebar = ({
  className,
  collapsible = "full",
  ...props
}: React.ComponentPropsWithoutRef<"aside"> & { collapsible?: "full" | "icon" }) => {
  const { isOpen, isMobile } = useSidebar()
  return (
    <aside
      data-collapsible={collapsible}
      data-state={isOpen ? "expanded" : "collapsed"}
      className={cn(
        "group/sidebar-wrapper relative flex h-full flex-col border-r-4 border-black bg-white transition-all duration-300",
        isMobile
          ? cn(
              "fixed inset-y-0 z-50 w-72 translate-x-0 shadow-[12px_0_0_rgba(0,0,0,0.2)]",
              !isOpen && "-translate-x-full",
            )
          : cn("w-72", collapsible === "icon" && !isOpen && "w-16"),
        className,
      )}
      {...props}
    />
  )
}
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, ...props }, ref) => {
    const { toggle } = useSidebar()
    return (
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5",
          className,
        )}
        {...props}
      >
        <span className="sr-only">Toggle sidebar</span>
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => {
  const { isMobile } = useSidebar()
  return (
    <div
      className={cn(
        "transition-[margin] duration-300",
        isMobile && "ml-0",
        className,
      )}
      {...props}
    />
  )
}
SidebarInset.displayName = "SidebarInset"

const SidebarContent = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => {
  const { isOpen, isMobile } = useSidebar()
  const isCollapsed = !isOpen && !isMobile

  return (
    <div
      className={cn("flex-1 overflow-y-auto px-4 py-6", isCollapsed && "px-2", className)}
      {...props}
    />
  )
}
SidebarContent.displayName = "SidebarContent"

const SidebarHeader = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("border-b-4 border-black px-4 py-6", className)} {...props} />
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("border-t-4 border-black px-4 py-4", className)} {...props} />
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("space-y-3", className)} {...props} />
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn(
      "text-xs font-black uppercase tracking-[0.25em] text-black/50",
      className,
    )}
    {...props}
  />
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("space-y-1", className)} {...props} />
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("grid gap-1", className)} {...props} />
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("group/menu-item relative", className)} {...props} />
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { tooltip?: string }
>(({ className, tooltip, children, ...props }, ref) => {
  const { isOpen, isMobile } = useSidebar()
  const isCollapsed = !isOpen && !isMobile

  const mergedProps: React.ComponentPropsWithoutRef<"button"> = { ...props }

  if (!mergedProps["aria-label"] && tooltip) {
    mergedProps["aria-label"] = tooltip
  }

  const button = (
    <button
      ref={ref}
      type="button"
      data-sidebar-collapsed={isCollapsed ? "true" : "false"}
      className={cn(
        "group/sidebar-button flex w-full items-center gap-3 rounded-2xl border-2 border-black bg-white px-3 py-2 text-left text-sm font-semibold text-black shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5",
        isCollapsed && "justify-center gap-0 px-0",
        className,
      )}
      {...mergedProps}
    >
      {children}
    </button>
  )

  if (isCollapsed && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return button
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#FFCA3A] text-black shadow-[3px_3px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuSub = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("ml-6 mt-2 space-y-1 border-l-2 border-dashed border-black/20 pl-4", className)} {...props} />
)
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("relative", className)} {...props} />
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-xl border-2 border-transparent px-2 py-1 text-sm font-medium text-black/70 transition hover:border-black hover:bg-[#F1F0FF]",
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

const SidebarRail = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => {
  const { isOpen, toggle, isMobile } = useSidebar()
  return (
    <div
      className={cn(
        "hidden lg:flex", // only visible on large screens
        className,
      )}
      {...props}
    >
      <button
        type="button"
        onClick={() => toggle()}
        className={cn(
          "absolute -right-4 top-24 hidden h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 lg:inline-flex",
          !isOpen && !isMobile && "rotate-180",
        )}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Collapse sidebar</span>
      </button>
    </div>
  )
}
SidebarRail.displayName = "SidebarRail"

export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
}
