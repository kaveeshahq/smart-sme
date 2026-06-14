"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={20} />,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: <Package size={20} />,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    label: "Sales",
    href: "/sales",
    icon: <ShoppingCart size={20} />,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    label: "Customers",
    href: "/customers",
    icon: <Users size={20} />,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: <UserCircle size={20} />,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Finance",
    href: "/finance",
    icon: <DollarSign size={20} />,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 size={20} />,
    roles: ["ADMIN", "MANAGER"],
  },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-blue-950 text-white transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
          <Building2 size={18} />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight">Smart SME</p>
            <p className="text-blue-300 text-xs">Management System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {filtered.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-blue-800">
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              role === "ADMIN"
                ? "bg-yellow-500 text-yellow-900"
                : role === "MANAGER"
                ? "bg-green-500 text-green-900"
                : "bg-blue-500 text-blue-900"
            )}
          >
            {role}
          </span>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}