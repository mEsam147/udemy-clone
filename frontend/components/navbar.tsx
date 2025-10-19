"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BookOpen, User, Settings, LogOut, Menu, X, GraduationCap, BarChart3, Home, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { removeTokenCookie } from "@/lib/cookies";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, loading, user, setIsAuthenticated } = useAuth();
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    const res = await logout();
    removeTokenCookie();
    if (res.success) {
      setIsAuthenticated(false);
      router.push("/auth/signin");
    }
  };

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!user?.role) return "/dashboard";
    switch (user.role.toLowerCase()) {
      case "student":
        return "/dashboard/student";
      case "instructor":
        return "/dashboard/instructor";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/dashboard";
    }
  };

  // Navigation items with icons
  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/courses", label: t("courses"), icon: BookOpen },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl shadow-lg border-border/40"
          : "bg-background/80 backdrop-blur-lg border-border/20"
      } supports-[backdrop-filter]:bg-background/60`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with simplified animation */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-brand-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Mini Udemy
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive(item.href)
                      ? "text-brand-primary bg-brand-primary/10 font-semibold"
                      : "text-foreground/80 hover:text-brand-primary hover:bg-brand-primary/5"
                  }`}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {item.label}
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-brand-primary rounded-full transform -translate-x-1/2" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <div className="transition-transform hover:scale-105">
              <LanguageSwitcher />
            </div>

            <div className="transition-transform hover:scale-105">
              <ThemeToggle />
            </div>

            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="transition-transform hover:scale-105">
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full overflow-hidden"
                    >
                      <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-brand-primary/30 transition-all duration-200">
                        <AvatarImage
                          src={user.avatar || ""}
                          alt={user.name || "user"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border-border/50 backdrop-blur-xl bg-background/95"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || ""} alt={user.name || "user"} />
                      <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/learn">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        <span>My Learning</span>
                      </Link>
                    </Button>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/instructors">
                        <User className="mr-2 h-4 w-4" />
                        <span>Instructor</span>
                      </Link>
                    </Button>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href={getDashboardLink()}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </Button>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </Button>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleSignOut}>
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" asChild className="transition-transform hover:scale-105">
                  <Link href="/auth/signin">{t("signin")}</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 transition-transform hover:scale-105"
                  asChild
                >
                  <Link href="/auth/signup">{t("signup")}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden transition-transform hover:scale-110">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/30 overflow-hidden"
            >
              <div className="py-4 space-y-4">
                <SearchBar />
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? "text-brand-primary bg-brand-primary/10 border-l-4 border-brand-primary font-semibold"
                          : "text-foreground/80 hover:text-brand-primary hover:bg-brand-primary/5 border-l-4 border-transparent"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  );
                })}

                {isAuthenticated && user ? (
                  <>
                    {[
                      { href: "/learn", label: "My Learning", icon: GraduationCap },
                      { href: "/instructor", label: "Instructor", icon: User },
                      { href: getDashboardLink(), label: "Dashboard", icon: BarChart3 }, // Updated dashboard link
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/80 hover:text-brand-primary hover:bg-brand-primary/5 transition-all duration-200 border-l-4 border-transparent"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button variant="ghost" asChild>
                      <Link
                        href="/auth/signin"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("signin")}
                      </Link>
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90"
                      asChild
                    >
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("signup")}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
