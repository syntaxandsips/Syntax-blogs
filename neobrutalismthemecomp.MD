











# **Neobrutalism Components - Complete Reference Guide**

## **Installation Overview**

All Neobrutalism components can be installed using the Shadcn CLI. The general format for installation is:

```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/[component-name].json
```

You can also use other package managers:

```bash
# npm
npx shadcn@latest add https://neobrutalism.dev/r/[component-name].json

# yarn
yarn dlx shadcn@latest add https://neobrutalism.dev/r/[component-name].json

# bun
bun dlx shadcn@latest add https://neobrutalism.dev/r/[component-name].json
```

---

## **Complete Component List**

### **A. Form & Input Components**

#### **1. Accordion**
**Description**: A vertically stacked set of interactive headings that each reveal a section of content.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/accordion.json
```
**Usage**:
```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
```

#### **2. Alert**
**Description**: Displays a callout for user attention.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/alert.json
```
**Usage**:
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
```

#### **3. Alert Dialog**
**Description**: A modal dialog that interrupts the user with important content and expects a response.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/alert-dialog.json
```
**Usage**:
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
```

#### **4. Avatar**
**Description**: An image element with a fallback for representing the user.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/avatar.json
```
**Usage**:
```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
```

#### **5. Badge**
**Description**: Displays a badge or a component that looks like a badge.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/badge.json
```
**Usage**:
```tsx
import { Badge } from '@/components/ui/badge'
```

#### **6. Button**
**Description**: Displays a button or a component that looks like a button.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/button.json
```
**Usage**:
```tsx
import { Button } from '@/components/ui/button'
```

#### **7. Calendar**
**Description**: A date field component that allows users to enter and edit date.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/calendar.json
```
**Usage**:
```tsx
import { Calendar } from '@/components/ui/calendar'
```

#### **8. Card**
**Description**: Displays a card with header, content, and footer.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/card.json
```
**Usage**:
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
```

#### **9. Carousel**
**Description**: A carousel with motion and swipe built using Embla.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/carousel.json
```
**Usage**:
```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
```

#### **10. Checkbox**
**Description**: A control that allows the user to toggle between checked and not checked.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/checkbox.json
```
**Usage**:
```tsx
import { Checkbox } from "@/components/ui/checkbox"
```

#### **11. Collapsible**
**Description**: An interactive component which expands/collapses content.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/collapsible.json
```
**Usage**:
```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
```

#### **12. Combobox**
**Description**: Autocomplete input and command palette with a list of suggestions.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/combobox.json
```
**Usage**:
```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
```

#### **13. Command**
**Description**: Fast, composable command palette.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/command.json
```
**Usage**:
```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
```

#### **14. Context Menu**
**Description**: Displays a menu to the user at their cursor position.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/context-menu.json
```
**Usage**:
```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
```

#### **15. Date Picker**
**Description**: A date picker component with range and presets.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/date-picker.json
```
**Usage**:
```tsx
import { Calendar } from "@/components/ui/calendar"
```

#### **16. Data Table**
**Description**: Powerful table and datagrids built using TanStack Table.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/data-table.json
```
**Usage**:
```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
```

#### **17. Dialog**
**Description**: A window overlaid on either the primary window or another dialog window.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/dialog.json
```
**Usage**:
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
```

#### **18. Drawer**
**Description**: A drawer that slides in from the edge of the screen.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/drawer.json
```
**Usage**:
```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
```

#### **19. Dropdown Menu**
**Description**: Displays a menu to the user when triggered.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/dropdown-menu.json
```
**Usage**:
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
```

#### **20. Form**
**Description**: A flexible form component that validates and submits forms.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/form.json
```
**Usage**:
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
```

#### **21. Hover Card**
**Description**: For sighted users to preview content available behind a link.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/hover-card.json
```
**Usage**:
```tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
```

#### **22. Image Card**
**Description**: A card component optimized for image display.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/image-card.json
```
**Usage**:
```tsx
import { ImageCard } from "@/components/ui/image-card"
```

#### **23. Input**
**Description**: Displays a form input field.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/input.json
```
**Usage**:
```tsx
import { Input } from "@/components/ui/input"
```

#### **24. Input Otp**
**Description**: A one-time password input component.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/input-otp.json
```
**Usage**:
```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
```

