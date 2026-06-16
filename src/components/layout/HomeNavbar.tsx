"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, ChevronDown, LogOut,
  LayoutDashboard, User,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { JWTPayload } from "@/lib/auth";

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  MANAGER: "bg-blue-100 text-blue-700 border border-blue-200",
  EMPLOYEE: "bg-gray-100 text-gray-600 border border-gray-200",
};

interface Props {
  session: JWTPayload | null;
}

export default function HomeNavbar({ session }: Props) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nameParts = session?.name?.split(" ") || ["U"];
  const firstName = nameParts[0];
  const lastName = nameParts[1] || "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg leading-none">Smart SME</span>
            <p className="text-xs text-gray-400 leading-none">Management System</p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Inventory", href: "/inventory" },
            { label: "Sales", href: "/sales" },
            { label: "Customers", href: "/customers" },
            { label: "Finance", href: "/finance" },
            { label: "Analytics", href: "/analytics" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {session ? (
            /* ── LOGGED IN ── */
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2.5 hover:bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                  {getInitials(firstName, lastName)}
                </div>

                {/* Name + Role */}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {session.name}
                  </p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${ROLE_STYLES[session.role]}`}>
                    {session.role}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${showMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-12 z-20 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

                    {/* User Card */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {getInitials(firstName, lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {session.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.email}
                          </p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${ROLE_STYLES[session.role]}`}>
                            {session.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-gray-400" />
                        Dashboard
                      </Link>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={15} className="text-gray-400" />
                        My Profile
                      </button>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-2">
                          Modules
                        </p>
                        {[
                          { label: "Inventory", href: "/inventory" },
                          { label: "Sales", href: "/sales" },
                          { label: "Customers", href: "/customers" },
                          { label: "Finance", href: "/finance" },
                          { label: "Analytics", href: "/analytics" },
                        ].map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setShowMenu(false)}
                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            {link.label}
                            <ChevronDown size={12} className="-rotate-90 text-gray-300" />
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 mt-1 pt-1 pb-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ── NOT LOGGED IN ── */
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-5 py-2 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Get Started →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}