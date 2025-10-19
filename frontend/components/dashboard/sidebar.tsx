"use client";

import {
  BookOpen,
  BarChart3,
  Settings,
  User,
  GraduationCap,
  Users,
  Shield,
  TrendingUp,
  Award,
  Heart,
  Video,
  Plus,
  Home,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Rocket,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User as UserType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardSidebarProps {
  user: UserType;
}

// Animation variants
const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.1,
      ease: "easeInOut",
    },
  },
};

const hoverVariants = {
  hover: {
    scale: 1.02,
    x: 4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

const studentNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard/student",
    icon: BarChart3,
    color: "blue",
    description: "Overview of your learning journey",
  },
  {
    name: "My Learning",
    href: "/dashboard/student/my_learning",
    icon: BookOpen,
    color: "emerald",
    description: "Continue your courses",
  },
  {
    name: "My Courses",
    href: "/dashboard/student/progress",
    icon: GraduationCap,
    color: "purple",
    description: "Track your progress",
  },
  {
    name: "Wishlist",
    href: "/dashboard/student/wishlist",
    icon: Heart,
    color: "pink",
    description: "Saved for later",
  },
  {
    name: "Certificates",
    href: "/dashboard/student/certificates",
    icon: Award,
    color: "amber",
    description: "Your achievements",
  },
];

const instructorNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard/instructor",
    icon: BarChart3,
    color: "blue",
    description: "Teaching overview",
  },
  {
    name: "Performance",
    href: "/dashboard/instructor/analytics",
    icon: TrendingUp,
    color: "green",
    description: "Analytics & insights",
  },
  {
    name: "My Courses",
    href: "/dashboard/instructor/courses",
    icon: Video,
    color: "purple",
    description: "Manage your courses",
  },
  {
    name: "Create Course",
    href: "/dashboard/instructor/create-course",
    icon: Plus,
    color: "red",
    description: "Build new content",
    highlight: true,
  },
  {
    name: "Students",
    href: "/dashboard/instructor/students",
    icon: Users,
    color: "indigo",
    description: "Student management",
  },
];

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard/admin",
    icon: BarChart3,
    color: "blue",
    description: "Platform overview",
  },
  {
    name: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
    color: "green",
    description: "User management",
  },
  {
    name: "Courses",
    href: "/dashboard/admin/courses",
    icon: BookOpen,
    color: "purple",
    description: "Course catalog",
  },
  {
    name: "Instructors",
    href: "/dashboard/admin/instructors",
    icon: Shield,
    color: "amber",
    description: "Instructor management",
  },
];