#### **25. Label**
**Description**: Renders an accessible label associated with controls.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/label.json
```
**Usage**:
```tsx
import { Label } from "@/components/ui/label"
```

#### **26. Marquee**
**Description**: A scrolling marquee component.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/marquee.json
```
**Usage**:
```tsx
import { Marquee } from "@/components/ui/marquee"
```

#### **27. Menubar**
**Description**: A persistent menu bar at the top of the screen.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/menubar.json
```
**Usage**:
```tsx
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
```

#### **28. Navigation Menu**
**Description**: A collection of links for navigating websites.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/navigation-menu.json
```
**Usage**:
```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
```

#### **29. Pagination**
**Description**: A set of numbered buttons used to navigate a multi-page dataset.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/pagination.json
```
**Usage**:
```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
```

#### **30. Popover**
**Description**: Displays floating content in relation to a target element.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/popover.json
```
**Usage**:
```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
```

#### **31. Progress**
**Description**: Displays an indicator showing the completion progress of a task.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/progress.json
```
**Usage**:
```tsx
import { Progress } from "@/components/ui/progress"
```

#### **32. Radio Group**
**Description**: A set of checkable buttons where only one button can be checked at a time.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/radio-group.json
```
**Usage**:
```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
```

#### **33. Resizable**
**Description**: A resizable panel group.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/resizable.json
```
**Usage**:
```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
```

#### **34. Scroll Area**
**Description**: A panel with scrollable content.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/scroll-area.json
```
**Usage**:
```tsx
import { ScrollArea } from "@/components/ui/scroll-area"
```

#### **35. Select**
**Description**: Displays a list of options for the user to pick from.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/select.json
```
**Usage**:
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
```

#### **36. Sheet**
**Description**: A sheet that slides in from the edge of the screen.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/sheet.json
```
**Usage**:
```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
```

#### **37. Sidebar**
**Description**: A collapsible sidebar for navigation.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/sidebar.json
```
**Usage**:
```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
```

#### **38. Skeleton**
**Description**: A placeholder for content that is still loading.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/skeleton.json
```
**Usage**:
```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

#### **39. Slider**
**Description**: An input where the user selects a value from within a given range.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/slider.json
```
**Usage**:
```tsx
import { Slider } from "@/components/ui/slider"
```

#### **40. Sonner**
**Description**: A toast component for notifications.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/sonner.json
```
**Usage**:
```tsx
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
```

#### **41. Switch**
**Description**: A control that allows the user to toggle between checked and not checked.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/switch.json
```
**Usage**:
```tsx
import { Switch } from "@/components/ui/switch"
```

#### **42. Table**
**Description**: A responsive table component.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/table.json
```
**Usage**:
```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
```

#### **43. Tabs**
**Description**: A set of layered sections of content.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/tabs.json
```
**Usage**:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
```

#### **44. Textarea**
**Description**: Displays a form textarea.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/textarea.json
```
**Usage**:
```tsx
import { Textarea } from "@/components/ui/textarea"
```

#### **45. Tooltip**
**Description**: A popup that displays information related to an element.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/tooltip.json
```
**Usage**:
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
```

---

### **B. Special Components**

#### **46. Chart**
**Description**: Beautiful charts built using Recharts.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/chart.json
```
**Usage**:
```tsx
import { Chart } from "@/components/ui/chart"
```

#### **47. Breadcrumb**
**Description**: A breadcrumb navigation component.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/breadcrumb.json
```
**Usage**:
```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
```

---

### **C. Stars Component**

#### **48. Stars**
**Description**: 40 geometrical shapes (as React components) often used in neobrutalism layouts.
**Installation**:
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/stars.json
```
**Usage**:
```tsx
import { Star } from "@/components/ui/stars"
```
**Props**:
- `color`: Star color (string)
- `size`: Width and height of star in pixels (number)
- `stroke`: Path stroke color (string)
- `strokeWidth`: Stroke width (number)
- `pathClassName`: Path classname (string)

---

## **Installation Scripts**

