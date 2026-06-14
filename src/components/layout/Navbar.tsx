"use client";

import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { LogOut, Bell, User } from "lucide-react";
import { useState } from "react";
import type { JWTPayload } from "@/lib/auth";

export default function Navbar({ user }: { user: JWTPayload }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* Left - Page will fill this via breadcrumbs later */}
      <div />

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.name ? getInitials(user.name.split(" ")[0], user.name.split(" ")[1] || "U") : "U"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-700 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-12 z-20 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User size={15} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}