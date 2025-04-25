import React from "react";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

type HeaderProps = {
  onOpenSidebar: () => void;
};

export default function Header({ onOpenSidebar }: HeaderProps) {
  const [location] = useLocation();

  // Get title based on current path
  const getPageTitle = () => {
    const path = location.split("/")[1];
    if (!path) return "Home";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button 
            onClick={onOpenSidebar} 
            className="mr-4 text-slate-600 md:hidden"
            aria-label="Open menu"
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
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative text-slate-600">
            <span className="sr-only">Notifications</span>
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <div className="relative">
            <button className="flex items-center space-x-2 focus:outline-none">
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  AU
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm font-medium text-slate-700">
                Admin User
              </span>
              <svg
                className="hidden md:block h-4 w-4 text-slate-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