### **Install All Components at Once**
```bash
# Create a script to install all components
#!/bin/bash

components=(
  "accordion"
  "alert"
  "alert-dialog"
  "avatar"
  "badge"
  "breadcrumb"
  "button"
  "calendar"
  "card"
  "carousel"
  "chart"
  "checkbox"
  "collapsible"
  "combobox"
  "command"
  "context-menu"
  "data-table"
  "date-picker"
  "dialog"
  "drawer"
  "dropdown-menu"
  "form"
  "hover-card"
  "image-card"
  "input"
  "input-otp"
  "label"
  "marquee"
  "menubar"
  "navigation-menu"
  "pagination"
  "popover"
  "progress"
  "radio-group"
  "resizable"
  "scroll-area"
  "select"
  "sheet"
  "sidebar"
  "skeleton"
  "slider"
  "sonner"
  "switch"
  "table"
  "tabs"
  "textarea"
  "tooltip"
  "stars"
)

for component in "${components[@]}"; do
  echo "Installing $component..."
  pnpm dlx shadcn@latest add "https://neobrutalism.dev/r/$component.json"
done
```

### **Install Individual Components by Category**

#### **Form Components**
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/form.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/input.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/label.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/textarea.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/select.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/checkbox.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/radio-group.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/switch.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/slider.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/input-otp.json
```

#### **Navigation Components**
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/navigation-menu.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/breadcrumb.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/tabs.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/pagination.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/menubar.json
```

#### **Layout Components**
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/accordion.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/collapsible.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/resizable.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/scroll-area.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/skeleton.json
```

#### **Feedback Components**
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/dialog.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/alert-dialog.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/sonner.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/tooltip.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/popover.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/hover-card.json
```

#### **Data Display Components**
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/avatar.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/badge.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/calendar.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/date-picker.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/data-table.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/table.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/progress.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/carousel.json
```

#### **Advanced Components**
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/command.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/context-menu.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/dropdown-menu.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/drawer.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/sheet.json
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/sidebar.json
```

---

## **Usage Examples**

### **Basic Component Usage**
```tsx
// Import components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Use in your component
export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Neobrutalism Form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="Enter your email" />
        </div>
        <Button>Submit</Button>
      </CardContent>
    </Card>
  )
}
```

### **Chart Usage**
```tsx
import { Chart } from '@/components/ui/chart'

export default function MyChart() {
  return (
    <Chart
      type="bar"
      data={{
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Sales',
          data: [12, 19, 3, 5, 2, 3],
        }]
      }}
    />
  )
}
```

### **Stars Usage**
```tsx
import { Star } from '@/components/ui/stars'

export default function MyStars() {
  return (
    <div>
      <Star color="#fbbf24" size={24} stroke="#000" strokeWidth={2} />
      <Star color="#34d399" size={32} />
      <Star color="#60a5fa" size={16} stroke="#000" />
    </div>
  )
}
```

---

## **Package Manager Commands**

### **PNPM (Recommended)**
```bash
pnpm dlx shadcn@latest add https://neobrutalism.dev/r/[component].json
```

### **NPM**
```bash
npx shadcn@latest add https://neobrutalism.dev/r/[component].json
```

### **Yarn**
```bash
yarn dlx shadcn@latest add https://neobrutalism.dev/r/[component].json
```

### **Bun**
```bash
bun dlx shadcn@latest add https://neobrutalism.dev/r/[component].json
```

---

## **Component Categories Summary**

| Category | Components Count | Examples |
|----------|-----------------|----------|
| Form Components | 10 | Input, Label, Textarea, Select, Checkbox |
| Navigation Components | 5 | Navigation Menu, Breadcrumb, Tabs, Pagination |
| Layout Components | 6 | Accordion, Card, Collapsible, Resizable |
| Feedback Components | 6 | Dialog, Alert, Toast, Tooltip, Popover |
| Data Display Components | 8 | Avatar, Badge, Calendar, Table, Progress |
| Advanced Components | 8 | Command, Context Menu, Dropdown, Drawer |
| Special Components | 3 | Chart, Stars, Marquee |
| **Total Components** | **46** | |

---

## **Notes**

1. **Component Dependencies**: Some components depend on others. Make sure to install dependencies first.
2. **Styling**: All components use CSS variables for theming. Visit the styling page for customization options.
3. **TypeScript**: Full TypeScript support is included with all components.
4. **Accessibility**: All components follow WAI-ARIA guidelines for accessibility.
5. **Customization**: Components can be customized using Tailwind CSS classes and CSS variables.

This comprehensive reference guide includes all 46 components available in the Neobrutalism components library with their proper installation commands and usage examples.