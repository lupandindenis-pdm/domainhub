import { 
  Globe, 
  LayoutDashboard, 
  Plus, 
  History, 
  Settings, 
  Users, 
  Bell,
  FileText,
  Shield
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Реестр доменов", url: "/domains", icon: Globe },
  { title: "Добавить домен", url: "/domains/new", icon: Plus },
];

const managementItems = [
  { title: "История изменений", url: "/history", icon: History },
  { title: "Алерты", url: "/alerts", icon: Bell },
  { title: "Отчёты", url: "/reports", icon: FileText },
];

const adminItems = [
  { title: "Пользователи", url: "/users", icon: Users },
  { title: "Роли и доступ", url: "/roles", icon: Shield },
  { title: "Настройки", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className={
            isActive(item.url)
              ? "bg-primary/10 text-primary font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }
        >
          <item.icon className="shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={collapsed ? "border-b border-sidebar-border px-2 py-4" : "border-b border-sidebar-border px-4 py-4"}>
        <div className={collapsed ? "flex w-full items-center justify-center gap-3" : "flex items-center gap-3"}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">DMS</span>
              <span className="text-xs text-sidebar-foreground/60">Domain Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={collapsed ? "px-1 py-4" : "px-2 py-4"}>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider text-sidebar-foreground/50">
            Главное
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider text-sidebar-foreground/50">
            Управление
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider text-sidebar-foreground/50">
            Администрирование
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={collapsed ? "border-t border-sidebar-border px-2 py-3" : "border-t border-sidebar-border px-4 py-3"}>
        <div className={collapsed ? "flex flex-col items-center justify-center gap-2" : "flex items-center justify-between gap-3"}>
          <div className={collapsed ? "flex items-center justify-center" : "flex items-center gap-3"}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              АИ
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm text-sidebar-foreground">Админ</span>
                <span className="text-xs text-sidebar-foreground/60">Администратор</span>
              </div>
            )}
          </div>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
