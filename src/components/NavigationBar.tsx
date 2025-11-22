import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Warehouse, BarChart3, Home, Package, Truck, Plus, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "WMS", url: "/wms", icon: Package },
  { title: "AGV Fleet", url: "/agv-fleet", icon: Truck },
  { title: "Job Creation", url: "/job-creation", icon: Plus },
  { title: "Warehouse", url: "/warehouse", icon: Warehouse },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const NavigationBar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex items-center gap-1 px-4">
      {navItems.map((item) => {
        const ActiveIcon = item.icon;
        const active = isActive(item.url);

        return (
          <NavLink
            key={item.title}
            to={item.url}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "text-gray-300 hover:text-white hover:bg-gray-800",
              active && "text-white bg-gray-800"
            )}
          >
            <ActiveIcon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
