import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/lib/auth";

type SidebarProps = {
  isMobileOpen: boolean;
  onCloseSidebar: () => void;
};

export default function Sidebar({ isMobileOpen, onCloseSidebar }: SidebarProps) {
  const [location] = useLocation();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const sidebarLinks = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
      path: "/dashboard",
    },
    {
      title: "Campaigns",
      icon: <Megaphone className="w-5 h-5 mr-3" />,
      path: "/campaigns",
    },
    {
      title: "Contacts",
      icon: <Users className="w-5 h-5 mr-3" />,
      path: "/contacts",
    },
    {
      title: "Leaderboard",
      icon: <Trophy className="w-5 h-5 mr-3" />,
      path: "/leaderboard",
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 transition-transform duration-300 ease-in-out transform md:translate-x-0 md:relative md:flex md:flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 bg-slate-900">
        <div className="flex items-center">
          <span className="text-white font-semibold text-xl">SocialCRM</span>
        </div>
        <button
          onClick={onCloseSidebar}
          className="text-white md:hidden"
          aria-label="Close sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="px-4 py-6 space-y-2 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">
          Main
        </div>

        {sidebarLinks.map((link) => (
          <Link key={link.path} href={link.path}>
            <a
              className={cn(
                "flex items-center px-3 py-2 text-slate-300 rounded-md transition-colors",
                isActive(link.path)
                  ? "bg-slate-700"
                  : "hover:bg-slate-700"
              )}
            >
              {link.icon}
              <span>{link.title}</span>
            </a>
          </Link>
        ))}

        <div className="px-3 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase">
          Settings
        </div>

        <Link href="/settings">
          <a className="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            <span>Settings</span>
          </a>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
