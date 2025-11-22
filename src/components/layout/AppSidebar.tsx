import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Warehouse,
  Cpu,
  List,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Features", url: "/features", icon: List },
  { title: "AGV Routing", url: "/routing-simulator", icon: Cpu },
  { title: "Warehouse", url: "/warehouse", icon: Warehouse },
  { title: "Control Panel", url: "/control-panel", icon: Cpu },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className={cn(
        "overflow-hidden transition-[width] duration-300 ease-in-out backdrop-blur-sm",
        collapsed ? "w-14" : "w-60"
      )}
      collapsible="icon"
    >
      <SidebarContent className="py-4">
        <SidebarGroup>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="sidebar-label"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wide text-sidebar-foreground/70">
                  Navigation
                </SidebarGroupLabel>
              </motion.div>
            )}
          </AnimatePresence>

          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-1"
              >
                {items.map((item) => {
                  const ActiveIcon = item.icon;
                  const active = isActive(item.url);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className={cn(
                            "group/nav flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-200 ease-in-out",
                            "hover:-translate-x-0.5 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                            active &&
                              "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                          )}
                        >
                          <motion.span
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            whileTap={{ scale: 0.94, rotate: -2 }}
                            transition={{ type: "spring", stiffness: 320, damping: 18 }}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-sidebar-accent/30 text-sidebar-foreground/90"
                          >
                            <ActiveIcon className="h-4 w-4" />
                          </motion.span>

                          <AnimatePresence initial={false}>
                            {!collapsed && (
                              <motion.span
                                key="nav-label"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.18 }}
                                className="flex-1 truncate"
                              >
                                {item.title}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {active && !collapsed && (
                              <motion.span
                                key="active-indicator"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 6, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="h-6 w-[6px] rounded-full bg-primary/80"
                              />
                            )}
                          </AnimatePresence>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </motion.ul>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
