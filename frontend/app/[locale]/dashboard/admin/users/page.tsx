"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { adminService } from "@/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Shield, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const cardHoverVariants = {
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

export default function AdminUsers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminService.getUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "student" | "instructor" | "admin";
    }) => adminService.updateUserRole(userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(`User role updated to ${variables.role}`);
    },
    onError: (error) => {
      toast.error("Failed to update user role");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete user");
    },
  });

  // Filter and search users
  const filteredUsers = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter (you might need to add status field to user model)
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => {
        // This is a placeholder - you might have different status fields
        return statusFilter === "active" ? user.isActive !== false : user.isActive === false;
      });
    }

    return filtered;
  }, [data, searchQuery, roleFilter, statusFilter]);

  // User statistics
  const userStats = useMemo(() => {
    if (!data?.data) return { total: 0, students: 0, instructors: 0, admins: 0 };

    const users = data.data;
    return {
      total: users.length,
      students: users.filter(u => u.role === "student").length,
      instructors: users.filter(u => u.role === "instructor").length,
      admins: users.filter(u => u.role === "admin").length,
    };
  }, [data]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "instructor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "student":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRoleUpdate = (userId: string, newRole: "student" | "instructor" | "admin") => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;

  const users = filteredUsers;

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage platform users and permissions, {user?.name}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
              <Download className="w-4 h-4" />
              Export Users
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Users"
            value={userStats.total}
            icon={<Users className="w-6 h-6" />}
            color="purple"
            delay={0}
          />
          <StatCard
            title="Students"
            value={userStats.students}
            icon={<UserCheck className="w-6 h-6" />}
            color="blue"
            delay={0.1}
          />
          <StatCard
            title="Instructors"
            value={userStats.instructors}
            icon={<Shield className="w-6 h-6" />}
            color="green"
            delay={0.2}
          />
          <StatCard
            title="Admins"
            value={userStats.admins}
            icon={<Shield className="w-6 h-6" />}
            color="red"
            delay={0.3}
          />
        </div>

        {/* Filters */}
        <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm"
                />
              </div>
              
              <div className="flex gap-2 w-full lg:w-auto">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full lg:w-40 bg-white/50 backdrop-blur-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="instructor">Instructors</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-40 bg-white/50 backdrop-blur-sm">
                    <UserCheck className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Grid */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          {users.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery || roleFilter !== "all" ? "No users found" : "No users available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || roleFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "There are no users in the system yet"
                }
              </p>
              {(searchQuery || roleFilter !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {users.map((userItem, index) => (
                <motion.div
                  key={userItem._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <UserCard 
                    user={userItem} 
                    onRoleUpdate={handleRoleUpdate}
                    onDelete={handleDeleteUser}
                    currentUserId={user?._id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// User Card Component
function UserCard({ user, onRoleUpdate, onDelete, currentUserId }: { 
  user: any; 
  onRoleUpdate: (userId: string, role: "student" | "instructor" | "admin") => void;
  onDelete: (userId: string, userName: string) => void;
  currentUserId?: string;
}) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "instructor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "student":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isCurrentUser = user._id === currentUserId;

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      className="group h-full"
    >
      <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        <CardContent className="p-6 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2" asChild>

                  <Link href={`/dashboard/admin/users/${user._id}`}>

                  <Eye className="w-4 h-4" />
                  View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Email
                </DropdownMenuItem>
                {!isCurrentUser && (
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-red-600"
                    onClick={() => onDelete(user._id, user.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Role</span>
              <Badge variant="secondary" className={getRoleColor(user.role)}>
                {user.role}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Joined</span>
              <span className="text-gray-900 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Additional stats can go here */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            {!isCurrentUser && (
              <>
                {user.role !== "instructor" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRoleUpdate(user._id, "instructor")}
                    className="gap-2"
                    disabled={user.role === "instructor"}
                  >
                    <UserCheck className="w-4 h-4" />
                    Make Instructor
                  </Button>
                )}
                
                {user.role !== "admin" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRoleUpdate(user._id, "admin")}
                    className="gap-2"
                    disabled={user.role === "admin"}
                  >
                    <Shield className="w-4 h-4" />
                    Make Admin
                  </Button>
                )}

                {user.role !== "student" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRoleUpdate(user._id, "student")}
                    className="gap-2"
                    disabled={user.role === "student"}
                  >
                    <UserX className="w-4 h-4" />
                    Make Student
                  </Button>
                )}
              </>
            )}
            
            {isCurrentUser && (
              <div className="text-center py-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Current User
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, delay = 0 }) {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg overflow-hidden group cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <motion.p 
                className={`text-2xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: delay + 0.2 }}
              >
                {value}
              </motion.p>
            </div>
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="max-w-md w-full backdrop-blur-sm bg-white/70 border-0 shadow-lg text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load users</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton Loading
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded w-64"></div>
            <div className="h-4 bg-gray-300 rounded w-96"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-300 rounded w-32"></div>
            <div className="h-10 bg-gray-300 rounded w-32"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/70 rounded-xl p-6 border-0 shadow-lg">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white/70 rounded-xl p-4 border-0 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="h-10 bg-gray-300 rounded flex-1"></div>
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="h-10 bg-gray-300 rounded w-40"></div>
              <div className="h-10 bg-gray-300 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/70 rounded-xl p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300 rounded w-16"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <div className="h-9 bg-gray-300 rounded"></div>
              <div className="h-9 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}