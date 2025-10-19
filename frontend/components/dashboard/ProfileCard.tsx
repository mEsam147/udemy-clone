// import { Button, Badge, Avatar, AvatarFallback, AvatarImage, Separator } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserCheck, Shield, UserX, Mail, Calendar, CheckCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "instructor" | "student";
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

interface ProfileCardProps {
  user: User;
  getInitials: (name: string) => string;
  getRoleColor: (role: string) => string;
  handleRoleChange: (role: string) => void;
  updateRoleMutation: { isPending: boolean };
}

export function ProfileCard({
  user,
  getInitials,
  getRoleColor,
  handleRoleChange,
  updateRoleMutation,
}: ProfileCardProps) {
  return (
    <div className="backdrop-blur-sm bg-white/70 border-0 shadow-lg rounded-xl">
      <div className="p-6">
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
          <Badge className={`mb-4 ${getRoleColor(user.role)}`}>{user.role.toUpperCase()}</Badge>
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
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            {user.lastLogin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Login</span>
                <span className="font-medium">{new Date(user.lastLogin).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <Separator className="my-6" />
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">Quick Actions</h4>
          {user.role !== "instructor" && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleRoleChange("instructor")}
              disabled={updateRoleMutation.isPending}
              aria-label={`Change ${user.name}'s role to instructor`}
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
              disabled={updateRoleMutation.isPending}
              aria-label={`Change ${user.name}'s role to admin`}
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
              disabled={updateRoleMutation.isPending}
              aria-label={`Change ${user.name}'s role to student`}
            >
              <UserX className="w-4 h-4" />
              Make Student
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}