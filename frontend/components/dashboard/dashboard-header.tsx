"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, HelpCircle, Bell, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import useSearch from "@/hooks/useSearch";
import useNotifications from "@/hooks/useNotifications";
import { logout as authLogout } from "@/services/auth.service";

export function DashboardHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useSearch();
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useNotifications();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Redirect to sign-in if no user
  if (!user) {
    router.push("/auth/signin");
    return null;
  }

  // Navigation links based on user role
  const navLinks =
    user.role === "instructor"
      ? [
          { href: "/instructor/courses", label: "My Courses" },
          { href: "/instructor/analytics", label: "Analytics" },
        ]
      : [
          { href: "/dashboard/courses", label: "My Learning" },
          { href: "/dashboard/wishlist", label: "Wishlist" },
        ];

  // Handle search input change
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(!!value);
  };

  // Handle search submit (on Enter)
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Handle clicking outside search or notification dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const logout = async () => {
    await authLogout();
    router.push("/auth/signin");
  };

  // Check if a link is active (exact or partial match)
  const isActiveLink = (href) => {
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-primary">
              EduPlatform
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActiveLink(link.href)
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex relative" ref={searchRef}>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleSearchSubmit}
                className="pl-8 md:w-[200px] lg:w-[300px]"
                aria-label="Search courses"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  ×
                </Button>
              )}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : searchError ? (
                    <div className="p-4 text-center text-red-600">
                      {searchError}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {searchResults.map((course) => (
                        <li key={course._id}>
                          <Link
                            href={`/courses/${course.slug}`}
                            className="flex items-center p-4 hover:bg-accent"
                            onClick={() => {
                              setSearchQuery("");
                              setShowSearchResults(false);
                            }}
                          >
                            <img
                              src={course.image}
                              alt={course.title}
                              className="w-12 h-12 object-cover rounded-md mr-4"
                            />
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-muted-foreground">
                                By {course.instructor?.name || "Unknown"}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <DropdownMenu
              open={showNotifications}
              onOpenChange={setShowNotifications}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                  ref={notificationRef}
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : notificationsError ? (
                  <div className="p-4 text-center text-red-600">
                    {notificationsError}
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification._id}
                      className={`flex flex-col items-start p-4 ${
                        !notification.read ? "bg-accent" : ""
                      }`}
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification?.createdAt).toLocaleString()}
                      </p>
                      {notification.course && (
                        <Link
                          href={`/courses/${notification.course.slug}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View Course
                        </Link>
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.avatar_url || ""}
                      alt={user.full_name || "User"}
                    />
                    <AvatarFallback>
                      {user.full_name
                        ? user.full_name
                            .split(" ")
                            .map((n:any) => n[0])
                            .join("")
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || "No email provided"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
