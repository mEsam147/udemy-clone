// app/dashboard/admin/users/[id]/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { adminService } from "@/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  BookOpen, 
  Users, 
  DollarSign, 
  Star, 
  Edit, 
  Shield,
  UserCheck,
  UserX,
  BarChart3,
  FileText,
  Award,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UserProfileProps {
  params: {
    id: string;
  };
}

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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function UserProfile({ params }: UserProfileProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [deactivationReason, setDeactivationReason] = useState("");
  const [suspensionData, setSuspensionData] = useState({
    reason: "",
    duration: ""
  });

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["userProfile", params.id],
    queryFn: () => adminService.getUserProfile(params.id),
  });

  console.log("userData", userData);

  const { data: userStats } = useQuery({
    queryKey: ["userStats", params.id],
    queryFn: () => adminService.getUserStats(params.id),
    enabled: !!userData?.data,
  });


  const updateRoleMutation = useMutation({
    mutationFn: (role: string) => adminService.updateUserRole(params.id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", params.id] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User role updated successfully");
      setIsRoleDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ action, reason }: { action: 'deactivate' | 'activate'; reason?: string }) => 
      adminService.deactivateUser(params.id, action, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", params.id] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(`User ${variables.action}d successfully`);
      setIsDeactivateDialogOpen(false);
      setDeactivationReason("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user status");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (data: { reason: string; duration?: number }) => 
      adminService.suspendUser(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", params.id] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User suspended successfully");
      setIsSuspendDialogOpen(false);
      setSuspensionData({ reason: "", duration: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to suspend user");
    },
  });

  const user = userData?.data;
  const stats = userStats?.data || {};

  if (isLoading) return <ProfileSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!user) return <NotFoundState />;

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

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  };

  const confirmRoleChange = () => {
    updateRoleMutation.mutate(selectedRole);
  };

  const handleDeactivate = () => {
    deactivateMutation.mutate({ 
      action: 'deactivate', 
      reason: deactivationReason 
    });
  };

  const handleActivate = () => {
    deactivateMutation.mutate({ action: 'activate' });
  };

  const handleSuspend = () => {
    const duration = suspensionData.duration ? parseInt(suspensionData.duration) : undefined;
    suspendMutation.mutate({
      reason: suspensionData.reason,
      duration
    });
  };

  const getStatusBadge = () => {
    if (user.isSuspended) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="w-3 h-3 mr-1" />
          SUSPENDED
        </Badge>
      );
    }
    if (!user.isActive) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          INACTIVE
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        ACTIVE
      </Badge>
    );
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                User Profile
              </h1>
              <p className="text-muted-foreground">
                Manage and view user details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - User Info */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-3 flex items-center justify-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role.toUpperCase()}
                  </Badge>
                  {getStatusBadge()}
                </div>

                <div className="space-y-3 text-sm text-left mt-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">
                      {user.isActive ? 'Active' : 'Inactive'}
                      {user.isSuspended && ' (Suspended)'}
                    </span>
                  </div>

                  {user.lastLogin && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login</span>
                      <span className="font-medium">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm mb-3">Quick Actions</h4>
                
                {user.role !== "instructor" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleRoleChange("instructor")}
                    disabled={updateRoleMutation.isPending || !user.isActive}
                  >
                    <UserCheck className="w-4 h-4" />
                    Make Instructor
                  </Button>
                )}
                
                {user.role !== "admin" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleRoleChange("admin")}
                    disabled={updateRoleMutation.isPending || !user.isActive}
                  >
                    <Shield className="w-4 h-4" />
                    Make Admin
                  </Button>
                )}
                
                {user.role !== "student" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleRoleChange("student")}
                    disabled={updateRoleMutation.isPending || !user.isActive}
                  >
                    <UserX className="w-4 h-4" />
                    Make Student
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.role === "instructor" && (
                <>
                  <StatItem
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Courses Created"
                    value={stats.coursesCreated || 0}
                  />
                  <StatItem
                    icon={<Users className="w-4 h-4" />}
                    label="Total Students"
                    value={stats.totalStudents || 0}
                  />
                  <StatItem
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Total Revenue"
                    value={`$${stats.totalRevenue || 0}`}
                  />
                  <StatItem
                    icon={<Star className="w-4 h-4" />}
                    label="Average Rating"
                    value={stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
                  />
                </>
              )}
              
              {user.role === "student" && (
                <>
                  <StatItem
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Enrolled Courses"
                    value={stats.enrolledCourses || 0}
                  />
                  <StatItem
                    icon={<CheckCircle className="w-4 h-4" />}
                    label="Completed Courses"
                    value={stats.completedCourses || 0}
                  />
                  <StatItem
                    icon={<Clock className="w-4 h-4" />}
                    label="Learning Hours"
                    value={stats.learningHours || 0}
                  />
                </>
              )}

              {user.role === "admin" && (
                <div className="text-center py-4 text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Administrator account</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>
                    Detailed information about the user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Full Name" value={user.name} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Role" value={user.role} />
                  <InfoRow label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
                  <InfoRow label="Account Status" value={
                    <div className="flex items-center gap-2">
                      {getStatusBadge()}
                    </div>
                  } />
                  {user.bio && <InfoRow label="Bio" value={user.bio} />}
                </CardContent>
              </Card>

              {user.role === "instructor" && user.instructorApplication && (
                <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Instructor Application</CardTitle>
                    <CardDescription>
                      Instructor application details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <InfoRow 
                        label="Application Status" 
                        value={
                          <Badge className={getRoleColor(user.instructorApplication.status)}>
                            {user.instructorApplication.status.toUpperCase()}
                          </Badge>
                        } 
                      />
                      {user.instructorApplication.bio && (
                        <InfoRow label="Bio" value={user.instructorApplication.bio} />
                      )}
                      {user.instructorApplication.expertise && (
                        <InfoRow 
                          label="Expertise" 
                          value={
                            <div className="flex flex-wrap gap-1">
                              {user.instructorApplication.expertise.map((exp: string, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {exp}
                                </Badge>
                              ))}
                            </div>
                          } 
                        />
                      )}
                      {user.instructorApplication.submittedAt && (
                        <InfoRow 
                          label="Applied On" 
                          value={new Date(user.instructorApplication.submittedAt).toLocaleDateString()} 
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    User's recent actions and engagements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Activity tracking coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>
                    {user.role === "instructor" ? "Created Courses" : "Enrolled Courses"}
                  </CardTitle>
                  <CardDescription>
                    {user.role === "instructor" 
                      ? "Courses created by this instructor" 
                      : "Courses this student is enrolled in"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Course management coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage user account settings and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Role Management */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Role Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Change user role and permissions
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {["student", "instructor", "admin"].map((role) => (
                        <Button
                          key={role}
                          variant={user.role === role ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleRoleChange(role)}
                          disabled={user.role === role || updateRoleMutation.isPending || !user.isActive}
                        >
                          {role.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Status Management */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Status Management</h4>
                    
                    {/* Current Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Current Status</p>
                        <p className="text-sm text-muted-foreground">
                          {user.isActive ? 'Active' : 'Inactive'}
                          {user.isSuspended && ' • Suspended'}
                        </p>
                      </div>
                      {getStatusBadge()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {user.isActive ? (
                        <>
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => setIsSuspendDialogOpen(true)}
                            disabled={suspendMutation.isPending}
                          >
                            <Clock className="w-4 h-4" />
                            Suspend User
                          </Button>
                          
                          <Button
                            variant="destructive"
                            className="w-full justify-start gap-2"
                            onClick={() => setIsDeactivateDialogOpen(true)}
                            disabled={deactivateMutation.isPending}
                          >
                            <UserX className="w-4 h-4" />
                            Deactivate User
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700"
                          onClick={handleActivate}
                          disabled={deactivateMutation.isPending}
                        >
                          <UserCheck className="w-4 h-4" />
                          Activate User
                        </Button>
                      )}
                    </div>

                    {/* Deactivation/Suspension Info */}
                    {(user.deactivationReason || user.suspensionReason) && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Status Information
                        </p>
                        {user.deactivationReason && (
                          <>
                            <p className="text-sm text-yellow-700 mt-1">
                              <strong>Deactivation Reason:</strong> {user.deactivationReason}
                            </p>
                            {user.deactivatedAt && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Deactivated on {new Date(user.deactivatedAt).toLocaleDateString()}
                              </p>
                            )}
                          </>
                        )}
                        {user.suspensionReason && (
                          <>
                            <p className="text-sm text-yellow-700 mt-1">
                              <strong>Suspension Reason:</strong> {user.suspensionReason}
                            </p>
                            {user.suspendedAt && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Suspended on {new Date(user.suspendedAt).toLocaleDateString()}
                              </p>
                            )}
                            {user.suspensionEnd && (
                              <p className="text-xs text-yellow-600">
                                Suspension ends on {new Date(user.suspensionEnd).toLocaleDateString()}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change {user.name}'s role to {selectedRole}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={updateRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? "Updating..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivation Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {user.name}? They will not be able to access their account until reactivated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="deactivationReason" className="text-sm font-medium">
                Reason for deactivation (optional)
              </Label>
              <Textarea
                id="deactivationReason"
                placeholder="Enter the reason for deactivation..."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                className="w-full mt-1 resize-none"
                rows={3}
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Important
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                The user will be logged out immediately and won't be able to sign in until their account is reactivated.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeactivateDialogOpen(false)}
              disabled={deactivateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspension Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Temporarily suspend {user.name}'s account access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="suspensionReason" className="text-sm font-medium">
                Reason for suspension
              </Label>
              <Textarea
                id="suspensionReason"
                placeholder="Enter the reason for suspension..."
                value={suspensionData.reason}
                onChange={(e) => setSuspensionData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full mt-1 resize-none"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="suspensionDuration" className="text-sm font-medium">
                Duration (days) - leave empty for indefinite
              </Label>
              <input
                id="suspensionDuration"
                type="number"
                placeholder="e.g., 7, 30, 90"
                value={suspensionData.duration}
                onChange={(e) => setSuspensionData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Suspension Notice
              </p>
              <p className="text-sm text-orange-700 mt-1">
                The user will be unable to access their account during the suspension period.
                {suspensionData.duration && ` This suspension will last for ${suspensionData.duration} days.`}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSuspendDialogOpen(false)}
              disabled={suspendMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={suspendMutation.isPending || !suspensionData.reason.trim()}
            >
              {suspendMutation.isPending ? "Suspending..." : "Suspend User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Helper Components
function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2 border-b last:border-0">
      <span className="font-medium text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-right max-w-[70%]">{value}</span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white/70 rounded-xl p-6 border-0 shadow-lg">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              <div className="h-6 bg-gray-300 rounded w-20 mx-auto"></div>
            </div>
          </div>
          <div className="bg-white/70 rounded-xl p-6 border-0 shadow-lg space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 rounded-xl p-6 border-0 shadow-lg">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between py-3 border-b">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full backdrop-blur-sm bg-white/70 border-0 shadow-lg text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load profile</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={onRetry}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NotFoundState() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full backdrop-blur-sm bg-white/70 border-0 shadow-lg text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}