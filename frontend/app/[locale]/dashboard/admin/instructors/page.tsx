// app/dashboard/admin/instructors/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  getInstructorApplications,
  updateInstructorApplication,
  getInstructorStats,
  getAllInstructors,
} from "@/services/course.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  BookOpen,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Shield,
  Check,
  X,
  Clock,
  UserCheck,
  UserX,
  Download,
  Eye,
  MessageSquare,
  BarChart3,
  Award,
  GraduationCap,
  BookText,
  Target,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from "@/services/admin.service";

interface InstructorApplication {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  instructorApplication: {
    status: "pending" | "approved" | "rejected";
    bio: string;
    expertise: string[];
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
  };
  createdAt: string;
  courses?: any[];
  students?: number;
  revenue?: number;
  rating?: number;
}

interface InstructorStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

export default function AdminInstructors() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<InstructorApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Fetch all data
  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    error: applicationsError,
  } = useQuery({
    queryKey: ["instructorApplications"],
    queryFn: adminService.getApplications,
  });

  console.log("getInstructorApplications", applicationsData);

  const {
    data: instructorsData,
    isLoading: instructorsLoading,
    error: instructorsError,
  } = useQuery({
    queryKey: ["allInstructors"],
    queryFn: getAllInstructors,
    enabled: activeTab === "instructors",
  });

  if (instructorsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error Loading Instructors</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {instructorsError.message || "Failed to load instructors"}
          </p>
          <Button
            onClick={() =>
              queryClient.refetchQueries({ queryKey: ["allInstructors"] })
            }
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  console.log("getAllInstructors", instructorsData);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["instructorStats"],
    queryFn: getInstructorStats,
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: "approved" | "rejected";
      reason?: string;
    }) => updateInstructorApplication(userId, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["instructorApplications"] });
      queryClient.invalidateQueries({ queryKey: ["instructorStats"] });
      queryClient.invalidateQueries({ queryKey: ["allInstructors"] });

      toast({
        title: `Application ${
          variables.status === "approved" ? "Approved" : "Rejected"
        }`,
        description:
          variables.status === "approved"
            ? "Instructor application has been approved successfully."
            : "Instructor application has been rejected.",
        variant: variables.status === "approved" ? "default" : "destructive",
      });

      setIsDetailOpen(false);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description:
          error.message || "There was an error updating the application.",
        variant: "destructive",
      });
    },
  });

  const applications = applicationsData?.data || [];
  const instructors = instructorsData?.data || [];
  const stats: InstructorStats = statsData?.data || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
  };

  // Filter applications based on search
  const filteredApplications = applications.filter(
    (app: InstructorApplication) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.instructorApplication.bio
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredInstructors = instructors.filter(
    (instructor: any) =>
      instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApplications = filteredApplications.filter(
    (app: InstructorApplication) =>
      app.instructorApplication.status === "pending"
  );

  const approvedApplications = filteredApplications.filter(
    (app: InstructorApplication) =>
      app.instructorApplication.status === "approved"
  );

  const rejectedApplications = filteredApplications.filter(
    (app: InstructorApplication) =>
      app.instructorApplication.status === "rejected"
  );

  const handleApprove = (userId: string) => {
    updateApplicationMutation.mutate({ userId, status: "approved" });
  };

  const handleReject = (userId: string, reason?: string) => {
    updateApplicationMutation.mutate({ userId, status: "rejected", reason });
  };

  const openApplicationDetail = (application: InstructorApplication) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  const openRejectDialog = (application: InstructorApplication) => {
    setSelectedApplication(application);
    setIsRejectDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      approved: { label: "Approved", variant: "default" as const, icon: Check },
      rejected: { label: "Rejected", variant: "destructive" as const, icon: X },
    };

    const {
      label,
      variant,
      icon: Icon,
    } = variants[status as keyof typeof variants] || variants.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (applicationsLoading || instructorsLoading || statsLoading) {
    return <PageSkeleton />;
  }

  if (applicationsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error Loading Applications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {applicationsError.message ||
              "Failed to load instructor applications"}
          </p>
          <Button
            onClick={() =>
              queryClient.refetchQueries({
                queryKey: ["instructorApplications"],
              })
            }
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Instructor Management</h1>
            <p className="text-purple-100">
              Manage instructor applications and monitor instructor performance,{" "}
              {user?.name}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Applications"
          value={stats.total}
          change="+12%"
          icon={Shield}
          color="blue"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          change="+5%"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Approved Instructors"
          value={stats.approved}
          change="+8%"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents?.toLocaleString() || "0"}
          change="+15%"
          icon={Users}
          color="purple"
        />
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search instructors or applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-80"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="applications"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Applications
              <Badge variant="secondary" className="ml-2">
                {pendingApplications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="instructors"
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Active Instructors
              <Badge variant="secondary" className="ml-2">
                {instructors.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {/* Application Status Tabs */}
            <div className="border-b">
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="pending"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Pending
                    <Badge variant="secondary" className="ml-2">
                      {pendingApplications.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="approved"
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approved
                    <Badge variant="secondary" className="ml-2">
                      {approvedApplications.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="rejected"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Rejected
                    <Badge variant="secondary" className="ml-2">
                      {rejectedApplications.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Pending Applications */}
                <TabsContent value="pending" className="space-y-4 mt-6">
                  {pendingApplications.length > 0 ? (
                    <div className="grid gap-4">
                      {pendingApplications.map(
                        (app: InstructorApplication, index: number) => (
                          <ApplicationCard
                            key={app._id}
                            application={app}
                            index={index}
                            onView={() => openApplicationDetail(app)}
                            onApprove={() => handleApprove(app._id)}
                            onReject={() => openRejectDialog(app)}
                            isUpdating={updateApplicationMutation.isPending}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Shield}
                      title="No pending applications"
                      description="There are no pending instructor applications at the moment."
                    />
                  )}
                </TabsContent>

                {/* Approved Applications */}
                <TabsContent value="approved" className="space-y-4 mt-6">
                  {approvedApplications.length > 0 ? (
                    <div className="grid gap-4">
                      {approvedApplications.map(
                        (app: InstructorApplication, index: number) => (
                          <ApplicationCard
                            key={app._id}
                            application={app}
                            index={index}
                            onView={() => openApplicationDetail(app)}
                            showActions={false}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={UserCheck}
                      title="No approved applications"
                      description="No instructor applications have been approved yet."
                    />
                  )}
                </TabsContent>

                {/* Rejected Applications */}
                <TabsContent value="rejected" className="space-y-4 mt-6">
                  {rejectedApplications.length > 0 ? (
                    <div className="grid gap-4">
                      {rejectedApplications.map(
                        (app: InstructorApplication, index: number) => (
                          <ApplicationCard
                            key={app._id}
                            application={app}
                            index={index}
                            onView={() => openApplicationDetail(app)}
                            showActions={false}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={UserX}
                      title="No rejected applications"
                      description="No instructor applications have been rejected."
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Active Instructors Tab */}
          <TabsContent value="instructors" className="space-y-6">
            {filteredInstructors.length > 0 ? (
              <div className="grid gap-6">
                {filteredInstructors.map((instructor: any, index: number) => (
                  <InstructorCard
                    key={instructor._id}
                    instructor={instructor}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={GraduationCap}
                title="No instructors found"
                description={
                  searchQuery
                    ? "No instructors match your search criteria."
                    : "There are no active instructors yet."
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Application Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedApplication.avatar}
                      alt={selectedApplication.name}
                    />
                    <AvatarFallback>
                      {selectedApplication.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {selectedApplication.name}
                      </h3>
                      {getStatusBadge(
                        selectedApplication.instructorApplication.status
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.email}
                    </p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Application submitted on{" "}
                  {formatDate(
                    selectedApplication.instructorApplication.submittedAt
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.instructorApplication.bio}
                  </p>
                </div>

                {/* Expertise */}
                {selectedApplication.instructorApplication.expertise?.length >
                  0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Areas of Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.instructorApplication.expertise.map(
                        (exp: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {exp}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedApplication.instructorApplication.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Review Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.instructorApplication.notes}
                    </p>
                  </div>
                )}

                {/* Review Info */}
                {selectedApplication.instructorApplication.reviewedAt && (
                  <div>
                    <h4 className="font-semibold mb-2">Review Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Reviewed on{" "}
                      {formatDate(
                        selectedApplication.instructorApplication.reviewedAt
                      )}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2 sm:gap-0">
                {selectedApplication.instructorApplication.status ===
                  "pending" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsRejectDialogOpen(true)}
                      disabled={updateApplicationMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedApplication._id)}
                      disabled={updateApplicationMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Instructor Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will
              help the applicant understand your decision.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="rejectionReason">Reason for Rejection</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={updateApplicationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedApplication &&
                handleReject(selectedApplication._id, rejectionReason)
              }
              disabled={
                updateApplicationMutation.isPending || !rejectionReason.trim()
              }
            >
              <X className="h-4 w-4 mr-2" />
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, change, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {change}
            </p>
          </div>
          <div
            className={`p-3 rounded-full bg-gradient-to-r ${
              colorClasses[color as keyof typeof colorClasses]
            } text-white`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Application Card Component
function ApplicationCard({
  application,
  index,
  onView,
  onApprove,
  onReject,
  isUpdating,
  showActions = true,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={application.avatar} alt={application.name} />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {application.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg truncate">
                    {application.name}
                  </h4>
                  <Badge
                    variant={
                      application.instructorApplication.status === "pending"
                        ? "secondary"
                        : application.instructorApplication.status ===
                          "approved"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {application.instructorApplication.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{application.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Applied{" "}
                      {formatDate(
                        application.instructorApplication.submittedAt
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {application.instructorApplication.bio}
                </p>

                {application.instructorApplication.expertise?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {application.instructorApplication.expertise
                      .slice(0, 3)
                      .map((exp: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    {application.instructorApplication.expertise.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +
                        {application.instructorApplication.expertise.length - 3}{" "}
                        more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {showActions &&
                application.instructorApplication.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onView}
                      disabled={isUpdating}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onReject}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={onApprove} disabled={isUpdating}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </>
                )}

              {!showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onView}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Instructor Card Component
function InstructorCard({ instructor, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <Avatar className="h-14 w-14">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback className="bg-green-100 text-green-600">
                  {instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{instructor.name}</h4>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <Mail className="h-3 w-3" />
                  <span>{instructor.email}</span>
                </div>

                {/* Instructor Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Courses</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {instructor.courses?.length || 0}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span>Students</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {(instructor.students || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Revenue</span>
                    </div>
                    <div className="text-lg font-semibold">
                      ${(instructor.revenue || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <Star className="h-4 w-4" />
                      <span>Rating</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {instructor.rating ? instructor.rating.toFixed(1) : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Instructor Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
    </motion.div>
  );
}

// Format date function
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Skeleton Loader
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8">
        <div className="h-8 bg-purple-500 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-purple-500 rounded w-1/2"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
