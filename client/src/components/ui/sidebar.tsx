// Main sidebar component using modular sub-components
export {
  SidebarProvider,
  useSidebar,
} from "./sidebar/SidebarContext"

export {
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
} from "./sidebar/SidebarCore"

export {
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "./sidebar/SidebarLayout"

export {
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./sidebar/SidebarMenu"

export { SidebarInput } from "./sidebar/SidebarInput"