// Updated color classes using shadcn/ui CSS variables
const getColorClasses = (color: string, isActive: boolean) => {
  const colorMap: { [key: string]: { active: string; inactive: string } } = {
    blue: {
      active: "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
      inactive: "group-hover:from-blue-500 group-hover:to-blue-600 dark:group-hover:from-blue-600 dark:group-hover:to-blue-700"
    },
    emerald: {
      active: "from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700",
      inactive: "group-hover:from-emerald-500 group-hover:to-emerald-600 dark:group-hover:from-emerald-600 dark:group-hover:to-emerald-700"
    },
    purple: {
      active: "from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
      inactive: "group-hover:from-purple-500 group-hover:to-purple-600 dark:group-hover:from-purple-600 dark:group-hover:to-purple-700"
    },
    pink: {
      active: "from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700",
      inactive: "group-hover:from-pink-500 group-hover:to-pink-600 dark:group-hover:from-pink-600 dark:group-hover:to-pink-700"
    },
    amber: {
      active: "from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
      inactive: "group-hover:from-amber-500 group-hover:to-amber-600 dark:group-hover:from-amber-600 dark:group-hover:to-amber-700"
    },
    green: {
      active: "from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
      inactive: "group-hover:from-green-500 group-hover:to-green-600 dark:group-hover:from-green-600 dark:group-hover:to-green-700"
    },
    red: {
      active: "from-red-500 to-red-600 dark:from-red-600 dark:to-red-700",
      inactive: "group-hover:from-red-500 group-hover:to-red-600 dark:group-hover:from-red-600 dark:group-hover:to-red-700"
    },
    indigo: {
      active: "from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700",
      inactive: "group-hover:from-indigo-500 group-hover:to-indigo-600 dark:group-hover:from-indigo-600 dark:group-hover:to-indigo-700"
    },
  };
  
  const colorConfig = colorMap[color] || colorMap.blue;
  return isActive ? colorConfig.active : colorConfig.inactive;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getNavigation = () => {
    switch (user.role) {
      case "instructor":
        return instructorNavigation;
      case "admin":
        return adminNavigation;
      default:
        return studentNavigation;
    }
  };

  const navigation = getNavigation();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="flex grow flex-col gap-y-5 overflow-y-auto custom-scrollbar-thin border-r bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 px-6 pb-8"
    >
      {/* Logo Section */}
      <motion.div
        className="flex h-20 shrink-0 items-center border-b"
        whileHover={{ scale: 1.02 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="flex items-center space-x-3"
        >
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Rocket className="h-6 w-6 text-primary-foreground" />
            </div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background"
            />
          </div>
          <div>
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              LearnHub
            </motion.h1>
            <motion.p
              className="text-xs text-muted-foreground font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} Portal
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col">
        <motion.ul
          role="list"
          className="flex flex-1 flex-col gap-y-6"
          variants={sidebarVariants}
        >
          <motion.li variants={itemVariants}>
            <motion.div
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Navigation
            </motion.div>
            <ul role="list" className="space-y-2">
              <AnimatePresence>
                {navigation.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <motion.li
                      key={item.name}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileTap="tap"
                      custom={index}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.button
                        variants={hoverVariants}
                        onClick={() => router.push(item.href)}
                        className={cn(
                          "group relative flex items-center justify-between w-full p-3 rounded-xl text-sm font-semibold transition-all duration-200",
                          isActive
                            ? "bg-accent text-accent-foreground shadow-sm border"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div
                            variants={iconVariants}
                            className={cn(
                              "relative p-2 rounded-lg transition-all duration-200",
                              isActive
                                ? `bg-gradient-to-r ${getColorClasses(
                                    item.color,
                                    true
                                  )} text-primary-foreground shadow-sm`
                                : "bg-muted text-muted-foreground group-hover:shadow-sm group-hover:bg-accent"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.highlight && (
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [1, 0.7, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"
                              />
                            )}
                          </motion.div>
                          <div className="text-left">
                            <div className="flex items-center space-x-2">
                              <span
                                className={cn(
                                  "font-semibold",
                                  isActive
                                    ? "text-accent-foreground"
                                    : "text-foreground group-hover:text-accent-foreground"
                                )}
                              >
                                {item.name}
                              </span>
                              {item.highlight && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground rounded-full"
                                >
                                  New
                                </motion.span>
                              )}
                            </div>
                            <motion.p
                              className={cn(
                                "text-xs mt-0.5 transition-all duration-200",
                                isActive
                                  ? "text-accent-foreground/80"
                                  : "text-muted-foreground group-hover:text-accent-foreground/80"
                              )}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                            >
                              {item.description}
                            </motion.p>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="flex items-center space-x-1"
                            >
                              <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <ChevronRight className="h-4 w-4 text-primary" />
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/80 rounded-r-full"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </motion.button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </motion.li>

          {/* Bottom Section */}
          <motion.li className="mt-auto space-y-2" variants={itemVariants}>
            <motion.div
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Account
            </motion.div>

            {/* Profile Button */}
            <motion.button
              variants={hoverVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => router.push("/dashboard/profile")}
              className={cn(
                "group relative flex items-center justify-between w-full p-3 rounded-xl text-sm font-semibold transition-all duration-200",
                pathname === "/dashboard/profile"
                  ? "bg-accent text-accent-foreground shadow-sm border"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-sm"
              )}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  variants={iconVariants}
                  className={cn(
                    "relative p-2 rounded-lg transition-all duration-200",
                    pathname === "/dashboard/profile"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground group-hover:shadow-sm group-hover:bg-accent"
                  )}
                >
                  <User className="h-4 w-4" />
                </motion.div>
                <div className="text-left">
                  <span
                    className={cn(
                      "font-semibold",
                      pathname === "/dashboard/profile"
                        ? "text-accent-foreground"
                        : "text-foreground group-hover:text-accent-foreground"
                    )}
                  >
                    Profile
                  </span>
                  <motion.p
                    className="text-xs text-muted-foreground mt-0.5 transition-all duration-200 group-hover:text-accent-foreground/80"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    Manage your account
                  </motion.p>
                </div>
              </div>

              <AnimatePresence>
                {pathname === "/dashboard/profile" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>

              {pathname === "/dashboard/profile" && (
                <motion.div
                  layoutId="activeIndicatorBottom"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/80 rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>

            {/* Settings Button */}
            <motion.button
              variants={hoverVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => router.push("/dashboard/settings")}
              className={cn(
                "group relative flex items-center justify-between w-full p-3 rounded-xl text-sm font-semibold transition-all duration-200",
                pathname === "/dashboard/settings"
                  ? "bg-accent text-accent-foreground shadow-sm border"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-sm"
              )}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  variants={iconVariants}
                  className={cn(
                    "relative p-2 rounded-lg transition-all duration-200",
                    pathname === "/dashboard/settings"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground group-hover:shadow-sm group-hover:bg-accent"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </motion.div>
                <div className="text-left">
                  <span
                    className={cn(
                      "font-semibold",
                      pathname === "/dashboard/settings"
                        ? "text-accent-foreground"
                        : "text-foreground group-hover:text-accent-foreground"
                    )}
                  >
                    Settings
                  </span>
                  <motion.p
                    className="text-xs text-muted-foreground mt-0.5 transition-all duration-200 group-hover:text-accent-foreground/80"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    Preferences & configuration
                  </motion.p>
                </div>
              </div>

              <AnimatePresence>
                {pathname === "/dashboard/settings" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>

              {pathname === "/dashboard/settings" && (
                <motion.div
                  layoutId="activeIndicatorBottom"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/80 rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          </motion.li>
        </motion.ul>
      </nav>

      {/* User Info Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="border-t pt-4"
      >
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-accent/30">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-sm"
          >
            {user.name?.[0]?.toUpperCase() || "U"}
          </motion.div>
          <div className="flex-1 min-w-0">
            <motion.p
              className="text-sm font-semibold text-foreground truncate"
              whileHover={{ x: 2 }}
            >
              {user.name}
            </motion.p>
            <motion.p
              className="text-xs text-muted-foreground truncate"
              whileHover={{ x: 2 }}
            >
              {user.email}
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="p-1 bg-background rounded-lg shadow-sm border"
          >
            <Sparkles className="h-3 w-3 text-primary" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}