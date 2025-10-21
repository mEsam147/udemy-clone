"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { DashboardSidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const sidebarVariants = {
  hidden: {
    x: -320,
    opacity: 0,
    scale: 0.95
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  exit: {
    x: -320,
    opacity: 0,
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.2,
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export function MobileSidebar({ isOpen, onClose, user }: MobileSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with click outside functionality */}
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 lg:hidden"
            onClick={onClose}
          >
            {/* Simple overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            key="sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 left-0 z-[999] w-80 lg:hidden"
            ref={sidebarRef}
          >
            {/* Main sidebar container */}
            <div className="relative h-full bg-background shadow-2xl border-r border-border backdrop-blur-xl">

              {/* Decorative accent border */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60" />

              {/* Header with username only */}
              <motion.div
                className="relative border-b border-border bg-card/50 backdrop-blur-sm"
                variants={contentVariants}
              >
                <div className="flex items-center justify-between p-6">
                  {/* Username only */}
                  <motion.div
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-md"
                    >
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <motion.p
                        className="text-lg font-semibold text-foreground truncate"
                        whileHover={{ x: 2 }}
                      >
                        {user?.name || 'User'}
                      </motion.p>
                    </div>
                  </motion.div>

                  {/* Close Button */}
                  <motion.button
                    onClick={onClose}
                    whileHover={{
                      scale: 1.1,
                      rotate: 90,
                      backgroundColor: "hsl(var(--primary) / 0.1)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Sidebar Content */}
              <motion.div
                variants={contentVariants}
                className="h-[calc(100%-80px)] overflow-y-auto"
              >
                <DashboardSidebar user={user} />
              </motion.div>

              {/* Simple Footer */}
              <motion.div
                variants={contentVariants}
                className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background/80 backdrop-blur-sm"
              >
                <div className="text-center">
                  <motion.p
                    className="text-xs text-muted-foreground"
                    whileHover={{ scale: 1.02 }}
                  >
                    Tap outside to close
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile Menu Trigger Button
interface MobileMenuTriggerProps {
  onClick: () => void;
  className?: string;
}

export function MobileMenuTrigger({ onClick, className }: MobileMenuTriggerProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "lg:hidden p-2 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        <Menu className="h-4 w-4" />
        <span className="text-sm font-semibold">Menu</span>
      </div>
    </motion.button>
  );
}
