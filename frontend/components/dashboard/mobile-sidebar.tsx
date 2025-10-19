// components/dashboard/mobile-sidebar.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Menu } from "lucide-react";
import { DashboardSidebar } from "./sidebar";
import { cn } from "@/lib/utils";

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
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Overlay */}
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Gradient overlay with blur */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/20 to-blue-900/30 backdrop-blur-sm"
              onClick={onClose}
            />
            
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [0, -5, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"
              />
            </div>
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div
            key="sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 left-0 z-[999] w-80 lg:hidden"
          >
            {/* Main sidebar container */}
            <div className="relative h-full bg-gradient-to-b from-white via-white to-gray-50/95 shadow-2xl border-r border-gray-200/50 backdrop-blur-xl">
              
              {/* Decorative gradient border */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
              
              {/* Header with enhanced design */}
              <motion.div 
                className="relative border-b border-gray-200/50 bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm"
                variants={contentVariants}
              >
                <div className="flex items-center justify-between p-6">
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 200, 
                        damping: 15,
                        delay: 0.1
                      }}
                      className="relative"
                    >
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                      />
                    </motion.div>
                    <div>
                      <motion.h1 
                        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        LearnHub
                      </motion.h1>
                      <motion.p 
                        className="text-xs text-gray-500 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Mobile Menu
                      </motion.p>
                    </div>
                  </motion.div>

                  {/* Enhanced Close Button */}
                  <motion.button
                    onClick={onClose}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 90,
                      backgroundColor: "rgba(59, 130, 246, 0.1)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:text-blue-600 transition-all duration-200 group relative overflow-hidden"
                  >
                    <X className="h-5 w-5 relative z-10" />
                    
                    {/* Ripple effect background */}
                    <motion.div
                      initial={false}
                      whileHover={{ scale: 1.5 }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    />
                    
                    {/* Glow effect */}
                    <motion.div
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-blue-500/20 rounded-xl blur-sm"
                    />
                  </motion.button>
                </div>

                {/* Quick User Info */}
                <motion.div
                  variants={contentVariants}
                  className="px-6 pb-4"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/50">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                    >
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <motion.p 
                        className="text-sm font-semibold text-gray-900 truncate"
                        whileHover={{ x: 2 }}
                      >
                        {user?.name || 'User'}
                      </motion.p>
                      <motion.p 
                        className="text-xs text-gray-500 truncate"
                        whileHover={{ x: 2 }}
                      >
                        {user?.email || 'user@example.com'}
                      </motion.p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 180 }}
                      className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200"
                    >
                      <Sparkles className="h-3 w-3 text-blue-500" />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Sidebar Content */}
              <motion.div
                variants={contentVariants}
                className="h-[calc(100%-140px)] overflow-y-auto"
              >
                <DashboardSidebar user={user} />
              </motion.div>

              {/* Footer with decorative elements */}
              <motion.div
                variants={contentVariants}
                className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm"
              >
                <div className="text-center">
                  <motion.p 
                    className="text-xs text-gray-500"
                    whileHover={{ scale: 1.02 }}
                  >
                    Swipe or tap outside to close
                  </motion.p>
                  <motion.div
                    animate={{ width: ["0%", "100%", "0%"] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-2 rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Enhanced Mobile Menu Trigger Button
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
        "lg:hidden p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden group",
        className
      )}
    >
      {/* Animated background */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500"
      />
      
      {/* Main content */}
      <div className="relative z-10 flex items-center space-x-2">
        <Menu className="h-4 w-4" />
        <span className="text-sm font-semibold">Menu</span>
      </div>
      
      {/* Ripple effect */}
      <motion.div
        initial={false}
        whileHover={{ scale: 1.5 }}
        className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      />
    </motion.button>
  );
}